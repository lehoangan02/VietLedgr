import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app import models
from app.schemas.expense import (
    TrialBalanceResponse,
    TrialBalanceEntry,
    IncomeStatementResponse,
    IncomeStatementEntry,
    BalanceSheetResponse,
    BalanceSheetAsset,
    BalanceSheetLiability,
    BalanceSheetEquity,
)


class AccountingService:
    """Service layer for accounting operations"""

    @staticmethod
    def create_ledger_entry_from_transaction(
        db: Session,
        transaction: models.Transaction,
    ) -> list[models.GeneralLedgerEntry]:
        """
        Create double-entry ledger entries for a transaction.
        
        Debit: Cash/Accounts Receivable (Asset)
        Credit: Sales Revenue (Revenue)
        """
        entries = []

        # Entry 1: Debit Asset (Cash), Credit Revenue
        revenue_entry = models.GeneralLedgerEntry(
            store_id=transaction.store_id,
            account_type=models.AccountType.ASSET,
            transaction_id=transaction.transaction_id,
            entry_date=transaction.created_at,
            description=f"Cash received from transaction {transaction.transaction_id}",
            debit_amount=transaction.total_amount,
            credit_amount=Decimal("0"),
        )
        entries.append(revenue_entry)

        # Entry 2: Credit Revenue
        credit_revenue = models.GeneralLedgerEntry(
            store_id=transaction.store_id,
            account_type=models.AccountType.REVENUE,
            transaction_id=transaction.transaction_id,
            entry_date=transaction.created_at,
            description=f"Sales revenue from transaction {transaction.transaction_id}",
            debit_amount=Decimal("0"),
            credit_amount=transaction.total_amount,
        )
        entries.append(credit_revenue)

        # Entry 3: Debit COGS Expense
        cogs_total = Decimal("0")
        for item in transaction.items:
            cogs_total += item.cost_at_sale * item.quantity

        if cogs_total > 0:
            cogs_entry = models.GeneralLedgerEntry(
                store_id=transaction.store_id,
                account_type=models.AccountType.EXPENSE,
                transaction_id=transaction.transaction_id,
                entry_date=transaction.created_at,
                description=f"Cost of goods sold for transaction {transaction.transaction_id}",
                debit_amount=cogs_total,
                credit_amount=Decimal("0"),
            )
            entries.append(cogs_entry)

            # Entry 4: Credit Inventory (Asset)
            inventory_entry = models.GeneralLedgerEntry(
                store_id=transaction.store_id,
                account_type=models.AccountType.ASSET,
                transaction_id=transaction.transaction_id,
                entry_date=transaction.created_at,
                description=f"Inventory reduction for transaction {transaction.transaction_id}",
                debit_amount=Decimal("0"),
                credit_amount=cogs_total,
            )
            entries.append(inventory_entry)

        db.add_all(entries)
        db.flush()
        return entries

    @staticmethod
    def create_ledger_entry_from_expense(
        db: Session,
        expense: models.Expense,
    ) -> list[models.GeneralLedgerEntry]:
        """
        Create ledger entries for expense.
        
        Debit: Expense Account (Expense)
        Credit: Cash (Asset)
        """
        entries = []

        # Entry 1: Debit Expense
        expense_entry = models.GeneralLedgerEntry(
            store_id=expense.store_id,
            account_type=models.AccountType.EXPENSE,
            expense_id=expense.expense_id,
            entry_date=expense.expense_date,
            description=f"{expense.description} (Expense ID: {expense.expense_id})",
            debit_amount=expense.amount,
            credit_amount=Decimal("0"),
        )
        entries.append(expense_entry)

        # Entry 2: Credit Asset (Cash)
        asset_entry = models.GeneralLedgerEntry(
            store_id=expense.store_id,
            account_type=models.AccountType.ASSET,
            expense_id=expense.expense_id,
            entry_date=expense.expense_date,
            description=f"Cash paid for expense {expense.expense_id}",
            debit_amount=Decimal("0"),
            credit_amount=expense.amount,
        )
        entries.append(asset_entry)

        db.add_all(entries)
        db.flush()
        return entries

    @staticmethod
    def get_trial_balance(
        db: Session,
        store_id: uuid.UUID,
        as_of_date: datetime | None = None,
    ) -> TrialBalanceResponse:
        """Calculate trial balance for a store"""
        if not as_of_date:
            as_of_date = datetime.utcnow()

        # Query all ledger entries up to the date
        query = db.query(
            models.GeneralLedgerEntry.account_type,
            func.sum(models.GeneralLedgerEntry.debit_amount).label('total_debit'),
            func.sum(models.GeneralLedgerEntry.credit_amount).label('total_credit'),
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.entry_date <= as_of_date,
            )
        ).group_by(models.GeneralLedgerEntry.account_type)

        entries = []
        total_debits = Decimal("0")
        total_credits = Decimal("0")

        for row in query.all():
            debit = row.total_debit or Decimal("0")
            credit = row.total_credit or Decimal("0")

            entries.append(
                TrialBalanceEntry(
                    account_type=row.account_type,
                    debit_total=debit,
                    credit_total=credit,
                )
            )
            total_debits += debit
            total_credits += credit

        return TrialBalanceResponse(
            store_id=store_id,
            as_of_date=as_of_date,
            entries=entries,
            total_debits=total_debits,
            total_credits=total_credits,
            is_balanced=total_debits == total_credits,
        )

    @staticmethod
    def get_income_statement(
        db: Session,
        store_id: uuid.UUID,
        start_date: datetime,
        end_date: datetime,
    ) -> IncomeStatementResponse:
        """Generate profit & loss statement"""

        # Get Revenue
        revenue_result = db.query(
            func.sum(models.GeneralLedgerEntry.credit_amount)
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.account_type == models.AccountType.REVENUE,
                models.GeneralLedgerEntry.entry_date >= start_date,
                models.GeneralLedgerEntry.entry_date <= end_date,
            )
        ).scalar()
        revenue = revenue_result or Decimal("0")

        # Get COGS (debit from EXPENSE entries related to COGS)
        cogs_result = db.query(
            func.sum(models.GeneralLedgerEntry.debit_amount)
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.account_type == models.AccountType.EXPENSE,
                models.GeneralLedgerEntry.transaction_id.isnot(None),
                models.GeneralLedgerEntry.entry_date >= start_date,
                models.GeneralLedgerEntry.entry_date <= end_date,
            )
        ).scalar()
        cogs = cogs_result or Decimal("0")

        gross_profit = revenue - cogs

        # Get Operating Expenses
        expense_result = db.query(
            func.sum(models.GeneralLedgerEntry.debit_amount)
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.account_type == models.AccountType.EXPENSE,
                models.GeneralLedgerEntry.expense_id.isnot(None),
                models.GeneralLedgerEntry.entry_date >= start_date,
                models.GeneralLedgerEntry.entry_date <= end_date,
            )
        ).scalar()
        total_expenses = expense_result or Decimal("0")

        # Get detailed expenses by description
        expense_details = db.query(
            models.GeneralLedgerEntry.description,
            func.sum(models.GeneralLedgerEntry.debit_amount).label('amount'),
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.account_type == models.AccountType.EXPENSE,
                models.GeneralLedgerEntry.expense_id.isnot(None),
                models.GeneralLedgerEntry.entry_date >= start_date,
                models.GeneralLedgerEntry.entry_date <= end_date,
            )
        ).group_by(models.GeneralLedgerEntry.description).all()

        expense_entries = [
            IncomeStatementEntry(
                category=detail.description,
                amount=detail.amount or Decimal("0"),
            )
            for detail in expense_details
        ]

        net_income = gross_profit - total_expenses

        return IncomeStatementResponse(
            store_id=store_id,
            start_date=start_date,
            end_date=end_date,
            revenue=revenue,
            cost_of_goods_sold=cogs,
            gross_profit=gross_profit,
            expenses=expense_entries,
            total_expenses=total_expenses,
            net_income=net_income,
        )

    @staticmethod
    def get_balance_sheet(
        db: Session,
        store_id: uuid.UUID,
        as_of_date: datetime | None = None,
    ) -> BalanceSheetResponse:
        """Generate balance sheet"""
        if not as_of_date:
            as_of_date = datetime.utcnow()

        # Get Assets (net of debits and credits)
        assets_result = db.query(
            func.sum(models.GeneralLedgerEntry.debit_amount).label('debits'),
            func.sum(models.GeneralLedgerEntry.credit_amount).label('credits'),
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.account_type == models.AccountType.ASSET,
                models.GeneralLedgerEntry.entry_date <= as_of_date,
            )
        ).first()

        total_assets = (
            (assets_result.debits or Decimal("0")) - (assets_result.credits or Decimal("0"))
        )

        # Get Liabilities
        liabilities_result = db.query(
            func.sum(models.GeneralLedgerEntry.credit_amount).label('credits'),
            func.sum(models.GeneralLedgerEntry.debit_amount).label('debits'),
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.account_type == models.AccountType.LIABILITY,
                models.GeneralLedgerEntry.entry_date <= as_of_date,
            )
        ).first()

        total_liabilities = (
            (liabilities_result.credits or Decimal("0")) - (liabilities_result.debits or Decimal("0"))
        )

        # Get Equity
        equity_result = db.query(
            func.sum(models.GeneralLedgerEntry.credit_amount).label('credits'),
            func.sum(models.GeneralLedgerEntry.debit_amount).label('debits'),
        ).filter(
            and_(
                models.GeneralLedgerEntry.store_id == store_id,
                models.GeneralLedgerEntry.account_type == models.AccountType.EQUITY,
                models.GeneralLedgerEntry.entry_date <= as_of_date,
            )
        ).first()

        total_equity = (
            (equity_result.credits or Decimal("0")) - (equity_result.debits or Decimal("0"))
        )

        # Build response
        asset_entries = [
            BalanceSheetAsset(name="Total Assets", amount=total_assets)
        ]
        liability_entries = [
            BalanceSheetLiability(name="Total Liabilities", amount=total_liabilities)
        ]
        equity_entries = [
            BalanceSheetEquity(name="Total Equity", amount=total_equity)
        ]

        return BalanceSheetResponse(
            store_id=store_id,
            as_of_date=as_of_date,
            assets=asset_entries,
            total_assets=total_assets,
            liabilities=liability_entries,
            total_liabilities=total_liabilities,
            equity=equity_entries,
            total_equity=total_equity,
        )