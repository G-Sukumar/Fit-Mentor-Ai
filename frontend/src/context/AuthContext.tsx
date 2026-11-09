import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/fitness';
import { apiService } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  submitOnboarding: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfileState: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'fitmentor_jwt_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const profile = await apiService.getProfile(storedToken);
          setUser(profile);
          setToken(storedToken);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUserSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiService.loginUser(email, pass);
      if (res.success && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        const profile = await apiService.getProfile(res.token);
        setUser(profile);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Network error during login.' };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiService.registerUser(name, email, pass);
      if (res.success && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        const profile = await apiService.getProfile(res.token);
        setUser(profile);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Network error during registration.' };
    }
  };

  const submitOnboarding = async (data: any) => {
    try {
      const res = await apiService.completeOnboarding(data);
      if (res.success && res.profile) {
        setUser(res.profile);
        return { success: true };
      }
      return { success: false, message: 'Failed to save onboarding profile.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error submitting onboarding data.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUserProfileState = (updated: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        submitOnboarding,
        logout,
        updateUserProfileState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
