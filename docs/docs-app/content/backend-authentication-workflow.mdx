# Backend Authentication Workflow

## Overview

The VietLedgr backend implements a secure JWT (JSON Web Token) authentication system using the OAuth2 Password Bearer flow. This document explains the complete authentication workflow, security mechanisms, and implementation details.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Components](#core-components)
- [Authentication Flow](#authentication-flow)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)

## Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /auth/signup or /auth/login
       │    (username, password)
       ▼
┌─────────────────────────────────────┐
│     FastAPI Application             │
│  ┌───────────────────────────────┐  │
│  │  Authentication Routes        │  │
│  │  (app/api/routes/auth.py)    │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │  Security Module              │  │
│  │  - Password Hashing (Argon2) │  │
│  │  - JWT Token Generation       │  │
│  │  (app/core/security.py)      │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │  Database Operations          │  │
│  │  - User CRUD (app/crud.py)   │  │
│  │  - Models (app/models.py)    │  │
│  └───────────────────────────────┘  │
└─────────────┬───────────────────────┘
              │ 2. Returns JWT Token
              ▼
       ┌──────────────┐
       │    Client    │
       │ Stores Token │
       └──────┬───────┘
              │ 3. Subsequent Requests
              │    Authorization: Bearer <token>
              ▼
       ┌──────────────────────────┐
       │  Protected Endpoints     │
       │  (CurrentUser Dependency)│
       └──────────────────────────┘
```

## Core Components

### 1. Password Security (`app/core/security.py`)

#### Password Hashing
- **Algorithm**: Argon2 (winner of the Password Hashing Competition)
- **Library**: `passlib` with `argon2-cffi`
- **Advantages**:
  - Memory-hard algorithm (resistant to GPU/ASIC attacks)
  - No password length limitations (unlike bcrypt's 72-byte limit)
  - Configurable time and memory cost parameters

```python
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hashes the password using Argon2."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies the plain password against the hashed password."""
    return pwd_context.verify(plain_password, hashed_password)
```

#### JWT Token Generation
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 8 days (configurable)
- **Payload**: Contains user ID (`sub`) and expiration time (`exp`)

```python
def create_access_token(*, subject: str, expires_delta: timedelta | None = None) -> str:
    """Creates a new JWT access token."""
    to_encode: dict[str, Any] = {"sub": subject}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
```

### 2. User Model (`app/models.py`)

```python
class UserType(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SALER = "SALER"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID]           # Primary key (UUID)
    username: Mapped[str]            # Unique, max 64 characters
    password_hash: Mapped[str]       # Argon2 hashed password
    type: Mapped[UserType]           # User role/type
    
    stores: Mapped[list["Store"]]           # Relationship to stores
    ledger_entries: Mapped[list["LedgerEntry"]]  # Relationship to ledger entries
```

### 3. Dependencies (`app/api/deps.py`)

#### OAuth2 Bearer Token Extractor
```python
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_STR}/auth/login"
)
```

#### Database Session Dependency
```python
def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_db)]
```

#### Current User Dependency
```python
def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        token_data = TokenPayload(**payload)
    except (PyJWTError, ValidationError):
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    
    # Fetch user from database
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]
```

## Authentication Flow

### 1. User Registration (Signup)

**Endpoint**: `POST /api/auth/signup`

**Request Body**:
```json
{
    "username": "john_doe",
    "password": "SecurePassword123!",
    "userType": "SALER"
}
```

**Flow**:
```
1. Receive signup request
   ↓
2. Check if username already exists
   ├─ YES → Return 400 "Username already registered"
   └─ NO  → Continue
   ↓
3. Hash password using Argon2
   ↓
4. Create user in database with:
   - Generated UUID
   - Username
   - Password hash
   - User type
   ↓
5. Generate JWT access token
   - Subject: user.id (UUID as string)
   - Expiration: 8 days
   ↓
6. Return response with:
   - access_token
   - token_type: "bearer"
   - user_id
   - username
   - type
```

**Response**:
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "type": "SALER"
}
```

### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Request Body** (OAuth2 form data):
```
username=john_doe&password=SecurePassword123!
```

**Flow**:
```
1. Receive login request (OAuth2PasswordRequestForm)
   ↓
2. Fetch user by username from database
   ├─ NOT FOUND → Return 400 "Incorrect username or password"
   └─ FOUND     → Continue
   ↓
3. Verify password using Argon2
   ├─ INVALID → Return 400 "Incorrect username or password"
   └─ VALID   → Continue
   ↓
4. Generate JWT access token
   - Subject: user.id (UUID as string)
   - Expiration: 8 days
   ↓
5. Return token response
```

**Response**:
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
}
```

### 3. Accessing Protected Routes

**Request**:
```http
GET /api/protected-endpoint HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Flow**:
```
1. Client sends request with Authorization header
   ↓
2. OAuth2PasswordBearer extracts token
   ├─ Missing/Invalid → Return 401 Unauthorized
   └─ Valid format   → Continue
   ↓
3. get_current_user() dependency executes:
   a. Decode JWT token using SECRET_KEY
      ├─ Expired/Invalid → Return 403 Forbidden
      └─ Valid          → Continue
   
   b. Extract user_id from token payload (sub field)
   
   c. Query database for user by ID
      ├─ NOT FOUND → Return 404 "User not found"
      └─ FOUND     → Continue
   ↓
4. Return User object to route handler
   ↓
5. Route handler processes request with authenticated user
```

### 4. Password Reset

**Endpoint**: `POST /api/auth/password-reset`

**Request Body**:
```json
{
    "current_password": "OldPassword123!",
    "new_password": "NewPassword456!"
}
```

**Query Parameters**:
- `user_id`: UUID of the user

**Flow**:
```
1. Receive password reset request
   ↓
2. Fetch user by user_id from database
   ├─ NOT FOUND → Return 404 "User not found"
   └─ FOUND     → Continue
   ↓
3. Verify current password using Argon2
   ├─ INVALID → Return 400 "Incorrect password"
   └─ VALID   → Continue
   ↓
4. Hash new password using Argon2
   ↓
5. Update user record in database
   ↓
6. Return success message
```

**Response**:
```json
{
    "message": "Password updated successfully"
}
```

## Security Features

### 1. Password Security
- **Argon2 Algorithm**: Memory-hard hashing resistant to brute-force attacks
- **Automatic Salting**: Each password gets a unique salt
- **Configurable Parameters**: Can adjust time cost, memory cost, and parallelism
- **No Length Limitations**: Unlike bcrypt, handles passwords of any length

### 2. Token Security
- **JWT Standard**: Industry-standard token format
- **HMAC-SHA256 Signing**: Prevents token tampering
- **Expiration Time**: 8-day validity reduces attack window
- **UUID Subject**: Uses UUIDs instead of sequential IDs for user identification

### 3. OAuth2 Compliance
- **Standard Flow**: Compatible with OAuth2 Password Bearer flow
- **Bearer Token**: Standard Authorization header format
- **Token URL**: Properly configured token endpoint

### 4. Error Handling
- **Generic Error Messages**: "Incorrect username or password" doesn't reveal if username exists
- **Appropriate Status Codes**:
  - 400: Bad Request (invalid credentials, duplicate username)
  - 401: Unauthorized (missing/invalid token)
  - 403: Forbidden (invalid token signature/expired)
  - 404: Not Found (user doesn't exist)

### 5. Database Security
- **Password Hashing**: Passwords never stored in plain text
- **UUID Primary Keys**: Prevents enumeration attacks
- **Cascade Deletion**: Proper cleanup of related records

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user account | No |
| POST | `/api/auth/login` | Login and receive access token | No |
| POST | `/api/auth/password-reset` | Reset user password | Yes (via user_id) |

## Usage Examples

### Protecting a Route

To protect an endpoint and access the current authenticated user:

```python
from fastapi import APIRouter
from app.api.deps import CurrentUser

router = APIRouter()

@router.get("/profile")
def get_profile(current_user: CurrentUser):
    """Get current user profile - requires authentication"""
    return {
        "user_id": str(current_user.id),
        "username": current_user.username,
        "type": current_user.type
    }
```

### Client Implementation Example (JavaScript)

```javascript
// 1. Signup
async function signup(username, password, userType) {
    const response = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType })
    });
    const data = await response.json();
    
    // Store token in localStorage or secure cookie
    localStorage.setItem('access_token', data.access_token);
    return data;
}

// 2. Login
async function login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    });
    const data = await response.json();
    
    // Store token
    localStorage.setItem('access_token', data.access_token);
    return data;
}

// 3. Access Protected Endpoint
async function fetchProtectedData() {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.status === 401) {
        // Token expired or invalid - redirect to login
        window.location.href = '/login';
        return;
    }
    
    return await response.json();
}

// 4. Password Reset
async function resetPassword(userId, currentPassword, newPassword) {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`http://localhost:8000/api/auth/password-reset?user_id=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
        })
    });
    
    return await response.json();
}
```

## Configuration

### Environment Variables

Configure authentication settings in `.env` file:

```env
# Security
SECRET_KEY=your-secret-key-here  # Used for JWT signing (auto-generated if not provided)
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 days (60 * 24 * 8)

# API
API_STR=/api

# Database
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=VietLedgr

# CORS
FRONTEND_HOST=http://localhost:3000
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Settings (`app/core/config.py`)

Key configuration parameters:

```python
class Settings(BaseSettings):
    API_STR: str = "/api"
    SECRET_KEY: str = secrets.token_urlsafe(32)  # Auto-generated secure key
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    FRONTEND_HOST: str = "http://localhost:3000"
    # ... other settings
```

## Best Practices

### 1. Token Storage (Client-Side)
- **Recommended**: HTTP-only secure cookies (for web apps)
- **Alternative**: localStorage (easier but vulnerable to XSS)
- **Never**: Store in plain cookies accessible to JavaScript

### 2. Token Refresh
- Current implementation uses long-lived tokens (8 days)
- **Future Enhancement**: Implement refresh token mechanism for better security
  - Short-lived access tokens (15 minutes)
  - Long-lived refresh tokens (30 days)
  - Token rotation on refresh

### 3. Password Requirements
- **Current**: No validation on backend (should be added)
- **Recommended**: Implement password strength validation:
  - Minimum 8 characters
  - Mix of uppercase, lowercase, numbers, special characters
  - Not in common password list

### 4. Rate Limiting
- **Future Enhancement**: Add rate limiting to prevent brute-force attacks:
  - Limit login attempts per IP/username
  - Implement exponential backoff
  - Use tools like `slowapi` or Redis-based rate limiting

### 5. HTTPS Only
- **Production**: Always use HTTPS to prevent token interception
- **Development**: HTTP acceptable for localhost only

## Troubleshooting

### Common Issues

#### 1. "Could not validate credentials" (403)
- **Cause**: Invalid or expired JWT token
- **Solution**: Re-authenticate and obtain new token

#### 2. "User not found" (404)
- **Cause**: Token contains ID of deleted user
- **Solution**: Re-authenticate

#### 3. "Username already registered" (400)
- **Cause**: Username already exists in database
- **Solution**: Choose different username

#### 4. "Incorrect username or password" (400)
- **Cause**: Invalid credentials during login
- **Solution**: Verify username and password

### Debugging Tips

```python
# Enable JWT token inspection in development
import jwt

token = "your-token-here"
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
print(f"User ID: {payload['sub']}")
print(f"Expires: {datetime.fromtimestamp(payload['exp'])}")
```

## Related Files

- **Authentication Routes**: `src/backend/app/api/routes/auth.py`
- **Security Module**: `src/backend/app/core/security.py`
- **Dependencies**: `src/backend/app/api/deps.py`
- **User Model**: `src/backend/app/models.py`
- **CRUD Operations**: `src/backend/app/crud.py`
- **Configuration**: `src/backend/app/core/config.py`
- **Database**: `src/backend/app/core/database.py`

## Future Enhancements

1. **Refresh Token Mechanism**: Implement token refresh for better security
2. **Password Strength Validation**: Add backend password requirements
3. **Rate Limiting**: Prevent brute-force attacks
4. **Email Verification**: Verify email addresses during signup
5. **Two-Factor Authentication (2FA)**: Add optional 2FA support
6. **Account Lockout**: Lock accounts after multiple failed login attempts
7. **Session Management**: Track active sessions and allow logout from all devices
8. **Audit Logging**: Log authentication events for security monitoring

---

**Last Updated**: October 30, 2025  
**Version**: 1.0  
**Maintained By**: VietLedgr Development Team
