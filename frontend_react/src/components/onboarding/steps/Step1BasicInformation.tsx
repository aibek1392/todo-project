import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateBasicInformation } from '../../../store/onboardingSlice';
import { BasicInformation, ACTIVITY_LEVELS } from '../../../types/onboarding';

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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        Let's start with some basic information about you. This helps us create personalized meal recommendations.
      </p>

      <form id="step1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username *
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.username 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            {...register('username', { 
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' }
            })}
          />
          {errors.username && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password *
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.password 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            {errors.password && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.confirmPassword 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === watchPassword || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Height (in feet) *
            </label>
            <input
              id="height"
              type="number"
              step="0.1"
              placeholder="Enter height in feet"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.height 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('height', { 
                required: 'Height is required',
                valueAsNumber: true,
                min: { value: 1.5, message: 'Height must be at least 1.5 feet' },
                max: { value: 10, message: 'Height must be less than 10 feet' }
              })}
            />
            {errors.height && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.height.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Weight (in pounds) *
            </label>
            <input
              id="weight"
              type="number"
              placeholder="Enter weight in pounds"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.weight 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('weight', { 
                required: 'Weight is required',
                valueAsNumber: true,
                min: { value: 44, message: 'Weight must be at least 44 lbs' },
                max: { value: 1100, message: 'Weight must be less than 1100 lbs' }
              })}
            />
            {errors.weight && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.weight.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Activity Level *
          </label>
          <select
            id="activityLevel"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.activityLevel 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            {...register('activityLevel', { required: 'Please select your activity level' })}
          >
            <option value="" className="text-gray-500">Select your activity level</option>
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.activityLevel && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.activityLevel.message}</p>
          )}
        </div>
      </form>
    </>
  );
};

export default Step1BasicInformation; 