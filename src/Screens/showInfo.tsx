import React from 'react';
import type { Person } from '../types/Person';

interface ShowInfoProps {
  
  people: Person[];
}

export const ShowInfo: React.FC<ShowInfoProps> = ({ people }) => {
  return (
    <div style={styles.container}>
      <div style={styles.contentContainer}>
        {}
        <div style={styles.pageHeader}>
          <h2 style={styles.title}>Person Information</h2>
          {people.length > 0 && (
            <div style={styles.countBadge}>
              {people.length} {people.length === 1 ? 'Person' : 'People'}
            </div>
          )}
        </div>
        
        {}
        {people.length === 0 ? (
          
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3 style={styles.emptyTitle}>No People Added Yet</h3>
            <p style={styles.emptyText}>Start by adding people to your list using the "Enter Info" form.</p>
            <div style={styles.emptyAction}>
              <span style={styles.emptyActionText}>Click "Enter Info" in the sidebar to get started!</span>
            </div>
          </div>
        ) : (
          
          <div style={styles.peopleGrid}>
            {}
            {people.map((person) => (
              <div key={person.id} style={styles.personCard} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}>
                {}
                <div style={styles.cardHeader}>
                  <div style={styles.nameAndPhoto}>
                    {}
                    {person.photo && (
                      <img 
                        src={person.photo} 
                        alt={`${person.name}'s photo`}
                        style={styles.personPhoto}
                      />
                    )}
                    {}
                    <h3 style={styles.personName}>{person.name}</h3>
                  </div>
                  {}
                  <span style={styles.personAge}>Age: {person.age}</span>
                </div>
                
                {}
                <div style={styles.cardBody}>
                  {}
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Address:</span>
                    <span style={styles.infoValue}>{person.address}</span>
                  </div>
                  
                  {}
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

const styles = {
  
  container: {
    marginLeft: '300px',
    padding: '20px', // Internal spacing
    minHeight: '100vh',
    backgroundColor: '#f8f9fa', // Light gray background
  },

  contentContainer: {
    maxWidth: '1200px', // Maximum width for content
    margin: '0 auto',
  },

  pageHeader: {
    display: 'flex', // Flexbox layout
    justifyContent: 'space-between', // Space between title and count
    alignItems: 'center', // Center vertically
    marginBottom: '30px', // Space below header
    flexWrap: 'wrap' as const, // Wrap on small screens
    gap: '15px', // Gap between elements
  },

  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '28px', // Large, readable font
    fontWeight: 'bold', // Bold text
  },

  countBadge: {
    backgroundColor: '#3498db', 
    color: 'white', 
    padding: '8px 16px', // Internal spacing
    borderRadius: '20px', // Rounded pill shape
    fontSize: '14px', 
    fontWeight: 'bold', // Bold text
    boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)', 
  },

  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },

  emptyIcon: {
    fontSize: '48px', // Large emoji
    marginBottom: '20px', // Space below icon
  },

  emptyTitle: {
    fontSize: '24px', // Large title
    color: '#2c3e50', // Dark blue-gray color
    margin: '0 0 15px 0', // Space below title
    fontWeight: 'bold', // Bold text
  },

  emptyText: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },

  emptyAction: {
    padding: '15px 25px', // Internal spacing
    backgroundColor: '#ecf0f1', 
    borderRadius: '8px', 
    border: '2px dashed #bdc3c7', // Dashed border
  },

  emptyActionText: {
    fontSize: '14px', 
    color: '#7f8c8d', // Muted gray color
    fontStyle: 'italic', // Italic text
  },

  peopleGrid: {
    display: 'grid', // CSS Grid layout
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', // Responsive columns
    gap: '20px', // Space between cards
  },

  personCard: {
    backgroundColor: 'white', 
    borderRadius: '10px', 
    padding: '20px', // Internal spacing
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
    transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Smooth hover effects
    border: '1px solid #e0e0e0', 
    cursor: 'pointer',
  },

  cardHeader: {
    display: 'flex', // Flexbox layout
    justifyContent: 'space-between', // Space between name and age
    alignItems: 'center', // Center vertically
    marginBottom: '15px', // Space below header
    paddingBottom: '10px',
    borderBottom: '2px solid #ecf0f1',
  },

  nameAndPhoto: {
    display: 'flex', // Flexbox layout
    alignItems: 'center', // Center vertically
    gap: '12px', // Space between photo and name
  },

  personPhoto: {
    width: '50px', // Fixed width
    height: '50px', // Fixed height (square)
    borderRadius: '50%', // Make it circular
    objectFit: 'cover' as const,
    border: '2px solid #e0e0e0', 
  },

  personName: {
    margin: 0,
    fontSize: '20px', // Large, readable font
    color: '#2c3e50', // Dark blue-gray color
    fontWeight: 'bold', // Bold text
  },

  personAge: {
    fontSize: '14px', 
    color: '#7f8c8d', // Muted gray color
    backgroundColor: '#ecf0f1', 
    padding: '4px 8px', // Internal spacing
    borderRadius: '12px', // Rounded pill shape
  },

  cardBody: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const, // Stack info rows vertically
    gap: '10px', // Space between info rows
  },

  infoRow: {
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const,
    gap: '4px', // Small gap between label and value
  },

  infoLabel: {
    fontSize: '14px', 
    fontWeight: 'bold', // Bold text
    color: '#7f8c8d', // Muted gray color
    textTransform: 'uppercase' as const, // Uppercase text
  },

  infoValue: {
    fontSize: '16px',
    color: '#2c3e50', // Dark blue-gray color
    wordBreak: 'break-word' as const, // Break long words if needed
  },
};
