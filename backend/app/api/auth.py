from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.core.limiter import limiter

# Create API router for authentication endpoints
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account with rate limiting (5 requests/minute):
    1. Validate if the email address is already registered.
    2. Hash the raw password securely using bcrypt.
    3. Persist the new user record in the database.
    4. Generate and return a signed JWT authentication token.
    Strictly uses standard control flow (zero comprehensions or lambda expressions).
    """
    # Check if a user with this email already exists
    clean_email = payload.email.lower().strip()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Securely hash the password
    secure_hash = hash_password(payload.password)

    # Instantiate the new User database model
    new_user = User(
        name=payload.name.strip(),
        email=clean_email,
        password_hash=secure_hash,
        role=payload.role or "creator"
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
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user with rate limiting (5 requests/minute):
    1. Look up user by email address.
    2. Verify provided password against stored bcrypt hash.
    3. Return signed JWT access token and user profile on success.
    Strictly uses standard control flow (zero comprehensions or lambda expressions).
    """
    clean_email = payload.email.lower().strip()

    # Look up user record
    user = db.query(User).filter(User.email == clean_email).first()

    # If user does not exist or password verification fails, return 401 Unauthorized
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    is_valid = verify_password(payload.password, user.password_hash)
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


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile claims.
    """
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
