import React, { useState, useEffect } from 'react';
import type { Person } from '../types/Person';
import { Form, type FormField } from '../components/Form';
import { createPersonWithPhoto } from '../services/peopleApi';
import type { PersonApiResponse } from '../types/ApiResponse';

interface EnterInfoProps {
  onPersonAdd: (person: Person) => void;
}

/**
 * EnterInfo Component - Screen for adding new people
 * Uses the reusable Form component with dynamic field configuration
 */
export const EnterInfo: React.FC<EnterInfoProps> = ({ onPersonAdd }) => {
  // State for managing form submission and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Enhanced validation state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationSummary, setValidationSummary] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Enhanced state management for step 2.2
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
  }>>([]);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  // Enhanced UX state management for step 2.3
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'restored'>('unsaved');
  const [showSubmissionConfirmation, setShowSubmissionConfirmation] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  // Custom validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return '';
  };

  const validateAge = (age: string): string => {
    if (!age.trim()) return 'Age is required';
    const numAge = parseInt(age);
    if (isNaN(numAge)) return 'Age must be a valid number';
    if (numAge < 1) return 'Age must be at least 1';
    if (numAge > 120) return 'Age must be less than 120';
    return '';
  };

  const validateAddress = (address: string): string => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 5) return 'Address must be at least 5 characters';
    if (address.trim().length > 200) return 'Address must be less than 200 characters';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Phone number is required';
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
    if (cleanPhone.length > 15) return 'Phone number must be less than 15 digits';
    // Check for valid phone patterns
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone)) return 'Please enter a valid phone number';
    return '';
  };

  const validatePhoto = (photo: string): string => {
    if (!photo) return ''; // Photo is optional
    if (!photo.startsWith('data:image/')) return 'Please select a valid image file';
    return '';
  };

  // Real-time validation function
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name': return validateName(value);
      case 'age': return validateAge(value);
      case 'address': return validateAddress(value);
      case 'phone': return validatePhone(value);
      case 'photo': return validatePhoto(value);
      default: return '';
    }
  };

  // Update validation summary
  const updateValidationSummary = (errors: Record<string, string>) => {
    const errorMessages = Object.values(errors).filter(msg => msg !== '');
    setValidationSummary(errorMessages);
    setIsFormValid(errorMessages.length === 0);
  };

  // Notification management functions
  const addNotification = (type: 'success' | 'error' | 'info', message: string, duration: number = 5000) => {
    const id = Date.now().toString();
    const notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Form reset functionality
  const resetForm = () => {
    setFormData({});
    setFieldErrors({});
    setValidationSummary([]);
    setIsFormValid(false);
    setUploadProgress(0);
    setIsUploading(false);
    setSubmitMessage(null);
    setShowResetConfirmation(false);
    
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      input.value = '';
    });
    
    addNotification('success', 'Form has been reset successfully!', 3000);
  };

  // File upload progress simulation
  const simulateFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      const reader = new FileReader();
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);
      
      reader.onload = (event) => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          resolve(event.target?.result as string);
        }, 500);
      };
      
      reader.onerror = () => {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Auto-save functionality
  const saveToLocalStorage = (data: Record<string, string>) => {
    try {
      const saveData = {
        formData: data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('enterInfo_autoSave', JSON.stringify(saveData));
      setLastSaved(new Date());
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      setAutoSaveStatus('unsaved');
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('enterInfo_autoSave');
      if (saved) {
        const { formData: savedData, timestamp } = JSON.parse(saved);
        const saveTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
        
        // Only restore if saved within last 24 hours
        if (hoursDiff < 24) {
          setFormData(savedData);
          setLastSaved(saveTime);
          setAutoSaveStatus('restored');
          addNotification('info', 'Form data restored from previous session', 4000);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return false;
  };

  const clearAutoSave = () => {
    try {
      localStorage.removeItem('enterInfo_autoSave');
      setAutoSaveStatus('unsaved');
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  // Debounced auto-save
  const debouncedAutoSave = (data: Record<string, string>) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    setAutoSaveStatus('saving');
    const timeout = setTimeout(() => {
      saveToLocalStorage(data);
    }, 500);
    
    setAutoSaveTimeout(timeout);
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter key to submit form
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isFormValid && !isLoading) {
        setShowSubmissionConfirmation(true);
      }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
      if (showSubmissionConfirmation) {
        setShowSubmissionConfirmation(false);
      }
      if (showResetConfirmation) {
        setShowResetConfirmation(false);
      }
    }
    
    // Ctrl+S to save manually
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveToLocalStorage(formData);
      addNotification('success', 'Form saved manually', 2000);
    }
  };

  // Focus management
  const focusField = (fieldName: string) => {
    const field = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    if (field) {
      field.focus();
      setFocusedField(fieldName);
    }
  };

  const focusFirstError = () => {
    const firstErrorField = Object.keys(fieldErrors).find(field => fieldErrors[field]);
    if (firstErrorField) {
      focusField(firstErrorField);
    }
  };

  // Form field configuration with enhanced validation
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter full name (letters, spaces, hyphens only)',
      required: true
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      placeholder: 'Enter age (1-120)',
      required: true,
      min: 1,
      max: 120
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: 'Enter complete address (5-200 characters)',
      required: true
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter phone number (10-15 digits)',
      required: true
    },
    {
      name: 'photo',
      label: 'Photo',
      type: 'file',
      placeholder: 'Select a photo (optional)',
      required: false,
      accept: 'image/*'
    }
  ];

  // Real-time validation effect
  useEffect(() => {
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName] || '');
      if (error) {
        errors[fieldName] = error;
      }
    });
    setFieldErrors(errors);
    updateValidationSummary(errors);
  }, [formData]);

  // Auto-save effect
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      debouncedAutoSave(formData);
    }
  }, [formData]);

  // Load saved data on component mount
  useEffect(() => {
    loadFromLocalStorage();
    
    // Focus first field after component mounts
    const firstField = formFields[0];
    if (firstField) {
      setTimeout(() => focusField(firstField.name), 100);
    }
  }, []);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Handle input change with real-time validation and file upload progress
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (e.target.type === 'file' && files && files[0]) {
      const file = files[0];
      
      // File size validation (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: 'File size must be less than 5MB'
        }));
        addNotification('error', 'File size too large. Please select a smaller image.', 4000);
        return;
      }
      
      if (file.type.startsWith('image/')) {
        try {
          addNotification('info', 'Uploading image...', 2000);
          const base64String = await simulateFileUpload(file);
          setFormData(prev => ({
            ...prev,
            [name]: base64String
          }));
          addNotification('success', 'Image uploaded successfully!', 3000);
        } catch (error) {
          setFieldErrors(prev => ({
            ...prev,
            [name]: 'Failed to upload image. Please try again.'
          }));
          addNotification('error', 'Failed to upload image. Please try again.', 4000);
        }
      } else {
        setFieldErrors(prev => ({
          ...prev,
          [name]: 'Please select a valid image file'
        }));
        addNotification('error', 'Please select a valid image file (JPG, PNG, GIF, etc.)', 4000);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handles form submission with enhanced validation and state management
  const handleFormSubmit = async (data: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      setSubmitMessage(null);
      addNotification('info', 'Submitting form...', 2000);

      // Final validation before submission
      const finalErrors: Record<string, string> = {};
      Object.keys(data).forEach(fieldName => {
        const error = validateField(fieldName, data[fieldName] || '');
        if (error) {
          finalErrors[fieldName] = error;
        }
      });

      if (Object.keys(finalErrors).length > 0) {
        setFieldErrors(finalErrors);
        updateValidationSummary(finalErrors);
        setSubmitMessage({ type: 'error', text: 'Please fix the validation errors before submitting.' });
        addNotification('error', 'Please fix validation errors before submitting.', 4000);
        focusFirstError();
        return;
      }

      // Prepare person data for API
      const personData: Omit<Person, 'id' | 'photo'> = {
        name: data.name || '',
        age: parseInt(data.age || '0'),
        address: data.address || '',
        phone: data.phone || '',
      };

      // Handle photo file if present
      let photoFile: File | undefined;
      if (data.photo && data.photo.startsWith('data:image/')) {
        // Convert base64 to File object
        const response = await fetch(data.photo);
        const blob = await response.blob();
        photoFile = new File([blob], 'photo.jpg', { type: blob.type });
      }

      // Call API to create person
      addNotification('info', 'Creating person...', 2000);
      const response: PersonApiResponse = await createPersonWithPhoto(personData, photoFile);

      if (response.success && response.data) {
        onPersonAdd(response.data);
        setSubmitMessage({ type: 'success', text: 'Person added successfully!' });
        addNotification('success', 'Person added successfully!', 4000);
        
        // Clear auto-save data after successful submission
        clearAutoSave();
        
        // Show reset confirmation after successful submission
        setTimeout(() => {
          setShowResetConfirmation(true);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create person');
      }
      
    } catch (error: any) {
      console.error('Error adding person:', error);
      
      let errorMessage = 'Failed to add person. Please try again.';
      
      // Handle specific API errors
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitMessage({ type: 'error', text: errorMessage });
      addNotification('error', errorMessage, 5000);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Handle submission confirmation
  const handleConfirmSubmission = () => {
    setShowSubmissionConfirmation(false);
    handleFormSubmit(formData);
  };

  // Renders the enhanced form with real-time validation
  return (
    <div 
      style={styles.container}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div style={styles.header}>
        <h1 style={styles.title}>Add New Person</h1>
        <p style={styles.subtitle}>Enter the details of the person you want to add to the system</p>
        
        {/* Auto-save status indicator */}
        <div style={styles.autoSaveStatus}>
          <div style={{
            ...styles.statusIndicator,
            ...(autoSaveStatus === 'saved' ? styles.statusValid : 
                autoSaveStatus === 'saving' ? styles.statusInfo : 
                autoSaveStatus === 'restored' ? styles.statusInfo : 
                styles.statusInvalid)
          }}>
            <span style={styles.statusIcon}>
              {autoSaveStatus === 'saved' ? '✓' : 
               autoSaveStatus === 'saving' ? '⏳' : 
               autoSaveStatus === 'restored' ? '↻' : '⚠'}
            </span>
            <span style={styles.statusText}>
              {autoSaveStatus === 'saved' ? 'Form saved' : 
               autoSaveStatus === 'saving' ? 'Saving...' : 
               autoSaveStatus === 'restored' ? 'Data restored' : 'Not saved'}
              {lastSaved && autoSaveStatus === 'saved' && (
                <span style={styles.lastSavedText}>
                  {' '}({lastSaved.toLocaleTimeString()})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      <div style={styles.formWrapper}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Person Details</h2>
            <p style={styles.formDescription}>Please fill in all the required information below</p>
          </div>
          
          <div style={styles.formContent}>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit(formData);
            }} style={styles.form}>
              {formFields.map((field) => (
                <div key={field.name} style={styles.inputGroup}>
                  <label style={styles.label}>
                    {field.label}
                    {field.required && <span style={styles.required}> *</span>}
                  </label>
                  
                  <input
                    type={field.type}
                    name={field.name}
                    value={field.type === 'file' ? '' : (formData[field.name] || '')}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      setFocusedField(field.name);
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = fieldErrors[field.name] ? '#e74c3c' : '#e0e0e0';
                      e.target.style.backgroundColor = fieldErrors[field.name] ? '#fef2f2' : '#fafbfc';
                      e.target.style.boxShadow = 'none';
                      setFocusedField(null);
                    }}
                    style={{
                      ...styles.input,
                      ...(field.type === 'file' ? styles.fileInput : {}),
                      ...(fieldErrors[field.name] ? styles.inputError : {}),
                      ...(isLoading ? styles.inputDisabled : {}),
                      ...(focusedField === field.name ? styles.inputFocused : {})
                    }}
                    placeholder={field.placeholder}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    accept={field.accept}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  
                  {/* File upload progress indicator */}
                  {field.type === 'file' && isUploading && (
                    <div style={styles.uploadProgress}>
                      <div style={styles.progressBar}>
                        <div 
                          style={{
                            ...styles.progressFill,
                            width: `${uploadProgress}%`
                          }}
                        />
                      </div>
                      <span style={styles.progressText}>
                        Uploading... {Math.round(uploadProgress)}%
                      </span>
                    </div>
                  )}
                  
                  {/* Real-time validation feedback */}
                  {fieldErrors[field.name] && (
                    <div style={styles.fieldError}>
                      <span style={styles.errorIcon}>⚠</span>
                      <span style={styles.errorText}>{fieldErrors[field.name]}</span>
                    </div>
                  )}
                  
                  {/* Field success indicator */}
                  {formData[field.name] && !fieldErrors[field.name] && field.required && (
                    <div style={styles.fieldSuccess}>
                      <span style={styles.successIcon}>✓</span>
                      <span style={styles.successText}>Valid</span>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Validation Summary */}
              {validationSummary.length > 0 && (
                <div style={styles.validationSummary}>
                  <h4 style={styles.summaryTitle}>Please fix the following errors:</h4>
                  <ul style={styles.summaryList}>
                    {validationSummary.map((error, index) => (
                      <li key={index} style={styles.summaryItem}>
                        <span style={styles.summaryIcon}>•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Form Status Indicator */}
              <div style={styles.formStatus}>
                <div style={{
                  ...styles.statusIndicator,
                  ...(isFormValid ? styles.statusValid : styles.statusInvalid)
                }}>
                  <span style={styles.statusIcon}>
                    {isFormValid ? '✓' : '⚠'}
                  </span>
                  <span style={styles.statusText}>
                    {isFormValid ? 'Form is valid and ready to submit' : 'Please fix validation errors'}
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowSubmissionConfirmation(true)}
                disabled={!isFormValid || isSubmitting || isLoading}
                style={{
                  ...styles.submitButton,
                  ...(isFormValid && !isLoading ? styles.submitButtonEnabled : styles.submitButtonDisabled)
                }}
              >
                {isLoading ? (
                  <div style={styles.loadingButtonContent}>
                    <div style={styles.spinner}></div>
                    Processing...
                  </div>
                ) : isSubmitting ? "Adding Person..." : "Add Person"}
              </button>
              
              {/* Reset Form Button */}
              <button
                type="button"
                onClick={() => setShowResetConfirmation(true)}
                style={styles.resetButton}
                disabled={isLoading}
              >
                Reset Form
              </button>
            </form>
          </div>
          
          {/* Loading Overlay */}
          {isLoading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.loadingContent}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Processing your request...</p>
              </div>
            </div>
          )}
          
          {/* Submission Confirmation Dialog */}
          {showSubmissionConfirmation && (
            <div style={styles.confirmationOverlay}>
              <div style={styles.confirmationDialog}>
                <h3 style={styles.confirmationTitle}>Confirm Submission</h3>
                <p style={styles.confirmationMessage}>
                  Please review your information before submitting:
                </p>
                
                {/* Data Preview */}
                <div style={styles.dataPreview}>
                  <div style={styles.previewItem}>
                    <strong>Name:</strong> {formData.name || 'Not provided'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Age:</strong> {formData.age || 'Not provided'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Address:</strong> {formData.address || 'Not provided'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Phone:</strong> {formData.phone || 'Not provided'}
                  </div>
                  <div style={styles.previewItem}>
                    <strong>Photo:</strong> {formData.photo ? 'Uploaded' : 'Not provided'}
                  </div>
                </div>
                
                <div style={styles.confirmationButtons}>
                  <button
                    onClick={handleConfirmSubmission}
                    style={styles.confirmButton}
                  >
                    Submit Person
                  </button>
                  <button
                    onClick={() => setShowSubmissionConfirmation(false)}
                    style={styles.cancelButton}
                  >
                    Edit Form
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Reset Confirmation Dialog */}
          {showResetConfirmation && (
            <div style={styles.confirmationOverlay}>
              <div style={styles.confirmationDialog}>
                <h3 style={styles.confirmationTitle}>Reset Form?</h3>
                <p style={styles.confirmationMessage}>
                  Are you sure you want to reset the form? All entered data will be lost.
                </p>
                <div style={styles.confirmationButtons}>
                  <button
                    onClick={resetForm}
                    style={styles.confirmButton}
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirmation(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {submitMessage && (
            <div style={{
              ...styles.messageContainer,
              ...(submitMessage.type === 'success' ? styles.successMessage : styles.errorMessage)
            }}>
              <span style={styles.messageIcon}>
                {submitMessage.type === 'success' ? '✓' : '⚠'}
              </span>
              <span style={styles.messageText}>{submitMessage.text}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification System */}
      <div style={styles.notificationContainer}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              ...styles.notification,
              ...(notification.type === 'success' ? styles.notificationSuccess : 
                  notification.type === 'error' ? styles.notificationError : 
                  styles.notificationInfo)
            }}
            onClick={() => removeNotification(notification.id)}
          >
            <span style={styles.notificationIcon}>
              {notification.type === 'success' ? '✓' : 
               notification.type === 'error' ? '⚠' : 'ℹ'}
            </span>
            <span style={styles.notificationMessage}>{notification.message}</span>
            <button
              style={styles.notificationClose}
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginLeft: '300px',
    padding: '40px 30px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '40px',
    position: 'relative' as const
  },
  
  header: {
    textAlign: 'center' as const,
    marginBottom: '20px',
    padding: '20px 0',
    position: 'relative' as const
  },
  
  title: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#2c3e50',
    margin: '0 0 12px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
    lineHeight: '1.2',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  subtitle: {
    fontSize: '20px',
    color: '#6c757d',
    margin: '0',
    lineHeight: '1.6',
    fontWeight: '400',
    letterSpacing: '0.2px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  formWrapper: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%'
  },
  
  formCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '1px solid #e8ecf0'
  },
  
  formHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px 40px',
    textAlign: 'center' as const
  },
  
  formTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 10px 0',
    color: 'white',
    letterSpacing: '-0.3px',
    lineHeight: '1.3',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  formDescription: {
    fontSize: '18px',
    margin: '0',
    opacity: 0.95,
    lineHeight: '1.6',
    fontWeight: '300',
    letterSpacing: '0.1px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  formContent: {
    padding: '50px 40px 40px 40px',
    backgroundColor: '#fafbfc',
    borderTop: '1px solid #f0f0f0'
  },
  
  messageContainer: {
    margin: '20px 40px 0 40px',
    padding: '15px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    animation: 'fadeIn 0.3s ease-in-out'
  },
  
  messageIcon: {
    fontSize: '18px',
    fontWeight: 'bold'
  },
  
  successMessage: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724'
  },
  
  errorMessage: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    color: '#721c24'
  },
  
  messageText: {
    fontSize: '16px',
    fontWeight: '500',
    letterSpacing: '0.1px',
    lineHeight: '1.5',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Enhanced validation styles
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px',
    width: '100%'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    position: 'relative' as const
  },

  label: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '5px',
    display: 'block'
  },

  required: {
    color: '#e74c3c',
    fontWeight: 'bold'
  },

  input: {
    padding: '15px 18px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#fafbfc',
    transition: 'all 0.3s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const
  },

  fileInput: {
    padding: '12px 18px',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    border: '2px dashed #bdc3c7',
    textAlign: 'center' as const
  },

  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef2f2',
    boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.1)'
  },

  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#e74c3c',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '5px',
    animation: 'fadeIn 0.3s ease-in-out'
  },

  errorIcon: {
    fontSize: '16px',
    fontWeight: 'bold'
  },

  errorText: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  fieldSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#27ae60',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '5px',
    animation: 'fadeIn 0.3s ease-in-out'
  },

  successIcon: {
    fontSize: '16px',
    fontWeight: 'bold'
  },

  successText: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  validationSummary: {
    backgroundColor: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    animation: 'fadeIn 0.3s ease-in-out'
  },

  summaryTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#dc2626',
    margin: '0 0 15px 0',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  summaryList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    color: '#dc2626',
    marginBottom: '8px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  summaryIcon: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#dc2626'
  },

  formStatus: {
    marginBottom: '25px',
    display: 'flex',
    justifyContent: 'center'
  },

  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 25px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: 'all 0.3s ease',
    animation: 'fadeIn 0.3s ease-in-out'
  },

  statusValid: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '2px solid #a7f3d0'
  },

  statusInvalid: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '2px solid #fecaca'
  },

  statusIcon: {
    fontSize: '18px',
    fontWeight: 'bold'
  },

  statusText: {
    fontSize: '15px'
  },

  submitButton: {
    padding: '18px 40px',
    fontSize: '18px',
    fontWeight: '700',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    width: '100%',
    boxSizing: 'border-box' as const
  },

  submitButtonEnabled: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(0)'
  },

  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
    color: '#7f8c8d',
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'none'
  },

  // Enhanced state management styles for step 2.2
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    cursor: 'not-allowed',
    opacity: 0.6
  },

  uploadProgress: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },

  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden'
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },

  progressText: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '500',
    textAlign: 'center' as const
  },

  loadingButtonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  resetButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: '2px solid #e74c3c',
    backgroundColor: 'transparent',
    color: '#e74c3c',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginTop: '15px',
    width: '100%',
    boxSizing: 'border-box' as const
  },

  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    borderRadius: '20px'
  },

  loadingContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
  },

  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  loadingText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50',
    margin: 0,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  confirmationOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },

  confirmationDialog: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    textAlign: 'center' as const
  },

  confirmationTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0 0 15px 0',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  confirmationMessage: {
    fontSize: '16px',
    color: '#6c757d',
    margin: '0 0 25px 0',
    lineHeight: '1.5',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  confirmationButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },

  confirmButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#e74c3c',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  cancelButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: '2px solid #6c757d',
    backgroundColor: 'transparent',
    color: '#6c757d',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Notification system styles
  notificationContainer: {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    zIndex: 3000,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    maxWidth: '400px'
  },

  notification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    animation: 'slideInRight 0.3s ease-out',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  notificationSuccess: {
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    color: '#065f46'
  },

  notificationError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626'
  },

  notificationInfo: {
    backgroundColor: '#dbeafe',
    border: '1px solid #93c5fd',
    color: '#1e40af'
  },

  notificationIcon: {
    fontSize: '18px',
    fontWeight: 'bold',
    flexShrink: 0
  },

  notificationMessage: {
    fontSize: '14px',
    fontWeight: '500',
    flex: 1,
    lineHeight: '1.4'
  },

  notificationClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease'
  },

  // Enhanced UX styles for step 2.3
  autoSaveStatus: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'center'
  },

  lastSavedText: {
    fontSize: '12px',
    opacity: 0.7,
    fontStyle: 'italic'
  },

  inputFocused: {
    borderColor: '#667eea',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    transform: 'scale(1.02)',
    transition: 'all 0.2s ease'
  },

  statusInfo: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: '2px solid #93c5fd'
  },

  dataPreview: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
    textAlign: 'left' as const
  },

  previewItem: {
    marginBottom: '10px',
    fontSize: '14px',
    color: '#495057',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};
