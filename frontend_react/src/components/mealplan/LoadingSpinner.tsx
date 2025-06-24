import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner" role="status" aria-label={message}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      
      <div className="loading-content">
        <h3 className="loading-title">🤖 AI Chef at Work</h3>
        <p className="loading-message">{message}</p>
        
        <div className="loading-steps">
          <div className="step active">
            <span className="step-icon">🧠</span>
            <span className="step-text">Analyzing your profile</span>
          </div>
          <div className="step active">
            <span className="step-icon">🍽️</span>
            <span className="step-text">Crafting personalized meals</span>
          </div>
          <div className="step active">
            <span className="step-icon">🛒</span>
            <span className="step-text">Organizing shopping list</span>
          </div>
        </div>
        
        <div className="loading-tips">
          <p className="tip">💡 Your meal plan will be tailored to your health goals and dietary preferences</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 