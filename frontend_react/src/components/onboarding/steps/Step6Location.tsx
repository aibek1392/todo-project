import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateLocation } from '../../../store/onboardingSlice';
import { Location } from '../../../types/onboarding';
import {
  StepTitle,
  StepDescription,
  FormGroup,
  Label,
  Input,
  ErrorMessage
} from '../OnboardingForm.styles';

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
      <StepTitle>Where are you located?</StepTitle>
      <StepDescription>
        Your location helps us suggest local restaurants and seasonal meal options available in your area.
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="zipCodeOrCity">Zip code or City</Label>
          <Input
            id="zipCodeOrCity"
            type="text"
            placeholder="Enter your zip code or city name"
            className={errors.zipCodeOrCity ? 'error' : ''}
            {...register('zipCodeOrCity', { 
              required: 'Please enter your zip code or city',
              minLength: { value: 2, message: 'Location must be at least 2 characters' }
            })}
          />
          {errors.zipCodeOrCity && <ErrorMessage>{errors.zipCodeOrCity.message}</ErrorMessage>}
        </FormGroup>
      </form>
    </>
  );
};

export default Step6Location; 