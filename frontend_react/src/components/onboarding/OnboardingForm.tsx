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

// Styled components
import {
  FormContainer,
  FormCard,
  FormHeader,
  FormTitle,
  FormContent,
  FormActions,
  Button,
  StepIndicator,
  LoadingSpinner,
  SuccessMessage,
  ErrorMessage,
  CloseButton
} from './OnboardingForm.styles';

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
      <FormContainer>
        <FormCard>
          <FormHeader>
            <CloseButton onClick={handleClose} title="Close and return to main page" />
            <FormTitle>🎉 Welcome to MealMind!</FormTitle>
          </FormHeader>
          
          <SuccessMessage>
            <h2>Welcome to MealMind!</h2>
            <p>
              🎉 Your account has been created successfully! We've set up a personalized profile 
              that will help us recommend the perfect meals, create shopping lists, and 
              suggest restaurants that match your preferences and health goals.
            </p>
            <p>
              You're now logged in and ready to start your personalized meal planning journey.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={handleStartPlanning}>
                🍽️ Start Meal Planning
              </Button>
              <Button variant="secondary" onClick={() => navigate('/meals')}>
                📱 Go to Meals App
              </Button>
            </div>
          </SuccessMessage>
        </FormCard>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormCard>
        <FormHeader>
          <CloseButton onClick={handleClose} title="Close and return to main page">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </CloseButton>
          <FormTitle>MealMind Setup</FormTitle>
        </FormHeader>

        <StepDropdown
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepChange={handleStepClick}
        />

        <FormContent>
          {renderCurrentStep()}
        </FormContent>

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <FormActions>
          {currentStep > 1 && (
            <Button variant="secondary" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button variant="primary" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Completing Setup...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          )}
        </FormActions>
      </FormCard>
    </FormContainer>
  );
};

export default OnboardingForm; 