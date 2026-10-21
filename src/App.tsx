import React, { useState, useEffect } from 'react';
import { dataService } from './services/storage';
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
  Smartphone,
  Archive,
  Columns,
  HardHat,
  ArrowLeft,
  LayoutDashboard,
  Lock,
} from 'lucide-react';

type AppRoute = 'admin' | 'customer' | 'employee' | 'dual' | 'handover' | 'dev-hub';

function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return 'admin';
  const params = new URLSearchParams(window.location.search);
  const preview = params.get('preview') || params.get('app') || params.get('view');
  if (preview === 'customer') return 'customer';
  if (preview === 'employee') return 'employee';
  if (preview === 'dual' || preview === 'split') return 'dual';
  if (preview === 'handover') return 'handover';
  if (params.get('dev') === 'true' || params.get('hub') === 'true' || preview === 'hub') return 'dev-hub';
  return 'admin';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(getInitialRoute);
  const [adminAuth, setAdminAuth] = useState(() => dataService.getAdminAuth());
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Active sub-tab inside Dev Hub if opened via ?dev=true
  const [hubTab, setHubTab] = useState<'admin' | 'dual' | 'customer' | 'employee' | 'handover'>('dual');
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('dev') === 'true' || params.get('debug') === 'true';
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

  // Listen to browser popstate / back button
  useEffect(() => {
    const handlePopState = () => {
      setRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newRoute: AppRoute) => {
    const url = new URL(window.location.href);
    if (newRoute === 'admin') {
      url.search = '';
    } else if (newRoute === 'dev-hub') {
      url.search = '?dev=true';
    } else {
      url.search = `?preview=${newRoute}`;
    }
    window.history.pushState({}, '', url.toString());
    setRoute(newRoute);
  };

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

  // Navigation switcher bar only for preview and developer testing pages
  const renderTopSwitcherBar = () => {
    if (route === 'admin') return null; // Standard Admin View NEVER shows preview switcher
    return (
      <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 shrink-0 select-none shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#D71920] flex items-center justify-center font-black text-white text-xs shadow-xs border border-[#FFC928]">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#202124] text-sm tracking-tight">ManPowerLink</span>
              <span className="text-[10px] font-bold bg-[#FFC928] text-[#202124] px-1.5 py-0.5 rounded">
                PREVIEW MODE
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => navigateTo('customer')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              route === 'customer'
                ? 'bg-[#D71920] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-white/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#FFC928]" />
            <span>Customer App</span>
          </button>
          <button
            onClick={() => navigateTo('employee')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              route === 'employee'
                ? 'bg-[#D71920] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-white/60'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-[#FFC928]" />
            <span>Employee App</span>
          </button>
          <button
            onClick={() => navigateTo('dual')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              route === 'dual'
                ? 'bg-[#FFC928] text-[#202124] shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-white/60'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-[#D71920]" />
            <span>⚡ Dual Split View (Live)</span>
          </button>
          <button
            onClick={() => navigateTo('handover')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              route === 'handover'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-white/60'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Source ZIPs</span>
          </button>
        </nav>

        {/* Back to Client Admin Dashboard */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('admin')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white shadow-xs"
            title="Return to pure Client Admin Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#FFC928]" />
            <span>Back to Admin Dashboard</span>
          </button>
        </div>
      </header>
    );
  };

  // =========================================================================
  // 1. SEPARATE STANDALONE PREVIEW: CUSTOMER APP (?preview=customer)
  // =========================================================================
  if (route === 'customer') {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-[#202124] flex flex-col antialiased">
        {renderTopSwitcherBar()}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
          <CustomerAppSimulator
            categories={categories}
            workers={workers}
            bookings={bookings}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SEPARATE STANDALONE PREVIEW: EMPLOYEE APP (?preview=employee)
  // =========================================================================
  if (route === 'employee') {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-[#202124] flex flex-col antialiased">
        {renderTopSwitcherBar()}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
          <EmployeeAppSimulator workers={workers} bookings={bookings} />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. SEPARATE STANDALONE PREVIEW: DUAL LIVE APPS SIMULATION (?preview=dual)
  // =========================================================================
  if (route === 'dual') {
    return (
      <div className="min-h-screen bg-[#1E1F23] text-white flex flex-col antialiased">
        {renderTopSwitcherBar()}
        <div className="bg-[#121316] border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#D71920] flex items-center justify-center font-extrabold text-white text-xs border border-[#FFC928]">
              M
            </div>
            <div>
              <span className="font-bold text-sm text-white">Dual Mobile Apps Simulation</span>
              <p className="text-[10px] text-white/50">Side-by-side Customer & Employee interaction</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFC928] text-[#202124] text-xs font-bold hover:bg-[#E5A900] transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </button>
        </div>
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex-1">
          <DualAppsPreview
            categories={categories}
            workers={workers}
            bookings={bookings}
            onOpenAdmin={() => navigateTo('admin')}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. SEPARATE STANDALONE PREVIEW: HANDOVER & SOURCE PACKAGES (?preview=handover)
  // =========================================================================
  if (route === 'handover') {
    return (
      <div className="min-h-screen bg-[#FFFDF8] text-[#202124] flex flex-col antialiased">
        {renderTopSwitcherBar()}
        <div className="bg-white border-b border-[#202124]/10 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#D71920] flex items-center justify-center font-extrabold text-white text-xs border border-[#FFC928]">
              M
            </div>
            <div>
              <span className="font-bold text-sm text-[#202124]">Source Code Handover Center</span>
              <p className="text-[10px] text-[#686868]">Customer App, Employee App, Backend, and Admin ZIPs</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D71920] text-white text-xs font-bold hover:bg-[#A80F18] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </button>
        </div>
        <div className="p-8 max-w-6xl mx-auto flex-1">
          <HandoverCenter
            onEnableClientDeliveryMode={() => navigateTo('admin')}
            isClientDeliveryMode={false}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. OPTIONAL DEVELOPER HUB (ONLY accessible via ?dev=true)
  // =========================================================================
  if (route === 'dev-hub') {
    return (
      <div className="min-h-screen bg-[#1E1F23] text-white flex flex-col antialiased">
        <header className="bg-[#121316] border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D71920] flex items-center justify-center font-extrabold text-white shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">ManPowerLink</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFC928] text-[#202124]">
                  DEV HUB
                </span>
              </div>
              <p className="text-[10px] text-white/50">Developer multi-app preview switcher</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setHubTab('dual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                hubTab === 'dual' ? 'bg-[#FFC928] text-[#202124]' : 'text-white/80 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual Apps</span>
            </button>
            <button
              onClick={() => setHubTab('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                hubTab === 'customer' ? 'bg-[#FFC928] text-[#202124]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => setHubTab('employee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                hubTab === 'employee' ? 'bg-[#D71920] text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Employee</span>
            </button>
            <button
              onClick={() => setHubTab('admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                hubTab === 'admin' ? 'bg-white text-[#202124]' : 'text-white/70 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setHubTab('handover')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                hubTab === 'handover' ? 'bg-white text-[#202124]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Export ZIPs</span>
            </button>
          </div>

          <button
            onClick={() => navigateTo('admin')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#D71920] hover:bg-[#A80F18] text-white rounded-lg transition-colors cursor-pointer"
          >
            <span>Exit to Client Admin</span>
          </button>
        </header>

        <div className="flex-1 bg-[#1E1F23]">
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
          {hubTab === 'customer' && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-61px)] bg-[#121316]">
              <CustomerAppSimulator categories={categories} workers={workers} bookings={bookings} />
            </div>
          )}
          {hubTab === 'employee' && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-61px)] bg-[#121316]">
              <EmployeeAppSimulator workers={workers} bookings={bookings} />
            </div>
          )}
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
                  />
                  <div className="flex-1 flex flex-col min-w-0">
                    <AdminHeader
                      currentTabName={adminTab.charAt(0).toUpperCase() + adminTab.slice(1)}
                      onLogout={handleLogout}
                      onOpenPreview={(mode) => navigateTo(mode)}
                    />
                    <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
                      {renderAdminContent()}
                    </main>
                  </div>
                </>
              )}
            </div>
          )}
          {hubTab === 'handover' && (
            <div className="p-8 min-h-[calc(100vh-61px)] bg-[#FFFDF8] text-[#202124]">
              <HandoverCenter
                onEnableClientDeliveryMode={() => navigateTo('admin')}
                isClientDeliveryMode={false}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. DEFAULT FOR CLIENT DELIVERY: PURE ADMIN DASHBOARD ONLY
  // (NO DEV HEADER, NO PREVIEW BUTTONS, NO SPLIT VIEWS - STRICT CLIENT HANDOVER)
  // =========================================================================
  if (!adminAuth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col antialiased">
        <div className="flex-1">
          <AdminLogin
            onSuccess={() => setAdminAuth(dataService.getAdminAuth())}
            showPreviews={isDevMode}
            onDevToggle={() => setIsDevMode((prev) => !prev)}
            onOpenPreview={(target) => navigateTo(target)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col text-[#202124] antialiased">
      <div className="flex-1 flex min-h-0">
        <AdminSidebar
          activeTab={adminTab}
          onSelectTab={(tab) => setAdminTab(tab)}
          pendingWorkersCount={workers.filter((w) => w.approvalStatus === 'pending').length}
          openDisputesCount={disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length}
          openSafetyCount={safetyIncidents.filter((s) => s.status !== 'resolved').length}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            currentTabName={adminTab.charAt(0).toUpperCase() + adminTab.slice(1)}
            onLogout={handleLogout}
            onOpenPreview={isDevMode ? (mode) => navigateTo(mode) : undefined}
          />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            {renderAdminContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
