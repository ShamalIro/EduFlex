import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout
} from '../api/auth';

const AuthContext = createContext(undefined);

// TODO: Remove this bypass when login is ready
const DEV_BYPASS_AUTH = true;
// Change this to 'student', 'tutor', or 'admin' to test different roles
const DEV_MOCK_ROLE = 'tutor';
const DEV_MOCK_USER = {
  id: 'dev-user-123',
  firstName: 'Dev',
  lastName: 'User',
  email: 'dev@example.com',
  role: DEV_MOCK_ROLE
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEV_BYPASS_AUTH ? DEV_MOCK_USER : null);
  const [token, setToken] = useState(DEV_BYPASS_AUTH ? 'dev-token' : null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return; // Skip loading from storage in dev bypass mode

    setIsLoading(true);
    const storedToken = localStorage.getItem('eduflex_token');
    const storedUser = localStorage.getItem('eduflex_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  /**
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    setToken(response.token);
    setUser(response.user);
  };

  /**
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} password
   * @param {'student'|'tutor'} role
   */
  const register = async (firstName, lastName, email, password, role) => {
    const response = await apiRegister(firstName, lastName, email, password, role);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    apiLogout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
