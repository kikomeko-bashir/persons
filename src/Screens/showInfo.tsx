import React from 'react';
import type { Person } from '../types/Person';

/**
 * Props interface for the ShowInfo component
 * Defines what data the component needs to function
 */
interface ShowInfoProps {
  /** Array of Person objects to display */
  people: Person[];
}

/**
 * ShowInfo Component - Screen for displaying all people
 * 
 * This screen displays a list of all people in a responsive card grid layout.
 * It handles both empty state (no people) and populated state (showing people).
 * 
 * Features:
 * - Responsive grid layout that adapts to screen size
 * - Professional card design with photos
 * - Empty state message when no people exist
 * - Clean, organized information display
 * - Hover effects for better interactivity
 */
export const ShowInfo: React.FC<ShowInfoProps> = ({ people }) => {
  return (
    <div style={styles.container}>
      <div style={styles.contentContainer}>
        {/* Page header with title and count */}
        <div style={styles.pageHeader}>
          <h2 style={styles.title}>Person Information</h2>
          {people.length > 0 && (
            <div style={styles.countBadge}>
              {people.length} {people.length === 1 ? 'Person' : 'People'}
            </div>
          )}
        </div>
        
        {/* Conditional rendering based on whether people exist */}
        {people.length === 0 ? (
          /* Empty state - shown when no people are added yet */
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3 style={styles.emptyTitle}>No People Added Yet</h3>
            <p style={styles.emptyText}>Start by adding people to your list using the "Enter Info" form.</p>
            <div style={styles.emptyAction}>
              <span style={styles.emptyActionText}>Click "Enter Info" in the sidebar to get started!</span>
            </div>
          </div>
        ) : (
          /* People grid - shown when people exist */
          <div style={styles.peopleGrid}>
            {/* Map through each person and create a card */}
            {people.map((person) => (
              <div key={person.id} style={styles.personCard} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}>
                {/* Card header with photo, name, and age */}
                <div style={styles.cardHeader}>
                  <div style={styles.nameAndPhoto}>
                    {/* Display photo if it exists */}
                    {person.photo && (
                      <img 
                        src={person.photo} 
                        alt={`${person.name}'s photo`}
                        style={styles.personPhoto}
                      />
                    )}
                    {/* Person's name */}
                    <h3 style={styles.personName}>{person.name}</h3>
                  </div>
                  {/* Person's age */}
                  <span style={styles.personAge}>Age: {person.age}</span>
                </div>
                
                {/* Card body with address and phone information */}
                <div style={styles.cardBody}>
                  {/* Address information row */}
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Address:</span>
                    <span style={styles.infoValue}>{person.address}</span>
                  </div>
                  
                  {/* Phone information row */}
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Phone:</span>
                    <span style={styles.infoValue}>{person.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Styles object for the ShowInfo component
 * Contains all CSS-in-JS styles for the people display screen
 */
const styles = {
  /** Main container - accounts for fixed navbar width */
  container: {
    marginLeft: '300px', // Space for fixed navbar (300px wide)
    padding: '20px', // Internal spacing
    minHeight: '100vh', // Full viewport height
    backgroundColor: '#f8f9fa', // Light gray background
  },
  
  /** Content container - centers and limits width */
  contentContainer: {
    maxWidth: '1200px', // Maximum width for content
    margin: '0 auto', // Center the content
  },
  
  /** Page header container */
  pageHeader: {
    display: 'flex', // Flexbox layout
    justifyContent: 'space-between', // Space between title and count
    alignItems: 'center', // Center vertically
    marginBottom: '30px', // Space below header
    flexWrap: 'wrap' as const, // Wrap on small screens
    gap: '15px', // Gap between elements
  },

  /** Page title styling */
  title: {
    margin: 0, // Remove default margin
    color: '#2c3e50', // Dark blue-gray color
    fontSize: '28px', // Large, readable font
    fontWeight: 'bold', // Bold text
  },

  /** Count badge styling */
  countBadge: {
    backgroundColor: '#3498db', // Blue background
    color: 'white', // White text
    padding: '8px 16px', // Internal spacing
    borderRadius: '20px', // Rounded pill shape
    fontSize: '14px', // Smaller font
    fontWeight: 'bold', // Bold text
    boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)', // Subtle shadow
  },
  
  /** Empty state container - shown when no people exist */
  emptyState: {
    textAlign: 'center' as const, // Center the content
    padding: '60px 20px', // Generous padding
    backgroundColor: 'white', // White background
    borderRadius: '10px', // Rounded corners
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
  },
  
  /** Empty state icon styling */
  emptyIcon: {
    fontSize: '48px', // Large emoji
    marginBottom: '20px', // Space below icon
  },

  /** Empty state title styling */
  emptyTitle: {
    fontSize: '24px', // Large title
    color: '#2c3e50', // Dark blue-gray color
    margin: '0 0 15px 0', // Space below title
    fontWeight: 'bold', // Bold text
  },

  /** Empty state text styling */
  emptyText: {
    fontSize: '16px', // Readable font size
    color: '#7f8c8d', // Muted gray color
    margin: '0 0 20px 0', // Space below text
    lineHeight: '1.5', // Better line spacing
  },

  /** Empty state action container */
  emptyAction: {
    padding: '15px 25px', // Internal spacing
    backgroundColor: '#ecf0f1', // Light background
    borderRadius: '8px', // Rounded corners
    border: '2px dashed #bdc3c7', // Dashed border
  },

  /** Empty state action text */
  emptyActionText: {
    fontSize: '14px', // Smaller font
    color: '#7f8c8d', // Muted gray color
    fontStyle: 'italic', // Italic text
  },
  
  /** Responsive grid for people cards */
  peopleGrid: {
    display: 'grid', // CSS Grid layout
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', // Responsive columns
    gap: '20px', // Space between cards
  },
  
  /** Individual person card styling */
  personCard: {
    backgroundColor: 'white', // White background
    borderRadius: '10px', // Rounded corners
    padding: '20px', // Internal spacing
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow
    transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Smooth hover effects
    border: '1px solid #e0e0e0', // Light border
    cursor: 'pointer', // Pointer cursor on hover
  },
  
  /** Card header - contains photo, name, and age */
  cardHeader: {
    display: 'flex', // Flexbox layout
    justifyContent: 'space-between', // Space between name and age
    alignItems: 'center', // Center vertically
    marginBottom: '15px', // Space below header
    paddingBottom: '10px', // Space above border
    borderBottom: '2px solid #ecf0f1', // Light border separator
  },
  
  /** Container for name and photo */
  nameAndPhoto: {
    display: 'flex', // Flexbox layout
    alignItems: 'center', // Center vertically
    gap: '12px', // Space between photo and name
  },
  
  /** Person photo styling - circular profile picture */
  personPhoto: {
    width: '50px', // Fixed width
    height: '50px', // Fixed height (square)
    borderRadius: '50%', // Make it circular
    objectFit: 'cover' as const, // Crop image to fit
    border: '2px solid #e0e0e0', // Light border
  },
  
  /** Person name styling */
  personName: {
    margin: 0, // Remove default margin
    fontSize: '20px', // Large, readable font
    color: '#2c3e50', // Dark blue-gray color
    fontWeight: 'bold', // Bold text
  },
  
  /** Person age styling - pill-shaped badge */
  personAge: {
    fontSize: '14px', // Smaller font
    color: '#7f8c8d', // Muted gray color
    backgroundColor: '#ecf0f1', // Light background
    padding: '4px 8px', // Internal spacing
    borderRadius: '12px', // Rounded pill shape
  },
  
  /** Card body - contains address and phone info */
  cardBody: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const, // Stack info rows vertically
    gap: '10px', // Space between info rows
  },
  
  /** Individual info row (address or phone) */
  infoRow: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const, // Stack label above value
    gap: '4px', // Small gap between label and value
  },
  
  /** Info label styling (Address:, Phone:) */
  infoLabel: {
    fontSize: '14px', // Smaller font
    fontWeight: 'bold', // Bold text
    color: '#7f8c8d', // Muted gray color
    textTransform: 'uppercase' as const, // Uppercase text
  },
  
  /** Info value styling (actual address/phone) */
  infoValue: {
    fontSize: '16px', // Readable font size
    color: '#2c3e50', // Dark blue-gray color
    wordBreak: 'break-word' as const, // Break long words if needed
  },
};
