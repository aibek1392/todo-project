import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OnboardingState, OnboardingFormData } from '../types/onboarding';
import { userProfileAPI } from '../services/api';

const initialFormData: OnboardingFormData = {
  basicInformation: {},
  healthGoal: { goal: 'Lose weight' },
  dietaryPreferences: { preferences: [] },
  allergiesIntolerances: { allergies: [] },
  medicalConditions: { conditions: [] },
  mealHabits: {},
  location: { zipCodeOrCity: '' },
  menuUpload: {}
};

const initialState: OnboardingState = {
  currentStep: 1,
  formData: initialFormData,
  isCompleted: false,
  isSubmitting: false,
  error: null
};

// Async thunk for submitting the complete onboarding form
export const submitOnboardingForm = createAsyncThunk(
  'onboarding/submitForm',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      // Get the current form data from state
      const state = getState() as any;
      const formData = state.onboarding.formData;
      
      // Validate required fields for final submission
      console.log('Form data being submitted:', formData);
      console.log('Basic info:', formData.basicInformation);
      
      if (!formData.basicInformation.email || !formData.basicInformation.password) {
        console.error('Missing email or password:', {
          email: formData.basicInformation.email,
          password: formData.basicInformation.password ? '***' : undefined
        });
        throw new Error('Please go back to Step 1 and complete: Email and password are required');
      }
      if (!formData.basicInformation.name) {
        console.error('Missing name:', formData.basicInformation.name);
        throw new Error('Please go back to Step 1 and complete: Name is required');
      }
      
      // Call the complete registration API
      const response = await userProfileAPI.completeRegistration(formData);
      
      // Store authentication data
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      
      // Store user profile data
      localStorage.setItem('userProfile', JSON.stringify(formData));
      
      // Update auth state if we have access to it
      if (response.user && response.access_token) {
        // Dispatch to auth slice if available
        try {
          const { setUser } = await import('./authSlice');
          dispatch(setUser(response.user));
        } catch (e) {
          console.log('Auth slice not available, continuing...');
        }
      }
      
      console.log('Complete registration successful:', response);
      return { formData, apiResponse: response };
    } catch (error: any) {
      console.error('Failed to complete registration:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to complete registration';
      return rejectWithValue(errorMessage);
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < 8) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      if (action.payload >= 1 && action.payload <= 8) {
        state.currentStep = action.payload;
      }
    },
    updateBasicInformation: (state, action: PayloadAction<Partial<OnboardingFormData['basicInformation']>>) => {
      state.formData.basicInformation = { ...state.formData.basicInformation, ...action.payload };
    },
    updateHealthGoal: (state, action: PayloadAction<Partial<OnboardingFormData['healthGoal']>>) => {
      state.formData.healthGoal = { ...state.formData.healthGoal, ...action.payload };
    },
    updateDietaryPreferences: (state, action: PayloadAction<Partial<OnboardingFormData['dietaryPreferences']>>) => {
      state.formData.dietaryPreferences = { ...state.formData.dietaryPreferences, ...action.payload };
    },
    updateAllergiesIntolerances: (state, action: PayloadAction<Partial<OnboardingFormData['allergiesIntolerances']>>) => {
      state.formData.allergiesIntolerances = { ...state.formData.allergiesIntolerances, ...action.payload };
    },
    updateMedicalConditions: (state, action: PayloadAction<Partial<OnboardingFormData['medicalConditions']>>) => {
      state.formData.medicalConditions = { ...state.formData.medicalConditions, ...action.payload };
    },
    updateMealHabits: (state, action: PayloadAction<Partial<OnboardingFormData['mealHabits']>>) => {
      state.formData.mealHabits = { ...state.formData.mealHabits, ...action.payload };
    },
    updateLocation: (state, action: PayloadAction<Partial<OnboardingFormData['location']>>) => {
      state.formData.location = { ...state.formData.location, ...action.payload };
    },
    updateMenuUpload: (state, action: PayloadAction<Partial<OnboardingFormData['menuUpload']>>) => {
      state.formData.menuUpload = { ...state.formData.menuUpload, ...action.payload };
    },
    resetForm: (state) => {
      state.currentStep = 1;
      state.formData = initialFormData;
      state.isCompleted = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOnboardingForm.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitOnboardingForm.fulfilled, (state) => {
        state.isSubmitting = false;
        state.isCompleted = true;
        state.error = null;
      })
      .addCase(submitOnboardingForm.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  nextStep,
  previousStep,
  goToStep,
  updateBasicInformation,
  updateHealthGoal,
  updateDietaryPreferences,
  updateAllergiesIntolerances,
  updateMedicalConditions,
  updateMealHabits,
  updateLocation,
  updateMenuUpload,
  resetForm,
  clearError
} = onboardingSlice.actions;

export default onboardingSlice.reducer; 