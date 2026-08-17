from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    """
    Schema for user registration payload.
    """
    name: str
    email: str
    password: str
    role: Optional[str] = "creator"


class LoginRequest(BaseModel):
    """
    Schema for user login credentials.
    """
    email: str
    password: str


class UserResponse(BaseModel):
    """
    Public user profile data returned to client.
    """
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """
    Authentication response containing access tokens and profile.
    """
    message: str
    token: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
