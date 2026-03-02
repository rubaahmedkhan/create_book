"""
Skill Level Calculator Service

Calculates user skill level (beginner/intermediate/advanced) based on
questionnaire responses using a weighted scoring algorithm.
"""

from typing import Literal

SkillLevel = Literal["beginner", "intermediate", "advanced"]


def calculate_skill_level(
    software_experience_years: int,
    programming_languages: list[str],
    frameworks_used: list[str],
    version_control_experience: bool,
    software_projects_completed: int,
    hardware_experience_years: int,
    microcontrollers_used: list[str],
    circuit_design_experience: bool,
    hardware_projects_completed: int,
    aiml_experience_years: int,
    ml_frameworks_used: list[str],
    aiml_concepts_familiar: list[str],
    aiml_projects_completed: int,
) -> SkillLevel:
    """
    Calculate skill level based on user background.

    Scoring algorithm:
    - Software experience: 0-40 points
    - Hardware experience: 0-30 points
    - AI/ML experience: 0-30 points
    - Total: 0-100 points

    Thresholds:
    - Beginner: 0-35 points
    - Intermediate: 36-70 points
    - Advanced: 71-100 points
    """
    score = 0

    # Software experience scoring (0-40 points)
    score += min(software_experience_years * 3, 15)  # Max 15 points for years
    score += min(len(programming_languages) * 2, 10)  # Max 10 points for languages
    score += min(len(frameworks_used), 5)  # Max 5 points for frameworks
    if version_control_experience:
        score += 3
    score += min(software_projects_completed, 7)  # Max 7 points for projects

    # Hardware experience scoring (0-30 points)
    score += min(hardware_experience_years * 3, 12)  # Max 12 points for years
    score += min(len(microcontrollers_used), 8)  # Max 8 points for microcontrollers
    if circuit_design_experience:
        score += 4
    score += min(hardware_projects_completed, 6)  # Max 6 points for projects

    # AI/ML experience scoring (0-30 points)
    score += min(aiml_experience_years * 3, 12)  # Max 12 points for years
    score += min(len(ml_frameworks_used) * 2, 8)  # Max 8 points for frameworks
    score += min(len(aiml_concepts_familiar), 10)  # Max 10 points for concepts

    # Determine skill level based on total score
    if score <= 35:
        return "beginner"
    elif score <= 70:
        return "intermediate"
    else:
        return "advanced"


def get_skill_level_description(skill_level: SkillLevel) -> str:
    """Get human-readable description of skill level."""
    descriptions = {
        "beginner": "You're new to robotics and AI. We'll start with the fundamentals and build up gradually.",
        "intermediate": "You have some experience. We'll focus on deepening your knowledge and practical skills.",
        "advanced": "You're experienced in this domain. We'll explore advanced topics and cutting-edge techniques.",
    }
    return descriptions[skill_level]
