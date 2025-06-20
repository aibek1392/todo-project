import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { authAPI } from '../services/api';

const DebugAuth: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const currentUser = useSelector((state: RootState) => state.auth?.user);
  const token = localStorage.getItem('token');

  const testAuth = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setResult(`✅ Auth working! User: ${JSON.stringify(user, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Auth failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  const testCreateProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/create_user_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Debug Test User',
          age: 25,
          location: 'Test City'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Profile creation successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Profile creation failed (${response.status}): ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setResult(`❌ Network error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔍 Debug Authentication & API</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Current State:</h3>
        <p><strong>User:</strong> {currentUser ? JSON.stringify(currentUser) : 'Not logged in'}</p>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testAuth} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Test Authentication
        </button>
        <button onClick={testCreateProfile} style={{ padding: '10px 20px' }}>
          Test Profile Creation
        </button>
      </div>

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '6px',
          whiteSpace: 'pre-wrap',
          fontSize: '14px'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default DebugAuth; 