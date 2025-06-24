import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateHealthGoal } from '../../../store/onboardingSlice';
import { HealthGoal, HEALTH_GOALS_NORMAL, HEALTH_GOALS_CRITICAL } from '../../../types/onboarding';
import {
  StepTitle,
  StepDescription,
  FormGroup,
  Label,
  Input,
  RadioGroup,
  RadioItem,
  Radio,
  ErrorMessage
} from '../OnboardingForm.styles';

interface Step3Props {
  onNext: () => void;
}

const Step3HealthGoal: React.FC<Step3Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const healthGoal = useSelector((state: RootState) => state.onboarding.formData.healthGoal);
  const medicalConditions = useSelector((state: RootState) => state.onboarding.formData.medicalConditions);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger
  } = useForm({
    defaultValues: healthGoal,
    mode: 'onChange'
  });

  const selectedGoal = watch('goal');

  // Determine if user has critical conditions that limit health goal options
  const hasCriticalConditions = useMemo(() => {
    const conditions = medicalConditions.conditions || [];
    return conditions.some(condition => {
      if (condition === 'IBD (Ulcerative Colitis, Crohn\'s)') {
        // Check for UC in flare or Crohn's
        return (medicalConditions.ibdType === 'Ulcerative colitis' && medicalConditions.ucCondition === 'In flare') ||
               medicalConditions.ibdType === 'Crohns';
      }
      return condition === 'IBS' && conditions.includes('Severe IBS'); // Assuming severe IBS is marked somehow
    });
  }, [medicalConditions]);

  // Get appropriate health goal options based on medical conditions
  const healthGoalOptions = useMemo(() => {
    const baseOptions = hasCriticalConditions ? HEALTH_GOALS_CRITICAL : HEALTH_GOALS_NORMAL;
    return baseOptions.map(goal => ({
      value: goal,
      label: goal,
      emoji: getEmojiForGoal(goal)
    }));
  }, [hasCriticalConditions]);

  function getEmojiForGoal(goal: string): string {
    switch (goal) {
      case 'Lose weight': return '⚖️';
      case 'Maintain weight': return '🎯';
      case 'Gain weight': return '💪';
      case 'Lower cholesterol': return '❤️';
      case 'Increase energy': return '⚡';
      case 'Improve digestion': return '🌱';
      case 'Other': return '✨';
      default: return '🎯';
    }
  }

  const onSubmit = (data: any) => {
    dispatch(updateHealthGoal(data));
    onNext();
  };

  const handleNext = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <StepTitle>What's your main health goal?</StepTitle>
      <StepDescription>
        {hasCriticalConditions ? (
          <>
            Based on your medical conditions, we've filtered the options to those that are most appropriate for your health needs.
            <br />
            <em>Note: Options like "Lose weight", "Gain weight", and "Intermittent fasting" are hidden to avoid potential flare triggers.</em>
          </>
        ) : (
          'Choose the primary goal that best describes what you want to achieve with your meal planning.'
        )}
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Select your health goal</Label>
          <Controller
            name="goal"
            control={control}
            rules={{ required: 'Please select a health goal' }}
            render={({ field }) => (
              <RadioGroup>
                {healthGoalOptions.map((option) => (
                  <RadioItem
                    key={option.value}
                    className={field.value === option.value ? 'checked' : ''}
                  >
                    <Radio
                      type="radio"
                      value={option.value}
                      checked={field.value === option.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>{option.emoji}</span>
                    <span>{option.label}</span>
                  </RadioItem>
                ))}
              </RadioGroup>
            )}
          />
          {errors.goal && <ErrorMessage>{errors.goal.message}</ErrorMessage>}
        </FormGroup>

        {selectedGoal === 'Other' && (
          <FormGroup>
            <Label htmlFor="customGoal">Describe your custom goal</Label>
            <Input
              id="customGoal"
              type="text"
              placeholder="Tell us about your specific health goal..."
              className={errors.customGoal ? 'error' : ''}
              {...register('customGoal')}
            />
            {errors.customGoal && <ErrorMessage>{errors.customGoal.message}</ErrorMessage>}
          </FormGroup>
        )}
      </form>
    </>
  );
};

export default Step3HealthGoal; 