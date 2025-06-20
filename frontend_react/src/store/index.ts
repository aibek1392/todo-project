import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import todoReducer from './todoSlice';
import onboardingReducer from './onboardingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todoReducer,
    onboarding: onboardingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 