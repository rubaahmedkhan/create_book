# Research: RAG Chatbot Integration for Interactive Learning

**Feature**: 001-rag-chatbot-integration
**Date**: 2025-12-29
**Status**: Complete

## Research Questions

This document resolves all technical unknowns and establishes best practices for implementing a RAG (Retrieval-Augmented Generation) chatbot integrated into a Docusaurus-published textbook.

---

## 1. OpenAI Agents SDK vs ChatKit SDK for RAG

**Decision**: Use **OpenAI Agents SDK** (currently in beta as "Assistants API v2")

**Rationale**:
- Native support for retrieval tools and file search
- Built-in conversation threading and message history management
- Automatic context management with message retention
- Direct integration with vector stores (compatible with Qdrant via custom tools)
- Supports function calling for custom retrieval logic
- Streaming responses for better UX (typing indicators)

**Alternatives Considered**:
- **ChatKit SDK**: Discontinued/deprecated - no longer actively maintained by OpenAI
- **Custom LangChain RAG**: More flexible but requires manual conversation management, context handling, and adds dependency complexity
- **Direct OpenAI Chat Completions API**: Requires manual RAG orchestration, no built-in retrieval, more complex to implement

**Implementation Approach**:
```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create assistant with retrieval capabilities
assistant = client.beta.assistants.create(
    name="Physical AI Textbook Assistant",
    instructions="Answer questions based strictly on the provided textbook content...",
    model="gpt-4-turbo-preview",  # or gpt-3.5-turbo for cost savings
    tools=[{"type": "function", "function": {...}}]  # Custom Qdrant retrieval
)
```

**References**:
- OpenAI Assistants API: https://platform.openai.com/docs/assistants/overview
- Function calling: https://platform.openai.com/docs/guides/function-calling

---

## 2. Qdrant Cloud Integration Best Practices

**Decision**: Use **Qdrant Cloud Free Tier** with `qdrant-client` Python library and text-embedding-3-small for embeddings

**Rationale**:
- Free tier: 1GB storage, sufficient for ~400,000 textbook chunks
- Managed service (no infrastructure overhead)
- Sub-100ms semantic search latency
- Built-in cosine similarity scoring
- Python client is mature and well-documented
- OpenAI text-embedding-3-small: $0.02/1M tokens, 1536 dimensions

**Vector Database Schema**:
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Create collection for textbook chunks
client.create_collection(
    collection_name="textbook_chunks",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Metadata structure for each chunk
point = PointStruct(
    id=chunk_id,
    vector=embedding_vector,  # 1536-dim from text-embedding-3-small
    payload={
        "module": "module1-ros2",
        "week": 1,
        "tutorial_file": "01-ros2-basics.md",
        "section_title": "Publishers and Subscribers",
        "content": "Full text content...",
        "file_path": "module1-ros2/docs/week1/01-ros2-basics.md",
        "line_start": 45,
        "line_end": 78,
        "url_path": "/docs/module1/week1/ros2-basics#publishers-and-subscribers"
    }
)
```

**Chunking Strategy**:
- Target chunk size: 500-800 tokens (balances context vs retrieval precision)
- Overlap: 100 tokens between chunks (prevents context loss at boundaries)
- Chunk boundaries: Respect markdown section headers (H2/H3)
- Code blocks: Keep intact within chunks when possible

**Search Parameters**:
```python
search_results = client.search(
    collection_name="textbook_chunks",
    query_vector=query_embedding,
    limit=5,  # Top 5 most relevant chunks
    score_threshold=0.7  # Minimum similarity score
)
```

**References**:
- Qdrant Cloud: https://cloud.qdrant.io/
- Qdrant Python Client: https://python-client.qdrant.tech/
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings

---

## 3. Neon Serverless Postgres for Conversation History

**Decision**: Use **Neon Serverless Postgres Free Tier** with `psycopg2` or `asyncpg` for async operations

**Rationale**:
- Free tier: 10GB storage, 1 concurrent connection (sufficient for MVP)
- Serverless: Auto-scaling, auto-pause when inactive (cost-efficient)
- PostgreSQL compatibility: Full SQL support, JSONB for flexible schemas
- Connection pooling via Neon's built-in proxy
- Low latency: <50ms for simple queries

**Database Schema**:
```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,  -- Browser session ID
    page_context TEXT,  -- URL of page where conversation started
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_session ON conversations(session_id);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
    content TEXT NOT NULL,
    selected_text_context TEXT,  -- Optional: text user selected
    citations JSONB,  -- Array of citation objects
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

**Connection Management**:
```python
import os
import asyncpg

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

# Connection pool (async)
pool = await asyncpg.create_pool(
    DATABASE_URL,
    min_size=1,
    max_size=3,  # Free tier limits connections
    command_timeout=60
)
```

**References**:
- Neon Serverless Postgres: https://neon.tech/docs/introduction
- asyncpg: https://magicstack.github.io/asyncpg/

---

## 4. FastAPI Backend Architecture

**Decision**: Use **FastAPI** with async/await for all I/O operations, structured as a microservice

**Rationale**:
- Async support: Non-blocking calls to Qdrant, Neon Postgres, OpenAI
- Automatic OpenAPI documentation (helpful for frontend integration)
- Pydantic models for request/response validation
- CORS middleware for Docusaurus integration
- WebSocket support for streaming responses (typing indicators)
- Fast startup time for serverless deployment

**API Structure**:
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="RAG Chatbot API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("DOCUSAURUS_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    conversation_id: str | None = None
    selected_text: str | None = None
    page_context: str | None = None

class QueryResponse(BaseModel):
    answer: str
    citations: list[dict]
    conversation_id: str

@app.post("/api/chat/query", response_model=QueryResponse)
async def chat_query(request: QueryRequest):
    # 1. Embed question using OpenAI
    # 2. Search Qdrant for relevant chunks
    # 3. Construct prompt with retrieved context
    # 4. Call OpenAI Assistants API
    # 5. Parse citations from response
    # 6. Store message in Neon Postgres
    # 7. Return response
    pass
```

**Deployment Options**:
- **Railway.app** (free tier: 500 hours/month, $5 credit)
- **Fly.io** (free tier: 3 shared VMs)
- **Vercel Serverless Functions** (requires adaptation for Python)

**References**:
- FastAPI: https://fastapi.tiangolo.com/
- FastAPI async: https://fastapi.tiangolo.com/async/

---

## 5. Docusaurus v3 Chatbot UI Integration

**Decision**: Create a **custom Docusaurus plugin** with React component for chatbot UI

**Rationale**:
- Docusaurus v3 uses React 18 (full hooks support)
- Swizzling allows theme customization without forking
- Plugin system enables cross-page state management
- MDX support allows embedding chatbot in markdown
- Dark mode support out of the box

**Implementation Approach**:

**Plugin Structure** (`plugins/chatbot-plugin/`):
```javascript
// plugins/chatbot-plugin/index.js
module.exports = function (context, options) {
  return {
    name: 'chatbot-plugin',
    getClientModules() {
      return ['./chatbot-client.js'];
    },
    injectHtmlTags() {
      return {
        headTags: [],
        preBodyTags: [],
        postBodyTags: [
          {
            tagName: 'div',
            attributes: { id: 'chatbot-root' },
          },
        ],
      };
    },
  };
};
```

**React Component** (`src/components/Chatbot.tsx`):
```typescript
import React, { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sendMessage = async () => {
    const response = await fetch(`${API_URL}/api/chat/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: input,
        conversation_id: conversationId,
        selected_text: window.getSelection()?.toString(),
        page_context: window.location.pathname
      })
    });
    const data = await response.json();
    setMessages([...messages,
      { role: 'user', content: input },
      { role: 'assistant', content: data.answer, citations: data.citations }
    ]);
    setConversationId(data.conversation_id);
  };

  return (
    <div className="chatbot-container">
      {/* Chat messages, input, send button */}
    </div>
  );
}
```

**Text Selection Support**:
```javascript
// Detect text selection and show "Ask about this" button
useEffect(() => {
  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      // Show floating button near selection
      showAskButton(selection);
    }
  };
  document.addEventListener('mouseup', handleSelection);
  return () => document.removeEventListener('mouseup', handleSelection);
}, []);
```

**References**:
- Docusaurus Plugins: https://docusaurus.io/docs/api/plugin-methods
- Docusaurus Swizzling: https://docusaurus.io/docs/swizzling

---

## 6. Security: Environment Variables & Secrets Management

**Decision**: Use **python-dotenv** for backend, Next.js env vars for frontend, NEVER commit secrets

**Best Practices** (Constitution Principle VIII):

**Backend (.env file)**:
```bash
# .env (NEVER commit this file - add to .gitignore)
OPENAI_API_KEY=sk-proj-...
QDRANT_URL=https://xxx.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbG...
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/db
DOCUSAURUS_URL=https://textbook.example.com
```

**Backend Loading**:
```python
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env file

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)
```

**.env.template** (safe to commit):
```bash
# .env.template - Copy to .env and fill in values
OPENAI_API_KEY=sk-proj-your-key-here
QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key
NEON_DATABASE_URL=postgresql://user:password@host/database
DOCUSAURUS_URL=http://localhost:3000
```

**.gitignore**:
```
.env
.env.local
```

**CI/CD Secrets**: Use GitHub Secrets, Railway environment variables, or similar

**References**:
- python-dotenv: https://pypi.org/project/python-dotenv/
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## 7. Content Indexing Pipeline

**Decision**: Build a **one-time indexing script** that chunks markdown files and uploads to Qdrant

**Chunking Algorithm**:
```python
import re
from typing import List, Dict

def chunk_markdown(content: str, file_metadata: dict, chunk_size: int = 600, overlap: int = 100) -> List[Dict]:
    """
    Chunk markdown content by sections (H2/H3 headers) with overlap.

    Args:
        content: Full markdown file content
        file_metadata: {module, week, tutorial_file, file_path, url_path}
        chunk_size: Target tokens per chunk
        overlap: Overlap tokens between chunks

    Returns:
        List of chunk dicts ready for embedding
    """
    chunks = []

    # Split by headers (## or ###)
    sections = re.split(r'\n(?=#{2,3} )', content)

    for section in sections:
        # Extract section title
        title_match = re.match(r'^#{2,3} (.+)$', section, re.MULTILINE)
        section_title = title_match.group(1) if title_match else "Introduction"

        # Chunk large sections with overlap
        words = section.split()
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i:i + chunk_size]
            chunks.append({
                "content": ' '.join(chunk_words),
                "section_title": section_title,
                **file_metadata
            })

    return chunks
```

**Indexing Script** (`scripts/index_textbook.py`):
```python
import glob
from openai import OpenAI
from qdrant_client import QdrantClient

def index_all_modules():
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    qdrant_client = QdrantClient(...)

    # Find all markdown files
    markdown_files = glob.glob("module*/**/*.md", recursive=True)

    for file_path in markdown_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse metadata from file path
        metadata = parse_file_metadata(file_path)

        # Chunk content
        chunks = chunk_markdown(content, metadata)

        # Generate embeddings
        for chunk in chunks:
            embedding = openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=chunk["content"]
            ).data[0].embedding

            # Upload to Qdrant
            qdrant_client.upsert(
                collection_name="textbook_chunks",
                points=[PointStruct(
                    id=generate_id(),
                    vector=embedding,
                    payload=chunk
                )]
            )
```

---

## 8. Citation Generation Strategy

**Decision**: Include **source metadata in retrieval** and format citations in responses

**Citation Format**:
```python
def format_citation(chunk_metadata: dict) -> str:
    """
    Format: "Module X, Week Y, Tutorial Z: Section Title"
    Example: "Module 2, Week 5, Tutorial 06: Gazebo Physics (Section: Physics Engines)"
    """
    return (
        f"Module {chunk_metadata['module']}, "
        f"Week {chunk_metadata['week']}, "
        f"Tutorial {chunk_metadata['tutorial_file']}: "
        f"{chunk_metadata['section_title']}"
    )

def generate_citation_link(chunk_metadata: dict) -> str:
    """
    Generate clickable link to exact textbook section
    """
    return chunk_metadata['url_path']
```

**OpenAI Prompt with Citations**:
```python
system_prompt = """
You are a helpful assistant for the Physical AI & Humanoid Robotics textbook.

CRITICAL RULES:
1. Answer ONLY using the provided textbook excerpts below
2. NEVER use external knowledge or information not in the excerpts
3. If the excerpts don't contain the answer, say "I don't have information about that in this textbook"
4. Always cite your sources using [Source N] notation
5. Be concise but accurate

TEXTBOOK EXCERPTS:
{retrieved_chunks}

Remember: ONLY use information from the excerpts above. If unsure, ask for clarification.
"""
```

---

## 9. Testing Strategy

**Decision**: Multi-layer testing with **unit, integration, and end-to-end tests**

**Test Layers**:

1. **Unit Tests** (pytest for backend):
   - Chunking algorithm accuracy
   - Citation formatting
   - Query embedding generation
   - Response parsing

2. **Integration Tests**:
   - Qdrant search with mock embeddings
   - Neon Postgres CRUD operations
   - OpenAI API mocking (to avoid costs)

3. **Contract Tests**:
   - FastAPI endpoint schemas (OpenAPI validation)
   - Pydantic model validation

4. **End-to-End Tests** (Playwright/Cypress for frontend):
   - User asks question → receives answer with citations
   - Text selection → contextual answer
   - Conversation history persistence
   - Error handling when services unavailable

**Example Unit Test**:
```python
def test_chunk_markdown():
    content = "## Section 1\nContent here...\n## Section 2\nMore content..."
    chunks = chunk_markdown(content, metadata={}, chunk_size=10)
    assert len(chunks) >= 2
    assert chunks[0]['section_title'] == "Section 1"
```

---

## 10. Performance Optimization

**Decisions**:
- **Caching**: Redis for frequently asked questions (optional enhancement)
- **Embedding Batch Processing**: Batch embed queries in groups of 100
- **Connection Pooling**: asyncpg pool for Neon Postgres
- **Response Streaming**: WebSocket for real-time token streaming

**Response Time Budget**:
- Embedding query: ~100ms
- Qdrant search: ~200ms
- OpenAI completion: ~1-2s (streaming)
- Database operations: ~50ms
- **Total target**: <3s (meets SC-001)

---

## Summary of Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| LLM API | OpenAI Assistants API (gpt-4-turbo) | Native retrieval support, conversation threading |
| Embeddings | text-embedding-3-small | Cost-effective ($0.02/1M tokens), 1536-dim |
| Vector DB | Qdrant Cloud (free tier) | Managed, fast, 1GB free storage |
| Conversation Storage | Neon Serverless Postgres | Serverless, PostgreSQL, 10GB free |
| Backend Framework | FastAPI (Python 3.11+) | Async, OpenAPI docs, fast |
| Frontend Integration | Docusaurus v3 Plugin + React | Native React 18 support, plugin system |
| Secrets Management | python-dotenv + .env files | Simple, secure, follows Constitution VIII |
| Deployment | Railway.app or Fly.io | Free tiers, easy Python deployment |
| Testing | pytest + Playwright | Comprehensive coverage |

**All technical unknowns resolved. Ready for Phase 1: Design & Contracts.**
