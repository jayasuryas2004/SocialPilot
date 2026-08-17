import os
import sys
from unittest.mock import patch, MagicMock

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.notification import Notification
from app.core.vault import encrypt_token
from app.scheduler import sync_linkedin_deletions

def run_tests():
    print("\n--- TEST: REVERSE DELETION SYNC BACKGROUND WORKER ---")
    db = SessionLocal()

    user = db.query(User).filter(User.email == "creator@socialpilot.com").first()
    assert user is not None

    # Ensure LinkedIn account is connected
    sa = db.query(SocialAccount).filter(
        SocialAccount.user_id == user.id,
        SocialAccount.platform == "linkedin"
    ).first()
    if not sa:
        sa = SocialAccount(
            user_id=user.id,
            platform="linkedin",
            account_name="LinkedIn Sync Test",
            access_token=encrypt_token("AQSyncTestToken123")
        )
        db.add(sa)
        db.commit()
        db.refresh(sa)
    else:
        sa.status = "connected"
        sa.access_token = encrypt_token("AQSyncTestToken123")
        db.commit()

    # Create a dummy Published post with a LinkedIn URN
    test_urn = "urn:li:ugcPost:9876543210"
    test_post = db.query(Post).filter(Post.linkedin_urn == test_urn).first()
    if not test_post:
        test_post = Post(
            user_id=user.id,
            title="Native Delete Test Post",
            content="Testing reverse sync when post is deleted natively on LinkedIn.",
            platform="LinkedIn",
            status="Published",
            linkedin_urn=test_urn
        )
        db.add(test_post)
        db.commit()
        db.refresh(test_post)
    else:
        test_post.status = "Published"
        db.commit()

    print(f"Created/Reset test post ID {test_post.id} with status='Published', URN='{test_urn}'")

    # Mock LinkedIn returning 404 Not Found (simulating user deleting post directly on linkedin.com)
    with patch("httpx.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_instance
        mock_response = MagicMock(
            status_code=404,
            text='{"serviceErrorCode":100,"message":"Resource not found"}'
        )
        mock_instance.get.return_value = mock_response

        # Execute the background sync job
        sync_linkedin_deletions()

        # Verify the post status in PostgreSQL is updated to 'Deleted'
        db.refresh(test_post)
        assert test_post.status == "Deleted", f"Expected post status to be 'Deleted', but got '{test_post.status}'"
        print(f"PASSED: Post ID {test_post.id} status successfully updated to '{test_post.status}' locally!")

        # Verify user notification was created
        notif = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.title == "LinkedIn Post Deleted"
        ).first()
        assert notif is not None, "Expected 'LinkedIn Post Deleted' notification to be created"
        print(f"PASSED: User notification created -> {notif.message}")

    # Clean up test post
    db.delete(test_post)
    db.commit()
    db.close()
    print("\nALL REVERSE DELETION SYNC TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
