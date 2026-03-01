"""Check if background_category is being saved"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Get the last 3 profiles
    result = conn.execute(text("""
        SELECT user_id, background_category, skill_level, created_at
        FROM user_profile
        ORDER BY created_at DESC
        LIMIT 5
    """))

    print("Recent user profiles:")
    print("-" * 80)
    for row in result:
        print(f"User: {row[0][:20]}... | Background: {row[1]} | Skill: {row[2]} | Created: {row[3]}")
