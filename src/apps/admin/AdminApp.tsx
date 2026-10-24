import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/storage';
import { AdminLogin } from '../../components/Admin/AdminLogin';
import { AdminHeader } from '../../components/Admin/AdminHeader';
import { AdminSidebar, AdminTab } from '../../components/Admin/AdminSidebar';
import { AdminDashboard } from '../../components/Admin/AdminDashboard';
import { ServiceCategoriesView } from '../../components/Admin/ServiceCategoriesView';
import { BookingsManagementView } from '../../components/Admin/BookingsManagementView';
import { CommissionSetupView } from '../../components/Admin/CommissionSetupView';
import { WorkersManagementView } from '../../components/Admin/WorkersManagementView';
import { CustomersManagementView } from '../../components/Admin/CustomersManagementView';
import { UsersManagementView } from '../../components/Admin/UsersManagementView';
import { ZonePricingView } from '../../components/Admin/ZonePricingView';
import { DisputesView } from '../../components/Admin/DisputesView';
import { SafetyPrivacyView } from '../../components/Admin/SafetyPrivacyView';
import { ReportsView } from '../../components/Admin/ReportsView';
import { AuditTrailView } from '../../components/Admin/AuditTrailView';
import { SettingsManagement } from '../../components/Admin/SettingsManagement';

/**
 * AdminApp: Standalone Operations Control Center for Client Delivery
 * Pure client dashboard - zero preview bars, zero dev headers.
 */
export const AdminApp: React.FC = () => {
  const [adminAuth, setAdminAuth] = useState(() => dataService.getAdminAuth());
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Platform state
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

  useEffect(() => {
    return dataService.subscribe(() => {
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
  }, []);

  const handleLogout = () => {
    dataService.setAdminAuth({ isAuthenticated: false, user: null });
    setAdminAuth({ isAuthenticated: false, user: null });
  };

  const renderContent = () => {
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
        return <ZonePricingView initialOtpSettings={otpSettings} />;
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

  // Pure Client Delivery: Login Screen without previews
  if (!adminAuth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col antialiased">
        <div className="flex-1">
          <AdminLogin
            onSuccess={() => setAdminAuth(dataService.getAdminAuth())}
            showPreviews={false}
          />
        </div>
      </div>
    );
  }

  // Pure Client Delivery: Admin Dashboard without developer preview switcher headers
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col text-[#202124] antialiased">
      <div className="flex-1 flex min-h-0 relative">
        <AdminSidebar
          activeTab={adminTab}
          onSelectTab={(tab) => {
            setAdminTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          pendingWorkersCount={workers.filter((w) => w.approvalStatus === 'pending').length}
          openDisputesCount={disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length}
          openSafetyCount={safetyIncidents.filter((s) => s.status !== 'resolved').length}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            currentTabName={adminTab.charAt(0).toUpperCase() + adminTab.slice(1)}
            onLogout={handleLogout}
            onOpenPreview={undefined}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};
export default AdminApp;
