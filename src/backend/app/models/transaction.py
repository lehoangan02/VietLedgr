import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    UUID,
    TIMESTAMP,
    CheckConstraint,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .store import Store
    from .user import User
    from .warehouse import Batch
    from .ledger import GeneralLedgerEntry


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=False,
    )

    device_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))
    total_tax: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="transactions")
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    items: Mapped[list["TransactionItem"]] = relationship("TransactionItem", back_populates="transaction")
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship("GeneralLedgerEntry", back_populates="transaction")

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="transactions_total_amount_check"),
        CheckConstraint("total_tax >= 0", name="transactions_total_tax_check"),
        Index("idx_transactions_store_id", "store_id"),
        Index("idx_transactions_user_id", "user_id"),
        Index("idx_transactions_created_at", "created_at"),
    )


class TransactionItem(Base):
    __tablename__ = "transaction_items"

    item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.transaction_id", ondelete="CASCADE"),
        nullable=False,
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("batches.batch_id", ondelete="RESTRICT"),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price_at_sale: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    cost_at_sale: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="items")
    batch: Mapped["Batch"] = relationship("Batch", back_populates="transaction_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="transaction_items_quantity_check"),
        CheckConstraint("price_at_sale >= 0", name="transaction_items_price_check"),
        CheckConstraint("cost_at_sale >= 0", name="transaction_items_cost_check"),
        Index("idx_transaction_items_transaction_id", "transaction_id"),
        Index("idx_transaction_items_batch_id", "batch_id"),
    )
