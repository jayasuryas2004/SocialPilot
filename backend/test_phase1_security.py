import os
import sys
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import text

# Ensure backend root is on sys.path and test DATABASE_URL is set
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./socialpilot.db"

from app.main import app
from app.database import engine, get_db, SessionLocal
from app.models.user import User
from app.models.post import Post
from app.models.campaign import Campaign
from app.models.social_account import SocialAccount
from app.core.vault import encrypt_token, decrypt_token


class Phase1SecurityTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_vault_encryption_at_rest(self):
        """
        Verifies that OAuth tokens are encrypted at rest using Fernet and decrypted properly in memory.
        """
        raw_secret_token = "linkedin_oauth_super_secret_access_token_xyz123"
        encrypted_token = encrypt_token(raw_secret_token)

        self.assertIsNotNone(encrypted_token)
        self.assertNotEqual(raw_secret_token, encrypted_token)
        self.assertTrue(encrypted_token.startswith("gAAAAA"))

        # Save to database
        test_account = SocialAccount(
            platform="linkedin",
            account_name="Test Encrypted Account",
            access_token=encrypted_token,
            refresh_token=encrypt_token("refresh_secret_999")
        )
        self.db.add(test_account)
        self.db.commit()
        self.db.refresh(test_account)

        # Inspect raw SQLite database directly using raw SQL
        with engine.connect() as conn:
            row = conn.execute(
                text(f"SELECT access_token, refresh_token FROM social_accounts WHERE id = {test_account.id}")
            ).fetchone()
            db_stored_access = row[0]
            db_stored_refresh = row[1]

            # Verify that stored string in database is NOT plaintext
            self.assertNotEqual(db_stored_access, raw_secret_token)
            self.assertTrue(db_stored_access.startswith("gAAAAA"))
            self.assertTrue(db_stored_refresh.startswith("gAAAAA"))

        # Decrypt in memory
        decrypted_access = decrypt_token(test_account.access_token)
        self.assertEqual(decrypted_access, raw_secret_token)

        # Test legacy plaintext fallback
        legacy_plaintext = "legacy_unencrypted_token_value_abc"
        self.assertEqual(decrypt_token(legacy_plaintext), legacy_plaintext)

        # Clean up
        self.db.delete(test_account)
        self.db.commit()
        print("PASS: test_01_vault_encryption_at_rest")

    def test_02_jwt_route_protection_unauthorized(self):
        """
        Verifies that unauthenticated requests to protected endpoints return 401 Unauthorized.
        """
        protected_urls = [
            "/posts",
            "/api/posts",
            "/campaigns",
            "/api/campaigns",
            "/api/analytics/full-report",
            "/api/accounts",
            "/schedule",
            "/api/content/all",
            "/reports",
            "/workspace/status",
            "/auth/me"
        ]

        for url in protected_urls:
            res = self.client.get(url)
            self.assertEqual(
                res.status_code,
                401,
                f"Expected 401 Unauthorized for URL {url}, got {res.status_code}"
            )

        # Test with forged token
        forged_headers = {"Authorization": "Bearer invalid.jwt.token.string"}
        res_forged = self.client.get("/posts", headers=forged_headers)
        self.assertEqual(res_forged.status_code, 401)
        print("PASS: test_02_jwt_route_protection_unauthorized")

    def test_03_multi_tenant_data_isolation(self):
        """
        Verifies strict multi-tenant isolation: User A's data is invisible to User B.
        """
        # Register User A
        email_a = f"tenant_a_{os.urandom(4).hex()}@test.com"
        reg_a = self.client.post("/auth/register", json={
            "name": "Tenant A User",
            "email": email_a,
            "password": "Password123!",
            "role": "creator"
        })
        self.assertEqual(reg_a.status_code, 201)
        token_a = reg_a.json().get("access_token")
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Register User B
        email_b = f"tenant_b_{os.urandom(4).hex()}@test.com"
        reg_b = self.client.post("/auth/register", json={
            "name": "Tenant B User",
            "email": email_b,
            "password": "Password123!",
            "role": "creator"
        })
        self.assertEqual(reg_b.status_code, 201)
        token_b = reg_b.json().get("access_token")
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A creates a post
        post_res = self.client.post("/api/posts", json={
            "title": "Tenant A Secret Post",
            "content": "Confidential post content for Tenant A only.",
            "platform": "Instagram"
        }, headers=headers_a)
        self.assertEqual(post_res.status_code, 200)
        post_a_id = post_res.json().get("post", {}).get("id")

        # User A creates a campaign
        camp_res = self.client.post("/api/campaigns", json={
            "campaign_name": "Tenant A Secret Campaign",
            "platform": "Instagram",
            "budget": 5000.0
        }, headers=headers_a)
        self.assertEqual(camp_res.status_code, 200)
        camp_a_id = camp_res.json().get("data", {}).get("id")

        # User B queries posts -> should NOT see User A's post
        b_posts_res = self.client.get("/api/posts", headers=headers_b)
        b_posts = b_posts_res.json().get("data", [])
        for p in b_posts:
            self.assertNotEqual(p.get("id"), post_a_id)

        # User B queries campaigns -> should NOT see User A's campaign
        b_camps_res = self.client.get("/api/campaigns", headers=headers_b)
        b_camps = b_camps_res.json().get("data", [])
        for c in b_camps:
            self.assertNotEqual(c.get("id"), camp_a_id)

        # User B attempts to update User A's post -> 404
        update_res = self.client.put(f"/api/posts/{post_a_id}", json={
            "title": "Hacked Title",
            "content": "Hacked Content"
        }, headers=headers_b)
        self.assertEqual(update_res.status_code, 404)

        # User B attempts to delete User A's post -> 404
        delete_res = self.client.delete(f"/api/posts/{post_a_id}", headers=headers_b)
        self.assertEqual(delete_res.status_code, 404)

        # User A can see their own post and campaign
        a_posts_res = self.client.get("/api/posts", headers=headers_a)
        a_post_ids = []
        for p in a_posts_res.json().get("data", []):
            a_post_ids.append(p.get("id"))
        self.assertIn(post_a_id, a_post_ids)

        print("PASS: test_03_multi_tenant_data_isolation")

    def test_04_rate_limiting_login(self):
        """
        Verifies that SlowAPI enforces 5 requests/minute rate limits on /auth/login, returning 429.
        """
        test_email = f"ratelimit_{os.urandom(4).hex()}@test.com"

        # Register user
        self.client.post("/auth/register", json={
            "name": "Rate Limit Tester",
            "email": test_email,
            "password": "Password123!"
        })

        # Make 5 rapid login attempts
        statuses = []
        for i in range(7):
            res = self.client.post("/auth/login", json={
                "email": test_email,
                "password": "WrongPassword!"
            })
            statuses.append(res.status_code)

        # The 6th or 7th request must be blocked with HTTP 429
        self.assertIn(429, statuses, f"Expected 429 in statuses: {statuses}")
        print("PASS: test_04_rate_limiting_login")


if __name__ == "__main__":
    unittest.main()
