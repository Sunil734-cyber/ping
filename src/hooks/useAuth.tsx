import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pingdaily_auth';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const { token: storedToken } = JSON.parse(storedAuth);
        
        // Verify token with backend
        fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data.user) {
              setUser(data.data.user);
              setToken(storedToken);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          })
          .catch(() => {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success && data.data) {
        const authData = {
          token: data.data.token,
          user: data.data.user
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setUser(data.data.user);
        setToken(data.data.token);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (username: string, password: string, email?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
      });

      const data = await response.json();

      if (data.success && data.data) {
        const authData = {
          token: data.data.token,
          user: data.data.user
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setUser(data.data.user);
        setToken(data.data.token);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error?.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, register, logout, username: user?.username || null }}>
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
