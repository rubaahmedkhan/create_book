"""Conversation data model."""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID, uuid4


class Conversation(BaseModel):
    """
    Represents a chat session.

    Attributes:
        id: Unique conversation identifier
        session_id: User session ID (from browser)
        page_context: Textbook page where conversation started
        created_at: Timestamp when conversation was created
        updated_at: Timestamp when conversation was last updated
    """

    id: UUID = Field(default_factory=uuid4, description="Unique conversation identifier")
    session_id: str = Field(..., max_length=255, description="User session ID")
    page_context: Optional[str] = Field(
        None,
        max_length=500,
        description="Page URL where conversation started"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
                "session_id": "browser-session-xyz",
                "page_context": "/docs/module1/week1/ros2-basics",
                "created_at": "2025-12-29T10:30:00Z",
                "updated_at": "2025-12-29T10:35:00Z"
            }
        }
    }


class QueryRequest(BaseModel):
    """Request model for chat query endpoint."""

    question: str = Field(..., min_length=1, max_length=2000, description="User question")
    conversation_id: Optional[UUID] = Field(None, description="Existing conversation ID")
    selected_text: Optional[str] = Field(None, max_length=5000, description="User-selected text")
    page_context: Optional[str] = Field(None, max_length=500, description="Current page URL")
    session_id: str = Field(default="anonymous", max_length=255, description="User session ID")


class QueryResponse(BaseModel):
    """Response model for chat query endpoint."""

    answer: str = Field(..., description="Generated answer")
    citations: List = Field(default_factory=list, description="Source citations")
    conversation_id: UUID = Field(..., description="Conversation ID")
