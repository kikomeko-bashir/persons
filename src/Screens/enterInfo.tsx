import React, { useState } from 'react';
import type { Person } from '../types/Person';
import { Form, type FormField } from '../components/Form';

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
  // Form field configuration
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter full name',
      required: true
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      placeholder: 'Enter age',
      required: true,
      min: 1,
      max: 120
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: 'Enter address',
      required: true
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter phone number',
      required: true
    },
    {
      name: 'photo',
      label: 'Photo',
      type: 'file',
      placeholder: 'Select a photo',
      required: false,
      accept: 'image/*'
    }
  ];

  // Handles form submission
  const handleFormSubmit = async (data: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);

      const newPerson: Person = {
        id: Date.now(),
        name: data.name || '',
        age: parseInt(data.age || '0'),
        address: data.address || '',
        phone: data.phone || '',
        photo: data.photo || undefined
      };

      onPersonAdd(newPerson);
      setSubmitMessage({ type: 'success', text: 'Person added successfully!' });
      
      setTimeout(() => {
        setSubmitMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding person:', error);
      setSubmitMessage({ type: 'error', text: 'Failed to add person. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renders the form using the reusable Form component
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Add New Person</h1>
        <p style={styles.subtitle}>Enter the details of the person you want to add to the system</p>
      </div>
      
      <div style={styles.formWrapper}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Person Details</h2>
            <p style={styles.formDescription}>Please fill in all the required information below</p>
          </div>
          
          <div style={styles.formContent}>
            <Form
              title=""
              fields={formFields}
              onSubmit={handleFormSubmit}
              submitButtonText={isSubmitting ? "Adding Person..." : "Add Person"}
              showContainer={false}
            />
          </div>
          
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
  }
};
