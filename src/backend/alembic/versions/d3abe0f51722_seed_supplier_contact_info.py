"""seed supplier contact info

Revision ID: d3abe0f51722
Revises: 7a0445c34ef6
Create Date: 2026-01-04 13:27:46.866253
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d3abe0f51722"
down_revision: Union[str, Sequence[str], None] = "7a0445c34ef6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    bind = op.get_bind()

    stmt = sa.text(
        """
        UPDATE suppliers
        SET
          contact_name = COALESCE(NULLIF(contact_name, ''), :contact_name),
          phone        = COALESCE(NULLIF(phone, ''), :phone),
          email        = COALESCE(NULLIF(email, ''), :email),
          address      = COALESCE(NULLIF(address, ''), :address)
        WHERE name = :name;
        """
    )

    data = [
        {
            "name": "Acecook Vietnam",
            "contact_name": "Nguyen Minh Anh",
            "phone": "+84 28 3822 0001",
            "email": "sales@acecook.vn",
            "address": "Tan Binh District, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "An Giang Rice",
            "contact_name": "Tran Thanh Long",
            "phone": "+84 296 385 2222",
            "email": "contact@angiangrice.vn",
            "address": "Long Xuyen City, An Giang, Vietnam",
        },
        {
            "name": "Clear",
            "contact_name": "Customer Care",
            "phone": "+84 28 3827 8888",
            "email": "support@clear.vn",
            "address": "Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Colgate",
            "contact_name": "Distributor Desk",
            "phone": "+84 28 7300 1234",
            "email": "orders@colgate.vn",
            "address": "District 7, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Deli",
            "contact_name": "Sales Team",
            "phone": "+84 24 3999 6868",
            "email": "sales@deli.com.vn",
            "address": "Cau Giay District, Hanoi, Vietnam",
        },
        {
            "name": "Domestos",
            "contact_name": "Customer Service",
            "phone": "+84 28 3827 8888",
            "email": "support@domestos.vn",
            "address": "Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Dove",
            "contact_name": "Customer Care",
            "phone": "+84 28 3827 8888",
            "email": "support@dove.vn",
            "address": "Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Ecobag VN",
            "contact_name": "Pham Thu Ha",
            "phone": "+84 28 7777 9090",
            "email": "hello@ecobag.vn",
            "address": "Thu Duc City, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Hai Ha",
            "contact_name": "Le Quang Huy",
            "phone": "+84 24 3765 8888",
            "email": "sales@haiha.vn",
            "address": "Thanh Xuan District, Hanoi, Vietnam",
        },
        {
            "name": "Hong Ha",
            "contact_name": "Sales Office",
            "phone": "+84 24 3943 6789",
            "email": "contact@hongha.com.vn",
            "address": "Dong Da District, Hanoi, Vietnam",
        },
        {
            "name": "Kinh Do",
            "contact_name": "Distributor Support",
            "phone": "+84 28 3999 1122",
            "email": "orders@kinhdo.vn",
            "address": "Binh Tan District, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Korean Import",
            "contact_name": "Import Desk",
            "phone": "+84 28 3666 7788",
            "email": "import@koreanimport.vn",
            "address": "District 2, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Lavie",
            "contact_name": "Key Accounts",
            "phone": "+84 28 3836 0000",
            "email": "sales@lavie.vn",
            "address": "District 1, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Lifebuoy",
            "contact_name": "Customer Care",
            "phone": "+84 28 3827 8888",
            "email": "support@lifebuoy.vn",
            "address": "Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Lock&Lock",
            "contact_name": "Wholesale Team",
            "phone": "+84 28 7300 5678",
            "email": "wholesale@locknlock.vn",
            "address": "District 7, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Mekong Delta Rice",
            "contact_name": "Nguyen Van Phuc",
            "phone": "+84 292 381 2345",
            "email": "sales@mekongrice.vn",
            "address": "Can Tho City, Vietnam",
        },
        {
            "name": "Nissin Foods",
            "contact_name": "Distributor Desk",
            "phone": "+84 28 3888 2233",
            "email": "orders@nissinfoods.vn",
            "address": "Tan Phu District, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "OMO",
            "contact_name": "Sales Support",
            "phone": "+84 28 3827 8888",
            "email": "orders@omo.vn",
            "address": "Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Organic Farm",
            "contact_name": "Nguyen Thao Vy",
            "phone": "+84 26 3389 1234",
            "email": "hello@organicfarm.vn",
            "address": "Da Lat, Lam Dong, Vietnam",
        },
        {
            "name": "Orion",
            "contact_name": "Sales Team",
            "phone": "+84 28 3822 3344",
            "email": "sales@orion.vn",
            "address": "Binh Duong, Vietnam",
        },
        {
            "name": "Panasonic",
            "contact_name": "Wholesale Desk",
            "phone": "+84 28 7301 0000",
            "email": "orders@panasonic.vn",
            "address": "District 1, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Pepsico",
            "contact_name": "Key Accounts",
            "phone": "+84 28 7302 2222",
            "email": "sales@pepsico.vn",
            "address": "District 7, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Philips",
            "contact_name": "Distributor Support",
            "phone": "+84 28 7303 3333",
            "email": "orders@philips.vn",
            "address": "District 3, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Red Bull",
            "contact_name": "Sales Desk",
            "phone": "+84 28 7304 4444",
            "email": "sales@redbull.vn",
            "address": "District 1, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Remax",
            "contact_name": "Wholesale Desk",
            "phone": "+84 28 7305 5555",
            "email": "sales@remax.vn",
            "address": "Tan Binh District, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Saigon Umbrella",
            "contact_name": "Tran Gia Minh",
            "phone": "+84 28 7777 1212",
            "email": "hello@saigonumbrella.vn",
            "address": "Binh Thanh District, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Sharp",
            "contact_name": "Wholesale Support",
            "phone": "+84 28 7306 6666",
            "email": "orders@sharp.vn",
            "address": "District 3, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Sunhouse",
            "contact_name": "Sales Team",
            "phone": "+84 24 3555 7788",
            "email": "sales@sunhouse.com.vn",
            "address": "Cau Giay District, Hanoi, Vietnam",
        },
        {
            "name": "Sunlight",
            "contact_name": "Customer Service",
            "phone": "+84 28 3827 8888",
            "email": "support@sunlight.vn",
            "address": "Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Thiên Long",
            "contact_name": "Distributor Desk",
            "phone": "+84 28 3750 8888",
            "email": "sales@thienlong.vn",
            "address": "Tan Phu District, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Tra Xanh",
            "contact_name": "Sales Team",
            "phone": "+84 28 3888 9900",
            "email": "sales@traxanh.vn",
            "address": "District 10, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Vifon",
            "contact_name": "Wholesale Support",
            "phone": "+84 28 3836 6666",
            "email": "orders@vifon.vn",
            "address": "District 6, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Vim",
            "contact_name": "Customer Care",
            "phone": "+84 28 3827 8888",
            "email": "support@vim.vn",
            "address": "Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Vinamilk",
            "contact_name": "Key Accounts",
            "phone": "+84 28 5415 5555",
            "email": "sales@vinamilk.com.vn",
            "address": "Tan Binh District, Ho Chi Minh City, Vietnam",
        },
        {
            "name": "Vinh Long Rice Co.",
            "contact_name": "Pham Quoc Dat",
            "phone": "+84 270 3821 234",
            "email": "sales@vinhlongrice.vn",
            "address": "Vinh Long Province, Vietnam",
        },
    ]

    for row in data:
        bind.execute(stmt, row)


def downgrade():
    op.execute(
        sa.text(
            """
            UPDATE suppliers
            SET contact_name = NULL,
                phone = NULL,
                email = NULL,
                address = NULL
            WHERE name IN (
                'Acecook Vietnam','An Giang Rice','Clear','Colgate','Deli','Domestos','Dove',
                'Ecobag VN','Hai Ha','Hong Ha','Kinh Do','Korean Import','Lavie','Lifebuoy',
                'Lock&Lock','Mekong Delta Rice','Nissin Foods','OMO','Organic Farm','Orion',
                'Panasonic','Pepsico','Philips','Red Bull','Remax','Saigon Umbrella','Sharp',
                'Sunhouse','Sunlight','Thiên Long','Tra Xanh','Vifon','Vim','Vinamilk',
                'Vinh Long Rice Co.'
            );
            """
        )
    )
