"""Citation data model."""

from typing import Optional
from pydantic import BaseModel, Field


class Citation(BaseModel):
    """
    Represents a source reference in a chatbot response.

    Attributes:
        source: Formatted citation text (e.g., "Module 1, Week 1, Tutorial 01: ROS 2 Basics")
        url: URL path to exact location in published textbook
        module: Module name (e.g., "module1-ros2")
        week: Week number (e.g., "week1")
        tutorial_file: Tutorial file name (e.g., "tutorial-01-ros2-basics.md")
        section_title: Section title within the tutorial
        relevance_score: Semantic similarity score from vector search (0-1)
    """

    source: str = Field(..., description="Formatted citation text")
    url: str = Field(..., description="URL path to source location")
    module: str = Field(..., description="Module name")
    week: Optional[str] = Field(None, description="Week number")
    tutorial_file: str = Field(..., description="Tutorial file name")
    section_title: Optional[str] = Field(None, description="Section title")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Relevance score from vector search")

    model_config = {
        "json_schema_extra": {
            "example": {
                "source": "Module 1, Week 1, Tutorial 01: ROS 2 Basics - Nodes",
                "url": "/docs/module1/week1/tutorial-01-ros2-basics#nodes",
                "module": "module1-ros2",
                "week": "week1",
                "tutorial_file": "tutorial-01-ros2-basics.md",
                "section_title": "Nodes",
                "relevance_score": 0.94
            }
        }
    }
