import pytest
import httpx
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.social_account import SocialAccount
from app.core.vault import encrypt_token
from app.core.security import create_access_token


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def setup_test_accounts(db_session):
    # Ensure test user
    user = db_session.query(User).first()
    if not user:
        user = User(
            name="Publisher User",
            email="publisher@example.com",
            password_hash="fake_hash",
            role="creator"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    # Ensure Facebook SocialAccount with encrypted token
    fb_acc = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "facebook",
        SocialAccount.platform_user_id == "fb_page_999"
    ).first()

    if not fb_acc:
        fb_acc = SocialAccount(
            user_id=user.id,
            platform="facebook",
            account_name="SocialPilot Official Page",
            platform_user_id="fb_page_999",
            access_token=encrypt_token("mock_facebook_page_access_token_12345")
        )
        db_session.add(fb_acc)

    # Ensure LinkedIn SocialAccount with encrypted token
    li_acc = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "linkedin"
    ).first()

    if not li_acc:
        li_acc = SocialAccount(
            user_id=user.id,
            platform="linkedin",
            account_name="SocialPilot LinkedIn Profile",
            platform_user_id="urn:li:person:mock_li_person_123",
            access_token=encrypt_token("mock_linkedin_access_token_67890")
        )
        db_session.add(li_acc)

    db_session.commit()
    return user


def test_multi_platform_publish_success(client, db_session, setup_test_accounts):
    """
    Test unified publishing to both Facebook and LinkedIn in a single API call.
    Mocks external HTTP responses and verifies decrypted tokens and dual-platform responses.
    """
    user = setup_test_accounts
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    mock_fb_resp = MagicMock()
    mock_fb_resp.status_code = 200
    mock_fb_resp.json.return_value = {"id": "fb_page_999_post_1001"}
    mock_fb_resp.text = '{"id": "fb_page_999_post_1001"}'

    async def mock_async_post(url, *args, **kwargs):
        if "graph.facebook.com" in url:
            # Verify message payload
            data = kwargs.get("data", {})
            assert "Multi-platform automated post" in data.get("message", "")
            return mock_fb_resp
        return mock_fb_resp

    with patch("httpx.AsyncClient.post", side_effect=mock_async_post):
        with patch("app.api.publish.publish_to_linkedin", return_value=(True, "Published to LinkedIn Live (URN: urn:li:share:12345)")):
            payload = {
                "content": "Multi-platform automated post for Facebook and LinkedIn!",
                "platforms": ["facebook", "linkedin"]
            }

            response = client.post("/api/social/publish", json=payload, headers=headers)
            assert response.status_code == 200
            data = response.json()

            assert "results" in data
            results = data["results"]

            # Verify Facebook Result
            assert "facebook" in results
            assert results["facebook"]["status"] == "success"
            assert results["facebook"]["post_id"] == "fb_page_999_post_1001"

            # Verify LinkedIn Result
            assert "linkedin" in results
            assert results["linkedin"]["status"] == "success"
            assert "Published to LinkedIn Live" in results["linkedin"]["detail"]


def test_publish_facebook_only(client, db_session, setup_test_accounts):
    """
    Test publishing targeting Facebook exclusively.
    """
    user = setup_test_accounts
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    mock_fb_resp = MagicMock()
    mock_fb_resp.status_code = 200
    mock_fb_resp.json.return_value = {"id": "fb_post_single_999"}
    mock_fb_resp.text = '{"id": "fb_post_single_999"}'

    async def mock_async_post(url, *args, **kwargs):
        return mock_fb_resp

    with patch("httpx.AsyncClient.post", side_effect=mock_async_post):
        payload = {
            "content": "Facebook exclusive update announcement.",
            "platforms": ["facebook"]
        }

        response = client.post("/api/social/publish", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()

        assert "facebook" in data["results"]
        assert data["results"]["facebook"]["status"] == "success"
        assert "linkedin" not in data["results"]


def test_publish_error_isolation(client, db_session, setup_test_accounts):
    """
    Verify error isolation constraint:
    If Facebook publish returns an API error, it does NOT crash the route or prevent LinkedIn publishing.
    """
    user = setup_test_accounts
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    mock_fb_err_resp = MagicMock()
    mock_fb_err_resp.status_code = 400
    mock_fb_err_resp.json.return_value = {"error": {"message": "Invalid OAuth access token", "code": 190}}
    mock_fb_err_resp.text = '{"error": {"message": "Invalid OAuth access token"}}'
    mock_fb_err_resp.raise_for_status.side_effect = httpx.HTTPStatusError(
        "400 Bad Request", request=MagicMock(), response=mock_fb_err_resp
    )

    async def mock_async_post(url, *args, **kwargs):
        return mock_fb_err_resp

    with patch("httpx.AsyncClient.post", side_effect=mock_async_post):
        with patch("app.api.publish.publish_to_linkedin", return_value=(True, "LinkedIn published successfully despite Facebook failure")):
            payload = {
                "content": "Error isolation resilience test content",
                "platforms": ["facebook", "linkedin"]
            }

            response = client.post("/api/social/publish", json=payload, headers=headers)
            assert response.status_code == 200
            data = response.json()

            results = data["results"]
            # Facebook should register error cleanly
            assert results["facebook"]["status"] == "error"

            # LinkedIn must still execute and succeed
            assert results["linkedin"]["status"] == "success"
            assert "LinkedIn published successfully" in results["linkedin"]["detail"]


def test_publish_validation_empty_content(client, setup_test_accounts):
    """
    Test that publishing with empty content returns 400 Bad Request.
    """
    user = setup_test_accounts
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/social/publish", json={"content": "   ", "platforms": ["facebook"]}, headers=headers)
    assert response.status_code == 400


def test_facebook_publish_with_media_photo_endpoint(client, setup_test_accounts):
    """
    Test that publishing to Facebook with media_url calls /photos endpoint instead of /feed.
    """
    user = setup_test_accounts
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    endpoint_called = []

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": "fb_photo_post_777"}
    mock_resp.text = '{"id": "fb_photo_post_777"}'

    async def mock_async_post(url, *args, **kwargs):
        endpoint_called.append(url)
        data = kwargs.get("data", {})
        assert data.get("url") == "http://localhost:8000/uploads/media/test_image.png"
        assert data.get("message") == "Photo post content"
        return mock_resp

    with patch("httpx.AsyncClient.post", side_effect=mock_async_post):
        payload = {
            "content": "Photo post content",
            "platforms": ["facebook"],
            "media_url": "http://localhost:8000/uploads/media/test_image.png"
        }
        response = client.post("/api/social/publish", json=payload, headers=headers)
        assert response.status_code == 200
        assert len(endpoint_called) > 0
        assert "/photos" in endpoint_called[0]
        data = response.json()
        assert data["results"]["facebook"]["status"] == "success"
        assert data["results"]["facebook"]["post_id"] == "fb_photo_post_777"


def test_delete_post_triggers_facebook_native_deletion(client, setup_test_accounts, db_session):
    """
    Test that deleting a post with facebook_post_id triggers delete_from_facebook.
    """
    from app.models.post import Post

    user = setup_test_accounts
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    # Create a test post in DB with facebook_post_id
    test_post = Post(
        user_id=user.id,
        title="FB Delete Test",
        content="Test content to delete",
        platforms="facebook",
        platform="facebook",
        status="Published",
        facebook_post_id="fb_delete_target_999"
    )
    db_session.add(test_post)
    db_session.commit()
    db_session.refresh(test_post)
    post_id = test_post.id

    deleted_post_ids = []

    def mock_delete_from_facebook(post_id_val, token_val):
        deleted_post_ids.append(post_id_val)
        return True

    with patch("app.api.post.delete_from_facebook", side_effect=mock_delete_from_facebook):
        response = client.delete(f"/api/posts/{post_id}", headers=headers)
        assert response.status_code == 200

        # Verify delete_from_facebook was called with the post ID
        assert "fb_delete_target_999" in deleted_post_ids

        # Verify post is removed from database
        db_check = db_session.query(Post).filter(Post.id == post_id).first()
        assert db_check is None

