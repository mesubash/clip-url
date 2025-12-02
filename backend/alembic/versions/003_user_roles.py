"""Add role and is_active to users

Revision ID: 003_user_roles
Revises: 002_email_oauth
Create Date: 2025-12-02
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_user_roles'
down_revision: Union[str, None] = '002_email_oauth'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add role column
    op.add_column('users', sa.Column('role', sa.String(20), nullable=True))
    
    # Add is_active column
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True))
    
    # Set default values for existing rows
    op.execute("UPDATE users SET role = 'user' WHERE role IS NULL")
    op.execute("UPDATE users SET is_active = true WHERE is_active IS NULL")
    
    # Make columns not nullable
    op.alter_column('users', 'role', nullable=False, server_default='user')
    op.alter_column('users', 'is_active', nullable=False, server_default='true')


def downgrade() -> None:
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'role')
