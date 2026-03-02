"""
Profile Service

Handles user profile creation and management.
"""

from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.models.user_profile import UserProfile
from src.models.questionnaire import QuestionnaireResponse
from src.services.skill_calculator import calculate_skill_level


async def create_user_profile(
    db: Session,
    user_id: str,
    questionnaire_data: dict,
) -> UserProfile:
    """
    Create a new user profile from questionnaire data.

    Args:
        db: Database session
        user_id: User ID from Better Auth session
        questionnaire_data: Dictionary containing all questionnaire responses

    Returns:
        Created UserProfile instance

    Raises:
        IntegrityError: If profile already exists for this user
    """
    # Calculate skill level
    skill_level = calculate_skill_level(
        software_experience_years=questionnaire_data["software_experience_years"],
        programming_languages=questionnaire_data["programming_languages"],
        frameworks_used=questionnaire_data["frameworks_used"],
        version_control_experience=questionnaire_data["version_control_experience"],
        software_projects_completed=questionnaire_data["software_projects_completed"],
        hardware_experience_years=questionnaire_data["hardware_experience_years"],
        microcontrollers_used=questionnaire_data["microcontrollers_used"],
        circuit_design_experience=questionnaire_data["circuit_design_experience"],
        hardware_projects_completed=questionnaire_data["hardware_projects_completed"],
        aiml_experience_years=questionnaire_data["aiml_experience_years"],
        ml_frameworks_used=questionnaire_data["ml_frameworks_used"],
        aiml_concepts_familiar=questionnaire_data["aiml_concepts_familiar"],
        aiml_projects_completed=questionnaire_data["aiml_projects_completed"],
    )

    # Create user profile
    profile = UserProfile(
        id=uuid4(),
        user_id=user_id,
        background_category=questionnaire_data.get("background_category", "software"),
        skill_level=skill_level,
        # Software background
        software_experience_years=questionnaire_data["software_experience_years"],
        programming_languages=questionnaire_data["programming_languages"],
        frameworks_used=questionnaire_data["frameworks_used"],
        development_environments=questionnaire_data["development_environments"],
        version_control_experience=questionnaire_data["version_control_experience"],
        software_projects_completed=questionnaire_data["software_projects_completed"],
        # Hardware background
        hardware_experience_years=questionnaire_data["hardware_experience_years"],
        microcontrollers_used=questionnaire_data["microcontrollers_used"],
        sensors_actuators_used=questionnaire_data["sensors_actuators_used"],
        circuit_design_experience=questionnaire_data["circuit_design_experience"],
        soldering_experience=questionnaire_data["soldering_experience"],
        hardware_projects_completed=questionnaire_data["hardware_projects_completed"],
        # AI/ML background
        aiml_experience_years=questionnaire_data["aiml_experience_years"],
        ml_frameworks_used=questionnaire_data["ml_frameworks_used"],
        aiml_concepts_familiar=questionnaire_data["aiml_concepts_familiar"],
        aiml_projects_completed=questionnaire_data["aiml_projects_completed"],
        # Learning goals
        primary_learning_goal=questionnaire_data["primary_learning_goal"],
        specific_topics_interested=questionnaire_data["specific_topics_interested"],
        preferred_learning_pace=questionnaire_data["preferred_learning_pace"],
        time_commitment_hours_per_week=questionnaire_data["time_commitment_hours_per_week"],
        project_goals=questionnaire_data["project_goals"],
    )

    db.add(profile)

    # Create questionnaire response records (audit trail)
    # Map fields to categories
    software_fields = ["software_experience_years", "programming_languages", "frameworks_used",
                      "development_environments", "version_control_experience", "software_projects_completed"]
    hardware_fields = ["hardware_experience_years", "microcontrollers_used", "sensors_actuators_used",
                      "circuit_design_experience", "soldering_experience", "hardware_projects_completed"]
    aiml_fields = ["aiml_experience_years", "ml_frameworks_used", "aiml_concepts_familiar", "aiml_projects_completed"]
    goals_fields = ["primary_learning_goal", "specific_topics_interested", "preferred_learning_pace",
                   "time_commitment_hours_per_week", "project_goals"]

    for field, value in questionnaire_data.items():
        # Determine category
        if field in software_fields:
            category = "software"
        elif field in hardware_fields:
            category = "hardware"
        elif field in aiml_fields:
            category = "aiml"
        elif field in goals_fields:
            category = "goals"
        else:
            continue  # Skip unknown fields

        response = QuestionnaireResponse(
            id=uuid4(),
            user_id=user_id,
            question_id=field,
            question_category=category,
            response_value=value,  # JSONB can store any type
            is_required=True,
        )
        db.add(response)

    try:
        db.commit()
        db.refresh(profile)
        return profile
    except IntegrityError:
        db.rollback()
        raise


async def get_user_profile(db: Session, user_id: str) -> UserProfile | None:
    """
    Get user profile by user ID.

    Args:
        db: Database session
        user_id: User ID from Better Auth session

    Returns:
        UserProfile instance or None if not found
    """
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
