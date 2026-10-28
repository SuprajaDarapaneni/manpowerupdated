import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Shield,
  LogOut,
  Smartphone,
  ChevronDown,
  Columns,
  HardHat,
  Archive,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { dataService } from '../../services/storage';

interface AdminHeaderProps {
  currentTabName: string;
  onLogout: () => void;
  onOpenPreview?: (route: 'customer' | 'employee' | 'dual' | 'handover') => void;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTabName,
  onLogout,
  onOpenPreview,
  onToggleMobileSidebar,
}) => {
  const adminAuth = dataService.getAdminAuth();
  const [branding, setBranding] = useState(() => dataService.getBrandingSettings());
  const [showPreviewMenu, setShowPreviewMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click and listen to storage branding updates
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPreviewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    const unsubscribe = dataService.subscribe(() => {
      setBranding(dataService.getBrandingSettings());
    });
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      unsubscribe();
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#202124]/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Mobile Hamburger & Breadcrumb Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-[#202124] hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-[#202124]" />
          </button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#686868]">
          {branding.mainLogoUrl ? (
            <img
              src={branding.mainLogoUrl}
              alt={branding.appName || 'Logo'}
              className="w-5 h-5 rounded object-contain shrink-0"
            />
          ) : null}
          <span className="font-semibold" style={{ color: branding.primaryColor || '#D71920' }}>
            {branding.appName || 'ManPowerLink'}
          </span>
          <span>/</span>
          <span className="font-medium text-[#202124] truncate max-w-[130px] sm:max-w-none">{currentTabName}</span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold bg-[#FFC928]/30 text-[#A80F18] rounded">
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
      <div className="flex items-center gap-3">
        {/* Apps Preview Dropdown Button (For testing & cross-checking mobile apps) */}
        {onOpenPreview && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowPreviewMenu(!showPreviewMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF8] border border-[#202124]/15 hover:border-[#D71920] text-xs font-semibold text-[#202124] transition-colors cursor-pointer shadow-xs"
              title="Preview Customer & Employee Mobile Apps"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#D71920]" />
              <span className="hidden sm:inline">Apps Preview</span>
              <ChevronDown className="w-3 h-3 text-[#686868]" />
            </button>

            {showPreviewMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-[#202124]/10 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-[#202124]/5">
                  <span className="text-[10px] font-bold text-[#686868] uppercase tracking-wider block">
                    Mobile & Split Previews
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowPreviewMenu(false);
                    onOpenPreview('customer');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-[#202124] cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-[#FFC928]" />
                  <div>
                    <span className="font-semibold block">Customer App</span>
                    <span className="text-[10px] text-[#686868]">Employer job posting & wallet</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowPreviewMenu(false);
                    onOpenPreview('employee');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-[#202124] cursor-pointer"
                >
                  <HardHat className="w-4 h-4 text-[#D71920]" />
                  <div>
                    <span className="font-semibold block">Employee App</span>
                    <span className="text-[10px] text-[#686868]">Worker bidding & OTP check-in</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowPreviewMenu(false);
                    onOpenPreview('dual');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-[#202124] cursor-pointer"
                >
                  <Columns className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-semibold block">Split Dual View</span>
                    <span className="text-[10px] text-[#686868]">Live side-by-side simulation</span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#202124]/5" />

                <button
                  onClick={() => {
                    setShowPreviewMenu(false);
                    onOpenPreview('handover');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-[#202124] cursor-pointer"
                >
                  <Archive className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-semibold block">Handover & Source Code</span>
                    <span className="text-[10px] text-[#686868]">Customer, Worker, Backend ZIPs</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          title="System Notifications"
          className="p-2 text-[#686868] hover:text-[#D71920] hover:bg-neutral-100 rounded-lg transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#D71920] absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        <div className="h-6 w-[1px] bg-[#202124]/10 hidden sm:block" />

        {/* Admin User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D71920] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-[#202124] leading-tight">
              {adminAuth.user?.name || 'Super Admin'}
            </p>
            <p className="text-[10px] text-[#686868] leading-tight">Mangalore Admin HQ</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out of Admin Panel"
            className="p-1.5 text-[#686868] hover:text-[#D71920] hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer flex items-center gap-1 text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
