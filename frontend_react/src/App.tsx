import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthInitializer from './components/common/AuthInitializer';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './components/common/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import TodoList from './components/todos/TodoList';
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
              <Route path="/signup" element={<SignupForm />} />
              
              {/* Protected routes */}
              <Route 
                path="/todos" 
                element={
                  <ProtectedRoute>
                    <TodoList />
                  </ProtectedRoute>
                } 
              />
              
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
