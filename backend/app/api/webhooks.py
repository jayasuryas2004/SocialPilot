import os
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks & Two-Way Sync Engine"])
router_alt = APIRouter(prefix="/webhooks", tags=["Webhooks & Two-Way Sync Engine"])

META_WEBHOOK_SECRET = os.getenv("META_WEBHOOK_SECRET", "socialpilot_secret_123")
LINKEDIN_WEBHOOK_SECRET = os.getenv("LINKEDIN_WEBHOOK_SECRET", "socialpilot_linkedin_secret_123")
TWITTER_WEBHOOK_SECRET = os.getenv("TWITTER_WEBHOOK_SECRET", "socialpilot_twitter_secret_123")


# ============================================================================
# 1. META / FACEBOOK WEBHOOK ENDPOINTS
# ============================================================================

@router.get("/meta")
@router.get("/facebook")
@router_alt.get("/meta")
@router_alt.get("/facebook")
def verify_meta_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """
    Handles Meta Graph API Webhook subscription handshake.
    Validates hub.mode and hub.verify_token against configured secret.
    Strictly uses explicit if/else logic without ternary operators or lambdas.
    """
    if hub_mode == "subscribe":
        if hub_verify_token == META_WEBHOOK_SECRET:
            print(f"[META WEBHOOK VERIFICATION SUCCESS] Validated handshake challenge: {hub_challenge}")
            if hub_challenge is not None:
                try:
                    return Response(content=str(hub_challenge), media_type="text/plain")
                except Exception:
                    return int(hub_challenge)
            return Response(content="OK", media_type="text/plain")

    print("[META WEBHOOK VERIFICATION FAILED] Token mismatch or invalid mode")
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Verification token mismatch or invalid mode"
    )


@router.post("/meta")
@router.post("/facebook")
@router_alt.post("/meta")
@router_alt.post("/facebook")
def handle_meta_webhook_event(
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Processes incoming Meta Page/Feed Webhook events (e.g., native post removal).
    Detects external deletions and synchronizes local database state.
    Strictly uses standard procedural for loops and explicit if/else blocks.
    """
    print(f"[META WEBHOOK EVENT RECEIVED] Payload: {payload}")
    entries = payload.get("entry", [])
    if not isinstance(entries, list):
        entries = []

    deleted_count = 0

    for i in range(len(entries)):
        entry = entries[i]
        if isinstance(entry, dict):
            changes = entry.get("changes", [])
            if not isinstance(changes, list):
                changes = []

            for j in range(len(changes)):
                change = changes[j]
                if isinstance(change, dict):
                    field = change.get("field")
                    value = change.get("value", {})
                    if not isinstance(value, dict):
                        value = {}

                    verb = value.get("verb")
                    if field == "feed":
                        if verb == "remove" or verb == "delete":
                            post_id = value.get("post_id")
                            if not post_id:
                                post_id = value.get("item_id")
                            if not post_id:
                                post_id = value.get("id")

                            if post_id:
                                post_id_str = str(post_id).strip()
                                print(f"[META WEBHOOK DELETION] Detected external removal of Post ID: {post_id_str}")

                                matching_posts = db.query(Post).filter(
                                    (Post.facebook_post_id == post_id_str) |
                                    (Post.facebook_post_id.like(f"%{post_id_str}%"))
                                ).all()

                                for k in range(len(matching_posts)):
                                    p = matching_posts[k]
                                    print(f"[META WEBHOOK SYNC] Removing matching database post ID {p.id}")
                                    db.delete(p)
                                    deleted_count = deleted_count + 1

    if deleted_count > 0:
        db.commit()

    return {
        "status": "success",
        "platform": "meta",
        "deleted_posts_count": deleted_count
    }


# ============================================================================
# 2. LINKEDIN WEBHOOK ENDPOINTS
# ============================================================================

@router.get("/linkedin")
@router_alt.get("/linkedin")
def verify_linkedin_webhook(
    challenge: Optional[str] = Query(None),
    verify_token: Optional[str] = Query(None)
):
    """
    Handles LinkedIn Webhook subscription handshake verification.
    Strictly uses explicit if/else logic without ternary operators or lambdas.
    """
    if verify_token == LINKEDIN_WEBHOOK_SECRET or verify_token is None:
        print(f"[LINKEDIN WEBHOOK VERIFICATION SUCCESS] Validated handshake challenge: {challenge}")
        if challenge is not None:
            return Response(content=str(challenge), media_type="text/plain")
        return Response(content="OK", media_type="text/plain")

    print("[LINKEDIN WEBHOOK VERIFICATION FAILED] Token mismatch")
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Verification token mismatch"
    )


@router.post("/linkedin")
@router_alt.post("/linkedin")
def handle_linkedin_webhook_event(
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Processes incoming LinkedIn Webhook events (e.g. organization post deleted).
    Detects external deletions and synchronizes local database state.
    Strictly uses standard procedural for loops and explicit if/else blocks.
    """
    print(f"[LINKEDIN WEBHOOK EVENT RECEIVED] Payload: {payload}")
    events = payload.get("events", [])
    if not isinstance(events, list):
        events = payload.get("elements", [])
    if not isinstance(events, list):
        events = []

    deleted_count = 0

    for i in range(len(events)):
        event = events[i]
        if isinstance(event, dict):
            event_type = str(event.get("type", "")).upper()
            action = str(event.get("action", "")).lower()

            is_delete = False
            if event_type == "DELETE":
                is_delete = True
            elif action == "remove":
                is_delete = True
            elif action == "delete":
                is_delete = True
            elif "DELETED" in event_type:
                is_delete = True

            if is_delete:
                urn = event.get("urn")
                if not urn:
                    urn = event.get("entityUrn")
                if not urn:
                    urn = event.get("id")

                if urn:
                    urn_str = str(urn).strip()
                    print(f"[LINKEDIN WEBHOOK DELETION] Detected external removal of URN: {urn_str}")

                    matching_posts = db.query(Post).filter(
                        (Post.linkedin_urn == urn_str) |
                        (Post.linkedin_urn.like(f"%{urn_str}%"))
                    ).all()

                    for k in range(len(matching_posts)):
                        p = matching_posts[k]
                        print(f"[LINKEDIN WEBHOOK SYNC] Removing matching database post ID {p.id}")
                        db.delete(p)
                        deleted_count = deleted_count + 1

    if deleted_count > 0:
        db.commit()

    return {
        "status": "success",
        "platform": "linkedin",
        "deleted_posts_count": deleted_count
    }


# ============================================================================
# 3. FUTURE PLATFORM WEBHOOK EXPANSION (Twitter/X, Pinterest, etc.)
# ============================================================================

@router.get("/twitter")
@router_alt.get("/twitter")
def verify_twitter_webhook(
    crc_token: Optional[str] = Query(None)
):
    """
    Handles Twitter/X Account Activity API CRC challenge.
    """
    if crc_token:
        import hmac
        import hashlib
        import base64
        sha256_hash_digest = hmac.new(
            TWITTER_WEBHOOK_SECRET.encode("utf-8"),
            msg=crc_token.encode("utf-8"),
            digestmod=hashlib.sha256
        ).digest()
        response_token = "sha256=" + base64.b64encode(sha256_hash_digest).decode("utf-8")
        return {"response_token": response_token}
    return Response(content="OK", media_type="text/plain")


@router.post("/twitter")
@router_alt.post("/twitter")
def handle_twitter_webhook_event(
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Handles Twitter/X native deletion events.
    """
    tweet_delete_events = payload.get("tweet_delete_events", [])
    if not isinstance(tweet_delete_events, list):
        tweet_delete_events = []

    deleted_count = 0
    for i in range(len(tweet_delete_events)):
        del_event = tweet_delete_events[i]
        if isinstance(del_event, dict):
            status_data = del_event.get("status", {})
            tweet_id = status_data.get("id_str")
            if not tweet_id:
                tweet_id = status_data.get("id")

            if tweet_id:
                tweet_id_str = str(tweet_id)
                matching = db.query(Post).filter(
                    Post.content.like(f"%{tweet_id_str}%")
                ).all()
                for k in range(len(matching)):
                    db.delete(matching[k])
                    deleted_count = deleted_count + 1

    if deleted_count > 0:
        db.commit()

    return {
        "status": "success",
        "platform": "twitter",
        "deleted_posts_count": deleted_count
    }
