"""
Learning Content Models

Defines the structure for learning modules, lessons, and resources
organized by skill level.
"""

from sqlalchemy import Column, String, Integer, Text, ARRAY, Boolean, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from ..db.database import Base


class LearningModule(Base):
    """
    Learning module containing related lessons.
    Organized by skill level and topic.
    """
    __tablename__ = "learning_module"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    skill_level = Column(String, nullable=False)
    category = Column(String, nullable=False)  # ros2, simulation, hardware, aiml
    target_background = Column(ARRAY(String), nullable=False, default=['both'])  # which user backgrounds this module is for
    order = Column(Integer, nullable=False, default=0)
    icon = Column(String, nullable=True)  # emoji or icon name
    estimated_hours = Column(Integer, nullable=True)
    prerequisites = Column(ARRAY(String), nullable=False, default=[])
    learning_objectives = Column(ARRAY(String), nullable=False, default=[])
    is_published = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("skill_level IN ('beginner', 'intermediate', 'advanced')", name="module_valid_skill_level"),
        CheckConstraint("category IN ('ros2', 'simulation', 'hardware', 'aiml', 'foundations')", name="valid_category"),
    )


class Lesson(Base):
    """
    Individual lesson within a learning module.
    Contains actual learning content and resources.
    """
    __tablename__ = "lesson"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    content_type = Column(String, nullable=False)  # tutorial, video, reading, exercise, project
    content_url = Column(String, nullable=True)  # External link or internal path
    content_text = Column(Text, nullable=True)  # Markdown content
    order = Column(Integer, nullable=False, default=0)
    duration_minutes = Column(Integer, nullable=True)
    difficulty = Column(String, nullable=True)  # easy, medium, hard
    tags = Column(ARRAY(String), nullable=False, default=[])
    resources = Column(JSONB, nullable=True)  # Additional resources, links, code samples
    is_published = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("content_type IN ('tutorial', 'video', 'reading', 'exercise', 'project', 'quiz')", name="valid_content_type"),
        CheckConstraint("difficulty IN ('easy', 'medium', 'hard') OR difficulty IS NULL", name="valid_difficulty"),
    )
