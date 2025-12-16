"""create invite_codes

Revision ID: 23b5443df090
Revises: f82edef962c3
Create Date: 2025-12-16 14:52:42.153301

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '23b5443df090'
down_revision: Union[str, Sequence[str], None] = 'f82edef962c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "invite_codes",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("code_digest", sa.String(length=64), nullable=False),
        sa.Column("code_hash", sa.Text(), nullable=False),
        sa.Column("role_id", sa.UUID(), nullable=False),
        sa.Column("store_id", sa.UUID(), nullable=False),
        sa.Column("created_by_user_id", sa.UUID(), nullable=False),
        sa.Column("used_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code_digest", name="uq_invite_codes_code_digest"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.role_id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["store_id"], ["stores.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.user_id"], ondelete="RESTRICT"),
    )
    
    op.create_index("ix_invite_codes_code_digest", "invite_codes", ["code_digest"])
    op.create_index("ix_invite_codes_store_id", "invite_codes", ["store_id"])
    op.create_index("ix_invite_codes_role_id", "invite_codes", ["role_id"])
    op.create_index("ix_invite_codes_created_by_user_id", "invite_codes", ["created_by_user_id"])
    op.create_index("ix_invite_codes_used_at", "invite_codes", ["used_at"])


def downgrade() -> None:
    op.drop_index("ix_invite_codes_used_at", table_name="invite_codes")
    op.drop_index("ix_invite_codes_created_by_user_id", table_name="invite_codes")
    op.drop_index("ix_invite_codes_role_id", table_name="invite_codes")
    op.drop_index("ix_invite_codes_store_id", table_name="invite_codes")
    op.drop_index("ix_invite_codes_code_digest", table_name="invite_codes")
    op.drop_table("invite_codes")