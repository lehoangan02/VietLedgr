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

logger = TestLogger("AUTH_UNIT_TEST_LOGIN")

def get_response_data(response):
    """Safely extracts JSON or returns text if JSON parsing fails."""
    try:
        return response.json()
    except Exception:
        return f"CRITICAL SERVER ERROR (Non-JSON): {response.text}"

# test the signup api

url = "http://127.0.0.1:8000/api/auth/login"

# test 1: 
print('[TEST 01]')
data = {
    "grant_type": "password",
    "username": "lhan02",
    "password": "password"
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

response = requests.post(url=url, data=data, headers=headers)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data) # [FIXED] Used safe variable

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 01] succeeded."
    print(msg)
else:
    msg = "[TEST 01] failed, this should work (with lhan02 and password registered)."
    print(msg)
    is_success = False
logger.log("TEST 01", is_success, msg, response_json=rsp_data)

# test 2: 
print('[TEST 02]')
data = {
    "grant_type": "password",
    "username": "napoleon",
    "password": "password"
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data)

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 02] failed, 'napoleon' is not an existing username."
    print(msg)
    is_success = False
else:
    msg = "[TEST 02] succeeded."
    print(msg)
logger.log("TEST 02", is_success, msg, response_json=rsp_data)

# test 3: 
print('[TEST 03]')
data = {
    "grant_type": "password",
    "username": "lhan02",
    "password": "psswrd01"
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

response = requests.post(url=url, json=data)
rsp_data = get_response_data(response)

print(response.status_code)
print(rsp_data)

msg = ""
is_success = True
if (response.status_code == 200):
    msg = "[TEST 03] failed, 'psswrd01' is not the correct password."
    print(msg)
    is_success = False
else:
    msg = "[TEST 03] succeeded."
    print(msg)
logger.log("TEST 03", is_success, msg, response_json=rsp_data)

logger.save_to_file()