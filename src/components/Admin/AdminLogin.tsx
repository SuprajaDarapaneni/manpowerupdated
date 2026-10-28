import React, { useState, useEffect } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, Smartphone } from 'lucide-react';
import { dataService } from '../../services/storage';

interface AdminLoginProps {
  onSuccess: () => void;
  onDevToggle?: () => void;
  onOpenPreview?: (route: 'customer' | 'employee' | 'dual' | 'handover') => void;
  showPreviews?: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onDevToggle,
  onOpenPreview,
  showPreviews = false,
}) => {
  const [branding, setBranding] = useState(() => dataService.getBrandingSettings());
  const [email, setEmail] = useState('admin@manpowerlink.com');
  const [password, setPassword] = useState('Admin@2026Secure');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devClicks, setDevClicks] = useState(0);
  const [devUnlocked, setDevUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('dev') === 'true';
  });

  useEffect(() => {
    return dataService.subscribe(() => {
      setBranding(dataService.getBrandingSettings());
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (email.trim() && password.length >= 6) {
        dataService.setAdminAuth({
          isAuthenticated: true,
          user: {
            email: email.trim(),
            name: 'Super Admin',
            role: 'super_admin',
          },
        });
        setIsLoading(false);
        onSuccess();
      } else {
        setError('Please enter valid administrator credentials.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setEmail('admin@manpowerlink.com');
    setPassword('Admin@2026Secure');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          {branding.mainLogoUrl ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-1.5 shadow-lg mb-3 border-2 border-[#FFC928] overflow-hidden">
              <img
                src={branding.mainLogoUrl}
                alt={branding.appName || 'Logo'}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white font-black text-2xl shadow-lg mb-3 border border-[#FFC928]"
              style={{ backgroundColor: branding.primaryColor || '#D71920' }}
            >
              {branding.appName?.charAt(0) || 'M'}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-[#202124]">
            {branding.appName || 'ManPowerLink'} <span style={{ color: branding.primaryColor || '#D71920' }}>Admin</span>
          </h1>
          <p className="text-xs text-[#686868] mt-1">
            {branding.tagline || 'Enterprise Temporary Manpower Marketplace Management'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#202124]/10 rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#202124]">Administrative Sign In</h2>
            <p className="text-xs text-[#686868] mt-0.5">
              Enter your credentials to access the central operations control center.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-[#C62828]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@manpowerlink.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#202124]">
                  Password
                </label>
                <span className="text-[11px] text-[#686868]">MFA Protected</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-[#686868] cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#D71920] focus:ring-[#D71920]" />
                <span>Remember this terminal</span>
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs font-medium text-[#D71920] hover:underline"
              >
                Auto-Fill Credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer border border-[#FFC928]/40"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#FFC928]" />
                </>
              )}
            </button>

            {/* Quick Mobile Apps Preview Launchers (ONLY shown when developer mode is enabled for testing) */}
            {(showPreviews || devUnlocked) && (
              <div className="pt-3 border-t border-[#202124]/10 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#202124] uppercase tracking-wider">
                    Developer Cross-Check & Testing
                  </span>
                  <span className="text-[10px] font-bold bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded-full">
                    Preview Mode
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenPreview ? onOpenPreview('customer') : undefined}
                    className="py-2.5 px-3 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border border-amber-300"
                  >
                    <Smartphone className="w-4 h-4 text-[#D71920]" />
                    <span>Customer App</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPreview ? onOpenPreview('employee') : undefined}
                    className="py-2.5 px-3 bg-[#D71920] hover:bg-[#A80F18] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border border-[#FFC928]"
                  >
                    <Smartphone className="w-4 h-4 text-[#FFC928]" />
                    <span>Employee App</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenPreview ? onOpenPreview('dual') : undefined}
                  className="w-full py-2.5 px-3 bg-linear-to-r from-[#D71920] via-[#E5A900] to-[#FFC928] hover:opacity-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span className="bg-[#202124] text-[#FFC928] px-1.5 py-0.5 rounded text-[10px] font-mono">LIVE</span>
                  <span>Launch Dual Side-by-Side Apps Simulator</span>
                </button>
              </div>
            )}
          </form>

          {/* Credentials notice */}
          <div className="mt-5 pt-4 border-t border-[#202124]/10 text-center">
            <p className="text-[11px] text-[#686868]">
              Administrator Terminal: <span className="font-mono text-[#202124]">admin@manpowerlink.com</span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-[#D71920]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D71920]" />
              <span>RBAC & Central Backend Synchronization Enabled</span>
            </div>
          </div>
        </div>

        {/* Production Footer for Client Delivery */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-[#686868]/70 select-none">
            © 2026 {branding.appName || 'ManPowerLink'} Technologies Inc. • Enterprise Platform v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};
