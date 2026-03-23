import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '@/utils/storage';

interface AuthContextType {
  isLogged: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setIsLogged: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user was previously logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const saved = await storage.getItem('userLogged');
        if (saved) {
          setIsLogged(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulate login (in real app, this would call backend API)
      await storage.setItem('userLogged', 'true');
      await storage.setItem('userEmail', email);
      setIsLogged(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem('userLogged');
      await storage.removeItem('userEmail');
      setIsLogged(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLogged, isLoading, login, logout, setIsLogged }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
