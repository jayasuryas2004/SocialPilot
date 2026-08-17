import os
import sys
import unittest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import Base
from app.models.user import User
from app.models.post import Post
from app.models.campaign import Campaign
from app.models.notification import Notification
from app.models.social_account import SocialAccount


class Phase2DatabaseOptimizationTests(unittest.TestCase):
    def setUp(self):
        # Set up an in-memory SQLite database for relational cascade testing
        self.test_engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False}
        )
        Base.metadata.create_all(bind=self.test_engine)
        self.TestSession = sessionmaker(bind=self.test_engine)
        self.db = self.TestSession()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.test_engine)

    def test_01_postgresql_connection_pooling_configuration(self):
        """
        Verifies that PostgreSQL engines are initialized with pool_size=20, max_overflow=10, and pool_pre_ping=True.
        """
        pg_url = "postgresql+psycopg2://test_user:test_pass@localhost:5432/social_scheduler"
        engine_pg = create_engine(
            pg_url,
            pool_size=20,
            max_overflow=10,
            pool_pre_ping=True
        )

        pool = engine_pg.pool
        self.assertEqual(pool.size(), 20)
        self.assertEqual(pool._max_overflow, 10)
        self.assertTrue(pool._pre_ping)
        print("PASS: test_01_postgresql_connection_pooling_configuration")

    def test_02_composite_and_chronological_indexing(self):
        """
        Verifies that composite index idx_posts_status_scheduled and chronological index idx_notifications_created exist.
        """
        # 1. Inspect Post table indexes
        post_index_names = []
        for idx in Post.__table__.indexes:
            post_index_names.append(idx.name)

        self.assertIn("idx_posts_status_scheduled", post_index_names)

        # Inspect column names in composite index
        for idx in Post.__table__.indexes:
            if idx.name == "idx_posts_status_scheduled":
                indexed_cols = []
                for col in idx.columns:
                    indexed_cols.append(col.name)
                self.assertIn("status", indexed_cols)
                self.assertIn("scheduled_at", indexed_cols)

        # 2. Inspect Notification table indexes
        notif_index_names = []
        for idx in Notification.__table__.indexes:
            notif_index_names.append(idx.name)

        self.assertIn("idx_notifications_created", notif_index_names)
        print("PASS: test_02_composite_and_chronological_indexing")

    def test_03_foreign_key_cascade_definitions(self):
        """
        Verifies that ondelete='CASCADE' is defined on all dependent ForeignKeys.
        """
        # Post -> User ForeignKey
        post_user_fk_cascade = False
        for fk in Post.__table__.foreign_keys:
            if fk.target_fullname == "users.id":
                if fk.ondelete == "CASCADE":
                    post_user_fk_cascade = True
        self.assertTrue(post_user_fk_cascade)

        # Post -> Campaign ForeignKey
        post_camp_fk_cascade = False
        for fk in Post.__table__.foreign_keys:
            if fk.target_fullname == "campaigns.id":
                if fk.ondelete == "CASCADE":
                    post_camp_fk_cascade = True
        self.assertTrue(post_camp_fk_cascade)

        # Campaign -> User ForeignKey
        camp_user_fk_cascade = False
        for fk in Campaign.__table__.foreign_keys:
            if fk.target_fullname == "users.id":
                if fk.ondelete == "CASCADE":
                    camp_user_fk_cascade = True
        self.assertTrue(camp_user_fk_cascade)

        # Notification -> User ForeignKey
        notif_user_fk_cascade = False
        for fk in Notification.__table__.foreign_keys:
            if fk.target_fullname == "users.id":
                if fk.ondelete == "CASCADE":
                    notif_user_fk_cascade = True
        self.assertTrue(notif_user_fk_cascade)

        # SocialAccount -> User ForeignKey
        sa_user_fk_cascade = False
        for fk in SocialAccount.__table__.foreign_keys:
            if fk.target_fullname == "users.id":
                if fk.ondelete == "CASCADE":
                    sa_user_fk_cascade = True
        self.assertTrue(sa_user_fk_cascade)

        print("PASS: test_03_foreign_key_cascade_definitions")

    def test_04_orm_cascading_deletions_lifecycle(self):
        """
        Verifies that deleting a User cascades to all child Campaigns, Posts, SocialAccounts, and Notifications.
        """
        # 1. Create a parent User
        user = User(
            name="Cascade Test User",
            email=f"cascade_{os.urandom(4).hex()}@test.com",
            password_hash="hash123"
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        user_id = user.id

        # 2. Create child Campaign
        campaign = Campaign(
            user_id=user_id,
            campaign_name="Test Campaign for Cascade",
            platform="LinkedIn"
        )
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)

        camp_id = campaign.id

        # 3. Create child Posts
        post1 = Post(
            user_id=user_id,
            campaign_id=camp_id,
            content="Post 1 inside campaign",
            status="Scheduled",
            scheduled_at=datetime.utcnow()
        )
        post2 = Post(
            user_id=user_id,
            content="Post 2 standalone for user",
            status="Draft"
        )
        self.db.add(post1)
        self.db.add(post2)

        # 4. Create child Notification and SocialAccount
        notif = Notification(
            user_id=user_id,
            title="Cascade Notif",
            message="Test notification"
        )
        sa = SocialAccount(
            user_id=user_id,
            platform="linkedin",
            account_name="Cascade LinkedIn",
            access_token="token123"
        )
        self.db.add(notif)
        self.db.add(sa)
        self.db.commit()

        # Verify child records exist in DB
        self.assertEqual(self.db.query(Campaign).filter(Campaign.user_id == user_id).count(), 1)
        self.assertEqual(self.db.query(Post).filter(Post.user_id == user_id).count(), 2)
        self.assertEqual(self.db.query(Notification).filter(Notification.user_id == user_id).count(), 1)
        self.assertEqual(self.db.query(SocialAccount).filter(SocialAccount.user_id == user_id).count(), 1)

        # 5. Delete Campaign -> Post1 must be deleted, Post2 must remain
        self.db.delete(campaign)
        self.db.commit()

        self.assertEqual(self.db.query(Post).filter(Post.id == post1.id).count(), 0)
        self.assertEqual(self.db.query(Post).filter(Post.id == post2.id).count(), 1)

        # 6. Delete User -> All remaining user records must be deleted
        user_to_delete = self.db.query(User).filter(User.id == user_id).first()
        self.db.delete(user_to_delete)
        self.db.commit()

        self.assertEqual(self.db.query(Post).filter(Post.user_id == user_id).count(), 0)
        self.assertEqual(self.db.query(Notification).filter(Notification.user_id == user_id).count(), 0)
        self.assertEqual(self.db.query(SocialAccount).filter(SocialAccount.user_id == user_id).count(), 0)

        print("PASS: test_04_orm_cascading_deletions_lifecycle")


if __name__ == "__main__":
    unittest.main()
