from __future__ import annotations
import uuid
from datetime import datetime
from typing import Final

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.invite_codes import generate_invite_code, hash_invite_code, digest_invite_code
from app.models import InviteCode, Role

def create_invite_code(
  *,
  db: Session,
  creator_user_id: uuid.UUID,
  target_role_id: uuid.UUID,
  store_id: uuid.UUID
) -> tuple[InviteCode, str]:
  code_plain = generate_invite_code()
  code_digest = digest_invite_code(code_plain)
  code_hash = hash_invite_code(code_plain)
  
  inv = InviteCode(
    code_digest=code_digest,
    code_hash=code_hash,
    store_id=store_id,
    role_id=target_role_id,
    created_by_user_id=creator_user_id
  )
  db.add(inv)
  db.commit()
  db.refresh(inv)
  return inv, code_plain

def consume_invite_code(
  *,
  db: Session,
  code: str,
) -> InviteCode:
  digest = digest_invite_code(code)
  
  stmt = (
    select(InviteCode)
    .where(InviteCode.code_digest == digest)
    .with_for_update()
  )
  
  inv = db.execute(stmt).scalar_one_or_none()
  
  if inv is None:
    raise ValueError("Invalid invite code")

  if inv.used_at is not None:
    raise ValueError("Invite code already used")
  
  if not (code, inv.code_hash):
    raise ValueError("Invalid invite code")
  
  inv.used_at = datetime.utcnow()
  
  try:
    db.commit()
    db.refresh(inv)
  except Exception:
    db.rollback()
    raise
  
  return inv

def get_unused_invite_by_code(db: Session, *, code_plain: str) -> InviteCode | None:
  dig = digest_invite_code(code_plain)
  stmt = select(InviteCode).where(
    InviteCode.code_digest == dig,
    InviteCode.used_at.is_(None),
  )
  return db.execute(stmt).scalar_one_or_none()

def list_invite_codes_for_store(
  *,
  db: Session,
  store_id : uuid.UUID,
  include_used: bool = False,
  limit: int = 50,
  offset: int = 0,
) -> list[InviteCode]:
  stmt = select(InviteCode).where(InviteCode.store_id == store_id)
  if not include_used:
    stmt = stmt.where(InviteCode.used_at.is_(None))
  stmt = stmt.order_by(InviteCode.created_at.desc()).limit(limit).offset(offset)
  return list(db.execute(stmt).scalars().all())


def list_invite_codes_for_creator(
  *,
  db: Session,
  creator_user_id: uuid.UUID,
  include_used: bool = False,
  limit: int = 50,
  offset: int = 0,
) -> list[InviteCode]:
  """List invite codes created by a specific user.

  This is useful for showing a user all codes they have created,
  regardless of which store the code targets.
  """

  stmt = select(InviteCode).where(InviteCode.created_by_user_id == creator_user_id)
  if not include_used:
    stmt = stmt.where(InviteCode.used_at.is_(None))
  stmt = stmt.order_by(InviteCode.created_at.desc()).limit(limit).offset(offset)
  return list(db.execute(stmt).scalars().all())


def list_all_invite_codes(
  *,
  db: Session,
  include_used: bool = True,
  limit: int = 50,
  offset: int = 0,
) -> list[InviteCode]:
  """List invite codes for all stores (admin use only)."""

  stmt = select(InviteCode)
  if not include_used:
    stmt = stmt.where(InviteCode.used_at.is_(None))
  stmt = stmt.order_by(InviteCode.created_at.desc()).limit(limit).offset(offset)
  return list(db.execute(stmt).scalars().all())


def get_role_by_id(db: Session, role_id: uuid.UUID) -> Role | None:
  return db.get(Role, role_id)