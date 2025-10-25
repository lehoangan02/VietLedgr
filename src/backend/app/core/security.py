from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.core.config import settings
from typing import Any
import jwt

# --- Password Hashing (Using Argon2) ---

# 1. Use "argon2" as the default scheme.
# Argon2 is the modern, recommended standard for password hashing.
# It won a password-hashing competition and has no password length
# limitations like bcrypt's 72-byte issue.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# --- JWT Token Configuration ---
ALGORITHM = "HS256"
# Your access token expiry (8 days)
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8


def get_password_hash(password: str) -> str:
    """
    Hashes the password using Argon2.
    """
    # Hash the full, untruncated password
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies the plain password against the hashed password using Argon2.
    """
    return pwd_context.verify(plain_password, hashed_password)


# --- JWT Token Creation (Unchanged) ---
# This part of your code was already correct and did not need modification.

def create_access_token(*, subject: str, expires_delta: timedelta | None = None) -> str:
    """
    Creates a new JWT access token.
    """
    to_encode: dict[str, Any] = {"sub": subject}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Ensure settings.SECRET_KEY is a string
    secret_key = str(settings.SECRET_KEY)
    
    return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)