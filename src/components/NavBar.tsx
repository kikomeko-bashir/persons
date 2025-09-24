import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavBarProps {
  
  currentScreen: 'enter' | 'show';

  onScreenChange: (screen: 'enter' | 'show') => void;
}

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
      {}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.username || 'User'}</div>
          <div style={styles.userEmail}>{user?.email || ''}</div>
        </div>
      </div>

      {}
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
      
      {}
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

      {}
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

const styles = {
  
  navbar: {
    position: 'fixed' as const, // Fixed position so it stays in place when scrolling
    left: 0, // Positioned at the left edge of the screen
    top: 0, // Positioned at the top of the screen
    width: '300px', // Fixed width for the sidebar
    height: '100vh',
    backgroundColor: '#2c3e50', // Dark blue-gray background
    padding: '20px 0', // Vertical padding for spacing
    display: 'flex', // Flexbox layout
    flexDirection: 'column' as const, // Stack buttons vertically
    alignItems: 'center', // Center buttons horizontally
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  },

  navItem: {
    width: '100%', // Take full width of sidebar
    marginBottom: '10px', // Space between buttons
  },

  navButton: {
    width: '260px', // Fixed button width
    padding: '12px 20px', // Internal spacing
    backgroundColor: 'transparent', // No background by default
    color: '#ecf0f1', // Light gray text
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    textAlign: 'left' as const, // Left-align text
  },

  activeButton: {
    backgroundColor: '#3498db',
    color: 'white',
  },

  userSection: {
    width: '100%',
    padding: '0 20px 20px 20px',
    borderBottom: '1px solid #34495e',
    marginBottom: '20px',
  },

  userInfo: {
    textAlign: 'center' as const,
  },

  userName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: '5px',
  },

  userEmail: {
    fontSize: '14px',
    color: '#bdc3c7',
  },

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
