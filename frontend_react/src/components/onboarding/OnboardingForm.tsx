import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import {
  nextStep,
  previousStep,
  submitOnboardingForm,
  clearError,
  updateBasicInformation
} from '../../store/onboardingSlice';

// Step components
import Step1BasicInformation from './steps/Step1BasicInformation';
import Step2HealthGoal from './steps/Step2HealthGoal';
import Step3DietaryPreferences from './steps/Step3DietaryPreferences';
import Step4AllergiesIntolerances from './steps/Step4AllergiesIntolerances';
import Step5MedicalConditions from './steps/Step5MedicalConditions';
import Step6MealHabits from './steps/Step6MealHabits';
import Step7Location from './steps/Step7Location';
import Step8MenuUpload from './steps/Step8MenuUpload';

// Styled components
import {
  OnboardingContainer,
  FormWrapper,
  Header,
  Title,
  Subtitle,
  ProgressBar,
  ProgressFill,
  StepIndicator,
  StepDot,
  FormContent,
  ButtonGroup,
  Button,
  LoadingSpinner,
  SuccessMessage,
  ErrorMessage
} from './OnboardingForm.styles';

const OnboardingForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    currentStep,
    formData,
    isCompleted,
    isSubmitting,
    error
  } = useSelector((state: RootState) => state.onboarding);

  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

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
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          confirmPassword: formData.get('confirmPassword') as string,
          age: formData.get('age') ? Number(formData.get('age')) : undefined,
          gender: formData.get('gender') as 'Male' | 'Female' | 'Other' | undefined,
          height: formData.get('height') ? Number(formData.get('height')) : undefined,
          weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
          activityLevel: formData.get('activityLevel') as 'Sedentary' | 'Lightly Active' | 'Active' | 'Very Active' | undefined,
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
    navigate('/meals');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInformation onNext={handleNext} />;
      case 2:
        return <Step2HealthGoal onNext={handleNext} />;
      case 3:
        return <Step3DietaryPreferences onNext={handleNext} />;
      case 4:
        return <Step4AllergiesIntolerances onNext={handleNext} />;
      case 5:
        return <Step5MedicalConditions onNext={handleNext} />;
      case 6:
        return <Step6MealHabits onNext={handleNext} />;
      case 7:
        return <Step7Location onNext={handleNext} />;
      case 8:
        return <Step8MenuUpload onNext={handleNext} />;
      default:
        return <Step1BasicInformation onNext={handleNext} />;
    }
  };

  const getStepTitle = () => {
    const titles = [
      'Basic Information',
      'Health Goal',
      'Dietary Preferences',
      'Allergies & Intolerances',
      'Medical Conditions',
      'Meal Habits',
      'Location',
      'Menu Upload'
    ];
    return titles[currentStep - 1] || 'Getting Started';
  };

  if (isCompleted) {
    return (
      <OnboardingContainer>
        <FormWrapper>
          <Header>
            <Title>🎉 Welcome to MealMind!</Title>
            <Subtitle>Your personalized meal planning journey begins now</Subtitle>
          </Header>
          
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
            <Button variant="primary" onClick={handleStartPlanning}>
              Start Meal Planning
            </Button>
          </SuccessMessage>
        </FormWrapper>
      </OnboardingContainer>
    );
  }

  return (
    <OnboardingContainer>
      <FormWrapper>
        <Header>
          <Title>MealMind Setup</Title>
          <Subtitle>
            Step {currentStep} of {totalSteps}: {getStepTitle()}
          </Subtitle>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
        </Header>

        <StepIndicator>
          {Array.from({ length: totalSteps }, (_, index) => (
            <StepDot
              key={index + 1}
              active={index + 1 === currentStep}
              completed={index + 1 < currentStep}
            />
          ))}
        </StepIndicator>

        <FormContent>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {renderCurrentStep()}
        </FormContent>

        <ButtonGroup>
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Back
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentStep < totalSteps ? (
              <Button variant="primary" onClick={handleNext}>
                Next
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
                    <span style={{ marginLeft: '8px' }}>Completing...</span>
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </div>
        </ButtonGroup>
      </FormWrapper>
    </OnboardingContainer>
  );
};

export default OnboardingForm; 