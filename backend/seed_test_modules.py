"""
Seed test learning modules with different target backgrounds.

This script creates sample modules to test the personalization feature.
"""

import asyncio
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

from src.models.learning_content import LearningModule
from src.db.database import Base

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def seed_modules():
    """Create test modules with different target backgrounds."""
    db = SessionLocal()

    try:
        # Clear existing test modules
        db.query(LearningModule).filter(LearningModule.title.like('%[TEST]%')).delete()
        db.commit()

        modules = [
            # Hardware-focused modules
            LearningModule(
                id=uuid4(),
                title="[TEST] Circuit Design for Robotics",
                description="Learn electronics and circuit design for building robots. Covers sensors, actuators, and microcontrollers.",
                skill_level="beginner",
                category="hardware",
                target_background=["hardware"],
                order=1,
                icon="⚡",
                estimated_hours=20,
                prerequisites=[],
                learning_objectives=[
                    "Understand basic electronics",
                    "Design simple circuits",
                    "Work with sensors and actuators"
                ],
                is_published=True
            ),
            LearningModule(
                id=uuid4(),
                title="[TEST] ROS2 Hardware Integration",
                description="Integrate hardware components with ROS2. Perfect for hardware engineers learning robotics software.",
                skill_level="intermediate",
                category="ros2",
                target_background=["hardware"],
                order=2,
                icon="🔌",
                estimated_hours=25,
                prerequisites=["Basic electronics"],
                learning_objectives=[
                    "Connect hardware to ROS2",
                    "Write hardware drivers",
                    "Debug hardware interfaces"
                ],
                is_published=True
            ),

            # Software-focused modules
            LearningModule(
                id=uuid4(),
                title="[TEST] Deep Learning with PyTorch",
                description="Master deep learning using PyTorch for robotics applications. Ideal for software engineers.",
                skill_level="beginner",
                category="aiml",
                target_background=["software"],
                order=1,
                icon="🧠",
                estimated_hours=30,
                prerequisites=[],
                learning_objectives=[
                    "Understand neural networks",
                    "Build models with PyTorch",
                    "Train on robotics datasets"
                ],
                is_published=True
            ),
            LearningModule(
                id=uuid4(),
                title="[TEST] Vision Language Actions (VLA)",
                description="Build vision-language-action models for robotic manipulation. Advanced AI/ML topic.",
                skill_level="advanced",
                category="aiml",
                target_background=["software"],
                order=2,
                icon="👁️",
                estimated_hours=40,
                prerequisites=["Deep learning basics"],
                learning_objectives=[
                    "Understand VLA architecture",
                    "Implement vision-language models",
                    "Deploy on real robots"
                ],
                is_published=True
            ),

            # Modules for both backgrounds
            LearningModule(
                id=uuid4(),
                title="[TEST] Introduction to Robotics",
                description="Foundational robotics concepts for all learners. Covers both hardware and software basics.",
                skill_level="beginner",
                category="foundations",
                target_background=["both"],
                order=0,
                icon="🤖",
                estimated_hours=15,
                prerequisites=[],
                learning_objectives=[
                    "Understand robotics fundamentals",
                    "Learn basic terminology",
                    "Explore career paths"
                ],
                is_published=True
            ),
            LearningModule(
                id=uuid4(),
                title="[TEST] ROS2 Fundamentals",
                description="Learn ROS2 from scratch. Essential for both hardware and software engineers in robotics.",
                skill_level="intermediate",
                category="ros2",
                target_background=["both"],
                order=1,
                icon="🚀",
                estimated_hours=35,
                prerequisites=["Basic programming"],
                learning_objectives=[
                    "Master ROS2 concepts",
                    "Build ROS2 nodes",
                    "Create robotics applications"
                ],
                is_published=True
            ),
        ]

        # Add all modules
        for module in modules:
            db.add(module)

        db.commit()

        print("SUCCESS: Successfully seeded test modules:")
        print(f"   - {len([m for m in modules if 'hardware' in m.target_background and 'both' not in m.target_background])} hardware-focused modules")
        print(f"   - {len([m for m in modules if 'software' in m.target_background and 'both' not in m.target_background])} software-focused modules")
        print(f"   - {len([m for m in modules if 'both' in m.target_background])} modules for both backgrounds")
        print(f"   - Total: {len(modules)} modules")

        # Print summary
        print("\nModules by background:")
        for module in modules:
            backgrounds = ", ".join(module.target_background)
            print(f"   [{module.skill_level:12}] [{backgrounds:15}] {module.title}")

    except Exception as e:
        db.rollback()
        print(f"ERROR: Error seeding modules: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding test learning modules...")
    seed_modules()
