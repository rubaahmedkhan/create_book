"""
Questionnaire API Endpoints

Handles questionnaire submission and profile creation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.db.database import get_db
from src.api.middleware.auth import validate_session
from src.services.profile import create_user_profile

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])


class QuestionnaireSubmission(BaseModel):
    """Questionnaire submission schema."""

    # Background category (selected during signup)
    background_category: str = Field(default="software", pattern="^(hardware|software|both)$")

    # Software background
    software_experience_years: int = Field(ge=0, le=50)
    programming_languages: list[str] = Field(default_factory=list)
    frameworks_used: list[str] = Field(default_factory=list)
    development_environments: list[str] = Field(default_factory=list)
    version_control_experience: bool = False
    software_projects_completed: int = Field(ge=0, le=1000)

    # Hardware background
    hardware_experience_years: int = Field(ge=0, le=50)
    microcontrollers_used: list[str] = Field(default_factory=list)
    sensors_actuators_used: list[str] = Field(default_factory=list)
    circuit_design_experience: bool = False
    soldering_experience: bool = False
    hardware_projects_completed: int = Field(ge=0, le=1000)

    # AI/ML background
    aiml_experience_years: int = Field(ge=0, le=50)
    ml_frameworks_used: list[str] = Field(default_factory=list)
    aiml_concepts_familiar: list[str] = Field(default_factory=list)
    aiml_projects_completed: int = Field(ge=0, le=1000)

    # Learning goals
    primary_learning_goal: str
    specific_topics_interested: list[str] = Field(default_factory=list)
    preferred_learning_pace: str
    time_commitment_hours_per_week: int = Field(ge=0, le=168)
    project_goals: list[str] = Field(default_factory=list)


class QuestionnaireResponse(BaseModel):
    """Response after successful questionnaire submission."""

    message: str
    skill_level: str
    profile_id: str


@router.post("", response_model=QuestionnaireResponse, status_code=status.HTTP_201_CREATED)
async def submit_questionnaire(
    submission: QuestionnaireSubmission,
    db: Session = Depends(get_db),
    user_id: str = Depends(validate_session),
):
    """
    Submit questionnaire and create user profile.

    Validates session, calculates skill level, creates profile and questionnaire responses.

    Returns:
        - 201 Created: Profile created successfully
        - 401 Unauthorized: Invalid or missing session
        - 409 Conflict: Profile already exists
        - 422 Unprocessable Entity: Validation error
    """
    try:
        profile = await create_user_profile(
            db=db,
            user_id=user_id,
            questionnaire_data=submission.model_dump(),
        )

        return QuestionnaireResponse(
            message="Questionnaire submitted successfully",
            skill_level=profile.skill_level,
            profile_id=str(profile.id),
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists for this user",
        )
