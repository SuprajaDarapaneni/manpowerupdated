import React, { useState } from 'react';
import { CustomerAppSimulator } from './CustomerSimulator/CustomerAppSimulator';
import { EmployeeAppSimulator } from './EmployeeSimulator/EmployeeAppSimulator';
import { Booking, ServiceCategory, Worker } from '../types';
import { Smartphone, HardHat, RefreshCw, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { dataService } from '../services/storage';

interface DualAppsPreviewProps {
  categories: ServiceCategory[];
  workers: Worker[];
  bookings: Booking[];
  onOpenAdmin: () => void;
}

export const DualAppsPreview: React.FC<DualAppsPreviewProps> = ({
  categories,
  workers,
  bookings,
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'customer' | 'employee'>('both');

  const handleSimulateInstantBid = () => {
    // Quick test helper: Submit Ramesh's bid on the first active booking
    const target = bookings[0];
    if (target) {
      dataService.submitBid(target.id, 'w-1', 2000, 'I can reach with safety gear in 30 mins.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the dual app architecture */}
      <div className="bg-white p-5 rounded-2xl border border-[#202124]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#FFC928]/30 text-[#A80F18] rounded-md">
              Mobile Apps Preview
            </span>
            <span className="text-xs text-[#686868]">Flutter + Dart Client Architecture</span>
          </div>
          <h1 className="text-lg font-bold text-[#202124] mt-1">
            Interactive Customer & Employee Mobile Apps Sandbox
          </h1>
          <p className="text-xs text-[#686868] mt-0.5 max-w-2xl">
            Test the live interactive synchronization between employers and temporary workers. Any action taken in these mobile simulators immediately updates the central MongoDB state and Admin Panel!
          </p>
        </div>

        {/* View Switchers (Both / Customer / Employee) */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <div className="flex bg-[#FFFDF8] p-1 rounded-xl border border-[#202124]/15">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'both' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
              }`}
            >
              Side-by-Side Dual View
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'customer' ? 'bg-[#16834A] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
              }`}
            >
              Customer App Only
            </button>
            <button
              onClick={() => setActiveTab('employee')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'employee' ? 'bg-[#FFC928] text-[#202124] shadow-xs' : 'text-[#686868] hover:text-[#202124]'
              }`}
            >
              Employee App Only
            </button>
          </div>

          <button
            onClick={handleSimulateInstantBid}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Auto-trigger Ramesh's bid on Order #1045"
          >
            <Zap className="w-3.5 h-3.5 text-[#D71920]" />
            <span className="hidden sm:inline">Simulate Bid</span>
          </button>
        </div>
      </div>

      {/* Interactive Mobile Device Viewport Studio */}
      <div className="bg-[#121316] p-6 md:p-10 rounded-3xl border border-white/5 flex flex-wrap items-start justify-center gap-10 shadow-inner">
        {/* Phone 1: Customer App */}
        {(activeTab === 'both' || activeTab === 'customer') && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 text-white">
              <div className="w-6 h-6 rounded-md bg-[#D71920] text-white flex items-center justify-center text-xs font-bold">
                C
              </div>
              <span className="text-xs font-bold">Customer App (Employer)</span>
              <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded">
                Flutter /customer-app
              </span>
            </div>
            <CustomerAppSimulator
              categories={categories}
              workers={workers}
              bookings={bookings}
            />
          </div>
        )}

        {/* Real-time sync indicator if in dual mode */}
        {activeTab === 'both' && (
          <div className="hidden 2xl:flex flex-col items-center justify-center self-center text-white/40 max-w-[120px] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FFC928]">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <span className="text-[11px] font-bold text-white/80">Live Socket Sync</span>
            <p className="text-[10px] leading-tight">
              Customer posts job ➔ Employee bids ➔ Customer verifies Start OTP
            </p>
          </div>
        )}

        {/* Phone 2: Employee App */}
        {(activeTab === 'both' || activeTab === 'employee') && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 text-white">
              <div className="w-6 h-6 rounded-md bg-[#FFC928] text-[#202124] flex items-center justify-center text-xs font-bold">
                W
              </div>
              <span className="text-xs font-bold">Employee App (Worker)</span>
              <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded">
                Flutter /employee-app
              </span>
            </div>
            <EmployeeAppSimulator
              workers={workers}
              bookings={bookings}
            />
          </div>
        )}
      </div>
    </div>
  );
};
