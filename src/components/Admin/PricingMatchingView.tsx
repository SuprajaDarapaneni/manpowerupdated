import React, { useState } from 'react';
import { Sliders, ShieldCheck, MapPin, Key, Clock, CheckCircle2 } from 'lucide-react';
import { OtpVerificationSettings } from '../../types';
import { dataService } from '../../services/storage';

interface PricingMatchingViewProps {
  initialOtpSettings: OtpVerificationSettings;
}

export const PricingMatchingView: React.FC<PricingMatchingViewProps> = ({
  initialOtpSettings,
}) => {
  const [settings, setSettings] = useState<OtpVerificationSettings>(initialOtpSettings);
  const [saved, setSaved] = useState(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState(15);
  const [acceptanceTimeoutMins, setAcceptanceTimeoutMins] = useState(30);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.setOtpSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <h1 className="text-xl font-bold text-[#202124]">Pricing, Matching & Verification Rules</h1>
        <p className="text-xs text-[#686868] mt-1">
          Configure automated worker broadcast radius, attendance OTP controls, and geofencing safeguards.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs max-w-3xl">
        {saved && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-[#16834A]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Rules saved and active across worker dispatch algorithms.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* OTP Controls */}
          <div>
            <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
              Attendance & OTP Verification
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#202124] block">Require Work Start OTP</span>
                  <span className="text-[11px] text-[#686868]">
                    Worker must get 4-digit code from customer at worksite to start clocked billing.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireStartOtp}
                  onChange={(e) => setSettings({ ...settings, requireStartOtp: e.target.checked })}
                  className="rounded text-[#D71920] focus:ring-[#D71920] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#202124] block">Require Work End OTP</span>
                  <span className="text-[11px] text-[#686868]">
                    Customer must verify final completion code before payment is released from escrow.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireEndOtp}
                  onChange={(e) => setSettings({ ...settings, requireEndOtp: e.target.checked })}
                  className="rounded text-[#D71920] focus:ring-[#D71920] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#202124] block">GPS Geofence Arrival Check</span>
                  <span className="text-[11px] text-[#686868]">
                    Requires worker phone location to be within site geofence radius before OTP entry.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireGpsArrival}
                  onChange={(e) => setSettings({ ...settings, requireGpsArrival: e.target.checked })}
                  className="rounded text-[#D71920] focus:ring-[#D71920] w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Numeric parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Geofence Radius (Meters)
              </label>
              <input
                type="number"
                value={settings.geofenceRadiusMeters}
                onChange={(e) =>
                  setSettings({ ...settings, geofenceRadiusMeters: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Matching Radius (KM)
              </label>
              <input
                type="number"
                value={searchRadiusKm}
                onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Bid Acceptance Timeout (Mins)
              </label>
              <input
                type="number"
                value={acceptanceTimeoutMins}
                onChange={(e) => setAcceptanceTimeoutMins(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
          >
            Save Verification Settings
          </button>
        </form>
      </div>
    </div>
  );
};
