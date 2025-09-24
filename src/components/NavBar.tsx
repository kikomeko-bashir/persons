import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Props interface for the NavBar component
 * Defines what data the component needs to function properly
 */
interface NavBarProps {
  /** Current active screen - determines which button is highlighted */
  currentScreen: 'enter' | 'show';
  
  /** Callback function called when user clicks a navigation button */
  onScreenChange: (screen: 'enter' | 'show') => void;
}

/**
 * NavBar Component - Left sidebar navigation
 * 
 * This component provides navigation between the two main screens:
 * - Enter Info: Form to add new people
 * - Show Info: Display list of all people
 * 
 * Features:
 * - Fixed left sidebar (200px width)
 * - Active state highlighting
 * - Dark theme with hover effects
 * - Responsive button styling
 */
export const NavBar: React.FC<NavBarProps> = ({ currentScreen, onScreenChange }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav style={styles.navbar}>
      {/* User Info Section */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.username || 'User'}</div>
          <div style={styles.userEmail}>{user?.email || ''}</div>
        </div>
      </div>

      {/* Enter Info Navigation Button */}
      <div style={styles.navItem}>
        <button
          style={{
            ...styles.navButton, // Base button styles
            ...(currentScreen === 'enter' ? styles.activeButton : {}) // Add active styles if this is the current screen
          }}
          onClick={() => onScreenChange('enter')} // Switch to enter screen when clicked
        >
          Enter Info
        </button>
      </div>
      
      {/* Show Info Navigation Button */}
      <div style={styles.navItem}>
        <button
          style={{
            ...styles.navButton, // Base button styles
            ...(currentScreen === 'show' ? styles.activeButton : {}) // Add active styles if this is the current screen
          }}
          onClick={() => onScreenChange('show')} // Switch to show screen when clicked
        >
          Show Info
        </button>
      </div>

      {/* Logout Button */}
      <div style={styles.navItem}>
        <button
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

/**
 * Styles object for the NavBar component
 * Contains all the CSS-in-JS styles used for the navigation bar
 */
const styles = {
  /** Main navigation container - fixed left sidebar */
  navbar: {
    position: 'fixed' as const, // Fixed position so it stays in place when scrolling
    left: 0, // Positioned at the left edge of the screen
    top: 0, // Positioned at the top of the screen
    width: '300px', // Fixed width for the sidebar
    height: '100vh', // Full viewport height
    backgroundColor: '#2c3e50', // Dark blue-gray background
    padding: '20px 0', // Vertical padding for spacing
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const, // Stack buttons vertically
    alignItems: 'center', // Center buttons horizontally
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)', // Subtle shadow for depth
  },
  
  /** Container for each navigation button */
  navItem: {
    width: '100%', // Take full width of sidebar
    marginBottom: '10px', // Space between buttons
  },
  
  /** Base styles for navigation buttons */
  navButton: {
    width: '260px', // Fixed button width
    padding: '12px 20px', // Internal spacing
    backgroundColor: 'transparent', // No background by default
    color: '#ecf0f1', // Light gray text
    border: 'none', // No border
    borderRadius: '5px', // Rounded corners
    cursor: 'pointer', // Pointer cursor on hover
    fontSize: '16px', // Readable font size
    transition: 'all 0.3s ease', // Smooth transitions for hover effects
    textAlign: 'left' as const, // Left-align text
  },
  
  /** Styles for the currently active button */
  activeButton: {
    backgroundColor: '#3498db', // Blue background for active state
    color: 'white', // White text for contrast
  },

  /** User section styles */
  userSection: {
    width: '100%',
    padding: '0 20px 20px 20px',
    borderBottom: '1px solid #34495e',
    marginBottom: '20px',
  },

  /** User info container */
  userInfo: {
    textAlign: 'center' as const,
  },

  /** User name styles */
  userName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: '5px',
  },

  /** User email styles */
  userEmail: {
    fontSize: '14px',
    color: '#bdc3c7',
  },

  /** Logout button styles */
  logoutButton: {
    width: '260px',
    padding: '12px 20px',
    backgroundColor: '#e74c3c', // Red background for logout
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    textAlign: 'left' as const,
  },
};
