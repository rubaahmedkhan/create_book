"""
Profile API Endpoints

Handles user profile retrieval and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from src.db.database import get_db
from src.api.middleware.auth import validate_session
from src.services.profile import get_user_profile

router = APIRouter(prefix="/profile", tags=["profile"])


class UserProfileResponse(BaseModel):
    """User profile response schema."""

    user_id: str
    background_category: str
    skill_level: str

    # Software background
    software_experience_years: int
    programming_languages: list[str]
    frameworks_used: list[str]
    development_environments: list[str]
    version_control_experience: bool
    software_projects_completed: int

    # Hardware background
    hardware_experience_years: int
    microcontrollers_used: list[str]
    sensors_actuators_used: list[str]
    circuit_design_experience: bool
    soldering_experience: bool
    hardware_projects_completed: int

    # AI/ML background
    aiml_experience_years: int
    ml_frameworks_used: list[str]
    aiml_concepts_familiar: list[str]
    aiml_projects_completed: int

    # Learning goals
    primary_learning_goal: str
    specific_topics_interested: list[str]
    preferred_learning_pace: str
    time_commitment_hours_per_week: int
    project_goals: list[str]

    # Metadata
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    db: Session = Depends(get_db),
    user_id: str = Depends(validate_session),
):
    """
    Get user profile.

    Validates session and returns user profile data.

    Returns:
        - 200 OK: Profile found
        - 401 Unauthorized: Invalid or missing session
        - 404 Not Found: Profile doesn't exist (user should complete questionnaire)
    """
    profile = await get_user_profile(db=db, user_id=user_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete the questionnaire.",
        )

    return profile
