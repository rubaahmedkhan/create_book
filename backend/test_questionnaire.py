"""Test questionnaire submission to debug error."""
import asyncio
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.services.profile import create_user_profile

async def test_questionnaire():
    """Test questionnaire submission."""
    # Get database session
    db_gen = get_db()
    db = next(db_gen)

    # Test data - beginner level
    questionnaire_data = {
        "software_experience_years": 1,
        "programming_languages": ["Python"],
        "frameworks_used": [],
        "development_environments": ["VS Code"],
        "version_control_experience": False,
        "software_projects_completed": 2,
        "hardware_experience_years": 0,
        "microcontrollers_used": [],
        "sensors_actuators_used": [],
        "circuit_design_experience": False,
        "soldering_experience": False,
        "hardware_projects_completed": 0,
        "aiml_experience_years": 0,
        "ml_frameworks_used": [],
        "aiml_concepts_familiar": [],
        "aiml_projects_completed": 0,
        "primary_learning_goal": "Learn robotics basics",
        "specific_topics_interested": ["ROS2", "Simulation"],
        "preferred_learning_pace": "slow",
        "time_commitment_hours_per_week": 5,
        "project_goals": ["Build a simple robot"]
    }

    # Test with a user ID from the signup test
    user_id = "FW6IIvv4aYENCzyOZJxhR7U3X2L8r9BJ"

    try:
        profile = await create_user_profile(
            db=db,
            user_id=user_id,
            questionnaire_data=questionnaire_data
        )
        print("Profile created successfully!")
        print(f"  User ID: {profile.user_id}")
        print(f"  Skill Level: {profile.skill_level}")
        print(f"  Profile ID: {profile.id}")
    except Exception as e:
        print("Error creating profile:")
        print(f"  {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_questionnaire())
