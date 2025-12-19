import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import UUID, TIMESTAMP, CheckConstraint, Numeric, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .product import ProductCategory


class TaxDetail(Base):
    __tablename__ = "tax_details"

    tax_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tax_name: Mapped[str] = mapped_column(String(100), nullable=False)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    tax_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    categories: Mapped[list["ProductCategory"]] = relationship(
        "ProductCategory", back_populates="tax"
    )

    __table_args__ = (
        CheckConstraint("tax_rate >= 0 AND tax_rate <= 100", name="check_tax_rate"),
    )
