"""add suppliers and supplier_id to batches

Revision ID: 7a0445c34ef6
Revises: 54a716ce1e06
Create Date: 2026-01-04 10:46:08.328844
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "7a0445c34ef6"
down_revision: Union[str, Sequence[str], None] = "54a716ce1e06"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1) suppliers table
    op.create_table(
        "suppliers",
        sa.Column(
            "id",
            sa.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("avatar_url", sa.String(length=1024), nullable=True),
        sa.Column("contact_name", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )

    # 2) add supplier_id to batches
    op.add_column(
        "batches", sa.Column("supplier_id", sa.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        "fk_batches_supplier_id_suppliers",
        "batches",
        "suppliers",
        ["supplier_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("idx_batches_supplier_id", "batches", ["supplier_id"])

    # 3) backfill: create suppliers from distinct supplier_name in batches
    op.execute(
        """
        INSERT INTO suppliers (name)
        SELECT DISTINCT supplier_name
        FROM batches
        WHERE supplier_name IS NOT NULL AND supplier_name <> ''
        ON CONFLICT (name) DO NOTHING;
    """
    )

    # 4) backfill: set batches.supplier_id based on name match
    op.execute(
        """
        UPDATE batches b
        SET supplier_id = s.id
        FROM suppliers s
        WHERE b.supplier_name = s.name
          AND (b.supplier_name IS NOT NULL AND b.supplier_name <> '');
    """
    )

    # 5) drop old supplier_name column (after backfill)
    op.drop_column("batches", "supplier_name")


def downgrade():
    # restore supplier_name column (so older code still works after downgrade)
    op.add_column(
        "batches", sa.Column("supplier_name", sa.String(length=255), nullable=True)
    )

    # best-effort backfill supplier_name from supplier_id
    op.execute(
        """
        UPDATE batches b
        SET supplier_name = s.name
        FROM suppliers s
        WHERE b.supplier_id = s.id;
    """
    )

    op.drop_index("idx_batches_supplier_id", table_name="batches")
    op.drop_constraint(
        "fk_batches_supplier_id_suppliers", "batches", type_="foreignkey"
    )
    op.drop_column("batches", "supplier_id")
    op.drop_table("suppliers")
