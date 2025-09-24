import React, { useState } from 'react';
import type { AuthFormField } from '../types/AuthForm';

/**
 * FormField Interface - Defines the structure for each form field
 * This allows us to configure forms dynamically by passing an array of field definitions
 */
export interface FormField {
  /** Unique name for the field (used as the input name and form data key) */
  name: string;
  
  /** Display label for the field */
  label: string;
  
  /** HTML input type - determines how the field is rendered and validated */
  type: 'text' | 'number' | 'tel' | 'email' | 'password' | 'file';
  
  /** Placeholder text shown in the input when empty */
  placeholder: string;
  
  /** Whether this field is required for form submission */
  required?: boolean;
  
  /** Minimum value for number inputs */
  min?: number;
  
  /** Maximum value for number inputs */
  max?: number;
  
  /** File types accepted for file inputs (e.g., "image/*" for images only) */
  accept?: string;
}

/**
 * FormProps Interface - Defines what the Form component needs to function
 */
interface FormProps {
  /** Title displayed at the top of the form */
  title: string;
  
  /** Array of field configurations that define what inputs to render */
  fields: FormField[] | AuthFormField[];
  
  /** Callback function called when form is submitted with valid data */
  onSubmit: (data: Record<string, string>) => void;
  
  /** Text displayed on the submit button */
  submitButtonText: string;
  
  /** Optional initial data to populate the form fields */
  initialData?: Record<string, string>;
  
  /** Whether to show the form container (default: true) */
  showContainer?: boolean;
}

/**
 * Form Component - Reusable form component with dynamic field rendering
 * 
 * This is the most complex component in the application. It provides:
 * - Dynamic form generation based on field configuration
 * - Real-time validation with error display
 * - File upload support with image preview
 * - Type-safe form handling
 * - Consistent styling across all forms
 * 
 * @param title - Form title displayed at the top
 * @param fields - Array of field configurations
 * @param onSubmit - Callback when form is submitted
 * @param submitButtonText - Text for submit button
 * @param initialData - Optional initial form data
 */
export const Form: React.FC<FormProps> = ({ 
  title, 
  fields, 
  onSubmit, 
  submitButtonText, 
  initialData = {},
  showContainer = true
}) => {
  // State to store all form field values
  // Keys are field names, values are the input values
  const [formData, setFormData] = useState<Record<string, string>>(initialData);
  
  // State to store validation errors for each field
  // Keys are field names, values are error messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handles input changes for all form fields
   * This function is called whenever any input value changes
   * 
   * Special handling for:
   * - File inputs: Converts images to Base64 for storage
   * - Regular inputs: Updates form data directly
   * - Error clearing: Removes errors when user starts typing
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    // Special handling for file inputs (like photo uploads)
    if (e.target.type === 'file' && files && files[0]) {
      const file = files[0];
      
      // Validate that the selected file is an image
      if (file.type.startsWith('image/')) {
        // Use FileReader to convert image to Base64 string
        // This allows us to store the image data directly in our state
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            [name]: base64String // Store Base64 string in form data
          }));
        };
        reader.readAsDataURL(file); // Start reading the file
      } else {
        // Show error if user selects a non-image file
        setErrors(prev => ({
          ...prev,
          [name]: 'Please select a valid image file'
        }));
      }
    } else {
      // Regular input handling (text, number, tel, email, password)
      setFormData(prev => ({
        ...prev,
        [name]: value // Update the specific field with new value
      }));
    }
    
    // Clear any existing error for this field when user starts typing/selecting
    // This provides immediate feedback that the error is being addressed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '' // Clear the error message
      }));
    }
  };

  /**
   * Validates all form fields according to their configuration
   * 
   * Validation rules:
   * - Required fields must have non-empty values
   * - Number fields must be valid numbers within min/max range
   * - File fields are validated during input change
   * - Password confirmation fields must match their target field
   * 
   * @returns true if all validations pass, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check each field against its validation rules
    fields.forEach(field => {
      const value = formData[field.name] || '';
      
      // Check if required field is empty
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      // Additional validation for number fields
      if (field.type === 'number' && value) {
        const numValue = parseInt(value);
        
        // Check if value is a valid number
        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a valid number`;
        } 
        // Check minimum value constraint
        else if (field.min !== undefined && numValue < field.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.min}`;
        } 
        // Check maximum value constraint
        else if (field.max !== undefined && numValue > field.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.max}`;
        }
      }
      
      // Password confirmation validation
      if ('needsConfirmation' in field && field.needsConfirmation && field.confirmAgainst) {
        const confirmValue = formData[field.confirmAgainst] || '';
        if (value !== confirmValue) {
          newErrors[field.name] = field.customValidationMessage || 'Passwords must match';
        }
      }
    });
    
    // Update errors state with new validation results
    setErrors(newErrors);
    
    // Return true if no errors found (form is valid)
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * Prevents default form submission and validates before calling onSubmit callback
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    
    // Only submit if validation passes
    if (validateForm()) {
      onSubmit(formData); // Call the parent's submit handler with form data
    }
  };

  /**
   * Renders the form with dynamic fields based on configuration
   * Each field is rendered according to its type and properties
   */
  const formContent = (
    <>
      {/* Form title */}
      <h2 style={styles.title}>{title}</h2>
      
      {/* Form element with submit handler */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Dynamically render each field based on configuration */}
        {fields.map((field) => (
          <div key={field.name} style={styles.inputGroup}>
            {/* Field label with required indicator */}
            <label style={styles.label}>
              {field.label}
              {field.required && <span style={styles.required}> *</span>}
            </label>
            
            {/* Input field with dynamic properties */}
            <input
              type={field.type}
              name={field.name}
              value={field.type === 'file' ? '' : (formData[field.name] || '')} // File inputs don't use value
              onChange={handleInputChange}
              style={{
                ...styles.input, // Base input styles
                ...(field.type === 'file' ? styles.fileInput : {}), // Special file input styles
                ...(errors[field.name] ? styles.inputError : {}) // Error state styles
              }}
              placeholder={field.placeholder}
              min={field.min} // For number inputs
              max={field.max} // For number inputs
              required={field.required} // HTML5 validation
              accept={field.accept} // For file inputs
            />
            
            {/* Image preview for file inputs */}
            {field.type === 'file' && formData[field.name] && (
              <div style={styles.imagePreview}>
                <img 
                  src={formData[field.name]} 
                  alt="Preview" 
                  style={styles.previewImage}
                />
              </div>
            )}
            
            {/* Error message display */}
            {errors[field.name] && (
              <span style={styles.errorText}>{errors[field.name]}</span>
            )}
          </div>
        ))}

        {/* Submit button */}
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

/**
 * Styles object for the Form component
 * Contains all CSS-in-JS styles for consistent form appearance
 */
const styles = {
  /** Main container - accounts for fixed navbar width */
  container: {
    marginLeft: '300px', // Space for fixed navbar (300px wide)
    padding: '20px', // Internal spacing
    minHeight: '100vh', // Full viewport height
    backgroundColor: '#f8f9fa', // Light gray background
  },
  
  /** Form container - centered white card */
  formContainer: {
    maxWidth: '600px', // Limit form width for readability
    margin: '0 auto', // Center the form
    backgroundColor: 'white', // White background for form
    padding: '40px', // Increased internal spacing
    borderRadius: '15px', // More rounded corners
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', // Enhanced shadow
    width: '100%', // Full width
    boxSizing: 'border-box' as const, // Include padding in width calculation
  },
  
  /** Form title styling */
  title: {
    textAlign: 'center' as const, // Center the title
    color: '#2c3e50', // Dark blue-gray color
    marginBottom: '30px', // Space below title
    fontSize: '28px', // Large, readable font
  },
  
  /** Form element - vertical layout */
  form: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const, // Stack fields vertically
    gap: '24px', // Increased space between fields
  },
  
  /** Container for each input field and its label */
  inputGroup: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const, // Stack label above input
    gap: '10px', // Increased gap between label and input
  },
  
  /** Field label styling */
  label: {
    fontSize: '16px', // Readable font size
    fontWeight: 'bold', // Bold text for emphasis
    color: '#34495e', // Dark gray color
  },
  
  /** Required field indicator (red asterisk) */
  required: {
    color: '#e74c3c', // Red color for required indicator
  },
  
  /** Base input field styling */
  input: {
    padding: '16px', // Increased internal spacing
    border: '2px solid #e0e0e0', // Light gray border
    borderRadius: '8px', // More rounded corners
    fontSize: '16px', // Readable font size
    transition: 'border-color 0.3s ease', // Smooth border color transition
    outline: 'none', // Remove default focus outline
    lineHeight: '1.5', // Better line height for readability
  },
  
  /** Special styling for file inputs */
  fileInput: {
    padding: '8px', // Slightly less padding for file inputs
    backgroundColor: '#f8f9fa', // Light background
    cursor: 'pointer', // Pointer cursor for file selection
  },
  
  /** Error state styling for inputs */
  inputError: {
    borderColor: '#e74c3c', // Red border for errors
  },
  
  /** Error message text styling */
  errorText: {
    color: '#e74c3c', // Red color for error text
    fontSize: '14px', // Smaller font for error messages
    marginTop: '4px', // Small space above error text
  },
  
  /** Container for image preview */
  imagePreview: {
    marginTop: '10px', // Space above preview
    textAlign: 'center' as const, // Center the preview
  },
  
  /** Image preview styling */
  previewImage: {
    maxWidth: '200px', // Limit preview size
    maxHeight: '200px', // Limit preview size
    borderRadius: '8px', // Rounded corners
    border: '2px solid #e0e0e0', // Light border
    objectFit: 'cover' as const, // Crop image to fit
  },
  
  /** Submit button styling */
  submitButton: {
    padding: '18px 30px', // Increased padding for button
    backgroundColor: '#3498db', // Blue background
    color: 'white', // White text
    border: 'none', // No border
    borderRadius: '8px', // More rounded corners
    fontSize: '18px', // Large, readable font
    fontWeight: 'bold', // Bold text
    cursor: 'pointer', // Pointer cursor
    transition: 'background-color 0.3s ease', // Smooth color transition
    marginTop: '20px', // Increased space above button
    width: '100%', // Full width button
  },
};
