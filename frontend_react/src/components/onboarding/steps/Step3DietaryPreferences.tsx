import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateDietaryPreferences } from '../../../store/onboardingSlice';
import { DietaryPreferences, DIETARY_PREFERENCES } from '../../../types/onboarding';
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

interface Step3Props {
  onNext: () => void;
}

const Step3DietaryPreferences: React.FC<Step3Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const dietaryPrefs = useSelector((state: RootState) => state.onboarding.formData.dietaryPreferences);

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
        Select all dietary preferences that apply to you. This helps us recommend suitable meals.
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Dietary preferences (select all that apply)</Label>
          <Controller
            name="preferences"
            control={control}
            render={({ field }) => (
              <CheckboxGroup>
                {DIETARY_PREFERENCES.map((preference) => (
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

        <FormGroup>
          <Label htmlFor="likedFoods">Foods you like or want included (optional)</Label>
          <TextArea
            id="likedFoods"
            placeholder="Tell us about foods you enjoy or would like to see more of in your meal plans..."
            className={errors.likedFoods ? 'error' : ''}
            {...register('likedFoods')}
          />
          {errors.likedFoods && <ErrorMessage>{errors.likedFoods.message}</ErrorMessage>}
        </FormGroup>
      </form>
    </>
  );
};

export default Step3DietaryPreferences; 