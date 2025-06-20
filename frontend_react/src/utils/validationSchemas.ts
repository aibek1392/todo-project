import * as yup from 'yup';

export const basicInformationSchema = yup.object().shape({
  name: yup.string().max(100, 'Name must be less than 100 characters'),
  email: yup.string().email('Please enter a valid email address'),
  age: yup.number()
    .positive('Age must be a positive number')
    .integer('Age must be a whole number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age'),
  gender: yup.string().oneOf(['Male', 'Female', 'Other']),
  height: yup.number()
    .positive('Height must be a positive number')
    .min(1.5, 'Height must be at least 1.5 ft')
    .max(10, 'Height must be less than 10 ft'),
  weight: yup.number()
    .positive('Weight must be a positive number')
    .min(44, 'Weight must be at least 44 lb')
    .max(1100, 'Weight must be less than 1100 lb'),
  activityLevel: yup.string().oneOf(['Sedentary', 'Lightly Active', 'Active', 'Very Active'])
});

export const healthGoalSchema = yup.object().shape({
  goal: yup.string()
    .required('Please select a health goal')
    .oneOf([
      'Lose weight',
      'Maintain weight', 
      'Gain weight',
      'Improve digestion',
      'Manage blood sugar',
      'Lower cholesterol',
      'Increase energy',
      'Custom'
    ]),
  customGoal: yup.string().when('goal', {
    is: 'Custom',
    then: (schema) => schema.required('Please specify your custom goal').max(200, 'Goal must be less than 200 characters'),
    otherwise: (schema) => schema.notRequired()
  })
});

export const dietaryPreferencesSchema = yup.object().shape({
  preferences: yup.array().of(yup.string()),
  customPreference: yup.string().when('preferences', {
    is: (preferences: string[]) => preferences?.includes('Custom'),
    then: (schema) => schema.required('Please specify your custom dietary preference').max(100, 'Preference must be less than 100 characters'),
    otherwise: (schema) => schema.notRequired()
  }),
  likedFoods: yup.string().max(500, 'Description must be less than 500 characters')
});

export const allergiesIntolerancesSchema = yup.object().shape({
  allergies: yup.array().of(yup.string()),
  otherAllergy: yup.string().when('allergies', {
    is: (allergies: string[]) => allergies?.includes('Other'),
    then: (schema) => schema.required('Please specify your other allergy/intolerance').max(100, 'Description must be less than 100 characters'),
    otherwise: (schema) => schema.notRequired()
  })
});

export const medicalConditionsSchema = yup.object().shape({
  conditions: yup.array().of(yup.string()),
  otherCondition: yup.string().when('conditions', {
    is: (conditions: string[]) => conditions?.includes('Other'),
    then: (schema) => schema.required('Please specify your other medical condition').max(100, 'Description must be less than 100 characters'),
    otherwise: (schema) => schema.notRequired()
  })
});

export const mealHabitsSchema = yup.object().shape({
  mealsPerDay: yup.number()
    .integer('Number of meals must be a whole number')
    .min(2, 'Must be at least 2 meals per day')
    .max(6, 'Must be no more than 6 meals per day'),
  snacksBetweenMeals: yup.boolean(),
  cookAtHome: yup.boolean(),
  dislikedFoods: yup.string().max(500, 'Description must be less than 500 characters')
});

export const locationSchema = yup.object().shape({
  zipCodeOrCity: yup.string()
    .required('Please enter your zip code or city')
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters')
});

export const menuUploadSchema = yup.object().shape({
  menuImage: yup.mixed<File>()
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return true; // Optional field
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true; // Optional field
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type);
    })
}); 