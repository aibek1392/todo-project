import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  onBack,
  type = 'error'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'error':
        return 'Oops! Something went wrong';
      case 'warning':
        return 'Attention needed';
      case 'info':
        return 'Information';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`error-message-container ${type}`}>
      <div className="error-content">
        <div className="error-icon">
          {getIcon()}
        </div>
        
        <h3 className="error-title">{getTitle()}</h3>
        
        <p className="error-message">{message}</p>
        
        <div className="error-actions">
          {onRetry && (
            <button 
              className="btn btn-primary"
              onClick={onRetry}
            >
              🔄 Try Again
            </button>
          )}
          
          {onBack && (
            <button 
              className="btn btn-secondary"
              onClick={onBack}
            >
              ← Go Back
            </button>
          )}
        </div>
        
        <div className="error-suggestions">
          <h4>💡 Troubleshooting tips:</h4>
          <ul>
            <li>Check your internet connection</li>
            <li>Make sure you've completed your profile</li>
            <li>Try refreshing the page</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 