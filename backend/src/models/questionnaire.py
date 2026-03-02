from sqlalchemy import Column, String, Boolean, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from ..db.database import Base

class QuestionnaireResponse(Base):
    __tablename__ = "questionnaire_response"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    question_id = Column(String, nullable=False)
    question_category = Column(String, nullable=False)
    response_value = Column(JSONB, nullable=False)
    is_required = Column(Boolean, nullable=False, default=False)
    answered_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    
    __table_args__ = (
        CheckConstraint("question_category IN ('software', 'hardware', 'aiml', 'goals')", name="valid_question_category"),
    )
