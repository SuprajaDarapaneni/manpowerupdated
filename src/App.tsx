import React, { useState, useEffect } from 'react';
import { dataService, ViewMode } from './services/storage';
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
import { CustomerAppSimulator } from './components/CustomerSimulator/CustomerAppSimulator';
import { EmployeeAppSimulator } from './components/EmployeeSimulator/EmployeeAppSimulator';
import { DualAppsPreview } from './components/DualAppsPreview';
import { HandoverCenter } from './components/Handover/HandoverCenter';
import {
  Shield,
  Smartphone,
  Server,
  Layers,
  Archive,
  Columns,
  Lock,
  ChevronRight,
  HardHat,
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => dataService.getViewMode());
  const [adminAuth, setAdminAuth] = useState(() => dataService.getAdminAuth());
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Active hub tab when in Interactive Developer / Testing mode
  const [hubTab, setHubTab] = useState<'admin' | 'dual' | 'customer' | 'employee' | 'handover'>('dual');

  // Reactive data states
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
      setViewMode(dataService.getViewMode());
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    dataService.setAdminAuth({ isAuthenticated: false, user: null });
  };

  const isClientDeliveryMode = viewMode === 'admin-only';

  const toggleClientDeliveryMode = () => {
    const nextMode: ViewMode = isClientDeliveryMode ? 'interactive-hub' : 'admin-only';
    dataService.setViewMode(nextMode);
    setViewMode(nextMode);
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
      case 'preview-customer':
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#202124]/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#202124]">Customer / Employer Mobile App Preview</h2>
                <p className="text-xs text-[#686868]">Standalone Flutter codebase located in /customer-app/</p>
              </div>
              <button
                onClick={() => setAdminTab('preview-dual')}
                className="px-3 py-1.5 bg-[#FFC928] text-[#202124] text-xs font-bold rounded-lg cursor-pointer"
              >
                Switch to Dual View
              </button>
            </div>
            <div className="p-6 bg-[#121316] rounded-2xl flex justify-center">
              <CustomerAppSimulator
                categories={categories}
                workers={workers}
                bookings={bookings}
              />
            </div>
          </div>
        );
      case 'preview-employee':
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#202124]/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#202124]">Employee / Worker Mobile App Preview</h2>
                <p className="text-xs text-[#686868]">Standalone Flutter codebase located in /employee-app/</p>
              </div>
              <button
                onClick={() => setAdminTab('preview-dual')}
                className="px-3 py-1.5 bg-[#FFC928] text-[#202124] text-xs font-bold rounded-lg cursor-pointer"
              >
                Switch to Dual View
              </button>
            </div>
            <div className="p-6 bg-[#121316] rounded-2xl flex justify-center">
              <EmployeeAppSimulator
                workers={workers}
                bookings={bookings}
              />
            </div>
          </div>
        );
      case 'preview-dual':
        return (
          <DualAppsPreview
            categories={categories}
            workers={workers}
            bookings={bookings}
            onOpenAdmin={() => setAdminTab('dashboard')}
          />
        );
      case 'preview-handover':
        return (
          <HandoverCenter
            onEnableClientDeliveryMode={toggleClientDeliveryMode}
            isClientDeliveryMode={isClientDeliveryMode}
          />
        );
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

  // Support developer shortcut (Ctrl+Shift+P) to switch between Client Delivery and Preview Hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleClientDeliveryMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClientDeliveryMode]);

  // 1. CLIENT DELIVERY MODE: PURE ADMIN WEB PANEL ONLY (NO DEV HEADER, NO MOBILE PREVIEW BUTTONS)
  if (isClientDeliveryMode) {
    if (!adminAuth.isAuthenticated) {
      return (
        <AdminLogin
          onSuccess={() => setAdminAuth(dataService.getAdminAuth())}
          onOpenPreview={() => {
            toggleClientDeliveryMode();
            setHubTab('dual');
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#FFFDF8] flex text-[#202124] antialiased">
        <AdminSidebar
          activeTab={adminTab}
          onSelectTab={(tab) => setAdminTab(tab)}
          pendingWorkersCount={workers.filter((w) => w.approvalStatus === 'pending').length}
          openDisputesCount={disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length}
          openSafetyCount={safetyIncidents.filter((s) => s.status !== 'resolved').length}
          isClientDeliveryMode={isClientDeliveryMode}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            currentTabName={adminTab.charAt(0).toUpperCase() + adminTab.slice(1)}
            onLogout={handleLogout}
            onOpenMobileApps={() => {
              toggleClientDeliveryMode();
              setHubTab('dual');
            }}
            isClientDeliveryMode={isClientDeliveryMode}
            onToggleClientDeliveryMode={toggleClientDeliveryMode}
          />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            {renderAdminContent()}
          </main>
        </div>
      </div>
    );
  }

  // 2. INTERACTIVE DEVELOPER & MOBILE APPS PREVIEW HUB
  return (
    <div className="min-h-screen bg-[#1E1F23] text-white flex flex-col antialiased">
      {/* Dev Hub Top Navigation Banner */}
      <header className="bg-[#121316] border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D71920] flex items-center justify-center font-extrabold text-white shadow-sm">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">ManPowerLink</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFC928] text-[#202124]">
                APPS PREVIEW & DEV HUB
              </span>
            </div>
            <p className="text-[10px] text-white/50">
              Interactive Customer & Employee Mobile Apps + Central Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation Tabs between Dual Preview, Customer, Employee, Admin, and ZIP Handover */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setHubTab('dual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              hubTab === 'dual' ? 'bg-[#FFC928] text-[#202124] shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual Apps Preview</span>
          </button>
          <button
            onClick={() => setHubTab('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              hubTab === 'customer' ? 'bg-[#16834A] text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer App</span>
          </button>
          <button
            onClick={() => setHubTab('employee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              hubTab === 'employee' ? 'bg-[#D71920] text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Employee App</span>
          </button>
          <button
            onClick={() => setHubTab('admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              hubTab === 'admin' ? 'bg-white text-[#202124] shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            Admin Panel
          </button>
          <button
            onClick={() => setHubTab('handover')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              hubTab === 'handover' ? 'bg-white text-[#202124] shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Export ZIPs</span>
          </button>
        </div>

        {/* Primary Action: Lock into Client Delivery Mode */}
        <button
          onClick={toggleClientDeliveryMode}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#D71920] hover:bg-[#A80F18] text-white rounded-lg transition-colors cursor-pointer shadow-xs"
          title="Hide all developer headers and lock into clean Admin-only mode for client handover"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Client Delivery Mode (Admin Only)</span>
        </button>
      </header>

      {/* Hub Body Viewports */}
      <div className="flex-1 bg-[#1E1F23]">
        {/* Hub Tab: Dual Live Apps Preview (Side-by-Side!) */}
        {hubTab === 'dual' && (
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <DualAppsPreview
              categories={categories}
              workers={workers}
              bookings={bookings}
              onOpenAdmin={() => setHubTab('admin')}
            />
          </div>
        )}

        {/* Hub Tab: Customer App Simulator */}
        {hubTab === 'customer' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-61px)] bg-[#121316]">
            <div className="mb-4 text-center">
              <span className="px-3 py-1 text-xs font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                Independent Flutter Project: /customer-app/
              </span>
              <h2 className="text-lg font-bold text-white mt-2">
                Customer / Employer Mobile App Simulator
              </h2>
              <p className="text-xs text-white/60">
                Post jobs with dynamic catering rules, review bids from Ramesh/Suresh, and share Start OTP.
              </p>
            </div>
            <CustomerAppSimulator
              categories={categories}
              workers={workers}
              bookings={bookings}
            />
          </div>
        )}

        {/* Hub Tab: Employee App Simulator */}
        {hubTab === 'employee' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-61px)] bg-[#121316]">
            <div className="mb-4 text-center">
              <span className="px-3 py-1 text-xs font-bold bg-amber-500/20 text-[#FFC928] rounded-full border border-amber-500/30">
                Independent Flutter Project: /employee-app/
              </span>
              <h2 className="text-lg font-bold text-white mt-2">
                Employee / Worker Mobile App Simulator
              </h2>
              <p className="text-xs text-white/60">
                Logged in as Ramesh Kumar. Discover nearby jobs, submit bids, enter Start OTP & collect earnings.
              </p>
            </div>
            <EmployeeAppSimulator workers={workers} bookings={bookings} />
          </div>
        )}

        {/* Hub Tab: Embedded Admin Panel */}
        {hubTab === 'admin' && (
          <div className="min-h-[calc(100vh-61px)] bg-[#FFFDF8] flex text-[#202124]">
            {!adminAuth.isAuthenticated ? (
              <div className="w-full">
                <AdminLogin onSuccess={() => setAdminAuth(dataService.getAdminAuth())} />
              </div>
            ) : (
              <>
                <AdminSidebar
                  activeTab={adminTab}
                  onSelectTab={(tab) => setAdminTab(tab)}
                  pendingWorkersCount={workers.filter((w) => w.approvalStatus === 'pending').length}
                  openDisputesCount={disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length}
                  openSafetyCount={safetyIncidents.filter((s) => s.status !== 'resolved').length}
                  isClientDeliveryMode={isClientDeliveryMode}
                />
                <div className="flex-1 flex flex-col min-w-0">
                  <AdminHeader
                    currentTabName={adminTab.charAt(0).toUpperCase() + adminTab.slice(1)}
                    onLogout={handleLogout}
                    onOpenMobileApps={() => setHubTab('dual')}
                    onOpenHandover={() => setHubTab('handover')}
                    isClientDeliveryMode={isClientDeliveryMode}
                    onToggleClientDeliveryMode={toggleClientDeliveryMode}
                  />
                  <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
                    {renderAdminContent()}
                  </main>
                </div>
              </>
            )}
          </div>
        )}

        {/* Hub Tab: Standalone ZIP Packages & Handover */}
        {hubTab === 'handover' && (
          <div className="p-8 min-h-[calc(100vh-61px)] bg-[#FFFDF8] text-[#202124]">
            <HandoverCenter
              onEnableClientDeliveryMode={toggleClientDeliveryMode}
              isClientDeliveryMode={isClientDeliveryMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}
