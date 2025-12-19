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

from .base import Base, AccountType, account_type_enum

if TYPE_CHECKING:
    from .store import Store
    from .transaction import Transaction
    from .expense import Expense


class GeneralLedgerEntry(Base):
    __tablename__ = "general_ledger_entries"

    entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )

    account_type: Mapped[AccountType] = mapped_column(account_type_enum, nullable=False)

    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.transaction_id", ondelete="CASCADE"),
        nullable=True,
    )
    expense_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("expenses.expense_id", ondelete="CASCADE"),
        nullable=True,
    )

    entry_date: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)

    debit_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))
    credit_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, server_default=text("0"))

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="ledger_entries")
    transaction: Mapped["Transaction | None"] = relationship("Transaction", back_populates="ledger_entries")
    expense: Mapped["Expense | None"] = relationship("Expense", back_populates="ledger_entries")

    __table_args__ = (
        CheckConstraint("debit_amount >= 0", name="ledger_debit_check"),
        CheckConstraint("credit_amount >= 0", name="ledger_credit_check"),
        CheckConstraint(
            "(debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0)",
            name="check_debit_or_credit",
        ),
        Index("idx_ledger_store_id", "store_id"),
        Index("idx_ledger_transaction_id", "transaction_id"),
        Index("idx_ledger_expense_id", "expense_id"),
        Index("idx_ledger_entry_date", "entry_date"),
        Index("idx_ledger_account_type", "account_type"),
    )
