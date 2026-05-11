import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  isPhoneVerified: boolean;
  completionScore: number;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sync with LocalStorage first for instant UI
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // If we have a firebase user but no local user object, 
        // we might need to fetch it from our backend using the ID token
        try {
          const idToken = await fbUser.getIdToken();
          // We can call a specialized endpoint or just include the idToken in headers
          // For now, let's assume if we have a firebase user, we should try to sync
          localStorage.setItem('firebaseIdToken', idToken);
        } catch (error) {
          console.error("Error getting ID token", error);
        }
      } else {
        localStorage.removeItem('firebaseIdToken');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('firebaseIdToken');
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
