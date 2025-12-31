import uuid
from typing import Any, Dict, Optional

from app import models
from app.core.security import get_password_hash
from app.schemas import user as user_schemas
from sqlalchemy.orm import Session


def create_user(
    db: Session,
    user: user_schemas.UserCreate,
    store_id: uuid.UUID,
    role_id: uuid.UUID,
    *,
    commit: bool = True,
) -> models.User:
    db_user = models.User(
        username=user.username,
        password_hash=get_password_hash(user.password),
        store_id=store_id,
        role_id=role_id,
    )
    db.add(db_user)

    if commit:
        db.commit()
        db.refresh(db_user)

    return db_user


def update_user(
    db: Session, user: user_schemas.UserUpdate, user_id: uuid.UUID
) -> Optional[models.User]:
    """
    Update user details
    """
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        return None

    update_data: Dict[str, Any] = user.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "password":
            setattr(db_user, "password_hash", get_password_hash(value))
        else:
            setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """
    Get a user by username
    """
    return db.query(models.User).filter(models.User.username == username).first()


def get_role_by_username(db: Session, username: str) -> Optional[models.Role]:
    """
    Get a role by username
    """
    return (
        db.query(models.Role)
        .join(models.User)
        .filter(models.User.username == username)
        .first()
    )


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[models.User]:
    """
    Get a user by ID
    """
    return db.query(models.User).filter(models.User.user_id == user_id).first()
