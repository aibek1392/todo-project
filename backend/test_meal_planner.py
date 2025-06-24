#!/usr/bin/env python3
"""
Test script for the LangChain-powered meal planner

This script tests the meal planning functionality without needing
a full API setup. Set your OPENAI_API_KEY environment variable
before running.

Usage:
    export OPENAI_API_KEY="your-api-key-here"
    python test_meal_planner.py
"""

import os
import json
import asyncio
from dotenv import load_dotenv
from meal_planner import generate_meal_plan, get_cache_stats, clear_meal_plan_cache, get_redis_client

# Load environment variables from .env file
load_dotenv()


def test_profiles():
    """Return a variety of test user profiles for testing"""
    
    profiles = {
        "diabetic_vegetarian": {
            "basicInformation": {
                "username": "sarah_health",
                "height": 5.6,
                "weight": 145,
                "activityLevel": "Moderate"
            },
            "medicalConditions": {
                "conditions": ["Diabetes"],
                "diabetesInsulin": True
            },
            "healthGoal": {
                "goal": "Maintain stable blood sugar"
            },
            "dietaryPreferences": {
                "preferences": ["Vegetarian", "Low Carb"]
            },
            "allergiesIntolerances": {
                "allergies": ["Nuts", "Shellfish"]
            },
            "mealHabits": {
                "mealsPerDay": 4,
                "snacks": True,
                "cooksOften": True,
                "foodsDisliked": "Mushrooms, Olives"
            },
            "location": {
                "zipCodeOrCity": "San Francisco, CA"
            }
        },
        
        "athlete_keto": {
            "basicInformation": {
                "username": "mike_fit",
                "height": 6.1,
                "weight": 185,
                "activityLevel": "Hard"
            },
            "medicalConditions": {
                "conditions": []
            },
            "healthGoal": {
                "goal": "Build muscle"
            },
            "dietaryPreferences": {
                "preferences": ["Keto", "High Protein"]
            },
            "allergiesIntolerances": {
                "allergies": ["Dairy"]
            },
            "mealHabits": {
                "mealsPerDay": 5,
                "snacks": True,
                "cooksOften": True,
                "foodsDisliked": ""
            },
            "location": {
                "zipCodeOrCity": "Austin, TX"
            }
        },
        
        "pcos_mediterranean": {
            "basicInformation": {
                "username": "emma_wellness",
                "height": 5.4,
                "weight": 140,
                "activityLevel": "Light exercise"
            },
            "medicalConditions": {
                "conditions": ["PCOS"],
                "pcosHormonal": True
            },
            "healthGoal": {
                "goal": "Lose weight"
            },
            "dietaryPreferences": {
                "preferences": ["Mediterranean", "Anti-inflammatory"]
            },
            "allergiesIntolerances": {
                "allergies": ["Gluten"]
            },
            "mealHabits": {
                "mealsPerDay": 3,
                "snacks": False,
                "cooksOften": False,
                "foodsDisliked": "Spicy food"
            },
            "location": {
                "zipCodeOrCity": "Miami, FL"
            }
        },
        
        "ibd_simple": {
            "basicInformation": {
                "username": "alex_digest",
                "height": 5.9,
                "weight": 160,
                "activityLevel": "Moderate"
            },
            "medicalConditions": {
                "conditions": ["IBD"],
                "ibdType": "Crohn's Disease"
            },
            "healthGoal": {
                "goal": "Improve digestion"
            },
            "dietaryPreferences": {
                "preferences": ["Low FODMAP", "Easy to digest"]
            },
            "allergiesIntolerances": {
                "allergies": ["Lactose"]
            },
            "mealHabits": {
                "mealsPerDay": 5,
                "snacks": True,
                "cooksOften": False,
                "foodsDisliked": "Raw vegetables, beans"
            },
            "location": {
                "zipCodeOrCity": "Portland, OR"
            }
        }
    }
    
    return profiles


async def test_single_profile(profile_name: str, profile_data: dict):
    """Test meal plan generation for a single profile"""
    
    print(f"\n{'='*60}")
    print(f"🧪 TESTING PROFILE: {profile_name.upper()}")
    print(f"{'='*60}")
    
    print(f"👤 User: {profile_data['basicInformation']['username']}")
    print(f"🎯 Goal: {profile_data['healthGoal']['goal']}")
    print(f"🥗 Diet: {', '.join(profile_data['dietaryPreferences']['preferences'])}")
    print(f"⚠️  Allergies: {', '.join(profile_data['allergiesIntolerances']['allergies'])}")
    print(f"🏥 Conditions: {', '.join(profile_data['medicalConditions']['conditions'])}")
    
    try:
        # Generate meal plan
        meal_plan = await generate_meal_plan(profile_data)
        
        print(f"\n✅ SUCCESS! Generated meal plan for {profile_name}")
        print(f"📅 Days planned: {len(meal_plan.meal_plan)}")
        print(f"🛒 Shopping items: {len(meal_plan.shopping_list)}")
        print(f"💰 Estimated cost: {meal_plan.total_estimated_cost}")
        
        # Show first day as sample
        if meal_plan.meal_plan:
            first_day = meal_plan.meal_plan[0]
            print(f"\n📋 SAMPLE DAY ({first_day.day}):")
            
            if first_day.breakfast:
                print(f"🌅 Breakfast: {first_day.breakfast.title}")
                print(f"   {first_day.breakfast.description}")
            
            if first_day.lunch:
                print(f"🌞 Lunch: {first_day.lunch.title}")
                print(f"   {first_day.lunch.description}")
            
            if first_day.dinner:
                print(f"🌙 Dinner: {first_day.dinner.title}")
                print(f"   {first_day.dinner.description}")
        
        # Show some shopping items
        print(f"\n🛒 SAMPLE SHOPPING ITEMS:")
        for item in meal_plan.shopping_list[:5]:
            print(f"   • {item.quantity} {item.item} ({item.category})")
        
        if len(meal_plan.shopping_list) > 5:
            print(f"   ... and {len(meal_plan.shopping_list) - 5} more items")
        
        # Show preparation tips
        if meal_plan.preparation_tips:
            print(f"\n💡 PREPARATION TIPS:")
            for tip in meal_plan.preparation_tips[:3]:
                print(f"   • {tip}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED to generate meal plan for {profile_name}")
        print(f"Error: {str(e)}")
        return False


async def test_redis_caching():
    """Test the Redis caching functionality"""
    
    print(f"\n{'='*60}")
    print(f"⚡ TESTING REDIS CACHING FUNCTIONALITY")
    print(f"{'='*60}")
    
    # Test Redis connection first
    print("🔗 Testing Redis connection...")
    redis_client = await get_redis_client()
    if redis_client is None:
        print("⚠️  Redis not available - caching tests will be skipped")
        print("   To test Redis caching:")
        print("   1. Install Redis: brew install redis (macOS) or apt install redis (Ubuntu)")
        print("   2. Start Redis: redis-server")
        print("   3. Or set REDIS_URL environment variable to your Redis instance")
        return
    else:
        print("✅ Redis connection successful!")
    
    # Use first profile for caching test
    profiles = test_profiles()
    test_profile = profiles["diabetic_vegetarian"]
    
    # Clear any existing cache for this profile
    await clear_meal_plan_cache(test_profile)
    
    print("\n🔄 Generating meal plan (first time - should hit OpenAI API)")
    start_time = asyncio.get_event_loop().time()
    meal_plan1 = await generate_meal_plan(test_profile)
    time1 = asyncio.get_event_loop().time() - start_time
    
    print(f"⏱️  First generation took: {time1:.2f} seconds")
    
    print("\n🔄 Generating same meal plan (second time - should use Redis cache)")
    start_time = asyncio.get_event_loop().time()
    meal_plan2 = await generate_meal_plan(test_profile)
    time2 = asyncio.get_event_loop().time() - start_time
    
    print(f"⏱️  Second generation took: {time2:.2f} seconds")
    
    # Verify they're the same
    same_plan = (meal_plan1.dict() == meal_plan2.dict())
    print(f"📊 Plans are identical: {same_plan}")
    
    if time2 < time1:
        print(f"🚀 Speedup from Redis caching: {time1/time2:.1f}x faster")
    else:
        print("⚠️  Second request wasn't faster - cache may not be working")
    
    # Test cache stats
    print("\n📈 Testing Redis cache stats...")
    stats = await get_cache_stats()
    print(f"📊 REDIS CACHE STATS:")
    print(f"   • Status: {stats.get('status', 'unknown')}")
    print(f"   • Total entries: {stats.get('total_entries', 0)}")
    print(f"   • Total size: {stats.get('total_size_mb', 0)} MB")
    print(f"   • Redis connected: {stats.get('redis_connected', False)}")
    
    if stats.get('oldest_entry'):
        print(f"   • Oldest entry: {stats.get('oldest_entry')}")
    if stats.get('newest_entry'):
        print(f"   • Newest entry: {stats.get('newest_entry')}")
    
    # Test cache clearing
    print("\n🗑️ Testing cache clearing...")
    clear_result = await clear_meal_plan_cache(test_profile)
    print(f"   Clear result: {clear_result}")
    
    stats_after = await get_cache_stats()
    print(f"   Entries after clearing: {stats_after.get('total_entries', 0)}")
    
    # Test force refresh
    print("\n🔄 Testing force refresh (should bypass cache)...")
    start_time = asyncio.get_event_loop().time()
    meal_plan3 = await generate_meal_plan(test_profile, force_refresh=True)
    time3 = asyncio.get_event_loop().time() - start_time
    print(f"⏱️  Force refresh took: {time3:.2f} seconds")
    
    # Clean up - clear cache for this profile
    await clear_meal_plan_cache(test_profile)


async def main():
    """Main test function"""
    
    print("🍽️  LANGCHAIN MEAL PLANNER TEST SUITE")
    print("=" * 60)
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
        print("Please set your OpenAI API key:")
        print("export OPENAI_API_KEY='your-api-key-here'")
        return
    
    print("✅ OpenAI API key found")
    
    # Get test profiles
    profiles = test_profiles()
    
    print(f"\n📋 Testing {len(profiles)} different user profiles...")
    
    successful_tests = 0
    total_tests = len(profiles)
    
    # Test each profile
    for profile_name, profile_data in profiles.items():
        success = await test_single_profile(profile_name, profile_data)
        if success:
            successful_tests += 1
        
        # Wait a bit between tests to avoid rate limiting
        await asyncio.sleep(2)
    
    # Test Redis caching
    await test_redis_caching()
    
    # Final results
    print(f"\n{'='*60}")
    print(f"🎯 TEST RESULTS")
    print(f"{'='*60}")
    print(f"✅ Successful tests: {successful_tests}/{total_tests}")
    print(f"❌ Failed tests: {total_tests - successful_tests}/{total_tests}")
    
    if successful_tests == total_tests:
        print("🎉 ALL TESTS PASSED! Meal planner is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the error messages above.")
    
    print("\n🚀 Meal planner testing complete!")


if __name__ == "__main__":
    asyncio.run(main()) 