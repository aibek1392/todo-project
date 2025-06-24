import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateMedicalConditions, updateAllergiesIntolerances } from '../../../store/onboardingSlice';
import { MedicalConditions, AllergiesIntolerances, MEDICAL_CONDITIONS, ALLERGIES_INTOLERANCES } from '../../../types/onboarding';
import styled from 'styled-components';
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

// Combined form data type for this step
interface CombinedFormData extends MedicalConditions, AllergiesIntolerances {}

// Styled components for responsive layout
const CompactContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
`;

const CompactSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #667eea;
`;

const CollapsibleSection = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 8px;
`;

const CollapsibleHeader = styled.button`
  width: 100%;
  background: #f8f9fa;
  border: none;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
`;

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: white;
`;

const CollapsibleInner = styled.div`
  padding: 16px;
`;

const ChevronIcon = styled.svg<{ isOpen: boolean }>`
  width: 16px;
  height: 16px;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const CompactCheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  
  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const CompactCheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 13px;

  &:hover {
    background: #f8f9fa;
  }
`;

const CompactCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 14px;
  height: 14px;
  border: 2px solid #e1e5e9;
  border-radius: 3px;
  cursor: pointer;
`;

const CompactFormGroup = styled.div`
  margin-bottom: 12px;
`;

const CompactLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: #333;
  font-size: 13px;
`;

const QuickSelect = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const QuickSelectTag = styled.button<{ selected: boolean }>`
  background: ${props => props.selected ? '#667eea' : '#f1f3f4'};
  color: ${props => props.selected ? 'white' : '#333'};
  border: 1px solid ${props => props.selected ? '#667eea' : '#ddd'};
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.selected ? '#5a6fd8' : '#e9ecef'};
  }
`;

interface Step2Props {
  onNext: () => void;
}

const Step2MedicalConditions: React.FC<Step2Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const conditions = useSelector((state: RootState) => state.onboarding.formData.medicalConditions);
  const allergies = useSelector((state: RootState) => state.onboarding.formData.allergiesIntolerances);
  const [isAllergiesOpen, setIsAllergiesOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm<CombinedFormData>({
    defaultValues: { 
      ...conditions, 
      allergies: allergies.allergies || [],
      otherAllergy: allergies.otherAllergy || ''
    },
    mode: 'onChange'
  });

  const selectedConditions = watch('conditions') || [];
  const selectedAllergies = watch('allergies') || [];
  const ibdType = watch('ibdType');

  const onSubmit = (data: CombinedFormData) => {
    // Separate allergies data
    const { allergies: allergyData, otherAllergy, ...medicalData } = data;
    
    dispatch(updateMedicalConditions(medicalData));
    dispatch(updateAllergiesIntolerances({ 
      allergies: allergyData || [],
      otherAllergy: otherAllergy 
    }));
    onNext();
  };

  const handleNext = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit(onSubmit)();
    }
  };

  const handleConditionChange = (condition: string, checked: boolean, field: { value: string[]; onChange: (value: string[]) => void }) => {
    const currentConditions = field.value || [];
    if (checked) {
      if (condition === 'None') {
        field.onChange(['None']);
      } else {
        const filteredConditions = currentConditions.filter((c: string) => c !== 'None');
        field.onChange([...filteredConditions, condition]);
      }
    } else {
      field.onChange(currentConditions.filter((c: string) => c !== condition));
    }
  };

  const handleAllergyChange = (allergy: string, checked: boolean, field: { value: string[]; onChange: (value: string[]) => void }) => {
    const currentAllergies = field.value || [];
    if (checked) {
      field.onChange([...currentAllergies, allergy]);
    } else {
      field.onChange(currentAllergies.filter((a: string) => a !== allergy));
    }
  };

  const toggleQuickAllergy = (allergy: string, field: { value: string[]; onChange: (value: string[]) => void }) => {
    const currentAllergies = field.value || [];
    const isSelected = currentAllergies.includes(allergy);
    
    if (isSelected) {
      field.onChange(currentAllergies.filter((a: string) => a !== allergy));
    } else {
      field.onChange([...currentAllergies, allergy]);
    }
  };

  const commonAllergies = ['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy'];

  return (
    <CompactContainer>
      <div>
        <StepTitle>Medical Conditions & Allergies</StepTitle>
        <StepDescription>
          This information helps us provide safe and appropriate meal recommendations.
        </StepDescription>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Medical Conditions Section */}
        <CompactFormGroup>
          <CompactLabel>Medical conditions (select all that apply)</CompactLabel>
          <Controller
            name="conditions"
            control={control}
            render={({ field }) => (
              <CompactCheckboxGroup>
                {MEDICAL_CONDITIONS.map((condition) => (
                  <CompactCheckboxItem
                    key={condition}
                  >
                    <CompactCheckbox
                      checked={selectedConditions.includes(condition)}
                      onChange={(e) => handleConditionChange(condition, e.target.checked, field)}
                    />
                    <span>{condition}</span>
                  </CompactCheckboxItem>
                ))}
              </CompactCheckboxGroup>
            )}
          />
          {errors.conditions && <ErrorMessage>{errors.conditions.message}</ErrorMessage>}
        </CompactFormGroup>

        {/* Conditional Medical Questions in Grid */}
        <SectionGrid>
          {/* Diabetes follow-up */}
          {selectedConditions.includes('Diabetes (Type 1 / Type 2)') && (
            <CompactSection>
              <CompactLabel>Do you take insulin?</CompactLabel>
              <Controller
                name="diabetesInsulin"
                control={control}
                render={({ field }) => (
                  <RadioGroup>
                    <RadioItem>
                      <Radio
                        type="radio"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                      />
                      <span>Yes</span>
                    </RadioItem>
                    <RadioItem>
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
            </CompactSection>
          )}

          {/* PCOS follow-up */}
          {selectedConditions.includes('PCOS') && (
            <CompactSection>
              <CompactLabel>Are you on hormonal treatment?</CompactLabel>
              <Controller
                name="pcosHormonal"
                control={control}
                render={({ field }) => (
                  <RadioGroup>
                    <RadioItem>
                      <Radio
                        type="radio"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                      />
                      <span>Yes</span>
                    </RadioItem>
                    <RadioItem>
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
            </CompactSection>
          )}

          {/* High blood pressure follow-up */}
          {selectedConditions.includes('High blood pressure') && (
            <CompactSection>
              <CompactLabel>Do you monitor your salt intake?</CompactLabel>
              <Controller
                name="hbpSaltIntake"
                control={control}
                render={({ field }) => (
                  <RadioGroup>
                    <RadioItem>
                      <Radio
                        type="radio"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                      />
                      <span>Yes</span>
                    </RadioItem>
                    <RadioItem>
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
            </CompactSection>
          )}
        </SectionGrid>

        {/* IBD follow-up questions */}
        {selectedConditions.includes('IBD (Ulcerative Colitis, Crohn\'s)') && (
          <SectionGrid>
            <CompactSection>
              <CompactLabel>Which type?</CompactLabel>
              <Controller
                name="ibdType"
                control={control}
                render={({ field }) => (
                  <RadioGroup>
                    <RadioItem>
                      <Radio
                        type="radio"
                        checked={field.value === 'Ulcerative colitis'}
                        onChange={() => field.onChange('Ulcerative colitis')}
                      />
                      <span>Ulcerative colitis</span>
                    </RadioItem>
                    <RadioItem>
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
            </CompactSection>

            {ibdType === 'Ulcerative colitis' && (
              <CompactSection>
                <CompactLabel>Current condition?</CompactLabel>
                <Controller
                  name="ucCondition"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup>
                      <RadioItem>
                        <Radio
                          type="radio"
                          checked={field.value === 'In flare'}
                          onChange={() => field.onChange('In flare')}
                        />
                        <span>In flare</span>
                      </RadioItem>
                      <RadioItem>
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
              </CompactSection>
            )}
          </SectionGrid>
        )}

        {selectedConditions.includes('Other') && (
          <CompactFormGroup>
            <CompactLabel htmlFor="otherCondition">Describe your other medical condition</CompactLabel>
            <Input
              id="otherCondition"
              type="text"
              placeholder="Please specify your other medical condition..."
              {...register('otherCondition')}
            />
            {errors.otherCondition && <ErrorMessage>{errors.otherCondition.message}</ErrorMessage>}
          </CompactFormGroup>
        )}

        {/* Collapsible Allergies Section */}
        <CollapsibleSection>
          <CollapsibleHeader
            type="button"
            onClick={() => setIsAllergiesOpen(!isAllergiesOpen)}
          >
            <span>🚫 Allergies & Intolerances {selectedAllergies.length > 0 && `(${selectedAllergies.length} selected)`}</span>
            <ChevronIcon isOpen={isAllergiesOpen} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </ChevronIcon>
          </CollapsibleHeader>
          
          <CollapsibleContent isOpen={isAllergiesOpen}>
            <CollapsibleInner>
              <Controller
                name="allergies"
                control={control}
                render={({ field }) => (
                  <>
                    <CompactLabel>Quick select common allergies:</CompactLabel>
                    <QuickSelect>
                      {commonAllergies.map((allergy) => (
                        <QuickSelectTag
                          key={allergy}
                          type="button"
                          selected={selectedAllergies.includes(allergy)}
                          onClick={() => toggleQuickAllergy(allergy, field)}
                        >
                          {allergy}
                        </QuickSelectTag>
                      ))}
                    </QuickSelect>
                    
                    <CompactLabel style={{ marginTop: '12px' }}>All allergies and intolerances:</CompactLabel>
                    <CompactCheckboxGroup>
                      {ALLERGIES_INTOLERANCES.map((allergy) => (
                        <CompactCheckboxItem key={allergy}>
                          <CompactCheckbox
                            checked={selectedAllergies.includes(allergy)}
                            onChange={(e) => handleAllergyChange(allergy, e.target.checked, field)}
                          />
                          <span>{allergy}</span>
                        </CompactCheckboxItem>
                      ))}
                    </CompactCheckboxGroup>
                  </>
                )}
              />

              {selectedAllergies.includes('Other') && (
                <CompactFormGroup style={{ marginTop: '12px' }}>
                  <CompactLabel htmlFor="otherAllergy">Describe your other allergy/intolerance</CompactLabel>
                  <Input
                    id="otherAllergy"
                    type="text"
                    placeholder="Please specify your other allergy or intolerance..."
                    {...register('otherAllergy')}
                  />
                  {errors.otherAllergy && <ErrorMessage>{errors.otherAllergy.message}</ErrorMessage>}
                </CompactFormGroup>
              )}
            </CollapsibleInner>
          </CollapsibleContent>
        </CollapsibleSection>
      </form>
    </CompactContainer>
  );
};

export default Step2MedicalConditions; 