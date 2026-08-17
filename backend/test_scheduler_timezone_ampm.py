import os
import sys
from datetime import datetime, date, time, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.scheduler import extract_post_datetime, is_post_due
from app.api.content import format_time_ampm
from app.models.post import Post

def run_tests():
    print("\n--- TEST 1: SCHEDULER TIMEZONE & LOCAL TIME RECOGNITION ---")

    # A post scheduled for 10:06 AM today (past relative to local time 11:13 AM, but future relative to UTC 05:43 AM)
    now_local = datetime.now()
    past_local_time = (now_local - timedelta(minutes=15)).strftime("%H:%M")
    past_local_date = now_local.date()

    mock_post_past = Post(
        id=999,
        title="Timezone Test Post Past",
        scheduled_date=past_local_date,
        scheduled_time=past_local_time,
        status="Scheduled"
    )

    extracted_dt = extract_post_datetime(mock_post_past)
    assert extracted_dt is not None, "Failed to extract datetime from post"
    due_status = is_post_due(extracted_dt)
    assert due_status is True, f"Expected post scheduled at {past_local_time} to be recognized as DUE, but was {due_status}"
    print(f"PASSED: Post scheduled at {past_local_time} correctly recognized as DUE (now_local={now_local.strftime('%H:%M:%S')})")

    # A post scheduled for 2 hours in the future
    future_local_time = (now_local + timedelta(hours=2)).strftime("%H:%M")
    mock_post_future = Post(
        id=1000,
        title="Timezone Test Post Future",
        scheduled_date=past_local_date,
        scheduled_time=future_local_time,
        status="Scheduled"
    )
    extracted_future_dt = extract_post_datetime(mock_post_future)
    future_status = is_post_due(extracted_future_dt)
    assert future_status is False, f"Expected future post at {future_local_time} to NOT be due, but was {future_status}"
    print(f"PASSED: Post scheduled at {future_local_time} correctly recognized as NOT due")

    # Timezone-aware timestamp check
    aware_past = datetime.now(timezone.utc) - timedelta(minutes=5)
    mock_post_aware = Post(
        id=1001,
        title="Timezone Aware Past Post",
        scheduled_at=aware_past,
        status="Scheduled"
    )
    extracted_aware_dt = extract_post_datetime(mock_post_aware)
    assert is_post_due(extracted_aware_dt) is True
    print("PASSED: Timezone-aware timestamp comparison works accurately")

    print("\n--- TEST 2: AM/PM TIME FORMATTING ---")
    assert format_time_ampm("10:06") == "10:06 AM", f"Got: {format_time_ampm('10:06')}"
    assert format_time_ampm("14:30") == "02:30 PM", f"Got: {format_time_ampm('14:30')}"
    assert format_time_ampm("00:15") == "12:15 AM", f"Got: {format_time_ampm('00:15')}"
    assert format_time_ampm("12:00") == "12:00 PM", f"Got: {format_time_ampm('12:00')}"
    assert format_time_ampm("09:45 AM") == "09:45 AM", f"Got: {format_time_ampm('09:45 AM')}"
    assert format_time_ampm(None) == "10:00 AM", f"Got: {format_time_ampm(None)}"
    print("PASSED: 24-hour to 12-hour AM/PM formatting is pristine")

    print("\nALL SCHEDULER TIMEZONE AND AM/PM FORMATTING TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
