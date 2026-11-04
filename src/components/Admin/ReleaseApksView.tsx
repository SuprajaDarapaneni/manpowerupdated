import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileCode,
  Calendar,
  Zap,
  Info,
  Radio,
  Bell,
  ArrowDownToLine,
  QrCode,
  RefreshCw,
  Github,
} from 'lucide-react';

interface ApkItem {
  id: string;
  name: string;
  role: 'customer' | 'employee';
  version: string;
  fileName: string;
  fileSize: string;
  buildDate: string;
  packageName: string;
  downloadUrl: string;
  githubUrl: string;
  color: string;
  badge: string;
  description: string;
  highlights: string[];
}

export const ReleaseApksView: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const apks: ApkItem[] = [
    {
      id: 'apk-customer',
      name: 'ManPowerLink Customer App',
      role: 'customer',
      version: 'v2.4.0',
      fileName: 'ManPowerLink-Customer-v2.4.0.apk',
      fileSize: '50.1 MB',
      buildDate: '04 Nov 2026',
      packageName: 'com.manpowerlink.customer.customer_app',
      downloadUrl: '/release-apks/ManPowerLink-Customer-v2.4.0.apk',
      githubUrl:
        'https://github.com/SuprajaDarapaneni/manpowerupdated/raw/main/release-apks/ManPowerLink-Customer-v2.4.0.apk',
      color: '#D71920',
      badge: 'Employers & Clients',
      description:
        'Official mobile app for business owners, warehouse operators, and logistics managers to post shifts, verify worker OTPs, and pay via UPI.',
      highlights: [
        'Instant Labor Dispatch (< 15 mins matching)',
        'Live GPS Tracking & Geofenced Worksite Perimeter',
        '2-Step Attendance Security (Start & End OTP Verification)',
        'Instant Kotak / PhonePe UPI & QR Code Payments',
        'Real-Time Push Notification Banners & Gentle Chimes',
      ],
    },
    {
      id: 'apk-employee',
      name: 'ManPowerLink Employee App',
      role: 'employee',
      version: 'v2.4.0',
      fileName: 'ManPowerLink-Employee-v2.4.0.apk',
      fileSize: '48.5 MB',
      buildDate: '04 Nov 2026',
      packageName: 'com.manpowerlink.worker.employee_app',
      downloadUrl: '/release-apks/ManPowerLink-Employee-v2.4.0.apk',
      githubUrl:
        'https://github.com/SuprajaDarapaneni/manpowerupdated/raw/main/release-apks/ManPowerLink-Employee-v2.4.0.apk',
      color: '#FFC928',
      badge: 'Workers & Partners',
      description:
        'Dedicated worker application for on-demand job bidding, shift radar alerts, biometric attendance verification, and instant UPI wallet payouts.',
      highlights: [
        'Live Shift Radar & 1.5x High-Demand Surge Bonuses',
        'Urgent Ringtone Siren on New Incoming Job Dispatches',
        'Start OTP Verification with Worksite Supervisors',
        'Prepaid Worker Wallet & Instant UPI Payout Withdrawals',
        'Push Notification Center with 1-Click Destination Routing',
      ],
    },
  ];

  const handleDownloadClick = (apk: ApkItem) => {
    setDownloadingId(apk.id);
    setTimeout(() => {
      setDownloadingId(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D71920] text-white flex items-center justify-center shadow-xs">
            <Smartphone className="w-6 h-6 text-[#FFC928]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#202124]">
              Release APKs &amp; Mobile App Downloads
            </h1>
            <p className="text-xs text-[#686868] mt-0.5">
              Production-ready Android application binaries (.apk) signed and ready for immediate deployment and sideloading.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>2 Signed Release APKs Ready</span>
          </span>
        </div>
      </div>

      {/* APK Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {apks.map((apk) => {
          const isCustomer = apk.role === 'customer';
          return (
            <div
              key={apk.id}
              className="bg-white rounded-2xl border border-[#202124]/10 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-5">
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                        isCustomer ? 'bg-[#D71920]' : 'bg-[#1E1F23]'
                      }`}
                    >
                      {isCustomer ? (
                        <Smartphone className="w-6 h-6 text-[#FFC928]" />
                      ) : (
                        <HardHat className="w-6 h-6 text-[#FFC928]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-[#202124]">{apk.name}</h2>
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-[#FFC928]/30 text-[#A80F18]">
                          {apk.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{apk.packageName}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg ${
                      isCustomer ? 'bg-red-50 text-[#D71920]' : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {apk.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{apk.description}</p>

                {/* File Specs Pill Box */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Package</span>
                    <strong className="text-slate-800 text-[11px]">Android APK</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">File Size</span>
                    <strong className="text-slate-800 text-[11px]">{apk.fileSize}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Build Date</span>
                    <strong className="text-emerald-700 text-[11px]">{apk.buildDate}</strong>
                  </div>
                </div>

                {/* Key Features List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FFC928]" />
                    <span>Included Production Features</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {apk.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Download Action Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-mono text-slate-500 truncate block">
                    {apk.fileName}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Signed &amp; Verified
                    </span>
                    <a
                      href={apk.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-500 hover:text-[#D71920] flex items-center gap-1 font-semibold"
                      title="Direct GitHub Raw Mirror"
                    >
                      <Github className="w-3 h-3" /> GitHub Mirror
                    </a>
                  </div>
                </div>

                <a
                  href={apk.downloadUrl}
                  download={apk.fileName}
                  onClick={() => handleDownloadClick(apk)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 text-white ${
                    isCustomer
                      ? 'bg-[#D71920] hover:bg-[#A80F18]'
                      : 'bg-[#1E1F23] hover:bg-black'
                  }`}
                >
                  <ArrowDownToLine className="w-4 h-4 text-[#FFC928]" />
                  <span>
                    {downloadingId === apk.id ? 'Starting Download...' : 'Download APK'}
                  </span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Android Sideloading Instructions */}
      <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#D71920]" />
          <h3 className="text-sm font-extrabold text-[#202124]">
            How to Install the APK on Your Android Device
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D71920] text-white font-black flex items-center justify-center text-[11px]">
              1
            </span>
            <h5 className="font-bold text-[#202124]">Download APK</h5>
            <p className="text-slate-600 text-[11px]">
              Click the Download APK button on your Android phone browser or transfer the downloaded file from PC via USB / WhatsApp.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D71920] text-white font-black flex items-center justify-center text-[11px]">
              2
            </span>
            <h5 className="font-bold text-[#202124]">Allow Unknown Sources</h5>
            <p className="text-slate-600 text-[11px]">
              If prompted with "File might be harmful" or "Install unknown apps", tap <strong>Settings &rarr; Allow from this source</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D71920] text-white font-black flex items-center justify-center text-[11px]">
              3
            </span>
            <h5 className="font-bold text-[#202124]">Tap Install</h5>
            <p className="text-slate-600 text-[11px]">
              Select <strong>Install</strong> on the Android package installer popup. The installation finishes in 5-10 seconds.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D71920] text-white font-black flex items-center justify-center text-[11px]">
              4
            </span>
            <h5 className="font-bold text-[#202124]">Grant Permissions</h5>
            <p className="text-slate-600 text-[11px]">
              Open the app and allow <strong>Push Notifications</strong> and <strong>GPS Location</strong> for live dispatching and OTP attendance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
