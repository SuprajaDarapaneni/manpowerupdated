import React from 'react';
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
  Smartphone,
  HardHat,
  Columns,
  Archive,
  ShieldAlert,
  UserCog,
} from 'lucide-react';

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
  | 'settings-audit'
  | 'preview-customer'
  | 'preview-employee'
  | 'preview-dual'
  | 'preview-handover';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingWorkersCount: number;
  openDisputesCount: number;
  openSafetyCount: number;
  isClientDeliveryMode: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingWorkersCount,
  openDisputesCount,
  openSafetyCount,
  isClientDeliveryMode,
}) => {
  const opsNavItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories' as AdminTab, label: 'Service Categories', icon: Layers },
    { id: 'bookings' as AdminTab, label: 'Orders & Bookings', icon: ClipboardList },
    { id: 'commission' as AdminTab, label: 'Commission & Payments', icon: Percent },
    {
      id: 'workers' as AdminTab,
      label: 'Workers & Verification',
      icon: Users,
      badge: pendingWorkersCount > 0 ? pendingWorkersCount : undefined,
    },
    { id: 'customers' as AdminTab, label: 'Customers & Employers', icon: Building2 },
    { id: 'users' as AdminTab, label: 'User & RBAC Access', icon: UserCog },
    { id: 'pricing' as AdminTab, label: 'Pricing & Matching', icon: DollarSign },
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

  const appPreviewItems = [
    {
      id: 'preview-customer' as AdminTab,
      label: 'Customer App (Flutter)',
      icon: Smartphone,
      tag: 'Employer',
    },
    {
      id: 'preview-employee' as AdminTab,
      label: 'Employee App (Flutter)',
      icon: HardHat,
      tag: 'Worker',
    },
    {
      id: 'preview-dual' as AdminTab,
      label: 'Dual Live Apps Simulation',
      icon: Columns,
      tag: 'Side-by-Side',
    },
    {
      id: 'preview-handover' as AdminTab,
      label: 'Download Source ZIPs',
      icon: Archive,
      tag: 'Handover',
    },
  ];

  return (
    <aside className="w-64 bg-[#1E1F23] text-white flex flex-col shrink-0 min-h-screen border-r border-white/5 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[#D71920] flex items-center justify-center font-extrabold text-white shadow-sm">
          M
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">ManPowerLink</span>
            <span className="w-2 h-2 rounded-full bg-[#FFC928]" title="Admin Active" />
          </div>
          <p className="text-[10px] text-white/50 tracking-wider uppercase font-mono">
            {isClientDeliveryMode ? 'Admin Production Portal' : 'Central Platform & Apps'}
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
        {/* Mobile Apps Preview Section (shown when not locked for client delivery) */}
        {!isClientDeliveryMode && (
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-[#FFC928] uppercase flex items-center justify-between">
              <span>Mobile Apps Preview</span>
              <span className="text-[9px] bg-[#FFC928]/20 px-1.5 py-0.5 rounded text-[#FFC928]">LIVE</span>
            </div>
            {appPreviewItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FFC928] text-[#202124] shadow-md font-bold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#202124]' : 'text-[#FFC928]'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#202124]/10 text-[#202124]' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {item.tag}
                  </span>
                </button>
              );
            })}
          </div>
        )}

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
                onClick={() => onSelectTab(item.id)}
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
      <div className="p-4 border-t border-white/10 text-xs text-white/50 bg-black/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-white/70">ManPowerLink Enterprise</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16834A]/20 text-[#16834A] font-mono font-bold">
            {isClientDeliveryMode ? 'ONLINE' : 'DEV HUB'}
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-white/40">
          Workforce Operations & Marketplace Control
        </p>
      </div>
    </aside>
  );
};
