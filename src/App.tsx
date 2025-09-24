import React, { useState } from 'react';
import { NavBar } from './components/NavBar';
import { EnterInfo } from './Screens/enterInfo';
import { ShowInfo } from './Screens/showInfo';
import { Login } from './Screens/login';
import { Register } from './Screens/register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { Person } from './types/Person';
import { dummyPeople } from './data/dummyData';
import './index.css';

/**
 * Main App Component - Root component of the Person Information Application
 * 
 * This component serves as the central hub that:
 * - Manages application state (current screen, people data)
 * - Coordinates communication between child components
 * - Handles navigation between screens
 * - Manages the people data lifecycle
 * 
 * Architecture:
 * - State Management: Uses React hooks for local state
 * - Component Composition: Renders NavBar + conditional screen content
 * - Data Flow: Passes data down to child components via props
 * - Event Handling: Receives callbacks from child components
 */
/**
 * Main App Content Component
 * This component handles the main application logic and rendering
 */
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  /**
   * State for tracking which screen is currently active
   * - 'enter': Shows the form for adding new people
   * - 'show': Shows the list of all people
   * - 'login': Shows the login form
   * - 'register': Shows the registration form
   */
  const [currentScreen, setCurrentScreen] = useState<'enter' | 'show' | 'login' | 'register'>('login');
  
  /**
   * State for storing all people data
   * - Initialized with dummy data for immediate visual feedback
   * - Updated when new people are added via the form
   * - Passed to ShowInfo component for display
   */
  const [people, setPeople] = useState<Person[]>(dummyPeople);

  /**
   * Handles adding a new person to the people list
   * 
   * This function is called by the EnterInfo component when:
   * 1. User fills out the form
   * 2. Form validation passes
   * 3. User clicks "Add Person" button
   * 
   * @param newPerson - The Person object created from form data
   */
  const handlePersonAdd = (newPerson: Person) => {
    // Use functional update to add new person to existing array
    // This ensures we don't mutate the existing state
    setPeople(prev => [...prev, newPerson]);
  };

  /**
   * Handles navigation between screens
   * 
   * This function is called by the NavBar component when:
   * - User clicks "Enter Info" button
   * - User clicks "Show Info" button
   * 
   * @param screen - The screen to navigate to ('enter' or 'show')
   */
  const handleScreenChange = (screen: 'enter' | 'show') => {
    setCurrentScreen(screen);
  };

  /**
   * Handles switching to login screen
   */
  const handleSwitchToLogin = () => {
    setCurrentScreen('login');
  };

  /**
   * Handles switching to register screen
   */
  const handleSwitchToRegister = () => {
    setCurrentScreen('register');
  };

  /**
   * Handles successful login
   */
  const handleLoginSuccess = () => {
    setCurrentScreen('enter');
  };

  /**
   * Handles successful registration
   */
  const handleRegisterSuccess = () => {
    setCurrentScreen('enter');
  };

  /**
   * Handles login error
   */
  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  /**
   * Handles registration error
   */
  const handleRegisterError = (error: string) => {
    console.error('Registration error:', error);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {currentScreen === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            onLoginError={handleLoginError}
          />
        )}
        {currentScreen === 'register' && (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={handleSwitchToLogin}
            onRegisterError={handleRegisterError}
          />
        )}
      </div>
    );
  }

  /**
   * Renders the main application layout
   * 
   * Layout Structure:
   * - Fixed left sidebar (NavBar)
   * - Flexible content area that shows different screens based on currentScreen state
   * 
   * The layout uses flexbox for responsive design:
   * - NavBar has fixed width (200px)
   * - Content area takes remaining space (flex: 1)
   */
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left sidebar navigation */}
      <NavBar 
        currentScreen={currentScreen} 
        onScreenChange={handleScreenChange} 
      />
      
      {/* Main content area */}
      <div style={{ flex: 1 }}>
        {/* Conditional rendering based on current screen */}
        {currentScreen === 'enter' && (
          <EnterInfo onPersonAdd={handlePersonAdd} />
        )}
        {currentScreen === 'show' && (
          <ShowInfo people={people} />
        )}
      </div>
    </div>
  );
}

/**
 * Main App Component with Authentication Provider
 * This is the root component that wraps everything with the AuthProvider
 */
export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
