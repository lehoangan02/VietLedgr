import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

from sqlalchemy import (
    UUID,
    TIMESTAMP,
    Enum as SQLEnum,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column
from .core.database import Base


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
    type: Mapped[UserType] = mapped_column(SQLEnum(UserType), nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False
    )

# Contents of JWT token
class TokenPayload(BaseModel):
    sub: str | None = None
