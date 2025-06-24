import os
import json
import hashlib
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import redis.asyncio as redis

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from langchain.schema import BaseOutputParser

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Pydantic models for structured output
class Meal(BaseModel):
    """Individual meal with title, description, and ingredients"""
    title: str = Field(description="Name of the meal")
    description: str = Field(description="Brief description of the meal and its nutritional benefits")
    ingredients: List[str] = Field(description="List of ingredients needed for this meal")
    cooking_time: str = Field(description="Estimated cooking time (e.g., '30 minutes')")
    calories: Optional[int] = Field(description="Estimated calories per serving")
    dietary_tags: List[str] = Field(description="Dietary tags like 'vegetarian', 'gluten-free', etc.")


class DayMeals(BaseModel):
    """Meals for a single day"""
    day: str = Field(description="Day of the week")
    date: str = Field(description="Date in YYYY-MM-DD format")
    breakfast: Optional[Meal] = Field(description="Breakfast meal (if applicable)")
    lunch: Optional[Meal] = Field(description="Lunch meal (if applicable)")
    dinner: Optional[Meal] = Field(description="Dinner meal (if applicable)")
    snacks: Optional[List[Meal]] = Field(description="Snack meals (if applicable)")


class ShoppingItem(BaseModel):
    """Individual shopping list item"""
    item: str = Field(description="Name of the ingredient")
    quantity: str = Field(description="Quantity needed (e.g., '2 lbs', '1 cup', '3 pieces')")
    category: str = Field(default="Other", description="Food category (e.g., 'Produce', 'Dairy', 'Meat', 'Pantry')")
    estimated_cost: Optional[str] = Field(default=None, description="Estimated cost range (e.g., '$5-7')")


class MealPlanResponse(BaseModel):
    """Complete meal plan response with 7 days and shopping list"""
    meal_plan: List[DayMeals] = Field(description="7-day meal plan")
    shopping_list: List[ShoppingItem] = Field(description="Consolidated shopping list with quantities")
    total_estimated_cost: Optional[str] = Field(default="$50-80", description="Total estimated cost for the week")
    nutritional_summary: Dict[str, str] = Field(default_factory=dict, description="Weekly nutritional highlights")
    preparation_tips: List[str] = Field(default_factory=list, description="Meal prep and cooking tips for the week")


# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_TTL = 86400  # 1 day in seconds

# Global Redis connection
redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> Optional[redis.Redis]:
    """Get or create Redis client connection"""
    global redis_client
    if redis_client is None:
        try:
            redis_client = redis.from_url(
                REDIS_URL, 
                encoding="utf-8", 
                decode_responses=True
            )
            # Test connection
            await redis_client.ping()
            logger.info(f"✅ Connected to Redis at {REDIS_URL}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {str(e)}")
            logger.warning("🔄 Falling back to no caching")
            redis_client = None
    return redis_client


def generate_cache_key(user_profile: Dict[str, Any]) -> str:
    """Generate a unique cache key based on user profile data"""
    # Create a normalized string representation of the profile
    profile_str = json.dumps(user_profile, sort_keys=True, default=str)
    cache_key = f"meal_plan:{hashlib.md5(profile_str.encode()).hexdigest()}"
    logger.debug(f"🔑 Generated cache key: {cache_key}")
    return cache_key


async def get_cached_meal_plan(cache_key: str) -> Optional[Dict[str, Any]]:
    """Retrieve cached meal plan from Redis"""
    try:
        redis = await get_redis_client()
        if redis is None:
            return None
            
        cached_data = await redis.get(cache_key)
        if cached_data:
            logger.info(f"🎯 Cache HIT for key: {cache_key[:20]}...")
            data = json.loads(cached_data)
            return data.get('meal_plan')
        else:
            logger.info(f"❌ Cache MISS for key: {cache_key[:20]}...")
            return None
    except Exception as e:
        logger.error(f"❌ Redis cache retrieval error: {str(e)}")
        return None


async def set_cached_meal_plan(cache_key: str, meal_plan_data: Dict[str, Any]) -> bool:
    """Store meal plan in Redis cache"""
    try:
        redis = await get_redis_client()
        if redis is None:
            return False
            
        # Add metadata
        cache_data = {
            "meal_plan": meal_plan_data,
            "timestamp": datetime.utcnow().isoformat(),
            "cache_key": cache_key
        }
        
        await redis.setex(
            cache_key, 
            CACHE_TTL, 
            json.dumps(cache_data, default=str)
        )
        logger.info(f"💾 Cached meal plan for key: {cache_key[:20]}... (TTL: {CACHE_TTL}s)")
        return True
    except Exception as e:
        logger.error(f"❌ Redis cache storage error: {str(e)}")
        return False


def create_nutrition_prompt() -> PromptTemplate:
    """Create the structured prompt template for meal planning"""
    
    system_prompt = """
    You are a professional nutritionist and certified meal planning expert with over 15 years of experience. 
    Your expertise includes:
    - Clinical nutrition and dietary therapy
    - Sports nutrition and performance optimization
    - Medical nutrition therapy for chronic conditions
    - Sustainable and ethical food choices
    - International cuisine and cultural dietary preferences
    
    Your goal is to create personalized, nutritionally balanced, and delicious meal plans that:
    - Meet the user's specific health goals and dietary requirements
    - Accommodate their medical conditions and restrictions
    - Fit their lifestyle, cooking skills, and time constraints
    - Provide variety and enjoyment while being practical
    - Consider their budget and food preferences
    
    Always prioritize:
    1. Nutritional adequacy and balance
    2. Food safety and proper preparation
    3. Realistic portion sizes and meal timing
    4. Sustainable and enjoyable eating patterns
    5. Cultural sensitivity and personal preferences
    """
    
    template = f"""
    {system_prompt}
    
    ## USER PROFILE:
    
    **Basic Information:**
    - Username: {{username}}
    - Height: {{height_ft}} feet
    - Weight: {{weight_lbs}} lbs
    - Activity Level: {{activity_level}}
    
    **Medical Conditions & Considerations:**
    {{medical_conditions}}
    
    **Health Goals:**
    {{health_goals}}
    
    **Dietary Preferences:**
    {{dietary_preferences}}
    
    **Allergies & Intolerances:**
    {{allergies}}
    
    **Meal Habits:**
    - Meals per day: {{meals_per_day}}
    - Includes snacks: {{snacks}}
    - Cooks often: {{cooks_often}}
    - Foods disliked: {{foods_disliked}}
    
    **Location:** {{location}}
    
    ## INSTRUCTIONS:
    
    Create a comprehensive 7-day meal plan that:
    
    1. **Respects all dietary restrictions and medical conditions**
    2. **Includes {{meals_per_day}} main meals per day** (breakfast, lunch, dinner as appropriate)
    3. **Adds healthy snacks if user wants them** ({{snacks}})
    4. **Matches the user's cooking skill level** (cooks often: {{cooks_often}})
    5. **Avoids all disliked foods**: {{foods_disliked}}
    6. **Supports their health goals**: {{health_goals}}
    7. **Accommodates their activity level**: {{activity_level}}
    
    ## SPECIAL CONSIDERATIONS:
    
    - If user has diabetes, focus on low glycemic index foods and balanced carbohydrates
    - If user has PCOS, emphasize anti-inflammatory foods and stable blood sugar
    - If user has high blood pressure, minimize sodium and emphasize potassium-rich foods
    - If user has IBD/IBS, choose easily digestible, low-FODMAP options when appropriate
    - Account for any food allergies and intolerances strictly
    - Consider seasonal availability for location: {{location}}
    
    ## OUTPUT REQUIREMENTS:
    
    Provide exactly 7 days of meals starting from Monday. For each day:
    - Use day names: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    - Use dates in YYYY-MM-DD format starting from 2024-01-01 (Monday)
    - Include meals based on their preference ({{meals_per_day}} meals/day)
    - Each meal should have: title, description, ingredients list, cooking time, estimated calories, dietary tags
    - If they want snacks ({{snacks}}), include 1-2 healthy snack options per day
    - Use null for any meals not requested (e.g., if no snacks wanted, set snacks to null)
    
    Create a consolidated shopping list that:
    - Groups ingredients by category (Produce, Dairy, Meat, Pantry, etc.)
    - Includes realistic quantities for one person for the week
    - Estimates cost ranges where possible
    - Minimizes food waste by using ingredients across multiple meals
    
    Include:
    - Total estimated weekly cost
    - Nutritional summary highlighting key nutrients
    - 3-5 meal prep tips for the week
    
    ## CRITICAL OUTPUT REQUIREMENT:
    
    You MUST respond with valid JSON only. Do not include any text outside the JSON object.
    Your response must be ONLY a JSON object that conforms to the provided schema.
    Do not include explanations, comments, or markdown formatting.
    Start your response directly with the opening brace.
    
    {{format_instructions}}
    """
    
    return PromptTemplate(
        template=template,
        input_variables=[
            "username", "height_ft", "weight_lbs", "activity_level",
            "medical_conditions", "health_goals", "dietary_preferences", 
            "allergies", "meals_per_day", "snacks", "cooks_often", 
            "foods_disliked", "location", "format_instructions"
        ]
    )


def format_user_profile(profile_data: Dict[str, Any]) -> Dict[str, str]:
    """Format user profile data into readable strings for the prompt"""
    
    def safe_get(data: Dict, key: str, default: str = "Not specified") -> str:
        value = data.get(key)
        if value is None or value == "":
            return default
        if isinstance(value, list):
            return ", ".join(str(v) for v in value) if value else default
        return str(value)
    
    # Extract basic information
    basic_info = profile_data.get('basicInformation', {})
    medical = profile_data.get('medicalConditions', {})
    health_goal = profile_data.get('healthGoal', {})
    dietary = profile_data.get('dietaryPreferences', {})
    allergies = profile_data.get('allergiesIntolerances', {})
    habits = profile_data.get('mealHabits', {})
    location = profile_data.get('location', {})
    
    # Format medical conditions with details
    conditions = medical.get('conditions', [])
    medical_details = []
    
    if 'Diabetes' in conditions:
        insulin_status = "takes insulin" if medical.get('diabetesInsulin') else "manages without insulin"
        medical_details.append(f"Diabetes ({insulin_status})")
    
    if 'PCOS' in conditions:
        hormonal_status = "on hormonal treatment" if medical.get('pcosHormonal') else "not on hormonal treatment"
        medical_details.append(f"PCOS ({hormonal_status})")
    
    if 'High Blood Pressure' in conditions:
        salt_monitoring = "monitors salt intake" if medical.get('hbpSaltIntake') else "standard salt intake"
        medical_details.append(f"High Blood Pressure ({salt_monitoring})")
    
    if 'IBD' in conditions:
        ibd_type = medical.get('ibdType', 'unspecified')
        if ibd_type == 'Ulcerative Colitis':
            uc_condition = medical.get('ucCondition', 'stable')
            medical_details.append(f"Ulcerative Colitis ({uc_condition} condition)")
        else:
            medical_details.append(f"IBD ({ibd_type})")
    
    # Add any other conditions
    other_conditions = [c for c in conditions if c not in ['Diabetes', 'PCOS', 'High Blood Pressure', 'IBD']]
    medical_details.extend(other_conditions)
    
    if medical.get('otherCondition'):
        medical_details.append(medical.get('otherCondition'))
    
    return {
        "username": safe_get(basic_info, 'username', 'User'),
        "height_ft": safe_get(basic_info, 'height', '5.5'),
        "weight_lbs": safe_get(basic_info, 'weight', '150'),
        "activity_level": safe_get(basic_info, 'activityLevel', 'Moderate'),
        "medical_conditions": "; ".join(medical_details) if medical_details else "None reported",
        "health_goals": safe_get(health_goal, 'goal', 'General health maintenance'),
        "dietary_preferences": safe_get(dietary, 'preferences', 'No specific preferences'),
        "allergies": safe_get(allergies, 'allergies', 'No known allergies'),
        "meals_per_day": str(safe_get(habits, 'mealsPerDay', '3')),
        "snacks": "Yes" if habits.get('snacks') else "No",
        "cooks_often": "Yes" if habits.get('cooksOften') else "No",
        "foods_disliked": safe_get(habits, 'foodsDisliked', 'None specified'),
        "location": safe_get(location, 'zipCodeOrCity', 'United States'),
    }


async def generate_meal_plan(user_profile: Dict[str, Any], force_refresh: bool = False) -> MealPlanResponse:
    """
    Generate a 7-day meal plan using LangChain and OpenAI API
    
    Args:
        user_profile: Complete user profile data from onboarding forms
        force_refresh: If True, bypass cache and generate fresh meal plan
        
    Returns:
        MealPlanResponse: Structured meal plan with shopping list
    """
    
    # Check Redis cache first (unless force refresh)
    cache_key = generate_cache_key(user_profile)
    
    if not force_refresh:
        cached_meal_plan = await get_cached_meal_plan(cache_key)
        if cached_meal_plan:
            logger.info(f"🎯 Returning cached meal plan for user: {user_profile.get('basicInformation', {}).get('username', 'Unknown')}")
            return MealPlanResponse(**cached_meal_plan)
    
    # Initialize OpenAI LLM
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    
    llm = ChatOpenAI(
        model="gpt-4o",  # Use GPT-4o for better JSON following
        temperature=0.7,  # Some creativity for variety
        openai_api_key=openai_api_key,
        max_tokens=4000
    )
    
    # Set up the output parser
    parser = PydanticOutputParser(pydantic_object=MealPlanResponse)
    format_instructions = parser.get_format_instructions()
    
    # Create the prompt template
    prompt_template = create_nutrition_prompt()
    
    # Format user profile data
    formatted_profile = format_user_profile(user_profile)
    formatted_profile["format_instructions"] = format_instructions
    
    # Create the LLM chain
    chain = LLMChain(
        llm=llm,
        prompt=prompt_template,
        verbose=True  # For debugging
    )
    
    try:
        logger.info(f"🤖 Generating NEW meal plan for user: {formatted_profile['username']}")
        logger.info(f"📝 Profile summary: {formatted_profile['health_goals']}, {formatted_profile['dietary_preferences']}")
        
        # Generate the meal plan
        result = await chain.arun(**formatted_profile)
        
        # Parse the result with fallback handling
        try:
            meal_plan_response = parser.parse(result)
        except Exception as parse_error:
            print(f"⚠️ Parsing error, trying to fix JSON: {str(parse_error)}")
            # Try to fix common JSON issues
            import json
            try:
                # Extract JSON from the result if it's embedded in text
                json_start = result.find('{')
                json_end = result.rfind('}') + 1
                if json_start != -1 and json_end != 0:
                    json_str = result[json_start:json_end]
                    raw_data = json.loads(json_str)
                    
                    # Fix any missing fields with defaults
                    if 'total_estimated_cost' not in raw_data:
                        raw_data['total_estimated_cost'] = "$50-80"
                    if 'nutritional_summary' not in raw_data:
                        raw_data['nutritional_summary'] = {"protein": "Adequate", "fiber": "Good", "vitamins": "Varied"}
                    if 'preparation_tips' not in raw_data:
                        raw_data['preparation_tips'] = ["Plan meals in advance", "Prep ingredients on weekends", "Cook in batches when possible"]
                    
                    # Fix shopping list items missing fields
                    if 'shopping_list' in raw_data:
                        for item in raw_data['shopping_list']:
                            if 'category' not in item:
                                item['category'] = "Other"
                            if 'estimated_cost' not in item:
                                item['estimated_cost'] = None
                            if 'quantity' not in item:
                                item['quantity'] = "1 item"
                    
                    meal_plan_response = MealPlanResponse(**raw_data)
                else:
                    raise parse_error
            except Exception:
                raise parse_error
        
        # Cache the result in Redis
        meal_plan_dict = meal_plan_response.dict()
        await set_cached_meal_plan(cache_key, meal_plan_dict)
        
        logger.info(f"✅ Meal plan generated successfully for {formatted_profile['username']}")
        logger.info(f"📋 {len(meal_plan_response.meal_plan)} days planned")
        logger.info(f"🛒 {len(meal_plan_response.shopping_list)} items in shopping list")
        
        return meal_plan_response
        
    except Exception as e:
        logger.error(f"❌ Error generating meal plan: {str(e)}")
        raise Exception(f"Failed to generate meal plan: {str(e)}")


async def clear_meal_plan_cache(user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
    """Clear meal plan cache (optionally for a specific user)"""
    try:
        redis = await get_redis_client()
        if redis is None:
            return {"status": "error", "message": "Redis not available"}
            
        if user_profile:
            # Clear specific user's cache
            cache_key = generate_cache_key(user_profile)
            deleted = await redis.delete(cache_key)
            logger.info(f"🗑️ Cleared cache for user: {cache_key[:20]}...")
            return {
                "status": "success", 
                "message": f"Cleared cache for specific user",
                "keys_deleted": deleted
            }
        else:
            # Clear all meal plan caches
            pattern = "meal_plan:*"
            keys = await redis.keys(pattern)
            if keys:
                deleted = await redis.delete(*keys)
                logger.info(f"🗑️ Cleared {deleted} meal plan cache entries")
                return {
                    "status": "success", 
                    "message": f"Cleared all meal plan caches",
                    "keys_deleted": deleted
                }
            else:
                return {
                    "status": "success", 
                    "message": "No cache entries to clear",
                    "keys_deleted": 0
                }
    except Exception as e:
        logger.error(f"❌ Error clearing cache: {str(e)}")
        return {"status": "error", "message": str(e)}


async def get_cache_stats() -> Dict[str, Any]:
    """Get statistics about the Redis meal plan cache"""
    try:
        redis = await get_redis_client()
        if redis is None:
            return {
                "status": "error",
                "message": "Redis not available",
                "total_entries": 0,
                "total_size_mb": 0.0
            }
            
        # Get all meal plan cache keys
        pattern = "meal_plan:*"
        keys = await redis.keys(pattern)
        total_entries = len(keys)
        
        if total_entries == 0:
            return {
                "status": "success",
                "total_entries": 0,
                "total_size_mb": 0.0,
                "oldest_entry": None,
                "newest_entry": None
            }
        
        # Calculate total size (approximate)
        total_size = 0
        timestamps = []
        
        for key in keys[:100]:  # Limit to 100 for performance
            try:
                data = await redis.get(key)
                if data:
                    total_size += len(data)
                    cache_info = json.loads(data)
                    if 'timestamp' in cache_info:
                        timestamps.append(cache_info['timestamp'])
            except Exception:
                continue
        
        total_size_mb = total_size / (1024 * 1024)
        
        return {
            "status": "success",
            "total_entries": total_entries,
            "total_size_mb": round(total_size_mb, 2),
            "oldest_entry": min(timestamps) if timestamps else None,
            "newest_entry": max(timestamps) if timestamps else None,
            "redis_connected": True
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting cache stats: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "total_entries": 0,
            "total_size_mb": 0.0
        }


# Example usage function for testing
async def test_meal_planner():
    """Test function to verify the meal planner works"""
    
    sample_profile = {
        "basicInformation": {
            "username": "testuser",
            "height": 5.8,
            "weight": 150,
            "activityLevel": "Moderate"
        },
        "medicalConditions": {
            "conditions": ["Diabetes"],
            "diabetesInsulin": True
        },
        "healthGoal": {
            "goal": "Lose weight"
        },
        "dietaryPreferences": {
            "preferences": ["Vegetarian"]
        },
        "allergiesIntolerances": {
            "allergies": ["Nuts"]
        },
        "mealHabits": {
            "mealsPerDay": 3,
            "snacks": True,
            "cooksOften": True,
            "foodsDisliked": "Spinach, Mushrooms"
        },
        "location": {
            "zipCodeOrCity": "New York, NY"
        }
    }
    
    try:
        meal_plan = await generate_meal_plan(sample_profile)
        print("\n🎉 Test meal plan generated successfully!")
        print(f"Days planned: {len(meal_plan.meal_plan)}")
        print(f"Shopping items: {len(meal_plan.shopping_list)}")
        return meal_plan
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return None


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_meal_planner()) 