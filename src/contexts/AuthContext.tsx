import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'professional' | 'admin';
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType?: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demo
const DEMO_USERS = [
  { id: '1', email: 'student@demo.com', password: 'demo123', name: 'Alex Student', userType: 'student' as const, isVerified: true },
  { id: '2', email: 'professional@demo.com', password: 'demo123', name: 'Sarah Professional', userType: 'professional' as const, isVerified: true },
  { id: '3', email: 'admin@demo.com', password: 'admin123', name: 'Admin User', userType: 'admin' as const, isVerified: true },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('coliving_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'user' | 'admin' = 'user'): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = DEMO_USERS.find(u => 
      u.email === email && 
      u.password === password && 
      (userType === 'admin' ? u.userType === 'admin' : u.userType !== 'admin')
    );
    
    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        userType: foundUser.userType,
        isVerified: foundUser.isVerified
      };
      setUser(userWithoutPassword);
      localStorage.setItem('coliving_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coliving_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};