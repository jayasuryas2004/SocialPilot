import os
import sys
from unittest.mock import patch, MagicMock

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.notification import Notification
from app.core.vault import encrypt_token, decrypt_token
from app.services.social_media import publish_to_linkedin, delete_from_linkedin

def run_tests():
    # TEST 1: VAULT ENCRYPTION & DECRYPTION PURITY
    raw_token = "AQTestToken_Secret_12345!@#"
    enc = encrypt_token(raw_token)
    dec = decrypt_token(enc)
    assert dec == raw_token, f"Vault roundtrip mismatch: {dec}"
    assert isinstance(dec, str), "Expected string"
    assert not dec.startswith("b'"), f"Found byte wrapper in result: {dec}"

    # Byte string artifact handling test
    byte_wrapped_cipher = f"b'{enc}'"
    dec_wrapped = decrypt_token(byte_wrapped_cipher)
    assert dec_wrapped == raw_token, f"Byte wrapper not stripped: {dec_wrapped}"

    assert decrypt_token(None) is None
    assert decrypt_token("") is None
    print("TEST 1 PASSED: Vault token encryption/decryption is clean UTF-8 and handles byte artifacts!")

    # TEST 2: 401 TOKEN EXPIRATION AUTO-DISCONNECTION & USER NOTIFICATION
    db = SessionLocal()
    user = db.query(User).filter(User.email == "creator@socialpilot.com").first()
    assert user is not None

    # Ensure account is connected
    sa = db.query(SocialAccount).filter(
        SocialAccount.user_id == user.id,
        SocialAccount.platform == "linkedin"
    ).first()
    if not sa:
        sa = SocialAccount(
            user_id=user.id,
            platform="linkedin",
            account_name="LinkedIn Test",
            access_token=encrypt_token("AQExpiredToken")
        )
        db.add(sa)
        db.commit()
        db.refresh(sa)
    else:
        sa.status = "connected"
        sa.access_token = encrypt_token("AQExpiredToken")
        db.commit()

    post = db.query(Post).filter(
        Post.user_id == user.id,
        Post.platform == "LinkedIn"
    ).first()
    assert post is not None

    # Mock LinkedIn 401 response
    with patch("httpx.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_instance
        mock_response = MagicMock(
            status_code=401,
            text='{"serviceErrorCode":65600,"message":"Invalid access token"}'
        )
        mock_instance.post.return_value = mock_response
        mock_instance.get.return_value = mock_response

        success, detail = publish_to_linkedin(post, db)
        assert success is False
        assert "expired" in detail.lower()

        # Verify SocialAccount status is now 'disconnected'
        db.refresh(sa)
        assert sa.status == "disconnected", f"Expected status disconnected, got: {sa.status}"
        print("TEST 2A PASSED: SocialAccount auto-disconnected on 401!")

        # Verify Notification was created
        notif = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.title == "LinkedIn Authentication Expired"
        ).first()
        assert notif is not None
        assert "reconnect" in notif.message.lower()
        print(f"TEST 2B PASSED: User notification created on 401 -> {notif.message}")

    # Reconnect account after test so system is in good state
    sa.status = "connected"
    sa.access_token = encrypt_token("AQTestLinkedInToken12345")
    db.commit()

    db.close()
    print("\nALL LINKEDIN 401 AND VAULT DECRYPTION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
