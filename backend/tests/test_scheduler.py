import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.social_account import SocialAccount
from app.models.scheduled_post import ScheduledPost
from app.core.vault import encrypt_token
from app.core.security import create_access_token
from app.scheduler.worker import process_scheduled_posts


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def setup_user_and_vault(db_session):
    # Ensure test user
    user = db_session.query(User).first()
    if not user:
        user = User(
            name="Scheduler Test User",
            email="scheduler_test@example.com",
            password_hash="fake_hash",
            role="creator"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    # Ensure Facebook social account in vault
    fb_acc = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "facebook",
        SocialAccount.platform_user_id == "fb_page_sched_1"
    ).first()

    if not fb_acc:
        fb_acc = SocialAccount(
            user_id=user.id,
            platform="facebook",
            account_name="Scheduled FB Page",
            platform_user_id="fb_page_sched_1",
            access_token=encrypt_token("mock_fb_scheduled_token")
        )
        db_session.add(fb_acc)

    # Ensure LinkedIn social account in vault
    li_acc = db_session.query(SocialAccount).filter(
        SocialAccount.platform == "linkedin"
    ).first()

    if not li_acc:
        li_acc = SocialAccount(
            user_id=user.id,
            platform="linkedin",
            account_name="Scheduled LinkedIn Account",
            platform_user_id="urn:li:person:mock_sched_li",
            access_token=encrypt_token("mock_li_scheduled_token")
        )
        db_session.add(li_acc)

    db_session.commit()
    return user


def test_schedule_endpoint_validation_and_creation(client, db_session, setup_user_and_vault):
    """
    Test POST /api/social/schedule creates ScheduledPost records with status='pending',
    and properly rejects timestamps that are in the past.
    """
    user = setup_user_and_vault
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Past timestamp should return 400 Bad Request
    past_time = (datetime.utcnow() - timedelta(hours=2)).isoformat()
    resp_past = client.post(
        "/api/social/schedule",
        json={
            "content": "This is in the past",
            "platforms": ["facebook"],
            "scheduled_for": past_time
        },
        headers=headers
    )
    assert resp_past.status_code == 400
    assert "future" in resp_past.json()["detail"].lower()

    # 2. Future timestamp should return 200 OK and status='pending'
    future_time = (datetime.utcnow() + timedelta(days=2)).isoformat()
    resp_future = client.post(
        "/api/social/schedule",
        json={
            "content": "Future product release announcement!",
            "platforms": ["facebook", "linkedin"],
            "scheduled_for": future_time
        },
        headers=headers
    )
    assert resp_future.status_code == 200
    res_data = resp_future.json()
    assert res_data["success"] is True
    assert res_data["scheduled_post"]["status"] == "pending"

    # Verify persisted in DB
    created_id = res_data["scheduled_post"]["id"]
    db_record = db_session.query(ScheduledPost).filter(ScheduledPost.id == created_id).first()
    assert db_record is not None
    assert db_record.status == "pending"
    assert db_record.content == "Future product release announcement!"


def test_apscheduler_worker_execution(db_session, setup_user_and_vault):
    """
    Test that the APScheduler worker queries due pending posts,
    immediately marks them as 'processing', triggers the publishing pipeline,
    and updates status to 'published'.
    """
    user = setup_user_and_vault

    # Create a scheduled post that is due (scheduled_for in the past)
    due_post = ScheduledPost(
        user_id=user.id,
        content="Automated worker publishing test",
        platforms="facebook, linkedin",
        scheduled_for=datetime.utcnow() - timedelta(minutes=5),
        status="pending"
    )
    db_session.add(due_post)
    db_session.commit()
    db_session.refresh(due_post)
    post_id = due_post.id

    mock_fb_resp = MagicMock()
    mock_fb_resp.status_code = 200
    mock_fb_resp.json.return_value = {"id": f"fb_post_scheduled_{post_id}"}
    mock_fb_resp.text = f'{{"id": "fb_post_scheduled_{post_id}"}}'

    with patch("httpx.Client.post", return_value=mock_fb_resp):
        with patch("app.scheduler.worker.publish_to_linkedin", return_value=(True, "Published to LinkedIn live")):
            # Trigger scheduler worker manually
            results = process_scheduled_posts(db_session)

            # Refresh post from DB
            db_session.refresh(due_post)
            assert due_post.status == "published"
            assert "Success" in due_post.result_detail


def test_apscheduler_worker_error_isolation(db_session, setup_user_and_vault):
    """
    Test error isolation in scheduler worker:
    If one post fails, it is marked as 'failed', and the worker loop continues
    to process the next post successfully.
    """
    user = setup_user_and_vault

    # Post A: Will fail (unsupported/failing platform)
    post_fail = ScheduledPost(
        user_id=user.id,
        content="Failing post content",
        platforms="facebook",
        scheduled_for=datetime.utcnow() - timedelta(minutes=3),
        status="pending"
    )

    # Post B: Will succeed
    post_success = ScheduledPost(
        user_id=user.id,
        content="Succeeding post content",
        platforms="linkedin",
        scheduled_for=datetime.utcnow() - timedelta(minutes=2),
        status="pending"
    )

    db_session.add_all([post_fail, post_success])
    db_session.commit()
    db_session.refresh(post_fail)
    db_session.refresh(post_success)

    # Mock Facebook to throw an exception / fail for Post A
    mock_fb_fail = MagicMock()
    mock_fb_fail.status_code = 401
    mock_fb_fail.text = '{"error": "Expired access token"}'

    with patch("httpx.Client.post", return_value=mock_fb_fail):
        with patch("app.scheduler.worker.publish_to_linkedin", return_value=(True, "Published to LinkedIn")):
            process_scheduled_posts(db_session)

            db_session.refresh(post_fail)
            db_session.refresh(post_success)

            # Post A marked as failed
            assert post_fail.status == "failed"

            # Post B marked as published despite Post A's failure
            assert post_success.status == "published"
