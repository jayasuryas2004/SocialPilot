import os
import json
import time
from typing import Any, Optional
from dotenv import load_dotenv
import redis.asyncio as aioredis

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# In-memory dictionary cache fallback (key -> (expire_time, serialized_json))
_MEMORY_CACHE = {}

# Asynchronous connection pool
_ASYNC_POOL = None
_ASYNC_CLIENT = None
_REDIS_AVAILABLE = None


def get_async_pool():
    """
    Initializes and returns the async Redis connection pool.
    """
    global _ASYNC_POOL
    if _ASYNC_POOL is None:
        try:
            _ASYNC_POOL = aioredis.ConnectionPool.from_url(
                REDIS_URL,
                max_connections=20,
                socket_timeout=0.5,
                socket_connect_timeout=0.5,
                decode_responses=True
            )
        except Exception:
            _ASYNC_POOL = None
    return _ASYNC_POOL


def get_async_redis_client():
    """
    Returns an async Redis client instance from the connection pool.
    """
    global _ASYNC_CLIENT
    if _ASYNC_CLIENT is None:
        pool = get_async_pool()
        if pool is not None:
            _ASYNC_CLIENT = aioredis.Redis(connection_pool=pool)
    return _ASYNC_CLIENT


async def get_cached(key: str) -> Optional[Any]:
    """
    Asynchronously retrieves and JSON-deserializes a cached value by key.
    Flow:
      a. Check if the cache key exists in Redis or in-memory fallback.
      b. If it exists, parse and return the cached JSON immediately.
      c. If it does not exist, returns None.
    """
    global _REDIS_AVAILABLE

    # 1. Try Redis async client
    if _REDIS_AVAILABLE is not False:
        client = get_async_redis_client()
        if client is not None:
            try:
                raw_val = await client.get(key)
                if raw_val is not None:
                    _REDIS_AVAILABLE = True
                    return json.loads(raw_val)
            except Exception:
                _REDIS_AVAILABLE = False

    # 2. In-memory fallback
    now = time.time()
    if key in _MEMORY_CACHE:
        expire_at, raw_val = _MEMORY_CACHE[key]
        if now <= expire_at:
            return json.loads(raw_val)
        else:
            del _MEMORY_CACHE[key]

    return None


async def set_cached(key: str, value: Any, ttl_seconds: int = 60) -> bool:
    """
    Asynchronously serializes a value to JSON and stores it in Redis with an expiration TTL.
    Falls back to in-memory dictionary cache with TTL if Redis is unavailable.
    """
    global _REDIS_AVAILABLE
    json_str = json.dumps(value)

    # 1. Try Redis async client
    if _REDIS_AVAILABLE is not False:
        client = get_async_redis_client()
        if client is not None:
            try:
                await client.setex(key, ttl_seconds, json_str)
                _REDIS_AVAILABLE = True
                return True
            except Exception:
                _REDIS_AVAILABLE = False

    # 2. In-memory fallback
    expire_at = time.time() + ttl_seconds
    _MEMORY_CACHE[key] = (expire_at, json_str)
    return True


async def delete_cached(key: str) -> bool:
    """
    Asynchronously deletes a specific cached key.
    """
    global _REDIS_AVAILABLE

    if key in _MEMORY_CACHE:
        del _MEMORY_CACHE[key]

    if _REDIS_AVAILABLE is not False:
        client = get_async_redis_client()
        if client is not None:
            try:
                await client.delete(key)
                return True
            except Exception:
                _REDIS_AVAILABLE = False

    return True


async def invalidate_cache_prefix(prefix: str) -> int:
    """
    Asynchronously invalidates all cached keys matching a specific prefix using standard iterative loops.
    Strictly uses standard for/while loops (no list comprehensions or lambda expressions).
    """
    global _REDIS_AVAILABLE
    deleted_count = 0

    # 1. In-memory prefix invalidation using standard loop
    now = time.time()
    keys_to_delete = []
    for k in _MEMORY_CACHE:
        if k.startswith(prefix):
            keys_to_delete.append(k)

    for k in keys_to_delete:
        if k in _MEMORY_CACHE:
            del _MEMORY_CACHE[k]
            deleted_count += 1

    # 2. Redis prefix invalidation
    if _REDIS_AVAILABLE is not False:
        client = get_async_redis_client()
        if client is not None:
            try:
                pattern = f"{prefix}*"
                async for key in client.scan_iter(match=pattern):
                    await client.delete(key)
                    deleted_count += 1
            except Exception:
                _REDIS_AVAILABLE = False

    return deleted_count


def get_cached_sync(key: str) -> Optional[Any]:
    """
    Synchronous fallback for retrieving cached values.
    """
    now = time.time()
    if key in _MEMORY_CACHE:
        expire_at, raw_val = _MEMORY_CACHE[key]
        if now <= expire_at:
            return json.loads(raw_val)
        else:
            del _MEMORY_CACHE[key]
    return None


def set_cached_sync(key: str, value: Any, ttl_seconds: int = 60) -> bool:
    """
    Synchronous fallback for setting cached values with TTL.
    """
    json_str = json.dumps(value)
    expire_at = time.time() + ttl_seconds
    _MEMORY_CACHE[key] = (expire_at, json_str)
    return True


def invalidate_cache_prefix_sync(prefix: str) -> int:
    """
    Synchronous fallback for invalidating cache prefix with standard for loop.
    """
    deleted_count = 0
    keys_to_delete = []
    for k in _MEMORY_CACHE:
        if k.startswith(prefix):
            keys_to_delete.append(k)

    for k in keys_to_delete:
        if k in _MEMORY_CACHE:
            del _MEMORY_CACHE[k]
            deleted_count += 1

    return deleted_count
