"""
Seed script for creating sample transaction/sales data.
Run this after seed.py to populate the database with test transactions.

Usage:
    python scripts/seed_transactions.py
"""

import os
import sys
import random
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker

from app.models import Store, User
from app.models.warehouse import Batch
from app.models.transaction import Transaction, TransactionItem

# Load environment variables
load_dotenv()


def get_database_url() -> str:
    """Build database URL from environment variables (same as seed.py)."""
    db_url = os.getenv("DATABASE_URL")
    
    if not db_url:
        # Build from .env components
        pg_user = os.getenv("POSTGRES_USER", "postgres")
        pg_password = os.getenv("POSTGRES_PASSWORD", "")
        pg_server = os.getenv("POSTGRES_SERVER", "localhost")
        pg_port = os.getenv("POSTGRES_PORT", "5432")
        pg_db = os.getenv("POSTGRES_DB", "vietledgr_db")
        
        db_url = f"postgresql+psycopg2://{pg_user}:{pg_password}@{pg_server}:{pg_port}/{pg_db}"
    
    return db_url


def seed_transactions(session, num_transactions: int = 50):
    """
    Create sample transaction/sales data for the past 30 days.
    
    Args:
        session: SQLAlchemy session
        num_transactions: Number of transactions to create (default: 50)
    """
    # Get the store
    store = session.execute(
        select(Store).where(Store.name == "Main Store")
    ).scalar_one_or_none()
    
    if not store:
        print("ERROR: No store found. Run seed.py first.")
        return
    
    # Get a user (admin) for the transactions
    user = session.execute(
        select(User).where(User.store_id == store.id)
    ).scalars().first()
    
    if not user:
        print("ERROR: No user found. Run seed.py first.")
        return
    
    # Check if transactions already exist
    existing_count = session.execute(
        select(func.count(Transaction.transaction_id))
        .where(Transaction.store_id == store.id)
    ).scalar()
    
    if existing_count and existing_count > 0:
        print(f"Transactions already exist ({existing_count} found). Skipping...")
        return
    
    # Get batches with stock > 0
    batches = session.execute(
        select(Batch).where(Batch.stock > 0)
    ).scalars().all()
    
    if not batches:
        print("ERROR: No batches with stock found. Run seed.py first.")
        return
    
    print(f"Found {len(batches)} batches with stock.")
    print(f"Creating {num_transactions} transactions...")
    
    now = datetime.now()
    transactions_created = 0
    items_created = 0
    
    for i in range(num_transactions):
        # Random date within past 30 days
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        transaction_date = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        # Create transaction
        transaction = Transaction(
            store_id=store.id,
            user_id=user.user_id,
            device_id=f"SEED_POS_{random.randint(1, 3):03d}",
            total_amount=Decimal("0"),
            total_tax=Decimal("0"),
            created_at=transaction_date,
        )
        session.add(transaction)
        session.flush()  # Get the transaction_id
        
        # Add 1-5 random items to each transaction
        num_items = random.randint(1, 5)
        available_batches = [b for b in batches if b.stock > 0]
        
        if not available_batches:
            print(f"Warning: No more batches with stock at transaction {i+1}")
            continue
            
        selected_batches = random.sample(
            available_batches, 
            min(num_items, len(available_batches))
        )
        
        transaction_total = Decimal("0")
        transaction_tax = Decimal("0")
        
        for batch in selected_batches:
            # Random quantity (1-3, but not more than available stock)
            max_qty = min(3, batch.stock)
            quantity = random.randint(1, max(1, max_qty))
            
            # Use batch sale_price as the price_at_sale
            price_at_sale = batch.sale_price
            cost_at_sale = batch.cost
            
            item = TransactionItem(
                transaction_id=transaction.transaction_id,
                batch_id=batch.batch_id,
                quantity=quantity,
                price_at_sale=price_at_sale,
                cost_at_sale=cost_at_sale,
                created_at=transaction_date,
            )
            session.add(item)
            
            # Calculate totals
            item_total = price_at_sale * quantity
            item_tax = item_total * Decimal("0.10")  # 10% tax
            transaction_total += item_total
            transaction_tax += item_tax
            
            # Deduct stock (optional - comment out to keep batches intact)
            batch.stock -= quantity
            
            items_created += 1
        
        # Update transaction totals
        transaction.total_amount = transaction_total
        transaction.total_tax = transaction_tax
        
        transactions_created += 1
        
        if (i + 1) % 10 == 0:
            print(f"  Created {i + 1}/{num_transactions} transactions...")
    
    session.commit()
    print(f"\nSeed completed successfully!")
    print(f"  Transactions created: {transactions_created}")
    print(f"  Transaction items created: {items_created}")


def main():
    database_url = get_database_url()
    print(f"Connecting to database...")
    
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    
    with SessionLocal() as session:
        seed_transactions(session, num_transactions=50)


if __name__ == "__main__":
    main()
