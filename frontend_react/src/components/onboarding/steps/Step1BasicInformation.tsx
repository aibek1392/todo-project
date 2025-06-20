import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateBasicInformation } from '../../../store/onboardingSlice';
import { BasicInformation } from '../../../types/onboarding';
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
      <StepTitle>Create Your Account</StepTitle>
      <StepDescription>
        Let's start by creating your account and getting some basic information about you. 
        This helps us create personalized meal recommendations.
      </StepDescription>

      <form id="step1-form" onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            className={errors.name ? 'error' : ''}
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className={errors.email ? 'error' : ''}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
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
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              className={errors.age ? 'error' : ''}
              {...register('age', { 
                valueAsNumber: true,
                min: { value: 13, message: 'You must be at least 13 years old' },
                max: { value: 120, message: 'Please enter a valid age' }
              })}
            />
            {errors.age && <ErrorMessage>{errors.age.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="gender">Gender</Label>
            <Select
              id="gender"
              className={errors.gender ? 'error' : ''}
              {...register('gender')}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            {errors.gender && <ErrorMessage>{errors.gender.message}</ErrorMessage>}
          </FormGroup>
        </TwoColumnGrid>

        <TwoColumnGrid>
          <FormGroup>
            <Label htmlFor="height">Height (ft)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              placeholder="Enter height in feet"
              className={errors.height ? 'error' : ''}
              {...register('height', { 
                valueAsNumber: true,
                min: { value: 1.5, message: 'Height must be at least 1.5 feet' },
                max: { value: 10, message: 'Height must be less than 10 feet' }
              })}
            />
            {errors.height && <ErrorMessage>{errors.height.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="weight">Weight (lb)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter weight in pounds"
              className={errors.weight ? 'error' : ''}
              {...register('weight', { 
                valueAsNumber: true,
                min: { value: 44, message: 'Weight must be at least 44 lbs' },
                max: { value: 1100, message: 'Weight must be less than 1100 lbs' }
              })}
            />
            {errors.weight && <ErrorMessage>{errors.weight.message}</ErrorMessage>}
          </FormGroup>
        </TwoColumnGrid>

        <FormGroup>
          <Label htmlFor="activityLevel">Activity Level</Label>
          <Select
            id="activityLevel"
            className={errors.activityLevel ? 'error' : ''}
            {...register('activityLevel')}
          >
            <option value="">Select activity level</option>
            <option value="Sedentary">Sedentary (little to no exercise)</option>
            <option value="Lightly Active">Lightly Active (light exercise 1-3 days/week)</option>
            <option value="Active">Active (moderate exercise 3-5 days/week)</option>
            <option value="Very Active">Very Active (hard exercise 6-7 days/week)</option>
          </Select>
          {errors.activityLevel && <ErrorMessage>{errors.activityLevel.message}</ErrorMessage>}
        </FormGroup>
      </form>
    </>
  );
};

export default Step1BasicInformation; 