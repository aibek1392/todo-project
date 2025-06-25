-- Updated Database Schema
-- This schema matches the user's updated table structure

-- Users Table (for authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),  -- Optional field
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles Table (for onboarding information)
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Information
  name TEXT,
  age INTEGER,
  gender TEXT,
  height_ft NUMERIC(4,2), -- e.g., 5.75 for 5'9"
  weight_lbs INTEGER,
  activity_level TEXT,
  
  -- Health Goals (using _text array type as specified)
  health_goals _text, -- Array of health goals
  custom_health_goal TEXT,
  
  -- Location
  location TEXT,
  
  -- Detailed Preferences (stored as JSONB for flexibility)
  preferences JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id), -- Each user can only have one profile
  CHECK (age > 0 AND age < 150),
  CHECK (height_ft > 0 AND height_ft < 10),
  CHECK (weight_lbs > 0 AND weight_lbs < 2000)
);

-- Meal Plans Table
CREATE TABLE meal_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_basket BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (end_date >= start_date)
);

-- Recipes Table
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_calories INTEGER,
  tags _text, -- Array of dietary tags (e.g., ['vegetarian', 'gluten-free'])
  ingredients JSONB NOT NULL, -- JSON array of ingredients
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(name), -- Recipe names should be unique
  CHECK (prep_time_minutes >= 0),
  CHECK (cook_time_minutes >= 0),
  CHECK (total_calories >= 0)
);

-- Meal Plan Items Table (links meal plans to recipes for specific days/meals)
CREATE TABLE meal_plan_items (
  id SERIAL PRIMARY KEY,
  meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_offset INTEGER NOT NULL, -- 0 for first day, 1 for second day, etc.
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (day_offset >= 0 AND day_offset <= 6), -- 7-day meal plans
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

-- Shopping List Items Table
CREATE TABLE shopping_list_items (
  id SERIAL PRIMARY KEY,
  meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price_min NUMERIC(10,2),
  price_max NUMERIC(10,2),
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (price_min >= 0),
  CHECK (price_max >= price_min)
);

-- Indexes for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(start_date, end_date);
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_recipe_id ON meal_plan_items(recipe_id);
CREATE INDEX idx_shopping_list_items_meal_plan_id ON shopping_list_items(meal_plan_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
    BEFORE UPDATE ON meal_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Example preferences JSONB structure:
/*
{
  "diet": ["vegetarian", "low_fodmap"],
  "likes": ["avocado", "chicken", "salmon"],
  "dislikes": ["broccoli", "mushrooms"],
  "allergies": ["gluten", "dairy"],
  "conditions": ["ibs", "gerd"],
  "meals_per_day": 3,
  "snacks": true,
  "cooks_often": false
}
*/

-- Example ingredients JSONB structure:
/*
[
  "1 cup rolled oats",
  "2 cups water", 
  "1/2 cup strawberries",
  "1/2 cup blueberries",
  "1 tablespoon honey"
]
*/ 