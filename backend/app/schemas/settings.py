from pydantic import BaseModel
from typing import Optional


class UserProfileResponse(BaseModel):
    """
    Response schema representing the current user's profile and settings.
    """
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    name: Optional[str] = None
    email: str
    role: str
    avatar_url: Optional[str] = None
    theme: Optional[str] = "System"
    language: Optional[str] = "English"

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    """
    Payload for updating user profile attributes.
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    """
    Payload for changing user password.
    """
    current_password: str
    new_password: str


class PreferencesUpdateRequest(BaseModel):
    """
    Payload for updating UI preferences (Theme and Language).
    """
    theme: Optional[str] = None
    language: Optional[str] = None
