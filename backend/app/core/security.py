import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import get_db
from app.models.user import User

load_dotenv()

# JWT configuration constants
SECRET_KEY = os.getenv("SECRET_KEY", "socialpilot-super-secret-jwt-signing-key-for-sha256-authentication-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# HTTP Bearer security scheme
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """
    Hashes a raw password string using bcrypt with a cryptographically secure salt.
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_password_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain text password against a stored bcrypt hash string.
    """
    plain_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_bytes, hashed_bytes)


def create_access_token(data_payload: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Encodes and signs a JSON Web Token containing claims and an expiration timestamp.
    Strictly uses standard iterative loops (no dict/list comprehensions or lambdas).
    """
    claims = {}
    for key in data_payload:
        claims[key] = data_payload[key]

    if expires_delta:
        expire_time = datetime.utcnow() + expires_delta
    else:
        expire_time = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

    claims["exp"] = expire_time
    token_str = jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)
    return token_str


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a JWT token.
    Raises jwt exceptions if signature is invalid or token is expired.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload


def get_current_user(
    auth_creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that parses the incoming JWT from HTTP Authorization Bearer headers,
    decodes it, and validates the user session against the database.
    Raises 401 Unauthorized if the token is missing, invalid, or user is not found.
    Strictly uses standard control flow.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please provide a valid Bearer token.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    if not auth_creds or not auth_creds.credentials:
        raise credentials_exception

    token = auth_creds.credentials.strip()
    if len(token) == 0:
        raise credentials_exception

    try:
        payload = decode_access_token(token)
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise credentials_exception
        user_id = int(user_id_raw)
    except Exception:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user
