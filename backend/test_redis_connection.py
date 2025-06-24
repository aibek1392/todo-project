#!/usr/bin/env python3
"""
Simple Redis connection test

Tests if Redis is available and working for the meal planner.
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_redis_connection():
    """Test Redis connectivity"""
    
    print("🔗 Testing Redis Connection")
    print("=" * 40)
    
    try:
        import redis.asyncio as redis
        
        # Get Redis URL from environment or use default
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        print(f"📍 Connecting to: {redis_url}")
        
        # Create Redis client
        redis_client = redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True
        )
        
        # Test basic operations
        print("🔍 Testing basic Redis operations...")
        
        # Test ping
        await redis_client.ping()
        print("✅ PING successful")
        
        # Test set/get
        test_key = "meal_planner_test"
        test_value = "Hello Redis!"
        
        await redis_client.setex(test_key, 60, test_value)  # 60 second TTL
        print("✅ SET successful")
        
        retrieved_value = await redis_client.get(test_key)
        print(f"✅ GET successful: {retrieved_value}")
        
        # Test delete
        await redis_client.delete(test_key)
        print("✅ DELETE successful")
        
        # Test pattern matching
        await redis_client.set("test:1", "value1")
        await redis_client.set("test:2", "value2")
        keys = await redis_client.keys("test:*")
        print(f"✅ KEYS pattern match: found {len(keys)} keys")
        
        # Clean up test keys
        if keys:
            await redis_client.delete(*keys)
            print("✅ Cleanup successful")
        
        await redis_client.aclose()
        
        print("\n🎉 Redis is working perfectly!")
        print("Your meal planner can use Redis caching.")
        
        return True
        
    except ImportError:
        print("❌ Redis libraries not installed")
        print("Install with: pip install redis")
        return False
        
    except Exception as e:
        print(f"❌ Redis connection failed: {str(e)}")
        print("\n💡 Troubleshooting:")
        print("1. Make sure Redis is installed:")
        print("   macOS: brew install redis")
        print("   Ubuntu/Debian: sudo apt install redis-server")
        print("   Windows: Download from https://redis.io/download")
        print("\n2. Start Redis server:")
        print("   redis-server")
        print("\n3. Or set REDIS_URL environment variable:")
        print("   export REDIS_URL='redis://your-redis-host:6379'")
        return False


if __name__ == "__main__":
    asyncio.run(test_redis_connection()) 