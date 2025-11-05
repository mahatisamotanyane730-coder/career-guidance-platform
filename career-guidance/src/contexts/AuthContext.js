import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('🔄 Checking authentication status...');
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        // ✅ FIX: Ensure user has userType property with proper fallbacks
        const userWithType = {
          ...currentUser,
          userType: currentUser.userType || currentUser.role || 'student', // Default to student
          role: currentUser.userType || currentUser.role || 'student' // Ensure both fields exist
        };
        
        console.log('✅ User authenticated:', userWithType);
        console.log('🔑 User role:', userWithType.userType);
        setUser(userWithType);
        localStorage.setItem('user', JSON.stringify(userWithType));
      } else {
        console.log('🔐 No authenticated user found');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Attempting login for:', email);
      const user = await authService.login(email, password);
      
      if (user) {
        // ✅ FIX: Ensure user has userType property with proper fallbacks
        const userWithType = {
          ...user,
          userType: user.userType || user.role || 'student', // Default to student
          role: user.userType || user.role || 'student' // Ensure both fields exist
        };
        
        console.log('✅ Login successful, user data:', userWithType);
        console.log('🔑 User role after login:', userWithType.userType);
        setUser(userWithType);
        localStorage.setItem('user', JSON.stringify(userWithType));
        return { success: true, user: userWithType };
      } else {
        setError('Login failed - no user returned');
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const user = await authService.register(userData);
      
      if (user) {
        // ✅ FIX: Ensure user has userType property with proper fallbacks
        const userWithType = {
          ...user,
          userType: user.userType || user.role || 'student',
          role: user.userType || user.role || 'student'
        };
        
        console.log('✅ Registration successful, user data:', userWithType);
        return { 
          success: true, 
          message: 'Registration successful! Please login with your credentials.',
          user: userWithType 
        };
      } else {
        setError('Registration failed - no user returned');
        return { success: false, message: 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('user');
      setError(null);
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Function to manually update user data (useful when profile is updated)
  const updateUser = (updatedUserData) => {
    if (user) {
      const mergedUser = {
        ...user,
        ...updatedUserData,
        userType: updatedUserData.userType || user.userType,
        role: updatedUserData.userType || updatedUserData.role || user.role
      };
      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
    updateUser // Add this new function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};