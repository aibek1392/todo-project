import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateMealHabits } from '../../../store/onboardingSlice';
import { MealHabits } from '../../../types/onboarding';
import {
  StepTitle,
  StepDescription,
  FormGroup,
  Label,
  Select,
  Textarea,
  RadioGroup,
  RadioItem,
  Radio,
  ErrorMessage,
  TwoColumnGrid
} from '../OnboardingForm.styles';

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
      <StepTitle>Meal Habits</StepTitle>
      <StepDescription>
        Understanding your eating patterns helps us create more realistic and personalized meal plans.
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="mealsPerDay">How many meals do you typically eat per day?</Label>
          <Select
            id="mealsPerDay"
            className={errors.mealsPerDay ? 'error' : ''}
            {...register('mealsPerDay', { valueAsNumber: true })}
          >
            <option value="">Select number of meals</option>
            <option value={1}>1 meal</option>
            <option value={2}>2 meals</option>
            <option value={3}>3 meals</option>
            <option value={4}>4 meals</option>
            <option value={5}>5 meals</option>
            <option value={6}>6 meals</option>
            <option value={7}>7 meals</option>
          </Select>
          {errors.mealsPerDay && <ErrorMessage>{errors.mealsPerDay.message}</ErrorMessage>}
        </FormGroup>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Do you snack between meals?</Label>
            <Controller
              name="snacks"
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

          <FormGroup>
            <Label>Do you cook at home often?</Label>
            <Controller
              name="cooksOften"
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
        </TwoColumnGrid>

        <FormGroup>
          <Label htmlFor="foodsDisliked">Foods you dislike (optional)</Label>
          <Textarea
            id="foodsDisliked"
            placeholder="Tell us about foods you don't enjoy or want to avoid in your meal plans..."
            className={errors.foodsDisliked ? 'error' : ''}
            {...register('foodsDisliked')}
          />
          {errors.foodsDisliked && <ErrorMessage>{errors.foodsDisliked.message}</ErrorMessage>}
        </FormGroup>
      </form>
    </>
  );
};

export default Step5MealHabits; 