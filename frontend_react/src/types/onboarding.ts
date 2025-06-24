export interface BasicInformation {
  username?: string;
  password?: string;
  confirmPassword?: string;
  height?: number; // ft
  weight?: number; // lb
  activityLevel?: 'Light exercise' | 'Moderate' | 'Hard';
}

export interface MedicalConditions {
  conditions: string[];
  otherCondition?: string;
  // Conditional fields based on selected conditions
  diabetesInsulin?: boolean; // if Diabetes selected
  pcosHormonal?: boolean; // if PCOS selected
  hbpSaltIntake?: boolean; // if High blood pressure selected
  ibdType?: 'Ulcerative colitis' | 'Crohns'; // if IBD selected
  ucCondition?: 'In flare' | 'In remission'; // if Ulcerative colitis selected
}

export interface HealthGoal {
  goal: 'Lose weight' | 'Maintain weight' | 'Gain weight' | 'Lower cholesterol' | 'Increase energy' | 'Improve digestion' | 'Other';
  customGoal?: string;
}

export interface DietaryPreferences {
  preferences: string[];
  customPreference?: string;
}

export interface AllergiesIntolerances {
  allergies: string[];
  otherAllergy?: string;
}

export interface MealHabits {
  mealsPerDay?: number;
  snacks?: boolean;
  cooksOften?: boolean;
  foodsDisliked?: string;
}

export interface Location {
  zipCodeOrCity: string;
}

export interface MenuUpload {
  menuImage?: File;
}

export interface OnboardingFormData {
  basicInformation: BasicInformation;
  medicalConditions: MedicalConditions;
  healthGoal: HealthGoal;
  dietaryPreferences: DietaryPreferences;
  allergiesIntolerances: AllergiesIntolerances;
  mealHabits: MealHabits;
  location: Location;
  menuUpload: MenuUpload;
}

export interface OnboardingState {
  currentStep: number;
  formData: OnboardingFormData;
  isCompleted: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export const ACTIVITY_LEVELS = [
  'Light exercise',
  'Moderate', 
  'Hard'
] as const;

export const MEDICAL_CONDITIONS = [
  'IBS',
  'GERD / Acid Reflux',
  'Celiac',
  'Diabetes (Type 1 / Type 2)',
  'PCOS',
  'High blood pressure',
  'IBD (Ulcerative Colitis, Crohn\'s)',
  'None',
  'Other'
] as const;

export const HEALTH_GOALS_NORMAL = [
  'Lose weight',
  'Maintain weight',
  'Gain weight',
  'Lower cholesterol',
  'Increase energy',
  'Improve digestion',
  'Other'
] as const;

export const HEALTH_GOALS_CRITICAL = [
  'Maintain weight',
  'Improve digestion',
  'Increase energy',
  'Other'
] as const;

export const DIETARY_PREFERENCES_NORMAL = [
  'Vegetarian',
  'Vegan',
  'Keto',
  'Pescatarian',
  'Paleo',
  'Low FODMAP',
  'Mediterranean',
  'High protein',
  'Intermittent fasting',
  'No specific diet',
  'Custom'
] as const;

export const DIETARY_PREFERENCES_CRITICAL = [
  'Low FODMAP',
  'Mediterranean',
  'No specific diet',
  'Doctor-prescribed',
  'Soft diet',
  'Custom'
] as const;

export const ALLERGIES_INTOLERANCES = [
  'Dairy / Lactose',
  'Gluten / Wheat',
  'Eggs',
  'Soy',
  'Corn',
  'Sesame',
  'Shellfish (shrimp, crab, lobster, etc.)',
  'Fish (salmon, tuna, cod, etc.)',
  'Peanuts',
  'Tree Nuts (almonds, cashews, walnuts, etc.)',
  'Nightshades (tomatoes, peppers, potatoes, eggplant)',
  'Citrus fruits',
  'Artificial sweeteners (aspartame, sucralose)',
  'Food dyes (Red 40, Yellow 5, etc.)',
  'Legumes (lentils, chickpeas, beans)',
  'Histamine-rich foods (fermented, aged cheeses, etc.)',
  'Sulfites (in wine, dried fruits)',
  'Other'
] as const;

// Helper function to determine if user has critical conditions
export const hasCriticalConditions = (conditions: string[]): boolean => {
  return conditions.some(condition => 
    condition === 'Ulcerative Colitis (in flare)' ||
    condition === 'Crohn\'s (flare)' ||
    condition === 'Severe IBS'
  );
}; 