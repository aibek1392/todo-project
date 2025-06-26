import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthInitializer from './components/common/AuthInitializer';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './components/common/LandingPage';
import LoginForm from './components/auth/LoginForm';
import TodoList from './components/todos/TodoList';
import Dashboard from './components/dashboard/Dashboard';
import MyMealPlan from './components/mealplan/MyMealPlan';
import OnboardingForm from './components/onboarding/OnboardingForm';
import TestProfileUpdate from './components/TestProfileUpdate';
import DebugAuth from './components/DebugAuth';
import { MealPlanDisplay } from './components/mealplan';
import { ToastProvider } from './hooks/useToast';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthInitializer>
          <Router>
          <div className="App min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginForm />} />
              
              {/* Onboarding route */}
              <Route path="/onboarding" element={<OnboardingForm />} />
              
              {/* Test route for API testing */}
              <Route path="/test-profile" element={<TestProfileUpdate />} />
              
              {/* Debug route */}
              <Route path="/debug" element={<DebugAuth />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/my-meal-plan" 
                element={
                  <ProtectedRoute>
                    <MyMealPlan />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/meals" 
                element={
                  <ProtectedRoute>
                    <MealPlanDisplay />
                  </ProtectedRoute>
                } 
              />
              
              {/* Todos route for testing */}
              <Route 
                path="/todos-test" 
                element={
                  <ProtectedRoute>
                    <TodoList />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect /todos to dashboard */}
              <Route path="/todos" element={<Navigate to="/dashboard" replace />} />
              
              {/* Legacy signup redirect */}
              <Route path="/signup" element={<Navigate to="/onboarding" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthInitializer>
      </ToastProvider>
    </Provider>
  );
};

export default App;
