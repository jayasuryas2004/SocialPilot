import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.social_account import SocialAccount
from app.core.vault import decrypt_token


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_facebook_login_redirect(client):
    """
    Test that GET /api/social/facebook/login returns 307 redirect
    pointing to Meta v18.0 OAuth Dialog with required scopes.
    """
    with patch.dict("os.environ", {
        "FACEBOOK_CLIENT_ID": "test_fb_client_123",
        "FACEBOOK_CLIENT_SECRET": "test_fb_secret_456",
        "FACEBOOK_REDIRECT_URI": "http://localhost:8000/api/social/facebook/callback"
    }):
        response = client.get("/api/social/facebook/login", follow_redirects=False)
        assert response.status_code == 307
        redirect_url = response.headers.get("location", "")
        assert "https://www.facebook.com/v18.0/dialog/oauth" in redirect_url
        assert "client_id=test_fb_client_123" in redirect_url
        assert "pages_manage_posts" in redirect_url
        assert "pages_read_engagement" in redirect_url
        assert "pages_show_list" in redirect_url


def test_facebook_callback_success_with_pages(client, db_session):
    """
    Test that GET /api/social/facebook/callback successfully exchanges authorization code,
    fetches page access tokens via mocked httpx, and persists them into the database.
    """
    mock_token_resp = MagicMock()
    mock_token_resp.status_code = 200
    mock_token_resp.json.return_value = {
        "access_token": "mock_user_fb_token_xyz",
        "token_type": "bearer",
        "expires_in": 5184000
    }
    mock_token_resp.text = '{"access_token": "mock_user_fb_token_xyz"}'

    mock_pages_resp = MagicMock()
    mock_pages_resp.status_code = 200
    mock_pages_resp.json.return_value = {
        "data": [
            {
                "id": "fb_page_1001",
                "name": "SocialPilot Brand Page",
                "access_token": "mock_page_access_token_789",
                "category": "Software Company"
            }
        ]
    }
    mock_pages_resp.text = '{"data": [{"id": "fb_page_1001"}]}'

    async def mock_async_get(url, *args, **kwargs):
        if "oauth/access_token" in url:
            return mock_token_resp
        elif "me/accounts" in url:
            return mock_pages_resp
        return mock_token_resp

    with patch("httpx.AsyncClient.get", side_effect=mock_async_get):
        with patch.dict("os.environ", {
            "FACEBOOK_CLIENT_ID": "test_fb_client_123",
            "FACEBOOK_CLIENT_SECRET": "test_fb_secret_456",
            "FACEBOOK_REDIRECT_URI": "http://localhost:8000/api/social/facebook/callback",
            "FRONTEND_URL": "http://localhost:3000"
        }):
            # Ensure a user exists in DB
            test_user = db_session.query(User).first()
            if not test_user:
                test_user = User(name="FB Tester", email="fbtester@example.com", password_hash="hash")
                db_session.add(test_user)
                db_session.commit()

            response = client.get(
                f"/api/social/facebook/callback?code=mock_valid_fb_code_123&state=user_{test_user.id}",
                follow_redirects=False
            )

            assert response.status_code == 307
            loc = response.headers.get("location", "")
            assert "connect_accounts" in loc
            assert "status=success" in loc
            assert "platform=facebook" in loc

            # Verify Database Insertion and dynamic user_id assignment
            saved_acc = db_session.query(SocialAccount).filter(
                SocialAccount.platform == "facebook",
                SocialAccount.platform_user_id == "fb_page_1001"
            ).first()

            assert saved_acc is not None
            assert saved_acc.user_id == test_user.id
            assert saved_acc.account_name == "SocialPilot Brand Page"
            assert saved_acc.platform == "facebook"

            # Verify token encryption in database
            decrypted = decrypt_token(saved_acc.access_token)
            assert decrypted == "mock_page_access_token_789"


def test_facebook_callback_error_handling(client):
    """
    Test that Facebook OAuth errors or cancellation redirect back to frontend with error state.
    """
    with patch.dict("os.environ", {
        "FRONTEND_URL": "http://localhost:3000"
    }):
        response = client.get(
            "/api/social/facebook/callback?error=access_denied&error_description=Permissions+not+granted",
            follow_redirects=False
        )

        assert response.status_code == 307
        loc = response.headers.get("location", "")
        assert "connect_accounts" in loc
        assert "status=error" in loc
        assert "platform=facebook" in loc


def test_facebook_callback_missing_code(client):
    """
    Test that callback missing authorization code redirects with error.
    """
    with patch.dict("os.environ", {
        "FRONTEND_URL": "http://localhost:3000"
    }):
        response = client.get(
            "/api/social/facebook/callback",
            follow_redirects=False
        )

        assert response.status_code == 307
        loc = response.headers.get("location", "")
        assert "connect_accounts" in loc
        assert "status=error" in loc


def test_facebook_login_with_user_id(client):
    """
    Test that GET /api/social/facebook/login?user_id=42 sets state=user_42.
    """
    with patch.dict("os.environ", {
        "FACEBOOK_CLIENT_ID": "test_fb_client_123",
        "FACEBOOK_CLIENT_SECRET": "test_fb_secret_456",
        "FACEBOOK_REDIRECT_URI": "http://localhost:8000/api/social/facebook/callback"
    }):
        response = client.get("/api/social/facebook/login?user_id=42", follow_redirects=False)
        assert response.status_code == 307
        redirect_url = response.headers.get("location", "")
        assert "state=user_42" in redirect_url


def test_facebook_callback_malformed_state(client):
    """
    Test that callback with missing or malformed state returns 400 Bad Request.
    """
    with patch.dict("os.environ", {
        "FACEBOOK_CLIENT_ID": "test_fb_client_123",
        "FACEBOOK_CLIENT_SECRET": "test_fb_secret_456",
        "FACEBOOK_REDIRECT_URI": "http://localhost:8000/api/social/facebook/callback",
        "FRONTEND_URL": "http://localhost:3000"
    }):
        response = client.get(
            "/api/social/facebook/callback?code=mock_valid_code&state=invalid_non_numeric_user",
            follow_redirects=False
        )
        assert response.status_code == 400
        assert "Missing or malformed OAuth state parameter" in response.json()["detail"]
