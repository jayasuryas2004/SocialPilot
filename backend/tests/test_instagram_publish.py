import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.social_account import SocialAccount
from app.core.vault import encrypt_token, decrypt_token
from app.core.security import create_access_token
from app.services.instagram_service import publish_to_instagram


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def setup_ig_user_and_vault(db_session):
    # Ensure test user
    user = db_session.query(User).first()
    if not user:
        user = User(
            name="IG Test User",
            email="ig_test@example.com",
            password_hash="fake_hash",
            role="creator"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    # Ensure Instagram social account in database
    ig_acc = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "instagram",
        SocialAccount.platform_user_id == "ig_biz_account_123"
    ).first()

    if not ig_acc:
        ig_acc = SocialAccount(
            user_id=user.id,
            platform="instagram",
            account_name="SocialPilot Instagram Professional",
            platform_user_id="ig_biz_account_123",
            access_token=encrypt_token("mock_instagram_access_token_abc")
        )
        db_session.add(ig_acc)

    # Ensure Facebook social account
    fb_acc = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "facebook"
    ).first()
    if not fb_acc:
        fb_acc = SocialAccount(
            user_id=user.id,
            platform="facebook",
            account_name="SocialPilot FB Page",
            platform_user_id="fb_page_ig_test",
            access_token=encrypt_token("mock_facebook_token")
        )
        db_session.add(fb_acc)

    # Ensure LinkedIn social account
    li_acc = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "linkedin"
    ).first()
    if not li_acc:
        li_acc = SocialAccount(
            user_id=user.id,
            platform="linkedin",
            account_name="SocialPilot LinkedIn",
            platform_user_id="urn:li:person:mock_ig_li",
            access_token=encrypt_token("mock_linkedin_token")
        )
        db_session.add(li_acc)

    db_session.commit()
    return user


def test_meta_oauth_includes_instagram_scopes(client):
    """
    Test that Meta OAuth dialog redirect includes instagram_basic and instagram_content_publish scopes.
    """
    with patch.dict("os.environ", {
        "FACEBOOK_CLIENT_ID": "mock_client_id",
        "FACEBOOK_CLIENT_SECRET": "mock_client_secret",
        "FACEBOOK_REDIRECT_URI": "http://localhost:8000/api/social/facebook/callback"
    }):
        response = client.get("/api/social/facebook/login", follow_redirects=False)
        assert response.status_code == 307
        loc = response.headers.get("location", "")
        assert "instagram_basic" in loc
        assert "instagram_content_publish" in loc
        assert "pages_manage_posts" in loc


def test_meta_callback_discovers_instagram_business_account(client, db_session, setup_ig_user_and_vault):
    """
    Test that Facebook OAuth callback queries each page for linked instagram_business_account
    and automatically persists it as platform='instagram'.
    """
    user = setup_ig_user_and_vault

    mock_token_resp = MagicMock()
    mock_token_resp.status_code = 200
    mock_token_resp.json.return_value = {"access_token": "mock_user_token_with_ig"}
    mock_token_resp.text = '{"access_token": "mock_user_token_with_ig"}'

    mock_pages_resp = MagicMock()
    mock_pages_resp.status_code = 200
    mock_pages_resp.json.return_value = {
        "data": [
            {
                "id": "fb_page_with_ig_400",
                "name": "Brand Page with IG",
                "access_token": "mock_page_token_400"
            }
        ]
    }
    mock_pages_resp.text = '{"data": [{"id": "fb_page_with_ig_400"}]}'

    mock_ig_field_resp = MagicMock()
    mock_ig_field_resp.status_code = 200
    mock_ig_field_resp.json.return_value = {
        "id": "fb_page_with_ig_400",
        "instagram_business_account": {
            "id": "ig_discovered_biz_555"
        }
    }
    mock_ig_field_resp.text = '{"instagram_business_account": {"id": "ig_discovered_biz_555"}}'

    async def mock_async_get(url, *args, **kwargs):
        if "oauth/access_token" in url:
            return mock_token_resp
        elif "me/accounts" in url:
            return mock_pages_resp
        elif "fb_page_with_ig_400" in url:
            return mock_ig_field_resp
        return mock_token_resp

    with patch("httpx.AsyncClient.get", side_effect=mock_async_get):
        with patch.dict("os.environ", {
            "FACEBOOK_CLIENT_ID": "mock_id",
            "FACEBOOK_CLIENT_SECRET": "mock_secret",
            "FACEBOOK_REDIRECT_URI": "http://localhost:8000/api/social/facebook/callback",
            "FRONTEND_URL": "http://localhost:3000"
        }):
            response = client.get(
                f"/api/social/facebook/callback?code=mock_code_with_ig&state=user_{user.id}",
                follow_redirects=False
            )
            assert response.status_code == 307
            loc = response.headers.get("location", "")
            assert "connect_accounts" in loc

            # Verify Instagram account was created in DB and assigned to dynamic user
            ig_db_acc = db_session.query(SocialAccount).filter(
                SocialAccount.platform == "instagram",
                SocialAccount.platform_user_id == "ig_discovered_biz_555"
            ).first()

            assert ig_db_acc is not None
            assert ig_db_acc.user_id == user.id
            assert "Instagram" in ig_db_acc.account_name
            assert decrypt_token(ig_db_acc.access_token) == "mock_page_token_400"


def test_instagram_service_2step_container_flow():
    """
    Test publish_to_instagram service executing Step 1 (create container) and Step 2 (publish container).
    """
    import asyncio

    mock_container_resp = MagicMock()
    mock_container_resp.status_code = 200
    mock_container_resp.json.return_value = {"id": "ig_container_998877"}
    mock_container_resp.text = '{"id": "ig_container_998877"}'

    mock_publish_resp = MagicMock()
    mock_publish_resp.status_code = 200
    mock_publish_resp.json.return_value = {"id": "ig_published_post_112233"}
    mock_publish_resp.text = '{"id": "ig_published_post_112233"}'

    async def mock_post(url, *args, **kwargs):
        if "media_publish" in url:
            # Verify creation_id passed in step 2
            data = kwargs.get("data", {})
            assert data.get("creation_id") == "ig_container_998877"
            return mock_publish_resp
        elif "media" in url:
            # Verify image_url and caption passed in step 1
            data = kwargs.get("data", {})
            assert "caption" in data
            assert "image_url" in data
            return mock_container_resp
        return mock_publish_resp

    with patch("httpx.AsyncClient.post", side_effect=mock_post):
        success, result = asyncio.run(publish_to_instagram(
            ig_account_id="ig_biz_account_123",
            access_token="mock_access_token",
            message="Testing 2-step Instagram publishing!",
            image_url="https://example.com/test_photo.jpg"
        ))

        assert success is True
        assert result["status"] == "success"
        assert result["container_id"] == "ig_container_998877"
        assert result["post_id"] == "ig_published_post_112233"


def test_unified_publish_including_instagram(client, db_session, setup_ig_user_and_vault):
    """
    Test POST /api/social/publish targeting Instagram, Facebook, and LinkedIn in a single unified request.
    """
    user = setup_ig_user_and_vault
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    mock_fb_resp = MagicMock()
    mock_fb_resp.status_code = 200
    mock_fb_resp.json.return_value = {"id": "fb_post_unified"}
    mock_fb_resp.text = '{"id": "fb_post_unified"}'

    mock_ig_container_resp = MagicMock()
    mock_ig_container_resp.status_code = 200
    mock_ig_container_resp.json.return_value = {"id": "ig_container_unified"}
    mock_ig_container_resp.text = '{"id": "ig_container_unified"}'

    mock_ig_publish_resp = MagicMock()
    mock_ig_publish_resp.status_code = 200
    mock_ig_publish_resp.json.return_value = {"id": "ig_post_unified_id"}
    mock_ig_publish_resp.text = '{"id": "ig_post_unified_id"}'

    async def mock_async_post(url, *args, **kwargs):
        if "media_publish" in url:
            return mock_ig_publish_resp
        elif "media" in url:
            return mock_ig_container_resp
        elif "feed" in url:
            return mock_fb_resp
        return mock_fb_resp

    with patch("httpx.AsyncClient.post", side_effect=mock_async_post):
        with patch("app.api.publish.publish_to_linkedin", return_value=(True, "LinkedIn published")):
            payload = {
                "content": "Tri-platform launch on Instagram, Facebook, and LinkedIn!",
                "platforms": ["instagram", "facebook", "linkedin"],
                "image_url": "https://example.com/banner.jpg"
            }

            response = client.post("/api/social/publish", json=payload, headers=headers)
            assert response.status_code == 200
            data = response.json()

            assert data["success"] is True
            results = data["results"]

            # Verify Instagram status
            assert "instagram" in results
            assert results["instagram"]["status"] == "success"
            assert results["instagram"]["post_id"] == "ig_post_unified_id"

            # Verify Facebook status
            assert "facebook" in results
            assert results["facebook"]["status"] == "success"

            # Verify LinkedIn status
            assert "linkedin" in results
            assert results["linkedin"]["status"] == "success"


def test_instagram_error_isolation(client, db_session, setup_ig_user_and_vault):
    """
    Verify error isolation:
    If Instagram container creation fails, Facebook and LinkedIn still publish successfully.
    """
    user = setup_ig_user_and_vault
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    mock_fb_resp = MagicMock()
    mock_fb_resp.status_code = 200
    mock_fb_resp.json.return_value = {"id": "fb_post_ok"}
    mock_fb_resp.text = '{"id": "fb_post_ok"}'

    mock_ig_fail_resp = MagicMock()
    mock_ig_fail_resp.status_code = 400
    mock_ig_fail_resp.json.return_value = {"error": {"message": "Invalid aspect ratio for Instagram photo"}}
    mock_ig_fail_resp.text = '{"error": "Invalid aspect ratio"}'

    async def mock_async_post(url, *args, **kwargs):
        if "media" in url:
            return mock_ig_fail_resp
        return mock_fb_resp

    with patch("httpx.AsyncClient.post", side_effect=mock_async_post):
        with patch("app.api.publish.publish_to_linkedin", return_value=(True, "LinkedIn published successfully")):
            payload = {
                "content": "Resilience test with failing Instagram container",
                "platforms": ["instagram", "facebook", "linkedin"]
            }

            response = client.post("/api/social/publish", json=payload, headers=headers)
            assert response.status_code == 200
            results = response.json()["results"]

            # Instagram failed gracefully
            assert results["instagram"]["status"] == "error"

            # Facebook and LinkedIn both succeeded
            assert results["facebook"]["status"] == "success"
            assert results["linkedin"]["status"] == "success"
