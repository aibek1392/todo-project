import styled from 'styled-components';

export const FormContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  position: relative;
`;

export const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
`;

export const FormHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
  position: relative;
`;

export const FormTitle = styled.h1`
  color: #333;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f5f5f5;
  }

  svg {
    width: 16px;
    height: 16px;
    color: #666;
  }
`;

export const FormContent = styled.div`
  padding: 20px;
  min-height: 400px;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 80px;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #ddd;

    &:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #ccc;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;

export const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 13px;
  font-weight: 500;
`;

export const FormField = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 4px;
  cursor: pointer;
`;

export const CheckboxLabel = styled.span`
  font-size: 14px;
  color: #333;
  flex: 1;
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

export const Radio = styled.input.attrs({ type: 'radio' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

export const RadioLabel = styled.span`
  font-size: 14px;
  color: #333;
  flex: 1;
`;

export const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
`;

export const ConditionalField = styled.div`
  margin-left: 20px;
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #667eea;
`;

export const FieldGroup = styled.div`
  margin-bottom: 20px;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;

  > * {
    flex: 1;
  }
`;

export const HelpText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
`;

export const SectionTitle = styled.h3`
  color: #333;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
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

export const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
`;

export const StepTitle = styled.h2`
  color: #333;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

export const StepDescription = styled.p`
  color: #666;
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
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

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// Alias for backward compatibility
export const TextArea = Textarea; 