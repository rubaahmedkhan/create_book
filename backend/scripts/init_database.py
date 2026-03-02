"""
Initialize Postgres database schema.
Creates tables for conversations and messages.
"""

import asyncio
import asyncpg
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings
from app.utils.logging import setup_logging, get_logger

setup_logging("INFO")
logger = get_logger("init_database")
settings = get_settings()


async def create_tables():
    """Create database tables if they don't exist."""
    try:
        logger.info("[CONNECT] Connecting to Neon Postgres...")
        conn = await asyncpg.connect(dsn=settings.neon_database_url)

        logger.info("[DB] Creating tables...")

        # Create conversations table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id VARCHAR(255) NOT NULL,
                page_context VARCHAR(500),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        """)
        logger.info("[OK] Created table: conversations")

        # Create messages table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                citations JSONB,
                selected_text_context TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        """)
        logger.info("[OK] Created table: messages")

        # Create indexes
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
            ON messages(conversation_id)
        """)
        logger.info("[OK] Created index: idx_messages_conversation_id")

        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_conversations_session_id
            ON conversations(session_id)
        """)
        logger.info("[OK] Created index: idx_conversations_session_id")

        # Verify tables
        tables = await conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        """)

        logger.info(f"[OK] Database schema initialized successfully!")
        logger.info(f"Tables: {[t['table_name'] for t in tables]}")

        await conn.close()

    except Exception as e:
        logger.error(f"[ERROR] Failed to initialize database: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(create_tables())
