import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useApp, ActiveTab } from './contexts/AppContext';
import DashboardLayout from './layouts/DashboardLayout';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TuitionCalc from './pages/TuitionCalc';
import QuoteHistory from './pages/QuoteHistory';
import FeeItems from './pages/FeeItems';
import FeeCategories from './pages/FeeCategories';
import EducationLevels from './pages/EducationLevels';
import Classes from './pages/Classes';
import AcademicYears from './pages/AcademicYears';
import DiscountPolicies from './pages/DiscountPolicies';
import UserPermissions from './pages/UserPermissions';
import DataBackup from './pages/DataBackup';
import SystemSettings from './pages/SystemSettings';

// Printable Invoice
import PrintableQuote from './components/PrintableQuote';
import { Button, Card } from './components/UI';
import { Calculator, History } from 'lucide-react';

function MainAppContent() {
  const { activeTab, setActiveTab, selectedQuoteForSheet, setSelectedQuoteForSheet, isLoggedIn } = useApp();

  // If user is not logged in, force the Login page
  if (!isLoggedIn) {
    return <Login />;
  }

  // Render correct page view based on router activeTab selection
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tuition-calc':
        return <TuitionCalc />;
      case 'quote-history':
        return <QuoteHistory />;
      case 'fee-items':
        return <FeeItems />;
      case 'fee-categories':
        return <FeeCategories />;
      case 'education-levels':
        return <EducationLevels />;
      case 'classes':
        return <Classes />;
      case 'academic-years':
        return <AcademicYears />;
      case 'discount-policies':
        return <DiscountPolicies />;
      case 'user-permissions':
        return <UserPermissions />;
      case 'data-backup':
        return <DataBackup />;
      case 'audit-logs':
        return <DataBackup />; // Audit Logs are coupled into the DataBackup & Activity Logs screen for maximum visual density
      case 'system-settings':
        return <SystemSettings />;
      
      // Printable Quote Sheet
      case 'quote-sheet':
        if (selectedQuoteForSheet) {
          return (
            <PrintableQuote 
              quote={selectedQuoteForSheet} 
              onBack={() => {
                setSelectedQuoteForSheet(null);
                setActiveTab('tuition-calc');
              }} 
            />
          );
        } else {
          return (
            <Card className="max-w-md mx-auto text-center py-12 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400">
                <Calculator className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-850 dark:text-neutral-100 text-sm uppercase">Chưa có phiếu báo phí nào được chọn</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
                  Vui lòng thực hiện tính toán học phí tuyển sinh mới hoặc chọn xem chi tiết một phiếu từ danh mục lịch sử.
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="primary" size="sm" onClick={() => setActiveTab('tuition-calc')} icon={<Calculator className="w-4 h-4" />}>
                  Tính phí tuyển sinh
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('quote-history')} icon={<History className="w-4 h-4" />}>
                  Xem lịch sử tính phí
                </Button>
              </div>
            </Card>
          );
        }
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderActiveTab()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
