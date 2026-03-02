"""Dependency injection for FastAPI."""

from typing import AsyncGenerator
from openai import AsyncOpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import asyncpg

from app.config import get_settings
from app.utils.logging import get_logger
from app.utils.error_handlers import QdrantError, PostgresError, OpenAIError

logger = get_logger("dependencies")
settings = get_settings()

# Global clients (initialized once)
_openai_client: AsyncOpenAI | None = None
_qdrant_client: QdrantClient | None = None
_postgres_pool: asyncpg.Pool | None = None


async def get_openai_client() -> AsyncOpenAI:
    """
    Get or create OpenRouter client instance (OpenAI-compatible API).

    Returns:
        AsyncOpenAI client configured for OpenRouter

    Raises:
        OpenAIError: If client initialization fails
    """
    global _openai_client

    if _openai_client is None:
        try:
            _openai_client = AsyncOpenAI(
                api_key=settings.openrouter_api_key,
                base_url=settings.openrouter_base_url
            )
            logger.info("[OK] OpenRouter client initialized (OpenAI-compatible API)")
        except Exception as e:
            logger.error(f"[ERROR] Failed to initialize OpenRouter client: {e}")
            raise OpenAIError("Failed to initialize OpenRouter client", {"error": str(e)})

    return _openai_client


async def get_qdrant_client() -> QdrantClient:
    """
    Get or create Qdrant client instance.

    Returns:
        QdrantClient instance

    Raises:
        QdrantError: If client initialization fails
    """
    global _qdrant_client

    if _qdrant_client is None:
        try:
            _qdrant_client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                timeout=30
            )

            # Verify connection by checking collections
            collections = _qdrant_client.get_collections()
            logger.info(f"[OK] Qdrant client initialized - Collections: {len(collections.collections)}")

            # Create collection if it doesn't exist
            collection_exists = any(
                col.name == settings.collection_name
                for col in collections.collections
            )

            if not collection_exists:
                _qdrant_client.create_collection(
                    collection_name=settings.collection_name,
                    vectors_config=VectorParams(
                        size=settings.embedding_dimensions,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"[OK] Created Qdrant collection: {settings.collection_name}")

        except Exception as e:
            logger.error(f"[ERROR] Failed to initialize Qdrant client: {e}")
            raise QdrantError("Failed to initialize Qdrant client", {"error": str(e)})

    return _qdrant_client


async def get_postgres_pool() -> asyncpg.Pool:
    """
    Get or create Postgres connection pool.

    Returns:
        asyncpg.Pool instance

    Raises:
        PostgresError: If pool initialization fails
    """
    global _postgres_pool

    if _postgres_pool is None:
        try:
            _postgres_pool = await asyncpg.create_pool(
                dsn=settings.neon_database_url,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            logger.info("[OK] Postgres connection pool initialized")

            # Test connection
            async with _postgres_pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
                logger.info("[OK] Postgres connection verified")

        except Exception as e:
            logger.error(f"[ERROR] Failed to initialize Postgres pool: {e}")
            raise PostgresError("Failed to initialize Postgres pool", {"error": str(e)})

    return _postgres_pool


async def close_connections():
    """Close all database connections gracefully."""
    global _openai_client, _qdrant_client, _postgres_pool

    if _qdrant_client:
        try:
            _qdrant_client.close()
            logger.info("[OK] Qdrant client closed")
        except Exception as e:
            logger.error(f"Error closing Qdrant client: {e}")

    if _postgres_pool:
        try:
            await _postgres_pool.close()
            logger.info("[OK] Postgres pool closed")
        except Exception as e:
            logger.error(f"Error closing Postgres pool: {e}")

    _openai_client = None
    _qdrant_client = None
    _postgres_pool = None
