import type { Person } from '../types/Person';

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
