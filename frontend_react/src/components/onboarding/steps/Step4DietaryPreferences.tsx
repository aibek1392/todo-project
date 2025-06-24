import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateDietaryPreferences } from '../../../store/onboardingSlice';
import { DietaryPreferences, DIETARY_PREFERENCES_NORMAL, DIETARY_PREFERENCES_CRITICAL } from '../../../types/onboarding';
import {
  StepTitle,
  StepDescription,
  FormGroup,
  Label,
  Input,
  TextArea,
  CheckboxGroup,
  CheckboxItem,
  Checkbox,
  ErrorMessage
} from '../OnboardingForm.styles';

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
      <StepTitle>What are your dietary preferences?</StepTitle>
      <StepDescription>
        {hasCriticalConditions ? (
          <>
            Based on your medical conditions, we've filtered the options to those that are most appropriate for your health needs.
            <br />
            <em>⚠️ These options are filtered based on your medical condition to avoid flare triggers.</em>
          </>
        ) : (
          'Select all dietary preferences that apply to you. This helps us recommend suitable meals.'
        )}
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Dietary preferences (select all that apply)</Label>
          <Controller
            name="preferences"
            control={control}
            render={({ field }) => (
              <CheckboxGroup>
                {dietaryOptions.map((preference) => (
                  <CheckboxItem
                    key={preference}
                    className={selectedPreferences.includes(preference) ? 'checked' : ''}
                  >
                    <Checkbox
                      checked={selectedPreferences.includes(preference)}
                      onChange={(e) => handlePreferenceChange(preference, e.target.checked, field)}
                    />
                    <span>{preference}</span>
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            )}
          />
          {errors.preferences && <ErrorMessage>{errors.preferences.message}</ErrorMessage>}
        </FormGroup>

        {selectedPreferences.includes('Custom') && (
          <FormGroup>
            <Label htmlFor="customPreference">Describe your custom dietary preference</Label>
            <Input
              id="customPreference"
              type="text"
              placeholder="Tell us about your specific dietary preference..."
              className={errors.customPreference ? 'error' : ''}
              {...register('customPreference')}
            />
            {errors.customPreference && <ErrorMessage>{errors.customPreference.message}</ErrorMessage>}
          </FormGroup>
        )}
      </form>
    </>
  );
};

export default Step4DietaryPreferences; 