import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getCurrentUser } from '../../store/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading } = useAppSelector((state) => state.auth);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    // If we have a token but no user, try to get the current user
    if (token && !user && !isLoading && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user, isLoading, hasAttemptedFetch]);

  // Show loading while checking authentication or initializing
  if (isLoading || (token && !user && !hasAttemptedFetch)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists but user fetch failed after attempting, redirect to login
  if (token && !user && hasAttemptedFetch && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render children
  if (token && user) {
    return <>{children}</>;
  }

  // Still loading or waiting for user data
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      Loading...
    </div>
  );
};

export default ProtectedRoute; 