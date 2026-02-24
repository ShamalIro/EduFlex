import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout
} from '../api/auth';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {'student'|'tutor'} role
   */
  const register = async (name, email, password, role) => {
    const response = await apiRegister(name, email, password, role);
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
