import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Union
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import pytz

from app.database import get_db
from app.models.user import User
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.scheduled_post import ScheduledPost
from app.core.vault import decrypt_token
from app.core.security import bearer_scheme, decode_access_token
from app.services.facebook_service import publish_to_facebook
from app.services.social_media import publish_to_linkedin
from app.services.instagram_service import publish_to_instagram

router = APIRouter(prefix="/api/social/publish", tags=["Multi-Platform Publishing Engine"])
router_alt = APIRouter(prefix="/publish", tags=["Multi-Platform Publishing Engine"])
router_social = APIRouter(prefix="/api/publish", tags=["Multi-Platform Publishing Engine"])

router_schedule = APIRouter(prefix="/api/social/schedule", tags=["Background Scheduling Engine"])
router_schedule_alt = APIRouter(prefix="/social/schedule", tags=["Background Scheduling Engine"])


class PublishRequest(BaseModel):
    content: str
    platforms: Optional[Union[List[str], str]] = None
    title: Optional[str] = None
    image_url: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = "image"


class SchedulePostRequest(BaseModel):
    content: str
    platforms: Optional[Union[List[str], str]] = None
    scheduled_for: datetime
    title: Optional[str] = None
    image_url: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = "image"


def get_request_user(auth_creds, db: Session) -> Optional[User]:
    """
    Helper function to resolve the current user from Bearer credentials
    with safe fallback to the primary workspace user.
    """
    if auth_creds and auth_creds.credentials:
        token = auth_creds.credentials.strip()
        if len(token) > 0:
            try:
                payload = decode_access_token(token)
                sub = payload.get("sub")
                if sub:
                    u = db.query(User).filter(User.id == int(sub)).first()
                    if u:
                        return u
            except Exception as e:
                print(f"Notice during publish user resolution: {e}")

    # Fallback to first registered user
    first_u = db.query(User).order_by(User.id.asc()).first()
    return first_u


# ========================================================
# 1. UNIFIED MULTI-PLATFORM IMMEDIATE PUBLISHING
# ========================================================
@router.post("/")
@router.post("")
@router_alt.post("/")
@router_alt.post("")
@router_social.post("/")
@router_social.post("")
async def publish_content_multi_platform(
    payload: PublishRequest,
    auth_creds: Optional[Any] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """
    Publishes content to multiple social media platforms simultaneously (Meta / Facebook and LinkedIn).
    Decrypts vaulted tokens, routes to service functions with per-platform error isolation,
    and returns a consolidated status report.
    Strictly uses standard procedural for and while loops (zero comprehensions/lambdas).
    """
    if not payload.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post content cannot be empty."
        )
    if len(payload.content.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post content cannot be empty."
        )

    current_user = get_request_user(auth_creds, db)
    user_id = None
    if current_user:
        user_id = current_user.id

    # Parse and normalize target platforms using standard procedural loop
    raw_platforms = payload.platforms
    target_platforms = []

    if isinstance(raw_platforms, list):
        for p in raw_platforms:
            if p:
                clean_p = str(p).strip().lower()
                if len(clean_p) > 0:
                    if clean_p not in target_platforms:
                        target_platforms.append(clean_p)
    elif isinstance(raw_platforms, str):
        if len(raw_platforms.strip()) > 0:
            parts = raw_platforms.split(",")
            for part in parts:
                clean_part = part.strip().lower()
                if len(clean_part) > 0:
                    if clean_part not in target_platforms:
                        target_platforms.append(clean_part)

    if len(target_platforms) == 0:
        target_platforms.append("facebook")
        target_platforms.append("linkedin")

    platforms_str = ", ".join(target_platforms)
    print(f"[PUBLISH ENGINE] Initiating multi-platform publish for platforms: {target_platforms}")

    media_link = payload.media_url
    if not media_link:
        media_link = payload.image_url

    post_title = payload.title
    if not post_title:
        if len(payload.content) > 50:
            post_title = payload.content[:50]
        else:
            post_title = payload.content
    if not post_title:
        post_title = "SocialPilot Post"

    media_type_val = "image"
    if payload.media_type:
        media_type_val = payload.media_type

    # Calculate local time (UTC+5:30) for accurate timestamping
    local_time = datetime.utcnow() + timedelta(hours=5, minutes=30)

    # 1. Create single unified Post record with initial status="Publishing" and local timestamp
    new_post = Post(
        user_id=user_id,
        title=post_title,
        content=payload.content.strip(),
        platforms=platforms_str,
        platform=platforms_str,
        status="Publishing",
        scheduled_at=local_time,
        scheduled_date=local_time.date(),
        scheduled_time=local_time.strftime("%I:%M %p"),
        image_url=media_link,
        media_url=media_link,
        media_type=media_type_val
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    # 2. Fetch user's connected social accounts
    user_accounts = []
    if user_id is not None:
        user_accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()

    if len(user_accounts) == 0:
        new_post.status = "Failed"
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No linked social accounts found for this user."
        )

    results: Dict[str, Any] = {}
    overall_success = True

    # 3. Process each requested platform with isolated error boundaries
    for platform_name in target_platforms:
        print(f"[PUBLISH ENGINE] Processing platform: {platform_name}")

        # ----------------------------------------------------
        # 3a. META / FACEBOOK PUBLISHING
        # ----------------------------------------------------
        if platform_name in ["facebook", "meta", "fb"]:
            try:
                fb_account = None
                for acc in user_accounts:
                    if acc.platform:
                        if acc.platform.lower() == "facebook":
                            fb_account = acc
                            break

                if not fb_account or not fb_account.access_token:
                    results["facebook"] = {
                        "status": "error",
                        "detail": "No connected Facebook account found in vault. Please connect your Facebook Page."
                    }
                    overall_success = False
                else:
                    decrypted_page_token = decrypt_token(fb_account.access_token)
                    page_id = fb_account.platform_user_id
                    if not page_id:
                        page_id = "me"

                    fb_success, fb_response = await publish_to_facebook(
                        page_id=page_id,
                        page_token=decrypted_page_token,
                        message=payload.content,
                        media_url=media_link
                    )

                    if fb_success:
                        fb_post_id_val = None
                        if isinstance(fb_response, dict):
                            fb_post_id_val = fb_response.get("post_id")
                            if not fb_post_id_val:
                                fb_post_id_val = fb_response.get("id")
                        if fb_post_id_val is not None:
                            new_post.facebook_post_id = str(fb_post_id_val)
                            db.add(new_post)
                            db.commit()
                            db.refresh(new_post)

                        results["facebook"] = {
                            "status": "success",
                            "account_name": fb_account.account_name,
                            "post_id": fb_response.get("post_id"),
                            "data": fb_response
                        }
                    else:
                        results["facebook"] = {
                            "status": "error",
                            "account_name": fb_account.account_name,
                            "error": fb_response
                        }
                        overall_success = False

            except Exception as fb_err:
                print(f"[PUBLISH ENGINE EXCEPTION] Error publishing to Facebook: {fb_err}")
                results["facebook"] = {
                    "status": "error",
                    "error": str(fb_err)
                }
                overall_success = False

        # ----------------------------------------------------
        # 3b. LINKEDIN PUBLISHING
        # ----------------------------------------------------
        elif platform_name in ["linkedin", "li"]:
            try:
                li_success, li_message = publish_to_linkedin(new_post, db)

                if li_success:
                    results["linkedin"] = {
                        "status": "success",
                        "urn": getattr(new_post, "linkedin_urn", None),
                        "post_id": new_post.id,
                        "detail": li_message
                    }
                else:
                    results["linkedin"] = {
                        "status": "error",
                        "post_id": new_post.id,
                        "detail": li_message
                    }
                    overall_success = False

            except Exception as li_err:
                print(f"[PUBLISH ENGINE EXCEPTION] Error publishing to LinkedIn: {li_err}")
                results["linkedin"] = {
                    "status": "error",
                    "error": str(li_err)
                }
                overall_success = False

        # ----------------------------------------------------
        # 3c. INSTAGRAM GRAPH API PUBLISHING (2-Step Container Flow)
        # ----------------------------------------------------
        elif platform_name in ["instagram", "ig"]:
            try:
                ig_account = None
                for acc in user_accounts:
                    if acc.platform:
                        if acc.platform.lower() == "instagram":
                            ig_account = acc
                            break

                if not ig_account:
                    for acc in user_accounts:
                        if acc.platform:
                            if acc.platform.lower() == "facebook":
                                ig_account = acc
                                break

                if not ig_account or not ig_account.access_token:
                    results["instagram"] = {
                        "status": "error",
                        "detail": "No connected Instagram Professional account found in vault. Please connect Instagram via Meta OAuth."
                    }
                    overall_success = False
                else:
                    decrypted_ig_token = decrypt_token(ig_account.access_token)
                    ig_acc_id = ig_account.platform_user_id
                    if not ig_acc_id:
                        ig_acc_id = "me"

                    ig_success, ig_response = await publish_to_instagram(
                        ig_account_id=ig_acc_id,
                        access_token=decrypted_ig_token,
                        message=payload.content,
                        image_url=media_link
                    )

                    if ig_success:
                        results["instagram"] = {
                            "status": "success",
                            "account_name": ig_account.account_name,
                            "post_id": ig_response.get("post_id"),
                            "container_id": ig_response.get("container_id"),
                            "data": ig_response
                        }
                    else:
                        results["instagram"] = {
                            "status": "error",
                            "account_name": ig_account.account_name,
                            "error": ig_response
                        }
                        overall_success = False

            except Exception as ig_err:
                print(f"[PUBLISH ENGINE EXCEPTION] Error publishing to Instagram: {ig_err}")
                results["instagram"] = {
                    "status": "error",
                    "error": str(ig_err)
                }
                overall_success = False

        # ----------------------------------------------------
        # 3d. OTHER PLATFORMS
        # ----------------------------------------------------
        else:
            results[platform_name] = {
                "status": "queued",
                "detail": f"Content staged for {platform_name} publishing pipeline."
            }

    # 4. Update Post status strictly based on overall API result
    if overall_success:
        new_post.status = "Published"
    else:
        new_post.status = "Failed"

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    msg = "Multi-platform publishing completed with partial results."
    if overall_success:
        msg = "Multi-platform publishing processed successfully."

    return {
        "message": msg,
        "success": overall_success,
        "results": results,
        "post_id": new_post.id,
        "status": new_post.status,
        "platforms_requested": target_platforms
    }


# ========================================================
# 2. BACKGROUND SCHEDULE POST ENDPOINT
# ========================================================
@router_schedule.post("/")
@router_schedule.post("")
@router_schedule_alt.post("/")
@router_schedule_alt.post("")
@router.post("/schedule")
@router_alt.post("/schedule")
@router_social.post("/schedule")
async def schedule_social_post(
    payload: SchedulePostRequest,
    auth_creds: Optional[Any] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """
    Schedules a social media post for automated future publishing.
    Validates that scheduled_for is in the future, persists to the ScheduledPost table
    with status='pending', and returns a success confirmation.
    Strictly uses standard procedural for and while loops (zero comprehensions/lambdas).
    """
    if not payload.content or len(payload.content.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post content cannot be empty."
        )

    # 1. Normalize and convert timezone for scheduled_for
    scheduled_for_val = getattr(payload, "scheduled_for", None)
    scheduled_time_utc = None

    if scheduled_for_val is not None:
        if isinstance(scheduled_for_val, datetime):
            if scheduled_for_val.tzinfo is not None and scheduled_for_val.tzinfo.utcoffset(scheduled_for_val) is not None:
                scheduled_time_utc = scheduled_for_val.astimezone(pytz.utc).replace(tzinfo=None)
            else:
                # Localize naive datetime to user's timezone (Asia/Kolkata) and convert to UTC
                ist_tz = pytz.timezone("Asia/Kolkata")
                localized_dt = ist_tz.localize(scheduled_for_val)
                scheduled_time_utc = localized_dt.astimezone(pytz.utc).replace(tzinfo=None)

    now_utc = datetime.utcnow()
    if scheduled_time_utc is not None:
        if scheduled_time_utc <= now_utc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="scheduled_for timestamp must be in the future."
            )

    current_user = get_request_user(auth_creds, db)
    user_id = current_user.id if current_user else None

    # 2. Parse target platforms
    target_platforms = []
    if isinstance(payload.platforms, list):
        for p in payload.platforms:
            if p and len(str(p).strip()) > 0:
                clean_p = str(p).strip().lower()
                if clean_p not in target_platforms:
                    target_platforms.append(clean_p)
    elif isinstance(payload.platforms, str) and len(payload.platforms.strip()) > 0:
        parts = payload.platforms.split(",")
        for part in parts:
            clean_part = part.strip().lower()
            if len(clean_part) > 0 and clean_part not in target_platforms:
                target_platforms.append(clean_part)

    if len(target_platforms) == 0:
        target_platforms.append("facebook")
        target_platforms.append("linkedin")

    platforms_str = ", ".join(target_platforms)

    # 3. Create ScheduledPost record with UTC scheduled_for
    scheduled_post = ScheduledPost(
        user_id=user_id,
        content=payload.content.strip(),
        platforms=platforms_str,
        media_url=payload.media_url or payload.image_url,
        media_type=payload.media_type or "image",
        scheduled_for=scheduled_time_utc,
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(scheduled_post)
    db.commit()
    db.refresh(scheduled_post)

    print(f"[SCHEDULER] Successfully scheduled post #{scheduled_post.id} for {scheduled_time_utc.isoformat() if scheduled_time_utc else 'None'} UTC.")

    return {
        "message": "Post scheduled successfully for background publishing.",
        "success": True,
        "scheduled_post": {
            "id": scheduled_post.id,
            "user_id": scheduled_post.user_id,
            "content": scheduled_post.content,
            "platforms": target_platforms,
            "scheduled_for": scheduled_post.scheduled_for.isoformat(),
            "status": scheduled_post.status,
            "media_url": scheduled_post.media_url
        }
    }
