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

logger = TestLogger("AUTH_UNIT_TEST_PASSWORD_RESET")

def get_response_data(response):
    """Safely extracts JSON or returns text if JSON parsing fails."""
    try:
        return response.json()
    except Exception:
        return f"CRITICAL SERVER ERROR (Non-JSON): {response.text}"

# test the signup api

url = "http://127.0.0.1:8000/api/auth/password-reset"

# test 1: 
print('[TEST 01]')
params = {
    "user_id": "f2d58944-3cb8-48e8-982e-d31bb4e79815"
}

payload = {
    "old_password": "password02",
    "new_password": "password"
}

response = requests.post(url, params=params, json=payload)
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

logger.save_to_file()