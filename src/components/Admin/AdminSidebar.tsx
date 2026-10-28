import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Percent,
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Settings,
  ShieldAlert,
  UserCog,
  MapPin,
  X,
} from 'lucide-react';
import { dataService } from '../../services/storage';

export type AdminTab =
  | 'dashboard'
  | 'categories'
  | 'bookings'
  | 'commission'
  | 'workers'
  | 'customers'
  | 'users'
  | 'pricing'
  | 'disputes'
  | 'safety'
  | 'reports'
  | 'audit'
  | 'settings'
  | 'settings-general'
  | 'settings-branding'
  | 'settings-legal'
  | 'settings-contact'
  | 'settings-appconfig'
  | 'settings-notifications'
  | 'settings-payments'
  | 'settings-bookingrules'
  | 'settings-location'
  | 'settings-maintenance'
  | 'settings-security'
  | 'settings-audit';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingWorkersCount: number;
  openDisputesCount: number;
  openSafetyCount: number;
  pendingPaymentsCount?: number;
  isClientDeliveryMode?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingWorkersCount,
  openDisputesCount,
  openSafetyCount,
  pendingPaymentsCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [branding, setBranding] = useState(() => dataService.getBrandingSettings());

  useEffect(() => {
    return dataService.subscribe(() => {
      setBranding(dataService.getBrandingSettings());
    });
  }, []);

  const opsNavItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories' as AdminTab, label: 'Service Categories', icon: Layers },
    { id: 'pricing' as AdminTab, label: 'Service Zones & Set Price', icon: MapPin },
    {
      id: 'bookings' as AdminTab,
      label: 'Orders & Bookings',
      icon: ClipboardList,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
    },
    { id: 'commission' as AdminTab, label: 'Commission & Payments', icon: Percent },
    {
      id: 'workers' as AdminTab,
      label: 'Workers & Verification',
      icon: Users,
      badge: pendingWorkersCount > 0 ? pendingWorkersCount : undefined,
    },
    { id: 'customers' as AdminTab, label: 'Customers & Employers', icon: Building2 },
    { id: 'users' as AdminTab, label: 'User & RBAC Access', icon: UserCog },
    {
      id: 'disputes' as AdminTab,
      label: 'Disputes & Ratings',
      icon: AlertTriangle,
      badge: openDisputesCount > 0 ? openDisputesCount : undefined,
    },
    {
      id: 'safety' as AdminTab,
      label: 'Safety & Privacy',
      icon: ShieldAlert,
      badge: openSafetyCount > 0 ? openSafetyCount : undefined,
    },
    { id: 'reports' as AdminTab, label: 'Reports & Revenue', icon: BarChart3 },
    { id: 'audit' as AdminTab, label: 'Security Audit Trail', icon: ShieldCheck },
    { id: 'settings' as AdminTab, label: 'Platform Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay - Auto slide to left when clicked */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity cursor-pointer"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1E1F23] text-white flex flex-col shrink-0 min-h-screen border-r border-white/5 select-none transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header with Close Button on Mobile */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {branding.mainLogoUrl ? (
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-sm border border-[#FFC928] overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={branding.mainLogoUrl}
                  alt={branding.appName || 'Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-white shadow-sm border border-[#FFC928] shrink-0"
                style={{ backgroundColor: branding.primaryColor || '#D71920' }}
              >
                {branding.appName?.charAt(0) || 'M'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white truncate max-w-[130px]">
                  {branding.appName || 'ManPowerLink'}
                </span>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: branding.secondaryColor || '#FFC928' }} title="Admin Active" />
              </div>
              <p className="text-[10px] text-white/50 tracking-wider uppercase font-mono truncate">
                Admin Portal
              </p>
            </div>
          </div>

          {/* Close button for Mobile - Auto closes/slides left */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
          {/* Workforce Operations Section */}
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
              Workforce Management
            </div>
            {opsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile(); // Auto-slides to left on mobile
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D71920] text-white shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/60'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FFC928] text-[#202124]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Brand Footer Info */}
        <div className="p-4 border-t border-white/10 text-xs text-white/50 bg-black/20 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-white/70">ManPowerLink Enterprise</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFC928] text-[#202124] font-mono font-bold">
              ONLINE
            </span>
          </div>
          <p className="text-[10px] leading-relaxed text-white/40">
            Workforce Operations & Marketplace Control
          </p>
        </div>
      </aside>
    </>
  );
};
