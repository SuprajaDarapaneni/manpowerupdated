import React, { useState, useEffect } from 'react';
import { dataService } from './services/storage';
import { adminApiClient, BackendHealthResponse } from './services/api';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminHeader } from './components/Admin/AdminHeader';
import { AdminSidebar, AdminTab } from './components/Admin/AdminSidebar';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ServiceCategoriesView } from './components/Admin/ServiceCategoriesView';
import { BookingsManagementView } from './components/Admin/BookingsManagementView';
import { CommissionSetupView } from './components/Admin/CommissionSetupView';
import { WorkersManagementView } from './components/Admin/WorkersManagementView';
import { CustomersManagementView } from './components/Admin/CustomersManagementView';
import { UsersManagementView } from './components/Admin/UsersManagementView';
import { PricingMatchingView } from './components/Admin/PricingMatchingView';
import { DisputesView } from './components/Admin/DisputesView';
import { SafetyPrivacyView } from './components/Admin/SafetyPrivacyView';
import { ReportsView } from './components/Admin/ReportsView';
import { AuditTrailView } from './components/Admin/AuditTrailView';
import { SettingsManagement } from './components/Admin/SettingsManagement';
import { Server, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const TAB_NAMES: Record<AdminTab, string> = {
  dashboard: 'Workforce Dashboard',
  categories: 'Service Categories & Rates',
  bookings: 'Orders & Attendance Lifecycle',
  commission: 'Commission & Payments',
  workers: 'Workers & KYC Verification',
  customers: 'Customers & Corporate Accounts',
  users: 'User Access & Permissions',
  pricing: 'Pricing & Smart Matching Engine',
  disputes: 'Disputes & Ratings Resolution',
  safety: 'Safety Incidents & Emergency Hotline',
  reports: 'Reports & Revenue Analytics',
  audit: 'Security Audit Trail',
  settings: 'Platform Settings',
  'settings-general': 'General Company Settings',
  'settings-branding': 'Branding & Theme Settings',
  'settings-legal': 'Legal Documents & Terms',
  'settings-contact': 'Emergency Contacts & Help',
  'settings-appconfig': 'Mobile App Remote Config',
  'settings-notifications': 'Notification Automation',
  'settings-payments': 'Payment Methods & Gateways',
  'settings-bookingrules': 'Booking & Overtime Rules',
  'settings-location': 'Geofencing & Location Zones',
  'settings-maintenance': 'Maintenance Mode Controls',
  'settings-security': 'Security & Data Protection',
  'settings-audit': 'Settings Change Audit History',
};

export default function AdminApp() {
  const [adminAuth, setAdminAuth] = useState(() => dataService.getAdminAuth());
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Backend health status
  const [backendHealth, setBackendHealth] = useState<{
    online: boolean;
    data?: BackendHealthResponse;
    loading: boolean;
  }>({
    online: false,
    loading: true,
  });

  // Reactive platform state
  const [categories, setCategories] = useState(() => dataService.getCategories());
  const [workers, setWorkers] = useState(() => dataService.getWorkers());
  const [customers, setCustomers] = useState(() => dataService.getCustomers());
  const [adminUsers, setAdminUsers] = useState(() => dataService.getAdminUsers());
  const [bookings, setBookings] = useState(() => dataService.getBookings());
  const [commissionSettings, setCommissionSettings] = useState(() => dataService.getCommissionSettings());
  const [otpSettings, setOtpSettings] = useState(() => dataService.getOtpSettings());
  const [disputes, setDisputes] = useState(() => dataService.getDisputes());
  const [safetyIncidents, setSafetyIncidents] = useState(() => dataService.getSafetyIncidents());
  const [auditLogs, setAuditLogs] = useState(() => dataService.getAuditLogs());

  // Check backend health periodically
  const checkBackend = async () => {
    setBackendHealth((prev) => ({ ...prev, loading: true }));
    const res = await adminApiClient.checkHealth();
    setBackendHealth({
      online: res.online,
      data: res.data,
      loading: false,
    });
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setCategories(dataService.getCategories());
      setWorkers(dataService.getWorkers());
      setCustomers(dataService.getCustomers());
      setAdminUsers(dataService.getAdminUsers());
      setBookings(dataService.getBookings());
      setCommissionSettings(dataService.getCommissionSettings());
      setOtpSettings(dataService.getOtpSettings());
      setDisputes(dataService.getDisputes());
      setSafetyIncidents(dataService.getSafetyIncidents());
      setAuditLogs(dataService.getAuditLogs());
      setAdminAuth(dataService.getAdminAuth());
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    dataService.setAdminAuth({ isAuthenticated: false, user: null });
    setAdminAuth({ isAuthenticated: false, user: null });
  };

  // Render Admin Main Content based on active tab
  const renderAdminContent = () => {
    switch (adminTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            bookings={bookings}
            workers={workers}
            customers={customers}
            categories={categories}
            onNavigateTab={(tab) => setAdminTab(tab)}
            onSelectBooking={(id) => setSelectedBookingId(id)}
          />
        );
      case 'categories':
        return <ServiceCategoriesView categories={categories} />;
      case 'bookings':
        return (
          <BookingsManagementView
            bookings={bookings}
            selectedBookingId={selectedBookingId}
          />
        );
      case 'commission':
        return <CommissionSetupView initialSettings={commissionSettings} />;
      case 'workers':
        return <WorkersManagementView workers={workers} />;
      case 'customers':
        return <CustomersManagementView customers={customers} />;
      case 'users':
        return (
          <UsersManagementView
            customers={customers}
            workers={workers}
            adminUsers={adminUsers}
          />
        );
      case 'pricing':
        return <PricingMatchingView initialOtpSettings={otpSettings} />;
      case 'disputes':
        return <DisputesView disputes={disputes} />;
      case 'safety':
        return <SafetyPrivacyView incidents={safetyIncidents} />;
      case 'reports':
        return <ReportsView bookings={bookings} />;
      case 'audit':
        return <AuditTrailView logs={auditLogs} />;
      case 'settings':
      case 'settings-general':
      case 'settings-branding':
      case 'settings-legal':
      case 'settings-contact':
      case 'settings-appconfig':
      case 'settings-notifications':
      case 'settings-payments':
      case 'settings-bookingrules':
      case 'settings-location':
      case 'settings-maintenance':
      case 'settings-security':
      case 'settings-audit': {
        const sub = adminTab.startsWith('settings-') ? adminTab.replace('settings-', '') : 'branding';
        return <SettingsManagement initialSubTab={sub} />;
      }
      default:
        return null;
    }
  };

  // If not authenticated, show production Admin Login
  if (!adminAuth.isAuthenticated) {
    return (
      <AdminLogin
        onSuccess={() => setAdminAuth(dataService.getAdminAuth())}
        showPreviews={false}
      />
    );
  }

  const pendingWorkersCount = workers.filter((w) => w.approvalStatus === 'pending').length;
  const openDisputesCount = disputes.filter((d) => d.status === 'open').length;
  const openSafetyCount = safetyIncidents.filter((s) => s.status === 'reported' || s.status === 'investigating' || s.status === 'escalated').length;

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#202124] flex flex-col font-sans antialiased selection:bg-[#FFC928]/30 selection:text-[#202124]">
      {/* Backend Status Top Notification Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-[#FFC928]" />
          <span className="font-semibold text-white">Central Backend:</span>
          {backendHealth.loading ? (
            <span className="flex items-center gap-1.5 text-slate-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Pinging Express API...</span>
            </span>
          ) : backendHealth.online ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Connected (v{backendHealth.data?.version || '1.0.0'} on :5000)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>Offline / Local Fallback Mode</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Database: <strong className="text-white font-medium">MongoDB Atlas Cluster</strong></span>
          <button
            onClick={checkBackend}
            className="hover:text-white transition-colors cursor-pointer text-[11px] underline"
            title="Refresh connection status"
          >
            Recheck API
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Navigation Sidebar */}
        <AdminSidebar
          activeTab={adminTab}
          onSelectTab={(tab) => setAdminTab(tab)}
          pendingWorkersCount={pendingWorkersCount}
          openDisputesCount={openDisputesCount}
          openSafetyCount={openSafetyCount}
          isClientDeliveryMode={true}
        />

        {/* Admin Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader
            currentTabName={TAB_NAMES[adminTab] || 'Workforce Command'}
            onLogout={handleLogout}
          />
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto pb-16">
            {renderAdminContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
