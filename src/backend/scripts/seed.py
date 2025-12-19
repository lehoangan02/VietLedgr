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
from app.models.base import AccountType
from app.models.ledger import GeneralLedgerEntry
from datetime import datetime, timedelta

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

def upsert_product_categories(session, store: Store, vat_standard: TaxDetail, vat_reduced: TaxDetail, no_tax: TaxDetail):
    """Create or update product categories with tax associations."""
    categories = [
        ("Rice & Grains", vat_reduced, "Rice products and grains"),
        ("Instant Foods", vat_standard, "Instant noodles and ready-to-eat meals"),
        ("Beverages", vat_standard, "Drinks and beverages"),
        ("Kitchen Appliances", vat_standard, "Kitchen tools and appliances"),
        ("Cleaning Products", vat_standard, "Household cleaning supplies"),
        ("Office Supplies", vat_standard, "Stationery and office items"),
        ("Personal Care", vat_standard, "Personal hygiene products"),
        ("Snacks", vat_standard, "Chips, cookies, and snacks"),
        ("Miscellaneous", no_tax, "Other general items"),
    ]
    
    category_map = {}
    for name, tax, description in categories:
        cat = session.execute(
            select(ProductCategory).where(ProductCategory.name == name)
        ).scalar_one_or_none()
        
        if not cat:
            cat = ProductCategory(
                name=name,
                tax_id=tax.tax_id,
                description=description,
            )
            session.add(cat)
            session.flush()
        
        category_map[name] = cat
    
    return category_map


def add_products(session, store: Store, category_map: dict):
    """Add a comprehensive list of products with proper categorization."""
    converter = ImageBase64Converter()
    image_dir = backend_dir / "public" / "images"

    image_map = {
        RetailCategory.FOOD: "healthy-food.png",
        RetailCategory.HOUSEHOLD: "appliance.png",
        RetailCategory.STATIONERY: "stationery.png",
        RetailCategory.OTHERS: "default-item.png",
    }

    # Expanded product list: (name, retail_category, category_name, description)
    products = [
        # FOOD category
        ("Rice 5kg", RetailCategory.FOOD, "Rice & Grains", "Premium jasmine rice, 5kg bag"),
        ("Rice 10kg", RetailCategory.FOOD, "Rice & Grains", "Premium jasmine rice, 10kg bag"),
        ("Glutinous Rice 2kg", RetailCategory.FOOD, "Rice & Grains", "Sticky rice for desserts, 2kg"),
        ("Brown Rice 5kg", RetailCategory.FOOD, "Rice & Grains", "Organic brown rice, 5kg"),
        
        ("Instant Noodles", RetailCategory.FOOD, "Instant Foods", "Popular instant noodles, chicken flavor"),
        ("Cup Noodles", RetailCategory.FOOD, "Instant Foods", "Instant cup noodles, beef flavor"),
        ("Instant Pho", RetailCategory.FOOD, "Instant Foods", "Vietnamese pho instant noodles"),
        ("Ramen Bowl", RetailCategory.FOOD, "Instant Foods", "Japanese style ramen bowl"),
        
        ("Mineral Water 500ml", RetailCategory.FOOD, "Beverages", "Purified mineral water"),
        ("Green Tea 350ml", RetailCategory.FOOD, "Beverages", "Unsweetened green tea"),
        ("Orange Juice 1L", RetailCategory.FOOD, "Beverages", "Fresh orange juice"),
        ("Energy Drink", RetailCategory.FOOD, "Beverages", "Energy drink 250ml"),
        
        ("Potato Chips", RetailCategory.FOOD, "Snacks", "Crispy potato chips, original flavor"),
        ("Chocolate Bar", RetailCategory.FOOD, "Snacks", "Milk chocolate bar 50g"),
        ("Cookies Pack", RetailCategory.FOOD, "Snacks", "Assorted cookies pack"),
        ("Candy Mix", RetailCategory.FOOD, "Snacks", "Mixed fruit candies"),
        
        # HOUSEHOLD category
        ("Electric Kettle", RetailCategory.HOUSEHOLD, "Kitchen Appliances", "1.7L electric kettle with auto shut-off"),
        ("Rice Cooker", RetailCategory.HOUSEHOLD, "Kitchen Appliances", "Multi-function rice cooker 1.8L"),
        ("Blender", RetailCategory.HOUSEHOLD, "Kitchen Appliances", "High-speed blender 500W"),
        ("Non-stick Pan", RetailCategory.HOUSEHOLD, "Kitchen Appliances", "28cm non-stick frying pan"),
        
        ("Dish Soap 500ml", RetailCategory.HOUSEHOLD, "Cleaning Products", "Antibacterial dish soap"),
        ("Laundry Detergent 2kg", RetailCategory.HOUSEHOLD, "Cleaning Products", "Concentrated laundry powder"),
        ("Floor Cleaner 1L", RetailCategory.HOUSEHOLD, "Cleaning Products", "Multi-surface floor cleaner"),
        ("Toilet Cleaner", RetailCategory.HOUSEHOLD, "Cleaning Products", "Disinfectant toilet cleaner"),
        
        ("Shampoo 400ml", RetailCategory.HOUSEHOLD, "Personal Care", "Nourishing shampoo"),
        ("Body Wash 500ml", RetailCategory.HOUSEHOLD, "Personal Care", "Refreshing body wash gel"),
        ("Toothpaste", RetailCategory.HOUSEHOLD, "Personal Care", "Whitening toothpaste 100g"),
        ("Hand Soap", RetailCategory.HOUSEHOLD, "Personal Care", "Antibacterial hand soap 250ml"),
        
        # STATIONERY category
        ("Notebook A5", RetailCategory.STATIONERY, "Office Supplies", "200-page lined notebook A5"),
        ("Notebook A4", RetailCategory.STATIONERY, "Office Supplies", "100-page ruled notebook A4"),
        ("Ballpoint Pen", RetailCategory.STATIONERY, "Office Supplies", "Blue ink ballpoint pen"),
        ("Pen Set 10pc", RetailCategory.STATIONERY, "Office Supplies", "Assorted color pen set"),
        ("Pencil Box", RetailCategory.STATIONERY, "Office Supplies", "Plastic pencil case"),
        ("Eraser Pack", RetailCategory.STATIONERY, "Office Supplies", "White erasers 3-pack"),
        ("Highlighter Set", RetailCategory.STATIONERY, "Office Supplies", "Fluorescent highlighters 4-pack"),
        ("Sticky Notes", RetailCategory.STATIONERY, "Office Supplies", "Colorful sticky note pads"),
        
        # OTHERS category
        ("Reusable Bag", RetailCategory.OTHERS, "Miscellaneous", "Eco-friendly reusable shopping bag"),
        ("Umbrella", RetailCategory.OTHERS, "Miscellaneous", "Compact folding umbrella"),
        ("Battery AA 4pc", RetailCategory.OTHERS, "Miscellaneous", "Alkaline AA batteries pack of 4"),
        ("Phone Cable", RetailCategory.OTHERS, "Miscellaneous", "USB charging cable 1m"),
    ]

    created_products = []
    for name, retail_category, category_name, description in products:
        exists = session.execute(
            select(Product).where(Product.name == name)
        ).scalar_one_or_none()

        if exists:
            created_products.append(exists)
            continue

        image_path = image_dir / image_map[retail_category]
        image_base64 = converter.image_to_base64(str(image_path))

        product = Product(
            store_id=store.id,
            category_id=category_map[category_name].category_id,
            name=name,
            retail_category=retail_category,
            image_base64=image_base64,
            description=description,
            sku=name.upper().replace(" ", "_"),
        )

        session.add(product)
        session.flush()
        created_products.append(product)
    
    return created_products


def add_warehouses(session, store: Store):
    """Create warehouses for the store."""
    warehouses = [
        ("Main Warehouse", "123 Main St, Ho Chi Minh City - Ground Floor"),
        ("Cold Storage", "123 Main St, Ho Chi Minh City - Basement"),
        ("Back Office Storage", "123 Main St, Ho Chi Minh City - 2nd Floor"),
    ]
    
    warehouse_list = []
    for name, location in warehouses:
        wh = session.execute(
            select(Warehouse).where(Warehouse.name == name, Warehouse.store_id == store.id)
        ).scalar_one_or_none()
        
        if not wh:
            wh = Warehouse(
                store_id=store.id,
                name=name,
                location=location,
            )
            session.add(wh)
            session.flush()
        
        warehouse_list.append(wh)
    
    return warehouse_list


def add_batches(session, products: list[Product], warehouses: list[Warehouse]):
    """Add inventory batches for products with realistic data."""
    # Define batch data: (product_sku, warehouse_idx, stock, cost, sale_price, supplier, days_until_expire)
    batch_data = [
        # Rice products - Main Warehouse
        ("RICE_5KG", 0, 150, Decimal("45000.00"), Decimal("55000.00"), "Vinh Long Rice Co.", 180),
        ("RICE_5KG", 0, 100, Decimal("46000.00"), Decimal("55000.00"), "Mekong Delta Rice", 150),
        ("RICE_10KG", 0, 80, Decimal("88000.00"), Decimal("105000.00"), "Vinh Long Rice Co.", 180),
        ("GLUTINOUS_RICE_2KG", 0, 60, Decimal("28000.00"), Decimal("35000.00"), "An Giang Rice", 120),
        ("BROWN_RICE_5KG", 0, 40, Decimal("60000.00"), Decimal("75000.00"), "Organic Farm", 150),
        
        # Instant foods - Main Warehouse
        ("INSTANT_NOODLES", 0, 300, Decimal("3500.00"), Decimal("5000.00"), "Acecook Vietnam", 360),
        ("CUP_NOODLES", 0, 200, Decimal("6000.00"), Decimal("8500.00"), "Nissin Foods", 360),
        ("INSTANT_PHO", 0, 150, Decimal("8000.00"), Decimal("12000.00"), "Vifon", 300),
        ("RAMEN_BOWL", 0, 100, Decimal("15000.00"), Decimal("20000.00"), "Korean Import", 240),
        
        # Beverages - Cold Storage
        ("MINERAL_WATER_500ML", 1, 500, Decimal("3000.00"), Decimal("5000.00"), "Lavie", 90),
        ("GREEN_TEA_350ML", 1, 300, Decimal("6000.00"), Decimal("9000.00"), "Tra Xanh", 120),
        ("ORANGE_JUICE_1L", 1, 100, Decimal("25000.00"), Decimal("35000.00"), "Vinamilk", 60),
        ("ENERGY_DRINK", 1, 200, Decimal("8000.00"), Decimal("12000.00"), "Red Bull", 180),
        
        # Snacks - Main Warehouse
        ("POTATO_CHIPS", 0, 120, Decimal("12000.00"), Decimal("18000.00"), "Pepsico", 90),
        ("CHOCOLATE_BAR", 0, 200, Decimal("8000.00"), Decimal("12000.00"), "Kinh Do", 180),
        ("COOKIES_PACK", 0, 150, Decimal("15000.00"), Decimal("22000.00"), "Orion", 120),
        ("CANDY_MIX", 0, 180, Decimal("5000.00"), Decimal("8000.00"), "Hai Ha", 240),
        
        # Kitchen Appliances - Back Office Storage
        ("ELECTRIC_KETTLE", 2, 25, Decimal("180000.00"), Decimal("250000.00"), "Sunhouse", None),
        ("RICE_COOKER", 2, 15, Decimal("450000.00"), Decimal("650000.00"), "Sharp", None),
        ("BLENDER", 2, 12, Decimal("280000.00"), Decimal("390000.00"), "Philips", None),
        ("NON-STICK_PAN", 2, 30, Decimal("120000.00"), Decimal("180000.00"), "Lock&Lock", None),
        
        # Cleaning Products - Main Warehouse
        ("DISH_SOAP_500ML", 0, 100, Decimal("18000.00"), Decimal("25000.00"), "Sunlight", 360),
        ("LAUNDRY_DETERGENT_2KG", 0, 60, Decimal("65000.00"), Decimal("85000.00"), "OMO", 540),
        ("FLOOR_CLEANER_1L", 0, 80, Decimal("35000.00"), Decimal("50000.00"), "Vim", 360),
        ("TOILET_CLEANER", 0, 90, Decimal("28000.00"), Decimal("40000.00"), "Domestos", 360),
        
        # Personal Care - Main Warehouse
        ("SHAMPOO_400ML", 0, 70, Decimal("45000.00"), Decimal("65000.00"), "Clear", 360),
        ("BODY_WASH_500ML", 0, 60, Decimal("55000.00"), Decimal("75000.00"), "Dove", 360),
        ("TOOTHPASTE", 0, 150, Decimal("18000.00"), Decimal("28000.00"), "Colgate", 540),
        ("HAND_SOAP", 0, 100, Decimal("22000.00"), Decimal("32000.00"), "Lifebuoy", 360),
        
        # Stationery - Back Office Storage
        ("NOTEBOOK_A5", 2, 100, Decimal("8000.00"), Decimal("15000.00"), "Thiên Long", None),
        ("NOTEBOOK_A4", 2, 80, Decimal("12000.00"), Decimal("20000.00"), "Thiên Long", None),
        ("BALLPOINT_PEN", 2, 200, Decimal("2000.00"), Decimal("5000.00"), "Thiên Long", None),
        ("PEN_SET_10PC", 2, 50, Decimal("25000.00"), Decimal("40000.00"), "Thiên Long", None),
        ("PENCIL_BOX", 2, 60, Decimal("15000.00"), Decimal("25000.00"), "Hong Ha", None),
        ("ERASER_PACK", 2, 100, Decimal("8000.00"), Decimal("12000.00"), "Thiên Long", None),
        ("HIGHLIGHTER_SET", 2, 70, Decimal("18000.00"), Decimal("30000.00"), "Thiên Long", None),
        ("STICKY_NOTES", 2, 90, Decimal("12000.00"), Decimal("20000.00"), "Deli", None),
        
        # Others - Main Warehouse
        ("REUSABLE_BAG", 0, 150, Decimal("8000.00"), Decimal("15000.00"), "Ecobag VN", None),
        ("UMBRELLA", 0, 40, Decimal("45000.00"), Decimal("70000.00"), "Saigon Umbrella", None),
        ("BATTERY_AA_4PC", 0, 120, Decimal("18000.00"), Decimal("28000.00"), "Panasonic", 720),
        ("PHONE_CABLE", 0, 100, Decimal("25000.00"), Decimal("45000.00"), "Remax", None),
    ]
    
    # Create product SKU lookup
    product_map = {p.sku: p for p in products}
    
    now = datetime.now()
    
    for sku, wh_idx, stock, cost, sale_price, supplier, expire_days in batch_data:
        if sku not in product_map:
            continue
            
        product = product_map[sku]
        warehouse = warehouses[wh_idx]
        
        # Check if batch already exists
        existing = session.execute(
            select(Batch).where(
                Batch.product_id == product.product_id,
                Batch.warehouse_id == warehouse.warehouse_id,
                Batch.supplier_name == supplier
            )
        ).scalar_one_or_none()
        
        if existing:
            continue
        
        # Calculate import date (random between 1-30 days ago)
        import_days_ago = hash(sku + supplier) % 30 + 1
        import_date = now - timedelta(days=import_days_ago)
        
        # Calculate expire date if applicable
        expire_date = None
        if expire_days:
            expire_date = import_date + timedelta(days=expire_days)
        
        batch = Batch(
            product_id=product.product_id,
            warehouse_id=warehouse.warehouse_id,
            stock=stock,
            cost=cost,
            sale_price=sale_price,
            import_date=import_date,
            expire_date=expire_date,
            supplier_name=supplier,
        )
        
        session.add(batch)
    
    print(f"Added {len(batch_data)} batches across {len(warehouses)} warehouses")
def seed_ledger_entries(session):
    store = session.execute(
        select(Store).where(Store.name == "Main Store")
    ).scalar_one()

    # Check if we already have entries to avoid duplicates
    existing = session.execute(
        select(GeneralLedgerEntry).filter(GeneralLedgerEntry.store_id == store.id).limit(1)
    ).scalar_one_or_none()
    
    if existing:
        print("Ledger already seeded. Skipping...")
        return

    entries = [
        # --- DEBITS (Increases Assets/Expenses) ---
        GeneralLedgerEntry(
            store_id=store.id,
            account_type="ASSET",
            description="Initial cash investment for store opening",
            debit_amount=Decimal("50000000.00"),
            credit_amount=Decimal("0.00"),
        ),
        GeneralLedgerEntry(
            store_id=store.id,
            account_type="EXPENSE",
            description="Monthly Store Rent - December",
            debit_amount=Decimal("8000000.00"),
            credit_amount=Decimal("0.00"),
        ),
        GeneralLedgerEntry(
            store_id=store.id,
            account_type="EXPENSE",
            description="Electricity and Water Bill",
            debit_amount=Decimal("1200000.00"),
            credit_amount=Decimal("0.00"),
        ),

        # --- CREDITS (Increases Revenue/Liabilities or Decreases Assets) ---
        GeneralLedgerEntry(
            store_id=store.id,
            account_type="REVENUE",
            description="Daily Sales Revenue - 2025-12-17",
            debit_amount=Decimal("0.00"),
            credit_amount=Decimal("4500000.00"),
        ),
        GeneralLedgerEntry(
            store_id=store.id,
            account_type="REVENUE",
            description="Daily Sales Revenue - 2025-12-18",
            debit_amount=Decimal("0.00"),
            credit_amount=Decimal("3850000.00"),
        ),
        GeneralLedgerEntry(
            store_id=store.id,
            account_type="ASSET", # Credit to Cash Asset (Payment out)
            description="Payment to Rice Supplier (SKU: RICE_5KG)",
            debit_amount=Decimal("0.00"),
            credit_amount=Decimal("5000000.00"),
        ),
        GeneralLedgerEntry(
            store_id=store.id,
            account_type="LIABILITY",
            description="Short-term Bank Loan for Equipment",
            debit_amount=Decimal("0.00"),
            credit_amount=Decimal("20000000.00"),
        ),
    ]

    session.add_all(entries)
    print(f"Added {len(entries)} ledger entries for store: {store.name}")


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

        vat_standard = upsert_tax(session, "VAT Standard", Decimal("10.00"), "Standard VAT rate")
        vat_reduced = upsert_tax(session, "VAT Reduced", Decimal("5.00"), "Reduced VAT rate")
        no_tax = upsert_tax(session, "No Tax", Decimal("0.00"), "Tax exempt items")

        upsert_admin_user(session, store, admin_role)

        # Create product categories
        category_map = upsert_product_categories(session, store, vat_standard, vat_reduced, no_tax)
        
        # Add products with categories
        products = add_products(session, store, category_map)
        
        # Create warehouses
        warehouses = add_warehouses(session, store)
        
        # Add inventory batches
        add_batches(session, products, warehouses)
        
        # Seed ledger entries
        seed_ledger_entries(session)

        session.commit()

    print("Seed data completed successfully.")


if __name__ == "__main__":
    main()
