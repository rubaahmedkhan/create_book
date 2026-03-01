"""Postgres service for conversation and message storage."""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
import asyncpg
import json

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.citation import Citation
from app.utils.logging import get_logger
from app.utils.error_handlers import PostgresError

logger = get_logger("postgres_service")


class PostgresService:
    """Service for interacting with Postgres database."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create_conversation(
        self,
        session_id: str,
        page_context: Optional[str] = None
    ) -> Conversation:
        """
        Create a new conversation.

        Args:
            session_id: User session ID
            page_context: Page URL where conversation started

        Returns:
            Created Conversation object

        Raises:
            PostgresError: If creation fails
        """
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    INSERT INTO conversations (session_id, page_context, created_at, updated_at)
                    VALUES ($1, $2, $3, $3)
                    RETURNING id, session_id, page_context, created_at, updated_at
                    """,
                    session_id,
                    page_context,
                    datetime.utcnow()
                )

                conversation = Conversation(
                    id=row["id"],
                    session_id=row["session_id"],
                    page_context=row["page_context"],
                    created_at=row["created_at"],
                    updated_at=row["updated_at"]
                )

                logger.info(f"[OK] Created conversation: {conversation.id}")
                return conversation

        except Exception as e:
            logger.error(f"[ERROR] Failed to create conversation: {e}")
            raise PostgresError("Failed to create conversation", {"error": str(e)})

    async def get_conversation(self, conversation_id: UUID) -> Optional[Conversation]:
        """
        Get conversation by ID.

        Args:
            conversation_id: Conversation ID

        Returns:
            Conversation object or None if not found

        Raises:
            PostgresError: If query fails
        """
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT id, session_id, page_context, created_at, updated_at
                    FROM conversations
                    WHERE id = $1
                    """,
                    conversation_id
                )

                if row:
                    return Conversation(
                        id=row["id"],
                        session_id=row["session_id"],
                        page_context=row["page_context"],
                        created_at=row["created_at"],
                        updated_at=row["updated_at"]
                    )

                return None

        except Exception as e:
            logger.error(f"[ERROR] Failed to get conversation: {e}")
            raise PostgresError("Failed to get conversation", {"error": str(e)})

    async def create_message(
        self,
        conversation_id: UUID,
        role: str,
        content: str,
        citations: List[Citation] = None,
        selected_text_context: Optional[str] = None
    ) -> Message:
        """
        Create a new message.

        Args:
            conversation_id: Conversation ID
            role: Message role (user or assistant)
            content: Message content
            citations: List of citations (for assistant messages)
            selected_text_context: User-selected text (for user messages)

        Returns:
            Created Message object

        Raises:
            PostgresError: If creation fails
        """
        try:
            citations_json = json.dumps([c.model_dump() for c in citations]) if citations else None

            async with self.pool.acquire() as conn:
                # Create message
                row = await conn.fetchrow(
                    """
                    INSERT INTO messages (conversation_id, role, content, citations, selected_text_context, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id, conversation_id, role, content, citations, selected_text_context, created_at
                    """,
                    conversation_id,
                    role,
                    content,
                    citations_json,
                    selected_text_context,
                    datetime.utcnow()
                )

                # Update conversation timestamp
                await conn.execute(
                    """
                    UPDATE conversations
                    SET updated_at = $1
                    WHERE id = $2
                    """,
                    datetime.utcnow(),
                    conversation_id
                )

                # Parse citations from JSON
                citations_list = []
                if row["citations"]:
                    citations_data = json.loads(row["citations"])
                    citations_list = [Citation(**c) for c in citations_data]

                message = Message(
                    id=row["id"],
                    conversation_id=row["conversation_id"],
                    role=row["role"],
                    content=row["content"],
                    citations=citations_list,
                    selected_text_context=row["selected_text_context"],
                    created_at=row["created_at"]
                )

                logger.info(f"[OK] Created message: {message.id} (role: {role})")
                return message

        except Exception as e:
            logger.error(f"[ERROR] Failed to create message: {e}")
            raise PostgresError("Failed to create message", {"error": str(e)})

    async def get_conversation_history(
        self,
        conversation_id: UUID,
        limit: int = 10
    ) -> List[Message]:
        """
        Get conversation message history.

        Args:
            conversation_id: Conversation ID
            limit: Maximum number of messages to retrieve

        Returns:
            List of Message objects, ordered by creation time

        Raises:
            PostgresError: If query fails
        """
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT id, conversation_id, role, content, citations, selected_text_context, created_at
                    FROM messages
                    WHERE conversation_id = $1
                    ORDER BY created_at ASC
                    LIMIT $2
                    """,
                    conversation_id,
                    limit
                )

                messages = []
                for row in rows:
                    # Parse citations from JSON
                    citations_list = []
                    if row["citations"]:
                        citations_data = json.loads(row["citations"])
                        citations_list = [Citation(**c) for c in citations_data]

                    message = Message(
                        id=row["id"],
                        conversation_id=row["conversation_id"],
                        role=row["role"],
                        content=row["content"],
                        citations=citations_list,
                        selected_text_context=row["selected_text_context"],
                        created_at=row["created_at"]
                    )
                    messages.append(message)

                logger.info(f"[OK] Retrieved {len(messages)} messages for conversation {conversation_id}")
                return messages

        except Exception as e:
            logger.error(f"[ERROR] Failed to get conversation history: {e}")
            raise PostgresError("Failed to get conversation history", {"error": str(e)})
