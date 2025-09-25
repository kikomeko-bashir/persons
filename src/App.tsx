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

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<'enter' | 'show' | 'login' | 'register'>('login');

  const [people, setPeople] = useState<Person[]>(dummyPeople);

  const handlePersonAdd = (newPerson: Person) => {
    // Use functional update to add new person to existing array
    // This ensures we don't mutate the existing state
    setPeople(prev => [...prev, newPerson]);
  };

  const handlePeopleUpdate = (updatedPeople: Person[]) => {
    setPeople(updatedPeople);
  };

  const handleScreenChange = (screen: 'enter' | 'show') => {
    setCurrentScreen(screen);
  };

  const handleSwitchToLogin = () => {
    setCurrentScreen('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentScreen('register');
  };

  const handleLoginSuccess = () => {
    setCurrentScreen('enter');
  };

  const handleRegisterSuccess = () => {
    setCurrentScreen('enter');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {}
      <NavBar 
        currentScreen={currentScreen} 
        onScreenChange={handleScreenChange} 
      />
      
      {}
      <div style={{ flex: 1 }}>
        {}
        {currentScreen === 'enter' && (
          <EnterInfo onPersonAdd={handlePersonAdd} />
        )}
        {currentScreen === 'show' && (
          <ShowInfo people={people} onPeopleUpdate={handlePeopleUpdate} />
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
