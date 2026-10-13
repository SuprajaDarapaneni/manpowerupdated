import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Key,
  DollarSign,
  Star,
  ChevronLeft,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Booking, Worker } from '../../types';
import { dataService } from '../../services/storage';

interface EmployeeAppSimulatorProps {
  workers: Worker[];
  bookings: Booking[];
}

type WorkerScreen = 'dashboard' | 'job-details' | 'active-job' | 'earnings';

export const EmployeeAppSimulator: React.FC<EmployeeAppSimulatorProps> = ({
  workers,
  bookings,
}) => {
  const currentWorker = workers[0]; // Ramesh Kumar by default
  const [screen, setScreen] = useState<WorkerScreen>('dashboard');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const [bidAmount, setBidAmount] = useState(2000);
  const [bidNote, setBidNote] = useState('Available with safety gear.');

  // OTP inputs
  const [startOtpInput, setStartOtpInput] = useState('');
  const [endOtpInput, setEndOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  const handleBidSubmit = () => {
    if (!selectedBooking) return;
    dataService.submitBid(selectedBooking.id, currentWorker.id, Number(bidAmount), bidNote);
    setScreen('dashboard');
  };

  const handleDirectAccept = () => {
    if (!selectedBooking) return;
    dataService.directAcceptJob(selectedBooking.id, currentWorker.id);
    setScreen('active-job');
  };

  const handleVerifyStartOtp = () => {
    if (!selectedBooking) return;
    const res = dataService.verifyStartOtp(selectedBooking.id, currentWorker.id, startOtpInput);
    setOtpMessage(res.message);
    if (res.success) {
      setStartOtpInput('');
    }
  };

  const handleVerifyEndOtp = () => {
    if (!selectedBooking) return;
    const res = dataService.verifyEndOtp(selectedBooking.id, currentWorker.id, endOtpInput);
    setOtpMessage(res.message);
    if (res.success) {
      setEndOtpInput('');
      setScreen('dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Device Frame */}
      <div className="w-[370px] h-[740px] bg-[#202124] rounded-[48px] p-3 shadow-2xl border-4 border-[#202124]/40 flex flex-col relative overflow-hidden">
        {/* Notch */}
        <div className="w-36 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
        </div>

        {/* Screen Canvas (Flutter Theme) */}
        <div className="flex-1 bg-[#FFFDF8] rounded-[38px] overflow-hidden flex flex-col text-[#202124] select-none">
          {/* Top Bar */}
          <div className="bg-[#1E1F23] text-white p-4 pt-3 flex items-center justify-between shrink-0 shadow-sm border-b border-[#FFC928]/30">
            <div className="flex items-center gap-2">
              {screen !== 'dashboard' ? (
                <button
                  onClick={() => setScreen('dashboard')}
                  className="p-1 text-white hover:bg-white/10 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-6 h-6 rounded bg-[#D71920] text-white font-black flex items-center justify-center text-xs">
                  W
                </div>
              )}
              <span className="font-bold text-sm tracking-tight">ManPowerLink Worker</span>
            </div>
            <span className="text-[11px] font-bold text-[#FFC928]">Active Duty</span>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. EMPLOYEE DASHBOARD (Matches PDF Employee Screen 1) */}
            {screen === 'dashboard' && (
              <div className="space-y-4">
                {/* Greeting & Balance Card */}
                <div className="bg-gradient-to-br from-[#1E1F23] to-[#2D3037] text-white p-4 rounded-2xl shadow-md border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/70">Hello, {currentWorker.name.split(' ')[0]}</p>
                      <h2 className="text-xl font-black text-[#FFC928] tabular-nums mt-0.5">
                        ₹{currentWorker.totalEarnings.toLocaleString()}
                      </h2>
                      <p className="text-[10px] text-white/50">Available Worker Balance</p>
                    </div>
                    <img
                      src={currentWorker.avatar}
                      alt={currentWorker.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#FFC928]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                    <div>
                      <span className="text-xs font-bold text-white tabular-nums">
                        {currentWorker.completedJobsCount}
                      </span>
                      <p className="text-[10px] text-white/50">Completed Jobs</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#FFC928] flex items-center justify-center gap-0.5">
                        ★ {currentWorker.rating}
                      </span>
                      <p className="text-[10px] text-white/50">Worker Rating</p>
                    </div>
                  </div>
                </div>

                {/* Available Nearby Jobs Broadcast */}
                <div>
                  <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-2">
                    Open Jobs in Mangalore
                  </h3>
                  <div className="space-y-2.5">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-white rounded-xl border border-[#202124]/10 shadow-xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#D71920] block">
                              {b.orderNumber}
                            </span>
                            <h4 className="text-xs font-bold text-[#202124]">{b.categoryName}</h4>
                            <p className="text-[11px] text-[#686868] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#D71920]" />
                              {b.workLocation.city}
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-[#16834A] tabular-nums">
                            ₹{b.offeredPricePerWorker}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-[#686868]">
                            Needs {b.requiredWorkers} workers ({b.acceptedWorkersCount} filled)
                          </span>
                          <button
                            onClick={() => {
                              setSelectedBookingId(b.id);
                              setBidAmount(b.offeredPricePerWorker);
                              setScreen('job-details');
                            }}
                            className="px-3 py-1 bg-[#D71920] hover:bg-[#A80F18] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                          >
                            View Job
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. JOB DETAILS & BIDDING (Matches PDF Employee Screen 2) */}
            {screen === 'job-details' && (
              <div className="space-y-3.5">
                <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs">
                  <span className="text-[10px] text-[#686868] font-bold uppercase tracking-wider">
                    {selectedBooking.orderNumber}
                  </span>
                  <h3 className="text-base font-bold text-[#202124] mt-0.5">
                    {selectedBooking.categoryName}
                  </h3>
                  <div className="mt-2 text-xs text-[#686868] space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                      {selectedBooking.workLocation.address}, {selectedBooking.workLocation.city}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FFC928]" />
                      {selectedBooking.scheduledDate} · {selectedBooking.startTime}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#686868]" />
                      Duration: {selectedBooking.durationType.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs">
                  <span className="text-xs font-bold text-[#202124] block mb-1">
                    Employer Work Instructions:
                  </span>
                  <p className="text-xs text-[#686868] leading-relaxed">
                    {selectedBooking.description}
                  </p>
                </div>

                {/* Bidding or Fixed Price Options */}
                <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#202124] block mb-1">
                      Your Proposed Bid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#202124] block mb-1">
                      Note to Employer
                    </label>
                    <input
                      type="text"
                      value={bidNote}
                      onChange={(e) => setBidNote(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleBidSubmit}
                      className="py-2.5 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Submit Bid
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectAccept}
                      className="py-2.5 bg-[#16834A] hover:bg-[#126639] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Accept Job
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ACTIVE JOB & ATTENDANCE OTP VERIFICATION */}
            {screen === 'active-job' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs">
                  <span className="text-[10px] text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Job Assigned · On Site
                  </span>
                  <h3 className="text-sm font-bold text-[#202124] mt-1.5">
                    {selectedBooking.orderNumber} — {selectedBooking.categoryName}
                  </h3>
                  <p className="text-xs text-[#686868] mt-0.5">{selectedBooking.customerName}</p>
                </div>

                {otpMessage && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    {otpMessage}
                  </div>
                )}

                {/* Step 1: Start OTP */}
                <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#D71920]" />
                    <h4 className="text-xs font-bold text-[#202124]">Step 1: Start Work OTP</h4>
                  </div>
                  <p className="text-[11px] text-[#686868]">
                    Ask employer on-site for their 4-digit start OTP to begin clocked work:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={startOtpInput}
                      onChange={(e) => setStartOtpInput(e.target.value)}
                      placeholder="e.g. 4829"
                      className="flex-1 px-3 py-1.5 text-center font-mono font-bold text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                    <button
                      onClick={handleVerifyStartOtp}
                      className="px-3 py-1.5 bg-[#D71920] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Step 2: End OTP */}
                <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16834A]" />
                    <h4 className="text-xs font-bold text-[#202124]">Step 2: End Work & Collect Pay</h4>
                  </div>
                  <p className="text-[11px] text-[#686868]">
                    Enter completion code from employer when finished:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={endOtpInput}
                      onChange={(e) => setEndOtpInput(e.target.value)}
                      placeholder="e.g. 9154"
                      className="flex-1 px-3 py-1.5 text-center font-mono font-bold text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                    <button
                      onClick={handleVerifyEndOtp}
                      className="px-3 py-1.5 bg-[#16834A] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Complete
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setScreen('dashboard')}
                  className="w-full py-2 text-xs font-semibold text-[#686868] hover:text-[#202124]"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
