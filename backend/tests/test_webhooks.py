import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.post import Post


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_meta_webhook_verification_handshake(client):
    """
    Test Meta Graph API Webhook GET verification handshake.
    """
    # 1. Valid handshake
    res = client.get("/api/webhooks/meta?hub.mode=subscribe&hub.challenge=1158201244&hub.verify_token=socialpilot_secret_123")
    assert res.status_code == 200
    assert res.text == "1158201244"

    # 2. Invalid verify token (forbidden)
    res_bad = client.get("/api/webhooks/meta?hub.mode=subscribe&hub.challenge=1158201244&hub.verify_token=wrong_token")
    assert res_bad.status_code == 403


def test_meta_webhook_deletion_event_sync(client, db_session):
    """
    Test Meta webhook POST event with 'remove' action deletes local post record.
    """
    # Setup test post with facebook_post_id
    test_post = Post(
        title="Meta Webhook Test Post",
        content="Testing inbound removal sync",
        platforms="facebook",
        platform="facebook",
        status="Published",
        facebook_post_id="fb_page_post_888999"
    )
    db_session.add(test_post)
    db_session.commit()
    db_session.refresh(test_post)
    post_id = test_post.id

    webhook_payload = {
        "object": "page",
        "entry": [
            {
                "id": "100123456",
                "time": 1700000000,
                "changes": [
                    {
                        "field": "feed",
                        "value": {
                            "verb": "remove",
                            "item": "post",
                            "post_id": "fb_page_post_888999"
                        }
                    }
                ]
            }
        ]
    }

    res = client.post("/api/webhooks/meta", json=webhook_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["deleted_posts_count"] == 1

    # Verify post was deleted from database
    db_check = db_session.query(Post).filter(Post.id == post_id).first()
    assert db_check is None


def test_linkedin_webhook_verification_handshake(client):
    """
    Test LinkedIn Webhook GET verification handshake.
    """
    res = client.get("/api/webhooks/linkedin?challenge=li_challenge_abc&verify_token=socialpilot_linkedin_secret_123")
    assert res.status_code == 200
    assert "li_challenge_abc" in res.text


def test_linkedin_webhook_deletion_event_sync(client, db_session):
    """
    Test LinkedIn webhook POST event deletes local post record.
    """
    test_post = Post(
        title="LinkedIn Webhook Test Post",
        content="Testing inbound LinkedIn removal sync",
        platforms="linkedin",
        platform="linkedin",
        status="Published",
        linkedin_urn="urn:li:share:999888777"
    )
    db_session.add(test_post)
    db_session.commit()
    db_session.refresh(test_post)
    post_id = test_post.id

    webhook_payload = {
        "events": [
            {
                "type": "DELETE",
                "urn": "urn:li:share:999888777",
                "timestamp": 1700000000
            }
        ]
    }

    res = client.post("/api/webhooks/linkedin", json=webhook_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["deleted_posts_count"] == 1

    # Verify post was deleted from database
    db_check = db_session.query(Post).filter(Post.id == post_id).first()
    assert db_check is None
