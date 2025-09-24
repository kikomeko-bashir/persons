import React from 'react';
import type { Person } from '../types/Person';
import { Form, type FormField } from '../components/Form';

/**
 * Props interface for the EnterInfo component
 * Defines what data the component needs to function
 */
interface EnterInfoProps {
  /** Callback function called when a new person is successfully added */
  onPersonAdd: (person: Person) => void;
}

/**
 * EnterInfo Component - Screen for adding new people
 * 
 * This screen uses the reusable Form component to create a person entry form.
 * It demonstrates the power of the Form component by defining the form
 * configuration as data rather than writing custom JSX.
 * 
 * Features:
 * - Dynamic form generation using Form component
 * - Form validation (required fields, number ranges)
 * - Photo upload with preview
 * - Clean, maintainable code (74 lines vs 174 lines before)
 */
export const EnterInfo: React.FC<EnterInfoProps> = ({ onPersonAdd }) => {
  /**
   * Form field configuration array
   * This defines what fields the form will have and their properties
   * The Form component uses this to dynamically render the form
   */
  const formFields: FormField[] = [
    {
      name: 'name', // Field name used in form data
      label: 'Name', // Display label
      type: 'text', // HTML input type
      placeholder: 'Enter full name', // Placeholder text
      required: true // Field is required for submission
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number', // Number input with validation
      placeholder: 'Enter age',
      required: true,
      min: 1, // Minimum age validation
      max: 120 // Maximum age validation
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
      type: 'tel', // Telephone input type (shows number pad on mobile)
      placeholder: 'Enter phone number',
      required: true
    },
    {
      name: 'photo',
      label: 'Photo',
      type: 'file', // File input for image upload
      placeholder: 'Select a photo',
      required: false, // Photo is optional
      accept: 'image/*' // Only accept image files
    }
  ];

  /**
   * Handles form submission when user clicks "Add Person"
   * 
   * This function is called by the Form component when:
   * 1. User clicks submit button
   * 2. All validation passes
   * 
   * @param data - Form data object with all field values
   */
  const handleFormSubmit = (data: Record<string, string>) => {
    // Create a new Person object from form data
    const newPerson: Person = {
      id: Date.now(), // Generate unique ID using current timestamp
      name: data.name || '', // Get name from form data
      age: parseInt(data.age || '0'), // Convert age string to number
      address: data.address || '', // Get address from form data
      phone: data.phone || '', // Get phone from form data
      photo: data.photo || undefined // Get photo (Base64 string) or undefined
    };

    // Call the parent component's callback to add the new person
    onPersonAdd(newPerson);
    
    // Show success message to user
    alert('Person added successfully!');
  };

  /**
   * Renders the form using the reusable Form component
   * 
   * The Form component handles:
   * - Rendering all input fields
   * - Form validation
   * - Error display
   * - Image preview
   * - Form submission
   */
  return (
    <Form
      title="Enter Person Information"
      fields={formFields}
      onSubmit={handleFormSubmit}
      submitButtonText="Add Person"
    />
  );
};
