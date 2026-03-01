"""Message data model."""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from .citation import Citation


class Message(BaseModel):
    """
    Represents a single message in a conversation.

    Attributes:
        id: Unique message identifier
        conversation_id: ID of the conversation this message belongs to
        role: Message role (user or assistant)
        content: Message text content
        citations: List of source references (only for assistant messages)
        selected_text_context: Text selected by user (only for user messages)
        created_at: Timestamp when message was created
    """

    id: UUID = Field(default_factory=uuid4, description="Unique message identifier")
    conversation_id: UUID = Field(..., description="Conversation ID")
    role: str = Field(..., pattern="^(user|assistant)$", description="Message role")
    content: str = Field(..., min_length=1, max_length=10000, description="Message content")
    citations: List[Citation] = Field(default_factory=list, description="Source citations (assistant only)")
    selected_text_context: Optional[str] = Field(
        None,
        max_length=5000,
        description="User-selected text context"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "conversation_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
                "role": "user",
                "content": "What is a ROS 2 node?",
                "citations": [],
                "selected_text_context": None,
                "created_at": "2025-12-29T10:30:00Z"
            }
        }
    }
