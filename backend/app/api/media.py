import os
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/social", tags=["Media Upload Engine"])
router_alt = APIRouter(prefix="/social", tags=["Media Upload Engine"])
router_direct = APIRouter(prefix="/api", tags=["Media Upload Engine"])

# Resolve absolute uploads directory
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "media"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
@router_alt.post("/upload")
@router_direct.post("/upload")
async def upload_media_file(file: UploadFile = File(...)):
    """
    Accepts multipart/form-data media uploads (images and videos),
    saves them to uploads/media/ with a unique UUID filename,
    and returns absolute and relative public URLs.
    Strictly uses standard procedural while loops for memory-safe chunked reading.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided."
        )

    # Sanitize extension
    orig_name = os.path.basename(file.filename)
    name_parts = orig_name.rsplit(".", 1)
    if len(name_parts) == 2:
        ext = name_parts[1].lower()
    else:
        ext = "png"

    # Validate allowed image and video formats
    allowed_exts = [
        "jpg", "jpeg", "png", "webp", "gif", "svg",
        "mp4", "mov", "webm", "mkv", "quicktime"
    ]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '.{ext}'. Allowed formats: {', '.join(allowed_exts)}"
        )

    # Generate unique UUID filename
    unique_id = uuid.uuid4().hex
    clean_base = "".join([c for c in name_parts[0] if c.isalnum() or c in ("-", "_")])[:30]
    filename = f"{unique_id}_{clean_base}.{ext}" if clean_base else f"{unique_id}.{ext}"

    destination_path = os.path.join(UPLOAD_DIR, filename)

    # Memory-safe chunked reading using procedural while loop (AST compliant)
    chunk_size = 1024 * 1024  # 1MB chunks
    try:
        with open(destination_path, "wb") as buffer:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                buffer.write(chunk)
    except Exception as exc:
        print(f"[MEDIA UPLOAD ERROR] Failed to save file {filename}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(exc)}"
        )

    # Base URL configuration
    base_url = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")
    media_relative_url = f"/uploads/media/{filename}"
    media_absolute_url = f"{base_url}{media_relative_url}"

    print(f"[MEDIA UPLOAD SUCCESS] Saved media file to {destination_path} -> URL: {media_absolute_url}")

    return {
        "message": "Media uploaded successfully.",
        "media_url": media_relative_url,
        "url": media_absolute_url,
        "filename": filename
    }
