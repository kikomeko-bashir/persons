/**
 * Person Interface - Defines the structure for person data
 * This interface is used throughout the application to ensure type safety
 * and consistency when working with person information
 */
export interface Person {
  /** Unique identifier for each person (auto-generated using Date.now()) */
  id: number;
  
  /** Full name of the person */
  name: string;
  
  /** Age of the person in years */
  age: number;
  
  /** Physical address of the person */
  address: string;
  
  /** Phone number of the person */
  phone: string;
  
  /** 
   * Optional photo of the person
   * Can be either a Base64 encoded image string or a URL
   * The ? makes this field optional - not all people need to have photos
   */
  photo?: string;
}
