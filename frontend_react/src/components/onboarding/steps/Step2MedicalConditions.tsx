import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateMedicalConditions, updateAllergiesIntolerances } from '../../../store/onboardingSlice';
import { MedicalConditions, AllergiesIntolerances, MEDICAL_CONDITIONS, ALLERGIES_INTOLERANCES } from '../../../types/onboarding';

// Combined form data type for this step
interface CombinedFormData extends MedicalConditions, AllergiesIntolerances {}

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
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Medical Conditions & Allergies</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          This information helps us provide safe and appropriate meal recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Medical Conditions Section */}
        <div className="mb-3">
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
            Medical conditions (select all that apply)
          </label>
          <Controller
            name="conditions"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                {MEDICAL_CONDITIONS.map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center gap-1.5 cursor-pointer p-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 border-2 border-gray-300 dark:border-gray-600 rounded cursor-pointer text-blue-600 focus:ring-blue-500"
                      checked={selectedConditions.includes(condition)}
                      onChange={(e) => handleConditionChange(condition, e.target.checked, field)}
                    />
                    <span className="text-gray-900 dark:text-gray-100">{condition}</span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.conditions && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.conditions.message}</p>
          )}
        </div>

        {/* Conditional Medical Questions in Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {/* Diabetes follow-up */}
          {selectedConditions.includes('Diabetes (Type 1 / Type 2)') && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                Do you take insulin?
              </label>
              <Controller
                name="diabetesInsulin"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                      />
                      <span className="text-gray-900 dark:text-gray-100">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                      />
                      <span className="text-gray-900 dark:text-gray-100">No</span>
                    </label>
                  </div>
                )}
              />
            </div>
          )}

          {/* PCOS follow-up */}
          {selectedConditions.includes('PCOS') && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                Are you on hormonal treatment?
              </label>
              <Controller
                name="pcosHormonal"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                      />
                      <span className="text-gray-900 dark:text-gray-100">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                      />
                      <span className="text-gray-900 dark:text-gray-100">No</span>
                    </label>
                  </div>
                )}
              />
            </div>
          )}

          {/* High blood pressure follow-up */}
          {selectedConditions.includes('High blood pressure') && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                Do you monitor your salt intake?
              </label>
              <Controller
                name="hbpSaltIntake"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                      />
                      <span className="text-gray-900 dark:text-gray-100">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                      />
                      <span className="text-gray-900 dark:text-gray-100">No</span>
                    </label>
                  </div>
                )}
              />
            </div>
          )}
        </div>

        {/* IBD follow-up questions */}
        {selectedConditions.includes('IBD (Ulcerative Colitis, Crohn\'s)') && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                Which type?
              </label>
              <Controller
                name="ibdType"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === 'Ulcerative colitis'}
                        onChange={() => field.onChange('Ulcerative colitis')}
                      />
                      <span className="text-gray-900 dark:text-gray-100">Ulcerative colitis</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                        checked={field.value === 'Crohns'}
                        onChange={() => field.onChange('Crohns')}
                      />
                      <span className="text-gray-900 dark:text-gray-100">Crohn's</span>
                    </label>
                  </div>
                )}
              />
            </div>

            {ibdType === 'Ulcerative colitis' && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
                <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Current condition?
                </label>
                <Controller
                  name="ucCondition"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="radio"
                          className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                          checked={field.value === 'In flare'}
                          onChange={() => field.onChange('In flare')}
                        />
                        <span className="text-gray-900 dark:text-gray-100">In flare</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="radio"
                          className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                          checked={field.value === 'In remission'}
                          onChange={() => field.onChange('In remission')}
                        />
                        <span className="text-gray-900 dark:text-gray-100">In remission</span>
                      </label>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        {selectedConditions.includes('Other') && (
          <div className="mb-3">
            <label htmlFor="otherCondition" className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Describe your other medical condition
            </label>
            <input
              id="otherCondition"
              type="text"
              placeholder="Please specify your other medical condition..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              {...register('otherCondition')}
            />
            {errors.otherCondition && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.otherCondition.message}</p>
            )}
          </div>
        )}

        {/* Collapsible Allergies Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-2">
          <button
            type="button"
            className="w-full bg-gray-50 dark:bg-gray-800 border-none p-3 px-4 text-left cursor-pointer flex justify-between items-center font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsAllergiesOpen(!isAllergiesOpen)}
          >
            <span>🚫 Allergies & Intolerances {selectedAllergies.length > 0 && `(${selectedAllergies.length} selected)`}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isAllergiesOpen ? 'rotate-180' : 'rotate-0'}`}
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900 ${isAllergiesOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="p-4">
              <Controller
                name="allergies"
                control={control}
                render={({ field }) => (
                  <>
                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      Quick select common allergies:
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {commonAllergies.map((allergy) => (
                        <button
                          key={allergy}
                          type="button"
                          className={`px-3 py-1 text-xs cursor-pointer transition-all rounded-full border ${
                            selectedAllergies.includes(allergy)
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => toggleQuickAllergy(allergy, field)}
                        >
                          {allergy}
                        </button>
                      ))}
                    </div>
                    
                    <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm mt-3">
                      All allergies and intolerances:
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                      {ALLERGIES_INTOLERANCES.map((allergy) => (
                        <label key={allergy} className="flex items-center gap-1.5 cursor-pointer p-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 border-2 border-gray-300 dark:border-gray-600 rounded cursor-pointer text-blue-600 focus:ring-blue-500"
                            checked={selectedAllergies.includes(allergy)}
                            onChange={(e) => handleAllergyChange(allergy, e.target.checked, field)}
                          />
                          <span className="text-gray-900 dark:text-gray-100">{allergy}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              />

              {selectedAllergies.includes('Other') && (
                <div className="mt-3">
                  <label htmlFor="otherAllergy" className="block mb-1 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                    Describe your other allergy/intolerance
                  </label>
                  <input
                    id="otherAllergy"
                    type="text"
                    placeholder="Please specify your other allergy or intolerance..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    {...register('otherAllergy')}
                  />
                  {errors.otherAllergy && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.otherAllergy.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Step2MedicalConditions; 