import styled from 'styled-components';

export const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const FormWrapper = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
  position: relative;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 20px;
  font-weight: 300;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05) rotate(90deg);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95) rotate(90deg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    width: 14px;
    height: 2px;
    background: currentColor;
    border-radius: 1px;
    transform: rotate(45deg);
    transition: all 0.3s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 2px;
    background: currentColor;
    border-radius: 1px;
    transform: rotate(-45deg);
    transition: all 0.3s ease;
  }
  
  &:hover::before,
  &:hover::after {
    width: 16px;
    background: rgba(255, 255, 255, 0.9);
  }
`;

export const Title = styled.h1`
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

export const ProgressBar = styled.div`
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: white;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

export const StepDot = styled.div<{ active: boolean; completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => 
    props.completed ? '#667eea' : 
    props.active ? '#764ba2' : '#dee2e6'
  };
  transition: all 0.3s ease;
`;

export const FormContent = styled.div`
  padding: 40px;
  min-height: 400px;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

export const StepTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

export const StepDescription = styled.p`
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
`;

export const FormGroup = styled.div`
  margin-bottom: 24px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

export const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
  
  &.checked {
    border-color: #667eea;
    background: #f8f9ff;
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
  
  &.checked {
    border-color: #667eea;
    background: #f8f9ff;
  }
`;

export const Radio = styled.input.attrs({ type: 'radio' })`
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

export const FileUpload = styled.div`
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
  
  &.dragover {
    border-color: #667eea;
    background: #f8f9ff;
  }
`;

export const FileInput = styled.input.attrs({ type: 'file' })`
  display: none;
`;

export const FileUploadText = styled.p`
  margin: 0;
  color: #666;
  font-size: 16px;
`;

export const FileUploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 120px;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #667eea;
          color: white;
          border-color: #667eea;
          
          &:hover:not(:disabled) {
            background: #5a6fd8;
            border-color: #5a6fd8;
          }
          
          &:disabled {
            background: #ccc;
            border-color: #ccc;
            cursor: not-allowed;
          }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          border-color: #6c757d;
          
          &:hover:not(:disabled) {
            background: #5a6268;
            border-color: #5a6268;
          }
        `;
      case 'outline':
      default:
        return `
          background: transparent;
          color: #667eea;
          border-color: #667eea;
          
          &:hover:not(:disabled) {
            background: #667eea;
            color: white;
          }
        `;
    }
  }}
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const SuccessMessage = styled.div`
  text-align: center;
  padding: 60px 40px;
  
  h2 {
    color: #667eea;
    margin-bottom: 16px;
    font-size: 28px;
  }
  
  p {
    color: #666;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 30px;
  }
`;

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`; 