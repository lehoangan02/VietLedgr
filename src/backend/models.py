import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    UUID,
    TIMESTAMP,
    CheckConstraint,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserType(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SALER = "SALER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    type: Mapped[UserType] = mapped_column(SQLEnum(UserType, name="user_type"), nullable=False)

    stores: Mapped[list["Store"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship(back_populates="saler")


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    owner: Mapped[User] = relationship(back_populates="stores")
    products: Mapped[list["Product"]] = relationship(back_populates="store", cascade="all, delete-orphan")
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship(back_populates="store")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    pos_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)

    store: Mapped[Store] = relationship(back_populates="products")


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    __table_args__ = (
        CheckConstraint("total_sale >= 0", name="ck_total_sale_positive"),
    )

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False)
    product_items: Mapped[list] = mapped_column(JSONB, nullable=False)  # [{"product_id": str, "quantity": int, "unit_price": Decimal}, ...]
    saler_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    total_sale: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    store: Mapped[Store] = relationship(back_populates="ledger_entries")
    saler: Mapped[User] = relationship(back_populates="ledger_entries")
