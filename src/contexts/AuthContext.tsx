import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getStoredToken, clearToken } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { login: loginApi } = await import('../services/api');
      const response = await loginApi(username, password);
      
      if (response.success && response.data) {
        setToken(response.data.token);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to notify backend
      const { logout: logoutApi } = await import('../services/api');
      await logoutApi();
    } catch (error) {
      // Even if API call fails, we should still clear local storage
      console.error('Logout API call error:', error);
    } finally {
      // Always clear local storage and update state
      clearToken();
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        login,
        logout,
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

