"""
Learning Content API Endpoints

Provides access to learning modules and lessons based on user skill level.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_ as sa_or, any_
from typing import List, Optional
from datetime import datetime

from src.db.database import get_db
from src.api.middleware.auth import validate_session
from src.models.learning_content import LearningModule, Lesson
from src.models.user_profile import UserProfile

router = APIRouter(prefix="/content", tags=["content"])


class LessonResponse(BaseModel):
    """Lesson response schema."""
    id: str
    module_id: str
    title: str
    description: str
    content_type: str
    content_url: Optional[str]
    content_text: Optional[str]
    order: int
    duration_minutes: Optional[int]
    difficulty: Optional[str]
    tags: List[str]

    class Config:
        from_attributes = True


class ModuleResponse(BaseModel):
    """Learning module response schema."""
    id: str
    title: str
    description: str
    skill_level: str
    category: str
    order: int
    icon: Optional[str]
    estimated_hours: Optional[int]
    prerequisites: List[str]
    learning_objectives: List[str]
    lesson_count: int

    class Config:
        from_attributes = True


class ModuleWithLessonsResponse(BaseModel):
    """Module with its lessons."""
    id: str
    title: str
    description: str
    skill_level: str
    category: str
    order: int
    icon: Optional[str]
    estimated_hours: Optional[int]
    prerequisites: List[str]
    learning_objectives: List[str]
    lessons: List[LessonResponse]

    class Config:
        from_attributes = True


@router.get("/modules", response_model=List[ModuleResponse])
async def get_learning_modules(
    db: Session = Depends(get_db),
    user_id: str = Depends(validate_session),
):
    """
    Get learning modules personalized for user's skill level.

    Returns modules matching the user's skill level from their profile.
    """
    # Get user profile to determine skill level
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete the questionnaire."
        )

    # Fetch modules for user's skill level and background
    # Filter by background: show modules that target the user's background or 'both'
    modules = (
        db.query(LearningModule)
        .filter(
            LearningModule.skill_level == profile.skill_level,
            LearningModule.is_published == True,
            sa_or(
                profile.background_category == any_(LearningModule.target_background),
                'both' == any_(LearningModule.target_background)
            )
        )
        .order_by(LearningModule.order)
        .all()
    )

    # Add lesson count to each module
    module_responses = []
    for module in modules:
        lesson_count = db.query(Lesson).filter(
            Lesson.module_id == module.id,
            Lesson.is_published == True
        ).count()

        module_dict = {
            "id": str(module.id),
            "title": module.title,
            "description": module.description,
            "skill_level": module.skill_level,
            "category": module.category,
            "order": module.order,
            "icon": module.icon,
            "estimated_hours": module.estimated_hours,
            "prerequisites": module.prerequisites,
            "learning_objectives": module.learning_objectives,
            "lesson_count": lesson_count
        }
        module_responses.append(ModuleResponse(**module_dict))

    return module_responses


@router.get("/modules/{module_id}", response_model=ModuleWithLessonsResponse)
async def get_module_with_lessons(
    module_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(validate_session),
):
    """
    Get a specific module with all its lessons.

    Validates that the module matches the user's skill level.
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Get module
    module = db.query(LearningModule).filter(LearningModule.id == module_id).first()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )

    # Verify module matches user's skill level
    if module.skill_level != profile.skill_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This module is not for your skill level"
        )

    # Get lessons for this module
    lessons = (
        db.query(Lesson)
        .filter(
            Lesson.module_id == module_id,
            Lesson.is_published == True
        )
        .order_by(Lesson.order)
        .all()
    )

    # Convert lessons to response format
    lesson_responses = [
        LessonResponse(
            id=str(lesson.id),
            module_id=str(lesson.module_id),
            title=lesson.title,
            description=lesson.description,
            content_type=lesson.content_type,
            content_url=lesson.content_url,
            content_text=lesson.content_text,
            order=lesson.order,
            duration_minutes=lesson.duration_minutes,
            difficulty=lesson.difficulty,
            tags=lesson.tags
        )
        for lesson in lessons
    ]

    return ModuleWithLessonsResponse(
        id=str(module.id),
        title=module.title,
        description=module.description,
        skill_level=module.skill_level,
        category=module.category,
        order=module.order,
        icon=module.icon,
        estimated_hours=module.estimated_hours,
        prerequisites=module.prerequisites,
        learning_objectives=module.learning_objectives,
        lessons=lesson_responses
    )


@router.get("/recommendations", response_model=dict)
async def get_recommendations(
    db: Session = Depends(get_db),
    user_id: str = Depends(validate_session),
):
    """
    Get personalized learning recommendations based on user profile.

    Returns suggested modules and next steps tailored to the user.
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Get all modules for user's skill level and background
    modules = (
        db.query(LearningModule)
        .filter(
            LearningModule.skill_level == profile.skill_level,
            LearningModule.is_published == True,
            sa_or(
                profile.background_category == any_(LearningModule.target_background),
                'both' == any_(LearningModule.target_background)
            )
        )
        .order_by(LearningModule.order)
        .all()
    )

    # Personalized recommendations based on questionnaire responses
    recommendations = {
        "skill_level": profile.skill_level,
        "welcome_message": f"Welcome! Based on your experience, we've curated {profile.skill_level}-level content for you.",
        "total_modules": len(modules),
        "estimated_total_hours": sum(m.estimated_hours or 0 for m in modules),
        "suggested_start": None,
        "learning_path": [],
        "quick_wins": []
    }

    if modules:
        # Suggest starting module
        first_module = modules[0]
        recommendations["suggested_start"] = {
            "id": str(first_module.id),
            "title": first_module.title,
            "description": first_module.description,
            "icon": first_module.icon,
            "estimated_hours": first_module.estimated_hours
        }

        # Create learning path
        recommendations["learning_path"] = [
            {
                "order": m.order,
                "title": m.title,
                "category": m.category,
                "icon": m.icon
            }
            for m in modules[:5]  # First 5 modules
        ]

        # Quick wins - shorter lessons
        quick_modules = [m for m in modules if (m.estimated_hours or 999) <= 20][:3]
        recommendations["quick_wins"] = [
            {
                "id": str(m.id),
                "title": m.title,
                "estimated_hours": m.estimated_hours,
                "icon": m.icon
            }
            for m in quick_modules
        ]

    return recommendations
