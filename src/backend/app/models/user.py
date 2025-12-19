import uuid
from datetime import datetime
from sqlalchemy import UUID, TIMESTAMP, ForeignKey, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .store import Store
    from .role import Role
    from .transaction import Transaction
    from .expense import Expense


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)

    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.role_id", ondelete="RESTRICT"),
        nullable=False,
    )

    last_login: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store: Mapped["Store"] = relationship("Store", back_populates="users")
    role: Mapped["Role"] = relationship("Role", back_populates="users")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="user")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="user")

    __table_args__ = (
        Index("idx_users_username", "username"),
        Index("idx_users_store_id", "store_id"),
        Index("idx_users_role_id", "role_id"),
    )
