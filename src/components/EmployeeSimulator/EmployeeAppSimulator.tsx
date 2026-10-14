import React, { useState } from 'react';
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
} from 'lucide-react';
import { Booking, Worker } from '../../types';
import { dataService } from '../../services/storage';

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
  };

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authScreen, setAuthScreen] = useState<EmployeeAuthScreen>('sign-in');
  const [loginPhone, setLoginPhone] = useState('+91 98765 43210');
  const [loginPassword, setLoginPassword] = useState('Worker@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Worker Sign Up Form State
  const [signUpName, setSignUpName] = useState('Suresh Nair');
  const [signUpPhone, setSignUpPhone] = useState('+91 98450 11223');
  const [signUpCategory, setSignUpCategory] = useState('Loading & Unloading');
  const [signUpCity, setSignUpCity] = useState('Mangalore, Karnataka');
  const [signUpPassword, setSignUpPassword] = useState('Worker@2026');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('Worker@2026');
  const [workerTermsAccepted, setWorkerTermsAccepted] = useState(true);

  // Forgot Password State
  const [forgotInput, setForgotInput] = useState('+91 98765 43210');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  // Main 5-Tab Navigation State
  const [activeTab, setActiveTab] = useState<EmployeeTab>('home');
  const [isOnline, setIsOnline] = useState(true);

  // Job Action States
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const [bidAmount, setBidAmount] = useState(2000);
  const [bidNote, setBidNote] = useState('Available with safety helmet and boots.');
  const [bidSubmittedMessage, setBidSubmittedMessage] = useState<string | null>(null);

  // OTP inputs for attendance check-in/out
  const [startOtpInput, setStartOtpInput] = useState('');
  const [endOtpInput, setEndOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Messaging State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'worker' | 'customer'; text: string; time: string }>>([
    { sender: 'customer', text: 'Ramesh, please report at Dock 4 Container Bay at 9:00 AM.', time: '09:12 AM' },
    { sender: 'worker', text: 'Understood sir. I have my safety gear ready and will verify Start OTP on arrival.', time: '09:14 AM' },
    { sender: 'customer', text: 'Start OTP will be 5918. Enter upon supervisor inspection.', time: '09:15 AM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

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
      } else {
        setIsAuthLoading(false);
        setAuthError('Please enter valid worker phone & password (min 6 characters).');
      }
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!workerTermsAccepted) {
      setAuthError('You must accept the Worker Marketplace Terms & Conditions.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsAuthLoading(true);
    setTimeout(() => {
      setIsAuthLoading(false);
      setIsAuthenticated(true);
      setActiveTab('home');
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 1) {
      setForgotStep(2);
      setForgotSuccessMsg('SMS challenge sent with 4-digit reset code.');
    } else {
      setForgotSuccessMsg('Password updated! Please sign in with your new password.');
      setTimeout(() => {
        setAuthScreen('sign-in');
        setForgotStep(1);
        setForgotSuccessMsg(null);
      }, 1200);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthScreen('sign-in');
    setAuthError(null);
  };

  // Job Flow Handlers
  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    dataService.submitBid(selectedBooking.id, currentWorker.id, Number(bidAmount), bidNote);
    setBidSubmittedMessage('Counter-bid submitted to employer! Waiting for confirmation.');
    setTimeout(() => {
      setBidSubmittedMessage(null);
      setActiveTab('my-work');
    }, 1500);
  };

  const handleDirectAccept = () => {
    if (!selectedBooking) return;
    dataService.directAcceptJob(selectedBooking.id, currentWorker.id);
    setActiveTab('my-work');
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
      setActiveTab('home');
    }
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
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mobile Device Frame */}
      <div className="w-[380px] h-[760px] bg-[#1E1F23] rounded-[48px] p-3 shadow-2xl border-4 border-[#202124]/40 flex flex-col relative overflow-hidden select-none">
        {/* Notch / Dynamic Island */}
        <div className="w-36 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
        </div>

        {/* Screen Canvas */}
        <div className="flex-1 bg-[#FFFDF8] rounded-[38px] overflow-hidden flex flex-col relative text-[#202124]">
          {/* ========================================================== */}
          {/* A. UNAUTHENTICATED AUTHENTICATION SCREENS (Sign In / Up / Forgot) */}
          {/* ========================================================== */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col bg-[#FFFDF8] overflow-y-auto p-5">
              {/* Brand Header */}
              <div className="text-center mt-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#FFC928] text-[#202124] flex items-center justify-center font-black text-xl mx-auto shadow-md mb-2">
                  W
                </div>
                <h1 className="text-lg font-bold text-[#202124]">
                  ManPower<span className="text-[#D71920]">Link</span>
                </h1>
                <p className="text-[11px] font-bold text-[#D71920] uppercase tracking-wider">
                  Employee & Worker App
                </p>
                <p className="text-xs text-[#686868] mt-1">
                  Find work opportunities and manage your jobs
                </p>
              </div>

              {/* Error notice */}
              {authError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-[#C62828]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* 1. Worker Sign In View */}
              {authScreen === 'sign-in' && (
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
                          placeholder="e.g. +91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#202124]">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthScreen('forgot-password');
                            setAuthError(null);
                          }}
                          className="text-[10px] text-[#D71920] font-semibold hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
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
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#686868]"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-[11px] text-[#686868] cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#D71920]" />
                        <span>Keep me signed in</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginPhone('+91 98765 43210');
                          setLoginPassword('Worker@2026');
                        }}
                        className="text-[11px] text-[#D71920] font-bold hover:underline"
                      >
                        Auto-fill Ramesh
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      {isAuthLoading ? (
                        <span>Logging in...</span>
                      ) : (
                        <>
                          <span>Sign In as Worker</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-4 text-center border-t border-slate-100">
                    <p className="text-xs text-[#686868]">
                      New worker?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthScreen('sign-up');
                          setAuthError(null);
                        }}
                        className="font-bold text-[#D71920] hover:underline"
                      >
                        Create an account
                      </button>
                    </p>
                    <p className="text-[10px] text-[#686868]/70 mt-3">
                      By continuing, you agree to ManPowerLink Worker Code of Conduct and Safety Guidelines.
                    </p>
                  </div>
                </form>
              )}

              {/* 2. Worker Sign Up View */}
              {authScreen === 'sign-up' && (
                <form onSubmit={handleSignUp} className="space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Full Name (As per Aadhaar)</label>
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Suresh Nair"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          required
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          placeholder="+91 98450 11223"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">City / District</label>
                        <input
                          type="text"
                          required
                          value={signUpCity}
                          onChange={(e) => setSignUpCity(e.target.value)}
                          placeholder="Mangalore"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Primary Work Category</label>
                      <select
                        value={signUpCategory}
                        onChange={(e) => setSignUpCategory(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      >
                        <option value="Loading & Unloading">Loading & Unloading</option>
                        <option value="Food & Catering Services">Food & Catering Services</option>
                        <option value="Housekeeping & Cleaning">Housekeeping & Cleaning</option>
                        <option value="Warehouse & Packaging">Warehouse & Packaging</option>
                        <option value="Construction & Masonry">Construction & Masonry</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Password</label>
                        <input
                          type="password"
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Confirm Password</label>
                        <input
                          type="password"
                          required
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2 pt-1 text-[11px] text-[#686868] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workerTermsAccepted}
                        onChange={(e) => setWorkerTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-[#D71920]"
                      />
                      <span>I agree to Worker Terms, Direct Wage Payout Rules, and Safety Protocols</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer mt-1"
                    >
                      {isAuthLoading ? 'Registering...' : 'Create Worker Account'}
                    </button>
                  </div>

                  <div className="pt-3 text-center border-t border-slate-100">
                    <p className="text-xs text-[#686868]">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthScreen('sign-in');
                          setAuthError(null);
                        }}
                        className="font-bold text-[#D71920] hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* 3. Worker Forgot Password View */}
              {authScreen === 'forgot-password' && (
                <form onSubmit={handleForgotSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#202124]">Recover Worker Account</h3>
                    <p className="text-xs text-[#686868]">
                      {forgotStep === 1
                        ? 'Enter your registered mobile number to receive a 4-digit SMS OTP challenge.'
                        : 'Enter the SMS code and choose a new password.'}
                    </p>

                    {forgotSuccessMsg && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16834A] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{forgotSuccessMsg}</span>
                      </div>
                    )}

                    {forgotStep === 1 ? (
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={forgotInput}
                          onChange={(e) => setForgotInput(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full px-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-[#202124] mb-1">SMS OTP Code</label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={forgotOtp}
                            onChange={(e) => setForgotOtp(e.target.value)}
                            placeholder="e.g. 7824"
                            className="w-full px-3 py-2 text-center font-mono font-bold text-sm bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#202124] mb-1">New Password</label>
                          <input
                            type="password"
                            required
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      {forgotStep === 1 ? 'Send SMS Challenge' : 'Confirm & Sign In'}
                    </button>
                  </div>

                  <div className="pt-4 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthScreen('sign-in');
                        setAuthError(null);
                      }}
                      className="text-xs font-bold text-[#D71920] hover:underline"
                    >
                      ← Back to Worker Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ========================================================== */
            /* B. AUTHENTICATED EMPLOYEE APPLICATION WITH FIXED 5-TAB BAR */
            /* ========================================================== */
            <>
              {/* Top Bar with Online/Offline Switch */}
              <div className="h-14 bg-[#1E1F23] text-white px-4 flex items-center justify-between shrink-0 shadow-sm border-b border-[#FFC928]/30 z-20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFC928] text-[#202124] font-black flex items-center justify-center text-xs shadow-xs">
                    W
                  </div>
                  <div>
                    <h2 className="font-bold text-xs leading-tight">ManPowerLink Worker</h2>
                    <p className="text-[10px] text-white/70 leading-tight">
                      {currentWorker.name} ({currentWorker.category})
                    </p>
                  </div>
                </div>

                {/* Availability Toggle */}
                <button
                  type="button"
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    isOnline
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </button>
              </div>

              {/* Scrollable Screen Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. HOME TAB */}
                {activeTab === 'home' && (
                  <div className="space-y-4">
                    {/* Worker Earnings Summary Card */}
                    <div className="bg-linear-to-r from-[#D71920] to-[#A80F18] p-4 rounded-3xl text-white shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-white/80">Available Wallet Balance</span>
                        <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded-full font-bold">
                          Daily Payout Ready
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black">₹4,200</span>
                        <span className="text-xs text-white/90 font-medium">8 jobs this week</span>
                      </div>
                      <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                        <span className="text-white/80">UPI: ramesh@okhdfcbank</span>
                        <span className="text-[#FFC928] font-bold">Withdraw →</span>
                      </div>
                    </div>

                    {/* Today's Shift Status Card */}
                    <div className="bg-white p-3.5 rounded-2xl border border-[#202124]/10 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded-md">
                          TODAY'S ASSIGNED SHIFT
                        </span>
                        <span className="text-[11px] font-bold text-[#202124]">Order #1045</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#202124]">Container Unloading & Heavy Cargo</h4>
                        <p className="text-[11px] text-[#686868] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D71920]" />
                          <span>Panambur Container Terminal Dock 4</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <span className="font-extrabold text-[#D71920]">₹2,000 / Day</span>
                        <button
                          onClick={() => setActiveTab('my-work')}
                          className="px-3 py-1 bg-[#D71920] text-white text-[11px] font-bold rounded-xl shadow-xs"
                        >
                          Enter Start OTP →
                        </button>
                      </div>
                    </div>

                    {/* Quick Safety Verification Status */}
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFC928] text-[#202124] flex items-center justify-center font-bold shrink-0">
                        <ShieldCheck className="w-5 h-5 text-[#A80F18]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#202124]">Verified Worker Badge Active</h4>
                        <p className="text-[10px] text-[#686868]">
                          KYC Aadhaar approved. Eligible for immediate auto-match shifts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FIND JOBS TAB */}
                {activeTab === 'find-jobs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                        Available Job Radar ({bookings.length} nearby)
                      </h3>
                      <span className="text-[10px] font-semibold text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded-md">
                        Radius: 15 km
                      </span>
                    </div>

                    {bidSubmittedMessage && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16834A] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{bidSubmittedMessage}</span>
                      </div>
                    )}

                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-white rounded-2xl border border-[#202124]/10 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#202124]">{b.orderNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#FFC928]/40 text-[#A80F18]">
                            {b.durationType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#202124]">{b.categoryName}</h4>
                          <p className="text-[10px] text-[#686868] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#D71920]" />
                            <span>{b.workLocation.address}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs bg-[#FFFDF8] p-2 rounded-xl">
                          <div>
                            <span className="text-[10px] text-[#686868] block">Employer Wage Offer:</span>
                            <span className="text-sm font-extrabold text-[#D71920]">
                              ₹{b.offeredPricePerWorker} / worker
                            </span>
                          </div>
                          <span className="text-[10px] text-[#16834A] font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                            Positions: {b.acceptedWorkersCount}/{b.requiredWorkers}
                          </span>
                        </div>

                        {/* Actions: Accept or Counter-Bid */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingId(b.id);
                              handleDirectAccept();
                            }}
                            className="py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Accept Shift
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingId(b.id);
                              setActiveTab('my-work');
                            }}
                            className="py-2 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Counter-Bid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. MY WORK TAB */}
                {activeTab === 'my-work' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                      Active Shift & Attendance Verification
                    </h3>

                    {/* Active Job Details */}
                    <div className="bg-white p-4 rounded-2xl border border-[#202124]/10 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#202124]">{selectedBooking?.orderNumber}</span>
                        <span className="text-[10px] bg-emerald-100 text-[#16834A] px-2 py-0.5 rounded font-bold">
                          ASSIGNED TO YOU
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#202124]">{selectedBooking?.categoryName}</p>
                      <p className="text-[10px] text-[#686868]">{selectedBooking?.workLocation.address}</p>

                      {otpMessage && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16834A] flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{otpMessage}</span>
                        </div>
                      )}

                      {/* Step 1: Start OTP Input */}
                      <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#202124]/15 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124]">Step 1: Check-in via Start OTP</span>
                          <span className="text-[10px] text-[#D71920] font-semibold">Customer OTP: 5918</span>
                        </div>
                        <p className="text-[10px] text-[#686868]">
                          Ask the worksite manager for their 4-digit verification code:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={startOtpInput}
                            onChange={(e) => setStartOtpInput(e.target.value)}
                            placeholder="e.g. 5918"
                            className="flex-1 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyStartOtp}
                            className="px-3.5 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Verify & Start
                          </button>
                        </div>
                      </div>

                      {/* Step 2: End OTP Input */}
                      <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#202124]/15 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124]">Step 2: Finish Shift via End OTP</span>
                          <span className="text-[10px] text-[#16834A] font-semibold">Unlock Wage Pay</span>
                        </div>
                        <p className="text-[10px] text-[#686868]">
                          Enter completion code provided by employer upon shift end:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={endOtpInput}
                            onChange={(e) => setEndOtpInput(e.target.value)}
                            placeholder="e.g. 8329"
                            className="flex-1 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyEndOtp}
                            className="px-3.5 py-1.5 bg-[#16834A] hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Complete
                          </button>
                        </div>
                      </div>

                      {/* Counter-Bid Section */}
                      <form onSubmit={handleBidSubmit} className="pt-2 border-t border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-[#202124] block">Submit Proposed Counter-Wage</span>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step={50}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(Number(e.target.value))}
                            className="w-28 px-2 py-1 text-xs font-bold text-[#D71920] bg-white border border-[#202124]/15 rounded-lg"
                          />
                          <button
                            type="submit"
                            className="flex-1 py-1.5 bg-[#FFC928] text-[#202124] text-xs font-bold rounded-lg hover:bg-[#E5A900] cursor-pointer"
                          >
                            Send Bid to Employer
                          </button>
                        </div>
                      </form>
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
                          <span className="text-[10px] text-[#16834A] flex items-center gap-1 font-semibold">
                            ● Order #1045 Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Bubble Stream */}
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

                    {/* Chat Input */}
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
                    <div className="bg-white p-3.5 rounded-2xl border border-[#202124]/10 flex items-center gap-3 shadow-2xs">
                      <img
                        src={currentWorker.avatar}
                        alt={currentWorker.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#FFC928]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#202124]">{currentWorker.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-[#16834A]" />
                        </div>
                        <p className="text-[11px] text-[#686868]">{currentWorker.phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-emerald-100 text-[#16834A] px-2 py-0.5 rounded font-bold">
                            KYC Approved
                          </span>
                          <span className="text-[10px] font-bold text-[#E5A900] flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-[#E5A900]" />
                            {currentWorker.rating} ({currentWorker.totalJobsCompleted} jobs)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-3 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Skill Category:</span>
                        <span className="font-bold text-[#202124]">{currentWorker.category}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Payout UPI ID:</span>
                        <span className="font-bold text-[#16834A]">ramesh@okhdfcbank</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Emergency SOS Contact:</span>
                        <span className="font-bold text-[#D71920]">112 / +91 80000 12345</span>
                      </div>
                    </div>

                    {/* Legal & Safety Docs */}
                    <div className="bg-white rounded-2xl border border-[#202124]/10 divide-y divide-slate-100 text-xs">
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-2 text-[#202124]">
                          <FileText className="w-4 h-4 text-[#D71920]" />
                          <span>Worker Marketplace Agreement</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#686868]" />
                      </div>
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-2 text-[#202124]">
                          <Shield className="w-4 h-4 text-[#16834A]" />
                          <span>Safety & Insurance Protection</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#686868]" />
                      </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-[#C62828] border border-red-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Worker App</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================== */}
              {/* FIXED 5-TAB BOTTOM NAVIGATION BAR (ALWAYS VISIBLE!) */}
              {/* ========================================================== */}
              <div className="h-16 bg-white border-t border-[#202124]/10 px-2 flex items-center justify-around shrink-0 z-30 shadow-lg">
                {/* 1. Home */}
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

                {/* 2. Find Jobs */}
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
                  <span className="px-1 text-[8px] font-bold rounded-full bg-[#FFC928] text-[#202124] absolute top-0.5 right-4">
                    3
                  </span>
                </button>

                {/* 3. My Work (Active Shifts) */}
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
                        ? 'bg-[#D71920] text-white shadow-sm'
                        : 'bg-[#FFC928] text-[#202124]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'my-work' ? 'font-bold text-[#D71920]' : 'font-semibold'}`}>
                    My Work
                  </span>
                </button>

                {/* 4. Messages */}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16834A] absolute top-1 right-5" />
                </button>

                {/* 5. Profile */}
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
