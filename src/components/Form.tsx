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
    
     against its validation rules
    fields.forEach(field => {
      const value = formData[field.name] || '';
      
       field is empty
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
       for number fields
      if (field.type === 'number' && value) {
        const numValue = parseInt(value);
        
         is a valid number
        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a valid number`;
        } 
         value constraint
        else if (field.min !== undefined && numValue < field.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.min}`;
        } 
         value constraint
        else if (field.max !== undefined && numValue > field.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.max}`;
        }
      }
      
       validation
      if ('needsConfirmation' in field && field.needsConfirmation && field.confirmAgainst) {
        const confirmValue = formData[field.confirmAgainst] || '';
        if (value !== confirmValue) {
          newErrors[field.name] = field.customValidationMessage || 'Passwords must match';
        }
      }
    });
    
     state with new validation results
    setErrors(newErrors);
    
     if no errors found (form is valid)
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    
     if validation passes
    if (validateForm()) {
      onSubmit(formData); 's submit handler with form data
    }
  };

  const formContent = (
    <>
      {}
      <h2 style={styles.title}>{title}</h2>
      
      {}
      <form onSubmit={handleSubmit} style={styles.form}>
        {}
        {fields.map((field) => (
          <div key={field.name} style={styles.inputGroup}>
            {}
            <label style={styles.label}>
              {field.label}
              {field.required && <span style={styles.required}> *</span>}
            </label>
            
            {}
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
                  ...styles.input,  styles
                  ...(field.type === 'file' ? styles.fileInput : {}), // Special file input styles
                  ...(errors[field.name] ? styles.inputError : {})  styles
                }}
                placeholder={field.placeholder}
                min={field.min} // For number inputs
                max={field.max} // For number inputs
                required={field.required} // HTML5 validation
                accept={field.accept} // For file inputs
              />
            
            {}
            {field.type === 'file' && formData[field.name] && (
              <div style={styles.imagePreview}>
                <img 
                  src={formData[field.name]} 
                  alt="Preview" 
                  style={styles.previewImage}
                />
              </div>
            )}
            
            {}
            {errors[field.name] && (
              <span style={styles.errorText}>{errors[field.name]}</span>
            )}
          </div>
        ))}

        {}
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
    marginLeft: '300px',  fixed navbar (300px wide)
    padding: '20px', // Internal spacing
    minHeight: '100vh',  height
    backgroundColor: '#f8f9fa', // Light gray background
  },

  formContainer: {
    maxWidth: '600px', // Limit form width for readability
    margin: '0 auto', 
    backgroundColor: 'white',  for form
    padding: '40px',  spacing
    borderRadius: '15px',  corners
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', // Enhanced shadow
    width: '100%', 
    boxSizing: 'border-box' as const,  in width calculation
  },

  title: {
    textAlign: 'center' as const,  title
    color: '#2c3e50', // Dark blue-gray color
    marginBottom: '30px', // Space below title
    fontSize: '28px', // Large, readable font
  },

  form: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const,  vertically
    gap: '28px',  between fields for better breathing room
  },

  inputGroup: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const,  above input
    gap: '12px',  between label and input for better readability
  },

  label: {
    fontSize: '16px',  size
    fontWeight: '600',  for better hierarchy
    color: '#2c3e50',  for better contrast
    letterSpacing: '0.1px',  spacing
    lineHeight: '1.4', 
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginBottom: '2px'  for better spacing
  },

  required: {
    color: '#e74c3c',  for required indicator
    fontWeight: '700', 
    marginLeft: '2px'  from label
  },

  input: {
    padding: '18px',  spacing for better touch targets
    border: '2px solid #e0e0e0', // Light gray border
    borderRadius: '10px',  corners for modern look
    fontSize: '16px',  size
    transition: 'all 0.3s ease',  for all properties
    outline: 'none',  focus outline
    lineHeight: '1.5',  for readability
    backgroundColor: '#fafbfc', 
    boxSizing: 'border-box' as const,  in width calculation
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '400',
    letterSpacing: '0.1px',
    color: '#2c3e50'
  },

  fileInput: {
    padding: '8px',  padding for file inputs
    backgroundColor: '#f8f9fa', 
    cursor: 'pointer',  for file selection
  },

  inputError: {
    borderColor: '#e74c3c',  for errors
    backgroundColor: '#fef2f2',  background for errors
  },

  inputFocus: {
    borderColor: '#667eea',  on focus
    backgroundColor: '#ffffff',  on focus
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',  glow
  },

  errorText: {
    color: '#e74c3c',  for error text
    fontSize: '14px',  for error messages
    marginTop: '6px',  above error text
    fontWeight: '500',  for better readability
    letterSpacing: '0.1px',  spacing
    lineHeight: '1.4', 
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  imagePreview: {
    marginTop: '10px',  preview
    textAlign: 'center' as const,  preview
  },

  previewImage: {
    maxWidth: '200px',  size
    maxHeight: '200px',  size
    borderRadius: '8px', 
    border: '2px solid #e0e0e0', 
    objectFit: 'cover' as const,  to fit
  },

  submitButton: {
    padding: '18px 30px', // Increased padding for button
    backgroundColor: '#3498db', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px',  corners
    fontSize: '18px', // Large, readable font
    fontWeight: '600',  for better hierarchy
    cursor: 'pointer', 
    transition: 'all 0.3s ease',  for all properties
    marginTop: '20px',  above button
    width: '100%',  button
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '0.2px',  spacing
    lineHeight: '1.4', 
    textTransform: 'none' as const,  transformation
    boxShadow: '0 2px 4px rgba(52, 152, 219, 0.2)' 
  },
};
