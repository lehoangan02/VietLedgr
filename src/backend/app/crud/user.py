from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from app import models
from ..core.security import get_password_hash
from app.schemas import user as user_schemas
import uuid
from datetime import datetime

def create_user(
    db: Session, 
    user: user_schemas.UserCreate
) -> models.User:
    """
    Create a new user in the database
    """
    db_user = models.User(
        username=user.username,
        password_hash=get_password_hash(user.password),
        type=user.user_type,
        store_id=user.store_id,
        role_id=user.role_id,
        last_login=datetime.utcnow() if user.last_login is None else user.last_login
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(
    db: Session, 
    user: user_schemas.UserUpdate,
    user_id: uuid.UUID
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

def get_user_by_username(
    db: Session, 
    username: str
) -> Optional[models.User]:
    """
    Get a user by username
    """
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(
    db: Session, 
    user_id: uuid.UUID
) -> Optional[models.User]:
    """
    Get a user by ID
    """
    return db.query(models.User).filter(models.User.user_id == user_id).first()