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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
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
      // Authentication fields
      email: profileData.basicInformation.email,
      password: profileData.basicInformation.password,
      
      // Basic information
      name: profileData.basicInformation.name,
      age: profileData.basicInformation.age,
      gender: profileData.basicInformation.gender,
      height_ft: profileData.basicInformation.height,
      weight_lbs: profileData.basicInformation.weight,
      activity_level: profileData.basicInformation.activityLevel,
      location: profileData.location.zipCodeOrCity,
      health_goals: [
        profileData.healthGoal.goal,
        ...(profileData.healthGoal.customGoal ? [profileData.healthGoal.customGoal] : [])
      ].filter(goal => goal && goal.trim() !== ''),
      custom_health_goal: profileData.healthGoal.customGoal,
      preferences: {
        diet: profileData.dietaryPreferences.preferences || [],
        likes: profileData.dietaryPreferences.likedFoods ? 
          profileData.dietaryPreferences.likedFoods.split(',').map(item => item.trim()) : [],
        dislikes: profileData.mealHabits.dislikedFoods ? 
          profileData.mealHabits.dislikedFoods.split(',').map(item => item.trim()) : [],
        allergies: profileData.allergiesIntolerances.allergies || [],
        conditions: profileData.medicalConditions.conditions || [],
        meals_per_day: profileData.mealHabits.mealsPerDay,
        snacks: profileData.mealHabits.snacksBetweenMeals,
        cooks_often: profileData.mealHabits.cookAtHome
      }
    };

    const response = await api.post('/complete_user_registration', backendData);
    return response.data;
  },

  createProfile: async (profileData: OnboardingFormData): Promise<any> => {
    // Transform the frontend data structure to match the backend API
    const backendData = {
      name: profileData.basicInformation.name,
      age: profileData.basicInformation.age,
      gender: profileData.basicInformation.gender,
      height_ft: profileData.basicInformation.height,
      weight_lbs: profileData.basicInformation.weight,
      activity_level: profileData.basicInformation.activityLevel,
      location: profileData.location.zipCodeOrCity,
      health_goals: [
        profileData.healthGoal.goal,
        ...(profileData.healthGoal.customGoal ? [profileData.healthGoal.customGoal] : [])
      ].filter(goal => goal && goal.trim() !== ''),
      custom_health_goal: profileData.healthGoal.customGoal,
      preferences: {
        diet: profileData.dietaryPreferences.preferences || [],
        likes: profileData.dietaryPreferences.likedFoods ? 
          profileData.dietaryPreferences.likedFoods.split(',').map(item => item.trim()) : [],
        dislikes: profileData.mealHabits.dislikedFoods ? 
          profileData.mealHabits.dislikedFoods.split(',').map(item => item.trim()) : [],
        allergies: profileData.allergiesIntolerances.allergies || [],
        conditions: profileData.medicalConditions.conditions || [],
        meals_per_day: profileData.mealHabits.mealsPerDay,
        snacks: profileData.mealHabits.snacksBetweenMeals,
        cooks_often: profileData.mealHabits.cookAtHome
      }
    };

    const response = await api.post('/create_user_profile', backendData);
    return response.data;
  },

  updateProfile: async (profileData: OnboardingFormData): Promise<any> => {
    // Transform the frontend data structure to match the backend API
    const backendData = {
      name: profileData.basicInformation.name,
      age: profileData.basicInformation.age,
      gender: profileData.basicInformation.gender,
      height_ft: profileData.basicInformation.height,
      weight_lbs: profileData.basicInformation.weight,
      activity_level: profileData.basicInformation.activityLevel,
      location: profileData.location.zipCodeOrCity,
      health_goals: [
        profileData.healthGoal.goal,
        ...(profileData.healthGoal.customGoal ? [profileData.healthGoal.customGoal] : [])
      ].filter(goal => goal && goal.trim() !== ''),
      custom_health_goal: profileData.healthGoal.customGoal,
      preferences: {
        diet: profileData.dietaryPreferences.preferences || [],
        likes: profileData.dietaryPreferences.likedFoods ? 
          profileData.dietaryPreferences.likedFoods.split(',').map(item => item.trim()) : [],
        dislikes: profileData.mealHabits.dislikedFoods ? 
          profileData.mealHabits.dislikedFoods.split(',').map(item => item.trim()) : [],
        allergies: profileData.allergiesIntolerances.allergies || [],
        conditions: profileData.medicalConditions.conditions || [],
        meals_per_day: profileData.mealHabits.mealsPerDay,
        snacks: profileData.mealHabits.snacksBetweenMeals,
        cooks_often: profileData.mealHabits.cookAtHome
      }
    };

    const response = await api.put('/update_user_profile', backendData);
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

export default api; 