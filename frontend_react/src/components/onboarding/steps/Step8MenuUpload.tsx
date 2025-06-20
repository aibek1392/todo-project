import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateMenuUpload } from '../../../store/onboardingSlice';
import { MenuUpload } from '../../../types/onboarding';
import {
  StepTitle,
  StepDescription,
  FormGroup,
  Label,
  FileUpload,
  FileInput,
  FileUploadIcon,
  FileUploadText,
  ErrorMessage
} from '../OnboardingForm.styles';

interface Step8Props {
  onNext: () => void;
}

const Step8MenuUpload: React.FC<Step8Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const menuUpload = useSelector((state: RootState) => state.onboarding.formData.menuUpload);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(menuUpload.menuImage || null);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    trigger
  } = useForm({

    defaultValues: menuUpload,
    mode: 'onChange'
  });

  const onSubmit = (data: any) => {
    dispatch(updateMenuUpload(data));
    onNext();
  };

  const handleNext = async () => {
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit(onSubmit)();
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setValue('menuImage', file || undefined);
    trigger('menuImage');
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <StepTitle>Upload a restaurant menu (optional)</StepTitle>
      <StepDescription>
        Upload a photo of a restaurant menu to get personalized suggestions based on your dietary preferences and health goals.
      </StepDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Menu image</Label>
          <FileUpload
            className={dragOver ? 'dragover' : ''}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <FileInput
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileInputChange}
            />
            
            {selectedFile ? (
              <div>
                <FileUploadIcon>📄</FileUploadIcon>
                <FileUploadText>
                  <strong>{selectedFile.name}</strong>
                  <br />
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  <br />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginTop: '8px'
                    }}
                  >
                    Remove file
                  </button>
                </FileUploadText>
              </div>
            ) : (
              <div>
                <FileUploadIcon>📷</FileUploadIcon>
                <FileUploadText>
                  <strong>Click to upload</strong> or drag and drop
                  <br />
                  PNG, JPG, JPEG up to 5MB
                </FileUploadText>
              </div>
            )}
          </FileUpload>
          {errors.menuImage && <ErrorMessage>{errors.menuImage.message}</ErrorMessage>}
        </FormGroup>
      </form>
    </>
  );
};

export default Step8MenuUpload; 