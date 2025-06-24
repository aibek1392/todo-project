// TypeScript interfaces for the LangChain Meal Planner
// These interfaces match the Pydantic models in the backend

export interface Meal {
  title: string;
  description: string;
  ingredients: string[];
  cooking_time: string;
  calories?: number;
  dietary_tags: string[];
}

export interface DayMeals {
  day: string;
  date: string;
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snacks?: Meal[];
}

export interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
  estimated_cost?: string;
}

export interface MealPlanResponse {
  meal_plan: DayMeals[];
  shopping_list: ShoppingItem[];
  total_estimated_cost?: string;
  nutritional_summary: Record<string, string>;
  preparation_tips: string[];
}

export interface UserProfileSummary {
  basic_info: {
    name: string;
    height_ft?: number;
    weight_lbs?: number;
    activity_level?: string;
  };
  health_goals: string[];
  dietary_preferences: string[];
  allergies: string[];
  meal_habits: {
    meals_per_day: number;
    snacks: boolean;
    cooks_often: boolean;
    dislikes: string[];
  };
  location: string;
}

export interface ProfileSummaryResponse {
  profile: UserProfileSummary;
  meal_planning_ready: boolean;
  message: string;
}

export interface CacheStats {
  total_entries: number;
  total_size_mb: number;
  oldest_entry?: string;
  newest_entry?: string;
}

export interface CacheStatsResponse {
  cache_stats: CacheStats;
  message: string;
}

export interface MealPlanError {
  detail: string;
  error_type?: string;
}

// Frontend-specific interfaces for UI components
export interface MealCardProps {
  meal: Meal;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dayName: string;
}

export interface DayMealCardProps {
  dayMeals: DayMeals;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export interface ShoppingListProps {
  items: ShoppingItem[];
  totalCost?: string;
  isGrouped?: boolean;
}

export interface MealPlanDisplayProps {
  mealPlan: MealPlanResponse;
  isLoading: boolean;
  error?: string;
  onRefresh: () => void;
  onClearCache: () => void;
}

export interface GenerateMealPlanOptions {
  forceRefresh?: boolean;
  showLoadingToast?: boolean;
  onSuccess?: (mealPlan: MealPlanResponse) => void;
  onError?: (error: string) => void;
}

// Constants for meal planning
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = typeof MEAL_TYPES[number];

export const SHOPPING_CATEGORIES = [
  'Produce',
  'Dairy',
  'Meat',
  'Pantry',
  'Grains',
  'Frozen',
  'Beverages',
  'Snacks',
  'Other'
] as const;

export type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

// Utility types for meal plan state management
export interface MealPlanState {
  currentPlan?: MealPlanResponse;
  isLoading: boolean;
  error?: string;
  lastGenerated?: Date;
  cacheStats?: CacheStats;
}

export interface MealPlanActions {
  generateMealPlan: (options?: GenerateMealPlanOptions) => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheStats: () => Promise<void>;
  clearError: () => void;
}

export type MealPlanContextType = MealPlanState & MealPlanActions; 