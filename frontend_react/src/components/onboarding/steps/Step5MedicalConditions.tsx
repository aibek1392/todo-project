import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateMedicalConditions } from '../../../store/onboardingSlice';
import { MedicalConditions, MEDICAL_CONDITIONS } from '../../../types/onboarding';
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

interface Step5Props {
  onNext: () => void;
}

const Step5MedicalConditions: React.FC<Step5Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const conditions = useSelector((state: RootState) => state.onboarding.formData.medicalConditions);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    trigger
  } = useForm({

    defaultValues: conditions,
    mode: 'onChange'
  });

  const selectedConditions = watch('conditions') || [];

  const onSubmit = (data: any) => {
    dispatch(updateMedicalConditions(data));
    onNext();
  };

  const handleNext = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit(onSubmit)();
    }
  };

  const handleConditionChange = (condition: string, checked: boolean, field: any) => {
    const currentConditions = field.value || [];
    if (checked) {
      // If selecting "None", clear all other selections
      if (condition === 'None') {
        field.onChange(['None']);
      } else {
        // If selecting any other condition, remove "None" if it was selected
        const filteredConditions = currentConditions.filter((c: string) => c !== 'None');
        field.onChange([...filteredConditions, condition]);
      }
    } else {
      field.onChange(currentConditions.filter((c: string) => c !== condition));
    }
  };

  return (
    <>
      <StepTitle>Do you have any medical conditions?</StepTitle>
      <StepDescription>
        This information helps us provide more appropriate meal recommendations for your health needs.
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Medical conditions / GI issues (select all that apply)</Label>
          <Controller
            name="conditions"
            control={control}
            render={({ field }) => (
              <CheckboxGroup>
                {MEDICAL_CONDITIONS.map((condition) => (
                  <CheckboxItem
                    key={condition}
                    className={selectedConditions.includes(condition) ? 'checked' : ''}
                  >
                    <Checkbox
                      checked={selectedConditions.includes(condition)}
                      onChange={(e) => handleConditionChange(condition, e.target.checked, field)}
                    />
                    <span>{condition}</span>
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            )}
          />
          {errors.conditions && <ErrorMessage>{errors.conditions.message}</ErrorMessage>}
        </FormGroup>

        {selectedConditions.includes('Other') && (
          <FormGroup>
            <Label htmlFor="otherCondition">Describe your other medical condition</Label>
            <Input
              id="otherCondition"
              type="text"
              placeholder="Please specify your other medical condition..."
              className={errors.otherCondition ? 'error' : ''}
              {...register('otherCondition')}
            />
            {errors.otherCondition && <ErrorMessage>{errors.otherCondition.message}</ErrorMessage>}
          </FormGroup>
        )}
      </form>
    </>
  );
};

export default Step5MedicalConditions; 