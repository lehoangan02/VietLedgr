print('[UNIT TEST]: AUTH')
# testing for authentication

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from func_utils import generate_random_string
import requests
from datetime import datetime
from datetime import timezone
import uuid
from testing.test_logger import TestLogger

logger = TestLogger("AUTH_UNIT_TEST_SIGN_UP")

def get_response_data(response):
    """Safely extracts JSON or returns text if JSON parsing fails."""
    try:
        return response.json()
    except Exception:
        return f"CRITICAL SERVER ERROR (Non-JSON): {response.text}"

# test the signup api

url = "http://127.0.0.1:8000/api/auth/signup"

# test 1: 
print('[TEST 01]')
username = generate_random_string(5)
password = generate_random_string(8)
data = {
    "username": username,
    "user_type": "ADMIN",
    "last_login": datetime.now(timezone.utc).isoformat(),
    "password": password,
    "store_id": str(uuid.uuid4()), # random uuid
    "role_id": str(uuid.uuid4()) # random uudi
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data) # [FIXED] Used safe variable

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 01] failed, random uuid for store and role id should not be enough to sign up."
    print(msg)
    is_success = False
else:
    msg = "[TEST 01] succeeded."
    print(msg)
logger.log("TEST 01", is_success, msg, response_json=rsp_data)

# test 2: 
print('[TEST 02]')
username = generate_random_string(5)
password = generate_random_string(8)
data = {
    "username": username,
    "user_type": "napoleon",
    "last_login": datetime.now(timezone.utc).isoformat(),
    "password": password,
    "store_id": str(uuid.uuid4()), # random uuid
    "role_id": str(uuid.uuid4()) # random uudi
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data) # [FIXED] Used safe variable

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 02] failed, 'napoleon' is not a valid role."
    print(msg)
    is_success = False
else:
    msg = "[TEST 02] succeeded."
    print(msg)
logger.log("TEST 02", is_success, msg, response_json=rsp_data)

# test 3: 
print('[TEST 03]')
admin_uuid = "e0face1a-fb8b-4e77-be53-b4f14da5731f"
username = generate_random_string(5)
password = generate_random_string(8)
data = {
    "username": username,
    "user_type": "CASHIER",
    "last_login": datetime.now(timezone.utc).isoformat(),
    "password": password,
    "store_id": str(uuid.uuid4()), # random uuid
    "role_id": admin_uuid
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data) # [FIXED] Used safe variable

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 03] failed, the role id is admin's role id and the role is CASHIER, which doesn't match."
    print(msg)
    is_success = False
else:
    msg = "[TEST 03] succeeded."
    print(msg)
logger.log("TEST 03", is_success, msg, response_json=rsp_data)

# test 4: 
print('[TEST 04]')
admin_uuid = "e0face1a-fb8b-4e77-be53-b4f14da5731f"
username = generate_random_string(5)
password = generate_random_string(8)
data = {
    "username": username,
    "user_type": "ADMIN",
    "last_login": datetime.now(timezone.utc).isoformat(),
    "password": password,
    "store_id": str(uuid.uuid4()), # random uuid
    "role_id": admin_uuid
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data) # [FIXED] Used safe variable

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 04] failed, random store id should not be able to sign up."
    print(msg)
    is_success = False
else:
    msg = "[TEST 04] succeeded."
    print(msg)
logger.log("TEST 04", is_success, msg, response_json=rsp_data)

# test 5: 
print('[TEST 05]')
admin_uuid = "e0face1a-fb8b-4e77-be53-b4f14da5731f"
store_id = "c7a41772-d2b2-4148-9271-e26321002651"
username = generate_random_string(5)
password = generate_random_string(8)
data = {
    "username": username,
    "user_type": "ADMIN",
    "last_login": datetime.now(timezone.utc).isoformat(),
    "password": password,
    "store_id": store_id,
    "role_id": admin_uuid
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data) # [FIXED] Used safe variable

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 05] failed, ADMIN registration should not be possible."
    is_success = False
    print(msg)
else:
    msg = "[TEST 05] succeed."
    print(msg)
logger.log("TEST 05", is_success, msg, response_json=rsp_data)

# test 6: 
print('[TEST 06]')
cashier_uuid = "6aa24dd0-7863-46ba-a779-37312a71e357"
store_id = "c7a41772-d2b2-4148-9271-e26321002651"
username = generate_random_string(5)
password = generate_random_string(8)
data = {
    "username": username,
    "user_type": "CASHIER",
    "last_login": datetime.now(timezone.utc).isoformat(),
    "password": password,
    "store_id": store_id,
    "role_id": cashier_uuid
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data) # [FIXED] Used safe variable

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 06] succeeded."
    print(msg)
else:
    msg = "[TEST 06] failed."
    print(msg)
    is_success = False
logger.log("TEST 06", is_success, msg, response_json=rsp_data)

logger.save_to_file()