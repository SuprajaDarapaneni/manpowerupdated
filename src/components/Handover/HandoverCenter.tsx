import React, { useState } from 'react';
import {
  Download,
  FolderGit2,
  FileCode,
  ShieldCheck,
  Smartphone,
  Server,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  Archive,
  ExternalLink,
} from 'lucide-react';
import { PACKAGES_INFO, generatePackageZip, downloadBlob } from '../../services/zipExport';

interface HandoverCenterProps {
  onEnableClientDeliveryMode: () => void;
  isClientDeliveryMode: boolean;
}

export const HandoverCenter: React.FC<HandoverCenterProps> = ({
  onEnableClientDeliveryMode,
  isClientDeliveryMode,
}) => {
  const [downloadingPackage, setDownloadingPackage] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = async (filename: string) => {
    try {
      setDownloadingPackage(filename);
      const blob = await generatePackageZip(filename);
      downloadBlob(blob, filename);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloadingPackage(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner explaining Public/Src vs Independent Projects */}
      <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-[#FFC928]/30 text-[#A80F18] rounded-md">
                Architecture & Client Handover
              </span>
              <span className="text-xs text-[#686868]">Code Separation & Standalone ZIPs</span>
            </div>
            <h1 className="text-xl font-bold text-[#202124] mt-2">
              Source Code Separation & Client Delivery Portal
            </h1>
            <p className="text-xs text-[#686868] mt-1 max-w-2xl leading-relaxed">
              Why <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#D71920]">src/</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#D71920]">public/</code> exist at root: they serve as the browser runtime preview server on port 3000. 
              The actual production codebases are completely isolated into independent Flutter mobile apps and central Node.js backend.
            </p>
          </div>

          <button
            onClick={onEnableClientDeliveryMode}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer ${
              isClientDeliveryMode
                ? 'bg-[#16834A] text-white hover:bg-[#126639]'
                : 'bg-[#D71920] text-white hover:bg-[#A80F18]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              {isClientDeliveryMode
                ? 'Client Delivery Mode Active (Admin Only)'
                : 'Enable Client Delivery Mode (Hide All Headers)'}
            </span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-[#16834A]">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Package Generated Successfully!</p>
            <p className="text-[11px] text-emerald-800">
              Downloaded <span className="font-mono">{downloadSuccess}</span> with full directory hierarchy and dependency manifests.
            </p>
          </div>
        </div>
      )}

      {/* Directory Separation Matrix */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-[#202124] mb-3">
          Separated Codebase Architecture Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#202124]/10 space-y-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#D71920]" />
              <h3 className="text-xs font-bold text-[#202124]">1. Admin Panel & Backend</h3>
            </div>
            <p className="text-[11px] text-[#686868]">
              Located in <code className="font-mono text-[#D71920]">/admin/</code> with <code className="font-mono">frontend/</code> (React) and <code className="font-mono">backend/</code> (Node + Express + MongoDB).
            </p>
            <span className="inline-block text-[10px] font-semibold text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded">
              Central REST API v1
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#202124]/10 space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#16834A]" />
              <h3 className="text-xs font-bold text-[#202124]">2. Customer Mobile App</h3>
            </div>
            <p className="text-[11px] text-[#686868]">
              Located in <code className="font-mono text-[#D71920]">/customer-app/</code>. Standalone Flutter + Dart project with Riverpod, Dio & Google Maps.
            </p>
            <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Independent Android / iOS App
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#202124]/10 space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FFC928]" />
              <h3 className="text-xs font-bold text-[#202124]">3. Employee Mobile App</h3>
            </div>
            <p className="text-[11px] text-[#686868]">
              Located in <code className="font-mono text-[#D71920]">/employee-app/</code>. Standalone Flutter + Dart project for worker bidding & OTP attendance.
            </p>
            <span className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Independent Android / iOS App
            </span>
          </div>
        </div>
      </div>

      {/* Independent ZIP Packages Download Grid */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#202124]">Client Handover Download Packages</h2>
            <p className="text-xs text-[#686868]">
              Download the standalone zip packages to hand over to clients or other mobile developers.
            </p>
          </div>
          <Archive className="w-5 h-5 text-[#D71920]" />
        </div>

        <div className="space-y-3">
          {PACKAGES_INFO.map((pkg) => {
            const isProcessing = downloadingPackage === pkg.filename;
            return (
              <div
                key={pkg.filename}
                className="p-4 rounded-xl border border-[#202124]/10 bg-[#FFFDF8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#D71920] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#202124]">{pkg.name}</span>
                    <span className="font-mono text-[11px] text-[#686868] bg-slate-100 px-1.5 py-0.5 rounded">
                      {pkg.filename}
                    </span>
                  </div>
                  <p className="text-xs text-[#686868] max-w-xl">{pkg.description}</p>
                  <p className="text-[11px] text-[#202124]/80">
                    <span className="font-semibold">Tech Stack:</span> {pkg.techStack}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(pkg.filename)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0 disabled:bg-gray-400 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Generating ZIP...' : 'Download ZIP'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
