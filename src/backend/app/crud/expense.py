import uuid
from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app import models
from app.schemas import expense as schemas
from app.services.accounting import AccountingService


class ExpenseCRUD:
    """CRUD operations for expenses"""

    @staticmethod
    def create_expense(
        db: Session,
        expense: schemas.ExpenseCreate,
        user_id: uuid.UUID,
    ) -> models.Expense:
        """Create a new expense and generate ledger entries"""
        try:
            # Create expense record
            new_expense = models.Expense(
                store_id=expense.store_id,
                user_id=user_id,
                description=expense.description,
                amount=expense.amount,
                expense_date=expense.expense_date or datetime.utcnow(),
            )
            db.add(new_expense)
            db.flush()

            # Create ledger entries
            AccountingService.create_ledger_entry_from_expense(db, new_expense)

            db.commit()
            db.refresh(new_expense)
            return new_expense

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_expense(
        db: Session,
        expense_id: uuid.UUID,
    ) -> Optional[models.Expense]:
        """Get a single expense by ID"""
        return db.query(models.Expense).filter(
            models.Expense.expense_id == expense_id
        ).first()

    @staticmethod
    def get_expenses(
        db: Session,
        store_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[list[models.Expense], int]:
        """Get paginated expenses for a store"""
        query = db.query(models.Expense).filter(
            models.Expense.store_id == store_id
        ).order_by(models.Expense.created_at.desc())

        total = query.count()
        expenses = query.offset(skip).limit(limit).all()

        return expenses, total

    @staticmethod
    def update_expense(
        db: Session,
        expense_id: uuid.UUID,
        expense_update: schemas.ExpenseUpdate,
    ) -> Optional[models.Expense]:
        """Update an expense"""
        expense = db.query(models.Expense).filter(
            models.Expense.expense_id == expense_id
        ).first()

        if not expense:
            raise ValueError(f"Expense {expense_id} not found")

        update_data = expense_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(expense, field, value)

        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def delete_expense(
        db: Session,
        expense_id: uuid.UUID,
    ) -> models.Expense:
        """Delete an expense and its ledger entries"""
        try:
            expense = db.query(models.Expense).filter(
                models.Expense.expense_id == expense_id
            ).first()

            if not expense:
                raise ValueError(f"Expense {expense_id} not found")

            # Delete associated ledger entries (cascade)
            db.query(models.GeneralLedgerEntry).filter(
                models.GeneralLedgerEntry.expense_id == expense_id
            ).delete()

            # Delete expense
            db.delete(expense)
            db.commit()

            return expense

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_expense_summary(
        db: Session,
        store_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
    ) -> dict:
        """Get expense summary for a date range"""
        query = db.query(models.Expense).filter(
            and_(
                models.Expense.store_id == store_id,
                models.Expense.expense_date >= start_date,
                models.Expense.expense_date <= end_date,
            )
        )

        total_amount = db.query(
            func.sum(models.Expense.amount)
        ).filter(
            and_(
                models.Expense.store_id == store_id,
                models.Expense.expense_date >= start_date,
                models.Expense.expense_date <= end_date,
            )
        ).scalar() or 0

        return {
            "total_expenses": query.count(),
            "total_amount": total_amount,
            "average_expense": total_amount / max(query.count(), 1),
            "start_date": start_date,
            "end_date": end_date,
        }