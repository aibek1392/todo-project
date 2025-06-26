import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import {
  nextStep,
  previousStep,
  goToStep,
  submitOnboardingForm,
  clearError,
  updateBasicInformation,
  resetForm
} from '../../store/onboardingSlice';

// Step components
import Step1BasicInformation from './steps/Step1BasicInformation';
import Step2MedicalConditions from './steps/Step2MedicalConditions';
import Step3HealthGoal from './steps/Step3HealthGoal';
import Step4DietaryPreferences from './steps/Step4DietaryPreferences';
import Step5MealHabits from './steps/Step5MealHabits';
import Step6Location from './steps/Step6Location';

// Custom components
import StepDropdown from '../common/StepDropdown';
import { MealPlanDisplay } from '../mealplan';

// Components
import DarkModeToggle from '../common/DarkModeToggle';

const OnboardingForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMealPlan, setShowMealPlan] = useState(false);
  const {
    currentStep,
    formData,
    isCompleted,
    isSubmitting,
    error
  } = useSelector((state: RootState) => state.onboarding);

  const hasInitializedFromURL = useRef(false);
  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  // Handle URL-based navigation on component mount only
  useEffect(() => {
    if (!hasInitializedFromURL.current) {
      console.log('Initializing from URL, searchParams:', searchParams.toString());
      const stepParam = searchParams.get('step');
      
      // If we're starting at step 1, reset the form to ensure a clean start
      if (stepParam === '1' || !stepParam) {
        console.log('Starting fresh onboarding, resetting form');
        dispatch(resetForm());
      }
      
      if (stepParam) {
        const stepNumber = parseInt(stepParam, 10);
        console.log('Found step param:', stepNumber, 'currentStep:', currentStep);
        if (stepNumber >= 1 && stepNumber <= totalSteps && stepNumber !== currentStep) {
          console.log('Dispatching goToStep from URL:', stepNumber);
          dispatch(goToStep(stepNumber));
        }
      } else {
        // If no step parameter in URL, set it to step 1 and reset
        console.log('No step param, resetting to step 1');
        dispatch(resetForm());
        setSearchParams({ step: '1' }, { replace: true });
      }
      hasInitializedFromURL.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when step changes (but avoid infinite loops)
  useEffect(() => {
    if (hasInitializedFromURL.current) {
      console.log('Step change useEffect triggered, currentStep:', currentStep);
      const currentStepParam = searchParams.get('step');
      const currentStepString = currentStep.toString();
      console.log('URL step param:', currentStepParam, 'current step string:', currentStepString);
      if (currentStepParam !== currentStepString) {
        console.log('Updating URL to step:', currentStepString);
        setSearchParams({ step: currentStepString }, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleNext = async () => {
    // Special handling for Step 1 to ensure form data is saved
    if (currentStep === 1) {
      // For Step 1, we need to validate and save the form data
      const step1Form = document.querySelector('#step1-form') as HTMLFormElement;
      if (step1Form) {
        const formData = new FormData(step1Form);
        const step1Data = {
          username: formData.get('username') as string,
          password: formData.get('password') as string,
          confirmPassword: formData.get('confirmPassword') as string,
          height: formData.get('height') ? Number(formData.get('height')) : undefined,
          weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
          activityLevel: formData.get('activityLevel') as 'Light exercise' | 'Moderate' | 'Hard' | undefined,
        };
        
        console.log('Saving Step 1 data before proceeding:', step1Data);
        dispatch(updateBasicInformation(step1Data));
      }
    }
    
    if (currentStep < totalSteps) {
      dispatch(nextStep());
    }
    // Note: Final submission is handled by handleSubmit when user clicks "Complete Setup"
  };

  const handlePrevious = () => {
    dispatch(previousStep());
  };

  const handleSubmit = () => {
    dispatch(submitOnboardingForm());
  };

  const handleStartPlanning = () => {
    // Show the meal plan directly in the onboarding flow
    setShowMealPlan(true);
  };

  const handleBackToSuccess = () => {
    // Go back to success message from meal plan
    setShowMealPlan(false);
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleStepClick = (stepNumber: number) => {
    console.log('handleStepClick called with stepNumber:', stepNumber, 'currentStep:', currentStep);
    // Only dispatch if the step is actually different
    if (stepNumber !== currentStep && stepNumber >= 1 && stepNumber <= totalSteps) {
      console.log('Dispatching goToStep:', stepNumber);
      dispatch(goToStep(stepNumber));
      // URL will be updated by the useEffect that watches currentStep
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInformation onNext={handleNext} />;
      case 2:
        return <Step2MedicalConditions onNext={handleNext} />;
      case 3:
        return <Step3HealthGoal onNext={handleNext} />;
      case 4:
        return <Step4DietaryPreferences onNext={handleNext} />;
      case 5:
        return <Step5MealHabits onNext={handleNext} />;
      case 6:
        return <Step6Location onNext={handleNext} />;
      default:
        return <Step1BasicInformation onNext={handleNext} />;
    }
  };

  const getStepTitle = () => {
    const titles = [
      'Basic Information',
      'Medical Conditions',
      'Health Goal',
      'Dietary Preferences',
      'Meal Habits',
      'Location'
    ];
    return titles[currentStep - 1] || 'Getting Started';
  };

  if (isCompleted) {
    if (showMealPlan) {
      // Show the meal plan directly
      return <MealPlanDisplay onBack={handleBackToSuccess} />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative">
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center relative">
            <button 
              onClick={handleClose} 
              title="Close and return to main page"
              className="absolute top-1/2 right-4 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">🎉 Welcome to MealMind!</h1>
          </div>
          
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to MealMind!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              🎉 Your account has been created successfully! We've set up a personalized profile 
              that will help us recommend the perfect meals, create shopping lists, and 
              suggest restaurants that match your preferences and health goals.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              You're now logged in and ready to start your personalized meal planning journey.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={handleStartPlanning}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                🍽️ Start Meal Planning
              </button>
              <button 
                onClick={() => navigate('/meals')}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-600"
              >
                📱 Go to Meals App
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center relative">
          <button 
            onClick={handleClose} 
            title="Close and return to main page"
            className="absolute top-1/2 right-4 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-600 dark:text-gray-400">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">MealMind Setup</h1>
        </div>

        <StepDropdown
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepChange={handleStepClick}
        />

        <div className="p-5 min-h-[400px]">
          {renderCurrentStep()}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 border border-red-200 dark:border-red-800 mx-4 mb-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {currentStep > 1 && (
            <button 
              onClick={handlePrevious}
              className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-600"
            >
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button 
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 shadow-lg ml-auto"
            >
              Next Step
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 shadow-lg disabled:cursor-not-allowed disabled:hover:translate-y-0 ml-auto flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Completing Setup...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm; 