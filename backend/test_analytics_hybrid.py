import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token
from app.core.cache import invalidate_cache_prefix

def run_tests():
    # Invalidate cached report
    invalidate_cache_prefix("analytics:")

    client = TestClient(app, follow_redirects=False)
    db = SessionLocal()

    user = db.query(User).filter(User.email == "creator@socialpilot.com").first()
    assert user is not None
    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/analytics/full-report", headers=headers)
    assert res.status_code == 200, f"Status code: {res.status_code} - {res.text}"
    data = res.json()

    print("\n--- HYBRID ANALYTICS VERIFICATION ---")
    print("KPIs:", data.get("kpis"))

    # 1. Check Platform Distribution: all 7 platforms present
    dist = data.get("platformDistribution", [])
    print(f"\nPlatform Distribution count: {len(dist)}")
    assert len(dist) == 7, f"Expected 7 platforms in distribution, got {len(dist)}"
    dist_names = []
    tot_dist_posts = 0
    for d in dist:
        dist_names.append(d.get("name"))
        tot_dist_posts += d.get("value", 0)
        print(f" - {d.get('name')}: {d.get('value')} posts (color: {d.get('color')})")

    assert "LinkedIn" in dist_names
    assert "Instagram" in dist_names
    assert "Facebook" in dist_names
    assert "YouTube" in dist_names
    assert "X-Twitter" in dist_names
    assert "Reddit" in dist_names
    assert "Pinterest" in dist_names
    assert tot_dist_posts >= 1470, f"Expected >= 1470 total posts, got {tot_dist_posts}"
    print(f"Total distribution posts: {tot_dist_posts} (PASSED)")

    # 2. Check Followers: all 7 platforms in weekly & monthly
    weekly_f = data.get("followers", {}).get("weekly", [])
    monthly_f = data.get("followers", {}).get("monthly", [])
    assert len(weekly_f) == 7, f"Expected 7 platforms in weekly followers, got {len(weekly_f)}"
    assert len(monthly_f) == 7, f"Expected 7 platforms in monthly followers, got {len(monthly_f)}"
    print("Weekly and Monthly followers have all 7 platforms (PASSED)")

    # 3. Check Top Posts: Real AI posts first, followed by mock posts
    top_posts = data.get("topPosts", [])
    print(f"\nTop Posts count: {len(top_posts)}")
    assert len(top_posts) >= 7, f"Expected >= 7 top posts, got {len(top_posts)}"
    for p in top_posts:
        print(f" - Post: [{p.get('platform')}] {p.get('title')} (Eng: {p.get('engagement')}, Reach: {p.get('reach')})")

    # Real posts leading the list
    assert "Scheme Plus" in top_posts[0].get("title", "")
    assert "Multi-Cloud" in top_posts[1].get("title", "")
    assert "Maintenance Agent" in top_posts[2].get("title", "")

    # Mock posts included afterwards (using standard for loops)
    found_b2b = False
    found_summer = False
    for p in top_posts:
        t = p.get("title", "")
        if "B2B SaaS Growth" in t:
            found_b2b = True
        if "Summer sale reel" in t:
            found_summer = True

    assert found_b2b, "Missing B2B SaaS mock post"
    assert found_summer, "Missing Summer sale mock post"
    print("Top Posts Hybrid Merge (Real first + Mock following) (PASSED)")

    # 4. Check Campaigns: Real campaigns first, followed by mock campaigns
    campaigns = data.get("campaignPerformance", [])
    print(f"\nCampaigns count: {len(campaigns)}")
    assert len(campaigns) >= 6, f"Expected >= 6 campaigns, got {len(campaigns)}"
    for c in campaigns:
        print(f" - Campaign: [{c.get('platform')}] {c.get('title')} (Eng: {c.get('engagement')})")

    assert "Scheme Plus" in campaigns[0].get("title", "")
    assert "Multi-Cloud" in campaigns[1].get("title", "")
    assert "Maintenance Agent" in campaigns[2].get("title", "")

    found_global_brand = False
    for c in campaigns:
        t = c.get("title", "")
        if "Global Brand Awareness" in t:
            found_global_brand = True

    assert found_global_brand, "Missing Global Brand Awareness mock campaign"
    print("Campaigns Hybrid Merge (Real first + Mock following) (PASSED)")

    db.close()
    print("\nALL HYBRID ANALYTICS BACKEND TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
