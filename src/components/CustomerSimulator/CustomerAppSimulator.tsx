import React, { useState, useEffect } from 'react';
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
  Plus,
  Minus,
  Briefcase,
  DollarSign,
  Tag,
  Check,
  Bell,
  Volume2,
  Navigation,
  Compass,
  AlertTriangle,
  Wallet,
  QrCode,
  Copy,
  CalendarDays,
  CreditCard,
  Zap,
} from 'lucide-react';
import { Booking, ServiceCategory, Worker, StatusTimelineNode, Customer } from '../../types';
import {
  dataService,
  playNotificationSound,
  PLATFORM_UPI_ID,
  PLATFORM_UPI_NAME,
  getUpiIntentUrl,
} from '../../services/storage';

interface CustomerAppSimulatorProps {
  categories: ServiceCategory[];
  workers: Worker[];
  bookings: Booking[];
}

type CustomerTab = 'home' | 'bookings' | 'post-job' | 'messages' | 'profile';
type CustomerAuthScreen = 'sign-in' | 'sign-up' | 'forgot-password';

export interface ShiftPackage {
  id: string;
  title: string;
  badge: string;
  approxHours: number;
  fixedRatePerWorker: number;
  description: string;
  popular?: boolean;
}

const SHIFT_PACKAGES: ShiftPackage[] = [
  {
    id: 'full_day',
    title: 'Full Day Standard Shift',
    badge: 'Popular',
    approxHours: 8.5,
    fixedRatePerWorker: 2200,
    description: 'Complete full day coverage (~8.5 hrs) with 1-hr meal break included.',
    popular: true,
  },
  {
    id: 'half_day',
    title: 'Half Day Express Shift',
    badge: 'Fast Job',
    approxHours: 4.5,
    fixedRatePerWorker: 1300,
    description: 'Rapid turnaround (~4.5 hrs) for morning sorting, rush deliveries, or half-shift support.',
  },
  {
    id: 'warehouse_unload',
    title: 'Heavy Container & Cargo Pack',
    badge: 'Heavy Duty',
    approxHours: 6.0,
    fixedRatePerWorker: 1800,
    description: 'Container destuffing, bulk pallet stacking, and warehouse dock offloading (~6 hrs).',
  },
  {
    id: 'catering_event',
    title: 'Turnkey Event & Catering Pack',
    badge: 'Full Event',
    approxHours: 10.0,
    fixedRatePerWorker: 2800,
    description: 'Staging, food prep, guest table service, and post-event cleanup (~10 hrs).',
  },
  {
    id: 'custom_pack',
    title: 'Custom Turnkey Package',
    badge: 'Flexible',
    approxHours: 7.0,
    fixedRatePerWorker: 2000,
    description: 'Custom duration package tailored to your exact operational requirements.',
  },
];

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

  // Main App 5-Tab Navigation State with History Stack for Back Button
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [tabHistory, setTabHistory] = useState<CustomerTab[]>(['home']);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(categories[0]);
  const [activeBookingId, setActiveBookingId] = useState<string>(bookings[0]?.id || '');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedBookingForTimeline, setSelectedBookingForTimeline] = useState<Booking | null>(bookings[0] || null);

  // Customer Wallet State
  const [customer, setCustomer] = useState<Customer | undefined>(() => dataService.getCustomer('c-1'));
  const [walletBalance, setWalletBalance] = useState<number>(() => dataService.getCustomer('c-1')?.walletBalance ?? 12500);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState(2500);
  const [addMoneyUtr, setAddMoneyUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Post Job Form State: Pricing Model (Hourly vs Full Package)
  const [pricingModel, setPricingModel] = useState<'hourly' | 'full_package'>('hourly');
  const [jobTitle, setJobTitle] = useState('Loading and moving boxes');
  const [requiredWorkers, setRequiredWorkers] = useState(3);
  const [jobLocation, setJobLocation] = useState('Mangalore Industrial Area, Karnataka');

  // Hourly Basis Specific Fields
  const [pricePerHourPerHead, setPricePerHourPerHead] = useState(250);
  const [shiftHours, setShiftHours] = useState(8);

  // Full Package Specific Fields
  const [selectedPackageId, setSelectedPackageId] = useState<string>('full_day');
  const [customPackageHours, setCustomPackageHours] = useState(7);
  const [customPackageRate, setCustomPackageRate] = useState(2000);

  // Date and Time Widget Selection
  const [dateSelection, setDateSelection] = useState<'today' | 'tomorrow' | 'day_after' | 'custom'>('today');
  const [jobDate, setJobDate] = useState('2026-10-15');
  const [timeSlotSelection, setTimeSlotSelection] = useState('08:30 AM');
  const [customTime, setCustomTime] = useState('08:30');

  // Additional Remarks / Notes Field
  const [remarks, setRemarks] = useState('Requires safety boots and gloves. Entrance via Gate 4 at dock warehouse.');

  // Payment Selection: Wallet Debit vs Direct UPI/PhonePe QR vs Worksite Cash
  const [paymentSelection, setPaymentSelection] = useState<'wallet' | 'upi_qr' | 'cash'>('wallet');
  const [showDirectQrPaymentModal, setShowDirectQrPaymentModal] = useState(false);
  const [directPaymentUtr, setDirectPaymentUtr] = useState('');

  // Custom Category Add Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryRate, setCustomCategoryRate] = useState(2000);

  // Confirmation Modal State
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Customer Ask for Payout / Withdrawal State
  const [showAskPayoutModal, setShowAskPayoutModal] = useState(false);
  const [askPayoutUpiId, setAskPayoutUpiId] = useState('apex.logistics@icici');
  const [askPayoutAmount, setAskPayoutAmount] = useState(3000);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  // Audio / Alert Notification State
  const [activeAlertToast, setActiveAlertToast] = useState<string | null>(null);

  const triggerAppRingAlert = (message: string) => {
    playNotificationSound();
    setActiveAlertToast(message);
    setTimeout(() => {
      setActiveAlertToast((curr) => (curr === message ? null : curr));
    }, 4000);
  };

  const handleOpenUpiApp = (amount: number, note = 'ManPowerLink Recharge') => {
    const upiUrl = getUpiIntentUrl(amount, note, PLATFORM_UPI_ID, PLATFORM_UPI_NAME);
    triggerAppRingAlert(`Opening UPI App (PhonePe / Kotak / GPay) for ${PLATFORM_UPI_ID}...`);
    try {
      window.location.href = upiUrl;
    } catch {
      // Fallback in web/preview
    }
  };

  const handleAskPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askPayoutUpiId.trim() || !askPayoutUpiId.includes('@')) {
      triggerAppRingAlert('Please enter a valid recipient UPI ID (e.g. name@bank)');
      return;
    }
    if (askPayoutAmount <= 0 || askPayoutAmount > walletBalance) {
      triggerAppRingAlert(`Amount must be between ₹100 and available balance (₹${walletBalance})`);
      return;
    }

    setPayoutSubmitting(true);
    setTimeout(() => {
      dataService.createPayoutRequest({
        requesterId: 'c-1',
        requesterName: 'Apex Logistics & Warehousing',
        requesterRole: 'customer',
        requesterPhone: '+91 99001 55432',
        beneficiaryUpiId: askPayoutUpiId.trim(),
        amount: askPayoutAmount,
        adminNote: 'Customer asked for wallet payout to personal UPI',
      });
      setPayoutSubmitting(false);
      setShowAskPayoutModal(false);
      triggerAppRingAlert(`Payout request for ₹${askPayoutAmount.toLocaleString()} submitted! Admin will accept and credit to ${askPayoutUpiId}.`);
    }, 400);
  };

  const activeBooking =
    bookings.find((b) => b.id === activeBookingId) ||
    bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'WORK_IN_PROGRESS') ||
    bookings[0];

  // Messaging State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'customer' | 'worker'; text: string; time: string }>>([
    { sender: 'worker', text: 'Namaste sir! I have accepted the container unloading job for tomorrow.', time: '10:15 AM' },
    { sender: 'customer', text: 'Great Ramesh. Please arrive at Gate 4 by 8:45 AM for pass registration.', time: '10:18 AM' },
    { sender: 'worker', text: 'Will be there on time with safety gear. Please have the Start OTP ready.', time: '10:20 AM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Sync wallet balance on data changes
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      const c = dataService.getCustomer('c-1');
      if (c) {
        setCustomer(c);
        setWalletBalance(c.walletBalance ?? 12500);
      }
    });
    return unsubscribe;
  }, []);

  // Intercept back button to navigate in-app instead of closing app/preview
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (showAskPayoutModal) {
        setShowAskPayoutModal(false);
        return;
      }
      if (showAddMoneyModal) {
        setShowAddMoneyModal(false);
        return;
      }
      if (showDirectQrPaymentModal) {
        setShowDirectQrPaymentModal(false);
        return;
      }
      if (showAddCategoryModal) {
        setShowAddCategoryModal(false);
        return;
      }
      if (pendingConfirmAction) {
        setPendingConfirmAction(null);
        return;
      }
      if (activeTab !== 'home') {
        e.preventDefault();
        handleGoBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showAskPayoutModal, showAddMoneyModal, showDirectQrPaymentModal, showAddCategoryModal, pendingConfirmAction, activeTab, tabHistory]);

  // Navigate to tab with history tracking
  const navigateToTab = (tab: CustomerTab) => {
    if (tab === activeTab) return;
    setTabHistory((prev) => [...prev, tab]);
    setActiveTab(tab);
    // Push dummy state to window history so hardware/browser back triggers in-app navigation
    if (typeof window !== 'undefined') {
      window.history.pushState({ appTab: tab }, '', window.location.href);
    }
  };

  // In-App Back Button Handler (never closes app!)
  const handleGoBack = () => {
    if (showAskPayoutModal) {
      setShowAskPayoutModal(false);
      return;
    }
    if (showAddMoneyModal) {
      setShowAddMoneyModal(false);
      return;
    }
    if (showDirectQrPaymentModal) {
      setShowDirectQrPaymentModal(false);
      return;
    }
    if (showAddCategoryModal) {
      setShowAddCategoryModal(false);
      return;
    }
    if (pendingConfirmAction) {
      setPendingConfirmAction(null);
      return;
    }

    if (tabHistory.length > 1) {
      const updated = [...tabHistory];
      updated.pop(); // Remove current
      const previous = updated[updated.length - 1] || 'home';
      setTabHistory(updated);
      setActiveTab(previous);
    } else {
      setActiveTab('home');
      setTabHistory(['home']);
    }
  };

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
        triggerAppRingAlert('Welcome back! Signed in to ManPowerLink.');
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
      triggerAppRingAlert('Employer Account Created successfully!');
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 1) {
      setForgotStep(2);
      setForgotSuccessMsg('OTP code sent to your registered contact.');
      triggerAppRingAlert('Security challenge code dispatched.');
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
    setPendingConfirmAction({
      title: 'Sign Out Confirmation',
      description: 'Are you sure you want to sign out from your Customer account?',
      onConfirm: () => {
        setIsAuthenticated(false);
        setAuthScreen('sign-in');
        setAuthError(null);
        setPendingConfirmAction(null);
      },
    });
  };

  // Custom Category Add Handler
  const handleCreateCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCategoryName.trim()) return;

    const newCat = dataService.addCategory({
      name: customCategoryName.trim(),
      slug: customCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: `Custom manpower service: ${customCategoryName.trim()}`,
      icon: 'Briefcase',
      isActive: true,
      minPrice: 500,
      maxPrice: 4000,
      hourlyRate: Math.round(customCategoryRate / 8),
      fullDayRate: Number(customCategoryRate),
      halfDayRate: Math.round(customCategoryRate * 0.6),
      overtimeMultiplier: 1.5,
      requiredSkills: [customCategoryName.trim(), 'General On-Demand Assistance'],
    });

    setSelectedCategory(newCat);
    setPricePerHourPerHead(newCat.hourlyRate || 250);
    setShowAddCategoryModal(false);
    setCustomCategoryName('');
    triggerAppRingAlert(`New Category "${newCat.name}" added online!`);
  };

  // Helper calculations for pricing
  const currentPackage = SHIFT_PACKAGES.find((p) => p.id === selectedPackageId) || SHIFT_PACKAGES[0];
  const packageApproxHours = selectedPackageId === 'custom_pack' ? customPackageHours : currentPackage.approxHours;
  const packageRatePerWorker = selectedPackageId === 'custom_pack' ? customPackageRate : currentPackage.fixedRatePerWorker;

  const costPerWorker = pricingModel === 'hourly'
    ? pricePerHourPerHead * shiftHours
    : packageRatePerWorker;

  const totalEstimatedCost = costPerWorker * requiredWorkers;

  const scheduledTimeDisplay = timeSlotSelection === 'custom' ? customTime : timeSlotSelection;

  // Add Money to Wallet Handler via Direct PhonePe / UPI QR
  const handleVerifyAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (addMoneyAmount <= 0) return;
    const utr = addMoneyUtr.trim() || `UPI/${Date.now().toString().slice(-8)}`;
    const result = dataService.rechargeCustomerWallet('c-1', addMoneyAmount, utr);
    if (result.success) {
      setWalletBalance(result.newBalance);
      setShowAddMoneyModal(false);
      setAddMoneyUtr('');
      triggerAppRingAlert(`₹${addMoneyAmount.toLocaleString()} added to your wallet via PhonePe UPI! New balance: ₹${result.newBalance.toLocaleString()}`);
    }
  };

  // Direct PhonePe QR Order Payment Handler
  const handleDirectQrPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDirectQrPaymentModal(false);
    executePublishJob(directPaymentUtr || `UPI/QR-${Date.now().toString().slice(-6)}`);
  };

  // Submit Job with Confirmation
  const promptPublishJob = () => {
    if (!jobTitle.trim()) {
      alert('Please enter a Job Requirement Title.');
      return;
    }

    if (paymentSelection === 'wallet') {
      if (walletBalance < totalEstimatedCost) {
        setPendingConfirmAction({
          title: 'Insufficient Wallet Balance',
          description: `Your wallet balance is ₹${walletBalance.toLocaleString()}, but this booking requires ₹${totalEstimatedCost.toLocaleString()}. Would you like to add money via PhonePe / UPI QR?`,
          onConfirm: () => {
            setPendingConfirmAction(null);
            setAddMoneyAmount(Math.max(1000, totalEstimatedCost - walletBalance));
            setShowAddMoneyModal(true);
          },
        });
        return;
      }
    }

    if (paymentSelection === 'upi_qr') {
      setShowDirectQrPaymentModal(true);
      return;
    }

    setPendingConfirmAction({
      title: 'Confirm Job Order Broadcast',
      description: `Broadcast "${jobTitle}" for ${requiredWorkers} workers (${pricingModel === 'hourly' ? `${shiftHours} hrs @ ₹${pricePerHourPerHead}/hr/head` : `${currentPackage.title} ~${packageApproxHours} hrs`}) totaling ₹${totalEstimatedCost.toLocaleString()}?`,
      onConfirm: () => {
        setPendingConfirmAction(null);
        executePublishJob();
      },
    });
  };

  const executePublishJob = (upiRef?: string) => {
    let walletDebited = false;
    if (paymentSelection === 'wallet') {
      const debitRes = dataService.debitCustomerWallet(
        'c-1',
        totalEstimatedCost,
        `Advance debit for Order: ${jobTitle.trim()} (${pricingModel === 'hourly' ? `${shiftHours} hrs` : currentPackage.title})`
      );
      if (debitRes.success) {
        walletDebited = true;
        setWalletBalance(debitRes.newBalance);
      } else {
        alert(debitRes.error || 'Failed to debit wallet.');
        return;
      }
    }

    const newBooking = dataService.createBooking({
      customerId: 'c-1',
      customerName: 'Apex Logistics & Warehousing',
      customerPhone: '+91 99001 55432',
      jobTitle: jobTitle.trim(),
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      requiredWorkers: Number(requiredWorkers),
      offeredPricePerWorker: Number(costPerWorker),
      totalEstimatedAmount: Number(totalEstimatedCost),
      scheduledDate: jobDate,
      startTime: scheduledTimeDisplay,
      endTime: '05:30 PM',
      durationType: pricingModel === 'full_package' ? 'work_basis' : 'hourly',
      pricingModel,
      pricePerHourPerHead: pricingModel === 'hourly' ? pricePerHourPerHead : undefined,
      shiftHours: pricingModel === 'hourly' ? shiftHours : undefined,
      packageApproxHours: pricingModel === 'full_package' ? packageApproxHours : undefined,
      packageTitle: pricingModel === 'full_package' ? currentPackage.title : undefined,
      description: remarks.trim() || 'Temporary manpower required.',
      specialInstructions: remarks.trim(),
      remarks: remarks.trim(),
      paymentMode: paymentSelection === 'wallet' ? 'wallet' : paymentSelection === 'upi_qr' ? 'upi' : 'cash',
      paymentMethod: paymentSelection === 'wallet' ? 'wallet' : paymentSelection === 'upi_qr' ? 'online' : 'cash',
      walletDebited,
      upiTransactionRef: upiRef,
      workLocation: {
        address: jobLocation,
        city: 'Mangalore, Karnataka',
        lat: 12.914,
        lng: 74.856,
      },
    });

    setActiveBookingId(newBooking.id);
    setSelectedBookingForTimeline(newBooking);
    navigateToTab('bookings');
    triggerAppRingAlert(
      walletDebited
        ? `🔔 Order #${newBooking.orderNumber} Booked! ₹${totalEstimatedCost.toLocaleString()} debited from wallet.`
        : `🔔 Order #${newBooking.orderNumber} Published! Workers notified.`
    );
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
    triggerAppRingAlert('Message sent to worker.');
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

          {/* Action Confirmation Modal */}
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
                    Confirm Action
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Category Creator Modal */}
          {showAddCategoryModal && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <form onSubmit={handleCreateCustomCategory} className="bg-white rounded-3xl p-5 shadow-2xl max-w-xs w-full space-y-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#202124]">Add Custom Category</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-[#686868]">
                  Define a new labor trade. It will be available online for booking instantly.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-[#202124] mb-1">Category Title</label>
                  <input
                    type="text"
                    required
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="e.g. Forklift Operator, Welder"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#202124] mb-1">Base Daily Wage (₹)</label>
                  <input
                    type="number"
                    step={100}
                    value={customCategoryRate}
                    onChange={(e) => setCustomCategoryRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#D71920]"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#D71920] rounded-xl shadow-xs"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Ask for UPI Payout / Credit Modal */}
          {showAskPayoutModal && (
            <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
              <div className="bg-white rounded-3xl p-4 shadow-2xl max-w-xs w-full space-y-3 border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[#D71920] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      UPI
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#202124]">Ask for UPI Credit / Payout</h4>
                      <p className="text-[10px] text-slate-500">Withdraw wallet balance to your UPI account</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAskPayoutModal(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Available Balance:</span>
                    <span className="text-[#D71920] font-black">₹{walletBalance.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-amber-900 leading-tight">
                    Submit your personal UPI ID. Once accepted and approved by the admin, the amount will be credited directly to your bank account via UPI.
                  </p>
                </div>

                <form onSubmit={handleAskPayoutSubmit} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#202124] mb-0.5">
                      Your Personal UPI ID (To Receive Funds)
                    </label>
                    <input
                      type="text"
                      value={askPayoutUpiId}
                      onChange={(e) => setAskPayoutUpiId(e.target.value)}
                      placeholder="e.g. apex.logistics@icici"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-[#202124]">
                        Amount to Withdraw
                      </label>
                      <button
                        type="button"
                        onClick={() => setAskPayoutAmount(walletBalance)}
                        className="text-[10px] font-bold text-[#D71920] hover:underline cursor-pointer"
                      >
                        All (₹{walletBalance.toLocaleString()})
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                      {[1000, 2500, Math.min(walletBalance, 5000)].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAskPayoutAmount(amt)}
                          className={`py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            askPayoutAmount === amt
                              ? 'bg-[#D71920] text-white border-[#D71920] shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ₹{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#D71920]">₹</span>
                      <input
                        type="number"
                        step={100}
                        max={walletBalance}
                        value={askPayoutAmount}
                        onChange={(e) => setAskPayoutAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#202124] focus:outline-none focus:border-[#D71920]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAskPayoutModal(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={payoutSubmitting}
                      className="flex-1 py-2 text-xs font-bold text-white bg-[#D71920] hover:bg-[#A80F18] rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Submit Request</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Money via Direct PhonePe / UPI QR Modal */}
          {showAddMoneyModal && (
            <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
              <div className="bg-white rounded-3xl p-4 shadow-2xl max-w-xs w-full space-y-3 border border-slate-200 max-h-[92%] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      पे
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#202124]">PhonePe / UPI Top-Up</h4>
                      <p className="text-[10px] text-slate-500">Pay to {PLATFORM_UPI_ID} (Zero gateway fee)</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMoneyModal(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Amount Quick Select Pills */}
                <div>
                  <label className="block text-[11px] font-bold text-[#202124] mb-1">Select Recharge Amount</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAddMoneyAmount(amt)}
                        className={`py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                          addMoneyAmount === amt
                            ? 'bg-[#5f259f] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        +₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#5f259f]">₹</span>
                    <input
                      type="number"
                      step={100}
                      value={addMoneyAmount}
                      onChange={(e) => setAddMoneyAmount(Math.max(100, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#202124] focus:outline-none focus:border-[#5f259f]"
                      placeholder="Custom amount"
                    />
                  </div>
                </div>

                {/* Direct 1-Click Launch UPI App Button */}
                <button
                  type="button"
                  onClick={() => handleOpenUpiApp(addMoneyAmount)}
                  className="w-full py-2.5 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#FFC928]" />
                  <span>Open PhonePe / UPI App &amp; Pay ₹{addMoneyAmount.toLocaleString()}</span>
                </button>

                {/* PhonePe QR Code Container matching user image */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1 bg-[#5f259f] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <span>PhonePe</span>
                    <span className="text-[#FFC928]">★</span>
                    <span>ACCEPTED HERE</span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-semibold">
                    Scan &amp; Pay Using PhonePe App
                  </p>

                  {/* Scannable PhonePe QR Image Container */}
                  <div
                    onClick={() => handleOpenUpiApp(addMoneyAmount)}
                    className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border-2 border-[#5f259f] shadow-xs flex items-center justify-center relative cursor-pointer group"
                    title="Click to launch PhonePe / UPI App"
                  >
                    <img
                      src="/phonepe-qr.svg"
                      alt="PhonePe QR Code - prnm@kotak"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-black text-[#202124] block tracking-wide">{PLATFORM_UPI_NAME} .</span>
                  </div>

                  {/* Clickable UPI ID with 1-click Copy */}
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Official UPI ID (Tap to Pay)</span>
                      <button
                        type="button"
                        onClick={() => handleOpenUpiApp(addMoneyAmount)}
                        className="font-mono font-black text-[#5f259f] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>{PLATFORM_UPI_ID}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(PLATFORM_UPI_ID);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-[#16834A]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Form to submit 12-digit UTR */}
                <form onSubmit={handleVerifyAddMoney} className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#202124] mb-0.5">
                      12-Digit UPI Ref / UTR Number
                    </label>
                    <input
                      type="text"
                      value={addMoneyUtr}
                      onChange={(e) => setAddMoneyUtr(e.target.value)}
                      placeholder="e.g. 428919028371"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#5f259f]"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddMoneyModal(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold text-white bg-[#5f259f] hover:bg-[#4d1d82] rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Credit ₹{addMoneyAmount.toLocaleString()}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Direct PhonePe / UPI QR Order Payment Modal */}
          {showDirectQrPaymentModal && (
            <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
              <div className="bg-white rounded-3xl p-4 shadow-2xl max-w-xs w-full space-y-3 border border-slate-200 max-h-[92%] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      पे
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#202124]">Pay Order via PhonePe UPI</h4>
                      <p className="text-[10px] text-slate-500">Pay to {PLATFORM_UPI_ID} ({PLATFORM_UPI_NAME})</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDirectQrPaymentModal(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-900 block">Total Amount to Pay</span>
                  <span className="text-lg font-black text-[#D71920]">₹{totalEstimatedCost.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-600 block">
                    {requiredWorkers} Workers • {pricingModel === 'hourly' ? `${shiftHours} hrs` : `${currentPackage.title}`}
                  </span>
                </div>

                {/* Primary 1-Click Open UPI App Button */}
                <button
                  type="button"
                  onClick={() => handleOpenUpiApp(totalEstimatedCost, `Order #${activeBooking.orderNumber}`)}
                  className="w-full py-2.5 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#FFC928]" />
                  <span>Open PhonePe / UPI App &amp; Pay ₹{totalEstimatedCost.toLocaleString()}</span>
                </button>

                {/* Scannable QR code matching user image */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1 bg-[#5f259f] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <span>PhonePe</span>
                    <span className="text-[#FFC928]">★</span>
                    <span>ACCEPTED HERE</span>
                  </div>

                  <div
                    onClick={() => handleOpenUpiApp(totalEstimatedCost, `Order #${activeBooking.orderNumber}`)}
                    className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border-2 border-[#5f259f] shadow-xs flex items-center justify-center relative cursor-pointer"
                    title="Click to open PhonePe / UPI app"
                  >
                    <img
                      src="/phonepe-qr.svg"
                      alt="PhonePe QR - prnm@kotak"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-black text-[#202124] block tracking-wide">{PLATFORM_UPI_NAME} .</span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 block font-bold">MERCHANT UPI ID (Tap to Pay)</span>
                      <button
                        type="button"
                        onClick={() => handleOpenUpiApp(totalEstimatedCost, `Order #${activeBooking.orderNumber}`)}
                        className="font-mono font-black text-[#5f259f] hover:underline cursor-pointer"
                      >
                        {PLATFORM_UPI_ID}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(PLATFORM_UPI_ID);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      {copiedUpi ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleDirectQrPaymentSubmit} className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#202124] mb-0.5">
                      Enter 12-Digit UPI Transaction UTR
                    </label>
                    <input
                      type="text"
                      value={directPaymentUtr}
                      onChange={(e) => setDirectPaymentUtr(e.target.value)}
                      placeholder="e.g. 428919028371"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDirectQrPaymentModal(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold text-white bg-[#D71920] hover:bg-[#A80F18] rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify &amp; Broadcast Job</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* A. UNAUTHENTICATED SCREENS (Sign In, Sign Up, Forgot) */}
          {/* ========================================================== */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col bg-[#FFFDF8] overflow-y-auto p-5">
              <div className="text-center mt-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#D71920] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md mb-2">
                  M
                </div>
                <h1 className="text-lg font-bold text-[#202124]">
                  ManPower<span className="text-[#D71920]">Link</span>
                </h1>
                <p className="text-[11px] font-bold text-[#D71920] uppercase tracking-wider">
                  Customer App
                </p>
                <p className="text-xs text-[#686868] mt-1">
                  Book and manage temporary manpower
                </p>
              </div>

              {authError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-[#C62828]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authScreen === 'sign-in' && (
                <form onSubmit={handleSignIn} className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">
                        Mobile Phone or Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={loginPhoneOrEmail}
                          onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                          placeholder="+91 99001 55432"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#202124]">Password</label>
                        <button
                          type="button"
                          onClick={() => setAuthScreen('forgot-password')}
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

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Sign In to Customer App</span>
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
                      <span>Quick Enter Customer App →</span>
                    </button>
                  </div>

                  <div className="pt-4 text-center border-t border-slate-100">
                    <p className="text-xs text-[#686868]">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthScreen('sign-up')}
                        className="font-bold text-[#D71920] hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </form>
              )}

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
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Mobile (+91)</label>
                        <input
                          type="tel"
                          required
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={signUpCity}
                          onChange={(e) => setSignUpCity(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer mt-1"
                    >
                      Create Employer Account
                    </button>
                  </div>
                  <div className="pt-3 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAuthScreen('sign-in')}
                      className="text-xs font-bold text-[#D71920]"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {authScreen === 'forgot-password' && (
                <form onSubmit={handleForgotSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#202124]">Reset Your Password</h3>
                    {forgotSuccessMsg && (
                      <div className="p-2 bg-[#FFC928]/15 border border-[#FFC928]/40 rounded-xl text-xs text-[#A80F18]">
                        {forgotSuccessMsg}
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      placeholder="Registered email or phone"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#D71920] text-white font-bold text-xs rounded-xl"
                    >
                      Send Recovery Challenge
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthScreen('sign-in')}
                    className="text-xs font-bold text-[#D71920]"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ========================================================== */
            /* B. AUTHENTICATED APP WITH RICH COLORFUL FORMS & FIXED BAR */
            /* ========================================================== */
            <>
              {/* Top Navigation Bar with Audio Chime Indicator and In-App Back Navigation */}
              <div className="h-14 bg-[#D71920] text-white px-3 flex items-center justify-between shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-1.5">
                  {/* Back button when inside sub-screens/tabs so users never close the app */}
                  {activeTab !== 'home' ? (
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="p-1 -ml-0.5 hover:bg-white/20 rounded-xl transition-all cursor-pointer flex items-center gap-0.5 text-white bg-black/15 shadow-2xs"
                      title="Back to Previous Screen"
                    >
                      <ChevronLeft className="w-5 h-5 text-white stroke-[2.5]" />
                      <span className="text-[11px] font-bold pr-1">Back</span>
                    </button>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-white text-[#D71920] font-black flex items-center justify-center text-xs shadow-xs">
                      M
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-xs leading-tight">
                      {activeTab === 'home' && 'ManPowerLink'}
                      {activeTab === 'post-job' && 'Post Job Order'}
                      {activeTab === 'bookings' && 'Orders & Live Bids'}
                      {activeTab === 'messages' && 'Worksite Chat'}
                      {activeTab === 'profile' && 'Customer Profile'}
                    </h2>
                    <p className="text-[10px] text-white/80 leading-tight flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#FFC928]" />
                      <span>Mangalore Port Corridor</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Customer Wallet Balance Chip */}
                  <button
                    type="button"
                    onClick={() => setShowAddMoneyModal(true)}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs border border-white/20"
                    title="Add Money via PhonePe QR"
                  >
                    <Wallet className="w-3 h-3 text-[#FFC928]" />
                    <span>₹{walletBalance.toLocaleString()}</span>
                    <span className="text-[9px] bg-[#FFC928] text-[#202124] px-1 rounded font-black">+</span>
                  </button>

                  <button
                    onClick={() => triggerAppRingAlert('🔔 Audible notification tone tested!')}
                    title="Test Ringtone"
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
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
                      <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-[#FFC928]/80 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-[#A80F18] uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#D71920] animate-ping" />
                            {activeBooking.orderNumber} Active
                          </span>
                          <p className="text-xs font-bold text-[#202124]">{activeBooking.jobTitle || activeBooking.categoryName}</p>
                          <p className="text-[10px] text-[#686868]">
                            Start OTP: <strong className="font-mono text-[#D71920] text-xs">{activeBooking.startOtp}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedBookingForTimeline(activeBooking);
                            setActiveTab('bookings');
                          }}
                          className="px-3 py-1.5 bg-[#D71920] text-white text-[11px] font-bold rounded-xl shadow-xs"
                        >
                          View Status
                        </button>
                      </div>
                    )}

                    {/* Service Categories Header + Chips */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-extrabold text-[#202124] uppercase tracking-wider">
                          Select Service Category
                        </h3>
                        <button
                          onClick={() => setShowAddCategoryModal(true)}
                          className="text-[11px] font-bold text-[#D71920] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Custom</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.slice(0, 6).map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setPricePerHourPerHead(cat.hourlyRate || Math.round(cat.fullDayRate / 8) || 250);
                              setActiveTab('post-job');
                            }}
                            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#D71920] transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                          >
                            <span className="text-xs font-bold text-[#202124] block">{cat.name}</span>
                            <span className="text-[10px] text-[#D71920] font-bold mt-1 block">
                              ₹{cat.fullDayRate} / day
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Nearby Workers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-extrabold text-[#202124] uppercase tracking-wider">
                          Verified Nearby Workers
                        </h3>
                        <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded-full font-bold">
                          194 Available
                        </span>
                      </div>
                      <div className="space-y-2">
                        {workers.slice(0, 3).map((w) => (
                          <div
                            key={w.id}
                            className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={w.avatar} alt={w.name} className="w-10 h-10 rounded-full object-cover" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-[#202124]">{w.name}</h4>
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#D71920]" />
                                </div>
                                <p className="text-[10px] text-[#686868]">{w.skills?.slice(0, 2).join(', ') || 'General Work'}</p>
                                <div className="flex items-center gap-1 text-[10px] text-[#E5A900] font-bold">
                                  <Star className="w-3 h-3 fill-[#E5A900]" />
                                  <span>{w.rating} ({w.completedJobsCount} jobs)</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setJobTitle(`Hire ${w.name} for On-Demand Shift`);
                                setActiveTab('post-job');
                              }}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-[#D71920] border border-[#D71920]/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Hire
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BOOKINGS TAB & STATUS TREE */}
                {activeTab === 'bookings' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-[#202124] uppercase tracking-wider">
                        My Bookings & Status History
                      </h3>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          onClick={() => setBookingFilter('all')}
                          className={`px-2 py-0.5 rounded-lg font-bold ${
                            bookingFilter === 'all' ? 'bg-[#D71920] text-white' : 'bg-slate-200 text-[#686868]'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setBookingFilter('active')}
                          className={`px-2 py-0.5 rounded-lg font-bold ${
                            bookingFilter === 'active' ? 'bg-[#D71920] text-white' : 'bg-slate-200 text-[#686868]'
                          }`}
                        >
                          Active
                        </button>
                      </div>
                    </div>

                    {/* Booking Selector Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {bookings.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBookingForTimeline(b)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                            selectedBookingForTimeline?.id === b.id
                              ? 'bg-[#202124] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-[#686868]'
                          }`}
                        >
                          {b.orderNumber}
                        </button>
                      ))}
                    </div>

                    {/* Active Selected Booking Card */}
                    {selectedBookingForTimeline && (
                      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-[#D71920]">{selectedBookingForTimeline.orderNumber}</span>
                            <h4 className="text-sm font-bold text-[#202124] mt-0.5">
                              {selectedBookingForTimeline.jobTitle || selectedBookingForTimeline.categoryName}
                            </h4>
                          </div>
                          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-100 text-[#A80F18]">
                            {selectedBookingForTimeline.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* OTP Verification Display */}
                        <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#A80F18] font-bold block">Arrival Start OTP (Give to Worker):</span>
                            <span className="font-mono font-black text-lg text-[#D71920] tracking-widest">
                              {selectedBookingForTimeline.startOtp}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#686868] font-semibold block">End OTP:</span>
                            <span className="font-mono font-bold text-sm text-[#202124]">{selectedBookingForTimeline.endOtp}</span>
                          </div>
                        </div>

                        {/* Additional Remarks & Special Instructions */}
                        {(selectedBookingForTimeline.remarks || selectedBookingForTimeline.specialInstructions) && (
                          <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200/90 text-xs">
                            <span className="text-[10px] text-[#A80F18] font-bold flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#D71920]" />
                              <span>Worksite Remarks & Notes:</span>
                            </span>
                            <p className="text-[11px] text-[#202124] mt-0.5 leading-snug">
                              {selectedBookingForTimeline.remarks || selectedBookingForTimeline.specialInstructions}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Shift Timing:</span>
                            <span className="font-bold text-[#202124]">
                              {selectedBookingForTimeline.startTime} – {selectedBookingForTimeline.endTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Pricing / Duration:</span>
                            <span className="font-bold text-[#D71920]">
                              {selectedBookingForTimeline.pricingModel === 'full_package'
                                ? `${selectedBookingForTimeline.packageTitle || 'Turnkey Pack'} (~${selectedBookingForTimeline.packageApproxHours || 8.5}h)`
                                : `${selectedBookingForTimeline.shiftHours || 8}h @ ₹${selectedBookingForTimeline.pricePerHourPerHead || 250}/hr/head`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="text-[#686868]">Payment Status:</span>
                          <span className="font-bold text-[#D71920]">
                            {selectedBookingForTimeline.walletDebited
                              ? '✓ Debited from Wallet (Paid)'
                              : selectedBookingForTimeline.upiTransactionRef
                              ? `✓ Paid via PhonePe QR (${selectedBookingForTimeline.upiTransactionRef})`
                              : 'Direct Cash / UPI on Worksite'}
                          </span>
                        </div>

                        {/* --- VISUAL TIMELINE / STATUS TREE (Beginning to End) --- */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-[11px] font-extrabold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-[#D71920]" />
                              <span>Live Status Tree & Location Audit</span>
                            </h5>
                            <span className="text-[9px] bg-[#FFC928]/25 text-[#A80F18] px-2 py-0.5 rounded font-bold">
                              GPS Verified
                            </span>
                          </div>

                          <div className="relative pl-6 space-y-4 border-l-2 border-[#FFC928] ml-2">
                            {(selectedBookingForTimeline.timelineTree || []).map((node, idx) => (
                              <div key={node.id || idx} className="relative group">
                                {/* Node dot */}
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

                                {/* Node content */}
                                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${node.completed ? 'text-[#202124]' : 'text-slate-500'}`}>
                                      {node.title}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#686868]">{node.timestamp}</span>
                                  </div>
                                  <p className="text-[11px] text-[#686868] leading-tight">{node.description}</p>
                                  {node.location && (
                                    <div className="pt-1 flex items-center gap-1 text-[10px] text-[#D71920] font-semibold">
                                      <MapPin className="w-3 h-3 text-[#D71920]" />
                                      <span className="truncate">{node.location.address}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. POST A JOB TAB (EXACTLY MATCHING USER SCREENSHOTS WITH DECORATED MULTI-COLOR UI) */}
                {activeTab === 'post-job' && (
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-[#202124]">Post New Job Order</h2>
                        <p className="text-[11px] text-[#686868]">On-Demand Workforce Broadcast</p>
                      </div>
                      <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2.5 py-1 rounded-full font-bold">
                        Direct Cash / UPI
                      </span>
                    </div>

                    {/* Step indicator bar - Red and Yellow Dual Progress */}
                    <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                      <div className="w-3/4 h-full bg-linear-to-r from-[#D71920] via-[#E5A900] to-[#FFC928] rounded-full" />
                    </div>

                    {/* Section 1: Select Service Category Chips */}
                    <div className="bg-white p-3.5 rounded-3xl border border-amber-200/80 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#D71920]" />
                          <span>Select Service Category</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryModal(true)}
                          className="text-[11px] font-bold text-[#D71920] hover:text-[#A80F18] flex items-center gap-0.5 cursor-pointer bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
                        >
                          <Plus className="w-3 h-3 text-[#D71920]" />
                          <span>Add Custom</span>
                        </button>
                      </div>

                      {/* Selectable category chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => {
                          const isSelected = selectedCategory.id === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat);
                                setPricePerHourPerHead(cat.hourlyRate || Math.round(cat.fullDayRate / 8) || 250);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#D71920] text-white shadow-xs font-bold border-2 border-[#FFC928]'
                                  : 'bg-amber-50/50 border border-amber-200/70 text-[#202124] hover:bg-amber-100/70 hover:border-[#FFC928]'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#FFC928]" />}
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Job Requirement Title (Balanced Red & Yellow border & warm input) */}
                    <div className="bg-white p-3.5 rounded-3xl border-2 border-[#FFC928] shadow-xs space-y-1.5 focus-within:ring-2 focus-within:ring-[#FFC928]/40 transition-all">
                      <label className="text-xs font-bold text-[#202124] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-[#D71920]" />
                          <span>Job Requirement Title *</span>
                        </span>
                        <span className="text-[10px] font-bold bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded-md">
                          Required
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Loading and moving warehouse crates"
                        className="w-full px-3 py-2 text-xs bg-amber-50/40 border border-amber-200/80 rounded-xl focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/30 font-semibold text-[#202124]"
                      />
                    </div>

                    {/* Section 3: Pricing Model Choice (Hourly vs Full Package) */}
                    <div className="bg-white p-3.5 rounded-3xl border border-amber-200/80 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#202124]">Choose Pricing & Duration Model</label>
                        <span className="text-[10px] font-bold text-[#202124] bg-[#FFC928] px-2 py-0.5 rounded-md">
                          {pricingModel === 'hourly' ? 'Hourly Basis' : 'Turnkey Package'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-amber-50/80 p-1 rounded-2xl border border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => setPricingModel('hourly')}
                          className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            pricingModel === 'hourly'
                              ? 'bg-[#FFC928] text-[#202124] font-black shadow-xs border border-amber-400'
                              : 'text-slate-600 hover:text-[#202124]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-[#D71920]" />
                          <span>Hourly Basis</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPricingModel('full_package')}
                          className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            pricingModel === 'full_package'
                              ? 'bg-[#D71920] text-white font-black shadow-xs border border-[#FFC928]'
                              : 'text-slate-600 hover:text-[#202124]'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
                          <span>★ Full Package</span>
                        </button>
                      </div>

                      {/* --- A. HOURLY BASIS SPECIFIC FIELDS --- */}
                      {pricingModel === 'hourly' && (
                        <div className="space-y-3 pt-1">
                          {/* Separate field: Price / Hour / Head */}
                          <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-200/70 space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-[#202124] flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-[#D71920]" />
                                <span>Hourly Basis Price (₹ / Hour / Head) *</span>
                              </label>
                              <span className="text-[10px] text-slate-500 font-semibold">per worker</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm text-[#D71920]">₹</span>
                              <input
                                type="number"
                                step={10}
                                min={50}
                                value={pricePerHourPerHead}
                                onChange={(e) => setPricePerHourPerHead(Math.max(50, Number(e.target.value)))}
                                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-amber-200 rounded-xl font-bold text-[#202124] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/40"
                                placeholder="250"
                              />
                            </div>
                          </div>

                          {/* Stepper: Shift Duration in Hours */}
                          <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-200/70 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-[#202124] block">Shift Duration</span>
                              <span className="text-[10px] text-slate-500">Working hours required</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-amber-200">
                              <button
                                type="button"
                                onClick={() => setShiftHours(Math.max(1, shiftHours - 1))}
                                className="w-7 h-7 rounded-lg bg-amber-100/70 flex items-center justify-center text-slate-700 font-bold hover:bg-amber-200 cursor-pointer"
                              >
                                <Minus className="w-3 h-3 text-[#D71920]" />
                              </button>
                              <span className="text-xs font-black text-[#202124] min-w-12 text-center">
                                {shiftHours} hrs
                              </span>
                              <button
                                type="button"
                                onClick={() => setShiftHours(shiftHours + 1)}
                                className="w-7 h-7 rounded-lg bg-[#FFC928] flex items-center justify-center text-[#202124] font-bold hover:bg-[#E5A900] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Formula calculation badge */}
                          <div className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-300 text-[11px] text-[#202124] flex items-center justify-between font-bold">
                            <span className="text-[#A80F18]">Cost per worker:</span>
                            <span className="font-mono text-[#D71920] font-black">
                              ₹{pricePerHourPerHead}/hr/head × {shiftHours} hrs = ₹{(pricePerHourPerHead * shiftHours).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* --- B. FULL PACKAGE SPECIFIC FIELDS --- */}
                      {pricingModel === 'full_package' && (
                        <div className="space-y-2.5 pt-1">
                          <label className="text-[11px] font-bold text-[#202124] block">
                            Select Turnkey Shift Package (Approx. Time & Fixed Rate)
                          </label>
                          <div className="space-y-2">
                            {SHIFT_PACKAGES.map((pkg) => {
                              const isPkgSelected = selectedPackageId === pkg.id;
                              return (
                                <div
                                  key={pkg.id}
                                  onClick={() => setSelectedPackageId(pkg.id)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                    isPkgSelected
                                      ? 'bg-linear-to-r from-amber-50 to-yellow-50 border-2 border-[#FFC928] shadow-xs'
                                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                        isPkgSelected ? 'border-[#D71920] bg-[#D71920]' : 'border-slate-400 bg-white'
                                      }`}>
                                        {isPkgSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFC928]" />}
                                      </span>
                                      <h4 className="text-xs font-bold text-[#202124]">{pkg.title}</h4>
                                    </div>
                                    <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded-md font-extrabold border border-amber-400">
                                      {pkg.badge}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mb-2 pl-5 leading-tight">{pkg.description}</p>
                                  
                                  {/* Approx time taking & Fixed rate display */}
                                  <div className="flex items-center justify-between text-xs font-bold pl-5 pt-1 border-t border-amber-200/50">
                                    <span className="text-[#A80F18] flex items-center gap-1 text-[11px]">
                                      <Clock className="w-3.5 h-3.5 text-[#D71920]" />
                                      <span>Approx Time: ~{pkg.approxHours} Hours</span>
                                    </span>
                                    <span className="text-[#D71920] font-black">
                                      ₹{pkg.fixedRatePerWorker.toLocaleString()} / worker
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* If Custom Turnkey Package is selected, allow adjusting hours and rate */}
                          {selectedPackageId === 'custom_pack' && (
                            <div className="p-3 bg-white rounded-2xl border border-amber-300 space-y-2 mt-2">
                              <span className="text-[11px] font-bold text-[#A80F18] block">Custom Package Details</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Approx. Work Time (Hrs)</label>
                                  <input
                                    type="number"
                                    step={0.5}
                                    value={customPackageHours}
                                    onChange={(e) => setCustomPackageHours(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Package Rate (₹ / head)</label>
                                  <input
                                    type="number"
                                    step={100}
                                    value={customPackageRate}
                                    onChange={(e) => setCustomPackageRate(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#D71920]"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Section 4: Workers Needed with [-] 3 [+] stepper */}
                    <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-[#202124] block">Workers Needed (Heads)</label>
                        <span className="text-[11px] text-[#686868]">Total workforce count required</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setRequiredWorkers(Math.max(1, requiredWorkers - 1))}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-black text-[#202124] min-w-5 text-center">
                          {requiredWorkers}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRequiredWorkers(requiredWorkers + 1)}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section 5: Interactive Date & Time Widget Selection */}
                    <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                      <div>
                        <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5 mb-2">
                          <CalendarDays className="w-4 h-4 text-[#D71920]" />
                          <span>Select Shift Date</span>
                        </label>
                        {/* Date selection quick pills */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { key: 'today', label: 'Today', date: '2026-10-15', sub: '15 Oct' },
                            { key: 'tomorrow', label: 'Tomorrow', date: '2026-10-16', sub: '16 Oct' },
                            { key: 'day_after', label: 'Day After', date: '2026-10-17', sub: '17 Oct' },
                            { key: 'custom', label: 'Custom', date: jobDate, sub: 'Calendar' },
                          ].map((d) => (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => {
                                setDateSelection(d.key as any);
                                if (d.key !== 'custom') setJobDate(d.date);
                              }}
                              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                                dateSelection === d.key
                                  ? 'bg-[#D71920] text-white shadow-xs'
                                  : 'bg-slate-50 border border-slate-200 text-[#202124] hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-[11px] font-extrabold block leading-tight">{d.label}</span>
                              <span className={`text-[9px] block ${dateSelection === d.key ? 'text-white/80' : 'text-slate-500'}`}>
                                {d.sub}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Custom Date Input when selected */}
                        {dateSelection === 'custom' && (
                          <div className="mt-2">
                            <input
                              type="date"
                              value={jobDate}
                              onChange={(e) => setJobDate(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#202124] focus:outline-none focus:border-[#D71920]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Time Slot Selection Widget */}
                      <div>
                        <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5 mb-2">
                          <Clock className="w-4 h-4 text-[#D71920]" />
                          <span>Select Shift Start Time Slot</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            '07:00 AM',
                            '08:30 AM',
                            '11:00 AM',
                            '01:30 PM',
                            '05:30 PM',
                            '08:00 PM',
                          ].map((slot) => {
                            const isSlotActive = timeSlotSelection === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setTimeSlotSelection(slot)}
                                className={`py-1.5 px-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer ${
                                  isSlotActive
                                    ? 'bg-[#FFC928] text-[#202124] shadow-xs'
                                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Scheduled Time Banner */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold">Scheduled Shift:</span>
                        <span className="font-bold text-[#D71920]">
                          📅 {jobDate} • ⏰ {scheduledTimeDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Section 6: Job Site Location */}
                    <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs space-y-1.5">
                      <label className="text-xs font-bold text-[#202124] block">Job Site Location</label>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
                        <MapPin className="w-4 h-4 text-[#D71920] shrink-0" />
                        <input
                          type="text"
                          value={jobLocation}
                          onChange={(e) => setJobLocation(e.target.value)}
                          placeholder="Worksite location & gate"
                          className="w-full text-xs bg-transparent focus:outline-none font-medium text-[#202124]"
                        />
                      </div>
                    </div>

                    {/* Section 7: Required Remarks / Special Notes Field */}
                    <div className="bg-white p-3.5 rounded-3xl border-2 border-[#FFC928] shadow-xs space-y-1.5 focus-within:ring-2 focus-within:ring-[#FFC928]/40 transition-all">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#D71920]" />
                          <span>Additional Remarks / Worksite Notes *</span>
                        </label>
                        <span className="text-[10px] font-bold text-[#202124] bg-[#FFC928] px-2 py-0.5 rounded-md">
                          Required
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Specific guidelines, safety equipment required, supervisor contact, gate access, or cargo details.
                      </p>
                      <textarea
                        rows={3}
                        required
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g. Safety boots required. Report to Gate 4 at dock warehouse. Supervisor phone: +91 99001 55432."
                        className="w-full p-2.5 text-xs bg-amber-50/40 border border-amber-200/90 rounded-2xl focus:outline-none font-medium text-[#202124] focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/40"
                      />
                    </div>

                    {/* Section 8: Payment Mode (Wallet Debit vs PhonePe QR vs Cash) */}
                    <div className="bg-white p-3.5 rounded-3xl border border-amber-200/80 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#D71920]" />
                          <span>Payment Method & Settlement</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddMoneyModal(true)}
                          className="text-[10px] font-bold text-[#D71920] hover:text-[#A80F18] flex items-center gap-1 cursor-pointer bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
                        >
                          <QrCode className="w-3 h-3 text-[#FFC928]" />
                          <span>+ Add Money</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {/* Option 1: Prepaid Wallet Debit */}
                        <div
                          onClick={() => setPaymentSelection('wallet')}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            paymentSelection === 'wallet'
                              ? 'bg-linear-to-r from-amber-50 to-yellow-50 border-2 border-[#FFC928] shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                paymentSelection === 'wallet' ? 'border-[#D71920] bg-[#D71920]' : 'border-slate-400 bg-white'
                              }`}>
                                {paymentSelection === 'wallet' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFC928]" />}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-[#202124] block">Instant Wallet Debit</span>
                                <span className="text-[10px] text-slate-500">
                                  Available Balance: <strong className="text-emerald-700">₹{walletBalance.toLocaleString()}</strong>
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              walletBalance >= totalEstimatedCost
                                ? 'bg-[#FFC928] text-[#202124]'
                                : 'bg-red-100 text-[#D71920]'
                            }`}>
                              {walletBalance >= totalEstimatedCost ? 'Balance Ready' : 'Needs Top-Up'}
                            </span>
                          </div>
                        </div>

                        {/* Option 2: Direct UPI QR / Intent */}
                        <div
                          onClick={() => setPaymentSelection('upi_qr')}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            paymentSelection === 'upi_qr'
                              ? 'bg-linear-to-r from-amber-50 to-yellow-50 border-2 border-[#FFC928] shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                paymentSelection === 'upi_qr' ? 'border-[#D71920] bg-[#D71920]' : 'border-slate-400 bg-white'
                              }`}>
                                {paymentSelection === 'upi_qr' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFC928]" />}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-[#202124] block">Direct UPI Intent & QR (prnm@kotak)</span>
                                <span className="text-[10px] text-slate-500">GPay, PhonePe, Paytm, Kotak UPI supported</span>
                              </div>
                            </div>
                            <span className="text-[10px] bg-[#D71920] text-white px-2 py-0.5 rounded-md font-bold">
                              Verified Payee
                            </span>
                          </div>
                        </div>

                        {/* Option 3: Cash / UPI at Worksite */}
                        <div
                          onClick={() => setPaymentSelection('cash')}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            paymentSelection === 'cash'
                              ? 'bg-linear-to-r from-amber-50 to-yellow-50 border-2 border-[#FFC928] shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              paymentSelection === 'cash' ? 'border-[#D71920] bg-[#D71920]' : 'border-slate-400 bg-white'
                            }`}>
                              {paymentSelection === 'cash' && <span className="w-1.5 h-1.5 rounded-full bg-[#FFC928]" />}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-[#202124] block">Direct Cash on Worksite</span>
                              <span className="text-[10px] text-slate-500">Pay workers in person upon verified shift completion</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Summary Pill - Distinct Gold & Red Banner */}
                    <div className="bg-linear-to-r from-[#FFFDF0] via-[#FFF9E6] to-[#FFF3CD] p-4 rounded-2xl border-2 border-[#FFC928] shadow-xs flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#A80F18] font-bold uppercase tracking-wider block">Total Estimated Cost</span>
                        <span className="text-2xl font-black text-[#D71920]">
                          ₹{totalEstimatedCost.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-600 block mt-0.5">
                          {paymentSelection === 'wallet' && 'Instant debit from employer wallet balance'}
                          {paymentSelection === 'upi_qr' && 'Pay direct via verified UPI (prnm@kotak)'}
                          {paymentSelection === 'cash' && 'Pay directly to workers on shift end'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-[#202124] bg-[#FFC928] px-3 py-1 rounded-xl block shadow-2xs border border-amber-400">
                          {requiredWorkers} Workers × ₹{costPerWorker.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#A80F18] font-bold mt-1 block">
                          {pricingModel === 'hourly' ? `${shiftHours} Hours Shift` : `Turnkey ~${packageApproxHours}h`}
                        </span>
                      </div>
                    </div>

                    {/* Publish / Book Button - Primary Red and Yellow CTA */}
                    <button
                      type="button"
                      onClick={promptPublishJob}
                      className="w-full py-3.5 bg-linear-to-r from-[#D71920] via-[#C6171E] to-[#B7151B] hover:from-[#B7151B] hover:to-[#961217] text-white font-black text-sm rounded-2xl shadow-md border-2 border-[#FFC928] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {paymentSelection === 'wallet' ? (
                        <>
                          <Wallet className="w-4 h-4 text-[#FFC928]" />
                          <span>Debit ₹{totalEstimatedCost.toLocaleString()} & Broadcast Job Order</span>
                        </>
                      ) : paymentSelection === 'upi_qr' ? (
                        <>
                          <QrCode className="w-4 h-4 text-[#FFC928]" />
                          <span>Pay ₹{totalEstimatedCost.toLocaleString()} via UPI & Broadcast Job</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#FFC928]" />
                          <span>Publish Job Order & Alert Workers (Cash)</span>
                        </>
                      )}
                    </button>
                  </div>
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
                          <span className="text-[10px] text-[#D71920] flex items-center gap-1 font-semibold">
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
                    <div className="bg-white p-3.5 rounded-3xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                      <div className="w-12 h-12 rounded-2xl bg-[#D71920] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                        AL
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#202124]">Apex Logistics & Warehousing</h4>
                        <p className="text-[11px] text-[#686868]">apex@logistics.in</p>
                        <span className="text-[10px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded font-bold">
                          Verified Customer
                        </span>
                      </div>
                    </div>

                    {/* Customer Prepaid Wallet Card */}
                    <div className="bg-linear-to-r from-[#1E1F23] to-[#2D3039] p-4 rounded-3xl text-white shadow-md space-y-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-white/70 flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-[#FFC928]" />
                          <span>Prepaid Customer Wallet</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-black text-[#FFC928]">₹{walletBalance.toLocaleString()}</span>
                          <span className="text-[10px] text-white/50 block">Available for instant order debits</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddMoneyModal(true)}
                          className="px-3 py-1.5 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>+ Add Money</span>
                        </button>
                      </div>

                      {/* Recent transactions list */}
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] font-bold text-white/70 block uppercase tracking-wider">
                          Recent Wallet Activity
                        </span>
                        {(customer?.walletTransactions || [
                          {
                            id: 'ctx-1',
                            type: 'credit',
                            amount: 15000,
                            description: 'Wallet Top-up via PhonePe UPI QR',
                            timestamp: '14 Oct 2026, 04:30 PM',
                          },
                        ]).slice(0, 3).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
                            <div>
                              <span className="font-semibold text-white/90 block leading-tight">{tx.description}</span>
                              <span className="text-[9px] text-white/50 font-mono">{tx.timestamp}</span>
                            </div>
                            <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-[#FFC928]'}`}>
                              {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Registered Mobile:</span>
                        <span className="font-bold text-[#202124]">+91 99001 55432</span>
                      </div>
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Worksite Location:</span>
                        <span className="font-bold text-[#202124]">Panambur Industrial Area</span>
                      </div>
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Payment Debit Support:</span>
                        <span className="font-bold text-[#D71920]">Prepaid Wallet / Direct PhonePe QR</span>
                      </div>
                    </div>

                    {/* Logout Button with Confirmation */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-[#D71920] border border-red-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Customer App</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================== */}
              {/* FIXED 5-TAB BOTTOM NAVIGATION BAR (RED AND YELLOW PALETTE) */}
              {/* ========================================================== */}
              <div className="h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around shrink-0 z-30 shadow-lg">
                {/* 1. Explore / Home */}
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                    activeTab === 'home' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>
                    Explore
                  </span>
                </button>

                {/* 2. Post Job (Prominent button as shown in screenshot) */}
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
                        ? 'bg-[#D71920] text-white shadow-xs'
                        : 'bg-[#FFC928] text-[#202124]'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'post-job' ? 'font-bold text-[#D71920]' : 'font-semibold'}`}>
                    Post Job
                  </span>
                </button>

                {/* 3. Bids / Live Bookings */}
                <button
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer relative ${
                    activeTab === 'bookings' ? 'text-[#D71920]' : 'text-[#686868] hover:text-[#202124]'
                  }`}
                >
                  <Tag className={`w-5 h-5 ${activeTab === 'bookings' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] mt-0.5 ${activeTab === 'bookings' ? 'font-bold' : 'font-medium'}`}>
                    Bids & Status
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] absolute top-1 right-5" />
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
