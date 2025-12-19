import base64
import hashlib
import secrets

from app.core.security import get_password_hash, verify_password

def generate_invite_code() -> str:
  code = base64.urlsafe_b64encode(secrets.token_bytes(6)).decode("ascii")
  code = code.strip("=")
  if len(code) != 8:
    return generate_invite_code()
  return code

def digest_invite_code(code_plain: str) -> str:
  return hashlib.sha256(code_plain.encode("utf-8")).hexdigest()

def hash_invite_code(code_plain: str) -> str:
  return get_password_hash(code_plain)

def verify_invite_code(code_plain: str, code_hash: str) -> bool:
  return verify_password(code_plain, code_hash)