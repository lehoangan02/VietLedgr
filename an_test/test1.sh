curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "lhan",
    "password": "password",
    "user_type": "ADMIN",
    "store_id": "c7a41772-d2b2-4148-9271-e26321002651",
    "role_id": "e0face1a-fb8b-4e77-be53-b4f14da5731f"
  }'