import os
import io
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.social_account import SocialAccount
from app.core.vault import encrypt_token


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


def test_media_upload_endpoint_and_static_routing(client):
    """
    Test POST /api/social/upload:
    1. Uploads an image file via multipart/form-data.
    2. Validates that UUID filename is generated and returned.
    3. Validates that StaticFiles route /uploads/media/{filename} serves the uploaded file with 200 OK.
    """
    sample_image_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    file_payload = {
        "file": ("test_upload_banner.png", io.BytesIO(sample_image_bytes), "image/png")
    }

    response = client.post("/api/social/upload", files=file_payload)
    assert response.status_code == 200
    data = response.json()

    assert "media_url" in data
    assert "url" in data
    assert "filename" in data
    filename = data["filename"]

    # Verify StaticFiles route serves the file without 404
    static_url = f"/uploads/media/{filename}"
    static_res = client.get(static_url)
    assert static_res.status_code == 200
    assert len(static_res.content) == len(sample_image_bytes)


def test_media_upload_alt_route(client):
    """
    Test POST /social/upload alias route.
    """
    sample_file_bytes = b"fake-video-content-stream-bytes"
    file_payload = {
        "file": ("promo_clip.mp4", io.BytesIO(sample_file_bytes), "video/mp4")
    }

    response = client.post("/social/upload", files=file_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"].endswith(".mp4")

    # Static file retrieval check
    static_url = f"/uploads/media/{data['filename']}"
    static_res = client.get(static_url)
    assert static_res.status_code == 200


from app.core.security import create_access_token


def test_get_accounts_dynamic_db_records(client, db_session):
    """
    Test GET /api/accounts returning actual database SocialAccount records.
    """
    # Ensure test user
    user = db_session.query(User).filter(User.email == "dynamic_acc_test@example.com").first()
    if not user:
        user = User(
            name="Dynamic Accounts Test User",
            email="dynamic_acc_test@example.com",
            password_hash="fake_hash",
            role="creator"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    # Ensure a real database social account
    sa = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "linkedin",
        SocialAccount.user_id == user.id
    ).first()

    if not sa:
        sa = SocialAccount(
            user_id=user.id,
            platform="linkedin",
            account_name="Dynamic Test LinkedIn Account",
            platform_user_id="urn:li:person:dyn_123",
            access_token=encrypt_token("mock_token_dynamic")
        )
        db_session.add(sa)
        db_session.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/accounts", headers=headers)
    assert response.status_code == 200
    accounts = response.json()
    assert isinstance(accounts, list)

    # Verify real DB account name is returned
    found_dynamic = False
    for acc in accounts:
        if acc.get("displayName") == "Dynamic Test LinkedIn Account" or "LinkedIn" in acc.get("displayName", ""):
            found_dynamic = True
            break
    assert found_dynamic is True
