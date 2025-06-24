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
  Select,
  CheckboxGroup,
  CheckboxItem,
  Checkbox,
  RadioGroup,
  RadioItem,
  Radio,
  ErrorMessage
} from '../OnboardingForm.styles';

interface Step2Props {
  onNext: () => void;
}

const Step2MedicalConditions: React.FC<Step2Props> = ({ onNext }) => {
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
  const ibdType = watch('ibdType');

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
          <Label>Medical conditions (select all that apply)</Label>
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

        {/* Diabetes follow-up question */}
        {selectedConditions.includes('Diabetes (Type 1 / Type 2)') && (
          <FormGroup>
            <Label>Do you take insulin?</Label>
            <Controller
              name="diabetesInsulin"
              control={control}
              render={({ field }) => (
                <RadioGroup>
                  <RadioItem className={field.value === true ? 'checked' : ''}>
                    <Radio
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span>Yes</span>
                  </RadioItem>
                  <RadioItem className={field.value === false ? 'checked' : ''}>
                    <Radio
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span>No</span>
                  </RadioItem>
                </RadioGroup>
              )}
            />
          </FormGroup>
        )}

        {/* PCOS follow-up question */}
        {selectedConditions.includes('PCOS') && (
          <FormGroup>
            <Label>Are you on hormonal treatment?</Label>
            <Controller
              name="pcosHormonal"
              control={control}
              render={({ field }) => (
                <RadioGroup>
                  <RadioItem className={field.value === true ? 'checked' : ''}>
                    <Radio
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span>Yes</span>
                  </RadioItem>
                  <RadioItem className={field.value === false ? 'checked' : ''}>
                    <Radio
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span>No</span>
                  </RadioItem>
                </RadioGroup>
              )}
            />
          </FormGroup>
        )}

        {/* High blood pressure follow-up question */}
        {selectedConditions.includes('High blood pressure') && (
          <FormGroup>
            <Label>Do you monitor your salt intake?</Label>
            <Controller
              name="hbpSaltIntake"
              control={control}
              render={({ field }) => (
                <RadioGroup>
                  <RadioItem className={field.value === true ? 'checked' : ''}>
                    <Radio
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span>Yes</span>
                  </RadioItem>
                  <RadioItem className={field.value === false ? 'checked' : ''}>
                    <Radio
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span>No</span>
                  </RadioItem>
                </RadioGroup>
              )}
            />
          </FormGroup>
        )}

        {/* IBD follow-up questions */}
        {selectedConditions.includes('IBD (Ulcerative Colitis, Crohn\'s)') && (
          <>
            <FormGroup>
              <Label>Which type?</Label>
              <Controller
                name="ibdType"
                control={control}
                render={({ field }) => (
                  <RadioGroup>
                    <RadioItem className={field.value === 'Ulcerative colitis' ? 'checked' : ''}>
                      <Radio
                        type="radio"
                        checked={field.value === 'Ulcerative colitis'}
                        onChange={() => field.onChange('Ulcerative colitis')}
                      />
                      <span>Ulcerative colitis</span>
                    </RadioItem>
                    <RadioItem className={field.value === 'Crohns' ? 'checked' : ''}>
                      <Radio
                        type="radio"
                        checked={field.value === 'Crohns'}
                        onChange={() => field.onChange('Crohns')}
                      />
                      <span>Crohn's</span>
                    </RadioItem>
                  </RadioGroup>
                )}
              />
            </FormGroup>

            {ibdType === 'Ulcerative colitis' && (
              <FormGroup>
                <Label>Current condition?</Label>
                <Controller
                  name="ucCondition"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup>
                      <RadioItem className={field.value === 'In flare' ? 'checked' : ''}>
                        <Radio
                          type="radio"
                          checked={field.value === 'In flare'}
                          onChange={() => field.onChange('In flare')}
                        />
                        <span>In flare</span>
                      </RadioItem>
                      <RadioItem className={field.value === 'In remission' ? 'checked' : ''}>
                        <Radio
                          type="radio"
                          checked={field.value === 'In remission'}
                          onChange={() => field.onChange('In remission')}
                        />
                        <span>In remission</span>
                      </RadioItem>
                    </RadioGroup>
                  )}
                />
              </FormGroup>
            )}
          </>
        )}

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

export default Step2MedicalConditions; 