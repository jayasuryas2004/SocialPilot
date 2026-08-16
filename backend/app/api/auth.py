from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
import jwt

from database import get_db
from models.user import User
from schemas.auth import RegisterRequest, LoginRequest

# Create API router for authentication endpoints
router = APIRouter(prefix="/auth", tags=["Authentication"])

# JWT Configuration constants
SECRET_KEY = "socialpilot-super-secret-jwt-signing-key-for-sha256-authentication-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7



def hash_password(password: str) -> str:
    """
    Plain-English Explanation:
    We take the plain text password string, convert it into bytes,
    generate a cryptographically secure random salt using bcrypt,
    and then compute the salted hash. This ensures passwords cannot be
    reversed if the database is compromised.
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_password_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Plain-English Explanation:
    We verify an incoming plain text password against a stored bcrypt hash.
    Bcrypt automatically extracts the salt from the stored hash and
    computes the comparison securely without exposing raw values.
    """
    plain_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_bytes, hashed_bytes)


def create_access_token(data_payload: dict, expires_delta: timedelta = None) -> str:
    """
    Plain-English Explanation:
    We create a JSON Web Token (JWT) containing user claims (such as user ID and email)
    and an expiration timestamp. The token is cryptographically signed using our SECRET_KEY
    so the client can prove their authenticated identity on subsequent API requests.
    """
    claims = {}

    # Copy dictionary keys using a standard iterative loop (no dict/list comprehensions)
    for key in data_payload:
        claims[key] = data_payload[key]

    if expires_delta:
        expire_time = datetime.utcnow() + expires_delta
    else:
        expire_time = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

    claims["exp"] = expire_time
    token_string = jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)
    return token_string


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account:
    1. Validate if the email address is already registered.
    2. Hash the raw password securely.
    3. Persist the new user record in the database.
    4. Generate and return a signed JWT authentication token.
    """
    # Check if a user with this email already exists
    existing_user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Securely hash the password
    secure_hash = hash_password(request.password)

    # Instantiate the new User database model
    new_user = User(
        name=request.name.strip(),
        email=request.email.lower().strip(),
        password_hash=secure_hash,
        role=request.role or "creator"
    )

    # Save to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate access token
    token_payload = {
        "sub": str(new_user.id),
        "email": new_user.email,
        "role": new_user.role
    }
    token = create_access_token(token_payload)

    return {
        "message": "User registered successfully",
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user:
    1. Look up user by email address.
    2. Verify provided password against stored bcrypt hash.
    3. Return signed JWT access token and user profile on success.
    """
    # Look up user record
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()

    # If user does not exist or password verification fails, return 401 Unauthorized
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    is_valid = verify_password(request.password, user.password_hash)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Generate access token
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    }
    token = create_access_token(token_payload)

    return {
        "message": "Login successful",
        "token": token,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }
