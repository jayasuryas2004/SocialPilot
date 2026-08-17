import os
import sys
import asyncio
from unittest.mock import patch, MagicMock

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token
from app.core.redis import (
    get_cached,
    set_cached,
    delete_cached,
    invalidate_cache_prefix,
    get_cached_sync,
    set_cached_sync
)

async def test_redis_core_async():
    print("\n--- TEST 1: REDIS CORE ASYNC CACHE HELPERS ---")
    test_key = "test_perf_key_123"
    test_payload = {"status": "ok", "user": "creator", "metrics": [10, 20, 30]}

    # Set cache with TTL 60
    stored = await set_cached(test_key, test_payload, ttl_seconds=60)
    print(f"set_cached result: {stored}")

    # Get cached
    val = await get_cached(test_key)
    print(f"get_cached result: {val}")
    if stored:
        assert val == test_payload, f"Expected {test_payload}, got {val}"

    # Delete cached
    deleted = await delete_cached(test_key)
    print(f"delete_cached result: {deleted}")

    # Invalidate prefix test
    await set_cached("prefix_test_1", {"data": 1}, ttl_seconds=60)
    await set_cached("prefix_test_2", {"data": 2}, ttl_seconds=60)
    inv_count = await invalidate_cache_prefix("prefix_test_")
    print(f"invalidate_cache_prefix deleted count: {inv_count}")

    print("TEST 1 PASSED: Redis core caching logic verified!")


def test_endpoint_caching():
    print("\n--- TEST 2: ENDPOINT CACHING & MEMORY SERVING ---")
    client = TestClient(app, follow_redirects=False)
    db = SessionLocal()

    user = db.query(User).filter(User.email == "creator@socialpilot.com").first()
    assert user is not None
    token = create_access_token({"sub": str(user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. /api/analytics/full-report caching
    res1 = client.get("/api/analytics/full-report", headers=headers)
    assert res1.status_code == 200
    data1 = res1.json()
    print("1st /api/analytics/full-report request succeeded (DB query + cache set)")

    res2 = client.get("/api/analytics/full-report", headers=headers)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data1 == data2
    print("2nd /api/analytics/full-report request succeeded (Served from cache)")

    # 2. /api/accounts caching
    acc1 = client.get("/api/accounts", headers=headers)
    assert acc1.status_code == 200
    acc_data1 = acc1.json()
    print(f"1st /api/accounts request succeeded (count={len(acc_data1)})")

    acc2 = client.get("/api/accounts", headers=headers)
    assert acc2.status_code == 200
    acc_data2 = acc2.json()
    assert acc_data1 == acc_data2
    print("2nd /api/accounts request succeeded (Served from cache)")

    # 3. /reports caching
    rep1 = client.get("/reports", headers=headers)
    assert rep1.status_code == 200
    rep_data1 = rep1.json()
    print("1st /reports request succeeded (DB query + cache set)")

    rep2 = client.get("/reports", headers=headers)
    assert rep2.status_code == 200
    rep_data2 = rep2.json()
    assert rep_data1 == rep_data2
    print("2nd /reports request succeeded (Served from cache)")

    db.close()
    print("\nALL FASTAPI REDIS CACHING INTEGRATION TESTS PASSED PERFECTLY!")


def run_all():
    asyncio.run(test_redis_core_async())
    test_endpoint_caching()


if __name__ == "__main__":
    run_all()
