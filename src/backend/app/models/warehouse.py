import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (TIMESTAMP, UUID, CheckConstraint, ForeignKey, Index,
                        Integer, Numeric, String, Text, text)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .product import Product
    from .store import Store
    from .supplier import Supplier
    from .transaction import TransactionItem


class Warehouse(Base):
    __tablename__ = "warehouses"

    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="warehouses")
    batches: Mapped[list["Batch"]] = relationship("Batch", back_populates="warehouse")


class Batch(Base):
    __tablename__ = "batches"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
    )
    warehouse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("warehouses.warehouse_id", ondelete="CASCADE"),
        nullable=False,
    )

    stock: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("0")
    )
    cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    sale_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    import_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    expire_date: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

    supplier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("suppliers.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="batches")
    product: Mapped["Product"] = relationship("Product", back_populates="batches")
    warehouse: Mapped["Warehouse"] = relationship("Warehouse", back_populates="batches")
    transaction_items: Mapped[list["TransactionItem"]] = relationship(
        "TransactionItem", back_populates="batch"
    )

    @property
    def supplier_name(self) -> str | None:
        return self.supplier.name if self.supplier else None

    __table_args__ = (
        CheckConstraint("stock >= 0", name="batches_stock_check"),
        CheckConstraint("cost >= 0", name="batches_cost_check"),
        CheckConstraint("sale_price >= 0", name="batches_sale_price_check"),
        Index("idx_batches_product_id", "product_id"),
        Index("idx_batches_warehouse_id", "warehouse_id"),
        Index("idx_batches_expire_date", "expire_date"),
        Index("idx_batches_stock", "stock", postgresql_where=text("stock > 0")),
    )
