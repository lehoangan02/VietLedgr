import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.expense import ExpenseCRUD
from app.models import User
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseDetailResponse,
    ExpenseListResponse,
)

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
)


@router.post("/", response_model=ExpenseResponse, status_code=201)
def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Record a new business expense.

    - **description**: Expense description
    - **amount**: Expense amount (must be > 0)
    - **expense_date**: Date of expense (defaults to now)
    """
    try:
        # Verify user belongs to the store
        if current_user.store_id != expense.store_id:
            raise HTTPException(
                status_code=403,
                detail="User does not have access to this store",
            )

        created_expense = ExpenseCRUD.create_expense(
            db=db,
            expense=expense,
            user_id=current_user.user_id,
        )

        return created_expense
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{expense_id}", response_model=ExpenseDetailResponse)
def get_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get expense details by ID"""
    expense = ExpenseCRUD.get_expense(db, expense_id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Verify user has access to this store
    if current_user.store_id != expense.store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this expense",
        )

    return expense


@router.get("/", response_model=ExpenseListResponse)
def list_expenses(
    store_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get paginated list of expenses for a store.

    - **page**: Page number (starting from 1)
    - **page_size**: Number of items per page (1-100)
    """
    # Verify user has access to this store
    if current_user.store_id != store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this store",
        )

    skip = (page - 1) * page_size
    expenses, total = ExpenseCRUD.get_expenses(
        db=db,
        store_id=store_id,
        skip=skip,
        limit=page_size,
    )

    total_pages = (total + page_size - 1) // page_size

    return ExpenseListResponse(
        items=expenses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: uuid.UUID,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an expense"""
    expense = ExpenseCRUD.get_expense(db, expense_id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Verify user has access
    if current_user.store_id != expense.store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this expense",
        )

    try:
        updated_expense = ExpenseCRUD.update_expense(db, expense_id, expense_update)
        return updated_expense
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an expense and its ledger entries"""
    expense = ExpenseCRUD.get_expense(db, expense_id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Verify user has access
    if current_user.store_id != expense.store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this expense",
        )

    try:
        ExpenseCRUD.delete_expense(db, expense_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))