"""RAG orchestration service - coordinates the full query flow."""

from typing import Optional, List, Dict, Any
from uuid import UUID
import re

from app.services.openai_service import OpenAIService
from app.services.qdrant_service import QdrantService
from app.services.postgres_service import PostgresService
from app.models.citation import Citation
from app.models.conversation import QueryRequest, QueryResponse
from app.utils.logging import get_logger
from app.utils.error_handlers import ChatbotError

logger = get_logger("rag_service")


class RAGService:
    """
    RAG orchestration service.

    Coordinates the full pipeline:
    1. Embed user query
    2. Search vector database
    3. Generate response with retrieved context
    4. Parse citations
    5. Store conversation/messages
    """

    def __init__(
        self,
        openai_service: OpenAIService,
        qdrant_service: QdrantService,
        postgres_service: PostgresService
    ):
        self.openai_service = openai_service
        self.qdrant_service = qdrant_service
        self.postgres_service = postgres_service

    async def orchestrate_query(self, request: QueryRequest) -> QueryResponse:
        """
        Orchestrate the full RAG query flow.

        Args:
            request: Query request with question and optional context

        Returns:
            QueryResponse with answer and citations

        Raises:
            ChatbotError: If any step fails
        """
        try:
            logger.info(f"[PROCESSING] Processing query: '{request.question[:50]}...'")

            # Step 1: Get or create conversation
            conversation = None
            if request.conversation_id:
                conversation = await self.postgres_service.get_conversation(request.conversation_id)

            if not conversation:
                conversation = await self.postgres_service.create_conversation(
                    session_id=request.session_id,
                    page_context=request.page_context
                )
                logger.info(f"Created new conversation: {conversation.id}")

            # Step 2: Prepare query text (combine question with selected text if provided)
            query_text = request.question
            if request.selected_text:
                query_text = f"Context: {request.selected_text}\n\nQuestion: {request.question}"
                logger.info(f"Using selected text context (length: {len(request.selected_text)})")

            # Step 3: Generate embedding for query
            logger.info("Generating query embedding...")
            query_vector = await self.openai_service.generate_embedding(query_text)

            # Step 4: Search vector database
            logger.info("Searching vector database...")
            retrieved_chunks = await self.qdrant_service.search_chunks(
                query_vector=query_vector
            )

            if not retrieved_chunks:
                logger.warning("No relevant chunks found in vector database")
                return QueryResponse(
                    answer="Hi! I'm your textbook assistant for ROS 2 and Robotics. I can help you with topics like:\n\n- ROS 2 architecture and concepts\n- Nodes, topics, services, and actions\n- Simulation with Isaac Sim\n- Vision-Language-Action models\n\nTry asking something like: 'What is ROS 2?' or 'Explain nodes and topics'",
                    citations=[],
                    conversation_id=conversation.id
                )

            # Step 5: Get conversation history for context
            conversation_history = await self.postgres_service.get_conversation_history(
                conversation_id=conversation.id,
                limit=5
            )

            # Convert to OpenAI message format
            history_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in conversation_history
            ]

            # Step 6: Generate response
            logger.info(f"Generating response with {len(retrieved_chunks)} chunks...")
            answer = await self.openai_service.generate_response(
                prompt=request.question,
                retrieved_chunks=retrieved_chunks,
                conversation_history=history_messages
            )

            # Step 7: Parse citations from answer
            citations = self._parse_citations(answer, retrieved_chunks)
            logger.info(f"Parsed {len(citations)} citations from response")

            # Step 8: Store user message
            await self.postgres_service.create_message(
                conversation_id=conversation.id,
                role="user",
                content=request.question,
                selected_text_context=request.selected_text
            )

            # Step 9: Store assistant message with citations
            await self.postgres_service.create_message(
                conversation_id=conversation.id,
                role="assistant",
                content=answer,
                citations=citations
            )

            logger.info(f"[OK] Query completed successfully for conversation {conversation.id}")

            return QueryResponse(
                answer=answer,
                citations=[c.model_dump() for c in citations],
                conversation_id=conversation.id
            )

        except Exception as e:
            logger.error(f"[ERROR] RAG orchestration failed: {e}")
            raise ChatbotError("Failed to process query", {"error": str(e)})

    def _parse_citations(
        self,
        answer: str,
        retrieved_chunks: List[Dict[str, Any]]
    ) -> List[Citation]:
        """
        Parse [Source N] citations from generated answer.

        Args:
            answer: Generated answer text
            retrieved_chunks: List of chunks used for generation

        Returns:
            List of Citation objects
        """
        citations = []

        # Find all [Source N] references in answer
        source_pattern = r'\[Source (\d+)\]'
        source_matches = re.findall(source_pattern, answer)

        # Map source numbers to chunks
        for source_num_str in set(source_matches):  # Use set to avoid duplicates
            source_num = int(source_num_str)

            # Get corresponding chunk (1-indexed in answer, 0-indexed in list)
            if 0 <= source_num - 1 < len(retrieved_chunks):
                chunk = retrieved_chunks[source_num - 1]
                metadata = chunk.get("metadata", {})

                # Format citation source text
                source_text = self._format_citation_source(metadata)

                # Generate URL
                url = metadata.get("url_path", "")

                # Create Citation object
                citation = Citation(
                    source=source_text,
                    url=url,
                    module=metadata.get("module", ""),
                    week=metadata.get("week"),
                    tutorial_file=metadata.get("tutorial_file", ""),
                    section_title=metadata.get("section_title"),
                    relevance_score=chunk.get("score", 0.0)
                )

                citations.append(citation)

        return citations

    def _format_citation_source(self, metadata: Dict[str, Any]) -> str:
        """
        Format citation source text from metadata.

        Args:
            metadata: Chunk metadata

        Returns:
            Formatted citation string
        """
        parts = []

        module = metadata.get("module", "")
        if module:
            # Extract module number and name (e.g., "module1-ros2" -> "Module 1: ROS 2")
            module_clean = module.replace("module", "Module ").replace("-", ": ").title()
            parts.append(module_clean)

        week = metadata.get("week", "")
        if week:
            week_clean = week.replace("week", "Week ")
            parts.append(week_clean)

        tutorial_file = metadata.get("tutorial_file", "")
        if tutorial_file:
            # Clean up tutorial filename
            tutorial_clean = tutorial_file.replace(".md", "").replace("-", " ").title()
            parts.append(tutorial_clean)

        section_title = metadata.get("section_title", "")
        if section_title:
            parts.append(f"Section: {section_title}")

        return ", ".join(parts) if parts else "Unknown Source"
