import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    UUID,
    TIMESTAMP,
    CheckConstraint,
    ForeignKey,
    Index,
    Numeric,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .store import Store
    from .user import User
    from .ledger import GeneralLedgerEntry


class Expense(Base):
    __tablename__ = "expenses"

    expense_id: Mapped[uuid.UUID] = mapped_column(
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

    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    expense_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="expenses")
    user: Mapped["User"] = relationship("User", back_populates="expenses")
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship("GeneralLedgerEntry", back_populates="expense")

    __table_args__ = (
        CheckConstraint("amount >= 0", name="expenses_amount_check"),
        Index("idx_expenses_store_id", "store_id"),
        Index("idx_expenses_user_id", "user_id"),
        Index("idx_expenses_expense_date", "expense_date"),
    )
