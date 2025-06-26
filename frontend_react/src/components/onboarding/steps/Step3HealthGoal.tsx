import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateHealthGoal } from '../../../store/onboardingSlice';
import { HealthGoal, HEALTH_GOALS_NORMAL, HEALTH_GOALS_CRITICAL } from '../../../types/onboarding';

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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What's your main health goal?</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        {hasCriticalConditions ? (
          <>
            Based on your medical conditions, we've filtered the options to those that are most appropriate for your health needs.
            <br />
            <em className="text-gray-500 dark:text-gray-500">Note: Options like "Lose weight", "Gain weight", and "Intermittent fasting" are hidden to avoid potential flare triggers.</em>
          </>
        ) : (
          'Choose the primary goal that best describes what you want to achieve with your meal planning.'
        )}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select your health goal
          </label>
          <Controller
            name="goal"
            control={control}
            rules={{ required: 'Please select a health goal' }}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {healthGoalOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                      field.value === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={field.value === option.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xl mr-2">{option.emoji}</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.goal && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.goal.message}</p>
          )}
        </div>

        {selectedGoal === 'Other' && (
          <div className="space-y-2">
            <label htmlFor="customGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Describe your custom goal
            </label>
            <input
              id="customGoal"
              type="text"
              placeholder="Tell us about your specific health goal..."
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.customGoal 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('customGoal')}
            />
            {errors.customGoal && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.customGoal.message}</p>
            )}
          </div>
        )}
      </form>
    </>
  );
};

export default Step3HealthGoal; 