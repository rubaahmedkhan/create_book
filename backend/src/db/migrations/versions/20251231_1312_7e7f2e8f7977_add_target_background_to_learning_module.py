"""add_target_background_to_learning_module

Revision ID: 7e7f2e8f7977
Revises: 4a6120444e0c
Create Date: 2025-12-31 13:12:28.167536

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e7f2e8f7977'
down_revision: Union[str, None] = '4a6120444e0c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add target_background array column with default value
    op.add_column('learning_module', sa.Column('target_background', sa.ARRAY(sa.String()), nullable=False, server_default="{'both'}"))


def downgrade() -> None:
    # Drop the target_background column
    op.drop_column('learning_module', 'target_background')
