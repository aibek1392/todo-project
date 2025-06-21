import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthInitializer from './components/common/AuthInitializer';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './components/common/LandingPage';
import LoginForm from './components/auth/LoginForm';
import TodoList from './components/todos/TodoList';
import OnboardingForm from './components/onboarding/OnboardingForm';
import TestProfileUpdate from './components/TestProfileUpdate';
import DebugAuth from './components/DebugAuth';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <Router>
          <div className="App">
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
                path="/meals" 
                element={
                  <ProtectedRoute>
                    <TodoList />
                  </ProtectedRoute>
                } 
              />
              
              {/* Legacy redirect */}
              <Route path="/todos" element={<Navigate to="/meals" replace />} />
              
              {/* Legacy signup redirect */}
              <Route path="/signup" element={<Navigate to="/onboarding" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthInitializer>
    </Provider>
  );
};

export default App;
