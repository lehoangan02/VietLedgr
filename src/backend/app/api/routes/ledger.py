import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app import models
from app.api.deps import get_current_user, get_db
from app.services.accounting import AccountingService
from app.schemas.expense import (
    LedgerEntryListResponse,
    TrialBalanceResponse,
    IncomeStatementResponse,
    BalanceSheetResponse,
)

router = APIRouter(
    prefix="/ledger",
    tags=["ledger"],
)


@router.get("/entries", response_model=LedgerEntryListResponse)
def get_ledger_entries(
    store_id: uuid.UUID,
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    account_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get general ledger entries with optional filtering.

    - **start_date**: Filter by entry date (optional)
    - **end_date**: Filter by entry date (optional)
    - **account_type**: Filter by account type (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
    """
    # Verify access
    if current_user.store_id != store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this store",
        )

    query = db.query(models.GeneralLedgerEntry).filter(
        models.GeneralLedgerEntry.store_id == store_id
    )

    if start_date:
        query = query.filter(models.GeneralLedgerEntry.entry_date >= start_date)
    if end_date:
        query = query.filter(models.GeneralLedgerEntry.entry_date <= end_date)
    if account_type:
        query = query.filter(models.GeneralLedgerEntry.account_type == account_type)

    total = query.count()
    skip = (page - 1) * page_size
    entries = query.order_by(models.GeneralLedgerEntry.entry_date.desc()).offset(
        skip
    ).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return LedgerEntryListResponse(
        items=entries,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/trial-balance", response_model=TrialBalanceResponse)
def get_trial_balance(
    store_id: uuid.UUID,
    as_of_date: datetime | None = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get trial balance report.

    The trial balance shows total debits and credits by account type.
    Debits should equal credits if all entries are balanced.
    """
    # Verify access
    if current_user.store_id != store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this store",
        )

    try:
        trial_balance = AccountingService.get_trial_balance(
            db=db,
            store_id=store_id,
            as_of_date=as_of_date,
        )
        return trial_balance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/income-statement", response_model=IncomeStatementResponse)
def get_income_statement(
    store_id: uuid.UUID,
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get Profit & Loss (Income Statement) report.

    Shows revenue, COGS, gross profit, expenses, and net income for a period.
    """
    # Verify access
    if current_user.store_id != store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this store",
        )

    # Default: last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    try:
        income_statement = AccountingService.get_income_statement(
            db=db,
            store_id=store_id,
            start_date=start_date,
            end_date=end_date,
        )
        return income_statement
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/balance-sheet", response_model=BalanceSheetResponse)
def get_balance_sheet(
    store_id: uuid.UUID,
    as_of_date: datetime | None = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get Balance Sheet report.

    Shows assets, liabilities, and equity as of a specific date.
    Assets should equal Liabilities + Equity.
    """
    # Verify access
    if current_user.store_id != store_id:
        raise HTTPException(
            status_code=403,
            detail="User does not have access to this store",
        )

    try:
        balance_sheet = AccountingService.get_balance_sheet(
            db=db,
            store_id=store_id,
            as_of_date=as_of_date,
        )
        return balance_sheet
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))