import type { Person } from '../types/Person';

/**
 * Dummy Data for the Person Information Application
 * 
 * This file contains sample data that is loaded when the application starts.
 * It provides immediate visual feedback and demonstrates the application's
 * functionality without requiring users to add data first.
 * 
 * The data is localized for Uganda:
 * - Addresses are in Kampala
 * - Phone numbers use Ugandan format (+256)
 * - Photos are high-quality placeholder images from Unsplash
 */

/**
 * Array of sample Person objects
 * This data is imported and used as initial state in App.tsx
 */
export const dummyPeople: Person[] = [
  {
    id: 1, // Unique identifier
    name: 'John Doe', // Full name
    age: 28, // Age in years
    address: '123 Main Street, kawempe, kampala1', // Ugandan address
    phone: '+256 702123456', // Ugandan phone number format
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' // Professional headshot
  },
  {
    id: 2, // Unique identifier
    name: 'Jane Smith', // Full name
    age: 32, // Age in years
    address: '456 mariam Avenue, kawempe, kampala', // Ugandan address
    phone: '+256 702123456', // Ugandan phone number format
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' // Professional headshot
  }
];
