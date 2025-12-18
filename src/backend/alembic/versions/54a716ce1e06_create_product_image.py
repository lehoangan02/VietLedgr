"""create product_image

Revision ID: 54a716ce1e06
Revises: 23b5443df090
Create Date: 2025-12-17 09:27:10.559702

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54a716ce1e06'
down_revision: Union[str, Sequence[str], None] = '23b5443df090'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the retail_category enum type
    op.execute("""
        CREATE TYPE retailcategory AS ENUM (
            'FOOD',
            'HOUSEHOLD',
            'STATIONERY',
            'OTHERS'
        )
    """)
    
    # Add retail_category column to products table using the enum type
    op.execute("""
        ALTER TABLE products 
        ADD COLUMN retail_category retailcategory NOT NULL DEFAULT 'OTHERS'
    """)
    
    # Add image_base64 column to products table
    op.add_column('products', sa.Column('image_base64', sa.Text(), nullable=True))
    
    # Remove server_default after populating existing rows
    op.execute("ALTER TABLE products ALTER COLUMN retail_category DROP DEFAULT")


def downgrade() -> None:
    """Downgrade schema."""
    # Remove columns from products table
    op.drop_column('products', 'image_base64')
    op.drop_column('products', 'retail_category')
    
    # Drop the enum type
    op.execute('DROP TYPE retailcategory')
