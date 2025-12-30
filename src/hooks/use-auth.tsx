'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export enum UserRole {
  Patient = 'patient',
  Doctor = 'doctor',
  Admin = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Report {
  symptoms: string;
  possibleConditions: string;
  confidenceLevel: string;
  nextSteps: string;
  disclaimer: string;
  date: string;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  reports: Report[];
  isLoading: boolean;
  login: (email: string, password: string) => User | null;
  signup: (name: string, email: string, password: string, role: UserRole) => User | null;
  logout: () => void;
  addReport: (report: Report) => void;
  getAllReports: () => Report[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setToStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

// Mock initial data
const initializeMockData = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('initialized')) {
        const initialUsers: (User & {password: string})[] = [
            { id: '1', name: 'Admin User', email: 'admin@medichain.com', password: 'password', role: UserRole.Admin },
            { id: '2', name: 'Doctor Smith', email: 'doctor@medichain.com', password: 'password', role: UserRole.Doctor },
            { id: '3', name: 'Jane Patient', email: 'patient@medichain.com', password: 'password', role: UserRole.Patient },
        ];
        const initialReports: Report[] = [
            {
                symptoms: 'Headache and fatigue for 2 days.',
                possibleConditions: 'Common Cold, Influenza, Migraine',
                confidenceLevel: 'Medium',
                nextSteps: 'Rest and drink fluids. See a doctor if symptoms worsen.',
                disclaimer: 'This is not a medical diagnosis.',
                date: new Date(Date.now() - 86400000).toISOString(),
                userId: '3',
                userName: 'Jane Patient',
                userRole: UserRole.Patient,
            },
        ];

        setToStorage('users', initialUsers);
        setToStorage('reports', initialReports);
        localStorage.setItem('initialized', 'true');
    }
};

initializeMockData();


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const allUsers = getFromStorage<(User & {password: string})[]>('users', []);
    const allReports = getFromStorage<Report[]>('reports', []);
    const sessionUser = getFromStorage<User | null>('sessionUser', null);
    
    setUsers(allUsers.map(({ password, ...user }) => user)); // Exclude password from state
    setReports(allReports);
    
    if (sessionUser) {
      setUser(sessionUser);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): User | null => {
    const allUsers = getFromStorage<(User & {password: string})[]>('users', []);
    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userToSession } = foundUser;
      setUser(userToSession);
      setToStorage('sessionUser', userToSession);
      return userToSession;
    }
    return null;
  };

  const signup = (name: string, email: string, password: string, role: UserRole): User | null => {
    const allUsers = getFromStorage<(User & {password: string})[]>('users', []);
    if (allUsers.some(u => u.email === email)) {
      return null; // User already exists
    }

    const newUser: User & { password: string } = {
      id: String(allUsers.length + 1),
      name,
      email,
      password,
      role,
    };
    const updatedUsers = [...allUsers, newUser];
    setToStorage('users', updatedUsers);
    setUsers(updatedUsers.map(({ password, ...user }) => user));

    const { password: _, ...userToReturn } = newUser;
    return userToReturn;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('sessionUser');
    }
    router.push('/login');
  };

  const addReport = (report: Report) => {
    if (!user) return;
    const allReports = getFromStorage<Report[]>('reports', []);
    const newReport: Report = {
        ...report,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
    };
    const updatedReports = [newReport, ...allReports];
    setToStorage('reports', updatedReports);
    setReports(updatedReports);
  };
  
  const getAllReports = (): Report[] => {
    return getFromStorage<Report[]>('reports', []);
  };


  const authContextValue: AuthContextType = {
    user,
    users,
    reports: user ? reports.filter(r => r.userId === user.id) : [],
    isLoading,
    login,
    signup,
    logout,
    addReport,
    getAllReports,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
