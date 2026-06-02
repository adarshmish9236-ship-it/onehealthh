import time
from flask import request
from functools import wraps
from utils.exceptions import RateLimitExceededError

# Simple in-memory rate limiter using a sliding window.
# Format: { "rate_limit:ip:endpoint": [timestamp1, timestamp2, ...] }
_cache = {}

def rate_limit(limit: int, window: int):
    """
    Rate limiting middleware using in-memory dictionary.
    limit: Number of requests allowed
    window: Time window in seconds
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            ip = request.remote_addr
            endpoint = request.endpoint
            
            key = f"rate_limit:{ip}:{endpoint}"
            current_time = time.time()
            
            # Clean up old entries
            if key in _cache:
                _cache[key] = [t for t in _cache[key] if current_time - t < window]
            else:
                _cache[key] = []
                
            if len(_cache[key]) >= limit:
                raise RateLimitExceededError({'limit': limit, 'window': window, 'ip': ip})
                
            _cache[key].append(current_time)
            
            # Optional cleanup strategy for very large caches can be implemented here
            # if the dict gets too large (e.g. len(_cache) > 10000).
            if len(_cache) > 10000:
                keys_to_delete = []
                for k, v in _cache.items():
                    if not v or current_time - v[-1] > window:
                        keys_to_delete.append(k)
                for k in keys_to_delete:
                    del _cache[k]
                    
            return f(*args, **kwargs)
        return decorated_function
    return decorator
