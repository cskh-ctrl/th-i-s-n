import React, { useState } from 'react';
import { useApp, ActiveTab } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { Database } from '../store/db';
import { 
  LayoutDashboard, 
  Calculator, 
  FileText, 
  History, 
  Layers, 
  GraduationCap, 
  Bookmark, 
  Calendar, 
  Tag, 
  Settings, 
  Database as DbIcon, 
  Users, 
  Activity, 
  Bell, 
  Sun, 
  Moon, 
  ChevronRight, 
  Shield, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';
import { Button, ToastContainer } from '../components/UI';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { 
    currentUser, 
    switchUser, 
    activeTab, 
    setActiveTab, 
    toasts, 
    removeToast,
    selectedQuoteForSheet,
    logout
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState([
    { id: '1', title: 'Có biểu phí năm học mới', desc: 'Biểu phí năm học 2027-2028 đã được tạo dự thảo bởi Admin.', date: 'Hôm nay' },
    { id: '2', title: 'Cập nhật hệ thống thành công', desc: 'Tính năng in báo phí A4/A5 và tạo VietQR đã kích hoạt.', date: 'Hôm qua' },
    { id: '3', title: 'Dữ liệu đã tự động sao lưu', desc: 'Lịch sử sao lưu LocalStorage đã hoàn tất lưu trữ an toàn.', date: '3 ngày trước' }
  ]);

  // Define sidebar items with role security constraints
  const menuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    roles: string[];
    group: 'calculator' | 'settings' | 'general';
  }[] = [
    // General
    { id: 'dashboard', label: 'Báo cáo tổng quan', icon: <LayoutDashboard className="w-4.5 h-4.5" />, roles: ['admin', 'accountant', 'admissions', 'marketing'], group: 'general' },
    { id: 'tuition-calc', label: 'Tính toán học phí', icon: <Calculator className="w-4.5 h-4.5" />, roles: ['admin', 'accountant', 'admissions'], group: 'general' },
    { id: 'quote-sheet', label: 'Bảng báo học phí', icon: <FileText className="w-4.5 h-4.5" />, roles: ['admin', 'accountant', 'admissions'], group: 'general' },
    { id: 'quote-history', label: 'Lịch sử tính phí', icon: <History className="w-4.5 h-4.5" />, roles: ['admin', 'accountant', 'admissions', 'marketing'], group: 'general' },

    // Configuration / Fee Settings (Admin Only)
    { id: 'fee-items', label: 'Quản lý biểu phí', icon: <Bookmark className="w-4.5 h-4.5" />, roles: ['admin'], group: 'calculator' },
    { id: 'fee-categories', label: 'Danh mục khoản phí', icon: <Layers className="w-4.5 h-4.5" />, roles: ['admin'], group: 'calculator' },
    { id: 'education-levels', label: 'Khối học phổ thông', icon: <GraduationCap className="w-4.5 h-4.5" />, roles: ['admin'], group: 'calculator' },
    { id: 'classes', label: 'Danh sách lớp học', icon: <Users className="w-4.5 h-4.5" />, roles: ['admin'], group: 'calculator' },
    { id: 'academic-years', label: 'Cài đặt năm học', icon: <Calendar className="w-4.5 h-4.5" />, roles: ['admin'], group: 'calculator' },
    { id: 'discount-policies', label: 'Chính sách giảm giá', icon: <Tag className="w-4.5 h-4.5" />, roles: ['admin'], group: 'calculator' },

    // Administration Setup
    { id: 'user-permissions', label: 'Người dùng & Quyền', icon: <Shield className="w-4.5 h-4.5" />, roles: ['admin'], group: 'settings' },
    { id: 'data-backup', label: 'Sao lưu & Nhập xuất', icon: <DbIcon className="w-4.5 h-4.5" />, roles: ['admin', 'accountant'], group: 'settings' },
    { id: 'audit-logs', label: 'Nhật ký thay đổi', icon: <Activity className="w-4.5 h-4.5" />, roles: ['admin'], group: 'settings' },
    { id: 'system-settings', label: 'Cài đặt trường học', icon: <Settings className="w-4.5 h-4.5" />, roles: ['admin'], group: 'settings' }
  ];

  // Grouped items
  const generalItems = menuItems.filter(item => item.group === 'general' && item.roles.includes(currentUser.role));
  const calculatorItems = menuItems.filter(item => item.group === 'calculator' && item.roles.includes(currentUser.role));
  const settingsItems = menuItems.filter(item => item.group === 'settings' && item.roles.includes(currentUser.role));

  const appSettings = Database.getSettings();

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      
      {/* 1. Sidebar Panel */}
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 print:hidden">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img 
                src="https://truongvietanh.com/logo-vietanh.webp" 
                alt="Trường Việt Anh Logo" 
                className="h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="font-bold text-xs tracking-tight text-brand-navy dark:text-neutral-100 uppercase">
                TRƯỜNG VIỆT ANH
              </h2>
              <p className="text-[9px] text-brand-orange font-bold tracking-wider uppercase">
                CỔNG TÍNH TOÁN HỌC PHÍ
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-210px)]">
            
            {/* General Section */}
            <div className="flex flex-col gap-1">
              <span className="px-3 py-1 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                Tính năng chung
              </span>
              {generalItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-brand-navy/10 text-brand-navy dark:bg-brand-navy-light/30 dark:text-brand-orange border-l-4 border-brand-orange rounded-l-none'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-brand-orange dark:hover:text-brand-orange'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4 text-brand-orange" />}
                </button>
              ))}
            </div>

            {/* Fees Setup Section */}
            {calculatorItems.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="px-3 py-1 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                  Cấu hình biểu phí
                </span>
                {calculatorItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-brand-navy/10 text-brand-navy dark:bg-brand-navy-light/30 dark:text-brand-orange border-l-4 border-brand-orange rounded-l-none'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-brand-orange dark:hover:text-brand-orange'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight className="w-4 h-4 text-brand-orange" />}
                  </button>
                ))}
              </div>
            )}

            {/* System Setup Section */}
            {settingsItems.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="px-3 py-1 text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                  Cấu hình hệ thống
                </span>
                {settingsItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-brand-navy/10 text-brand-navy dark:bg-brand-navy-light/30 dark:text-brand-orange border-l-4 border-brand-orange rounded-l-none'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-brand-orange dark:hover:text-brand-orange'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight className="w-4 h-4 text-brand-orange" />}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>

        {/* 2. Sidebar Profile Switcher */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <div className="flex flex-col gap-3">
            
            {/* Current Profile Card */}
            <div className="flex items-center gap-3 p-1.5 border border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy dark:text-brand-orange font-bold flex items-center justify-center text-xs border border-brand-navy/20">
                {currentUser.fullName.split(' ').pop()?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">
                  {currentUser.role.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Real Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-rose-50/50 dark:bg-neutral-900 dark:hover:bg-rose-950/20 text-neutral-600 hover:text-rose-600 dark:text-neutral-300 dark:hover:text-rose-400 rounded-lg text-xs font-bold transition-all border border-neutral-200 dark:border-neutral-800 hover:border-rose-200 cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-400 hover:text-rose-500" />
              <span>Đăng xuất tài khoản</span>
            </button>

          </div>
        </div>
      </aside>

      {/* 3. Main Body Frame */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 flex items-center justify-between sticky top-0 z-10 print:hidden">
          
          {/* Section Breadcrumb */}
          <div>
            <h1 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
              {menuItems.find(item => item.id === activeTab)?.label || 'Trang chi tiết'}
            </h1>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Đại diện: {appSettings.schoolName}
            </p>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
              title="Chuyển chế độ sáng/tối"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notification Center Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer relative"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4" />
                {systemNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-4 z-30">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-3">
                    <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      Thông báo hệ thống
                    </span>
                    <button 
                      onClick={() => setSystemNotifications([])}
                      className="text-[10px] text-brand-navy dark:text-brand-orange hover:underline cursor-pointer font-bold"
                    >
                      Dọn sạch tất cả
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {systemNotifications.length === 0 ? (
                      <p className="text-xs text-neutral-400 text-center py-4">Không có thông báo mới</p>
                    ) : (
                      systemNotifications.map((notif) => (
                        <div key={notif.id} className="text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/40 p-2 rounded-lg transition-colors">
                          <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">
                            <span className="truncate">{notif.title}</span>
                            <span className="text-[9px] text-neutral-400 shrink-0">{notif.date}</span>
                          </div>
                          <p className="text-neutral-500 dark:text-neutral-400 leading-normal">{notif.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Direct App Link for Iframe */}
            <a
              href={window.location.origin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-xs font-semibold text-neutral-600 dark:text-neutral-300"
              title="Mở ứng dụng ở tab mới"
            >
              <span>Mở rộng</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

          </div>
        </header>

        {/* 4. Scrollable Container for Dynamic Pages */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 bg-neutral-50 dark:bg-neutral-950">
          {children}
        </main>
      </div>

      {/* Dynamic Floating Toasts Display */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
