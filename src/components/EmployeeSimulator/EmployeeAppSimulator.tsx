import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Search,
  Briefcase,
  MessageSquare,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Key,
  DollarSign,
  Star,
  ChevronLeft,
  Shield,
  ArrowRight,
  ChevronRight,
  LogOut,
  Send,
  Zap,
  Phone,
  Power,
  ShieldCheck,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Navigation,
  Compass,
  CreditCard,
  Plus,
  Volume2,
  AlertTriangle,
  Wallet,
  Coffee,
  Pause,
  Play,
  Receipt,
} from 'lucide-react';
import { Booking, Worker, StatusTimelineNode } from '../../types';
import { dataService, playNotificationSound } from '../../services/storage';

interface EmployeeAppSimulatorProps {
  workers: Worker[];
  bookings: Booking[];
}

type EmployeeTab = 'home' | 'find-jobs' | 'my-work' | 'messages' | 'profile';
type EmployeeAuthScreen = 'sign-in' | 'sign-up' | 'forgot-password';

export const EmployeeAppSimulator: React.FC<EmployeeAppSimulatorProps> = ({
  workers,
  bookings,
}) => {
  const currentWorker = workers[0] || {
    id: 'w-1',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    category: 'Loading & Unloading',
    rating: 4.9,
    totalJobsCompleted: 142,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    approvalStatus: 'approved',
    walletBalance: 4200,
  };

  // Branding State
  const [branding, setBranding] = useState(() => dataService.getBrandingSettings());

  useEffect(() => {
    return dataService.subscribe(() => {
      setBranding(dataService.getBrandingSettings());
    });
  }, []);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authScreen, setAuthScreen] = useState<EmployeeAuthScreen>('sign-in');
  const [loginPhone, setLoginPhone] = useState('+91 98765 43210');
  const [loginPassword, setLoginPassword] = useState('Worker@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Main 5-Tab Navigation State
  const [activeTab, setActiveTab] = useState<EmployeeTab>('home');
  const [isOnline, setIsOnline] = useState(true);

  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(currentWorker.walletBalance || 4200);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(1000);

  // Job Action States
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const [bidAmount, setBidAmount] = useState(2000);
  const [bidNote, setBidNote] = useState('Available with safety helmet and boots.');

  // Confirmation Modal State (prevents accidental clicks!)
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Audio / Alert Notification State
  const [activeAlertToast, setActiveAlertToast] = useState<string | null>(null);

  // Live Location Simulation (Automatic GPS Tracking)
  const [currentGpsLocation, setCurrentGpsLocation] = useState({
    address: 'Panambur Container Terminal Dock 4, Mangalore',
    lat: 12.945,
    lng: 74.815,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGpsLocation({
            address: `Live GPS Pin (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E), Industrial Zone, Mangalore`,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setCurrentGpsLocation({
            address: 'Live GPS Worksite Pin (12.9450° N, 74.8150° E), Panambur Terminal, Mangalore',
            lat: 12.945,
            lng: 74.815,
          });
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  }, []);

  // OTP inputs for attendance check-in/out
  const [startOtpInput, setStartOtpInput] = useState('');
  const [endOtpInput, setEndOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Messaging State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'worker' | 'customer'; text: string; time: string }>>([
    { sender: 'customer', text: 'Ramesh, please report at Dock 4 Container Bay at 9:00 AM.', time: '09:12 AM' },
    { sender: 'worker', text: 'Understood sir. I have my safety gear ready and will verify Start OTP on arrival.', time: '09:14 AM' },
    { sender: 'customer', text: 'Start OTP will be provided at worksite upon supervisor gate inspection.', time: '09:15 AM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  const triggerAppRingAlert = (message: string) => {
    playNotificationSound();
    setActiveAlertToast(message);
    setTimeout(() => {
      setActiveAlertToast(null);
    }, 4500);
  };

  // Auth Handlers
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    setTimeout(() => {
      if (loginPhone.trim() && loginPassword.length >= 6) {
        setIsAuthLoading(false);
        setIsAuthenticated(true);
        setActiveTab('home');
        triggerAppRingAlert('Worker account logged in. Radar online!');
      } else {
        setIsAuthLoading(false);
        setAuthError('Please enter valid worker phone & password (min 6 characters).');
      }
    }, 400);
  };

  const handleLogout = () => {
    setPendingConfirmAction({
      title: 'Sign Out Confirmation',
      description: 'Are you sure you want to sign out from the Worker App?',
      onConfirm: () => {
        setIsAuthenticated(false);
        setAuthScreen('sign-in');
        setAuthError(null);
        setPendingConfirmAction(null);
      },
    });
  };

  // Wallet Recharge Handler
  const handleExecuteRecharge = (amount: number) => {
    const res = dataService.rechargeWorkerWallet(currentWorker.id, amount, 'Instant UPI');
    setWalletBalance(res.newBalance);
    setShowRechargeModal(false);
    triggerAppRingAlert(`Wallet Recharged! +₹${amount}. New balance: ₹${res.newBalance}`);
  };

  // Status Actions with Confirmation Dialogs
  const promptAcceptJob = (booking: Booking) => {
    if (walletBalance < 100) {
      alert('Insufficient wallet balance! Please recharge at least ₹100 to accept job requests.');
      setShowRechargeModal(true);
      return;
    }

    setPendingConfirmAction({
      title: 'Confirm Shift Acceptance',
      description: `Accept ${booking.orderNumber} (${booking.jobTitle || booking.categoryName}) for ₹${booking.offeredPricePerWorker}? You will collect cash directly from customer at worksite.`,
      onConfirm: () => {
        dataService.directAcceptJob(booking.id, currentWorker.id);
        setSelectedBookingId(booking.id);
        setPendingConfirmAction(null);
        setActiveTab('my-work');
        triggerAppRingAlert(`Shift Accepted! Order #${booking.orderNumber} confirmed.`);
      },
    });
  };

  const promptVerifyStartOtp = () => {
    if (!startOtpInput.trim()) {
      alert('Please enter the 4-digit Start OTP from customer.');
      return;
    }

    setPendingConfirmAction({
      title: 'Confirm Work Attendance Check-in',
      description: `Verify Start OTP (${startOtpInput}) at ${currentGpsLocation.address}? Your shift timer and live GPS attendance will be activated.`,
      onConfirm: () => {
        setPendingConfirmAction(null);
        const res = dataService.verifyStartOtp(
          selectedBooking.id,
          currentWorker.id,
          startOtpInput,
          currentGpsLocation.address
        );
        setOtpMessage(res.message);
        if (res.success) {
          setStartOtpInput('');
          triggerAppRingAlert('Shift Started! Attendance recorded via Start OTP.');
        }
      },
    });
  };

  const promptVerifyEndOtp = () => {
    if (!endOtpInput.trim()) {
      alert('Please enter the 4-digit End OTP from customer.');
      return;
    }

    const wage = selectedBooking.offeredPricePerWorker || 2000;
    const fee = Math.round(wage * 0.1);

    setPendingConfirmAction({
      title: 'Confirm Work Completion & Cash Pay',
      description: `Confirm end of shift? You will collect ₹${wage} in Cash or UPI from employer. Platform fee of ₹${fee} will be deducted from your prepaid wallet.`,
      onConfirm: () => {
        setPendingConfirmAction(null);
        const res = dataService.verifyEndOtp(
          selectedBooking.id,
          currentWorker.id,
          endOtpInput,
          currentGpsLocation.address
        );
        setOtpMessage(res.message);
        if (res.success) {
          setEndOtpInput('');
          if (res.remainingWallet !== undefined) {
            setWalletBalance(res.remainingWallet);
          }
          triggerAppRingAlert(`Shift Complete! Collected ₹${wage} cash. Platform fee deducted.`);
        }
      },
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'worker',
        text: inputMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMessage('');
    triggerAppRingAlert('Message dispatched to employer.');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mobile Device Frame */}
      <div className="w-[380px] h-[760px] bg-[#1E1F23] rounded-[48px] p-3 shadow-2xl border-4 border-[#202124]/40 flex flex-col relative overflow-hidden select-none">
        {/* Notch */}
        <div className="w-36 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
        </div>

        {/* Screen Canvas */}
        <div className="flex-1 bg-[#F8FAFC] rounded-[38px] overflow-hidden flex flex-col relative text-[#202124]">
          {/* Active Audio / Ring Notification Toast */}
          {activeAlertToast && (
            <div className="absolute top-2 left-3 right-3 z-50 bg-[#D71920] text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <span className="flex-1">{activeAlertToast}</span>
            </div>
          )}

          {/* Action Confirmation Modal (Prevents accidental button clicks) */}
          {pendingConfirmAction && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-xs w-full space-y-3.5 border border-slate-200">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-5 h-5 text-[#D71920]" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-extrabold text-[#202124]">{pendingConfirmAction.title}</h4>
                  <p className="text-xs text-[#686868] mt-1 leading-relaxed">
                    {pendingConfirmAction.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPendingConfirmAction(null)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-[#202124] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={pendingConfirmAction.onConfirm}
                    className="py-2.5 px-3 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prepaid Wallet Recharge Modal */}
          {showRechargeModal && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-xs w-full space-y-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#D71920]" />
                    <h4 className="text-sm font-bold text-[#202124]">Recharge Prepaid Wallet</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRechargeModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-[#686868]">
                  Recharge to receive & accept jobs. Platform fees are deducted automatically from this wallet balance.
                </p>

                <div className="grid grid-cols-3 gap-2 py-1">
                  {[500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleExecuteRecharge(amt)}
                      className="py-2.5 px-2 bg-[#FFC928]/20 hover:bg-[#FFC928]/30 text-[#202124] border border-[#FFC928]/50 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#686868]">
                  <span>Payment Gateway:</span>
                  <span className="font-bold text-[#202124]">UPI / GPay / NetBanking</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* A. UNAUTHENTICATED SCREENS */}
          {/* ========================================================== */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col bg-[#FFFDF8] overflow-y-auto p-5">
              <div className="text-center mt-3 mb-5">
                {branding.mainLogoUrl ? (
                  <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md mb-2 mx-auto border-2 border-[#FFC928] overflow-hidden flex items-center justify-center">
                    <img src={branding.mainLogoUrl} alt={branding.appName || 'Logo'} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md mb-2 border border-[#D71920]"
                    style={{ backgroundColor: branding.secondaryColor || '#FFC928', color: '#202124' }}
                  >
                    {branding.appName?.charAt(0) || 'W'}
                  </div>
                )}
                <h1 className="text-lg font-bold text-[#202124]">
                  {branding.appName || 'ManPowerLink'}
                </h1>
                <p className="text-[11px] font-bold text-[#D71920] uppercase tracking-wider">
                  Employee App
                </p>
                <p className="text-xs text-[#686868] mt-1">
                  Find work opportunities and manage shifts
                </p>
              </div>

              {authError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-[#C62828]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#202124] mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#202124] mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Sign In to Employee App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthenticated(true);
                      setActiveTab('home');
                    }}
                    className="w-full py-2 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Quick Enter Employee App →</span>
                  </button>
                </div>

                <div className="pt-4 text-center border-t border-slate-100">
                  <p className="text-xs text-[#686868]">
                    New worker? <span className="font-bold text-[#D71920]">Sign Up via Admin</span>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================== */
            /* B. AUTHENTICATED APP WITH PREPAID WALLET & STATUS CONFIRMATIONS */
            /* ========================================================== */
            <>
              {/* Top Bar with Online Switch & GPS Ping */}
              <div className="h-14 bg-[#1E1F23] text-white px-3 flex items-center justify-between shrink-0 shadow-sm border-b border-[#FFC928]/30 z-20">
                <div className="flex items-center gap-1.5">
                  {/* In-app Back button so clicking Back returns to home instead of closing app */}
                  {activeTab !== 'home' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('home')}
                      className="p-1 -ml-1 hover:bg-white/10 rounded-xl transition-all cursor-pointer flex items-center gap-0.5 text-[#FFC928] bg-black/40 shadow-2xs border border-[#FFC928]/20"
                      title="Back to Worker Home"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#FFC928] stroke-[2.5]" />
                      <span className="text-[11px] font-bold pr-1">Back</span>
                    </button>
                  ) : (
                    branding.mainLogoUrl ? (
                      <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={branding.mainLogoUrl} alt={branding.appName || 'Logo'} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#FFC928] text-[#202124] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                        {branding.appName?.charAt(0) || 'W'}
                      </div>
                    )
                  )}
                  <div>
                    <h2 className="font-bold text-xs leading-tight">
                      {activeTab === 'home' && `${branding.appName || 'ManPowerLink'} Worker`}
                      {activeTab === 'find-jobs' && 'Explore Available Shifts'}
                      {activeTab === 'my-work' && 'My Active Work & OTP'}
                      {activeTab === 'messages' && 'Employer Messages'}
                      {activeTab === 'profile' && 'Worker Profile & Wallet'}
                    </h2>
                    <p className="text-[10px] text-white/70 leading-tight">
                      {currentWorker.name} ({currentWorker.category})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isOnline
                        ? 'bg-[#FFC928] text-[#202124]'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Screen Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. HOME TAB */}
                {activeTab === 'home' && (
                  <div className="space-y-4">
                    {/* Worker Prepaid Wallet Card */}
                    <div className="bg-linear-to-r from-[#1E1F23] to-[#2D3039] p-4 rounded-3xl text-white shadow-md space-y-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-white/70 flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-[#FFC928]" />
                          <span>Prepaid Wallet Balance</span>
                        </span>
                        <span className="text-[10px] bg-[#FFC928]/20 text-[#FFC928] border border-[#FFC928]/40 px-2 py-0.5 rounded-full font-bold">
                          {walletBalance >= 100 ? 'Active to Receive Jobs' : 'Low Balance'}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-white">₹{walletBalance.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => setShowRechargeModal(true)}
                          className="px-3 py-1.5 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          + Recharge Wallet
                        </button>
                      </div>
                      <p className="text-[10px] text-white/60 leading-tight">
                        Cash wages are paid directly to you by the customer. Platform fee (₹200) is deducted from this wallet upon job completion.
                      </p>
                    </div>

                    {/* Today's Assigned Shift Card */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#A80F18] bg-[#FFC928]/25 px-2.5 py-1 rounded-md">
                          TODAY'S CONFIRMED SHIFT
                        </span>
                        <span className="text-xs font-black text-[#202124]">{selectedBooking?.orderNumber}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#202124]">{selectedBooking?.jobTitle || selectedBooking?.categoryName}</h4>
                        <p className="text-[11px] text-[#686868] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D71920]" />
                          <span>{selectedBooking?.workLocation?.address}</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="font-black text-[#D71920]">₹{selectedBooking?.offeredPricePerWorker} / Day (Cash)</span>
                        <button
                          onClick={() => setActiveTab('my-work')}
                          className="px-3 py-1.5 bg-[#D71920] text-white text-[11px] font-bold rounded-xl shadow-xs"
                        >
                          Attendance & OTP →
                        </button>
                      </div>
                    </div>

                    {/* Live GPS Stamp Status */}
                    <div className="bg-[#FFC928]/15 border border-[#FFC928]/40 p-3 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#D71920] text-white flex items-center justify-center shrink-0">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <h5 className="font-bold text-[#202124]">Current Worksite Location Tagged</h5>
                        <p className="text-[10px] text-[#686868] mt-0.5">{currentGpsLocation.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FIND JOBS TAB */}
                {activeTab === 'find-jobs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-[#202124] uppercase tracking-wider">
                        Available Job Radar ({bookings.length} nearby)
                      </h3>
                      <span className="text-[10px] font-bold text-[#A80F18] bg-[#FFC928]/25 px-2 py-0.5 rounded-md">
                        Radius: 15 km
                      </span>
                    </div>

                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-white rounded-3xl border border-slate-200 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#202124]">{b.orderNumber}</span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold bg-[#FFC928]/40 text-[#A80F18]">
                            {b.durationType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#202124]">{b.jobTitle || b.categoryName}</h4>
                          <p className="text-[10px] text-[#686868] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#D71920]" />
                            <span>{b.workLocation.address}</span>
                          </p>
                        </div>

                        {/* Employer Remarks & Worksite Instructions */}
                        {(b.remarks || b.specialInstructions) && (
                          <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200/90 text-xs">
                            <span className="text-[10px] text-[#A80F18] font-bold flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#D71920]" />
                              <span>Employer Remarks / Special Notes:</span>
                            </span>
                            <p className="text-[10px] text-slate-700 mt-0.5 leading-snug">
                              {b.remarks || b.specialInstructions}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              {b.pricingModel === 'full_package' ? 'Turnkey Shift Package:' : 'Shift Wage (on site):'}
                            </span>
                            <span className="text-sm font-black text-[#D71920]">
                              ₹{b.offeredPricePerWorker} / worker
                            </span>
                            <span className="text-[9px] text-slate-500 block">
                              {b.pricingModel === 'full_package' ? `★ ~${b.packageApproxHours || 8.5} hrs work duration` : `${b.shiftHours || 8} hrs @ ₹${b.pricePerHourPerHead || 250}/hr/head`}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-semibold block">Platform Fee:</span>
                            <span className="text-xs font-bold text-[#D71920]">₹200 from wallet</span>
                            <span className="text-[9px] text-emerald-700 font-bold block">
                              {b.walletDebited ? 'Paid via Customer Wallet' : 'Collect Cash on Site'}
                            </span>
                          </div>
                        </div>

                        {/* Actions with Confirmation */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => promptAcceptJob(b)}
                            className="py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Accept Shift
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingId(b.id);
                              setActiveTab('my-work');
                            }}
                            className="py-2.5 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Counter-Bid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. MY WORK TAB & ATTENDANCE TREE */}
                {activeTab === 'my-work' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-[#202124] uppercase tracking-wider">
                      Active Shift Attendance & Cash Settlement
                    </h3>

                    {/* Active Job Card */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#202124]">{selectedBooking?.orderNumber}</span>
                        <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded font-bold">
                          ASSIGNED TO YOU
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#202124]">{selectedBooking?.jobTitle || selectedBooking?.categoryName}</p>
                      <p className="text-[10px] text-[#686868] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D71920]" />
                        <span>{selectedBooking?.workLocation?.address}</span>
                      </p>

                      {otpMessage && (
                        <div className="p-2.5 bg-[#FFC928]/20 border border-[#FFC928]/40 rounded-xl text-xs text-[#A80F18] flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D71920]" />
                          <span>{otpMessage}</span>
                        </div>
                      )}

                      {/* 1. Step: GPS Worksite Arrival */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                            <span>Worksite Arrival (GPS Check)</span>
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            GPS ±10m
                          </span>
                        </div>
                        <p className="text-[10px] text-[#686868]">
                          Location: {currentGpsLocation.address}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            triggerAppRingAlert('📍 GPS Arrival Recorded! You have reached the worksite. Please request Start OTP from employer.');
                          }}
                          className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-[#202124] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D71920]" />
                          <span>I Have Reached Worksite</span>
                        </button>
                      </div>

                      {/* 2. Step 1: Start OTP with Dynamic Code & Auto-Fill */}
                      <div className="bg-amber-50/50 p-3.5 rounded-2xl border-2 border-[#FFC928]/90 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#D71920]" />
                            <span>Step 1: Verify Start OTP</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded font-black">
                              Code: {selectedBooking?.startOtp || 'Pending'}
                            </span>
                            {selectedBooking?.startOtp && (
                              <button
                                type="button"
                                onClick={() => setStartOtpInput(selectedBooking.startOtp || '')}
                                className="text-[9px] bg-[#D71920] text-white px-1.5 py-0.5 rounded font-bold hover:bg-[#A80F18] cursor-pointer"
                                title="Auto-fill OTP from booking"
                              >
                                Auto-Fill
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-[#686868]">
                          Ask the worksite employer for their 4-digit start OTP to begin shift:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={startOtpInput}
                            onChange={(e) => setStartOtpInput(e.target.value)}
                            placeholder={selectedBooking?.startOtp ? `e.g. ${selectedBooking.startOtp}` : '4-digit OTP'}
                            className="flex-1 px-3 py-1.5 text-center font-mono font-black text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/40 text-[#202124]"
                          />
                          <button
                            type="button"
                            onClick={promptVerifyStartOtp}
                            className="px-3.5 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-[#FFC928] shadow-2xs"
                          >
                            Verify & Start
                          </button>
                        </div>
                      </div>

                      {/* 3. Work In-Progress Controls: Work Hold & Resume */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124]">Work Hold / Break Management</span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {selectedBooking?.workHoldState?.isHold ? (
                              <span className="text-[#D71920] font-black animate-pulse">ON HOLD</span>
                            ) : (
                              'ACTIVE SHIFT'
                            )}
                          </span>
                        </div>
                        {selectedBooking?.workHoldState?.isHold ? (
                          <div className="space-y-1.5">
                            <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C62828] flex items-center justify-between">
                              <span>⏸ Break in progress ({selectedBooking.workHoldState.holdReason || 'Meal / Rain Break'})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedBooking) {
                                  dataService.resumeBookingWork(selectedBooking.id);
                                  triggerAppRingAlert('▶ Work Resumed! Shift timer continues.');
                                }
                              }}
                              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                            >
                              ▶ Resume Work Now
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedBooking) {
                                  dataService.holdBookingWork(selectedBooking.id, 'Lunch / Meal Break (45 min)');
                                  triggerAppRingAlert('⏸ Shift put on hold for Lunch Break.');
                                }
                              }}
                              className="flex-1 py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-[#202124] rounded-xl text-[11px] font-bold border border-amber-300 transition-colors cursor-pointer text-center"
                            >
                              ⏸ Meal Break
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedBooking) {
                                  dataService.holdBookingWork(selectedBooking.id, 'Weather / Rain Delay');
                                  triggerAppRingAlert('⏸ Shift put on hold for Weather Delay.');
                                }
                              }}
                              className="flex-1 py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-[#202124] rounded-xl text-[11px] font-bold border border-slate-300 transition-colors cursor-pointer text-center"
                            >
                              ⏸ Rain / Delay
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 4. Step 2: End OTP with Dynamic Code & Auto-Fill & Cash Collection */}
                      <div className="bg-amber-50/50 p-3.5 rounded-2xl border-2 border-[#FFC928]/90 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FFC928]" />
                            <span>Step 2: Collect Wage & End OTP</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-[#D71920] text-white px-2 py-0.5 rounded font-bold">
                              Code: {selectedBooking?.endOtp || 'Pending'}
                            </span>
                            {selectedBooking?.endOtp && (
                              <button
                                type="button"
                                onClick={() => setEndOtpInput(selectedBooking.endOtp || '')}
                                className="text-[9px] bg-[#FFC928] text-[#202124] px-1.5 py-0.5 rounded font-black hover:bg-[#E5A900] cursor-pointer"
                                title="Auto-fill End OTP"
                              >
                                Auto-Fill
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-[#202124]">
                            <span>Wage to Collect from Employer:</span>
                            <span className="text-emerald-700 font-black">₹{selectedBooking?.offeredPricePerWorker || 2000}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-[#686868]">
                            <span>Platform Commission (debited from your wallet):</span>
                            <span className="text-[#D71920] font-bold">-₹{Math.round((selectedBooking?.offeredPricePerWorker || 2000) * 0.1)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={endOtpInput}
                            onChange={(e) => setEndOtpInput(e.target.value)}
                            placeholder={selectedBooking?.endOtp ? `e.g. ${selectedBooking.endOtp}` : '4-digit OTP'}
                            className="flex-1 px-3 py-1.5 text-center font-mono font-black text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/40 text-[#202124]"
                          />
                          <button
                            type="button"
                            onClick={promptVerifyEndOtp}
                            className="px-3.5 py-1.5 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-xs font-black rounded-xl transition-colors cursor-pointer border border-amber-400 shadow-2xs"
                          >
                            Complete Shift
                          </button>
                        </div>
                      </div>

                      {/* Status Tree Display */}
                      <div className="pt-2">
                        <h5 className="text-[11px] font-extrabold text-[#202124] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#D71920]" />
                          <span>Shift Lifecycle & Location Track</span>
                        </h5>

                        <div className="relative pl-6 space-y-3.5 border-l-2 border-[#FFC928] ml-2">
                          {(selectedBooking.timelineTree || []).map((node, idx) => (
                            <div key={node.id || idx} className="relative">
                              <div
                                className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                                  node.completed
                                    ? 'bg-[#D71920] text-white'
                                    : node.current
                                    ? 'bg-[#FFC928] text-[#202124] ring-4 ring-[#FFC928]/30 animate-pulse'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {node.completed ? '✓' : idx + 1}
                              </div>
                              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#202124]">{node.title}</span>
                                  <span className="text-[9px] font-mono text-[#686868]">{node.timestamp}</span>
                                </div>
                                <p className="text-[10px] text-[#686868]">{node.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MESSAGES TAB */}
                {activeTab === 'messages' && (
                  <div className="h-full flex flex-col space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FFC928] text-[#202124] font-bold flex items-center justify-center text-xs">
                          AL
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#202124]">Apex Logistics (Employer)</h4>
                          <span className="text-[10px] text-[#D71920] flex items-center gap-1 font-semibold">
                            ● Order #1045 Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${msg.sender === 'worker' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`p-2.5 rounded-2xl max-w-[80%] text-xs ${
                              msg.sender === 'worker'
                                ? 'bg-[#D71920] text-white rounded-br-none'
                                : 'bg-white border border-[#202124]/10 text-[#202124] rounded-bl-none shadow-2xs'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[9px] block text-right mt-1 ${
                                msg.sender === 'worker' ? 'text-white/70' : 'text-[#686868]'
                              }`}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Reply to employer..."
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-[#D71920] text-white rounded-xl cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* 5. PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="space-y-3">
                    <div className="bg-white p-3.5 rounded-3xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                      <img
                        src={currentWorker.avatar}
                        alt={currentWorker.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#FFC928]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#202124]">{currentWorker.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-[#D71920]" />
                        </div>
                        <p className="text-[11px] text-[#686868]">{currentWorker.phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded font-bold">
                            KYC Verified
                          </span>
                          <span className="text-[10px] font-bold text-[#A80F18] flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-[#FFC928]" />
                            {currentWorker.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Prepaid Wallet:</span>
                        <span className="font-black text-[#D71920]">₹{walletBalance}</span>
                      </div>
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Wage Payment Mode:</span>
                        <span className="font-bold text-[#202124]">Direct Cash / Personal UPI</span>
                      </div>
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Platform Fee Rule:</span>
                        <span className="font-semibold text-slate-700">₹200 debited from wallet</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-[#C62828] border border-red-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Worker App</span>
                    </button>
                  </div>
                )}
              </div>

              {/* FIXED 5-TAB BOTTOM BAR */}
              <div className="h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around shrink-0 z-30 shadow-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                    activeTab === 'home' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>
                    Home
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('find-jobs')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer relative ${
                    activeTab === 'find-jobs' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <Search className={`w-5 h-5 ${activeTab === 'find-jobs' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'find-jobs' ? 'font-bold' : 'font-medium'}`}>
                    Find Jobs
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('my-work')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer relative ${
                    activeTab === 'my-work' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      activeTab === 'my-work'
                        ? 'bg-[#D71920] text-white shadow-xs'
                        : 'bg-[#FFC928] text-[#202124]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'my-work' ? 'font-bold text-[#D71920]' : 'font-semibold'}`}>
                    My Work
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('messages')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer relative ${
                    activeTab === 'messages' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <MessageSquare className={`w-5 h-5 ${activeTab === 'messages' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'messages' ? 'font-bold' : 'font-medium'}`}>
                    Messages
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                    activeTab === 'profile' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'profile' ? 'font-bold' : 'font-medium'}`}>
                    Profile
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
