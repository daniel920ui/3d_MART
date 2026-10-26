import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: { fullName: string; email: string; phone: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (role: 'customer' | 'owner' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nearmart_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize or fetch current user
  useEffect(() => {
    async function initUser() {
      const storedToken = localStorage.getItem('nearmart_token');
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setLoading(false);
          return;
        } catch (e) {
          console.warn('Stored token invalid, falling back to default customer');
        }
      }

      // Auto-authenticate default demo customer for seamless demonstration
      try {
        const { token: demoToken, user: demoUser } = await api.login('customer@nearmart.com', 'Customer@123');
        localStorage.setItem('nearmart_token', demoToken);
        setToken(demoToken);
        setUser(demoUser);
      } catch (err) {
        console.error('Failed to init demo user', err);
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('nearmart_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (params: { fullName: string; email: string; phone: string; password: string; role?: string }) => {
    const data = await api.register(params);
    localStorage.setItem('nearmart_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('nearmart_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoAccount = async (role: 'customer' | 'owner' | 'admin') => {
    setLoading(true);
    try {
      let email = 'customer@nearmart.com';
      let pass = 'Customer@123';
      if (role === 'owner') {
        email = 'owner@freshmart.com';
        pass = 'Owner@123';
      } else if (role === 'admin') {
        email = 'admin@nearmart.com';
        pass = 'Admin@123';
      }
      await login(email, pass);
    } catch (err) {
      console.error('Error switching demo account', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
