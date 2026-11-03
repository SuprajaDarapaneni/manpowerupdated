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
  ArrowDownToLine,
  Building2,
  CheckCircle,
  Check,
  CheckCheck,
  Bell,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Booking, Worker, StatusTimelineNode, ChatMessage } from '../../types';
import {
  dataService,
  playNotificationSound,
  playIncomingJobRingtone,
} from '../../services/storage';
import { subscribeToFirebaseNotifications } from '../../services/firebase';

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

  // Admin Minimum Balance to Receive Requests
  const [minWorkerWalletBalance, setMinWorkerWalletBalance] = useState<number>(() => {
    return dataService.getCommissionSettings().minWorkerWalletBalance ?? -200;
  });

  // Work Details Modal State before accepting shift
  const [viewingWorkDetails, setViewingWorkDetails] = useState<Booking | null>(null);

  useEffect(() => {
    return dataService.subscribe(() => {
      setBranding(dataService.getBrandingSettings());
      const comm = dataService.getCommissionSettings();
      if (comm.minWorkerWalletBalance !== undefined) {
        setMinWorkerWalletBalance(comm.minWorkerWalletBalance);
      }
    });
  }, []);

  // Auth State - Starts at Sign In Screen first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<EmployeeAuthScreen>('sign-in');
  const [loginPhone, setLoginPhone] = useState('+91 98765 43210');
  const [loginPassword, setLoginPassword] = useState('Worker@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Worker Sign Up Form State
  const [signUpName, setSignUpName] = useState('Suresh Gowda');
  const [signUpPhone, setSignUpPhone] = useState('+91 98800 12345');
  const [signUpCategory, setSignUpCategory] = useState('Loading & Unloading');
  const [signUpCity, setSignUpCity] = useState('Mangalore, Karnataka');
  const [signUpPassword, setSignUpPassword] = useState('Worker@2026');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('Worker@2026');
  const [signUpTermsAccepted, setSignUpTermsAccepted] = useState(true);

  // Play Store Compliance State (Terms, Privacy Policy, Account Deletion)
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Real App Top Push Notification Banner (Zomato / Swiggy Style)
  const [pushBanner, setPushBanner] = useState<{
    title: string;
    message: string;
    timestamp: string;
    type?: 'job' | 'payment' | 'system';
  } | null>(null);

  // Main 5-Tab Navigation State
  const [activeTab, setActiveTab] = useState<EmployeeTab>('home');
  const [isOnline, setIsOnline] = useState(true);

  // Wallet & Earnings State
  const [walletBalance, setWalletBalance] = useState<number>(currentWorker.walletBalance || 4850);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(1000);

  // Dedicated Worker Withdrawal (Payout of Work Earnings) State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank'>('upi');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(2000);
  const [withdrawUpiId, setWithdrawUpiId] = useState('ramesh.kumar@okaxis');
  const [withdrawBankName, setWithdrawBankName] = useState('State Bank of India');
  const [withdrawAccountNo, setWithdrawAccountNo] = useState('38910029381');
  const [withdrawIfsc, setWithdrawIfsc] = useState('SBIN0004128');
  const [withdrawAccountName, setWithdrawAccountName] = useState(currentWorker.name || 'Ramesh Kumar');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccessReceipt, setWithdrawalSuccessReceipt] = useState<{
    utr: string;
    amount: number;
    destination: string;
    date: string;
  } | null>(null);
  const [showPassbookModal, setShowPassbookModal] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([
    {
      id: 'wth-101',
      amount: 2000,
      method: 'Bank A/C (...9381)',
      utr: 'IMPS/6192849102',
      status: 'Completed',
      date: 'Yesterday, 06:15 PM',
    },
    {
      id: 'wth-102',
      amount: 1500,
      method: 'UPI (ramesh.kumar@okaxis)',
      utr: 'UPI/6182049182',
      status: 'Completed',
      date: '28 Oct 2026, 08:30 PM',
    },
  ]);

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

  // Incoming Job Broadcast & Ringing State
  const [incomingJobAlert, setIncomingJobAlert] = useState<Booking | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  // Helper to trigger realistic Swiggy / Zomato style top push drop-down notification
  const showRealAppPush = (title: string, message: string, type: 'job' | 'payment' | 'system' = 'job') => {
    // CRITICAL: NEVER ring or show alerts on unauthenticated sign-in screen
    if (!isAuthenticated) return;
    playNotificationSound();
    setPushBanner({
      title,
      message,
      timestamp: 'Just now',
      type,
    });
    // Auto-dismiss after 6 seconds like real system notification
    setTimeout(() => {
      setPushBanner((curr) => (curr?.title === title ? null : curr));
    }, 6000);
  };

  // Track bookings that already existed when app opened to PREVENT false ringing on launch
  const seenBookingIds = useRef<Set<string>>(new Set(dataService.getBookings().map((b) => b.id)));

  useEffect(() => {
    // CRITICAL FIX: NEVER listen or fire alerts if worker is not signed in or is offline!
    if (!isAuthenticated || !isOnline) {
      setIsRinging(false);
      setIncomingJobAlert(null);
      return;
    }

    // 1. Listen for new job broadcast from customer app
    const handleNewJobBroadcast = (e: any) => {
      if (!isAuthenticated || !isOnline) return;
      const newJob = e.detail as Booking;
      if (newJob) {
        seenBookingIds.current.add(newJob.id);
        setIncomingJobAlert(newJob);
        // Swiggy gentle chime and top notification banner
        playNotificationSound();
        showRealAppPush(
          `⚡ Shift Alert: ${newJob.categoryName}`,
          `₹${newJob.offeredPricePerWorker}/worker at ${newJob.workLocation?.address || 'Worksite'}`,
          'job'
        );
      }
    };

    window.addEventListener('manpowerlink_new_job_broadcast', handleNewJobBroadcast);

    // 2. Real-time Chat message listener from Employer
    const handleChatMessage = (e: any) => {
      if (!isAuthenticated) return;
      const msg = e.detail as ChatMessage;
      if (!msg) return;
      if (msg.recipientRole === 'employee') {
        playNotificationSound();
        showRealAppPush(
          `💬 ${msg.senderName} (${msg.orderNumber || 'Shift'})`,
          msg.text,
          'system'
        );
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    window.addEventListener('manpowerlink_chat_message', handleChatMessage);

    // 3. Real-time Firebase notification subscription
    const unsubscribeFirebase = subscribeToFirebaseNotifications(
      'employee',
      currentWorker.id,
      (notif) => {
        if (!isAuthenticated || !isOnline) return;
        playNotificationSound();
        showRealAppPush(
          notif.title,
          notif.message,
          notif.eventType === 'BOOKING_CREATED' ? 'job' : 'system'
        );
      }
    );

    // 4. Storage subscription watcher for NEW job broadcasts (ONLY for jobs created during active session)
    const unsubscribeStorage = dataService.subscribe(() => {
      if (!isAuthenticated || !isOnline) return;
      const all = dataService.getBookings();
      const newest = all[0];
      if (
        newest &&
        (newest.status === 'SEARCHING_EMPLOYEES' || newest.status === 'CONFIRMED') &&
        !seenBookingIds.current.has(newest.id)
      ) {
        seenBookingIds.current.add(newest.id);
        setIncomingJobAlert(newest);
        // Swiggy style gentle chime notification and top banner
        playNotificationSound();
        showRealAppPush(
          `⚡ New Shift Posted: ${newest.categoryName}`,
          `₹${newest.offeredPricePerWorker}/worker • ${newest.workLocation?.address || 'Industrial Zone'}`,
          'job'
        );
      }
    });

    return () => {
      window.removeEventListener('manpowerlink_new_job_broadcast', handleNewJobBroadcast);
      window.removeEventListener('manpowerlink_chat_message', handleChatMessage);
      unsubscribeFirebase();
      unsubscribeStorage();
    };
  }, [isAuthenticated, isOnline, currentWorker.id]);

  const isBelowMinBalance = walletBalance < minWorkerWalletBalance;

  const handleOpenChatForBooking = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    setActiveTab('messages');
    setIncomingJobAlert(null);
    setViewingWorkDetails(null);
    setIsRinging(false);
  };


  const handleAcceptIncomingJob = () => {
    if (!incomingJobAlert) return;
    if (isBelowMinBalance) {
      alert(`Minimum wallet balance required: ₹${minWorkerWalletBalance}. Your current balance is ₹${walletBalance}. Please recharge your wallet to accept shift requests.`);
      setShowRechargeModal(true);
      return;
    }
    setIsRinging(false);

    const updatedAssigned = [
      ...incomingJobAlert.assignedWorkers,
      {
        workerId: currentWorker.id,
        workerName: currentWorker.name,
        workerPhone: currentWorker.phone,
        workerAvatar: currentWorker.avatar,
        agreedRate: incomingJobAlert.offeredPricePerWorker,
        status: 'travelling' as const,
      },
    ];

    const updatedBooking: Booking = {
      ...incomingJobAlert,
      assignedWorkers: updatedAssigned,
      acceptedWorkersCount: updatedAssigned.length,
      status: 'EMPLOYEES_TRAVELLING',
      updatedAt: new Date().toLocaleString(),
    };

    dataService.updateBooking(updatedBooking);
    setSelectedBookingId(updatedBooking.id);
    setIncomingJobAlert(null);
    setActiveTab('my-work');

    dataService.addNotification({
      recipientId: updatedBooking.customerId,
      recipientRole: 'customer',
      title: 'Worker In Transit to Worksite',
      message: `${currentWorker.name} accepted ${updatedBooking.orderNumber} and is currently travelling to ${updatedBooking.workLocation.address}.`,
      eventType: 'BID_ACCEPTED',
      bookingId: updatedBooking.id,
      orderNumber: updatedBooking.orderNumber,
      read: false,
      timestamp: new Date().toLocaleString(),
      soundType: 'chime',
    });

    triggerAppRingAlert(`Shift accepted! You are now travelling to ${incomingJobAlert.workLocation.address}`);
  };

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

  // Messaging State synced with real-time storage
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return dataService.getChatMessages();
  });
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

  const handleWorkerSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!signUpName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!signUpPhone.trim() || signUpPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!signUpTermsAccepted) {
      setAuthError('You must accept the Terms of Service & Privacy Policy to register.');
      return;
    }
    if (signUpPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
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
      triggerAppRingAlert(`Welcome ${signUpName}! Worker profile registered & duty radar online.`);
    }, 600);
  };

  const handleDeleteAccount = () => {
    setIsDeletingAccount(true);
    setTimeout(() => {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
      setIsAuthenticated(false);
      setAuthScreen('sign-in');
      setAuthError('Your worker account and associated telemetry data have been permanently purged.');
    }, 800);
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

  // Dedicated Worker Withdrawal (Instant Payout to UPI / Bank Account)
  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 100) {
      triggerAppRingAlert('Minimum withdrawal amount is ₹100.');
      return;
    }
    if (withdrawAmount > walletBalance) {
      triggerAppRingAlert(`Insufficient balance! Available: ₹${walletBalance.toLocaleString()}`);
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      const utr = `IMPS/${Date.now().toString().slice(-8)}`;
      const destination = withdrawMethod === 'upi' ? `UPI: ${withdrawUpiId}` : `${withdrawBankName} (...${withdrawAccountNo.slice(-4)})`;

      dataService.createPayoutRequest({
        requesterId: currentWorker.id,
        requesterName: currentWorker.name,
        requesterRole: 'employee',
        requesterPhone: currentWorker.phone,
        beneficiaryUpiId: withdrawMethod === 'upi' ? withdrawUpiId : `${withdrawBankName} - ${withdrawAccountNo} (${withdrawIfsc})`,
        amount: withdrawAmount,
        adminNote: `Worker withdrawal via ${withdrawMethod.toUpperCase()} (Instant IMPS)`,
      });

      const newBal = Math.max(0, walletBalance - withdrawAmount);
      setWalletBalance(newBal);
      currentWorker.walletBalance = newBal;

      const newRecord = {
        id: `wth-${Date.now().toString().slice(-6)}`,
        amount: withdrawAmount,
        method: destination,
        utr,
        status: 'Completed',
        date: 'Just now',
      };
      setWithdrawalHistory((prev) => [newRecord, ...prev]);

      setIsWithdrawing(false);
      setWithdrawalSuccessReceipt({
        utr,
        amount: withdrawAmount,
        destination,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      triggerAppRingAlert(`₹${withdrawAmount.toLocaleString()} withdrawn successfully! UTR: ${utr}`);
    }, 500);
  };

  // Status Actions with Confirmation Dialogs
  const promptAcceptJob = (booking: Booking) => {
    if (isBelowMinBalance) {
      alert(`Minimum wallet balance required: ₹${minWorkerWalletBalance}. Your current balance is ₹${walletBalance}. Please recharge your wallet to accept job requests.`);
      setShowRechargeModal(true);
      return;
    }

    setPendingConfirmAction({
      title: 'Confirm Shift Acceptance',
      description: `Accept ${booking.orderNumber} (${booking.jobTitle || booking.categoryName}) for ₹${booking.offeredPricePerWorker}? Employer will pay online via platform.`,
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
      alert('Please enter the 4-digit Start OTP spoken by the employer.');
      return;
    }

    setPendingConfirmAction({
      title: 'Confirm Work Attendance Check-in',
      description: `Verify Start OTP at ${currentGpsLocation.address}? Your shift timer and live GPS attendance will be activated.`,
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
      alert('Please enter the 4-digit End OTP spoken by the employer.');
      return;
    }

    const wage = selectedBooking.offeredPricePerWorker || 2000;
    const fee = Math.round(wage * 0.1);

    setPendingConfirmAction({
      title: 'Confirm Shift Completion',
      description: `Verify End OTP? Employer pays ₹${wage} online via platform. Wage will be credited after platform fee of ₹${fee} deduction.`,
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
          triggerAppRingAlert(`Shift Complete! Shift payout of ₹${wage} processed online.`);
        }
      },
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const targetBooking = bookings.find((b) => b.id === selectedBookingId) || selectedBooking || bookings[0];
    const newMsg = dataService.sendChatMessage({
      bookingId: targetBooking?.id || 'b-1',
      orderNumber: targetBooking?.orderNumber || 'Order #1045',
      sender: 'worker',
      senderName: currentWorker.name || 'Ramesh Kumar',
      recipientRole: 'customer',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    setInputMessage('');
    triggerAppRingAlert('Message delivered to employer with push notification.');
  };

  const isStandalone = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('standalone') === 'true' ||
    window.location.hash.includes('employee') ||
    window.innerWidth <= 640
  );

  return (
    <div className={`flex flex-col items-center w-full h-full max-h-[100dvh] overflow-hidden ${isStandalone ? 'p-0' : ''}`}>
      {/* Mobile Device Frame */}
      <div className={
        isStandalone
          ? "w-full h-full h-[100dvh] max-h-[100dvh] bg-[#FFFDF8] flex flex-col relative overflow-hidden select-none"
          : "w-full max-w-md sm:w-[410px] h-screen sm:h-[820px] max-h-[100dvh] bg-[#1E1F23] sm:rounded-[44px] p-0 sm:p-2.5 shadow-2xl sm:border-4 border-[#202124]/40 flex flex-col relative overflow-hidden select-none"
      }>
        {/* Notch (only in desktop preview mockup) */}
        {!isStandalone && (
          <div className="hidden sm:flex w-36 h-4 bg-black rounded-full mx-auto mb-1.5 shrink-0 items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
          </div>
        )}

        {/* Screen Canvas */}
        <div className={`flex-1 min-h-0 bg-[#F8FAFC] ${isStandalone ? 'rounded-none' : 'sm:rounded-[36px]'} overflow-hidden flex flex-col relative text-[#202124]`}>
          {/* Real App Push Notification Dropdown (Swiggy / Zomato Style) */}
          {pushBanner && (
            <div className="absolute top-2 left-2 right-2 z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
              <div
                onClick={() => {
                  if (pushBanner.type === 'system' || pushBanner.title.includes('Message') || pushBanner.message.includes('Message')) {
                    setActiveTab('messages');
                  } else if (pushBanner.type === 'job') {
                    setActiveTab('find-jobs');
                  }
                  setPushBanner(null);
                }}
                className="bg-[#1E1F23]/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-[#FFC928]/40 flex items-start gap-3 cursor-pointer hover:bg-[#1E1F23] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D71920] to-[#A80F18] border border-[#FFC928] flex items-center justify-center shrink-0 shadow-md">
                  <Bell className="w-4 h-4 text-[#FFC928] animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#FFC928] uppercase tracking-wider">
                      {branding.appName || 'ManPowerLink'} Partner
                    </span>
                    <span className="text-[9px] text-white/50">{pushBanner.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">{pushBanner.title}</h4>
                  <p className="text-[11px] text-white/80 line-clamp-2 leading-snug mt-0.5">{pushBanner.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushBanner(null)}
                  className="text-white/40 hover:text-white p-1 text-xs shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Active Audio / Ring Notification Toast */}
          {activeAlertToast && (
            <div className="absolute top-2 left-3 right-3 z-50 bg-[#D71920] text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <span className="flex-1">{activeAlertToast}</span>
            </div>
          )}

          {/* Delete Account Modal (Google Play Store Compliance) */}
          {showDeleteAccountModal && (
            <div className="absolute inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-xs w-full space-y-3.5 border border-red-200">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#D71920] flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-black text-slate-900">Delete Account &amp; Purge Data</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    In compliance with Google Play Store User Data Policies, this will permanently delete your worker profile, shift history, KYC documents, and earnings balance. This action cannot be undone.
                  </p>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 text-[11px] text-[#A80F18] font-semibold">
                  ⚠️ Any remaining balance (₹{walletBalance.toLocaleString()}) should be withdrawn before proceeding.
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccountModal(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingAccount}
                    onClick={handleDeleteAccount}
                    className="py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isDeletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>{isDeletingAccount ? 'Purging...' : 'Delete Permanently'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Privacy Policy Modal (Google Play Store Compliance) */}
          {showTermsModal && (
            <div className="absolute inset-0 bg-black/75 z-50 flex items-center justify-center p-3">
              <div className="bg-white rounded-3xl p-4 shadow-2xl max-w-sm w-full space-y-3 border border-slate-200 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#D71920]" />
                    <h4 className="text-xs font-black text-slate-900">Terms of Service &amp; Privacy Policy</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto text-[11px] text-slate-600 space-y-2.5 pr-1 leading-relaxed">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">Play Store Compliance Summary</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Last updated: October 2026 • Verified for Google Play Developer Distribution Agreement</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">1. Background Location &amp; Worksite Radar</h5>
                    <p>When you go "Online", the app accesses your device GPS coordinates to match you with nearby job dispatches within your service radius and verify worksite attendance check-in via OTP.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">2. Fair Labor &amp; Transparent Wages</h5>
                    <p>All shifts specify fixed or hourly rates clearly upfront. Daily wages are settled directly between employer and worker at the completion of work upon Start/End OTP verification.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">3. User Data Privacy &amp; Encryption</h5>
                    <p>Your phone number, identification documents, and bank details are encrypted in transit via SSL/TLS. We never sell your personal contact information to third parties.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">4. Right to Account &amp; Data Deletion</h5>
                    <p>You have full authority to permanently delete your account, KYC records, and telemetry at any time via Profile &gt; Delete Account.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  I Understand &amp; Agree
                </button>
              </div>
            </div>
          )}

          {/* Incoming Job Broadcast & Ringing Alert Modal */}
          {incomingJobAlert && (
            <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-xs w-full space-y-3.5 border-4 border-[#D71920] relative overflow-hidden">
                {/* Flashing ringing badge header */}
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D71920] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#FFC928] animate-ping" />
                    🚨 INCOMING JOB RADAR
                  </span>
                  <span className="text-[10px] font-mono text-[#D71920] font-bold flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span>RINGING</span>
                  </span>
                </div>

                {/* Job Details */}
                <div className="space-y-1 text-center">
                  <span className="text-[10px] text-slate-500 font-mono font-bold block">
                    {incomingJobAlert.orderNumber} • {incomingJobAlert.zoneName || 'Baikampady Zone'}
                  </span>
                  <h3 className="text-sm font-black text-[#202124] leading-snug">
                    {incomingJobAlert.jobTitle || incomingJobAlert.categoryName}
                  </h3>
                  <div className="inline-block py-1 px-3 rounded-xl bg-amber-50 border border-amber-300 my-1">
                    <span className="text-xl font-black text-[#D71920]">
                      ₹{incomingJobAlert.offeredPricePerWorker.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold block">
                      Per Worker (Paid Online by Employer)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[#202124] font-bold text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-[#D71920] shrink-0" />
                    <span className="truncate">{incomingJobAlert.workLocation.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Shift Timing:</span>
                    <span className="font-bold text-[#202124]">
                      {incomingJobAlert.startTime} – {incomingJobAlert.endTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Slots Needed:</span>
                    <span className="font-bold text-[#D71920]">
                      {incomingJobAlert.acceptedWorkersCount} / {incomingJobAlert.requiredWorkers} Workers
                    </span>
                  </div>
                </div>

                {/* Accept, View Details, Chat & Decline Buttons */}
                <div className="space-y-2 pt-1">
                  {isBelowMinBalance && (
                    <div className="p-2 bg-red-50 border border-red-300 rounded-xl text-[10px] text-[#D71920] font-bold text-center">
                      ⚠️ Balance (₹{walletBalance}) is below min (₹{minWorkerWalletBalance}). Recharge required.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setViewingWorkDetails(incomingJobAlert);
                        setIsRinging(false);
                      }}
                      className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-[#202124] font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D71920]" />
                      <span>View Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenChatForBooking(incomingJobAlert)}
                      className="py-2.5 px-2 bg-amber-100 hover:bg-amber-200 text-[#202124] font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 border border-amber-300 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#D71920]" />
                      <span>Chat First</span>
                    </button>
                  </div>

                  {isBelowMinBalance ? (
                    <button
                      type="button"
                      onClick={() => setShowRechargeModal(true)}
                      className="w-full py-3 bg-[#D71920] hover:bg-[#A80F18] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-[#FFC928]" />
                      <span>RECHARGE TO ACCEPT (Min ₹{minWorkerWalletBalance})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAcceptIncomingJob}
                      className="w-full py-3 bg-[#16834A] hover:bg-[#126b3c] text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#FFC928]" />
                      <span>ACCEPT JOB &amp; START TRANSIT</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIncomingJobAlert(null);
                      setIsRinging(false);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Decline Shift
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full Work Details Modal Before Accepting Shift */}
          {viewingWorkDetails && (
            <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl max-h-[92%] w-full max-w-sm flex flex-col overflow-hidden shadow-2xl border-2 border-slate-200">
                {/* Header */}
                <div className="p-4 bg-linear-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#FFC928] font-bold block">
                      {viewingWorkDetails.orderNumber} • WORK DETAILS
                    </span>
                    <h3 className="text-sm font-black text-white leading-snug">
                      {viewingWorkDetails.jobTitle || viewingWorkDetails.categoryName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingWorkDetails(null)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs text-[#202124]">
                  {/* Employer Info */}
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                    <span className="text-[10px] text-[#A80F18] font-bold uppercase tracking-wider block">Employer / Client</span>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">{viewingWorkDetails.customerName || 'Verified Corporate Client'}</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Financial & Wage Breakdown */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-semibold">Shift Payout per Worker:</span>
                      <span className="text-base font-black text-emerald-700">₹{viewingWorkDetails.offeredPricePerWorker}</span>
                    </div>
                    <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-600" />
                      <span>Payment Method: Paid Online by Employer via Platform</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#686868] pt-1 border-t border-slate-200">
                      <span>Platform Commission:</span>
                      <span className="font-bold text-[#D71920]">-₹{Math.round(viewingWorkDetails.offeredPricePerWorker * 0.1)}</span>
                    </div>
                  </div>

                  {/* Worksite Location & Distance */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                      Worksite Location:
                    </span>
                    <p className="font-bold text-xs text-[#202124]">{viewingWorkDetails.workLocation.address}</p>
                    <span className="text-[10px] text-[#686868] block">Geofenced GPS arrival check required at gate.</span>
                  </div>

                  {/* Timing & Slots */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Shift Hours:</span>
                      <span className="font-bold text-slate-800">{viewingWorkDetails.startTime} – {viewingWorkDetails.endTime}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">Slots Needed:</span>
                      <span className="font-bold text-[#D71920]">{viewingWorkDetails.acceptedWorkersCount} / {viewingWorkDetails.requiredWorkers} Workers</span>
                    </div>
                  </div>

                  {/* Employer Remarks & Instructions */}
                  {(viewingWorkDetails.remarks || viewingWorkDetails.specialInstructions) && (
                    <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 space-y-1">
                      <span className="text-[10px] text-[#D71920] font-bold flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Employer Special Instructions:
                      </span>
                      <p className="text-[11px] text-slate-700 leading-snug">
                        {viewingWorkDetails.remarks || viewingWorkDetails.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* OTP Notice */}
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-900 leading-tight flex items-start gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>OTP Procedure:</strong> Employer will verbally provide the 4-digit Start OTP when you reach the worksite.
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenChatForBooking(viewingWorkDetails)}
                      className="py-2.5 bg-amber-100 hover:bg-amber-200 text-[#202124] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-amber-300 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#D71920]" />
                      <span>Chat with Employer</span>
                    </button>

                    {isBelowMinBalance ? (
                      <button
                        type="button"
                        onClick={() => {
                          setViewingWorkDetails(null);
                          setShowRechargeModal(true);
                        }}
                        className="py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-[11px] rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                      >
                        Recharge to Accept
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          promptAcceptJob(viewingWorkDetails);
                          setViewingWorkDetails(null);
                        }}
                        className="py-2.5 bg-[#16834A] hover:bg-[#126b3c] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928]" />
                        <span>Accept Shift</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingWorkDetails(null)}
                    className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold text-center cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>
              </div>
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
          {/* A. UNAUTHENTICATED SCREENS (SIGN IN / SIGN UP)            */}
          {/* ========================================================== */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col bg-[#FFFDF8] overflow-y-auto p-5">
              <div className="text-center mt-3 mb-4">
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
                  Partner / Worker App
                </p>
                <p className="text-xs text-[#686868] mt-0.5">
                  Verified Shifts, Daily Wage Payouts &amp; Worksite Radar
                </p>
              </div>

              {authError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-[#C62828]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authScreen === 'sign-in' ? (
                /* SIGN IN VIEW */
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#202124]">Password</label>
                        <span className="text-[10px] text-slate-400 font-medium">Default: Worker@2026</span>
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#686868] cursor-pointer"
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
                      {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      <span>Sign In to Worker Account</span>
                    </button>
                  </div>

                  <div className="pt-4 text-center border-t border-slate-100 space-y-2">
                    <p className="text-xs text-[#686868]">
                      New worker or trade specialist?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthScreen('sign-up');
                        }}
                        className="font-bold text-[#D71920] hover:underline cursor-pointer"
                      >
                        Register New Profile
                      </button>
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="hover:underline text-slate-500"
                      >
                        Terms &amp; Privacy Policy
                      </button>
                      <span>•</span>
                      <span>Google Play Compliant</span>
                    </div>
                  </div>
                </form>
              ) : (
                /* INTERACTIVE SIGN UP VIEW FOR WORKERS */
                <form onSubmit={handleWorkerSignUp} className="space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">Full Legal Name (as per Aadhaar)</label>
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Suresh Gowda"
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
                          placeholder="+91 98800 12345"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-1">Primary Skill Trade</label>
                        <select
                          value={signUpCategory}
                          onChange={(e) => setSignUpCategory(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        >
                          <option value="Loading & Unloading">Loading & Unloading</option>
                          <option value="Construction & Masonry">Construction & Masonry</option>
                          <option value="Event Setup & Catering">Event Setup & Catering</option>
                          <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                          <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1">City / Base Hub</label>
                      <input
                        type="text"
                        required
                        value={signUpCity}
                        onChange={(e) => setSignUpCity(e.target.value)}
                        placeholder="e.g. Mangalore, Karnataka"
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
                          placeholder="Min 6 chars"
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
                          placeholder="Repeat password"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>

                    {/* Terms & Conditions Checkbox (Google Play Policy Compliance) */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="workerTerms"
                        checked={signUpTermsAccepted}
                        onChange={(e) => setSignUpTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-[#D71920] focus:ring-[#D71920]"
                      />
                      <label htmlFor="workerTerms" className="text-[10px] text-slate-600 leading-tight">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#D71920] font-bold hover:underline"
                        >
                          Terms of Service &amp; Privacy Policy
                        </button>
                        , including GPS worksite tracking while on duty.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer mt-1 flex items-center justify-center gap-2"
                    >
                      {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>Register Partner Profile</span>
                    </button>
                  </div>

                  <div className="pt-3 text-center border-t border-slate-100">
                    <p className="text-xs text-[#686868]">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthScreen('sign-in');
                        }}
                        className="font-bold text-[#D71920] hover:underline cursor-pointer"
                      >
                        Sign In Here
                      </button>
                    </p>
                  </div>
                </form>
              )}
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
                    onClick={() => {
                      setWithdrawAmount(Math.min(walletBalance, 2000));
                      setShowWithdrawModal(true);
                    }}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-[#FFC928] border border-[#FFC928]/30 px-2 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs"
                    title="Tap to Withdraw Earnings"
                  >
                    <Wallet className="w-3 h-3 text-[#FFC928]" />
                    <span>₹{walletBalance.toLocaleString()}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isOnline
                        ? 'bg-[#FFC928] text-[#202124]'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Screen Content Body - Strictly contained between header and bottom bar */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain pb-6">
                {/* 1. HOME TAB - COMMERCIAL PARTNER REDESIGN */}
                {activeTab === 'home' && (
                  <div className="space-y-3.5">
                    {/* Minimum Wallet Balance Alert Banner */}
                    {isBelowMinBalance && (
                      <div className="p-3 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-[#D71920] shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-[#D71920] block">Minimum Wallet Balance Required</span>
                            <span className="text-[10px] text-slate-600 block">
                              Balance (₹{walletBalance}) is below required min (₹{minWorkerWalletBalance}). Recharge to receive shift requests.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowRechargeModal(true)}
                          className="px-2.5 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-[10px] font-black rounded-xl shrink-0 cursor-pointer shadow-xs"
                        >
                          Recharge
                        </button>
                      </div>
                    )}

                    {/* A. Tactile Partner Duty Status Card */}
                    <div className={`p-4 rounded-3xl transition-all border shadow-md relative overflow-hidden ${
                      isOnline
                        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-[#FFC928]/40 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded-full ${
                            isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                          }`} />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">
                              {isOnline ? 'DUTY RADAR ACTIVE' : 'WORKER STATUS'}
                            </span>
                            <h3 className="text-sm font-black tracking-tight">
                              {isOnline ? 'Online • Accepting Shifts' : 'Offline • Duty Paused'}
                            </h3>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsOnline(!isOnline)}
                          className={`px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                            isOnline
                              ? 'bg-[#FFC928] text-[#202124] hover:bg-amber-400'
                              : 'bg-slate-800 text-white hover:bg-slate-900'
                          }`}
                        >
                          <span>{isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-[#FFC928] shrink-0" />
                          <span className="truncate max-w-[210px] text-[10px]">{currentGpsLocation.address}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-[#FFC928] shrink-0">
                          Radar: 15 km
                        </span>
                      </div>
                    </div>

                    {/* B. 3-Part Partner Earnings Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Today</span>
                        <span className="text-sm font-black text-[#202124] block">₹2,200</span>
                        <span className="text-[9px] font-semibold text-emerald-600 block">1 Shift Done</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">This Week</span>
                        <span className="text-sm font-black text-[#202124] block">₹11,400</span>
                        <span className="text-[9px] font-semibold text-emerald-600 block">5 Shifts</span>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80 shadow-2xs text-center space-y-0.5">
                        <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wide block">Wallet</span>
                        <span className="text-sm font-black text-[#D71920] block">₹{walletBalance.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-slate-600 block">Available</span>
                      </div>
                    </div>

                    {/* C. Quick Payout Withdrawal Card */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-3.5 rounded-2xl text-white flex items-center justify-between border border-slate-700 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#FFC928]/20 text-[#FFC928] flex items-center justify-center shrink-0">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Instant Payout Available</span>
                          <span className="text-xs font-black text-[#FFC928]">₹{walletBalance.toLocaleString()} in Wages</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawAmount(Math.min(walletBalance, 2000));
                            setShowWithdrawModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-[11px] font-black rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>Withdraw</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPassbookModal(true)}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                          title="Passbook"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#FFC928]" />
                        </button>
                      </div>
                    </div>

                    {/* D. Today's Confirmed Shift Action Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#D71920] bg-red-50 border border-red-200 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] animate-pulse" />
                          Active Shift Today
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {selectedBooking?.orderNumber || 'MPL-2026-101'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {selectedBooking?.jobTitle || selectedBooking?.categoryName || 'Warehouse Loading & Offloading'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D71920] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{selectedBooking?.workLocation?.address || 'Baikampady Industrial Estate, Mangalore'}</span>
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Shift Payout</span>
                          <span className="text-sm font-black text-[#D71920]">
                            ₹{selectedBooking?.offeredPricePerWorker || 2200} <span className="text-[10px] text-slate-600 font-semibold">(Direct Cash / UPI)</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold">Shift Timing</span>
                          <span className="text-xs font-bold text-slate-800">
                            {selectedBooking?.startTime || '08:30 AM'} – {selectedBooking?.endTime || '05:30 PM'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Chat with Employer & Start OTP */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenChatForBooking(selectedBooking)}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#D71920]" />
                          <span>Chat with Employer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('my-work')}
                          className="py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928]" />
                          <span>Start OTP Check-In →</span>
                        </button>
                      </div>
                    </div>

                    {/* E. Quick Action Shortcuts */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('find-jobs')}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left shadow-2xs flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center shrink-0">
                          <Search className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Nearby Shifts</span>
                          <span className="text-[10px] text-slate-400">{bookings.length} jobs available</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left shadow-2xs flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Safety &amp; Policies</span>
                          <span className="text-[10px] text-slate-400">Play Store Verified</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. FIND JOBS TAB */}
                {activeTab === 'find-jobs' && (
                  <div className="space-y-3">
                    {/* Minimum Wallet Balance Alert Banner */}
                    {isBelowMinBalance && (
                      <div className="p-3 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-[#D71920] shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-[#D71920] block">Minimum Wallet Balance Required</span>
                            <span className="text-[10px] text-slate-600 block">
                              Balance (₹{walletBalance}) is below required min (₹{minWorkerWalletBalance}). Recharge to accept shift requests.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowRechargeModal(true)}
                          className="px-2.5 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-[10px] font-black rounded-xl shrink-0 cursor-pointer shadow-xs"
                        >
                          Recharge
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-[#202124] uppercase tracking-wider">
                        Available Job Radar ({bookings.length} nearby)
                      </h3>
                      <span className="text-[10px] font-bold text-[#A80F18] bg-[#FFC928]/25 px-2 py-0.5 rounded-md">
                        Radius: 15 km
                      </span>
                    </div>

                    {bookings.map((b) => {
                      const lower = (b.categoryName || '').toLowerCase();
                      const banner = lower.includes('cater') || lower.includes('food')
                        ? 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80'
                        : lower.includes('construct') || lower.includes('mason')
                        ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
                        : lower.includes('clean')
                        ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
                        : lower.includes('event')
                        ? 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'
                        : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';

                      return (
                        <div
                          key={b.id}
                          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all space-y-2.5 p-3"
                        >
                          {/* Photo Banner Header */}
                          <div className="relative h-24 rounded-2xl overflow-hidden -mx-0.5 -mt-0.5">
                            <img
                              src={banner}
                              alt={b.categoryName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                            
                            {/* Top Badges */}
                            <div className="absolute top-2 inset-x-2.5 flex items-center justify-between">
                              <span className="font-mono font-bold text-[10px] text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                {b.orderNumber}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#FFC928] text-[#202124] shadow-xs">
                                {b.durationType.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>

                            {/* Bottom Wage Pill on Banner */}
                            <div className="absolute bottom-2 inset-x-2.5 flex items-end justify-between">
                              <div>
                                <span className="text-white text-xs font-black block leading-tight drop-shadow-sm">
                                  {b.jobTitle || b.categoryName}
                                </span>
                              </div>
                              <div className="bg-[#D71920] text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-md border border-[#FFC928]/50">
                                ₹{b.offeredPricePerWorker}/worker
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] text-[#686868] mt-0.5 flex items-center gap-1 font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-[#D71920] shrink-0" />
                              <span className="truncate">{b.workLocation.address}</span>
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

                        {/* Actions: View Details, Chat, Accept */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setViewingWorkDetails(b)}
                            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-[#202124] text-[11px] font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#D71920]" />
                            <span>Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenChatForBooking(b)}
                            className="py-2.5 bg-amber-100 hover:bg-amber-200 text-[#202124] text-[11px] font-bold rounded-xl border border-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#D71920]" />
                            <span>Chat</span>
                          </button>
                          {isBelowMinBalance ? (
                            <button
                              type="button"
                              onClick={() => setShowRechargeModal(true)}
                              className="py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-[10px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                            >
                              Recharge
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => promptAcceptJob(b)}
                              className="py-2.5 bg-[#16834A] hover:bg-[#126b3c] text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928]" />
                              <span>Accept</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

                      {/* 2. Step 1: Start OTP (Spoken by Employer) */}
                      <div className="bg-amber-50/50 p-3.5 rounded-2xl border-2 border-[#FFC928]/90 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#D71920]" />
                            <span>Step 1: Verify Start OTP</span>
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                            Spoken by Employer
                          </span>
                        </div>
                        <p className="text-[10px] text-[#686868]">
                          Ask the worksite employer for their 4-digit Start OTP to begin shift:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={startOtpInput}
                            onChange={(e) => setStartOtpInput(e.target.value)}
                            placeholder="Enter 4-digit OTP"
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

                      {/* 4. Step 2: End OTP (Spoken by Employer) */}
                      <div className="bg-amber-50/50 p-3.5 rounded-2xl border-2 border-[#FFC928]/90 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FFC928]" />
                            <span>Step 2: Collect Wage & End OTP</span>
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                            Spoken by Employer
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-[#202124]">
                            <span>Shift Wage Payout:</span>
                            <span className="text-emerald-700 font-black">₹{selectedBooking?.offeredPricePerWorker || 2000}</span>
                          </div>
                          <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                            <span>● Paid Online by Employer via Platform Escrow</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-[#686868] pt-0.5 border-t border-amber-100">
                            <span>Platform Commission (debited from wallet):</span>
                            <span className="text-[#D71920] font-bold">-₹{Math.round((selectedBooking?.offeredPricePerWorker || 2000) * 0.1)}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#686868]">
                          Ask the worksite employer for the 4-digit End OTP upon satisfactory work completion:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={endOtpInput}
                            onChange={(e) => setEndOtpInput(e.target.value)}
                            placeholder="Enter 4-digit OTP"
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
                  <div className="h-full flex flex-col space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FFC928] text-[#202124] font-bold flex items-center justify-center text-xs">
                          {(selectedBooking?.customerName || 'AL').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#202124]">{selectedBooking?.customerName || 'Apex Logistics (Employer)'}</h4>
                          <span className="text-[10px] text-[#D71920] flex items-center gap-1 font-semibold">
                            ● {selectedBooking?.orderNumber || 'Order #1045'} ({selectedBooking?.categoryName || 'Shift'})
                          </span>
                        </div>
                      </div>
                      {/* If this worker has not yet accepted this shift, show pre-acceptance action */}
                      {selectedBooking && !selectedBooking.assignedWorkers.some(w => w.workerId === currentWorker.id) && (
                        isBelowMinBalance ? (
                          <button
                            type="button"
                            onClick={() => setShowRechargeModal(true)}
                            className="px-2 py-1 bg-[#D71920] text-white text-[10px] font-bold rounded-lg shadow-xs hover:bg-[#A80F18] cursor-pointer"
                          >
                            Recharge to Accept
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => promptAcceptJob(selectedBooking)}
                            className="px-2.5 py-1 bg-[#16834A] text-white text-[10px] font-bold rounded-lg shadow-xs hover:bg-[#126b3c] cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#FFC928]" />
                            <span>Accept (₹{selectedBooking.offeredPricePerWorker})</span>
                          </button>
                        )
                      )}
                    </div>

                    {/* Pre-acceptance help notice */}
                    {selectedBooking && !selectedBooking.assignedWorkers.some(w => w.workerId === currentWorker.id) && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 flex items-center justify-between">
                        <span>💬 Chat with employer before accepting shift. Ask about reporting gate, PPE or tools.</span>
                      </div>
                    )}

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

                    {/* Quick inquiry chips */}
                    <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setInputMessage('What specific PPE gear or tools are required on site?')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#202124] text-[10px] rounded-lg shrink-0 font-medium cursor-pointer"
                      >
                        PPE / Tools required?
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMessage('Which specific gate or supervisor should I report to?')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#202124] text-[10px] rounded-lg shrink-0 font-medium cursor-pointer"
                      >
                        Reporting gate?
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMessage('Can you confirm lunch/tea break timings?')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#202124] text-[10px] rounded-lg shrink-0 font-medium cursor-pointer"
                      >
                        Break timings?
                      </button>
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-1.5 pt-0.5">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type message to employer..."
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white rounded-xl cursor-pointer"
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

                    {/* Bank & UPI Payout Wallet Card */}
                    <div className="bg-linear-to-br from-[#1E1F23] to-[#2D3039] p-4 rounded-3xl text-white shadow-md space-y-3 border border-[#FFC928]/25">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-[#FFC928]" />
                          <span>Payout Wallet Balance</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                          Active & Verified
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-[#FFC928]">₹{walletBalance.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawAmount(Math.min(walletBalance, 2000));
                            setShowWithdrawModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>Withdraw Funds</span>
                        </button>
                      </div>
                    </div>

                    {/* Linked Bank & Payout Methods */}
                    <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#D71920]" />
                          <span>Linked Bank Account (IMPS/NEFT)</span>
                        </h5>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Primary
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#686868]">Bank:</span>
                          <span className="font-bold text-[#202124]">{withdrawBankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686868]">Account No:</span>
                          <span className="font-mono font-bold text-[#202124]">••••••••{withdrawAccountNo.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686868]">IFSC Code:</span>
                          <span className="font-mono font-semibold text-slate-700">{withdrawIfsc}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686868]">Account Holder:</span>
                          <span className="font-bold text-[#202124]">{withdrawAccountName}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-[#686868]">Linked UPI ID:</span>
                        <span className="font-mono font-bold text-[#D71920]">{withdrawUpiId}</span>
                      </div>
                    </div>

                    {/* Passbook History Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassbookModal(true)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#202124] text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-[#D71920]" />
                      <span>View Payout Passbook &amp; Transaction History</span>
                    </button>

                    {/* Google Play Store Compliance: Terms & Privacy Policy */}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Terms of Service &amp; Privacy Policy</span>
                    </button>

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-slate-500" />
                      <span>Sign Out from Worker App</span>
                    </button>

                    {/* Google Play Store Compliance: Delete Account & Purge Data */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="w-full py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Delete Account &amp; Purge Personal Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FIXED 5-TAB BOTTOM BAR (STRICTLY PINNED, NEVER SCROLLS OR FADES) */}
              <div className="h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around shrink-0 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] select-none">
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

              {/* ========================================================== */}
              {/* WORKER WITHDRAWAL MODAL ("WITHDRAWAL OF AMOUNT FOR WORKER") */}
              {/* ========================================================== */}
              {showWithdrawModal && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-xs z-50 flex flex-col justify-end p-0 animate-in fade-in duration-150">
                  <div className="bg-white w-full rounded-t-3xl max-h-[92%] overflow-y-auto p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-red-100 text-[#D71920] flex items-center justify-center">
                          <ArrowDownToLine className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#202124]">Withdraw Earnings</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Instant transfer to Bank or UPI</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWithdrawModal(false)}
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Available Balance Banner */}
                    <div className="bg-linear-to-r from-slate-900 to-slate-800 p-3.5 rounded-2xl text-white flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-white/60 block font-semibold uppercase">Withdrawable Balance</span>
                        <span className="text-xl font-black text-[#FFC928]">₹{walletBalance.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          0% Fee (Free)
                        </span>
                      </div>
                    </div>

                    {/* Payout Destination Selector (UPI or Bank Account) */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-1.5">
                        Choose Payout Destination
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('upi')}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col ${
                            withdrawMethod === 'upi'
                              ? 'border-[#D71920] bg-red-50/50 shadow-xs ring-1 ring-[#D71920]'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-[#202124]">UPI ID</span>
                            {withdrawMethod === 'upi' && <Check className="w-3.5 h-3.5 text-[#D71920]" />}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">GPay, PhonePe, Paytm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('bank')}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col ${
                            withdrawMethod === 'bank'
                              ? 'border-[#D71920] bg-red-50/50 shadow-xs ring-1 ring-[#D71920]'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-[#202124]">Bank Account</span>
                            {withdrawMethod === 'bank' && <Check className="w-3.5 h-3.5 text-[#D71920]" />}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Instant IMPS / NEFT</span>
                        </button>
                      </div>
                    </div>

                    {/* Method Details */}
                    {withdrawMethod === 'upi' ? (
                      <div>
                        <label className="block text-[10px] font-bold text-[#202124] mb-1">
                          Beneficiary UPI VPA
                        </label>
                        <input
                          type="text"
                          value={withdrawUpiId}
                          onChange={(e) => setWithdrawUpiId(e.target.value)}
                          placeholder="e.g. 9876543210@upi"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Verified Name: <strong>{withdrawAccountName}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Bank Name</label>
                            <input
                              type="text"
                              value={withdrawBankName}
                              onChange={(e) => setWithdrawBankName(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#202124] mb-0.5">IFSC Code</label>
                            <input
                              type="text"
                              value={withdrawIfsc}
                              onChange={(e) => setWithdrawIfsc(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Account Number</label>
                          <input
                            type="text"
                            value={withdrawAccountNo}
                            onChange={(e) => setWithdrawAccountNo(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Amount to Withdraw & Quick Preset Chips */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#202124]">Withdrawal Amount (₹)</label>
                        <span className="text-[10px] text-slate-500 font-semibold">Min: ₹100</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                        <input
                          type="number"
                          step={100}
                          min={100}
                          max={walletBalance}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 text-base font-black text-[#D71920] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>

                      {/* Quick Amount Chips */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[500, 1000, 2000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setWithdrawAmount(Math.min(amt, walletBalance))}
                            className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              withdrawAmount === amt
                                ? 'bg-[#FFC928] text-[#202124] border-[#FFC928]'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(walletBalance)}
                          className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            withdrawAmount === walletBalance
                              ? 'bg-[#D71920] text-white border-[#D71920]'
                              : 'bg-red-50 text-[#D71920] border-red-200 hover:bg-red-100'
                          }`}
                        >
                          All (₹{walletBalance})
                        </button>
                      </div>
                    </div>

                    {/* Instant IMPS Settlement Assurance Box */}
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-emerald-800 text-[10px] font-medium">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant payout: credited directly to your account in 5-15 minutes via IMPS rail.</span>
                    </div>

                    <button
                      type="button"
                      disabled={isWithdrawing || withdrawAmount < 100 || withdrawAmount > walletBalance}
                      onClick={handleExecuteWithdrawal}
                      className="w-full py-3 bg-[#D71920] hover:bg-[#A80F18] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      {isWithdrawing ? (
                        <span>Processing Instant Payout...</span>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-4 h-4" />
                          <span>Confirm &amp; Withdraw ₹{withdrawAmount.toLocaleString()}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* WITHDRAWAL SUCCESS RECEIPT MODAL */}
              {/* ========================================================== */}
              {withdrawalSuccessReceipt && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-xs w-full space-y-3.5 border border-slate-200 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCheck className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#202124]">Withdrawal Submitted!</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Funds are on their way to your account</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount:</span>
                        <span className="font-black text-[#D71920]">₹{withdrawalSuccessReceipt.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Destination:</span>
                        <span className="font-semibold text-slate-800">{withdrawalSuccessReceipt.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">UTR / Ref:</span>
                        <span className="font-mono font-bold text-slate-700">{withdrawalSuccessReceipt.utr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="text-emerald-600 font-bold">Completed (IMPS Instant)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">New Balance:</span>
                        <span className="font-black text-[#202124]">₹{walletBalance.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawalSuccessReceipt(null);
                        setShowWithdrawModal(false);
                      }}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* PASSBOOK & PAYOUT HISTORY MODAL */}
              {/* ========================================================== */}
              {showPassbookModal && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-xs z-50 flex flex-col justify-end p-0 animate-in fade-in duration-150">
                  <div className="bg-white w-full rounded-t-3xl max-h-[88%] overflow-y-auto p-5 shadow-2xl space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-[#D71920]" />
                        <h4 className="text-sm font-black text-[#202124]">Worker Passbook &amp; Payouts</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassbookModal(false)}
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Summary Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Available Balance</span>
                        <span className="text-lg font-black text-[#D71920]">₹{walletBalance.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Total Lifetime Earnings</span>
                        <span className="text-lg font-black text-slate-800">₹28,400</span>
                      </div>
                    </div>

                    {/* List of Recent Withdrawals */}
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Recent Payouts &amp; Withdrawals
                      </h5>
                      <div className="space-y-2">
                        {withdrawalHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#202124]">{item.method}</span>
                                <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                                  {item.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block">Ref: {item.utr}</span>
                              <span className="text-[10px] text-slate-400 block">{item.date}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-[#D71920] block">
                                -₹{item.amount.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-500">IMPS Settled</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPassbookModal(false);
                        setShowWithdrawModal(true);
                      }}
                      className="w-full py-2.5 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Request New Withdrawal</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
