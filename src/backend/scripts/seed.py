import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from passlib.context import CryptContext
from decimal import Decimal
from dotenv import load_dotenv

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.models import Store, Role, TaxDetail, User
from app.models.product import Product, ProductCategory
from app.models.warehouse import Warehouse, Batch
from app.models.base import RetailCategory

from app.core.imageBase64Converter import ImageBase64Converter

# Load environment variables
load_dotenv()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# --- JWT Token Configuration ---
ALGORITHM = "HS256"
# Your access token expiry (8 days)
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8


def hash_password(password: str) -> str:
    """
    Hashes the password using Argon2.
    """
    # Hash the full, untruncated password
    return pwd_context.hash(password)


def upsert_role(session, name: str, description: str | None = None) -> Role:
    role = session.execute(
        select(Role).where(Role.name == name)
    ).scalar_one_or_none()

    if role:
        if description is not None:
            role.description = description
        return role

    role = Role(name=name, description=description)
    session.add(role)
    session.flush()
    return role


def upsert_store(session) -> Store:
    store = session.execute(
        select(Store).where(Store.name == "Main Store")
    ).scalar_one_or_none()

    if store:
        return store

    store = Store(
        name="Main Store",
        address="123 Main St, Ho Chi Minh City",
        phone="0123456789",
    )
    session.add(store)
    session.flush()
    return store


def upsert_tax(
    session,
    tax_name: str,
    tax_rate: Decimal,
    tax_description: str | None = None,
) -> TaxDetail:
    tax = session.execute(
        select(TaxDetail).where(TaxDetail.tax_name == tax_name)
    ).scalar_one_or_none()

    if tax:
        tax.tax_rate = tax_rate
        tax.tax_description = tax_description
        return tax

    tax = TaxDetail(
        tax_name=tax_name,
        tax_rate=tax_rate,
        tax_description=tax_description,
    )
    session.add(tax)
    return tax


def upsert_admin_user(session, store: Store, admin_role: Role) -> None:
    username = os.getenv("SEED_ADMIN_USERNAME", "admin")
    password = os.getenv("SEED_ADMIN_PASSWORD", "admin123")

    user = session.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()

    if user:
        user.store_id = store.id
        user.role_id = admin_role.role_id
        return

    user = User(
        username=username,
        password_hash=hash_password(password),
        store_id=store.id,
        role_id=admin_role.role_id,
    )
    session.add(user)

def add_products(session):
    store = session.execute(
        select(Store).where(Store.name == "Main Store")
    ).scalar_one()

    converter = ImageBase64Converter()
    image_dir = backend_dir / "public" / "images"

    image_map = {
        RetailCategory.FOOD: "healthy-food.png",
        RetailCategory.HOUSEHOLD: "appliance.png",
        RetailCategory.STATIONERY: "stationery.png",
        RetailCategory.OTHERS: "default-item.png",
    }

    products = [
        ("Rice 5kg", RetailCategory.FOOD),
        ("Instant Noodles", RetailCategory.FOOD),
        ("Electric Kettle", RetailCategory.HOUSEHOLD),
        ("Notebook A5", RetailCategory.STATIONERY),
        ("Ballpoint Pen", RetailCategory.STATIONERY),
        ("Reusable Bag", RetailCategory.OTHERS),
    ]

    for name, retail_category in products:
        exists = session.execute(
            select(Product).where(Product.name == name)
        ).scalar_one_or_none()

        if exists:
            continue

        image_path = image_dir / image_map[retail_category]
        image_base64 = converter.image_to_base64(str(image_path))

        product = Product(
            store_id=store.id,
            name=name,
            retail_category=retail_category,
            image_base64=image_base64,
            description=f"{name} description",
            sku=name.upper().replace(" ", "_"),
        )

        session.add(product)



def main():
    # Try DATABASE_URL first, then build from individual components
    db_url = os.getenv("DATABASE_URL")
    
    if not db_url:
        # Build from .env components
        pg_user = os.getenv("POSTGRES_USER", "postgres")
        pg_password = os.getenv("POSTGRES_PASSWORD", "")
        pg_server = os.getenv("POSTGRES_SERVER", "localhost")
        pg_port = os.getenv("POSTGRES_PORT", "5432")
        pg_db = os.getenv("POSTGRES_DB", "vietledgr_db")
        
        db_url = f"postgresql+psycopg2://{pg_user}:{pg_password}@{pg_server}:{pg_port}/{pg_db}"

    engine = create_engine(db_url, future=True)
    SessionLocal = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
        future=True,
    )

    with SessionLocal() as session:
        admin_role = upsert_role(session, "Admin", "Full system access")
        manager_role = upsert_role(session, "Manager", "Store management access")
        cashier_role = upsert_role(session, "Cashier", "Point of sale access")

        store = upsert_store(session)

        upsert_tax(session, "VAT Standard", Decimal("10.00"), "Standard VAT rate")
        upsert_tax(session, "VAT Reduced", Decimal("5.00"), "Reduced VAT rate")
        upsert_tax(session, "No Tax", Decimal("0.00"), "Tax exempt items")

        upsert_admin_user(session, store, admin_role)

        add_products(session)

        session.commit()

    print("Seed data completed successfully.")


if __name__ == "__main__":
    main()
