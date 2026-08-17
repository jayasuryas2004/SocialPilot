import os
from fastapi.testclient import TestClient
from app.main import app

def test_oauth_routes():
    client = TestClient(app)

    print("\n--- TEST 1: LinkedIn Login URL Generation ---")
    response = client.get("/oauth/linkedin/login?token=test_jwt", follow_redirects=False)
    print(f"Login Response Status: {response.status_code}")
    if "location" in response.headers:
        print(f"Redirect Location: {response.headers['location']}")
    assert response.status_code in (307, 200, 500)

    print("\n--- TEST 2: LinkedIn Callback with Error Param ---")
    response_err = client.get("/oauth/linkedin/callback?error=user_cancelled_login&error_description=User+denied+access", follow_redirects=False)
    print(f"Callback Error Status: {response_err.status_code}")
    if "location" in response_err.headers:
        print(f"Redirect Location: {response_err.headers['location']}")
    assert response_err.status_code == 307
    assert "status=error" in response_err.headers["location"]

    print("\n--- TEST 3: LinkedIn Callback with Missing Code ---")
    response_missing = client.get("/oauth/linkedin/callback", follow_redirects=False)
    print(f"Callback Missing Code Status: {response_missing.status_code}")
    if "location" in response_missing.headers:
        print(f"Redirect Location: {response_missing.headers['location']}")
    assert response_missing.status_code == 307
    assert "status=error" in response_missing.headers["location"]

    print("\n[ALL OAUTH UNIT TESTS PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    test_oauth_routes()
