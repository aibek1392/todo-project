# 🧪 Testing the User Profile Create API

This guide will help you test the new user profile creation API endpoint from your React frontend.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```
Make sure it's running on `http://localhost:8000`

### 2. Start the Frontend
```bash
cd frontend_react
npm start
```
Make sure it's running on `http://localhost:3000`

### 3. Set Up Supabase (Required)
Make sure you have a `.env` file in the `backend/` directory with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

### 4. Create the Database Tables
You need two tables in Supabase:

**Main users table (for authentication):**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**User profiles table (for onboarding data):**
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  gender TEXT,
  height_ft DECIMAL(4,2),
  weight_lbs INTEGER,
  activity_level TEXT,
  health_goals TEXT[],
  custom_health_goal TEXT,
  location TEXT,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

## 🧪 Testing Methods

### Method 1: Using the Test Component (Recommended)

1. **Log in to your app** at `http://localhost:3000/login`
2. **Navigate to the test page**: `http://localhost:3000/test-profile`
3. **Click "Test Full Profile Create"** to create a complete profile
4. **Click "Test Partial Create"** to create a minimal profile (will fail if profile already exists)
5. **Click "Get Profile"** to retrieve the created profile
6. **Check the results** on the page and in the browser console
7. **Verify in Supabase** that the data was saved in the `user_profiles` table

### Method 2: Using the Onboarding Form

1. **Log in to your app**
2. **Navigate to onboarding**: `http://localhost:3000/onboarding`
3. **Fill out all the steps** with test data
4. **Click "Complete Setup"** on the final step
5. **Check the browser console** for API responses
6. **Verify in Supabase** that the data was saved

### Method 3: Using the Python Test Script

1. **Get a JWT token** by logging in through the frontend
2. **Copy the token** from localStorage or network tab
3. **Update the token** in `backend/example_usage.py`
4. **Run the script**:
   ```bash
   cd backend
   python example_usage.py
   ```

## 🔍 What to Look For

### ✅ Success Indicators
- **Frontend**: Complete user profile object returned
- **Console**: API response with user profile data including ID and timestamps
- **Supabase**: New row in the `user_profiles` table
- **Backend logs**: No error messages

### ❌ Common Issues

#### Authentication Errors
```
Error: 401 Unauthorized
```
**Solution**: Make sure you're logged in and have a valid JWT token

#### Database Connection Errors
```
Error: Database not configured
```
**Solution**: Check your `.env` file and Supabase credentials

#### Profile Already Exists Errors
```
Error: User profile already exists. Use update endpoint instead.
```
**Solution**: Each user can only have one profile. Delete the existing profile or use an update endpoint (not implemented yet)

#### Database Constraint Errors
```
Error: duplicate key value violates unique constraint
```
**Solution**: The user already has a profile. Check your `user_profiles` table

## 📊 Expected API Response

### Success Response
```json
{
  "id": 1,
  "user_id": 123,
  "name": "Test User",
  "age": 25,
  "gender": "male",
  "height_ft": 5.8,
  "weight_lbs": 160,
  "activity_level": "active",
  "health_goals": ["lose weight", "improve digestion"],
  "custom_health_goal": null,
  "location": "New York, NY",
  "preferences": {
    "diet": ["vegetarian", "low_fodmap"],
    "likes": ["avocado", "chicken"],
    "dislikes": ["broccoli"],
    "allergies": ["gluten", "dairy"],
    "conditions": ["ibs", "gerd"],
    "meals_per_day": 3,
    "snacks": true,
    "cooks_often": false
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Data Transformation
The frontend data gets transformed for the backend:

| Frontend Field | Backend Field | Transformation |
|----------------|---------------|----------------|
| `basicInformation.age` | `age` | Direct mapping |
| `basicInformation.gender` | `gender` | Lowercase |
| `basicInformation.height` | `height_ft` | Direct (already in feet) |
| `basicInformation.weight` | `weight_lbs` | Direct (already in pounds) |
| `basicInformation.activityLevel` | `activity_level` | Lowercase, spaces to underscores |
| `location.zipCodeOrCity` | `location` | Direct mapping |
| `healthGoal.goal` | `health_goals` | Array, lowercase |
| `dietaryPreferences.preferences` | `preferences.diet` | Array, lowercase |
| `allergiesIntolerances.allergies` | `preferences.allergies` | Array, lowercase |
| `medicalConditions.conditions` | `preferences.conditions` | Array, lowercase |
| `mealHabits.*` | `preferences.*` | Various mappings |

## 🛠️ Debugging Tips

### 1. Check Browser Network Tab
- Look for the POST request to `/api/update_user_profile`
- Check the request payload and response
- Verify the Authorization header is present

### 2. Check Browser Console
- Look for any JavaScript errors
- Check the API response logs
- Verify the data transformation

### 3. Check Backend Logs
- Look for print statements in the FastAPI logs
- Check for any Python errors or exceptions
- Verify the Supabase connection

### 4. Check Supabase Dashboard
- Go to your Supabase project dashboard
- Check the `user_profiles` table for new rows
- Look at the `preferences` JSONB column
- Verify the `user_id` references the correct authenticated user

## 🎯 Test Scenarios

### Scenario 1: Full Profile Creation
Test with all fields filled out to ensure complete data flow.

### Scenario 2: Partial Profile Creation
Test with only a few fields to ensure minimal profiles work.

### Scenario 3: Duplicate Profile Creation
Test creating a profile when one already exists (should fail).

### Scenario 4: Unauthenticated Request
Test without logging in to ensure authentication works.

### Scenario 5: Profile Retrieval
Test getting the created profile to ensure data persistence.

## 📝 Next Steps

Once testing is successful:

1. **Remove the test component** from production
2. **Add proper error handling** to the onboarding form
3. **Add loading states** for better UX
4. **Add success notifications** when profile is updated
5. **Consider adding a profile edit page** for users to update their info later

## 🆘 Need Help?

If you encounter issues:

1. **Check this guide** for common solutions
2. **Look at the browser console** for error messages
3. **Check the backend logs** for server-side errors
4. **Verify your Supabase setup** and credentials
5. **Test with the Python script** to isolate frontend vs backend issues 