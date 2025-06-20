import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { userProfileAPI } from '../services/api';
import { OnboardingFormData } from '../types/onboarding';

const TestProfileUpdate: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const currentUser = useSelector((state: RootState) => state.auth?.user);

  const testData: OnboardingFormData = {
    basicInformation: {
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      gender: 'Male',
      height: 5.8, // 5 feet 8 inches
      weight: 160, // pounds
      activityLevel: 'Active'
    },
    healthGoal: {
      goal: 'Lose weight'
    },
    dietaryPreferences: {
      preferences: ['Vegetarian', 'Low FODMAP'],
      likedFoods: 'avocado, chicken, salmon'
    },
    allergiesIntolerances: {
      allergies: ['Gluten / Wheat', 'Dairy / Lactose']
    },
    medicalConditions: {
      conditions: ['IBS', 'GERD / Acid reflux']
    },
    mealHabits: {
      mealsPerDay: 3,
      snacksBetweenMeals: true,
      cookAtHome: false,
      dislikedFoods: 'broccoli, mushrooms'
    },
    location: {
      zipCodeOrCity: 'New York, NY'
    },
    menuUpload: {}
  };

  const handleTestAPI = async () => {
    if (!currentUser?.id) {
      setError('Please log in first to test the API');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await userProfileAPI.createProfile(testData);
      setResult(JSON.stringify(response, null, 2));
      console.log('API Response:', response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetProfile = async () => {
    if (!currentUser?.id) {
      setError('Please log in first to test the API');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await userProfileAPI.getProfile();
      setResult(JSON.stringify(response, null, 2));
      console.log('Get Profile Response:', response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
      setError(errorMessage);
      console.error('Get Profile Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWithPartialData = async () => {
    if (!currentUser?.id) {
      setError('Please log in first to test the API');
      return;
    }

    const partialData: OnboardingFormData = {
      basicInformation: {
        name: 'Test User Partial',
        age: 26,
        weight: 155
      },
      healthGoal: { goal: 'Maintain weight' },
      dietaryPreferences: { preferences: [] },
      allergiesIntolerances: { allergies: [] },
      medicalConditions: { conditions: [] },
      mealHabits: {},
      location: { zipCodeOrCity: 'Los Angeles, CA' },
      menuUpload: {}
    };

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await userProfileAPI.createProfile(partialData);
      setResult(JSON.stringify(response, null, 2));
      console.log('Partial API Response:', response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
      setError(errorMessage);
      console.error('Partial API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Test User Profile Create API</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Current User Info:</h3>
        {currentUser ? (
          <div>
            <p><strong>ID:</strong> {currentUser.id}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Name:</strong> {currentUser.full_name}</p>
          </div>
        ) : (
          <p style={{ color: 'red' }}>❌ Not logged in</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleTestAPI}
          disabled={isLoading || !currentUser}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading || !currentUser ? 'not-allowed' : 'pointer',
            marginRight: '10px',
            opacity: isLoading || !currentUser ? 0.6 : 1
          }}
        >
                     {isLoading ? '⏳ Testing...' : '🚀 Test Full Profile Create'}
        </button>

        <button
          onClick={handleTestWithPartialData}
          disabled={isLoading || !currentUser}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading || !currentUser ? 'not-allowed' : 'pointer',
            opacity: isLoading || !currentUser ? 0.6 : 1
          }}
                 >
           {isLoading ? '⏳ Testing...' : '📝 Test Partial Create'}
         </button>

         <button
           onClick={handleGetProfile}
           disabled={isLoading || !currentUser}
           style={{
             padding: '12px 24px',
             backgroundColor: '#6f42c1',
             color: 'white',
             border: 'none',
             borderRadius: '6px',
             cursor: isLoading || !currentUser ? 'not-allowed' : 'pointer',
             opacity: isLoading || !currentUser ? 0.6 : 1
           }}
         >
           {isLoading ? '⏳ Testing...' : '📋 Get Profile'}
         </button>
       </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h4>❌ Error:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{error}</pre>
        </div>
      )}

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h4>✅ Success:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{result}</pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h4>📋 Test Data Preview:</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
          {JSON.stringify(testData, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>📝 Instructions:</h4>
        <ol>
          <li>Make sure you're logged in</li>
          <li>Ensure your FastAPI backend is running on port 8000</li>
          <li>Create the `user_profiles` table in Supabase (see updated guide)</li>
          <li>Click "Test Full Profile Create" to create a complete profile</li>
          <li>Click "Test Partial Create" to create a minimal profile</li>
          <li>Click "Get Profile" to retrieve the created profile</li>
          <li>Check the browser console for detailed logs</li>
          <li>Check your Supabase `user_profiles` table to see the data</li>
        </ol>
      </div>
    </div>
  );
};

export default TestProfileUpdate; 