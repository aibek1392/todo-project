import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import {
  nextStep,
  previousStep,
  goToStep,
  submitOnboardingForm,
  clearError,
  updateBasicInformation
} from '../../store/onboardingSlice';

// Step components
import Step1BasicInformation from './steps/Step1BasicInformation';
import Step2MedicalConditions from './steps/Step2MedicalConditions';
import Step3HealthGoal from './steps/Step3HealthGoal';
import Step4DietaryPreferences from './steps/Step4DietaryPreferences';
import Step5AllergiesIntolerances from './steps/Step5AllergiesIntolerances';
import Step6MealHabits from './steps/Step6MealHabits';
import Step7Location from './steps/Step7Location';

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
  ErrorMessage,
  CloseButton
} from './OnboardingForm.styles';

const OnboardingForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentStep,
    formData,
    isCompleted,
    isSubmitting,
    error
  } = useSelector((state: RootState) => state.onboarding);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  // Handle URL-based navigation
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= totalSteps && stepNumber !== currentStep) {
        dispatch(goToStep(stepNumber));
      }
    }
  }, [searchParams, dispatch, currentStep, totalSteps]);

  // Update URL when step changes
  useEffect(() => {
    const currentStepParam = searchParams.get('step');
    if (currentStepParam !== currentStep.toString()) {
      setSearchParams({ step: currentStep.toString() });
    }
  }, [currentStep, searchParams, setSearchParams]);

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
    navigate('/meals');
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleStepClick = (stepNumber: number) => {
    // Allow direct navigation to any step
    dispatch(goToStep(stepNumber));
    setSearchParams({ step: stepNumber.toString() });
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
        return <Step5AllergiesIntolerances onNext={handleNext} />;
      case 6:
        return <Step6MealHabits onNext={handleNext} />;
      case 7:
        return <Step7Location onNext={handleNext} />;
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
      'Allergies & Intolerances',
      'Meal Habits',
      'Location'
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
          <CloseButton onClick={handleClose} title="Close and return to main page" />
          <Title>MealMind Setup</Title>
          <Subtitle>
            Step {currentStep} of {totalSteps}: {getStepTitle()}
          </Subtitle>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
        </Header>

        <StepIndicator>
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepTitles = [
              'Basic Information',
              'Medical Conditions',
              'Health Goal',
              'Dietary Preferences',
              'Allergies & Intolerances',
              'Meal Habits',
              'Location'
            ];
            return (
              <StepDot
                key={index + 1}
                active={index + 1 === currentStep}
                completed={index + 1 < currentStep}
                onClick={() => handleStepClick(index + 1)}
                style={{ cursor: 'pointer' }}
                title={`Go to step ${index + 1}: ${stepTitles[index]}`}
              />
            );
          })}
        </StepIndicator>

        {/* Jump to Step Dropdown */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '10px',
          margin: '15px 0',
          padding: '0 20px'
        }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#666' }}>
            Jump to Step:
          </label>
          <select
            value={currentStep}
            onChange={(e) => handleStepClick(parseInt(e.target.value, 10))}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const stepTitles = [
                'Basic Information',
                'Medical Conditions',
                'Health Goal',
                'Dietary Preferences',
                'Allergies & Intolerances',
                'Meal Habits',
                'Location'
              ];
              return (
                <option key={stepNumber} value={stepNumber}>
                  Step {stepNumber}: {stepTitles[index]}
                </option>
              );
            })}
          </select>
        </div>

        {/* Step Navigation Menu */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          justifyContent: 'center', 
          margin: '20px 0',
          padding: '0 20px'
        }}>
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const stepTitles = [
              'Basic Info',
              'Medical Conditions',
              'Health Goal',
              'Dietary Preferences',
              'Allergies',
              'Meal Habits',
              'Location'
            ];
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <button
                key={stepNumber}
                onClick={() => handleStepClick(stepNumber)}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: isActive ? '2px solid #007bff' : '1px solid #ddd',
                  backgroundColor: isActive ? '#007bff' : isCompleted ? '#28a745' : '#f8f9fa',
                  color: isActive || isCompleted ? 'white' : '#666',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
                title={`Go to Step ${stepNumber}: ${stepTitles[index]}`}
              >
                {stepNumber}. {stepTitles[index]}
              </button>
            );
          })}
        </div>

        <FormContent>
          {renderCurrentStep()}
        </FormContent>

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <ButtonGroup>
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
        </ButtonGroup>
      </FormWrapper>
    </OnboardingContainer>
  );
};

export default OnboardingForm; 