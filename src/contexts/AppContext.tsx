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
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('vietanh_isLoggedIn') === 'true';
  });

  // Current user, defaulting to saved user or Admin first
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('vietanh_currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // Fallback
      }
    }
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

  // Login function
  const login = (uName: string, pWord: string): boolean => {
    const users = Database.getUsers();
    // Compare usernames in a case-insensitive manner to match "Admin" vs "admin" perfectly
    const foundUser = users.find(u => u.username.toLowerCase() === uName.trim().toLowerCase());

    if (!foundUser) {
      addToast('error', 'Đăng nhập thất bại', 'Tên đăng nhập không tồn tại trên hệ thống.');
      return false;
    }

    const userPass = foundUser.password || '1234';
    if (userPass !== pWord.trim()) {
      addToast('error', 'Đăng nhập thất bại', 'Mật khẩu không chính xác.');
      return false;
    }

    if (!foundUser.isActive) {
      addToast('error', 'Tài khoản bị khóa', 'Tài khoản này đã bị khóa. Vui lòng liên hệ Admin.');
      return false;
    }

    // Set credentials
    setCurrentUser(foundUser);
    setIsLoggedIn(true);
    localStorage.setItem('vietanh_isLoggedIn', 'true');
    localStorage.setItem('vietanh_currentUser', JSON.stringify(foundUser));

    // Redirect role
    if (foundUser.role === 'marketing') {
      setActiveTab('dashboard');
    } else if (foundUser.role === 'admissions') {
      setActiveTab('tuition-calc');
    } else {
      setActiveTab('dashboard');
    }

    // Add Audit log
    Database.addAuditLog(foundUser, 'ĐĂNG NHẬP', `Người dùng ${foundUser.fullName} đăng nhập hệ thống thành công.`);
    addToast('success', 'Đăng nhập thành công', `Chào mừng ${foundUser.fullName} đã đăng nhập.`);
    triggerDbRefresh();
    return true;
  };

  // Logout function
  const logout = () => {
    if (currentUser) {
      Database.addAuditLog(currentUser, 'ĐĂNG XUẤT', `Người dùng ${currentUser.fullName} đăng xuất.`);
    }
    setIsLoggedIn(false);
    localStorage.removeItem('vietanh_isLoggedIn');
    localStorage.removeItem('vietanh_currentUser');
    addToast('info', 'Đăng xuất', 'Đã đăng xuất tài khoản an toàn.');
    triggerDbRefresh();
  };

  // Switch user to easily test permissions in UI
  const switchUser = (role: UserRole) => {
    const users = Database.getUsers();
    const target = users.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('vietanh_currentUser', JSON.stringify(target));
      addToast('info', 'Chuyển đổi vai trò', `Đã chuyển sang tài khoản: ${target.fullName} (${role.toUpperCase()})`);
      
      // If switched to a role that does not have access to the current admin tab, redirect to tuition-calc or dashboard
      if (role === 'marketing' && !['dashboard', 'quote-history'].includes(activeTab)) {
        setActiveTab('dashboard');
      } else if (role === 'admissions' && !['tuition-calc', 'quote-sheet', 'quote-history', 'dashboard'].includes(activeTab)) {
        setActiveTab('tuition-calc');
      } else if (role === 'accountant' && !['dashboard', 'tuition-calc', 'quote-sheet', 'quote-history'].includes(activeTab)) {
        setActiveTab('dashboard');
      }
      triggerDbRefresh();
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
        triggerDbRefresh,
        isLoggedIn,
        login,
        logout
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
