/**
 * People API Service
 * Handles all person CRUD operations and file uploads
 */

import type { Person } from '../types/Person';
import type { 
  PersonApiResponse, 
  PeopleApiResponse, 
  FileUploadResponse,
  FileUploadConfig 
} from '../types/ApiResponse';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from '../utils/apiClient';

// API configuration
const API_BASE_URL = 'http://localhost:3002/api';
const PEOPLE_ENDPOINT = `${API_BASE_URL}/people`;
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload`;

// File upload configuration
const FILE_UPLOAD_CONFIG: FileUploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  compress: true,
  quality: 0.8,
};

/**
 * Validate file before upload
 */
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${FILE_UPLOAD_CONFIG.maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!FILE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${FILE_UPLOAD_CONFIG.allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Compress image file
 */
const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 1920px width)
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Create a new person
 */
export const createPerson = async (person: Omit<Person, 'id'>): Promise<PersonApiResponse> => {
  try {
    const response = await apiPost<Person>(PEOPLE_ENDPOINT, person);
    return response as PersonApiResponse;
  } catch (error) {
    console.error('Error creating person:', error);
    throw error;
  }
};

/**
 * Get a person by ID
 */
export const getPerson = async (id: string): Promise<PersonApiResponse> => {
  try {
    const response = await apiGet<Person>(`${PEOPLE_ENDPOINT}/${id}`);
    return response as PersonApiResponse;
  } catch (error) {
    console.error('Error fetching person:', error);
    throw error;
  }
};

/**
 * Get all people
 */
export const getAllPeople = async (): Promise<PeopleApiResponse> => {
  try {
    const response = await apiGet<Person[]>(PEOPLE_ENDPOINT);
    return response as PeopleApiResponse;
  } catch (error) {
    console.error('Error fetching people:', error);
    throw error;
  }
};

/**
 * Update a person
 */
export const updatePerson = async (
  id: string, 
  updates: Partial<Person>
): Promise<PersonApiResponse> => {
  try {
    const response = await apiPut<Person>(`${PEOPLE_ENDPOINT}/${id}`, updates);
    return response as PersonApiResponse;
  } catch (error) {
    console.error('Error updating person:', error);
    throw error;
  }
};

/**
 * Delete a person
 */
export const deletePerson = async (id: string): Promise<void> => {
  try {
    await apiDelete(`${PEOPLE_ENDPOINT}/${id}`);
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
};

/**
 * Upload photo file
 */
export const uploadPhoto = async (file: File): Promise<FileUploadResponse> => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Compress image if enabled
    let fileToUpload = file;
    if (FILE_UPLOAD_CONFIG.compress && file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file, FILE_UPLOAD_CONFIG.quality);
    }

    // Upload file
    const response = await apiUpload<FileUploadResponse>(UPLOAD_ENDPOINT, fileToUpload);
    return response.data as FileUploadResponse;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

/**
 * Create person with photo upload
 */
export const createPersonWithPhoto = async (
  personData: Omit<Person, 'id' | 'photo'>,
  photoFile?: File
): Promise<PersonApiResponse> => {
  try {
    let photoUrl: string | undefined;

    // Upload photo if provided
    if (photoFile) {
      const uploadResponse = await uploadPhoto(photoFile);
      photoUrl = uploadResponse.data;
    }

    // Create person with photo URL
    const personWithPhoto: Omit<Person, 'id'> = {
      ...personData,
      photo: photoUrl,
    };

    return await createPerson(personWithPhoto);
  } catch (error) {
    console.error('Error creating person with photo:', error);
    throw error;
  }
};

/**
 * Update person with photo upload
 */
export const updatePersonWithPhoto = async (
  id: string,
  updates: Partial<Omit<Person, 'id'>>,
  photoFile?: File
): Promise<PersonApiResponse> => {
  try {
    let photoUrl: string | undefined;

    // Upload photo if provided
    if (photoFile) {
      const uploadResponse = await uploadPhoto(photoFile);
      photoUrl = uploadResponse.data;
    }

    // Update person with photo URL
    const updatesWithPhoto: Partial<Person> = {
      ...updates,
      photo: photoUrl,
    };

    return await updatePerson(id, updatesWithPhoto);
  } catch (error) {
    console.error('Error updating person with photo:', error);
    throw error;
  }
};

/**
 * Search people by name or other criteria
 */
export const searchPeople = async (query: string): Promise<PeopleApiResponse> => {
  try {
    const response = await apiGet<Person[]>(`${PEOPLE_ENDPOINT}/search?q=${encodeURIComponent(query)}`);
    return response as PeopleApiResponse;
  } catch (error) {
    console.error('Error searching people:', error);
    throw error;
  }
};

/**
 * Get people with pagination
 */
export const getPeoplePaginated = async (
  page: number = 1,
  limit: number = 10
): Promise<PeopleApiResponse> => {
  try {
    const response = await apiGet<Person[]>(
      `${PEOPLE_ENDPOINT}?page=${page}&limit=${limit}`
    );
    return response as PeopleApiResponse;
  } catch (error) {
    console.error('Error fetching paginated people:', error);
    throw error;
  }
};

/**
 * Export people data
 */
export const exportPeople = async (format: 'csv' | 'json' = 'json'): Promise<Blob> => {
  try {
    const response = await fetch(`${PEOPLE_ENDPOINT}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting people:', error);
    throw error;
  }
};

/**
 * Get file upload configuration
 */
export const getFileUploadConfig = (): FileUploadConfig => {
  return { ...FILE_UPLOAD_CONFIG };
};
