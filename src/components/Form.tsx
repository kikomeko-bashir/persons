import React, { useState } from 'react';
import type { AuthFormField } from '../types/AuthForm';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'tel' | 'email' | 'password' | 'file';
  placeholder: string;
  required?: boolean;
  min?: number;
  max?: number;
  accept?: string;
}

interface FormProps {
  title: string;
  fields: FormField[] | AuthFormField[];
  onSubmit: (data: Record<string, string>) => void;
  submitButtonText: string;
  initialData?: Record<string, string>;
  showContainer?: boolean;
}

// Reusable form component with dynamic field rendering
export const Form: React.FC<FormProps> = ({ 
  title, 
  fields, 
  onSubmit, 
  submitButtonText, 
  initialData = {},
  showContainer = true
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (e.target.type === 'file' && files && files[0]) {
      const file = files[0];
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            [name]: base64String
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setErrors(prev => ({
          ...prev,
          [name]: 'Please select a valid image file'
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name] || '';
      
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'number' && value) {
        const numValue = parseInt(value);
        
        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a valid number`;
        } 
        else if (field.min !== undefined && numValue < field.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.min}`;
        } 
        else if (field.max !== undefined && numValue > field.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.max}`;
        }
      }
      
      if ('needsConfirmation' in field && field.needsConfirmation && 'confirmAgainst' in field && field.confirmAgainst) {
        const confirmValue = formData[field.confirmAgainst as string] || '';
        if (value !== confirmValue) {
          newErrors[field.name] = ('customValidationMessage' in field && field.customValidationMessage) ? field.customValidationMessage as string : 'Passwords must match';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formContent = (
    <>
      <h2 style={styles.title}>{title}</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {fields.map((field) => (
          <div key={field.name} style={styles.inputGroup}>
            <label style={styles.label}>
              {field.label}
              {field.required && <span style={styles.required}> *</span>}
            </label>
            
            <input
                type={field.type}
                name={field.name}
                value={field.type === 'file' ? '' : (formData[field.name] || '')} // File inputs don't use value
                onChange={handleInputChange}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors[field.name] ? '#e74c3c' : '#e0e0e0';
                  e.target.style.backgroundColor = errors[field.name] ? '#fef2f2' : '#fafbfc';
                  e.target.style.boxShadow = 'none';
                }}
                style={{
                  ...styles.input,
                  ...(field.type === 'file' ? styles.fileInput : {}),
                  ...(errors[field.name] ? styles.inputError : {})
                }}
                placeholder={field.placeholder}
                min={field.min} // For number inputs
                max={field.max} // For number inputs
                required={field.required} // HTML5 validation
                accept={field.accept} // For file inputs
              />
            
            {field.type === 'file' && formData[field.name] && (
              <div style={styles.imagePreview}>
                <img 
                  src={formData[field.name]} 
                  alt="Preview" 
                  style={styles.previewImage}
                />
              </div>
            )}
            
            {errors[field.name] && (
              <span style={styles.errorText}>{errors[field.name]}</span>
            )}
          </div>
        ))}

        <button type="submit" style={styles.submitButton}>
          {submitButtonText}
        </button>
      </form>
    </>
  );

  if (showContainer) {
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.formContainer}>
      {formContent}
    </div>
  );
};

const styles = {
  
  container: {
    marginLeft: '300px',
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },

  formContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    boxSizing: 'border-box' as const,
  },

  title: {
    textAlign: 'center' as const,
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '28px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '28px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },

  label: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50',
    letterSpacing: '0.1px',
    lineHeight: '1.4',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginBottom: '2px',
  },

  required: {
    color: '#e74c3c',
    fontWeight: '700',
    marginLeft: '2px',
  },

  input: {
    padding: '18px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    lineHeight: '1.5',
    backgroundColor: '#fafbfc',
    boxSizing: 'border-box' as const,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '400',
    letterSpacing: '0.1px',
    color: '#2c3e50'
  },

  fileInput: {
    padding: '8px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
  },

  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef2f2',
  },

  inputFocus: {
    borderColor: '#667eea',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
  },

  errorText: {
    color: '#e74c3c',
    fontSize: '14px',
    marginTop: '6px',
    fontWeight: '500',
    letterSpacing: '0.1px',
    lineHeight: '1.4',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  imagePreview: {
    marginTop: '10px',
    textAlign: 'center' as const,
  },

  previewImage: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    objectFit: 'cover' as const,
  },

  submitButton: {
    padding: '18px 30px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '20px',
    width: '100%',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '0.2px',
    lineHeight: '1.4',
    textTransform: 'none' as const,
    boxShadow: '0 2px 4px rgba(52, 152, 219, 0.2)',
  },
};
