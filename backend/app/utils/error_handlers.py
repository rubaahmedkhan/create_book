"""
Custom exception classes and error handlers.
"""

from typing import Any, Dict, Optional


class ChatbotError(Exception):
    """Base exception for chatbot errors."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class QdrantError(ChatbotError):
    """Exception raised for Qdrant vector database errors."""

    pass


class PostgresError(ChatbotError):
    """Exception raised for Postgres database errors."""

    pass


class OpenAIError(ChatbotError):
    """Exception raised for OpenAI API errors."""

    pass


class ValidationError(ChatbotError):
    """Exception raised for validation errors."""

    pass


class ServiceUnavailableError(ChatbotError):
    """Exception raised when external services are unavailable."""

    pass


class RateLimitError(ChatbotError):
    """Exception raised when rate limits are exceeded."""

    pass
