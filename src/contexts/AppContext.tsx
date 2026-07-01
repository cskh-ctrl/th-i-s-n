import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, FeeQuote } from '../types';
import { Database } from '../store/db';

export type ActiveTab = 
  | 'dashboard'
  | 'tuition-calc'
  | 'quote-sheet'
  | 'quote-history'
  | 'fee-items'
  | 'fee-categories'
  | 'education-levels'
  | 'classes'
  | 'academic-years'
  | 'discount-policies'
  | 'user-permissions'
  | 'data-backup'
  | 'audit-logs'
  | 'system-settings';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User;
  switchUser: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  toasts: Toast[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  selectedQuoteForSheet: FeeQuote | null;
  setSelectedQuoteForSheet: (quote: FeeQuote | null) => void;
  dbTrigger: number;
  triggerDbRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Current user, defaulting to admin so they can see all options first
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const users = Database.getUsers();
    return users.find(u => u.role === 'admin') || users[0];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedQuoteForSheet, setSelectedQuoteForSheet] = useState<FeeQuote | null>(null);
  const [dbTrigger, setDbTrigger] = useState<number>(0);

  const triggerDbRefresh = () => {
    setDbTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Seed initial data to Firestore if it is a brand-new DB setup
    Database.seedIfEmpty().then(() => {
      triggerDbRefresh();
    });

    // Start listening for real-time changes
    const unsubscribe = Database.startRealtimeSync(() => {
      triggerDbRefresh();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Switch user to easily test permissions in UI
  const switchUser = (role: UserRole) => {
    const users = Database.getUsers();
    const target = users.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
      addToast('info', 'Chuyển đổi vai trò', `Đã chuyển sang tài khoản: ${target.fullName} (${role.toUpperCase()})`);
      
      // If switched to a role that does not have access to the current admin tab, redirect to tuition-calc or dashboard
      if (role === 'marketing' && !['dashboard', 'quote-history'].includes(activeTab)) {
        setActiveTab('dashboard');
      } else if (role === 'admissions' && !['tuition-calc', 'quote-sheet', 'quote-history', 'dashboard'].includes(activeTab)) {
        setActiveTab('tuition-calc');
      } else if (role === 'accountant' && !['dashboard', 'tuition-calc', 'quote-sheet', 'quote-history'].includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        activeTab,
        setActiveTab,
        toasts,
        addToast,
        removeToast,
        selectedQuoteForSheet,
        setSelectedQuoteForSheet,
        dbTrigger,
        triggerDbRefresh
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
