import uuid
from datetime import datetime
from sqlalchemy import UUID, TIMESTAMP, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .user import User
    from .product import Product
    from .warehouse import Warehouse
    from .transaction import Transaction
    from .expense import Expense
    from .ledger import GeneralLedgerEntry


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(100), nullable=True)

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

    users: Mapped[list["User"]] = relationship("User", back_populates="store")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="store")
    warehouses: Mapped[list["Warehouse"]] = relationship("Warehouse", back_populates="store")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="store")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="store")
    ledger_entries: Mapped[list["GeneralLedgerEntry"]] = relationship(
        "GeneralLedgerEntry", back_populates="store"
    )
