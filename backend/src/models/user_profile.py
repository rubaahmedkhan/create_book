from sqlalchemy import Column, String, Integer, Boolean, ARRAY, TIMESTAMP, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..db.database import Base

class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, unique=True, nullable=False, index=True)

    # Background category (selected during signup)
    background_category = Column(
        String,
        nullable=False,
        default="software"
    )

    # Skill level (calculated)
    skill_level = Column(
        String,
        nullable=False,
        default="beginner"
    )

    # Software background
    software_experience_years = Column(Integer, nullable=False, default=0)
    programming_languages = Column(ARRAY(String), nullable=False, default=[])
    frameworks_used = Column(ARRAY(String), nullable=False, default=[])
    development_environments = Column(ARRAY(String), nullable=False, default=[])
    version_control_experience = Column(Boolean, nullable=False, default=False)
    software_projects_completed = Column(Integer, nullable=False, default=0)

    # Hardware background
    hardware_experience_years = Column(Integer, nullable=False, default=0)
    microcontrollers_used = Column(ARRAY(String), nullable=False, default=[])
    sensors_actuators_used = Column(ARRAY(String), nullable=False, default=[])
    circuit_design_experience = Column(Boolean, nullable=False, default=False)
    soldering_experience = Column(Boolean, nullable=False, default=False)
    hardware_projects_completed = Column(Integer, nullable=False, default=0)

    # AI/ML background
    aiml_experience_years = Column(Integer, nullable=False, default=0)
    ml_frameworks_used = Column(ARRAY(String), nullable=False, default=[])
    aiml_concepts_familiar = Column(ARRAY(String), nullable=False, default=[])
    aiml_projects_completed = Column(Integer, nullable=False, default=0)

    # Learning goals
    primary_learning_goal = Column(String, nullable=False)
    specific_topics_interested = Column(ARRAY(String), nullable=False, default=[])
    preferred_learning_pace = Column(String, nullable=False)
    time_commitment_hours_per_week = Column(Integer, nullable=False, default=0)
    project_goals = Column(ARRAY(String), nullable=False, default=[])

    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("background_category IN ('hardware', 'software', 'both')", name="valid_background_category"),
        CheckConstraint("skill_level IN ('beginner', 'intermediate', 'advanced')", name="valid_skill_level"),
        CheckConstraint("software_experience_years >= 0", name="valid_software_experience_years"),
        CheckConstraint("hardware_experience_years >= 0", name="valid_hardware_experience_years"),
        CheckConstraint("aiml_experience_years >= 0", name="valid_aiml_experience_years"),
        CheckConstraint("software_projects_completed >= 0", name="valid_software_projects"),
        CheckConstraint("hardware_projects_completed >= 0", name="valid_hardware_projects"),
        CheckConstraint("aiml_projects_completed >= 0", name="valid_aiml_projects"),
        CheckConstraint("time_commitment_hours_per_week >= 0", name="valid_time_commitment"),
    )
