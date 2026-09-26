import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemo: (role: 'admin' | 'analyst' | 'viewer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Failed to restore user session:', err);
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password: pass, role });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const loginAsDemo = async (role: 'admin' | 'analyst' | 'viewer') => {
    const creds = {
      admin: { email: 'admin@mailtrace.soc', pass: 'Admin@MailTrace2025!' },
      analyst: { email: 'analyst@mailtrace.soc', pass: 'Analyst@MailTrace2025!' },
      viewer: { email: 'viewer@mailtrace.soc', pass: 'Viewer@MailTrace2025!' },
    }[role];

    await login(creds.email, creds.pass);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
