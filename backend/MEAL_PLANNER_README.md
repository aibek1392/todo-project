# LangChain Meal Planner System

A comprehensive AI-powered meal planning system built with LangChain and OpenAI API that generates personalized 7-day meal plans based on user profiles, dietary restrictions, health goals, and preferences.

## 🌟 Features

### Core Functionality
- **7-Day Personalized Meal Plans**: Generates complete weekly meal plans with breakfast, lunch, dinner, and optional snacks
- **Professional Nutritionist AI**: Uses GPT-4 with expert nutritionist prompting for high-quality meal recommendations
- **Structured JSON Output**: Uses Pydantic models and output parsers for reliable, structured responses
- **Smart Caching**: Prevents redundant API calls by caching meal plans for 24 hours based on user profile
- **Medical Condition Support**: Handles diabetes, PCOS, IBD, high blood pressure, and other conditions
- **Comprehensive Shopping Lists**: Automatically generates organized shopping lists with quantities and cost estimates

### Advanced Features
- **Dietary Restriction Compliance**: Supports vegetarian, vegan, keto, Mediterranean, gluten-free, and more
- **Allergy Management**: Strictly avoids allergens and intolerances
- **Activity Level Optimization**: Adjusts portions and macros based on exercise habits
- **Location-Aware**: Considers seasonal availability and regional preferences
- **Cooking Skill Adaptation**: Adapts recipes based on user's cooking experience
- **Meal Prep Tips**: Includes weekly preparation strategies and time-saving tips

## 🏗️ Architecture

### Components

1. **Pydantic Models** (`meal_planner.py`)
   - `Meal`: Individual meal with title, description, ingredients, cooking time, calories, dietary tags
   - `DayMeals`: Complete day with breakfast, lunch, dinner, and optional snacks
   - `ShoppingItem`: Shopping list items with quantities, categories, and cost estimates
   - `MealPlanResponse`: Complete response with 7-day plan, shopping list, and tips

2. **LangChain Integration**
   - `ChatOpenAI`: GPT-4 Turbo for high-quality meal planning
   - `PromptTemplate`: Structured prompts with professional nutritionist expertise
   - `LLMChain`: Async chain execution for meal plan generation
   - `PydanticOutputParser`: Ensures reliable JSON structure

3. **Redis Caching System**
   - High-performance Redis caching with async operations
   - MD5 hashing of user profiles for consistent cache keys
   - 24-hour TTL (86400 seconds) automatic expiration
   - Cache hit/miss logging for performance monitoring
   - Fallback handling when Redis is unavailable
   - Cache statistics and management endpoints

4. **FastAPI Integration**
   - RESTful API endpoints for meal plan generation
   - Authentication-protected routes
   - Database integration with user profiles

## 📋 API Endpoints

### 1. Generate Meal Plan
```http
POST /api/generate-meal-plan?force_refresh=false
Authorization: Bearer <jwt_token>
```

**Description**: Generate a personalized 7-day meal plan based on user's profile

**Parameters**:
- `force_refresh` (optional): Boolean to bypass cache and generate fresh plan

**Response**: Complete `MealPlanResponse` with:
- 7-day meal plan with all meals
- Consolidated shopping list
- Total estimated cost
- Nutritional summary
- Preparation tips

### 2. Get Profile Summary
```http
GET /api/user-profile-for-meal-planning
Authorization: Bearer <jwt_token>
```

**Description**: Get user profile summary formatted for meal planning

**Response**: User profile data formatted for meal planning preview

### 3. Redis Cache Management
```http
GET /api/meal-plan-cache/stats
Authorization: Bearer <jwt_token>
```

**Description**: Get Redis cache statistics including total entries, size, and connection status

**Response**:
```json
{
  "cache_stats": {
    "status": "success",
    "total_entries": 15,
    "total_size_mb": 2.4,
    "redis_connected": true,
    "oldest_entry": "2024-01-15T10:30:00Z",
    "newest_entry": "2024-01-15T14:45:00Z"
  },
  "message": "Cache statistics retrieved successfully"
}
```

```http
DELETE /api/meal-plan-cache
Authorization: Bearer <jwt_token>
```

**Description**: Clear Redis cache for current user's meal plans

```http
DELETE /api/meal-plan-cache/all
Authorization: Bearer <jwt_token>
```

**Description**: Clear all Redis cache entries (admin operation)

### 4. Test Endpoint (Development)
```http
POST /api/test-meal-plan
```

**Description**: Test meal planning with sample data (development only)

## 🚀 Setup and Configuration

### 1. Install Dependencies

```bash
# Core meal planner dependencies
pip install langchain langchain-openai openai tiktoken pydantic

# Redis caching dependencies
pip install redis aioredis

# Environment management
pip install python-dotenv
```

Or use the provided requirements.txt:
```bash
pip install -r requirements.txt
```

### 2. Redis Setup

Install and start Redis:

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows:**
Download from https://redis.io/download or use Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Test Redis connection:**
```bash
python test_redis_connection.py
```

### 3. Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Create .env file
cd backend
touch .env

# Add your OpenAI API key and Redis URL to .env
echo "OPENAI_API_KEY=your-actual-openai-api-key-here" >> .env
echo "REDIS_URL=redis://localhost:6379" >> .env
```

Your `.env` file should contain:
```bash
# backend/.env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
REDIS_URL=redis://localhost:6379  # Optional: defaults to localhost:6379
```

**Important**: 
- Replace `your-actual-openai-api-key-here` with your real OpenAI API key
- The `.env` file is gitignored to keep your API key secure
- Get your API key from: https://platform.openai.com/api-keys
- Redis URL is optional and defaults to `redis://localhost:6379`

Alternatively, you can export the environment variables:
```bash
export OPENAI_API_KEY="your-openai-api-key-here"
export REDIS_URL="redis://localhost:6379"
```

### 3. Database Schema

The meal planner integrates with your existing user profiles table. Expected profile structure:

```json
{
  "name": "User Name",
  "height_ft": 5.8,
  "weight_lbs": 150,
  "activity_level": "Moderate",
  "health_goals": ["Lose weight"],
  "preferences": {
    "diet": ["Vegetarian"],
    "allergies": ["Nuts"],
    "conditions": {
      "conditions": ["Diabetes"],
      "diabetesInsulin": true
    },
    "meals_per_day": 3,
    "snacks": true,
    "cooks_often": true,
    "dislikes": ["Mushrooms"]
  },
  "location": "New York, NY"
}
```

## 🧪 Testing

### Quick Test
```bash
cd backend
# Make sure your .env file has OPENAI_API_KEY set
python test_meal_planner.py
```

### Test Profiles Included
- **Diabetic Vegetarian**: Complex medical condition + dietary restrictions
- **Athlete Keto**: High activity + specific macros
- **PCOS Mediterranean**: Hormonal condition + anti-inflammatory diet
- **IBD Simple**: Digestive condition + easy-to-digest foods

### Test Features
- Profile-specific meal plan generation
- Redis caching functionality and performance
- Cache hit/miss ratio analysis
- Error handling and fallback mechanisms
- Output structure validation
- Redis connection testing

## 💡 Usage Examples

### Basic Usage
```python
from meal_planner import generate_meal_plan

user_profile = {
    "basicInformation": {
        "username": "john_doe",
        "height": 5.9,
        "weight": 175,
        "activityLevel": "Moderate"
    },
    "healthGoal": {"goal": "Lose weight"},
    "dietaryPreferences": {"preferences": ["Mediterranean"]},
    "allergiesIntolerances": {"allergies": []},
    "mealHabits": {
        "mealsPerDay": 3,
        "snacks": false,
        "cooksOften": true
    }
}

meal_plan = await generate_meal_plan(user_profile)
print(f"Generated {len(meal_plan.meal_plan)} days")
print(f"Shopping list: {len(meal_plan.shopping_list)} items")
```

### With Redis Caching
```python
# First call - hits OpenAI API, stores in Redis
meal_plan1 = await generate_meal_plan(user_profile)

# Second call - uses Redis cache (much faster)
meal_plan2 = await generate_meal_plan(user_profile)

# Force fresh generation - bypasses cache
meal_plan3 = await generate_meal_plan(user_profile, force_refresh=True)
```

### Redis Cache Management
```python
from meal_planner import get_cache_stats, clear_meal_plan_cache

# Get Redis cache statistics
stats = await get_cache_stats()
print(f"Cache entries: {stats['total_entries']}")
print(f"Redis connected: {stats['redis_connected']}")
print(f"Cache size: {stats['total_size_mb']} MB")

# Clear specific user's cache
result = await clear_meal_plan_cache(user_profile)
print(f"Cleared {result['keys_deleted']} entries")

# Clear all cache entries
result = await clear_meal_plan_cache()
print(f"Cleared {result['keys_deleted']} total entries")
```

## 🔧 Configuration Options

### Model Configuration
```python
llm = ChatOpenAI(
    model="gpt-4-turbo-preview",  # Best quality for meal planning
    temperature=0.7,              # Balance creativity and consistency
    max_tokens=4000              # Enough for detailed meal plans
)
```

### Cache Configuration
- **TTL**: 24 hours (configurable in `generate_meal_plan`)
- **Storage**: In-memory (can be extended to Redis/database)
- **Key Generation**: MD5 hash of normalized profile data

### Prompt Engineering
The system uses a sophisticated prompt template that:
- Establishes nutritionist expertise and credentials
- Provides detailed user context and requirements
- Includes specific medical condition guidelines
- Ensures structured output format compliance

## 🛡️ Error Handling

### Common Errors
1. **Missing OpenAI API Key**: Set `OPENAI_API_KEY` environment variable
2. **Invalid Profile Data**: Ensure all required fields are present
3. **API Rate Limits**: Caching reduces API calls; implement retry logic
4. **Parsing Errors**: Pydantic models validate and handle malformed responses

### Debugging
- Set `verbose=True` in LLMChain for detailed logging
- Use test script to verify individual components
- Check cache statistics for performance monitoring

## 📈 Performance Optimization

### Caching Benefits
- **Speed**: 10-100x faster for repeated requests
- **Cost**: Reduces OpenAI API usage and costs
- **Reliability**: Offline capability for cached profiles

### Scaling Considerations
- Move cache to Redis for multi-instance deployments
- Implement background refresh for popular profiles
- Add request queuing for high-volume usage
- Consider fine-tuned models for specific domains

## 🔮 Future Enhancements

### Planned Features
- **Recipe Details**: Step-by-step cooking instructions
- **Macro Tracking**: Detailed nutritional breakdowns
- **Grocery Integration**: Direct ordering from meal plans
- **Meal Ratings**: User feedback for plan improvement
- **Social Features**: Share and discover meal plans

### Technical Improvements
- **LangGraph Integration**: Complex meal planning workflows
- **Vector Embeddings**: Similarity-based meal recommendations
- **Multi-Modal**: Image-based meal suggestions
- **Real-time Updates**: Dynamic plan adjustments

## 🤝 Contributing

1. Test thoroughly with various user profiles
2. Maintain structured output format compatibility
3. Follow nutritionist best practices in prompts
4. Add comprehensive test cases for new features
5. Update documentation for API changes

## 📄 License

This meal planner system is part of the fullstack health application and follows the same licensing terms.

---

**Note**: This system requires an OpenAI API key and generates meal plans using AI. Always consult with healthcare professionals for specific medical dietary requirements. 