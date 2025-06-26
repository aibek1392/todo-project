import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateLocation } from '../../../store/onboardingSlice';
import { Location } from '../../../types/onboarding';

interface Step6Props {
  onNext: () => void;
}

const Step6Location: React.FC<Step6Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const location = useSelector((state: RootState) => state.onboarding.formData.location);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger
  } = useForm({

    defaultValues: location,
    mode: 'onChange'
  });

  const onSubmit = (data: any) => {
    dispatch(updateLocation(data));
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Where are you located?</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        Your location helps us suggest local restaurants and seasonal meal options available in your area.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="zipCodeOrCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Zip code or City
          </label>
          <input
            id="zipCodeOrCity"
            type="text"
            placeholder="Enter your zip code or city name"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.zipCodeOrCity
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            {...register('zipCodeOrCity', { 
              required: 'Please enter your zip code or city',
              minLength: { value: 2, message: 'Location must be at least 2 characters' }
            })}
          />
          {errors.zipCodeOrCity && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.zipCodeOrCity.message}</p>
          )}
        </div>
      </form>
    </>
  );
};

export default Step6Location; 