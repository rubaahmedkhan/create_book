"""
Verify API credentials and service connections.
Tests connectivity to OpenAI, Qdrant Cloud, and Neon Postgres.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings
from app.utils.logging import setup_logging, get_logger
from app.api.dependencies import get_openai_client, get_qdrant_client, get_postgres_pool

setup_logging("INFO")
logger = get_logger("verify_credentials")
settings = get_settings()


async def verify_openai():
    """Verify OpenRouter API connection."""
    try:
        logger.info("Testing OpenRouter connection...")
        client = await get_openai_client()

        # Test with a simple chat completion request
        response = await client.chat.completions.create(
            model=settings.completion_model,
            messages=[{"role": "user", "content": "Say 'test' if you can read this."}],
            max_tokens=10
        )

        if response.choices and response.choices[0].message.content:
            logger.info(f"✅ OpenRouter API working correctly")
            logger.info(f"   Model: {settings.completion_model}")
            logger.info(f"   Response: {response.choices[0].message.content.strip()}")
            return True
        else:
            logger.error("❌ OpenRouter API returned unexpected response")
            return False

    except Exception as e:
        logger.error(f"❌ OpenRouter API connection failed: {e}")
        return False


async def verify_qdrant():
    """Verify Qdrant Cloud connection."""
    try:
        logger.info("Testing Qdrant Cloud connection...")
        client = await get_qdrant_client()

        # Get collections
        collections = client.get_collections()
        logger.info(f"✅ Qdrant Cloud connected successfully")
        logger.info(f"Collections: {[col.name for col in collections.collections]}")

        # Check if textbook_chunks collection exists
        collection_names = [col.name for col in collections.collections]
        if settings.collection_name in collection_names:
            # Get collection info
            collection = client.get_collection(settings.collection_name)
            logger.info(f"✅ Collection '{settings.collection_name}' exists with {collection.points_count} points")
        else:
            logger.info(f"⚠️  Collection '{settings.collection_name}' does not exist yet (will be created on first use)")

        return True

    except Exception as e:
        logger.error(f"❌ Qdrant Cloud connection failed: {e}")
        return False


async def verify_postgres():
    """Verify Neon Postgres connection."""
    try:
        logger.info("Testing Neon Postgres connection...")
        pool = await get_postgres_pool()

        # Test query
        async with pool.acquire() as conn:
            result = await conn.fetchval("SELECT version()")
            logger.info(f"✅ Neon Postgres connected successfully")
            logger.info(f"PostgreSQL version: {result.split(',')[0]}")

            # Check if tables exist
            tables = await conn.fetch("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
            """)

            table_names = [t['table_name'] for t in tables]
            if 'conversations' in table_names and 'messages' in table_names:
                logger.info(f"✅ Database schema exists: {table_names}")
            else:
                logger.warning(f"⚠️  Database tables not found. Run 'python scripts/init_database.py' to create them.")

        return True

    except Exception as e:
        logger.error(f"❌ Neon Postgres connection failed: {e}")
        return False


async def main():
    """Run all verification tests."""
    logger.info("="*60)
    logger.info("🔍 VERIFYING SERVICE CREDENTIALS")
    logger.info("="*60)

    results = {
        "OpenRouter": await verify_openai(),
        "Qdrant Cloud": await verify_qdrant(),
        "Neon Postgres": await verify_postgres()
    }

    logger.info("="*60)
    logger.info("📊 VERIFICATION SUMMARY")
    logger.info("="*60)

    all_passed = True
    for service, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{service:20} {status}")
        if not passed:
            all_passed = False

    logger.info("="*60)

    if all_passed:
        logger.info("🎉 All services verified successfully!")
        logger.info("You can now start the backend server with: uvicorn app.main:app --reload")
    else:
        logger.error("⚠️  Some services failed verification. Please check your credentials in .env file")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
