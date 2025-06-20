export interface BasicInformation {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  height?: number; // ft
  weight?: number; // lb
  activityLevel?: 'Sedentary' | 'Lightly Active' | 'Active' | 'Very Active';
}

export interface HealthGoal {
  goal: 'Lose weight' | 'Maintain weight' | 'Gain weight' | 'Improve digestion' | 'Manage blood sugar' | 'Lower cholesterol' | 'Increase energy' | 'Custom';
  customGoal?: string;
}

export interface DietaryPreferences {
  preferences: string[];
  customPreference?: string;
  likedFoods?: string;
}

export interface AllergiesIntolerances {
  allergies: string[];
  otherAllergy?: string;
}

export interface MedicalConditions {
  conditions: string[];
  otherCondition?: string;
}

export interface MealHabits {
  mealsPerDay?: number;
  snacksBetweenMeals?: boolean;
  cookAtHome?: boolean;
  dislikedFoods?: string;
}

export interface Location {
  zipCodeOrCity: string;
}

export interface MenuUpload {
  menuImage?: File;
}

export interface OnboardingFormData {
  basicInformation: BasicInformation;
  healthGoal: HealthGoal;
  dietaryPreferences: DietaryPreferences;
  allergiesIntolerances: AllergiesIntolerances;
  medicalConditions: MedicalConditions;
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

export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Low FODMAP',
  'Mediterranean',
  'High Protein',
  'Intermittent Fasting',
  'No specific diet',
  'Custom'
] as const;

export const ALLERGIES_INTOLERANCES = [
  'Dairy / Lactose',
  'Gluten / Wheat',
  'Eggs',
  'Nuts (Peanuts, Tree nuts)',
  'Soy',
  'Shellfish',
  'Corn',
  'Sesame',
  'Other'
] as const;

export const MEDICAL_CONDITIONS = [
  'IBS',
  'GERD / Acid reflux',
  'Celiac',
  'Ulcerative colitis',
  'Diabetes (Type 1/2)',
  'PCOS',
  'High blood pressure',
  'None',
  'Other'
] as const; 