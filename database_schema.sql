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

-- Indexes for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

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