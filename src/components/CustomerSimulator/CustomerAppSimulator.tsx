import React, { useState } from 'react';
import {
  Home,
  Calendar,
  PlusCircle,
  MessageSquare,
  User,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Star,
  ChevronLeft,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  AlertCircle,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Booking, ServiceCategory, Worker } from '../../types';
import { dataService } from '../../services/storage';

interface CustomerAppSimulatorProps {
  categories: ServiceCategory[];
  workers: Worker[];
  bookings: Booking[];
}

type CustomerTab = 'home' | 'bookings' | 'post-job' | 'messages' | 'profile';
type CustomerAuthScreen = 'sign-in' | 'sign-up' | 'forgot-password';

export const CustomerAppSimulator: React.FC<CustomerAppSimulatorProps> = ({
  categories,
  workers,
  bookings,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authScreen, setAuthScreen] = useState<CustomerAuthScreen>('sign-in');
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('apex@logistics.in');
  const [loginPassword, setLoginPassword] = useState('Customer@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('Apex Logistics & Warehousing');
  const [signUpEmail, setSignUpEmail] = useState('contact@apexlogistics.in');
  const [signUpPhone, setSignUpPhone] = useState('+91 99001 55432');
  const [signUpCity, setSignUpCity] = useState('Mangalore, Karnataka');
  const [signUpPassword, setSignUpPassword] = useState('Customer@2026');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('Customer@2026');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Forgot Password State
  const [forgotInput, setForgotInput] = useState('apex@logistics.in');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  // Main App 5-Tab Navigation State
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(categories[0]);
  const [activeBookingId, setActiveBookingId] = useState<string>(bookings[0]?.id || '');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Post Job Form State
  const [requiredWorkers, setRequiredWorkers] = useState(2);
  const [offeredAmount, setOfferedAmount] = useState(2000);
  const [jobDate, setJobDate] = useState('2026-10-15');
  const [jobStartTime, setJobStartTime] = useState('09:00 AM');
  const [jobEndTime, setJobEndTime] = useState('05:00 PM');
  const [jobAddress, setJobAddress] = useState('Panambur Container Terminal Dock 4');
  const [jobCity, setJobCity] = useState('Mangalore, Karnataka');
  const [jobDescription, setJobDescription] = useState('Need heavy cargo unloading team for bulk containers.');
  const [jobSpecialInstructions, setJobSpecialInstructions] = useState('Safety shoes and reflective vests required.');
  const [isMorningTiffin, setIsMorningTiffin] = useState(true);
  const [isLunch, setIsLunch] = useState(true);
  const [isEveningTea, setIsEveningTea] = useState(true);
  const [peopleCount, setPeopleCount] = useState(120);

  // Messaging State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'customer' | 'worker'; text: string; time: string }>>([
    { sender: 'worker', text: 'Namaste sir! I have accepted the container unloading job for tomorrow.', time: '10:15 AM' },
    { sender: 'customer', text: 'Great Ramesh. Please arrive at Gate 4 by 8:45 AM for pass registration.', time: '10:18 AM' },
    { sender: 'worker', text: 'Will be there on time with safety gear. Please have the Start OTP ready.', time: '10:20 AM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0];

  // Auth Handlers
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    setTimeout(() => {
      if (loginPhoneOrEmail.trim() && loginPassword.length >= 6) {
        setIsAuthLoading(false);
        setIsAuthenticated(true);
        setActiveTab('home');
      } else {
        setIsAuthLoading(false);
        setAuthError('Please enter valid customer credentials (min 6 chars password).');
      }
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!termsAccepted) {
      setAuthError('You must accept the Terms and Conditions to register.');
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
      setForgotSuccessMsg('OTP code sent to your registered contact.');
    } else {
      setForgotSuccessMsg('Password reset successfully! Please sign in.');
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

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = dataService.createBooking({
      customerId: 'c-1',
      customerName: 'Apex Logistics & Warehousing',
      customerPhone: '+91 99001 55432',
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      requiredWorkers: Number(requiredWorkers),
      offeredPricePerWorker: Number(offeredAmount),
      totalEstimatedAmount: Number(requiredWorkers) * Number(offeredAmount),
      scheduledDate: jobDate,
      startTime: jobStartTime,
      endTime: jobEndTime,
      description: jobDescription,
      specialInstructions: jobSpecialInstructions,
      workLocation: {
        address: jobAddress,
        city: jobCity,
        lat: 12.914,
        lng: 74.856,
      },
      foodDetails: selectedCategory.dynamicFields?.isFoodTiffin
        ? {
            morningTiffin: isMorningTiffin,
            lunch: isLunch,
            eveningTea: isEveningTea,
            peopleCount: Number(peopleCount),
            servingMethod: 'Buffet Counter Management',
          }
        : undefined,
    });

    setActiveBookingId(newBooking.id);
    setActiveTab('bookings');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'customer',
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
                <div className="w-12 h-12 rounded-2xl bg-[#D71920] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md mb-2">
                  M
                </div>
                <h1 className="text-lg font-bold text-[#202124]">
                  ManPower<span className="text-[#D71920]">Link</span>
                </h1>
                <p className="text-[11px] font-semibold text-[#D71920] uppercase tracking-wider">
                  Customer & Employer App
                </p>
                <p className="text-xs text-[#686868] mt-1">
                  Find reliable workers for your next job
                </p>
              </div>

              {/* Error notice */}
              {authError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-[#C62828]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* 1. Sign In View */}
              {authScreen === 'sign-in' && (
                <form onSubmit={handleSignIn} className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">
                        Email or Mobile Number
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={loginPhoneOrEmail}
                          onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                          placeholder="e.g. apex@logistics.in or 9900155432"
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
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginPhoneOrEmail('apex@logistics.in');
                          setLoginPassword('Customer@2026');
                        }}
                        className="text-[11px] text-[#D71920] font-bold hover:underline"
                      >
                        Auto-fill Demo
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      {isAuthLoading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <span>Sign In as Employer</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-4 text-center border-t border-slate-100">
                    <p className="text-xs text-[#686868]">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthScreen('sign-up');
                          setAuthError(null);
                        }}
                        className="font-bold text-[#D71920] hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                    <p className="text-[10px] text-[#686868]/70 mt-3">
                      By continuing, you agree to ManPowerLink Terms and Privacy Policy.
                    </p>
                  </div>
                </form>
              )}

              {/* 2. Sign Up View */}
              {authScreen === 'sign-up' && (
                <form onSubmit={handleSignUp} className="space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Company / Full Name</label>
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Apex Logistics"
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
                          placeholder="+91 99001 55432"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">City</label>
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
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="contact@company.in"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
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
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-[#D71920]"
                      />
                      <span>I agree to the ManPowerLink Marketplace Terms and Privacy Policy</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer mt-1"
                    >
                      {isAuthLoading ? 'Creating Account...' : 'Create Employer Account'}
                    </button>
                  </div>

                  <div className="pt-3 text-center border-t border-slate-100">
                    <p className="text-xs text-[#686868]">
                      Already have an account?{' '}
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

              {/* 3. Forgot Password View */}
              {authScreen === 'forgot-password' && (
                <form onSubmit={handleForgotSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#202124]">Reset Your Password</h3>
                    <p className="text-xs text-[#686868]">
                      {forgotStep === 1
                        ? 'Enter your registered email or phone to receive a single-use recovery code.'
                        : 'Enter the recovery OTP code and your new password.'}
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
                          Registered Email or Phone
                        </label>
                        <input
                          type="text"
                          required
                          value={forgotInput}
                          onChange={(e) => setForgotInput(e.target.value)}
                          placeholder="e.g. apex@logistics.in"
                          className="w-full px-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-[#202124] mb-1">OTP Code (4 digits)</label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={forgotOtp}
                            onChange={(e) => setForgotOtp(e.target.value)}
                            placeholder="e.g. 5421"
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
                      {forgotStep === 1 ? 'Send Recovery OTP' : 'Update Password & Sign In'}
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
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ========================================================== */
            /* B. AUTHENTICATED MAIN APPLICATION WITH FIXED 5-TAB BOTTOM BAR */
            /* ========================================================== */
            <>
              {/* Top Navigation Bar */}
              <div className="h-14 bg-[#D71920] text-white px-4 flex items-center justify-between shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-[#D71920] font-black flex items-center justify-center text-xs shadow-xs">
                    M
                  </div>
                  <div>
                    <h2 className="font-bold text-xs leading-tight">ManPowerLink</h2>
                    <p className="text-[10px] text-white/80 leading-tight flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>Mangalore Port Area</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('post-job')}
                    className="px-2.5 py-1 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3 text-[#202124]" />
                    <span>Post Job</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Screen Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. HOME TAB */}
                {activeTab === 'home' && (
                  <div className="space-y-4">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search workers, catering, loaders..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#202124]/10 rounded-xl shadow-2xs focus:outline-none focus:border-[#D71920]"
                      />
                    </div>

                    {/* Active Booking Reminder Banner */}
                    {activeBooking && (
                      <div className="bg-amber-50 border border-[#FFC928]/60 p-3 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#A80F18] uppercase tracking-wider">
                            Active Booking #{activeBooking.orderNumber}
                          </span>
                          <p className="text-xs font-bold text-[#202124]">{activeBooking.categoryName}</p>
                          <p className="text-[10px] text-[#686868]">
                            Start OTP: <strong className="font-mono text-[#D71920]">{activeBooking.startOtp}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="px-3 py-1.5 bg-[#D71920] text-white text-[11px] font-bold rounded-xl shadow-xs"
                        >
                          View
                        </button>
                      </div>
                    )}

                    {/* Service Categories Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                          Service Categories
                        </h3>
                        <span className="text-[11px] font-semibold text-[#D71920]">View All</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.slice(0, 4).map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setActiveTab('post-job');
                            }}
                            className="p-3 bg-white rounded-2xl border border-[#202124]/10 hover:border-[#D71920] transition-colors cursor-pointer shadow-2xs"
                          >
                            <span className="text-xs font-bold text-[#202124] block">{cat.name}</span>
                            <span className="text-[10px] text-[#16834A] font-semibold mt-1 block">
                              ₹{cat.fullDayRate} / day
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Nearby Workers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                          Verified Nearby Workers
                        </h3>
                        <span className="text-[10px] bg-emerald-100 text-[#16834A] px-2 py-0.5 rounded-full font-bold">
                          194 Available
                        </span>
                      </div>
                      <div className="space-y-2">
                        {workers.slice(0, 3).map((w) => (
                          <div
                            key={w.id}
                            className="p-3 bg-white rounded-2xl border border-[#202124]/10 flex items-center justify-between shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={w.avatar} alt={w.name} className="w-10 h-10 rounded-full object-cover" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-[#202124]">{w.name}</h4>
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#16834A]" />
                                </div>
                                <p className="text-[10px] text-[#686868]">{w.category}</p>
                                <div className="flex items-center gap-1 text-[10px] text-[#E5A900] font-bold">
                                  <Star className="w-3 h-3 fill-[#E5A900]" />
                                  <span>{w.rating} ({w.totalJobsCompleted} jobs)</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setActiveTab('post-job')}
                              className="px-2.5 py-1.5 bg-[#FFFDF8] hover:bg-red-50 text-[#D71920] border border-[#D71920]/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Hire
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                        My Bookings & Orders
                      </h3>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          onClick={() => setBookingFilter('all')}
                          className={`px-2 py-0.5 rounded-lg font-bold ${
                            bookingFilter === 'all' ? 'bg-[#D71920] text-white' : 'bg-slate-100 text-[#686868]'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setBookingFilter('active')}
                          className={`px-2 py-0.5 rounded-lg font-bold ${
                            bookingFilter === 'active' ? 'bg-[#D71920] text-white' : 'bg-slate-100 text-[#686868]'
                          }`}
                        >
                          Active
                        </button>
                      </div>
                    </div>

                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-white rounded-2xl border border-[#202124]/10 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-[#202124]">{b.orderNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-[#A80F18]">
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#202124]">{b.categoryName}</p>
                          <p className="text-[10px] text-[#686868] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#D71920]" />
                            <span>{b.workLocation.address}</span>
                          </p>
                        </div>

                        {/* OTP Verification Box */}
                        <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#686868] block">Start OTP for Workers:</span>
                            <span className="font-mono font-black text-sm text-[#D71920] tracking-wider">
                              {b.startOtp}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#686868] block">End OTP:</span>
                            <span className="font-mono font-bold text-xs text-[#202124]">{b.endOtp}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-[11px] font-bold text-[#202124]">
                            Workers: {b.acceptedWorkersCount} / {b.requiredWorkers}
                          </span>
                          <button
                            onClick={() => setActiveTab('messages')}
                            className="text-[11px] font-bold text-[#D71920] hover:underline"
                          >
                            Chat Workers →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. POST A JOB TAB */}
                {activeTab === 'post-job' && (
                  <form onSubmit={handlePostJobSubmit} className="space-y-3">
                    <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                      Post a Temporary Worker Job
                    </h3>

                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Service Category</label>
                      <select
                        value={selectedCategory.id}
                        onChange={(e) => {
                          const cat = categories.find((c) => c.id === e.target.value) || categories[0];
                          setSelectedCategory(cat);
                          setOfferedAmount(cat.fullDayRate);
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Base ₹{c.fullDayRate}/day)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Workers Needed</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={requiredWorkers}
                          onChange={(e) => setRequiredWorkers(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Pay / Worker (₹)</label>
                        <input
                          type="number"
                          step={50}
                          value={offeredAmount}
                          onChange={(e) => setOfferedAmount(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl font-bold text-[#D71920]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Worksite Address</label>
                      <input
                        type="text"
                        value={jobAddress}
                        onChange={(e) => setJobAddress(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Shift Date</label>
                        <input
                          type="date"
                          value={jobDate}
                          onChange={(e) => setJobDate(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Reporting Time</label>
                        <input
                          type="text"
                          value={jobStartTime}
                          onChange={(e) => setJobStartTime(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Job Description</label>
                      <textarea
                        rows={2}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                      />
                    </div>

                    <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#686868] block">Total Estimated Cost:</span>
                        <span className="text-base font-extrabold text-[#D71920]">
                          ₹{(requiredWorkers * offeredAmount).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Broadcast Job
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. MESSAGES TAB */}
                {activeTab === 'messages' && (
                  <div className="h-full flex flex-col space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#D71920] text-white font-bold flex items-center justify-center text-xs">
                          RK
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#202124]">Ramesh Kumar</h4>
                          <span className="text-[10px] text-[#16834A] flex items-center gap-1 font-semibold">
                            ● Accepted Worker (Order #1045)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Bubble Stream */}
                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`p-2.5 rounded-2xl max-w-[80%] text-xs ${
                              msg.sender === 'customer'
                                ? 'bg-[#D71920] text-white rounded-br-none'
                                : 'bg-white border border-[#202124]/10 text-[#202124] rounded-bl-none shadow-2xs'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[9px] block text-right mt-1 ${
                                msg.sender === 'customer' ? 'text-white/70' : 'text-[#686868]'
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
                        placeholder="Type worksite instruction..."
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
                      <div className="w-12 h-12 rounded-2xl bg-[#D71920] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                        AL
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#202124]">Apex Logistics & Warehousing</h4>
                        <p className="text-[11px] text-[#686868]">apex@logistics.in</p>
                        <span className="text-[10px] bg-emerald-100 text-[#16834A] px-2 py-0.5 rounded font-bold">
                          Verified Employer Account
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-3 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Registered Mobile:</span>
                        <span className="font-bold text-[#202124]">+91 99001 55432</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Default Worksite:</span>
                        <span className="font-bold text-[#202124]">Panambur Dock 4, Mangalore</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">GST Invoicing:</span>
                        <span className="font-bold text-[#16834A]">29AAAAA0000A1Z5</span>
                      </div>
                    </div>

                    {/* Legal & Support links */}
                    <div className="bg-white rounded-2xl border border-[#202124]/10 divide-y divide-slate-100 text-xs">
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-2 text-[#202124]">
                          <FileText className="w-4 h-4 text-[#D71920]" />
                          <span>Terms & Conditions</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#686868]" />
                      </div>
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-2 text-[#202124]">
                          <HelpCircle className="w-4 h-4 text-[#D71920]" />
                          <span>Contact Support & SOS</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#686868]" />
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-[#C62828] border border-red-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Customer App</span>
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

                {/* 2. Bookings */}
                <button
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer relative ${
                    activeTab === 'bookings' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <Calendar className={`w-5 h-5 ${activeTab === 'bookings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'bookings' ? 'font-bold' : 'font-medium'}`}>
                    Bookings
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] absolute top-1 right-5" />
                </button>

                {/* 3. Post Job (Prominent Highlight) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('post-job')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                    activeTab === 'post-job' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      activeTab === 'post-job'
                        ? 'bg-[#D71920] text-white shadow-sm'
                        : 'bg-[#FFC928] text-[#202124]'
                    }`}
                  >
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'post-job' ? 'font-bold text-[#D71920]' : 'font-semibold'}`}>
                    Post Job
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
                  <span className="px-1 text-[8px] font-bold rounded-full bg-[#16834A] text-white absolute top-0.5 right-4">
                    2
                  </span>
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
