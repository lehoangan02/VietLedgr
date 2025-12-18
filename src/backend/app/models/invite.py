import uuid
from datetime import datetime
from sqlalchemy import UUID, TIMESTAMP, ForeignKey, Index, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from .base import Base

if TYPE_CHECKING:
    from .role import Role
    from .store import Store
    from .user import User


class InviteCode(Base):
    __tablename__ = "invite_codes"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    
    code_digest: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    code_hash: Mapped[str] = mapped_column(Text, nullable=False)
    
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.role_id", ondelete="RESTRICT"),
        nullable=False,
    )
    
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="RESTRICT"),
        nullable=False,
    )
    
    used_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    
    role: Mapped["Role"] = relationship("Role")
    store: Mapped["Store"] = relationship("Store")
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_user_id])
    
    __table_args__ = (
        Index("ix_invite_codes_code_digest", "code_digest"),
        Index("ix_invite_codes_store_id", "store_id"),
        Index("ix_invite_codes_role_id", "role_id"),
        Index("ix_invite_codes_created_by_user_id", "created_by_user_id"),
        Index("ix_invite_codes_used_at", "used_at"),
    )
