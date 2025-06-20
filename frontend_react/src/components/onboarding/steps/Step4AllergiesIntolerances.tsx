import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateAllergiesIntolerances } from '../../../store/onboardingSlice';
import { AllergiesIntolerances, ALLERGIES_INTOLERANCES } from '../../../types/onboarding';
import {
  StepTitle,
  StepDescription,
  FormGroup,
  Label,
  Input,
  CheckboxGroup,
  CheckboxItem,
  Checkbox,
  ErrorMessage
} from '../OnboardingForm.styles';

interface Step4Props {
  onNext: () => void;
}

const Step4AllergiesIntolerances: React.FC<Step4Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const allergies = useSelector((state: RootState) => state.onboarding.formData.allergiesIntolerances);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger
  } = useForm({

    defaultValues: allergies,
    mode: 'onChange'
  });

  const selectedAllergies = watch('allergies') || [];

  const onSubmit = (data: any) => {
    dispatch(updateAllergiesIntolerances(data));
    onNext();
  };

  const handleNext = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit(onSubmit)();
    }
  };

  const handleAllergyChange = (allergy: string, checked: boolean, field: any) => {
    const currentAllergies = field.value || [];
    if (checked) {
      field.onChange([...currentAllergies, allergy]);
    } else {
      field.onChange(currentAllergies.filter((a: string) => a !== allergy));
    }
  };

  return (
    <>
      <StepTitle>Do you have any allergies or intolerances?</StepTitle>
      <StepDescription>
        Let us know about any food allergies or intolerances so we can avoid recommending unsuitable meals.
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Allergies and intolerances (select all that apply)</Label>
          <Controller
            name="allergies"
            control={control}
            render={({ field }) => (
              <CheckboxGroup>
                {ALLERGIES_INTOLERANCES.map((allergy) => (
                  <CheckboxItem
                    key={allergy}
                    className={selectedAllergies.includes(allergy) ? 'checked' : ''}
                  >
                    <Checkbox
                      checked={selectedAllergies.includes(allergy)}
                      onChange={(e) => handleAllergyChange(allergy, e.target.checked, field)}
                    />
                    <span>{allergy}</span>
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            )}
          />
          {errors.allergies && <ErrorMessage>{errors.allergies.message}</ErrorMessage>}
        </FormGroup>

        {selectedAllergies.includes('Other') && (
          <FormGroup>
            <Label htmlFor="otherAllergy">Describe your other allergy/intolerance</Label>
            <Input
              id="otherAllergy"
              type="text"
              placeholder="Please specify your other allergy or intolerance..."
              className={errors.otherAllergy ? 'error' : ''}
              {...register('otherAllergy')}
            />
            {errors.otherAllergy && <ErrorMessage>{errors.otherAllergy.message}</ErrorMessage>}
          </FormGroup>
        )}
      </form>
    </>
  );
};

export default Step4AllergiesIntolerances; 