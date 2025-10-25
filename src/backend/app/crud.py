from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from . import models
from .core.security import get_password_hash
import uuid

def create_user(db: Session, *, username: str, password: str, type: models.UserType) -> models.User:
    """
    Create a new user in the database
    """
    db_user = models.User(
        username=username,
        password_hash=get_password_hash(password),
        type=type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(
    db: Session, 
    *, 
    user_id: uuid.UUID, 
    user_in: Dict[str, Any]
) -> Optional[models.User]:
    """
    Update user details
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    # Update user attributes
    for field, value in user_in.items():
        if field == "password":
            setattr(db_user, "password_hash", get_password_hash(value))
        elif hasattr(db_user, field):
            setattr(db_user, field, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """
    Get a user by username
    """
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[models.User]:
    """
    Get a user by ID
    """
    return db.query(models.User).filter(models.User.id == user_id).first()