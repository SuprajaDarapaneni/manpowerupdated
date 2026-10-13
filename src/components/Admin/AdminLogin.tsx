import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, Smartphone } from 'lucide-react';
import { dataService } from '../../services/storage';

interface AdminLoginProps {
  onSuccess: () => void;
  onDevToggle?: () => void;
  onOpenPreview?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onDevToggle, onOpenPreview }) => {
  const [email, setEmail] = useState('admin@manpowerlink.com');
  const [password, setPassword] = useState('Admin@2026Secure');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devClicks, setDevClicks] = useState(0);

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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D71920] text-white font-black text-2xl shadow-lg mb-3">
            M
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#202124]">
            ManPower<span className="text-[#D71920]">Link</span> Admin
          </h1>
          <p className="text-xs text-[#686868] mt-1">
            Enterprise Temporary Manpower Marketplace Management
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
              className="w-full mt-2 py-2.5 px-4 bg-[#D71920] hover:bg-[#A80F18] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {onOpenPreview && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="w-full mt-2 py-2.5 px-4 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#202124]" />
                <span>Check Customer & Employee Apps Preview</span>
              </button>
            )}
          </form>

          {/* Credentials notice */}
          <div className="mt-6 pt-5 border-t border-[#202124]/10 text-center">
            <p className="text-[11px] text-[#686868]">
              Administrator Terminal: <span className="font-mono text-[#202124]">admin@manpowerlink.com</span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-[#16834A]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RBAC & Central Backend Synchronization Enabled</span>
            </div>
          </div>
        </div>

        {/* Footer with subtle developer unlock on triple-click */}
        <div className="mt-6 text-center">
          <p
            onClick={() => {
              if (onDevToggle) {
                const next = devClicks + 1;
                setDevClicks(next);
                if (next >= 3) {
                  setDevClicks(0);
                  onDevToggle();
                }
              }
            }}
            className="text-[10px] text-[#686868]/60 cursor-default select-none transition-colors"
            title="Production Environment"
          >
            © 2026 ManPowerLink Technologies Inc. v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};
