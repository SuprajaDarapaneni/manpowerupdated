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
  Layers,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown,
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
  Upload,
  Image,
  Trash2,
  Loader2,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Booking, ServiceCategory, Worker, StatusTimelineNode, Customer, ChatMessage } from '../../types';
import {
  dataService,
  playNotificationSound,
  playIncomingJobRingtone,
  PLATFORM_UPI_ID,
  PLATFORM_UPI_NAME,
  getUpiIntentUrl,
} from '../../services/storage';
import { EmbeddedLocationFetcher } from '../Common/EmbeddedLocationFetcher';
import { savePaymentProofToFirebase, subscribeToFirebaseNotifications } from '../../services/firebase';
import { BookingWizard } from '../../apps/customer/BookingWizard';
import { NotificationCenterModal } from '../Common/NotificationCenterModal';
import { RealtimeChatView } from '../Common/RealtimeChatView';
import { DirectOnlinePaymentModal } from '../Common/DirectOnlinePaymentModal';

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
  // Branding State
  const [branding, setBranding] = useState(() => dataService.getBrandingSettings());

  useEffect(() => {
    return dataService.subscribe(() => {
      setBranding(dataService.getBrandingSettings());
      const c = dataService.getCustomer('c-1');
      if (c) {
        setCustomer(c);
        setWalletBalance(c.walletBalance ?? 0);
      }
    });
  }, []);

  // Authentication State - Defaults to signed in for seamless production experience, remembers session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('manpower_customer_auth');
    return stored !== null ? stored === 'true' : true;
  });
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

  // Play Store Compliance State (Terms, Privacy Policy, Account Deletion)
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Notification & Real-Time Chat & Direct Payment Modals
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showDirectOnlinePaymentModal, setShowDirectOnlinePaymentModal] = useState(false);
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(() => {
    return dataService.getUnreadNotificationsCount('customer', 'c-1');
  });

  // Real App Top Push Notification Banner (Zomato / Swiggy Style)
  const [pushBanner, setPushBanner] = useState<{
    title: string;
    message: string;
    timestamp: string;
    type?: 'order' | 'payment' | 'system';
    bookingId?: string;
    actionTab?: string;
  } | null>(null);

  // Proactive Push Notification Permission & Token Binding on App Open
  const [notificationPermissionPrompt, setNotificationPermissionPrompt] = useState(false);
  const [pushTokenBound, setPushTokenBound] = useState<boolean>(() => {
    return !!dataService.getBoundNotificationToken('c-1');
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        dataService.bindNotificationToken('c-1', 'customer').then(() => {
          setPushTokenBound(true);
        });
      } else if (Notification.permission === 'default') {
        const dismissed = sessionStorage.getItem('manpower_customer_notif_prompt_dismissed');
        if (!dismissed) {
          const timer = setTimeout(() => {
            setNotificationPermissionPrompt(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    } else {
      dataService.bindNotificationToken('c-1', 'customer').then(() => {
        setPushTokenBound(true);
      });
    }
  }, [isAuthenticated]);

  // Authentic Payment Gateway Recharge States
  const [rechargeMethod, setRechargeMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'phonepe' | 'gpay' | 'paytm' | 'bhim'>('phonepe');
  const [isProcessingRecharge, setIsProcessingRecharge] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [utrValidationError, setUtrValidationError] = useState<string | null>(null);

  // Service Zone Selection
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const serviceZones = dataService.getServiceZones();

  // Post Job Form State: Pricing Model (Hourly vs Full Package)
  const [pricingModel, setPricingModel] = useState<'hourly' | 'full_package'>('hourly');
  const [jobTitle, setJobTitle] = useState('Loading and moving boxes');
  const [jobLocation, setJobLocation] = useState('Live GPS Worksite Pin (12.9141° N, 74.8560° E), Industrial Zone, Mangalore');
  const [isGpsAutoFilled, setIsGpsAutoFilled] = useState(true);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>({ lat: 12.9141, lng: 74.8560 });

  const autoDetectGps = () => {
    setIsDetectingGps(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsCoordinates({ lat, lng });
          setJobLocation(`Live GPS Pin (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E), Industrial Zone, Mangalore`);
          setIsGpsAutoFilled(true);
          setIsDetectingGps(false);
        },
        () => {
          setGpsCoordinates({ lat: 12.9141, lng: 74.8560 });
          setJobLocation('Live GPS Worksite Pin (12.9141° N, 74.8560° E), Industrial Zone, Mangalore');
          setIsGpsAutoFilled(true);
          setIsDetectingGps(false);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setGpsCoordinates({ lat: 12.9141, lng: 74.8560 });
      setJobLocation('Live GPS Worksite Pin (12.9141° N, 74.8560° E), Industrial Zone, Mangalore');
      setIsGpsAutoFilled(true);
      setIsDetectingGps(false);
    }
  };

  useEffect(() => {
    autoDetectGps();
  }, []);

  // Job Capacity & Headcount
  const [requiredWorkers, setRequiredWorkers] = useState<number>(3);

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

  // Step-by-Step Booking Wizard State (1: Location -> 2: Category -> 3: Workers -> 4: Work Type -> 5: Date/Time -> 6: Price & Post)
  const [bookingWizardStep, setBookingWizardStep] = useState<number>(1);
  const [isFetchingLocationCategories, setIsFetchingLocationCategories] = useState(false);

  // Address Picker Modal State
  const [showAddressPickerModal, setShowAddressPickerModal] = useState(false);

  // Payment Selection: Defaults to 'upi_qr' as requested by client (UPI & QR Code with Screenshot Upload)
  const [paymentSelection, setPaymentSelection] = useState<'wallet' | 'upi_qr' | 'cash'>('upi_qr');
  const [showDirectQrPaymentModal, setShowDirectQrPaymentModal] = useState(false);
  const [directPaymentUtr, setDirectPaymentUtr] = useState('');

  // Auto-switch away from cash if category requires online payment only
  useEffect(() => {
    if (selectedCategory?.requiresOnlinePaymentOnly && paymentSelection === 'cash') {
      setPaymentSelection('upi_qr');
    }
  }, [selectedCategory, paymentSelection]);

  // Payment Proof Screenshot Upload State
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string | null>(null);
  const [upiRefNumber, setUpiRefNumber] = useState<string>('');

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

  const showRealAppPush = (
    title: string,
    message: string,
    type: 'order' | 'payment' | 'system' = 'order',
    bookingId?: string,
    actionTab?: string
  ) => {
    if (!isAuthenticated) return;
    playNotificationSound();
    setPushBanner({
      title,
      message,
      timestamp: 'Just now',
      type,
      bookingId,
      actionTab,
    });
    setTimeout(() => {
      setPushBanner((curr) => (curr?.title === title ? null : curr));
    }, 6000);
  };

  const triggerAppRingAlert = (message: string) => {
    if (!isAuthenticated) return;
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

  // Messaging State synced with real-time storage
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return dataService.getChatMessages();
  });
  const [inputMessage, setInputMessage] = useState('');

  // Sync wallet balance on data changes
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      const c = dataService.getCustomer('c-1');
      if (c) {
        setCustomer(c);
        setWalletBalance(c.walletBalance ?? 12500);
      }
      setUnreadNotifCount(dataService.getUnreadNotificationsCount('customer', 'c-1'));
    });
    return unsubscribe;
  }, []);

  // Real-time Chat message & In-App Notification listeners
  useEffect(() => {
    // 1. Chat message listener
    const handleChatMessage = (e: any) => {
      if (!isAuthenticated) return;
      const msg = e.detail as ChatMessage;
      if (!msg) return;
      if (msg.recipientRole === 'customer') {
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
        setUnreadNotifCount(dataService.getUnreadNotificationsCount('customer', 'c-1'));
      }
    };

    // 2. Centralized In-App & Push Notification Event listener
    const handleNotificationDispatched = (e: any) => {
      const notif = e.detail;
      if (!notif) return;
      if (notif.recipientRole === 'customer' || notif.recipientRole === 'all') {
        if (!notif.recipientId || notif.recipientId === 'all' || notif.recipientId === 'c-1') {
          if (notif.soundType === 'urgent_ring') {
            playIncomingJobRingtone();
          } else {
            playNotificationSound();
          }
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate([100, 50, 100]); } catch {}
          }
          showRealAppPush(
            notif.title,
            notif.message,
            notif.category === 'payment' ? 'payment' : notif.category === 'chat' ? 'system' : 'order',
            notif.bookingId,
            notif.actionTab
          );
          setUnreadNotifCount(dataService.getUnreadNotificationsCount('customer', 'c-1'));
        }
      }
    };

    window.addEventListener('manpowerlink_chat_message', handleChatMessage);
    window.addEventListener('manpowerlink_notification_dispatched', handleNotificationDispatched);

    // 3. Real-Time Firebase Firestore listener
    const unsubscribeFirebase = subscribeToFirebaseNotifications('customer', 'c-1', (notif) => {
      if (notif.soundType === 'urgent_ring') {
        playIncomingJobRingtone();
      } else {
        playNotificationSound();
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([100, 50, 100]); } catch {}
      }
      showRealAppPush(
        notif.title,
        notif.message,
        notif.eventType?.includes('PAYMENT') ? 'payment' : 'order',
        notif.bookingId,
        notif.actionTab
      );
      setUnreadNotifCount(dataService.getUnreadNotificationsCount('customer', 'c-1'));
    });

    // 4. Reactive storage subscriber for immediate badge count sync
    const unsubscribeStorage = dataService.subscribe(() => {
      setUnreadNotifCount(dataService.getUnreadNotificationsCount('customer', 'c-1'));
    });

    return () => {
      window.removeEventListener('manpowerlink_chat_message', handleChatMessage);
      window.removeEventListener('manpowerlink_notification_dispatched', handleNotificationDispatched);
      unsubscribeFirebase();
      unsubscribeStorage();
    };
  }, [isAuthenticated]);

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
        localStorage.setItem('manpower_customer_auth', 'true');
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
      localStorage.setItem('manpower_customer_auth', 'true');
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
        localStorage.setItem('manpower_customer_auth', 'false');
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

  // Authentic Multi-Method Payment Gateway Recharge
  const handleVerifyAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    setUtrValidationError(null);
    if (addMoneyAmount < 100) {
      setUtrValidationError('Minimum recharge amount is ₹100.');
      return;
    }

    if (rechargeMethod === 'upi') {
      const cleanUtr = addMoneyUtr.trim();
      if (!cleanUtr || cleanUtr.length < 8) {
        setUtrValidationError('Please enter a valid 12-digit UPI Reference / UTR Number from your PhonePe/GPay receipt.');
        return;
      }
      setIsProcessingRecharge(true);
      setTimeout(() => {
        setIsProcessingRecharge(false);
        const result = dataService.rechargeCustomerWallet('c-1', addMoneyAmount, `UPI/${cleanUtr}`);
        if (result.success) {
          setWalletBalance(result.newBalance);
          setShowAddMoneyModal(false);
          setAddMoneyUtr('');
          showRealAppPush(
            'Wallet Recharged Successfully',
            `₹${addMoneyAmount.toLocaleString()} credited via UPI (UTR: ${cleanUtr}). New balance: ₹${result.newBalance.toLocaleString()}`,
            'payment'
          );
        }
      }, 700);
    } else if (rechargeMethod === 'card') {
      setIsProcessingRecharge(true);
      setTimeout(() => {
        setIsProcessingRecharge(false);
        const cardRef = `CARD-${Date.now().toString().slice(-6)}`;
        const result = dataService.rechargeCustomerWallet('c-1', addMoneyAmount, cardRef);
        if (result.success) {
          setWalletBalance(result.newBalance);
          setShowAddMoneyModal(false);
          showRealAppPush(
            'Card Payment Successful',
            `₹${addMoneyAmount.toLocaleString()} credited via Card Gateway. New balance: ₹${result.newBalance.toLocaleString()}`,
            'payment'
          );
        }
      }, 900);
    } else if (rechargeMethod === 'netbanking') {
      setIsProcessingRecharge(true);
      setTimeout(() => {
        setIsProcessingRecharge(false);
        const nbRef = `NB-${Date.now().toString().slice(-6)}`;
        const result = dataService.rechargeCustomerWallet('c-1', addMoneyAmount, nbRef);
        if (result.success) {
          setWalletBalance(result.newBalance);
          setShowAddMoneyModal(false);
          showRealAppPush(
            'Net Banking Top-up Successful',
            `₹${addMoneyAmount.toLocaleString()} credited via ${selectedBank}. New balance: ₹${result.newBalance.toLocaleString()}`,
            'payment'
          );
        }
      }, 900);
    }
  };

  const handleDeleteAccount = () => {
    setIsDeletingAccount(true);
    setTimeout(() => {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
      setIsAuthenticated(false);
      localStorage.setItem('manpower_customer_auth', 'false');
      setAuthScreen('sign-in');
      setAuthError('Your employer account and all company telemetry data have been permanently erased.');
    }, 800);
  };

  // Direct PhonePe QR Order Payment Handler
  const handleDirectQrPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDirectQrPaymentModal(false);
    executePublishJob(directPaymentUtr || `UPI/QR-${Date.now().toString().slice(-6)}`);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPaymentScreenshotUrl(reader.result);
        triggerAppRingAlert(`Payment screenshot "${file.name}" ready for verification!`);
      }
    };
    reader.readAsDataURL(file);
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

    // Derive city dynamically from jobLocation
    let derivedCity = 'Karnataka, India';
    const locLower = (jobLocation || '').toLowerCase();
    if (locLower.includes('bangalore') || locLower.includes('bengaluru')) {
      derivedCity = 'Bengaluru, Karnataka';
    } else if (locLower.includes('udupi')) {
      derivedCity = 'Udupi, Karnataka';
    } else if (locLower.includes('mangalore')) {
      derivedCity = 'Mangalore, Karnataka';
    } else if (locLower.includes('mysore')) {
      derivedCity = 'Mysore, Karnataka';
    } else if (locLower.includes('mumbai')) {
      derivedCity = 'Mumbai, Maharashtra';
    }

    setPendingConfirmAction({
      title: 'Confirm Job Order Broadcast',
      description: `Broadcast "${jobTitle}" for ${requiredWorkers} workers (Total: ₹${totalEstimatedCost.toLocaleString()}) to nearby workers? Payment is settled at the end of work upon End-OTP verification.`,
      onConfirm: () => {
        setPendingConfirmAction(null);
        executePublishJob(upiRefNumber || directPaymentUtr);
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

    const finalUpiRef = upiRef || upiRefNumber.trim() || `UPI/POST-${Date.now().toString().slice(-6)}`;

    // Derive city dynamically from jobLocation
    let derivedCity = 'Karnataka, India';
    const locLower = (jobLocation || '').toLowerCase();
    if (locLower.includes('bangalore') || locLower.includes('bengaluru')) {
      derivedCity = 'Bengaluru, Karnataka';
    } else if (locLower.includes('udupi')) {
      derivedCity = 'Udupi, Karnataka';
    } else if (locLower.includes('mangalore')) {
      derivedCity = 'Mangalore, Karnataka';
    } else if (locLower.includes('mysore')) {
      derivedCity = 'Mysore, Karnataka';
    } else if (locLower.includes('mumbai')) {
      derivedCity = 'Mumbai, Maharashtra';
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
      paymentProofScreenshot: paymentScreenshotUrl || undefined,
      paymentVerificationStatus: 'pending', // Settled at end of work
      walletDebited,
      upiTransactionRef: paymentSelection === 'upi_qr' ? finalUpiRef : undefined,
      zoneId: selectedZoneId,
      zoneName: serviceZones.find((z) => z.id === selectedZoneId)?.name || 'Local Worksite Area',
      workLocation: {
        address: jobLocation || 'Selected Worksite Location',
        city: derivedCity,
        lat: gpsCoordinates ? gpsCoordinates.lat : 12.9716,
        lng: gpsCoordinates ? gpsCoordinates.lng : 77.5946,
      },
    });

    if (paymentScreenshotUrl) {
      savePaymentProofToFirebase({
        bookingId: newBooking.id,
        orderNumber: newBooking.orderNumber,
        customerId: newBooking.customerId,
        customerName: newBooking.customerName,
        amount: newBooking.totalEstimatedAmount,
        payeeUpiId: PLATFORM_UPI_ID,
        utrRef: finalUpiRef,
        screenshotUrl: paymentScreenshotUrl,
      }).catch((err) => console.warn('Firebase payment proof sync warning:', err));
    }

    // Dispatch broadcast event for Employee simulator to ring and open incoming modal
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('manpowerlink_new_job_broadcast', { detail: newBooking })
      );
    }
    playIncomingJobRingtone();

    setActiveBookingId(newBooking.id);
    setSelectedBookingForTimeline(newBooking);
    navigateToTab('bookings');
    triggerAppRingAlert(
      paymentScreenshotUrl
        ? `🔔 Order #${newBooking.orderNumber} Submitted! Payment screenshot submitted. Awaiting Admin verification.`
        : walletDebited
        ? `🔔 Order #${newBooking.orderNumber} Booked! ₹${totalEstimatedCost.toLocaleString()} debited from wallet.`
        : `🔔 Order #${newBooking.orderNumber} Published! Workers notified & radar ringing.`
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const targetBooking = selectedBookingForTimeline || activeBooking || bookings[0];
    const newMsg = dataService.sendChatMessage({
      bookingId: targetBooking?.id || 'b-1',
      orderNumber: targetBooking?.orderNumber || 'Order #1045',
      sender: 'customer',
      senderName: customer?.name || 'Apex Logistics Corp',
      recipientRole: 'employee',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    setInputMessage('');
    triggerAppRingAlert('Message delivered to worker with push notification.');
  };

  const isStandalone = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('standalone') === 'true' ||
    window.location.hash.includes('customer') ||
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
        {/* Notch / Dynamic Island (only in desktop preview mockup) */}
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
                  const t = (pushBanner.title || '').toLowerCase();
                  const m = (pushBanner.message || '').toLowerCase();
                  let destTab: CustomerTab = 'home';
                  let destName = 'Home';

                  if (pushBanner.actionTab === 'messages' || pushBanner.type === 'system' || t.includes('message') || m.includes('message') || t.includes('chat')) {
                    if (pushBanner.bookingId) setActiveChatBookingId(pushBanner.bookingId);
                    destTab = 'messages';
                    destName = 'Realtime Chat';
                  } else if (pushBanner.actionTab === 'profile' || pushBanner.type === 'payment' || t.includes('wallet') || t.includes('payment') || t.includes('payout') || t.includes('upi') || m.includes('upi')) {
                    destTab = 'profile';
                    destName = 'Prepaid Wallet & Payments';
                  } else if (pushBanner.actionTab === 'home' || t.includes('dispatch') || t.includes('offer') || t.includes('monsoon') || t.includes('manpower')) {
                    destTab = 'home';
                    destName = 'Post Job / Labor Radar';
                  } else {
                    if (pushBanner.bookingId) {
                      setActiveBookingId(pushBanner.bookingId);
                      const target = bookings.find((b) => b.id === pushBanner.bookingId);
                      if (target) setSelectedBookingForTimeline(target);
                    }
                    destTab = 'bookings';
                    destName = 'Active Bookings';
                  }

                  if (!isAuthenticated) {
                    setIsAuthenticated(true);
                    localStorage.setItem('manpower_customer_auth', 'true');
                  }
                  navigateToTab(destTab);
                  triggerAppRingAlert(`➔ Opened ${destName}`);
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
                      {branding.appName || 'ManPowerLink'} Dispatch
                    </span>
                    <span className="text-[9px] text-white/50">{pushBanner.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">{pushBanner.title}</h4>
                  <p className="text-[11px] text-white/80 line-clamp-2 leading-snug mt-0.5">{pushBanner.message}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-emerald-400">
                      Tap to open ➔
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPushBanner(null);
                  }}
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

          {/* Proactive Notification Permission Prompt (On App Open) */}
          {notificationPermissionPrompt && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border-2 border-[#FFC928] text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D71920] to-[#FFC928] mx-auto flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Bell className="w-7 h-7 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#202124]">Allow Push Notifications?</h3>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                    Stay updated in real time with instant shift alerts, worker GPS radar arrival, attendance OTP verification, and payment receipts.
                  </p>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-2.5 text-[10px] text-amber-900 border border-amber-200/60 flex items-center gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time delivery for vital worksite operations only. No spam.</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setNotificationPermissionPrompt(false);
                      sessionStorage.setItem('manpower_customer_notif_prompt_dismissed', 'true');
                      try {
                        await dataService.requestPushPermissionAndBind('c-1', 'customer');
                        setPushTokenBound(true);
                        dataService.addNotification({
                          recipientId: 'c-1',
                          recipientRole: 'customer',
                          title: '🔔 Push Notifications Active',
                          message: 'Push alerts & device token bound successfully. Real-time worksite and worker updates are active.',
                          eventType: 'SYSTEM_ALERT',
                          category: 'announcement',
                          actionTab: 'bookings',
                          read: false,
                        });
                        triggerAppRingAlert('✅ Notifications Allowed & Device Token Bound!');
                      } catch (e) {
                        console.warn(e);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D71920] to-[#E62E05] text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Allow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationPermissionPrompt(false);
                      sessionStorage.setItem('manpower_customer_notif_prompt_dismissed', 'true');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Later
                  </button>
                </div>
              </div>
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
                  <h4 className="text-sm font-black text-slate-900">Delete Employer Account</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Under Google Play User Data policies, this will permanently purge your business profile, booking records, worksite coordinates, and invoice history.
                  </p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-semibold">
                  Remaining Wallet Balance: ₹{walletBalance.toLocaleString()}
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
                    <span>{isDeletingAccount ? 'Purging...' : 'Delete Account'}</span>
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
                    <p className="font-bold text-slate-800">Play Store Compliance Disclosure</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Updated October 2026 • Compliant with Google Play Developer Policies</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">1. Worksite Location Usage</h5>
                    <p>When you post a job, the app tags the worksite GPS coordinates to match and guide verified workers directly to your job site and enable Start-OTP attendance validation.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">2. Transparent Payments &amp; Settlement</h5>
                    <p>Payments for completed shifts are settled upon End-OTP verification. Prepaid wallet balances can be topped up via UPI, Card, or Net Banking and can be withdrawn or refunded upon request.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">3. Data Protection &amp; SSL Encryption</h5>
                    <p>All sensitive information, invoices, and transaction references are transmitted securely using industry-standard SSL encryption. We do not sell user data to advertising brokers.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">4. Right to Account &amp; Data Deletion</h5>
                    <p>Users may permanently delete their account and associated company data at any time via Profile &gt; Delete Account.</p>
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

          {/* Add Money via Multi-Method Secure Payment Gateway */}
          {showAddMoneyModal && (
            <div className="absolute inset-0 bg-black/75 z-50 flex items-center justify-center p-3 animate-fade-in">
              <div className="bg-white rounded-3xl p-4 shadow-2xl max-w-xs w-full space-y-3 border border-slate-200 max-h-[92%] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[#D71920] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      ₹
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#202124]">Wallet Recharge Gateway</h4>
                      <p className="text-[10px] text-slate-500">Secure 256-bit Encrypted Checkout</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMoneyModal(false);
                      setUtrValidationError(null);
                    }}
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
                        onClick={() => {
                          setAddMoneyAmount(amt);
                          setUtrValidationError(null);
                        }}
                        className={`py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                          addMoneyAmount === amt
                            ? 'bg-[#D71920] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        +₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#D71920]">₹</span>
                    <input
                      type="number"
                      step={100}
                      min={100}
                      value={addMoneyAmount}
                      onChange={(e) => {
                        setAddMoneyAmount(Math.max(100, Number(e.target.value)));
                        setUtrValidationError(null);
                      }}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#202124] focus:outline-none focus:border-[#D71920]"
                      placeholder="Custom amount"
                    />
                  </div>
                </div>

                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Payment Mode</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setRechargeMethod('upi');
                        setUtrValidationError(null);
                      }}
                      className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        rechargeMethod === 'upi' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>UPI / QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRechargeMethod('card');
                        setUtrValidationError(null);
                      }}
                      className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        rechargeMethod === 'card' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRechargeMethod('netbanking');
                        setUtrValidationError(null);
                      }}
                      className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        rechargeMethod === 'netbanking' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600 hover:text-black'
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      <span>NetBanking</span>
                    </button>
                  </div>
                </div>

                {/* Validation Error banner */}
                {utrValidationError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-1.5 text-[11px] text-[#C62828] font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{utrValidationError}</span>
                  </div>
                )}

                {/* METHOD 1: UPI / QR */}
                {rechargeMethod === 'upi' && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleOpenUpiApp(addMoneyAmount)}
                      className="w-full py-2 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-[11px] font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#FFC928]" />
                      <span>Launch PhonePe / GPay &amp; Pay ₹{addMoneyAmount.toLocaleString()}</span>
                    </button>

                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center space-y-1.5">
                      <div className="inline-flex items-center gap-1 bg-[#5f259f] text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                        <span>PhonePe</span>
                        <span className="text-[#FFC928]">★</span>
                        <span>ACCEPTED HERE</span>
                      </div>

                      <div
                        onClick={() => handleOpenUpiApp(addMoneyAmount)}
                        className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border-2 border-[#5f259f] shadow-2xs flex items-center justify-center relative cursor-pointer"
                        title="Click to launch PhonePe / UPI App"
                      >
                        <img
                          src="/phonepe-qr.svg"
                          alt="PhonePe QR Code - prnm@kotak"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="text-center">
                        <span className="text-[11px] font-black text-[#202124] block">{PLATFORM_UPI_NAME} .</span>
                      </div>

                      <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="text-left">
                          <span className="text-[8px] text-slate-400 block font-bold uppercase">Official UPI ID</span>
                          <span className="font-mono font-black text-[#5f259f] text-[10px]">{PLATFORM_UPI_ID}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(PLATFORM_UPI_ID);
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-[#16834A]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleVerifyAddMoney} className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#202124] mb-0.5">
                          Enter 12-Digit Bank UTR / UPI Reference No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          value={addMoneyUtr}
                          onChange={(e) => {
                            setAddMoneyUtr(e.target.value.replace(/[^0-9]/g, ''));
                            setUtrValidationError(null);
                          }}
                          placeholder="e.g. 428919028371 (12 digits)"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                        />
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Check PhonePe / GPay transaction details for the 12-digit UTR
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddMoneyModal(false);
                            setUtrValidationError(null);
                          }}
                          className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isProcessingRecharge}
                          className="flex-1 py-2 text-xs font-bold text-white bg-[#D71920] hover:bg-[#A80F18] rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {isProcessingRecharge ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>{isProcessingRecharge ? 'Verifying...' : `Verify & Credit ₹${addMoneyAmount.toLocaleString()}`}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* METHOD 2: DEBIT / CREDIT CARD */}
                {rechargeMethod === 'card' && (
                  <form onSubmit={handleVerifyAddMoney} className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4532 •••• •••• 8910"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#202124] mb-0.5">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Name on Card</label>
                      <input
                        type="text"
                        required
                        placeholder="Apex Logistics Pvt Ltd"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#202124] focus:outline-none focus:border-[#D71920]"
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
                        disabled={isProcessingRecharge}
                        className="flex-1 py-2 text-xs font-bold text-white bg-[#D71920] hover:bg-[#A80F18] rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isProcessingRecharge ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{isProcessingRecharge ? 'Authorizing 3DS...' : `Pay ₹${addMoneyAmount.toLocaleString()}`}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* METHOD 3: NET BANKING */}
                {rechargeMethod === 'netbanking' && (
                  <form onSubmit={handleVerifyAddMoney} className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[#202124] mb-1">Select Bank</label>
                      <select className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#202124] font-medium focus:outline-none focus:border-[#D71920]">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                        <option>Canara Bank</option>
                        <option>Punjab National Bank</option>
                      </select>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-800">
                      You will be securely routed to your bank's Net Banking gateway to authenticate this transaction.
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
                        disabled={isProcessingRecharge}
                        className="flex-1 py-2 text-xs font-bold text-white bg-[#D71920] hover:bg-[#A80F18] rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isProcessingRecharge ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5" />
                        )}
                        <span>{isProcessingRecharge ? 'Routing to Bank...' : `Proceed ₹${addMoneyAmount.toLocaleString()}`}</span>
                      </button>
                    </div>
                  </form>
                )}
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

          {/* Worksite Address & Interactive GPS Map Picker Modal */}
          {showAddressPickerModal && (
            <div className="absolute inset-0 bg-black/75 z-50 flex items-center justify-center p-2.5">
              <div className="bg-white rounded-3xl max-w-sm w-full max-h-[95%] overflow-y-auto p-3.5 shadow-2xl border-2 border-[#FFC928]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D71920]" />
                    <h4 className="text-xs font-black text-[#202124]">Worksite Address &amp; GPS Picker</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressPickerModal(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <EmbeddedLocationFetcher
                  isEmbedded={true}
                  initialAddress={jobLocation}
                  onLocationSelected={(loc) => {
                    setJobLocation(loc.address);
                    setGpsCoordinates({ lat: loc.latitude, lng: loc.longitude });
                    setIsGpsAutoFilled(true);
                    setShowAddressPickerModal(false);
                    triggerAppRingAlert(`Location applied: ${loc.address}`);
                  }}
                />
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* A. UNAUTHENTICATED SCREENS (Sign In, Sign Up, Forgot) */}
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
                    className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-xl mx-auto shadow-md mb-2 border border-[#FFC928]"
                    style={{ backgroundColor: branding.primaryColor || '#D71920' }}
                  >
                    {branding.appName?.charAt(0) || 'M'}
                  </div>
                )}
                <h1 className="text-lg font-bold text-[#202124]">
                  {branding.appName || 'ManPowerLink'}
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

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-[10px] text-slate-500 hover:text-[#D71920] underline cursor-pointer"
                      >
                        Terms of Service &amp; Privacy Policy
                      </button>
                    </div>
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
                <form onSubmit={handleSignUp} className="space-y-2 flex-1 flex flex-col justify-between overflow-y-auto pr-1">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#202124] mb-0.5">Company / Full Name</label>
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Apex Logistics Pvt Ltd"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-0.5">Mobile (+91)</label>
                        <input
                          type="tel"
                          required
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          placeholder="99001 55432"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-0.5">City</label>
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
                      <label className="block text-[11px] font-bold text-[#202124] mb-0.5">Work Email</label>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="operations@apex.in"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-0.5">Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#202124] mb-0.5">Confirm Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#202124]/15 rounded-xl focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>

                    {/* Terms & Conditions Acceptance Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="cust-terms"
                        required
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 accent-[#D71920] cursor-pointer"
                      />
                      <label htmlFor="cust-terms" className="text-[10px] text-slate-600 leading-tight">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#D71920] font-bold underline cursor-pointer"
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#D71920] font-bold underline cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer mt-1"
                    >
                      {isAuthLoading ? 'Creating Account...' : 'Register Employer Account'}
                    </button>
                  </div>
                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAuthScreen('sign-in')}
                      className="text-xs font-bold text-[#D71920] hover:underline cursor-pointer"
                    >
                      Already have an account? Sign In
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
                    branding.mainLogoUrl ? (
                      <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={branding.mainLogoUrl} alt={branding.appName || 'Logo'} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-white text-[#D71920] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                        {branding.appName?.charAt(0) || 'M'}
                      </div>
                    )
                  )}
                  <div>
                    <h2 className="font-bold text-xs leading-tight">
                      {activeTab === 'home' && (branding.appName || 'ManPowerLink')}
                      {activeTab === 'post-job' && 'Post Job Order'}
                      {activeTab === 'bookings' && 'Orders & Live Bids'}
                      {activeTab === 'messages' && 'Worksite Chat'}
                      {activeTab === 'profile' && 'Customer Profile'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowAddressPickerModal(true)}
                      className="text-[10px] text-white/95 hover:text-white leading-tight flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded-lg transition-all cursor-pointer text-left shadow-2xs border border-white/10"
                      title="Tap to change Worksite GPS Location"
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#FFC928] shrink-0" />
                      <span className="truncate max-w-[120px] font-bold">
                        {jobLocation ? jobLocation.split(',')[0].replace('Live GPS Worksite Pin', 'Worksite Pin') : 'Mangalore Port'}
                      </span>
                      <ChevronDown className="w-2.5 h-2.5 text-[#FFC928] shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Notification Center Bell & Device Token Badge */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowNotificationCenter(true)}
                      className="relative p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer shadow-2xs border border-white/20"
                      title="Worksite & Booking Notifications"
                    >
                      <Bell className="w-3.5 h-3.5 text-[#FFC928]" />
                      {unreadNotifCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] rounded-full bg-[#FFC928] text-[#202124] text-[9px] font-black flex items-center justify-center px-0.5 border border-[#D71920]">
                          {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                        </span>
                      )}
                    </button>
                    {!pushTokenBound && (
                      <button
                        type="button"
                        onClick={() => setNotificationPermissionPrompt(true)}
                        className="text-[9px] font-black text-[#202124] bg-[#FFC928] hover:bg-[#FFE082] px-1.5 py-0.5 rounded-md cursor-pointer transition-colors shadow-2xs animate-pulse"
                        title="Click to allow real push notifications"
                      >
                        Enable
                      </button>
                    )}
                  </div>

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
                </div>
              </div>

              {/* Scrollable Screen Content Body - Strictly contained between header and bottom bar */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain pb-6">
                {/* 1. HOME TAB (EXACTLY MATCHING SCREEN 1 OF USER POSTER) */}
                {activeTab === 'home' && (
                  <div className="space-y-3.5">
                    {/* Welcome Banner */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-[#202124] flex items-center gap-1.5">
                          <span>Hello, {customer?.name ? customer.name.split(' ')[0] : 'Ravi'}</span>
                          <span>👋</span>
                        </h2>
                        <p className="text-[11px] text-slate-500 font-medium">Book Manpower for Your Work</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerAppRingAlert('Notification bell active')}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#D71920] shadow-2xs cursor-pointer relative"
                      >
                        <Bell className="w-4 h-4" />
                        <span className="w-2 h-2 rounded-full bg-[#D71920] absolute top-1.5 right-1.5 ring-2 ring-white" />
                      </button>
                    </div>

                    {/* Big Red Hero Banner with 3 Checkmarks */}
                    <div className="bg-linear-to-r from-[#D71920] via-[#C6171E] to-[#B7151B] p-4 rounded-3xl text-white shadow-md border border-[#FFC928]/40 relative overflow-hidden">
                      <div className="relative z-10 space-y-2">
                        <h3 className="text-sm font-black leading-tight max-w-[200px]">
                          Hire Temporary Workers for Any Work
                        </h3>
                        <div className="space-y-1 text-[11px] font-semibold text-amber-100">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928]" />
                            <span>Verified Workers</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928]" />
                            <span>Flexible Timing</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928]" />
                            <span>Multiple Categories</span>
                          </div>
                        </div>
                      </div>

                      {/* Hardhat / Worker illustration watermark */}
                      <div className="absolute right-2 bottom-1 text-4xl opacity-80 select-none">
                        👷‍♂️👨‍🍳
                      </div>
                    </div>

                    {/* Big Yellow Post a Job Action Card */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('post-job')}
                      className="w-full bg-linear-to-r from-[#FFC928] via-[#FFD34E] to-[#FFE082] hover:opacity-95 p-4 rounded-3xl border-2 border-amber-400 shadow-md flex items-center justify-between transition-all cursor-pointer group active:scale-98 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#D71920] text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
                          <Plus className="w-5 h-5 text-[#FFC928]" />
                        </div>
                        <div>
                          <span className="text-base font-black text-[#202124] block leading-tight">
                            Post a Job
                          </span>
                          <span className="text-[11px] text-[#A80F18] font-extrabold block">
                            Hire Workers Quick & Easy
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center text-[#202124] font-bold">
                        <ArrowRight className="w-4 h-4 text-[#D71920]" />
                      </div>
                    </button>

                    {/* 3 Quick Action Tiles: My Jobs, Calendar, Reports */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('bookings')}
                        className="p-3 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-[#FFC928] text-center transition-all cursor-pointer shadow-2xs space-y-1"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-[#D71920] mx-auto flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#202124] block leading-tight">My Jobs</span>
                        <span className="text-[10px] text-[#D71920] font-bold block">(3 Active)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('post-job')}
                        className="p-3 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-[#FFC928] text-center transition-all cursor-pointer shadow-2xs space-y-1"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#202124] block leading-tight">Calendar</span>
                        <span className="text-[10px] text-slate-400 font-medium block">Schedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerAppRingAlert('Monthly workforce reports ready for export')}
                        className="p-3 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-[#FFC928] text-center transition-all cursor-pointer shadow-2xs space-y-1"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#202124] block leading-tight">Reports</span>
                        <span className="text-[10px] text-slate-400 font-medium block">Analytics</span>
                      </button>
                    </div>

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
                          className="px-3 py-1.5 bg-[#D71920] text-white text-[11px] font-bold rounded-xl shadow-xs cursor-pointer"
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
                      <div className="grid grid-cols-2 gap-2.5">
                        {categories.slice(0, 6).map((cat) => {
                          const banner = cat.bannerUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80';
                          return (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setPricePerHourPerHead(cat.hourlyRate || Math.round(cat.fullDayRate / 8) || 250);
                                setActiveTab('post-job');
                              }}
                              className="group relative h-28 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer border border-slate-200 hover:border-[#D71920] active:scale-98 flex flex-col justify-end p-2.5"
                            >
                              {/* Background Banner Photo */}
                              <img
                                src={banner}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {/* Dark Gradient Overlay */}
                              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

                              {/* Content Info */}
                              <div className="relative z-10 space-y-0.5">
                                <span className="text-[9px] font-bold bg-[#FFC928] text-[#202124] px-1.5 py-0.5 rounded shadow-2xs inline-block">
                                  ₹{cat.fullDayRate}/day
                                </span>
                                <h4 className="text-xs font-black text-white leading-tight line-clamp-1 drop-shadow-sm">
                                  {cat.name}
                                </h4>
                                <span className="text-[9px] text-amber-200 font-semibold block">
                                  ₹{cat.hourlyRate || 250}/hr • On-Demand
                                </span>
                              </div>
                            </div>
                          );
                        })}
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

                    {/* Why Use ManPowerLink Banner (Exact Footer from User Poster) */}
                    <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-300 p-3.5 rounded-3xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#A80F18] uppercase tracking-wider">
                          Why Use ManPowerLink?
                        </span>
                        <span className="text-[9px] bg-[#FFC928] text-[#202124] px-2 py-0.5 rounded-md font-bold">
                          Quick & Easy
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#202124]">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-sm">📍</span>
                          <span>Location Based</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-sm">👥</span>
                          <span>Verified & Rated</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-sm">📅</span>
                          <span>Instant / Scheduled</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-sm">🏷️</span>
                          <span>Transparent Pricing</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-sm">🎧</span>
                          <span>In-App Chat Support</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-sm">🛡️</span>
                          <span>Secure & Reliable</span>
                        </div>
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
                            <span className="text-[10px] text-[#A80F18] font-bold block">Start OTP (Say to Worker on Arrival):</span>
                            <span className="font-mono font-black text-lg text-[#D71920] tracking-widest">
                              {selectedBookingForTimeline.startOtp}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#686868] font-semibold block">End OTP (Say upon Completion):</span>
                            <span className="font-mono font-black text-base text-[#202124] tracking-wider">{selectedBookingForTimeline.endOtp}</span>
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

                        {/* Direct Chat with Assigned Worker */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => navigateToTab('messages')}
                            className="w-full py-2 bg-[#D71920] hover:bg-[#B3141A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#FFC928]" />
                            <span>Chat with Assigned Worker ({selectedBookingForTimeline.orderNumber})</span>
                          </button>
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

                {/* 3. POST A JOB TAB - CLEAN 6-STEP SECTION TYPES (USER-FRIENDLY WIZARD) */}
                {activeTab === "post-job" && (
                  <BookingWizard
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => setSelectedCategory(cat)}
                    jobLocation={jobLocation}
                    onLocationChange={(loc) => {
                      setJobLocation(loc);
                      setIsGpsAutoFilled(false);
                    }}
                    gpsCoordinates={gpsCoordinates}
                    isGpsAutoFilled={isGpsAutoFilled}
                    isDetectingGps={isDetectingGps}
                    onAutoDetectGps={autoDetectGps}
                    onOpenAddressPicker={() => setShowAddressPickerModal(true)}
                    serviceZones={serviceZones}
                    selectedZoneId={selectedZoneId}
                    onSelectZoneId={(zId) => setSelectedZoneId(zId)}
                    jobTitle={jobTitle}
                    onChangeJobTitle={(t) => setJobTitle(t)}
                    requiredWorkers={requiredWorkers}
                    onChangeWorkers={(w) => setRequiredWorkers(w)}
                    pricingModel={pricingModel}
                    onChangePricingModel={(m) => setPricingModel(m)}
                    pricePerHourPerHead={pricePerHourPerHead}
                    onChangePricePerHour={(p) => setPricePerHourPerHead(p)}
                    shiftHours={shiftHours}
                    onChangeShiftHours={(h) => setShiftHours(h)}
                    shiftPackages={SHIFT_PACKAGES}
                    selectedPackageId={selectedPackageId}
                    onSelectPackageId={(pkgId) => setSelectedPackageId(pkgId)}
                    customPackageHours={customPackageHours}
                    onChangeCustomHours={(h) => setCustomPackageHours(h)}
                    customPackageRate={customPackageRate}
                    onChangeCustomRate={(r) => setCustomPackageRate(r)}
                    dateSelection={dateSelection}
                    onChangeDateSelection={(d) => setDateSelection(d)}
                    jobDate={jobDate}
                    onChangeJobDate={(d) => setJobDate(d)}
                    timeSlotSelection={timeSlotSelection}
                    onChangeTimeSlot={(s) => setTimeSlotSelection(s)}
                    remarks={remarks}
                    onChangeRemarks={(r) => setRemarks(r)}
                    paymentSelection={paymentSelection}
                    onChangePaymentSelection={(m) => setPaymentSelection(m)}
                    walletBalance={walletBalance}
                    totalEstimatedCost={totalEstimatedCost}
                    costPerWorker={costPerWorker}
                    platformUpiId={PLATFORM_UPI_ID}
                    paymentScreenshotUrl={paymentScreenshotUrl}
                    paymentScreenshotName={paymentScreenshotName}
                    onScreenshotUpload={handleScreenshotUpload}
                    onRemoveScreenshot={() => {
                      setPaymentScreenshotUrl(null);
                      setPaymentScreenshotName(null);
                    }}
                    upiRefNumber={upiRefNumber}
                    onChangeUpiRef={(r) => setUpiRefNumber(r)}
                    onPublishJob={promptPublishJob}
                    onAddCustomCategory={() => setShowAddCategoryModal(true)}
                    onExitWizard={() => setActiveTab('home')}
                  />
                )}

                {/* 4. MESSAGES TAB - WhatsApp-Style Real-Time Chat with Delivery Receipts & Typing */}
                {activeTab === 'messages' && (
                  <div className="h-[520px] flex flex-col -mx-4 -my-4 rounded-b-2xl overflow-hidden bg-slate-50">
                    <RealtimeChatView
                      bookingId={activeChatBookingId || 'b-1045'}
                      orderNumber="ORD-1045"
                      categoryName="Loading & Unloading"
                      currentRole="customer"
                      currentUserId={customer?.id || 'c-1'}
                      currentUserName={customer?.name || 'Apex Logistics'}
                      partnerRole="employee"
                      partnerId="w-1"
                      partnerName="Ramesh Kumar (Worker)"
                      partnerPhone="+91 98765 43210"
                      onClose={() => setActiveTab('home')}
                    />
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
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-wider">
                          <span>Wallet Transactions Ledger</span>
                          <span className="text-[9px] text-[#FFC928] font-normal">Real-Time Sync</span>
                        </div>
                        {(customer?.walletTransactions || [
                          {
                            id: 'ctx-1',
                            transactionId: 'TXN-TOP-428919',
                            type: 'credit',
                            amount: 15000,
                            comments: 'Initial Wallet Balance Top-up',
                            description: 'Wallet Top-up via PhonePe UPI QR',
                            timestamp: '14 Oct 2026, 04:30 PM',
                          },
                        ]).slice(0, 4).map((tx) => (
                          <div key={tx.id} className="p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] text-[#FFC928] font-semibold">
                                {tx.transactionId || tx.id}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                tx.type === 'credit'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {tx.type === 'credit' ? 'CREDIT' : 'DEBIT'}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                              <span className="text-white/90 text-[10px] font-medium leading-tight truncate max-w-[190px]">
                                {tx.comments || tx.description}
                              </span>
                              <span className={`font-mono font-bold text-xs shrink-0 ${
                                tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[9px] text-white/40 font-mono">
                              {tx.timestamp}
                            </div>
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

                    {/* Google Play Store Compliance & Account Governance */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Account Governance &amp; Compliance
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#D71920]" />
                          <span>Terms of Service &amp; Privacy Policy</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-left text-xs font-semibold text-[#C62828] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5 text-[#C62828]" />
                          <span>Delete Employer Account &amp; Purge Data</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C62828]/60" />
                      </button>
                    </div>

                    {/* Logout Button with Confirmation */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#202124] border border-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Customer App</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================== */}
              <div className="h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around shrink-0 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] select-none">
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

              {/* Worksite GPS & Address Picker Modal (Exact MongoRide 2-Mode Flow) */}
              {showAddressPickerModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-0 animate-in fade-in duration-150">
                  <div className="bg-white w-full rounded-t-3xl max-h-[92%] overflow-hidden shadow-2xl flex flex-col">
                    <EmbeddedLocationFetcher
                      initialAddress={jobLocation}
                      onLocationSelected={(loc) => {
                        setJobLocation(loc.address);
                        setGpsCoordinates({ lat: loc.latitude, lng: loc.longitude });
                        setIsGpsAutoFilled(true);
                        setShowAddressPickerModal(false);
                        setBookingWizardStep(2);
                        triggerAppRingAlert(`Worksite location applied: ${loc.address}`);
                      }}
                      onClose={() => setShowAddressPickerModal(false)}
                      title="Worksite Address & GPS Pin Picker"
                    />
                  </div>
                </div>
              )}

              {/* Centralized In-App & Push Notification Center Modal */}
              <NotificationCenterModal
                isOpen={showNotificationCenter}
                onClose={() => {
                  setShowNotificationCenter(false);
                  setUnreadNotifCount(dataService.getUnreadNotificationsCount('customer', customer?.id || 'c-1'));
                }}
                role="customer"
                recipientId={customer?.id || 'c-1'}
                onNavigate={(tab?: string, bookingId?: string) => {
                  if (tab === 'messages') {
                    if (bookingId) setActiveChatBookingId(bookingId);
                    setActiveTab('messages');
                  } else if (tab === 'profile' || tab === 'wallet' || tab === 'payment') {
                    setActiveTab('profile');
                  } else if (tab === 'home' || tab === 'post-job') {
                    setActiveTab('home');
                  } else {
                    if (bookingId) {
                      setActiveBookingId(bookingId);
                      const target = bookings.find((b) => b.id === bookingId);
                      if (target) setSelectedBookingForTimeline(target);
                    }
                    setActiveTab('bookings');
                  }
                }}
              />

              {/* Employer Direct Online Payment Modal to Admin Escrow */}
              <DirectOnlinePaymentModal
                isOpen={showDirectOnlinePaymentModal}
                onClose={() => setShowDirectOnlinePaymentModal(false)}
                orderNumber="ORD-1045"
                amount={10000}
                onPaymentSuccess={(details) => {
                  triggerAppRingAlert(`Direct Online Payment of ₹${details.amount} verified via ${details.method} (TX: ${details.transactionId})`);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
