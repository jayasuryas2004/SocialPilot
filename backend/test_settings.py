import os
import sys
import unittest
import io
from fastapi.testclient import TestClient
from sqlalchemy import text

# Ensure backend root is on sys.path and test DATABASE_URL is set
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./socialpilot.db"

from app.main import app
from app.database import engine, SessionLocal
from app.models.user import User
from app.core.security import hash_password, create_access_token


class SettingsAPITests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

        # Create or fetch test user
        test_email = "settings_test_user@socialpilot.com"
        user = self.db.query(User).filter(User.email == test_email).first()
        if not user:
            user = User(
                name="Test Settings User",
                first_name="Test",
                last_name="User",
                username="testuser_settings",
                email=test_email,
                password_hash=hash_password("OriginalPassword123!"),
                role="creator",
                theme="System",
                language="English"
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)

        self.test_user = user
        token_payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
        self.token = create_access_token(token_payload)
        self.headers = {
            "Authorization": f"Bearer {self.token}"
        }

    def tearDown(self):
        self.db.close()

    def test_01_get_profile(self):
        """
        Verify GET /api/settings/profile returns user details.
        """
        response = self.client.get("/api/settings/profile", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], self.test_user.email)
        self.assertEqual(data["role"], self.test_user.role)
        self.assertIn("first_name", data)
        self.assertIn("last_name", data)
        self.assertIn("theme", data)
        self.assertIn("language", data)

    def test_02_update_profile(self):
        """
        Verify PUT /api/settings/profile updates user fields.
        """
        payload = {
            "first_name": "UpdatedFirst",
            "last_name": "UpdatedLast",
            "username": "updated_username_99",
            "role": "Social Media Manager"
        }
        response = self.client.put("/api/settings/profile", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["profile"]["first_name"], "UpdatedFirst")
        self.assertEqual(data["profile"]["last_name"], "UpdatedLast")
        self.assertEqual(data["profile"]["username"], "updated_username_99")
        self.assertEqual(data["profile"]["role"], "Social Media Manager")

        # Verify directly in database
        self.db.expire_all()
        refreshed_user = self.db.query(User).filter(User.id == self.test_user.id).first()
        self.assertEqual(refreshed_user.first_name, "UpdatedFirst")
        self.assertEqual(refreshed_user.last_name, "UpdatedLast")
        self.assertEqual(refreshed_user.name, "UpdatedFirst UpdatedLast")

    def test_03_upload_avatar(self):
        """
        Verify POST /api/settings/avatar handles multipart image upload.
        """
        # Create a mock image file
        fake_image_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
        files = {
            "file": ("test_avatar.png", io.BytesIO(fake_image_bytes), "image/png")
        }
        response = self.client.post("/api/settings/avatar", files=files, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("avatar_url", data)
        self.assertTrue(data["avatar_url"].startswith("/uploads/avatars/"))

        # Verify static file serving
        static_resp = self.client.get(data["avatar_url"])
        self.assertEqual(static_resp.status_code, 200)

    def test_04_password_change_flow(self):
        """
        Verify PUT /api/settings/password validates current password and updates hash.
        """
        # 1. Test incorrect current password
        bad_payload = {
            "current_password": "WrongPasswordXYZ!",
            "new_password": "NewSecretPassword123!"
        }
        bad_resp = self.client.put("/api/settings/password", json=bad_payload, headers=self.headers)
        self.assertEqual(bad_resp.status_code, 400)

        # 2. Test valid password update
        good_payload = {
            "current_password": "OriginalPassword123!",
            "new_password": "BrandNewSecurePassword456!"
        }
        good_resp = self.client.put("/api/settings/password", json=good_payload, headers=self.headers)
        self.assertEqual(good_resp.status_code, 200)

        # 3. Test changing back to OriginalPassword123!
        revert_payload = {
            "current_password": "BrandNewSecurePassword456!",
            "new_password": "OriginalPassword123!"
        }
        revert_resp = self.client.put("/api/settings/password", json=revert_payload, headers=self.headers)
        self.assertEqual(revert_resp.status_code, 200)

    def test_05_update_preferences(self):
        """
        Verify PUT /api/settings/preferences updates theme and language.
        """
        payload = {
            "theme": "Dark",
            "language": "Tamil"
        }
        response = self.client.put("/api/settings/preferences", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["theme"], "Dark")
        self.assertEqual(data["language"], "Tamil")

    def test_06_unauthorized_rejection(self):
        """
        Verify all settings endpoints reject unauthenticated requests.
        """
        resp1 = self.client.get("/api/settings/profile")
        self.assertEqual(resp1.status_code, 401)

        resp2 = self.client.put("/api/settings/profile", json={})
        self.assertEqual(resp2.status_code, 401)


if __name__ == "__main__":
    unittest.main()
