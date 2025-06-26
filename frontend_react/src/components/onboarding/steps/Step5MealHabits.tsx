import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateMealHabits } from '../../../store/onboardingSlice';
import { MealHabits } from '../../../types/onboarding';

interface Step5Props {
  onNext: () => void;
}

const Step5MealHabits: React.FC<Step5Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const mealHabits = useSelector((state: RootState) => state.onboarding.formData.mealHabits);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger
  } = useForm({
    defaultValues: mealHabits,
    mode: 'onChange'
  });

  const onSubmit = (data: any) => {
    dispatch(updateMealHabits(data));
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Meal Habits</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        Understanding your eating patterns helps us create more realistic and personalized meal plans.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="mealsPerDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            How many meals do you typically eat per day?
          </label>
          <select
            id="mealsPerDay"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.mealsPerDay
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            {...register('mealsPerDay', { valueAsNumber: true })}
          >
            <option value="" className="text-gray-500">Select number of meals</option>
            <option value={1}>1 meal</option>
            <option value={2}>2 meals</option>
            <option value={3}>3 meals</option>
            <option value={4}>4 meals</option>
            <option value={5}>5 meals</option>
            <option value={6}>6 meals</option>
            <option value={7}>7 meals</option>
          </select>
          {errors.mealsPerDay && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mealsPerDay.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Do you snack between meals?
            </label>
            <Controller
              name="snacks"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    field.value === true ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}>
                    <input
                      type="radio"
                      className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span className="text-gray-900 dark:text-gray-100">Yes</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    field.value === false ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}>
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Do you cook at home often?
            </label>
            <Controller
              name="cooksOften"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    field.value === true ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}>
                    <input
                      type="radio"
                      className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span className="text-gray-900 dark:text-gray-100">Yes</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    field.value === false ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}>
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
        </div>

        <div className="space-y-2">
          <label htmlFor="foodsDisliked" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Foods you dislike (optional)
          </label>
          <textarea
            id="foodsDisliked"
            placeholder="Tell us about foods you don't enjoy or want to avoid in your meal plans..."
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical min-h-20 ${
              errors.foodsDisliked
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            {...register('foodsDisliked')}
          />
          {errors.foodsDisliked && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.foodsDisliked.message}</p>
          )}
        </div>
      </form>
    </>
  );
};

export default Step5MealHabits; 