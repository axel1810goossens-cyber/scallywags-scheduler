import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(user => {
      setCurrentUser(prevUser => {
        // If we have a mock user and Firebase reports null, keep the mock user
        if (prevUser?.uid === 'admin-test-id' && !user) {
          return prevUser;
        }
        return user;
      });
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setCurrentUser(null);
    }
    return result;
  };

  const resetPassword = async email => {
    return await authService.resetPassword(email);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
