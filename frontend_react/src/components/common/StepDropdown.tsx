import React from 'react';
import styled from 'styled-components';

// Progress bar container
const ProgressContainer = styled.div`
  width: 100%;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const ProgressBarWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  position: relative;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width 0.4s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: -2px;
    top: -4px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const StepItem = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StepIcon = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => 
    props.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
    props.isCompleted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
    '#e9ecef'
  };
  color: ${props => 
    props.isActive || props.isCompleted ? 'white' : '#6b7280'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  border: 2px solid ${props => 
    props.isActive ? '#667eea' :
    props.isCompleted ? '#10b981' : 
    '#e9ecef'
  };
  box-shadow: ${props => 
    props.isActive || props.isCompleted ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
  };
`;

const StepLabel = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  font-size: 11px;
  font-weight: ${props => props.isActive ? '600' : '500'};
  color: ${props => 
    props.isActive ? '#667eea' :
    props.isCompleted ? '#10b981' : 
    '#6b7280'
  };
  text-align: center;
  line-height: 1.2;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CheckIcon = styled.svg`
  width: 16px;
  height: 16px;
  color: #10b981;
`;

interface StepDropdownProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  className?: string;
}

const StepDropdown: React.FC<StepDropdownProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  className = ''
}) => {
  const stepData = [
    { icon: '👤', label: 'Basic Info', fullTitle: 'Basic Information' },
    { icon: '🏥', label: 'Medical', fullTitle: 'Medical Conditions' },
    { icon: '🎯', label: 'Goals', fullTitle: 'Health Goals' },
    { icon: '🥗', label: 'Diet', fullTitle: 'Dietary Preferences' },
    { icon: '🍽️', label: 'Habits', fullTitle: 'Meal Habits' },
    { icon: '📍', label: 'Location', fullTitle: 'Location' }
  ];

  const progress = (currentStep / totalSteps) * 100;

  const handleStepClick = (stepNumber: number) => {
    onStepChange(stepNumber);
  };

  return (
    <ProgressContainer className={className}>
      <ProgressBarWrapper>
        {/* Progress bar */}
        <ProgressTrack>
          <ProgressFill progress={progress} />
        </ProgressTrack>

        {/* Step items */}
        <StepsContainer>
          {stepData.slice(0, totalSteps).map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <StepItem
                key={stepNumber}
                isActive={isActive}
                isCompleted={isCompleted}
                onClick={() => handleStepClick(stepNumber)}
              >
                <StepIcon isActive={isActive} isCompleted={isCompleted}>
                  {isCompleted ? (
                    <CheckIcon viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </CheckIcon>
                  ) : (
                    <span style={{ fontSize: '16px' }}>{step.icon}</span>
                  )}
                </StepIcon>
                <StepLabel isActive={isActive} isCompleted={isCompleted}>
                  {step.label}
                </StepLabel>
              </StepItem>
            );
          })}
        </StepsContainer>
      </ProgressBarWrapper>
    </ProgressContainer>
  );
};

export default StepDropdown; 