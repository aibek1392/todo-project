import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateBasicInformation } from '../../../store/onboardingSlice';
import { BasicInformation, ACTIVITY_LEVELS } from '../../../types/onboarding';
import {
  StepTitle,
  StepDescription,
  FormGroup,
  Label,
  Input,
  Select,
  ErrorMessage,
  TwoColumnGrid
} from '../OnboardingForm.styles';

interface Step1Props {
  onNext: () => void;
}

const Step1BasicInformation: React.FC<Step1Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const basicInfo = useSelector((state: RootState) => state.onboarding.formData.basicInformation);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch
  } = useForm({
    defaultValues: basicInfo,
    mode: 'onChange'
  });

  const watchPassword = watch('password');

  const onSubmit = (data: any) => {
    console.log('Step1 form data being saved:', data);
    dispatch(updateBasicInformation(data));
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
      <StepTitle>Basic Information</StepTitle>
      <StepDescription>
        Let's start with some basic information about you. This helps us create personalized meal recommendations.
      </StepDescription>

      <form id="step1-form" onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            className={errors.username ? 'error' : ''}
            {...register('username', { 
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' }
            })}
          />
          {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
        </FormGroup>

        <TwoColumnGrid>
          <FormGroup>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              className={errors.password ? 'error' : ''}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === watchPassword || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
          </FormGroup>
        </TwoColumnGrid>

        <TwoColumnGrid>
          <FormGroup>
            <Label htmlFor="height">Height (in feet) *</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              placeholder="Enter height in feet"
              className={errors.height ? 'error' : ''}
              {...register('height', { 
                required: 'Height is required',
                valueAsNumber: true,
                min: { value: 1.5, message: 'Height must be at least 1.5 feet' },
                max: { value: 10, message: 'Height must be less than 10 feet' }
              })}
            />
            {errors.height && <ErrorMessage>{errors.height.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="weight">Weight (in pounds) *</Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter weight in pounds"
              className={errors.weight ? 'error' : ''}
              {...register('weight', { 
                required: 'Weight is required',
                valueAsNumber: true,
                min: { value: 44, message: 'Weight must be at least 44 lbs' },
                max: { value: 1100, message: 'Weight must be less than 1100 lbs' }
              })}
            />
            {errors.weight && <ErrorMessage>{errors.weight.message}</ErrorMessage>}
          </FormGroup>
        </TwoColumnGrid>

        <FormGroup>
          <Label htmlFor="activityLevel">Activity Level *</Label>
          <Select
            id="activityLevel"
            className={errors.activityLevel ? 'error' : ''}
            {...register('activityLevel', { required: 'Please select your activity level' })}
          >
            <option value="">Select your activity level</option>
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Select>
          {errors.activityLevel && <ErrorMessage>{errors.activityLevel.message}</ErrorMessage>}
        </FormGroup>
      </form>
    </>
  );
};

export default Step1BasicInformation; 