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
  | 'settings-audit';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingWorkersCount: number;
  openDisputesCount: number;
  openSafetyCount: number;
  isClientDeliveryMode?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingWorkersCount,
  openDisputesCount,
  openSafetyCount,
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
            Admin Production Portal
          </p>
        </div>
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
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFC928] text-[#202124] font-mono font-bold">
            ONLINE
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-white/40">
          Workforce Operations & Marketplace Control
        </p>
      </div>
    </aside>
  );
};
