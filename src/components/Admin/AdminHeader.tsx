import React from 'react';
import { Bell, Search, Shield, LogOut, CheckCircle2, Smartphone, Lock, Unlock } from 'lucide-react';
import { dataService } from '../../services/storage';

interface AdminHeaderProps {
  currentTabName: string;
  onLogout: () => void;
  onOpenMobileApps: () => void;
  onOpenHandover?: () => void;
  isClientDeliveryMode: boolean;
  onToggleClientDeliveryMode: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTabName,
  onLogout,
  onOpenMobileApps,
  onOpenHandover,
  isClientDeliveryMode,
  onToggleClientDeliveryMode,
}) => {
  const adminAuth = dataService.getAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-[#202124]/10 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Breadcrumb and Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-[#686868]">
          <span className="font-semibold text-[#D71920]">ManPowerLink</span>
          <span>/</span>
          <span className="font-medium text-[#202124]">{currentTabName}</span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-[#16834A]/10 text-[#16834A] rounded">
          Central API Connected
        </span>
      </div>

      {/* Zone 2: Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workers, bookings, order #1045..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920] transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Admin Profile */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Apps Preview Action */}
        <button
          onClick={onOpenMobileApps}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#FFC928] text-[#202124] hover:bg-[#E5A900] shadow-xs transition-colors cursor-pointer"
          title="Preview Customer & Employee Mobile Apps"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#202124]" />
          <span>Apps Preview</span>
        </button>

        <button
          onClick={onToggleClientDeliveryMode}
          title={isClientDeliveryMode ? 'Switch to Apps Preview Dev Hub' : 'Lock into clean Client Delivery Mode'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border bg-slate-50 text-[#202124] border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
        >
          {isClientDeliveryMode ? (
            <>
              <Lock className="w-3.5 h-3.5 text-[#16834A]" />
              <span className="hidden sm:inline text-[11px] font-semibold text-[#16834A]">Client Mode Active</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-[#686868]" />
              <span className="hidden sm:inline text-[11px]">Lock Client View</span>
            </>
          )}
        </button>

        {onOpenHandover && (
          <button
            onClick={onOpenHandover}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#202124] bg-[#FFFDF8] border border-[#202124]/15 rounded-lg hover:border-[#D71920] transition-colors cursor-pointer"
          >
            Export ZIPs
          </button>
        )}

        <div className="h-6 w-[1px] bg-[#202124]/10 hidden sm:block" />

        {/* Admin User Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D71920] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-[#202124] leading-tight">
              {adminAuth.user?.name || 'Super Admin'}
            </p>
            <p className="text-[10px] text-[#686868] leading-tight">Mangalore Admin</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out of Admin Panel"
            className="p-1.5 text-[#686868] hover:text-[#D71920] hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
