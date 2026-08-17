import os
import sys
import unittest
import json
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path and test DATABASE_URL is configured
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./socialpilot.db"

from app.main import app
from app.database import engine, get_db, SessionLocal
from app.models.user import User
from app.core.security import create_access_token
from app.core.cache import get_cached, set_cached, delete_cached, invalidate_cache_prefix, get_redis_client


class Phase3PerformanceTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

        # Create a test user for auth
        self.test_email = f"phase3_{os.urandom(4).hex()}@test.com"
        reg = self.client.post("/auth/register", json={
            "name": "Phase 3 Tester",
            "email": self.test_email,
            "password": "Password123!"
        })
        self.token = reg.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def tearDown(self):
        self.db.close()

    def test_01_redis_cache_and_graceful_fallback(self):
        """
        Verifies that cache operations execute cleanly or fall back silently without errors when Redis is offline.
        """
        # 1. Test get_cached and set_cached behavior
        test_key = "test:analytics:metric_kpi"
        test_payload = {"total_views": 45000, "status": "active"}

        # Store cache
        save_success = set_cached(test_key, test_payload, ttl_seconds=10)
        # Check retrieval if Redis is running, or verify None if offline
        cached_result = get_cached(test_key)
        if save_success:
            self.assertEqual(cached_result.get("total_views"), 45000)
            # Test delete
            delete_cached(test_key)
            self.assertIsNone(get_cached(test_key))
        else:
            # When Redis is offline, get_cached must return None gracefully
            self.assertIsNone(cached_result)

        # 2. Test analytics full report caching with tenant isolation
        res = self.client.get("/api/analytics/full-report", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("kpis", data)
        self.assertIn("platformDistribution", data)

        print("PASS: test_01_redis_cache_and_graceful_fallback")

    def test_02_server_sent_events_stream_endpoint(self):
        """
        Verifies that GET /api/workspace/stream yields a valid Server-Sent Events (SSE) data stream.
        """
        stream_url = f"/api/workspace/stream?token={self.token}&max_events=1"
        with self.client.stream("GET", stream_url) as response:
            self.assertEqual(response.status_code, 200)
            self.assertTrue(
                "text/event-stream" in response.headers.get("content-type", ""),
                f"Expected text/event-stream content-type, got: {response.headers.get('content-type')}"
            )

            # Read first event line from stream
            lines_received = []
            for line in response.iter_lines():
                if line:
                    lines_received.append(line)
                    if len(lines_received) >= 1:
                        break

            self.assertGreater(len(lines_received), 0)
            first_line = lines_received[0]
            self.assertTrue(first_line.startswith("data: "), f"Expected line starting with 'data: ', got: {first_line}")

            # Parse SSE JSON payload
            raw_json = first_line.replace("data: ", "", 1).strip()
            parsed_data = json.loads(raw_json)
            self.assertEqual(parsed_data.get("type"), "workspace_update")
            self.assertIn("unread_count", parsed_data)
            self.assertIn("notifications", parsed_data)

        print("PASS: test_02_server_sent_events_stream_endpoint")

    def test_03_prometheus_metrics_telemetry(self):
        """
        Verifies that GET /metrics exposes Prometheus telemetry counters and duration histograms.
        """
        # Generate some HTTP traffic
        self.client.get("/")
        self.client.get("/workspace/status", headers=self.headers)

        # Fetch Prometheus metrics
        metrics_res = self.client.get("/metrics")
        self.assertEqual(metrics_res.status_code, 200)
        metrics_text = metrics_res.text

        # Verify presence of metric names
        self.assertIn("socialpilot_http_requests_total", metrics_text)
        self.assertIn("socialpilot_http_request_duration_seconds", metrics_text)
        print("PASS: test_03_prometheus_metrics_telemetry")


if __name__ == "__main__":
    unittest.main()
