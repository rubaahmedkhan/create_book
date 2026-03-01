"""add_background_category_to_user_profile

Revision ID: 4a6120444e0c
Revises: 9100c8420884
Create Date: 2025-12-31 13:08:40.847954

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a6120444e0c'
down_revision: Union[str, None] = '9100c8420884'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add background_category column with default value 'software'
    op.add_column('user_profile', sa.Column('background_category', sa.String(), nullable=False, server_default='software'))

    # Add check constraint for valid values
    op.create_check_constraint(
        'valid_background_category',
        'user_profile',
        "background_category IN ('hardware', 'software', 'both')"
    )


def downgrade() -> None:
    # Drop check constraint first
    op.drop_constraint('valid_background_category', 'user_profile', type_='check')

    # Drop the background_category column
    op.drop_column('user_profile', 'background_category')
