import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateDietaryPreferences } from '../../../store/onboardingSlice';
import { DietaryPreferences, DIETARY_PREFERENCES_NORMAL, DIETARY_PREFERENCES_CRITICAL } from '../../../types/onboarding';

interface Step4Props {
  onNext: () => void;
}

const Step4DietaryPreferences: React.FC<Step4Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const dietaryPrefs = useSelector((state: RootState) => state.onboarding.formData.dietaryPreferences);
  const medicalConditions = useSelector((state: RootState) => state.onboarding.formData.medicalConditions);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger
  } = useForm({
    defaultValues: dietaryPrefs,
    mode: 'onChange'
  });

  const selectedPreferences = watch('preferences') || [];

  // Determine if user has critical conditions that limit dietary options
  const hasCriticalConditions = useMemo(() => {
    const conditions = medicalConditions.conditions || [];
    return conditions.some(condition => {
      if (condition === 'IBD (Ulcerative Colitis, Crohn\'s)') {
        // Check for UC in flare or Crohn's
        return (medicalConditions.ibdType === 'Ulcerative colitis' && medicalConditions.ucCondition === 'In flare') ||
               medicalConditions.ibdType === 'Crohns';
      }
      return condition === 'Celiac' || condition === 'IBS';
    });
  }, [medicalConditions]);

  // Get appropriate dietary preference options based on medical conditions
  const dietaryOptions = useMemo(() => {
    return hasCriticalConditions ? DIETARY_PREFERENCES_CRITICAL : DIETARY_PREFERENCES_NORMAL;
  }, [hasCriticalConditions]);

  const onSubmit = (data: any) => {
    dispatch(updateDietaryPreferences(data));
    onNext();
  };

  const handleNext = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit(onSubmit)();
    }
  };

  const handlePreferenceChange = (preference: string, checked: boolean, field: any) => {
    const currentPreferences = field.value || [];
    if (checked) {
      field.onChange([...currentPreferences, preference]);
    } else {
      field.onChange(currentPreferences.filter((p: string) => p !== preference));
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">What are your dietary preferences?</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        {hasCriticalConditions ? (
          <>
            Based on your medical conditions, we've filtered the options to those that are most appropriate for your health needs.
            <br />
            <em className="text-orange-600 dark:text-orange-400">⚠️ These options are filtered based on your medical condition to avoid flare triggers.</em>
          </>
        ) : (
          'Select all dietary preferences that apply to you. This helps us recommend suitable meals.'
        )}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Dietary preferences (select all that apply)
          </label>
          <Controller
            name="preferences"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {dietaryOptions.map((preference) => (
                  <label
                    key={preference}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-colors ${
                      selectedPreferences.includes(preference)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded cursor-pointer text-blue-600 focus:ring-blue-500"
                      checked={selectedPreferences.includes(preference)}
                      onChange={(e) => handlePreferenceChange(preference, e.target.checked, field)}
                    />
                    <span className="text-gray-900 dark:text-gray-100">{preference}</span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.preferences && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.preferences.message}</p>
          )}
        </div>

        {selectedPreferences.includes('Custom') && (
          <div className="space-y-2">
            <label htmlFor="customPreference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Describe your custom dietary preference
            </label>
            <input
              id="customPreference"
              type="text"
              placeholder="Tell us about your specific dietary preference..."
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.customPreference
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              {...register('customPreference')}
            />
            {errors.customPreference && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.customPreference.message}</p>
            )}
          </div>
        )}
      </form>
    </>
  );
};

export default Step4DietaryPreferences; 