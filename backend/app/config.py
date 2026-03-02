"""
Configuration module for loading environment variables.
Validates all required environment variables at startup.
"""

import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenRouter API Configuration (OpenAI-compatible)
    openrouter_api_key: str

    # Qdrant Cloud Configuration
    qdrant_url: str
    qdrant_api_key: str

    # Neon Serverless Postgres Configuration
    neon_database_url: str

    # Backend API Configuration
    database_url: Optional[str] = None  # Allow optional DATABASE_URL from .env
    port: Optional[str] = None  # Allow optional PORT from .env
    environment: Optional[str] = None  # Allow optional ENVIRONMENT from .env
    auth_service_url: Optional[str] = None  # Allow optional AUTH_SERVICE_URL from .env

    # Application Configuration
    docusaurus_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Logging Configuration
    log_level: str = "INFO"

    # OpenRouter Configuration
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # Model Configuration
    completion_model: str = "deepseek/deepseek-chat"  # Free unlimited model
    embedding_model: str = "openai/text-embedding-3-small"  # OpenRouter embedding model
    embedding_dimensions: int = 1536

    # Qdrant Collection Configuration
    collection_name: str = "textbook_chunks"

    # RAG Configuration
    search_limit: int = 5
    score_threshold: float = 0.4  # Lowered from 0.7 to allow more general queries
    chunk_size: int = 800
    chunk_overlap: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(',')]


# Create global settings instance
try:
    settings = Settings()
except Exception as e:
    print(f"[ERROR] Error loading settings: {e}")
    print("Please ensure your .env file is configured correctly.")
    raise


def get_settings() -> Settings:
    """Dependency injection function for FastAPI."""
    return settings
