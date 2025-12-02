"""Add email verification and OAuth fields to users

Revision ID: 002_email_oauth
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_email_oauth'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add email verification fields
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('users', sa.Column('verification_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('verification_token_expires', sa.DateTime(timezone=True), nullable=True))
    
    # Add password reset fields
    op.add_column('users', sa.Column('reset_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(timezone=True), nullable=True))
    
    # Add OAuth fields
    op.add_column('users', sa.Column('oauth_provider', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('oauth_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(length=500), nullable=True))
    
    # Make password_hash nullable (for OAuth users)
    op.alter_column('users', 'password_hash',
                    existing_type=sa.String(length=255),
                    nullable=True)
    
    # Create index for OAuth lookups
    op.create_index('ix_users_oauth', 'users', ['oauth_provider', 'oauth_id'], unique=False)
    
    # Create index for verification token lookups
    op.create_index('ix_users_verification_token', 'users', ['verification_token'], unique=False)
    
    # Create index for reset token lookups
    op.create_index('ix_users_reset_token', 'users', ['reset_token'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_users_reset_token', table_name='users')
    op.drop_index('ix_users_verification_token', table_name='users')
    op.drop_index('ix_users_oauth', table_name='users')
    
    # Make password_hash non-nullable again
    op.alter_column('users', 'password_hash',
                    existing_type=sa.String(length=255),
                    nullable=False)
    
    # Drop OAuth columns
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'oauth_id')
    op.drop_column('users', 'oauth_provider')
    
    # Drop password reset columns
    op.drop_column('users', 'reset_token_expires')
    op.drop_column('users', 'reset_token')
    
    # Drop email verification columns
    op.drop_column('users', 'verification_token_expires')
    op.drop_column('users', 'verification_token')
    op.drop_column('users', 'is_verified')
