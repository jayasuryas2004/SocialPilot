import os
import time
import shutil
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.settings import (
    UserProfileResponse,
    ProfileUpdateRequest,
    PasswordChangeRequest,
    PreferencesUpdateRequest
)
from app.core.security import (
    get_current_user,
    verify_password,
    hash_password
)

# Create API Routers for settings endpoints
router = APIRouter(prefix="/settings", tags=["Settings"])
router_api = APIRouter(prefix="/api/settings", tags=["Settings"])

# Base uploads directory path for avatars
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AVATARS_DIR = os.path.join(BASE_DIR, "uploads", "avatars")
os.makedirs(AVATARS_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif"
}


def build_profile_payload(user: User) -> Dict[str, Any]:
    """
    Helper function to build a structured profile dictionary for a User.
    Strictly uses standard control flow (no comprehensions or lambdas).
    """
    first_name_val = user.first_name
    last_name_val = user.last_name
    username_val = user.username

    # Fallback to deriving first and last names from user.name if not explicitly set
    if not first_name_val and user.name:
        name_parts = user.name.strip().split()
        if len(name_parts) > 0:
            first_name_val = name_parts[0]
            if len(name_parts) > 1:
                remaining_parts = []
                idx = 1
                while idx < len(name_parts):
                    remaining_parts.append(name_parts[idx])
                    idx += 1
                last_name_val = " ".join(remaining_parts)
            else:
                last_name_val = ""

    # Fallback to deriving username from email if not set
    if not username_val and user.email:
        email_parts = user.email.split("@")
        username_val = email_parts[0]

    return {
        "id": user.id,
        "first_name": first_name_val or "",
        "last_name": last_name_val or "",
        "username": username_val or "",
        "name": user.name or "",
        "email": user.email,
        "role": user.role or "creator",
        "avatar_url": user.avatar_url,
        "theme": user.theme or "System",
        "language": user.language or "English"
    }


# ==========================================
# 1. GET USER PROFILE
# ==========================================
@router.get("/profile")
@router_api.get("/profile")
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch the current authenticated user's profile and preference details.
    """
    profile_data = build_profile_payload(current_user)
    return profile_data


# ==========================================
# 2. UPDATE USER PROFILE
# ==========================================
@router.put("/profile")
@router_api.put("/profile")
def update_user_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's First Name, Last Name, Username, and Role.
    Commits changes safely within a try...except rollback block.
    """
    try:
        if payload.first_name is not None:
            current_user.first_name = payload.first_name.strip()

        if payload.last_name is not None:
            current_user.last_name = payload.last_name.strip()

        if payload.username is not None:
            cleaned_username = payload.username.strip()
            # Check if username is already taken by another user
            if len(cleaned_username) > 0:
                existing_with_username = db.query(User).filter(
                    User.username == cleaned_username,
                    User.id != current_user.id
                ).first()
                if existing_with_username:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="This username is already taken by another user."
                    )
            current_user.username = cleaned_username

        if payload.role is not None:
            current_user.role = payload.role.strip()

        # Update full name string
        name_elements = []
        if current_user.first_name:
            name_elements.append(current_user.first_name)
        if current_user.last_name:
            name_elements.append(current_user.last_name)

        if len(name_elements) > 0:
            current_user.name = " ".join(name_elements)

        db.commit()
        db.refresh(current_user)

    except HTTPException:
        db.rollback()
        raise
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(err)}"
        )

    updated_profile = build_profile_payload(current_user)
    return {
        "message": "Profile updated successfully.",
        "profile": updated_profile,
        "user": updated_profile
    }


# ==========================================
# 3. UPLOAD AVATAR
# ==========================================
@router.post("/avatar")
@router_api.post("/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept multipart/form-data image upload, persist locally in uploads/avatars,
    and update the user's avatar_url in the database.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided."
        )

    # Validate content type
    content_type = file.content_type or ""
    if content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF."
        )

    # Validate file extension
    _, ext = os.path.splitext(file.filename)
    clean_ext = ext.lower()
    if clean_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension: '{clean_ext}'. Allowed: .jpg, .jpeg, .png, .webp, .gif"
        )

    # Sanitize base filename
    raw_name, _ = os.path.splitext(file.filename)
    safe_name = re.sub(r"[^a-zA-Z0-9_\-]", "_", raw_name)
    timestamp = int(time.time())
    unique_filename = f"avatar_user_{current_user.id}_{timestamp}_{safe_name}{clean_ext}"
    destination_path = os.path.join(AVATARS_DIR, unique_filename)

    try:
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as file_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image file: {str(file_err)}"
        )
    finally:
        file.file.close()

    # Relative path URL for static serving
    avatar_url = f"/uploads/avatars/{unique_filename}"

    try:
        current_user.avatar_url = avatar_url
        db.commit()
        db.refresh(current_user)
    except Exception as db_err:
        db.rollback()
        # Clean up saved file on database error
        if os.path.exists(destination_path):
            try:
                os.remove(destination_path)
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update avatar in database: {str(db_err)}"
        )

    return {
        "message": "Avatar uploaded successfully.",
        "avatar_url": current_user.avatar_url
    }


# ==========================================
# 4. CHANGE PASSWORD
# ==========================================
@router.put("/password")
@router_api.put("/password")
def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify current password against bcrypt hash, validate new password,
    and persist new hashed password safely with rollback protection.
    """
    if not payload.current_password or len(payload.current_password.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is required."
        )

    if not payload.new_password or len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    # Verify current password
    is_valid = verify_password(payload.current_password, current_user.password_hash)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The current password you entered is incorrect."
        )

    # Hash new password
    new_hash = hash_password(payload.new_password)

    try:
        current_user.password_hash = new_hash
        db.commit()
        db.refresh(current_user)
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update password: {str(err)}"
        )

    return {
        "message": "Password changed successfully."
    }


# ==========================================
# 5. UPDATE PREFERENCES
# ==========================================
@router.put("/preferences")
@router_api.put("/preferences")
def update_preferences(
    payload: PreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user UI preferences (Theme: Light/Dark/System and Language).
    Commits changes safely within a try...except rollback block.
    """
    try:
        if payload.theme is not None:
            current_user.theme = payload.theme.strip()

        if payload.language is not None:
            current_user.language = payload.language.strip()

        db.commit()
        db.refresh(current_user)
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(err)}"
        )

    return {
        "message": "Preferences updated successfully.",
        "theme": current_user.theme,
        "language": current_user.language
    }
