"""
Index textbook content into Qdrant vector database.

This script:
1. Scans textbook directories for markdown files
2. Chunks content intelligently (respecting headers)
3. Generates embeddings using OpenRouter
4. Uploads to Qdrant Cloud with metadata
"""

import asyncio
import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import hashlib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings
from app.utils.logging import setup_logging, get_logger
from app.api.dependencies import get_openai_client, get_qdrant_client
from qdrant_client.models import PointStruct, Distance, VectorParams

setup_logging("INFO")
logger = get_logger("index_textbook")
settings = get_settings()


class MarkdownChunker:
    """Intelligently chunk markdown content respecting structure."""

    def __init__(self, chunk_size: int = 800, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def estimate_tokens(self, text: str) -> int:
        """Rough token estimation (1 token ~= 4 chars for English)."""
        return len(text) // 4

    def split_by_headers(self, content: str) -> List[Tuple[str, str]]:
        """
        Split markdown by headers (H2, H3).
        Returns list of (header, content) tuples.
        """
        sections = []
        current_header = ""
        current_content = []

        lines = content.split('\n')
        for line in lines:
            # Check for headers (## or ###)
            if line.startswith('## ') or line.startswith('### '):
                # Save previous section
                if current_content:
                    sections.append((current_header, '\n'.join(current_content)))
                    current_content = []

                # Start new section
                current_header = line.strip('#').strip()
            else:
                current_content.append(line)

        # Add final section
        if current_content:
            sections.append((current_header, '\n'.join(current_content)))

        return sections

    def chunk_text(self, text: str, max_tokens: int) -> List[str]:
        """
        Chunk text into smaller pieces, trying to respect sentence boundaries.
        """
        chunks = []
        sentences = re.split(r'(?<=[.!?])\s+', text)

        current_chunk = []
        current_tokens = 0

        for sentence in sentences:
            sentence_tokens = self.estimate_tokens(sentence)

            if current_tokens + sentence_tokens > max_tokens and current_chunk:
                # Save current chunk
                chunks.append(' '.join(current_chunk))

                # Start new chunk with overlap
                if self.overlap > 0:
                    # Keep last few sentences for overlap
                    overlap_text = ' '.join(current_chunk[-2:])
                    current_chunk = [overlap_text, sentence]
                    current_tokens = self.estimate_tokens(overlap_text) + sentence_tokens
                else:
                    current_chunk = [sentence]
                    current_tokens = sentence_tokens
            else:
                current_chunk.append(sentence)
                current_tokens += sentence_tokens

        # Add final chunk
        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks

    def chunk_markdown(self, content: str, section_title: str = "") -> List[Dict[str, str]]:
        """
        Chunk markdown content intelligently.
        Returns list of dicts with 'content' and 'section_title'.
        """
        chunks = []

        # Split by headers first
        sections = self.split_by_headers(content)

        for header, section_content in sections:
            section_content = section_content.strip()
            if not section_content:
                continue

            # Use header as section title if available
            current_section = header or section_title

            # Check if section needs chunking
            tokens = self.estimate_tokens(section_content)

            if tokens <= self.chunk_size:
                # Small enough, keep as one chunk
                chunks.append({
                    'content': section_content,
                    'section_title': current_section
                })
            else:
                # Need to split further
                sub_chunks = self.chunk_text(section_content, self.chunk_size)
                for i, chunk in enumerate(sub_chunks):
                    chunk_title = current_section
                    if len(sub_chunks) > 1:
                        chunk_title = f"{current_section} (Part {i+1})"

                    chunks.append({
                        'content': chunk,
                        'section_title': chunk_title
                    })

        return chunks


class TextbookIndexer:
    """Index textbook content into Qdrant."""

    def __init__(self):
        self.chunker = MarkdownChunker(
            chunk_size=settings.chunk_size,
            overlap=settings.chunk_overlap
        )
        self.openai_client = None
        self.qdrant_client = None

    async def initialize(self):
        """Initialize clients."""
        logger.info("Initializing clients...")
        self.openai_client = await get_openai_client()
        self.qdrant_client = await get_qdrant_client()
        logger.info("Clients initialized")

    def find_markdown_files(self, base_dir: Path) -> List[Path]:
        """Find all markdown files in textbook directories."""
        textbook_dirs = [
            'module1-ros2',
            'module2-simulation',
            'module3-isaac',
            'module4-vla'
        ]

        md_files = []
        for module_dir in textbook_dirs:
            module_path = base_dir / module_dir
            if module_path.exists():
                # Find all .md files recursively
                md_files.extend(module_path.glob('**/*.md'))

        logger.info(f"Found {len(md_files)} markdown files")
        return md_files

    def extract_metadata(self, file_path: Path, base_dir: Path) -> Dict[str, str]:
        """
        Extract metadata from file path.

        Example path: module1-ros2/week1/tutorial-01-setup.md
        Returns: {module, week, tutorial_file, url_path}
        """
        relative_path = file_path.relative_to(base_dir)
        parts = relative_path.parts

        metadata = {
            'module': parts[0] if len(parts) > 0 else 'unknown',
            'week': parts[1] if len(parts) > 1 and 'week' in parts[1] else None,
            'tutorial_file': file_path.name,
            'url_path': '/' + str(relative_path.as_posix()).replace('.md', '')
        }

        return metadata

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenRouter."""
        try:
            response = await self.openai_client.embeddings.create(
                model=settings.embedding_model,
                input=text,
                dimensions=settings.embedding_dimensions
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise

    def generate_chunk_id(self, file_path: str, chunk_index: int) -> str:
        """Generate unique ID for chunk."""
        # Create hash from file path and index
        content = f"{file_path}:{chunk_index}"
        return hashlib.md5(content.encode()).hexdigest()

    async def index_file(self, file_path: Path, base_dir: Path) -> int:
        """
        Index a single markdown file.
        Returns number of chunks indexed.
        """
        logger.info(f"Processing: {file_path.relative_to(base_dir)}")

        try:
            # Read file
            content = file_path.read_text(encoding='utf-8')

            # Extract metadata
            metadata = self.extract_metadata(file_path, base_dir)

            # Chunk content
            chunks = self.chunker.chunk_markdown(content)

            if not chunks:
                logger.warning(f"No chunks generated for {file_path}")
                return 0

            logger.info(f"  Generated {len(chunks)} chunks")

            # Process chunks in batches
            points = []
            for i, chunk_data in enumerate(chunks):
                # Generate embedding
                embedding = await self.generate_embedding(chunk_data['content'])

                # Create point
                point_id = self.generate_chunk_id(str(file_path), i)

                point = PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        'content': chunk_data['content'],
                        'section_title': chunk_data['section_title'],
                        'module': metadata['module'],
                        'week': metadata['week'],
                        'tutorial_file': metadata['tutorial_file'],
                        'url_path': metadata['url_path'],
                        'chunk_index': i,
                        'total_chunks': len(chunks)
                    }
                )
                points.append(point)

            # Upload to Qdrant in batch
            if points:
                self.qdrant_client.upsert(
                    collection_name=settings.collection_name,
                    points=points
                )
                logger.info(f"  Uploaded {len(points)} chunks to Qdrant")

            return len(points)

        except Exception as e:
            logger.error(f"Failed to index {file_path}: {e}")
            return 0

    async def index_all(self, base_dir: Optional[Path] = None):
        """Index all textbook files."""
        if base_dir is None:
            base_dir = Path(__file__).parent.parent.parent

        logger.info("="*60)
        logger.info("TEXTBOOK INDEXING STARTED")
        logger.info("="*60)

        # Initialize clients
        await self.initialize()

        # Find all markdown files
        md_files = self.find_markdown_files(base_dir)

        if not md_files:
            logger.warning("No markdown files found!")
            return

        # Index each file
        total_chunks = 0
        successful_files = 0

        for i, file_path in enumerate(md_files, 1):
            logger.info(f"\n[{i}/{len(md_files)}] {file_path.name}")
            chunks = await self.index_file(file_path, base_dir)
            if chunks > 0:
                total_chunks += chunks
                successful_files += 1

        # Summary
        logger.info("="*60)
        logger.info("INDEXING COMPLETE")
        logger.info("="*60)
        logger.info(f"Files processed: {successful_files}/{len(md_files)}")
        logger.info(f"Total chunks indexed: {total_chunks}")

        # Verify collection
        collection_info = self.qdrant_client.get_collection(settings.collection_name)
        logger.info(f"Qdrant collection '{settings.collection_name}': {collection_info.points_count} points")

        return total_chunks


async def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Index textbook content into Qdrant')
    parser.add_argument('--modules', nargs='+', help='Specific modules to index (e.g., module1-ros2)')
    parser.add_argument('--dry-run', action='store_true', help='Dry run - don\'t upload to Qdrant')
    args = parser.parse_args()

    indexer = TextbookIndexer()
    await indexer.index_all()


if __name__ == "__main__":
    asyncio.run(main())
