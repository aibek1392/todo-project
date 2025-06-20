import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateHealthGoal } from '../../../store/onboardingSlice';
import { HealthGoal } from '../../../types/onboarding';
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

interface Step2Props {
  onNext: () => void;
}

const healthGoalOptions = [
  { value: 'Lose weight', label: 'Lose weight', emoji: '⚖️' },
  { value: 'Maintain weight', label: 'Maintain weight', emoji: '🎯' },
  { value: 'Gain weight', label: 'Gain weight', emoji: '💪' },
  { value: 'Improve digestion', label: 'Improve digestion', emoji: '🌱' },
  { value: 'Manage blood sugar', label: 'Manage blood sugar', emoji: '📊' },
  { value: 'Lower cholesterol', label: 'Lower cholesterol', emoji: '❤️' },
  { value: 'Increase energy', label: 'Increase energy', emoji: '⚡' },
  { value: 'Custom', label: 'Custom goal', emoji: '✨' }
];

const Step2HealthGoal: React.FC<Step2Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const healthGoal = useSelector((state: RootState) => state.onboarding.formData.healthGoal);

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
        Choose the primary goal that best describes what you want to achieve with your meal planning.
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

        {selectedGoal === 'Custom' && (
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

export default Step2HealthGoal; 