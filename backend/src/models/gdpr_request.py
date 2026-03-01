from sqlalchemy import Column, String, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..db.database import Base

class GDPRRequest(Base):
    __tablename__ = "gdpr_request"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    request_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    requested_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    processed_at = Column(TIMESTAMP, nullable=True)
    export_file_url = Column(String, nullable=True)
    deletion_scheduled_for = Column(TIMESTAMP, nullable=True)
    error_message = Column(String, nullable=True)
    
    __table_args__ = (
        CheckConstraint("request_type IN ('export', 'deletion')", name="valid_request_type"),
        CheckConstraint("status IN ('pending', 'processing', 'completed', 'failed')", name="valid_status"),
    )
