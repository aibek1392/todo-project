import axios from 'axios';
import { AuthResponse, LoginCredentials, User } from '../types/auth';
import { Todo } from '../types/todo';
import { OnboardingFormData } from '../types/onboarding';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: async (userData: { email: string; password: string; full_name: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Todo API
export const todoAPI = {
  getTodos: async (): Promise<Todo[]> => {
    const response = await api.get('/todos');
    return response.data;
  },

  createTodo: async (todo: Omit<Todo, 'id' | 'user_id'>): Promise<Todo> => {
    const response = await api.post('/todos', todo);
    return response.data;
  },

  updateTodo: async (id: number, todo: Partial<Todo>): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },

  deleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
};

// User Profile API
export const userProfileAPI = {
  // Complete user registration (creates user account + profile)
  completeRegistration: async (profileData: OnboardingFormData): Promise<any> => {
    // Transform the frontend data structure to match the backend API
    const backendData = {
      // Authentication fields - create dummy email from username
      email: `${profileData.basicInformation.username}@temp.com`,
      password: profileData.basicInformation.password,
      name: profileData.basicInformation.username,
      
      // Basic information
      height_ft: profileData.basicInformation.height,
      weight_lbs: profileData.basicInformation.weight,
      activity_level: profileData.basicInformation.activityLevel,
      location: profileData.location.zipCodeOrCity,
      
      // Health and dietary information
      health_goals: [profileData.healthGoal.goal],
      custom_health_goal: profileData.healthGoal.customGoal,
      
      // Preferences
      preferences: {
        diet: profileData.dietaryPreferences.preferences || [],
        dislikes: profileData.mealHabits.foodsDisliked ? 
          profileData.mealHabits.foodsDisliked.split(',').map((item: string) => item.trim()) : [],
        allergies: profileData.allergiesIntolerances.allergies || [],
        conditions: profileData.medicalConditions.conditions || [],
        meals_per_day: profileData.mealHabits.mealsPerDay,
        snacks: profileData.mealHabits.snacks,
        cooks_often: profileData.mealHabits.cooksOften
      }
    };

    console.log('Sending complete registration data:', backendData);
    
    const response = await api.post('/complete_user_registration', backendData);
    return response.data;
  },

  // Create user profile
  createProfile: async (profileData: OnboardingFormData): Promise<any> => {
    // Transform the frontend data structure to match the backend API
    const backendData = {
      height_ft: profileData.basicInformation.height,
      weight_lbs: profileData.basicInformation.weight,
      activity_level: profileData.basicInformation.activityLevel,
      location: profileData.location.zipCodeOrCity,
      
      // Health and dietary information
      health_goal: profileData.healthGoal.goal,
      custom_goal: profileData.healthGoal.customGoal,
      
      // Medical conditions with details
      medical_conditions: {
        conditions: profileData.medicalConditions.conditions || [],
        diabetes_insulin: profileData.medicalConditions.diabetesInsulin,
        pcos_hormonal: profileData.medicalConditions.pcosHormonal,
        hbp_salt_intake: profileData.medicalConditions.hbpSaltIntake,
        ibd_type: profileData.medicalConditions.ibdType,
        uc_condition: profileData.medicalConditions.ucCondition,
        other_condition: profileData.medicalConditions.otherCondition
      },
      
      // Preferences and restrictions
      preferences: {
        diet: profileData.dietaryPreferences.preferences || [],
        custom_diet: profileData.dietaryPreferences.customPreference,
        dislikes: profileData.mealHabits.foodsDisliked ? 
          profileData.mealHabits.foodsDisliked.split(',').map((item: string) => item.trim()) : [],
        allergies: profileData.allergiesIntolerances.allergies || [],
        other_allergy: profileData.allergiesIntolerances.otherAllergy,
        meals_per_day: profileData.mealHabits.mealsPerDay,
        snacks: profileData.mealHabits.snacks,
        cooks_often: profileData.mealHabits.cooksOften
      }
    };

    console.log('Creating profile with data:', backendData);
    
    const response = await api.post('/profile', backendData);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: OnboardingFormData): Promise<any> => {
    // Transform the frontend data structure to match the backend API
    const backendData = {
      height_ft: profileData.basicInformation.height,
      weight_lbs: profileData.basicInformation.weight,
      activity_level: profileData.basicInformation.activityLevel,
      location: profileData.location.zipCodeOrCity,
      
      // Health and dietary information
      health_goal: profileData.healthGoal.goal,
      custom_goal: profileData.healthGoal.customGoal,
      
      // Medical conditions with details
      medical_conditions: {
        conditions: profileData.medicalConditions.conditions || [],
        diabetes_insulin: profileData.medicalConditions.diabetesInsulin,
        pcos_hormonal: profileData.medicalConditions.pcosHormonal,
        hbp_salt_intake: profileData.medicalConditions.hbpSaltIntake,
        ibd_type: profileData.medicalConditions.ibdType,
        uc_condition: profileData.medicalConditions.ucCondition,
        other_condition: profileData.medicalConditions.otherCondition
      },
      
      // Preferences and restrictions
      preferences: {
        diet: profileData.dietaryPreferences.preferences || [],
        custom_diet: profileData.dietaryPreferences.customPreference,
        dislikes: profileData.mealHabits.foodsDisliked ? 
          profileData.mealHabits.foodsDisliked.split(',').map((item: string) => item.trim()) : [],
        allergies: profileData.allergiesIntolerances.allergies || [],
        other_allergy: profileData.allergiesIntolerances.otherAllergy,
        meals_per_day: profileData.mealHabits.mealsPerDay,
        snacks: profileData.mealHabits.snacks,
        cooks_often: profileData.mealHabits.cooksOften
      }
    };

    console.log('Updating profile with data:', backendData);
    
    const response = await api.put('/profile', backendData);
    return response.data;
  },

  createOrUpdateProfile: async (profileData: OnboardingFormData): Promise<any> => {
    try {
      // Try to create first
      return await userProfileAPI.createProfile(profileData);
    } catch (error: any) {
      // If profile already exists, try to update
      if (error.response?.status === 500 && 
          error.response?.data?.detail?.includes('already exists')) {
        console.log('Profile exists, updating instead...');
        return await userProfileAPI.updateProfile(profileData);
      }
      // Re-throw other errors
      throw error;
    }
  },

  getProfile: async (): Promise<any> => {
    const response = await api.get('/user_profile');
    return response.data;
  },
};

// Meal Planning API
export const mealPlanAPI = {
  // Generate a personalized 7-day meal plan
  generateMealPlan: async (forceRefresh: boolean = false): Promise<any> => {
    const response = await api.post(`/generate-meal-plan?force_refresh=${forceRefresh}`);
    return response.data;
  },

  // Store a meal plan in the database
  storeMealPlan: async (mealPlanData: any): Promise<any> => {
    const response = await api.post('/store-meal-plan', mealPlanData);
    return response.data;
  },

  // Generate and store meal plan in one call
  generateAndStoreMealPlan: async (startDate: string, forceRefresh: boolean = false): Promise<any> => {
    const response = await api.post(`/generate-and-store-meal-plan?start_date=${startDate}&force_refresh=${forceRefresh}`);
    return response.data;
  },

  // Get user profile summary for meal planning
  getProfileSummary: async (): Promise<any> => {
    const response = await api.get('/user-profile-for-meal-planning');
    return response.data;
  },

  // Get meal plan cache statistics
  getCacheStats: async (): Promise<any> => {
    const response = await api.get('/meal-plan-cache/stats');
    return response.data;
  },

  // Clear meal plan cache for current user
  clearCache: async (): Promise<any> => {
    const response = await api.delete('/meal-plan-cache');
    return response.data;
  },

  // Test meal planning functionality (development only)
  testMealPlan: async (): Promise<any> => {
    const response = await api.post('/test-meal-plan');
    return response.data;
  },
};

export default api; 