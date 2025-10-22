"""
Comprehensive Caching Infrastructure for AI Operations
Supports multiple cache backends: Redis, in-memory, file-based
Includes TTL, LRU eviction, and cache warming strategies
"""

import os
import json
import hashlib
import time
import pickle
from typing import Any, Dict, Optional, Callable, List, Tuple
from functools import wraps
from datetime import datetime, timedelta
from collections import OrderedDict
from threading import Lock
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import Redis (optional dependency)
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available. Using in-memory cache only.")


# ============================================================================
# CONFIGURATION
# ============================================================================

class CacheConfig:
    """Central cache configuration"""
    # Cache backend selection
    USE_REDIS = os.getenv("USE_REDIS_CACHE", "false").lower() == "true" and REDIS_AVAILABLE
    
    # Redis configuration
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
    
    # In-memory cache configuration
    MEMORY_CACHE_MAX_SIZE = int(os.getenv("MEMORY_CACHE_MAX_SIZE", "1000"))
    
    # TTL configurations (in seconds)
    TTL_EMBEDDING = int(os.getenv("CACHE_TTL_EMBEDDING", "86400"))  # 24 hours
    TTL_ROLE_MATCH = int(os.getenv("CACHE_TTL_ROLE_MATCH", "3600"))  # 1 hour
    TTL_LEADERSHIP_SCORE = int(os.getenv("CACHE_TTL_LEADERSHIP", "7200"))  # 2 hours
    TTL_CAREER_ROADMAP = int(os.getenv("CACHE_TTL_ROADMAP", "3600"))  # 1 hour
    TTL_NARRATIVE = int(os.getenv("CACHE_TTL_NARRATIVE", "1800"))  # 30 minutes
    TTL_AI_RESPONSE = int(os.getenv("CACHE_TTL_AI_RESPONSE", "900"))  # 15 minutes
    
    # Cache warming settings
    ENABLE_CACHE_WARMING = os.getenv("ENABLE_CACHE_WARMING", "false").lower() == "true"
    
    # Statistics
    ENABLE_CACHE_STATS = os.getenv("ENABLE_CACHE_STATS", "true").lower() == "true"


# ============================================================================
# IN-MEMORY LRU CACHE
# ============================================================================

class LRUCache:
    """Thread-safe LRU cache with TTL support"""
    
    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self.cache: OrderedDict = OrderedDict()
        self.lock = Lock()
        self.hits = 0
        self.misses = 0
        self.evictions = 0
    
    def _generate_key(self, namespace: str, key: str) -> str:
        """Generate namespaced cache key"""
        return f"{namespace}:{key}"
    
    def get(self, namespace: str, key: str) -> Optional[Tuple[Any, float]]:
        """Get value from cache. Returns (value, expiry_time) or None"""
        cache_key = self._generate_key(namespace, key)
        
        with self.lock:
            if cache_key in self.cache:
                # Move to end (most recently used)
                self.cache.move_to_end(cache_key)
                value, expiry = self.cache[cache_key]
                
                # Check if expired
                if expiry and time.time() > expiry:
                    del self.cache[cache_key]
                    self.misses += 1
                    return None
                
                self.hits += 1
                return value
            else:
                self.misses += 1
                return None
    
    def set(self, namespace: str, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache with optional TTL"""
        cache_key = self._generate_key(namespace, key)
        expiry = time.time() + ttl if ttl else None
        
        with self.lock:
            # If key exists, move to end
            if cache_key in self.cache:
                self.cache.move_to_end(cache_key)
            
            # Add new entry
            self.cache[cache_key] = (value, expiry)
            
            # Evict oldest if over capacity
            if len(self.cache) > self.max_size:
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]
                self.evictions += 1
    
    def delete(self, namespace: str, key: str):
        """Delete key from cache"""
        cache_key = self._generate_key(namespace, key)
        with self.lock:
            if cache_key in self.cache:
                del self.cache[cache_key]
    
    def clear(self, namespace: Optional[str] = None):
        """Clear all cache or namespace"""
        with self.lock:
            if namespace:
                # Clear only keys in namespace
                keys_to_delete = [k for k in self.cache.keys() if k.startswith(f"{namespace}:")]
                for key in keys_to_delete:
                    del self.cache[key]
            else:
                self.cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "type": "in-memory",
            "size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate:.2f}%",
            "evictions": self.evictions
        }


# ============================================================================
# REDIS CACHE BACKEND
# ============================================================================

class RedisCache:
    """Redis-based cache backend"""
    
    def __init__(self):
        if not REDIS_AVAILABLE:
            raise RuntimeError("Redis not available")
        
        self.client = redis.Redis(
            host=CacheConfig.REDIS_HOST,
            port=CacheConfig.REDIS_PORT,
            db=CacheConfig.REDIS_DB,
            password=CacheConfig.REDIS_PASSWORD,
            decode_responses=False  # We'll handle encoding
        )
        
        # Test connection
        try:
            self.client.ping()
            logger.info(f"✅ Connected to Redis at {CacheConfig.REDIS_HOST}:{CacheConfig.REDIS_PORT}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
        
        self.hits = 0
        self.misses = 0
    
    def _generate_key(self, namespace: str, key: str) -> str:
        """Generate namespaced cache key"""
        return f"compass:{namespace}:{key}"
    
    def get(self, namespace: str, key: str) -> Optional[Any]:
        """Get value from Redis cache"""
        cache_key = self._generate_key(namespace, key)
        
        try:
            value = self.client.get(cache_key)
            if value:
                self.hits += 1
                return pickle.loads(value)
            else:
                self.misses += 1
                return None
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            self.misses += 1
            return None
    
    def set(self, namespace: str, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in Redis cache with optional TTL"""
        cache_key = self._generate_key(namespace, key)
        
        try:
            serialized = pickle.dumps(value)
            if ttl:
                self.client.setex(cache_key, ttl, serialized)
            else:
                self.client.set(cache_key, serialized)
        except Exception as e:
            logger.error(f"Redis set error: {e}")
    
    def delete(self, namespace: str, key: str):
        """Delete key from Redis"""
        cache_key = self._generate_key(namespace, key)
        try:
            self.client.delete(cache_key)
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
    
    def clear(self, namespace: Optional[str] = None):
        """Clear cache by namespace or all"""
        try:
            if namespace:
                pattern = f"compass:{namespace}:*"
                keys = self.client.keys(pattern)
                if keys:
                    self.client.delete(*keys)
            else:
                self.client.flushdb()
        except Exception as e:
            logger.error(f"Redis clear error: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            info = self.client.info()
            total_requests = self.hits + self.misses
            hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
            
            return {
                "type": "redis",
                "connected": True,
                "used_memory": info.get("used_memory_human", "N/A"),
                "keys": self.client.dbsize(),
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": f"{hit_rate:.2f}%"
            }
        except Exception as e:
            return {
                "type": "redis",
                "connected": False,
                "error": str(e)
            }


# ============================================================================
# UNIFIED CACHE MANAGER
# ============================================================================

class CacheManager:
    """Unified cache manager that handles both Redis and in-memory caching"""
    
    def __init__(self):
        self.backend = self._initialize_backend()
        logger.info(f"✅ Cache initialized with backend: {self.backend.__class__.__name__}")
    
    def _initialize_backend(self):
        """Initialize appropriate cache backend"""
        if CacheConfig.USE_REDIS:
            try:
                return RedisCache()
            except Exception as e:
                logger.warning(f"Failed to initialize Redis, falling back to in-memory: {e}")
                return LRUCache(max_size=CacheConfig.MEMORY_CACHE_MAX_SIZE)
        else:
            return LRUCache(max_size=CacheConfig.MEMORY_CACHE_MAX_SIZE)
    
    def get(self, namespace: str, key: str) -> Optional[Any]:
        """Get value from cache"""
        result = self.backend.get(namespace, key)
        
        # For LRUCache, unpack tuple
        if isinstance(self.backend, LRUCache) and result is not None:
            return result  # Already returns value directly
        
        return result
    
    def set(self, namespace: str, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        self.backend.set(namespace, key, value, ttl)
    
    def delete(self, namespace: str, key: str):
        """Delete key from cache"""
        self.backend.delete(namespace, key)
    
    def clear(self, namespace: Optional[str] = None):
        """Clear cache"""
        self.backend.clear(namespace)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return self.backend.get_stats()


# Global cache instance
cache_manager = CacheManager()


# ============================================================================
# CACHE KEY GENERATORS
# ============================================================================

def generate_cache_key(*args, **kwargs) -> str:
    """Generate deterministic cache key from arguments"""
    # Create a string representation of all arguments
    key_parts = []
    
    for arg in args:
        if isinstance(arg, (dict, list)):
            # Sort dict keys for consistency
            key_parts.append(json.dumps(arg, sort_keys=True))
        else:
            key_parts.append(str(arg))
    
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (dict, list)):
            key_parts.append(f"{k}={json.dumps(v, sort_keys=True)}")
        else:
            key_parts.append(f"{k}={v}")
    
    # Hash the key for compact storage
    key_string = "|".join(key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()


def generate_employee_cache_key(employee_id: str, operation: str, **params) -> str:
    """Generate cache key for employee-specific operations"""
    key_parts = [employee_id, operation]
    for k, v in sorted(params.items()):
        key_parts.append(f"{k}={v}")
    return ":".join(key_parts)


# ============================================================================
# CACHE DECORATORS
# ============================================================================

def cache_embedding(ttl: Optional[int] = None):
    """Cache decorator for embedding generation"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function arguments
            cache_key = generate_cache_key(*args, **kwargs)
            
            # Try to get from cache
            cached_value = cache_manager.get("embedding", cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT for embedding: {cache_key[:16]}...")
                return cached_value
            
            # Cache miss - compute value
            logger.debug(f"Cache MISS for embedding: {cache_key[:16]}...")
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_ttl = ttl or CacheConfig.TTL_EMBEDDING
            cache_manager.set("embedding", cache_key, result, cache_ttl)
            
            return result
        return wrapper
    return decorator


def cache_role_matching(ttl: Optional[int] = None):
    """Cache decorator for role matching operations"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(*args, **kwargs)
            
            # Try cache
            cached_value = cache_manager.get("role_match", cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT for role matching: {cache_key[:16]}...")
                return cached_value
            
            # Compute
            logger.debug(f"Cache MISS for role matching: {cache_key[:16]}...")
            result = func(*args, **kwargs)
            
            # Store
            cache_ttl = ttl or CacheConfig.TTL_ROLE_MATCH
            cache_manager.set("role_match", cache_key, result, cache_ttl)
            
            return result
        return wrapper
    return decorator


def cache_leadership_score(ttl: Optional[int] = None):
    """Cache decorator for leadership potential scoring"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(*args, **kwargs)
            
            # Try cache
            cached_value = cache_manager.get("leadership", cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT for leadership score: {cache_key[:16]}...")
                return cached_value
            
            # Compute
            logger.debug(f"Cache MISS for leadership score: {cache_key[:16]}...")
            result = func(*args, **kwargs)
            
            # Store
            cache_ttl = ttl or CacheConfig.TTL_LEADERSHIP_SCORE
            cache_manager.set("leadership", cache_key, result, cache_ttl)
            
            return result
        return wrapper
    return decorator


def cache_career_roadmap(ttl: Optional[int] = None):
    """Cache decorator for career roadmap generation"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(*args, **kwargs)
            
            # Try cache
            cached_value = cache_manager.get("roadmap", cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT for career roadmap: {cache_key[:16]}...")
                return cached_value
            
            # Compute
            logger.debug(f"Cache MISS for career roadmap: {cache_key[:16]}...")
            result = func(*args, **kwargs)
            
            # Store
            cache_ttl = ttl or CacheConfig.TTL_CAREER_ROADMAP
            cache_manager.set("roadmap", cache_key, result, cache_ttl)
            
            return result
        return wrapper
    return decorator


def cache_ai_response(ttl: Optional[int] = None):
    """Cache decorator for AI-generated responses (narratives, copilot, etc.)"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = generate_cache_key(*args, **kwargs)
            
            # Try cache
            cached_value = cache_manager.get("ai_response", cache_key)
            if cached_value is not None:
                logger.debug(f"Cache HIT for AI response: {cache_key[:16]}...")
                return cached_value
            
            # Compute
            logger.debug(f"Cache MISS for AI response: {cache_key[:16]}...")
            result = func(*args, **kwargs)
            
            # Store
            cache_ttl = ttl or CacheConfig.TTL_AI_RESPONSE
            cache_manager.set("ai_response", cache_key, result, cache_ttl)
            
            return result
        return wrapper
    return decorator


# ============================================================================
# CACHE INVALIDATION
# ============================================================================

def invalidate_employee_cache(employee_id: str):
    """Invalidate all cache entries for a specific employee"""
    logger.info(f"Invalidating cache for employee: {employee_id}")
    
    # This is a simplified approach - in production, you'd want to track
    # which cache keys belong to which employee
    namespaces = ["role_match", "leadership", "roadmap", "ai_response"]
    
    for namespace in namespaces:
        # Clear entire namespace (not ideal but safe)
        # Better approach: maintain an index of employee_id -> cache_keys
        cache_manager.clear(namespace)


def invalidate_role_cache():
    """Invalidate cache when role data changes"""
    logger.info("Invalidating role-related cache")
    cache_manager.clear("role_match")
    cache_manager.clear("roadmap")


# ============================================================================
# CACHE WARMING
# ============================================================================

def warm_cache_for_employee(employee_dict: Dict[str, Any], roles_dict: List[Dict[str, Any]]):
    """Pre-compute and cache expensive operations for an employee"""
    if not CacheConfig.ENABLE_CACHE_WARMING:
        return
    
    logger.info(f"Warming cache for employee: {employee_dict.get('employee_id')}")
    
    try:
        # Import here to avoid circular dependencies
        from ai_engine import match_employee_to_roles, generate_embedding, create_profile_text
        from leadership_potential import compute_leadership_potential, calculate_max_metrics
        from career_roadmap import calculate_current_roadmap
        
        # Warm embedding cache
        profile_text = create_profile_text(employee_dict)
        generate_embedding(profile_text)
        
        # Warm role matching cache
        match_employee_to_roles(employee_dict, roles_dict, top_k=5)
        
        # Warm leadership cache
        max_metrics = {
            'max_outcome': 100,
            'max_stakeholders': 15,
            'max_progression': 1.5
        }
        compute_leadership_potential(employee_dict, max_metrics, use_augmentations=True)
        
        # Warm roadmap cache
        calculate_current_roadmap(employee_dict, roles_dict)
        
        logger.info(f"✅ Cache warmed for employee: {employee_dict.get('employee_id')}")
        
    except Exception as e:
        logger.error(f"Cache warming failed: {e}")


# ============================================================================
# CACHE STATISTICS AND MONITORING
# ============================================================================

def get_cache_statistics() -> Dict[str, Any]:
    """Get comprehensive cache statistics"""
    stats = cache_manager.get_stats()
    
    return {
        **stats,
        "config": {
            "backend": "redis" if CacheConfig.USE_REDIS else "in-memory",
            "redis_host": CacheConfig.REDIS_HOST if CacheConfig.USE_REDIS else None,
            "memory_max_size": CacheConfig.MEMORY_CACHE_MAX_SIZE,
            "ttl_embedding": CacheConfig.TTL_EMBEDDING,
            "ttl_role_match": CacheConfig.TTL_ROLE_MATCH,
            "ttl_leadership": CacheConfig.TTL_LEADERSHIP_SCORE,
            "ttl_roadmap": CacheConfig.TTL_CAREER_ROADMAP,
            "cache_warming_enabled": CacheConfig.ENABLE_CACHE_WARMING
        }
    }


def reset_cache_stats():
    """Reset cache statistics"""
    if hasattr(cache_manager.backend, 'hits'):
        cache_manager.backend.hits = 0
        cache_manager.backend.misses = 0
    if hasattr(cache_manager.backend, 'evictions'):
        cache_manager.backend.evictions = 0
