export type UserRole = 'super_admin' | 'admin' | 'staff' | 'customer' | 'employee';

export type DurationType = 'full_day' | 'half_day' | 'hourly' | 'work_basis' | 'custom';

export type BookingStatus =
  | 'CREATED'
  | 'SEARCHING_EMPLOYEES'
  | 'OFFERS_SENT'
  | 'EMPLOYEES_ACCEPTING_OR_BIDDING'
  | 'REQUIRED_COUNT_REACHED'
  | 'CONFIRMED'
  | 'EMPLOYEES_TRAVELLING'
  | 'ARRIVAL_VERIFIED'
  | 'WORK_STARTED'
  | 'WORK_IN_PROGRESS'
  | 'WORK_COMPLETED'
  | 'FINAL_AMOUNT_CALCULATED'
  | 'PAYMENT_RECORDED'
  | 'SETTLEMENT_RECONCILED'
  | 'RATINGS_SUBMITTED'
  | 'ORDER_COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStatus = 'pending' | 'initiated' | 'successful' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'online' | 'wallet' | 'bank_transfer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  permissions: string[];
  status: 'active' | 'suspended';
  lastLogin: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  minPrice: number;
  maxPrice: number;
  hourlyRate: number;
  fullDayRate: number;
  halfDayRate: number;
  overtimeMultiplier: number;
  requiredSkills: string[];
  dynamicFields?: {
    isFoodTiffin?: boolean;
    morningTiffin?: boolean;
    lunch?: boolean;
    eveningTea?: boolean;
    peopleCountPrompt?: boolean;
  };
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  categoryIds: string[];
  skills: string[];
  hourlyRate: number;
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  isAvailable: boolean;
  approvalStatus: 'approved' | 'pending' | 'rejected' | 'suspended';
  approvalDecisionNote?: string;
  completedJobsCount: number;
  totalEarnings: number;
  walletBalance: number;
  walletTransactions?: {
    id: string;
    type: 'recharge' | 'fee_deduction';
    amount: number;
    description: string;
    timestamp: string;
  }[];
  category?: string;
  badge?: string;
  idProofType?: string;
  idProofNumber?: string;
  emergencyContact?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  avatar: string;
  location: {
    address: string;
    city: string;
  };
  totalBookings: number;
  status: 'active' | 'restricted' | 'suspended';
  walletBalance?: number;
  walletTransactions?: {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    timestamp: string;
    utrRef?: string;
  }[];
}

export interface UpiPayoutRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: 'employee' | 'customer';
  requesterPhone: string;
  beneficiaryUpiId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: string;
  acceptedAt?: string;
  utrNumber?: string;
  adminNote?: string;
}

export interface WorkerBid {
  id: string;
  bookingId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerRating: number;
  proposedAmount: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  note?: string;
}

export interface Booking {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  categoryId: string;
  categoryName: string;
  requiredWorkers: number;
  acceptedWorkersCount: number;
  assignedWorkers: {
    workerId: string;
    workerName: string;
    workerPhone: string;
    workerAvatar: string;
    agreedRate: number;
    status: 'assigned' | 'travelling' | 'arrived' | 'working' | 'completed';
    startOtpVerified?: boolean;
    endOtpVerified?: boolean;
    workStartTime?: string;
    workEndTime?: string;
    breaksMinutes?: number;
    overtimeHours?: number;
  }[];
  bids: WorkerBid[];
  mode: 'fixed_price' | 'bidding';
  offeredPricePerWorker: number;
  totalEstimatedAmount: number;
  finalSettlementAmount?: number;
  platformCommissionRate: number; // percentage
  platformCommissionAmount: number;
  workLocation: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationType: DurationType;
  description: string;
  specialInstructions?: string;
  remarks?: string;
  pricingModel?: 'hourly' | 'full_package';
  pricePerHourPerHead?: number;
  shiftHours?: number;
  packageApproxHours?: number;
  packageTitle?: string;
  upiTransactionRef?: string;
  walletDebited?: boolean;
  priceRevisions?: {
    revisedAt: string;
    previousPrice: number;
    newPrice: number;
    reason: string;
  }[];
  foodDetails?: {
    morningTiffin: boolean;
    lunch: boolean;
    eveningTea: boolean;
    peopleCount: number;
    servingMethod: string;
  };
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentMode?: 'cash' | 'upi' | 'wallet';
  startOtp: string;
  endOtp: string;
  jobTitle?: string;
  timelineTree?: StatusTimelineNode[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusTimelineNode {
  id: string;
  stageKey: string;
  title: string;
  description: string;
  timestamp: string;
  location?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  actor: string;
  completed: boolean;
  current?: boolean;
}

export interface CommissionSettings {
  type: 'percentage' | 'fixed';
  percentageValue: number;
  fixedValue: number;
  payer: 'customer' | 'worker' | 'split';
  taxRate: number;
}

export interface OtpVerificationSettings {
  requireStartOtp: boolean;
  requireEndOtp: boolean;
  expiryMinutes: number;
  maxAttempts: number;
  geofenceRadiusMeters: number;
  requireGpsArrival: boolean;
}

export interface MatchingSettings {
  searchRadiusKm: number;
  acceptanceTimeoutMins: number;
  notificationBatchSize: number;
  retryLimit: number;
  workerLimitPerBooking: number;
  escalationThresholdMins: number;
}

export interface PricingSettings {
  categoryOverrides: {
    categoryId: string;
    minPrice: number;
    maxPrice: number;
    hourlyRate: number;
    halfDayRate: number;
    fullDayRate: number;
    overtimeMultiplier: number;
    maxPriceIncreasePercent: number;
  }[];
}

export interface DisputeRecord {
  id: string;
  bookingId: string;
  orderNumber: string;
  reportedBy: 'customer' | 'employee';
  reporterName: string;
  againstName: string;
  reason: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'refunded';
  evidencePhotos?: string[];
  createdAt: string;
  resolutionNote?: string;
  refundAmount?: number;
}

export interface SafetyIncidentRecord {
  id: string;
  incidentNumber: string;
  bookingId?: string;
  orderNumber?: string;
  reporterName: string;
  reporterRole: 'customer' | 'employee';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  worksiteLocation: string;
  status: 'reported' | 'investigating' | 'escalated' | 'resolved';
  policeInvolved: boolean;
  resolutionSummary?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  timestamp: string;
  ipAddress: string;
}

export type AdminTab =
  | 'dashboard'
  | 'categories'
  | 'bookings'
  | 'commission'
  | 'workers'
  | 'customers'
  | 'users'
  | 'pricing'
  | 'disputes'
  | 'safety'
  | 'reports'
  | 'audit'
  | 'settings'
  | 'settings-general'
  | 'settings-branding'
  | 'settings-legal'
  | 'settings-contact'
  | 'settings-appconfig'
  | 'settings-notifications'
  | 'settings-payments'
  | 'settings-bookingrules'
  | 'settings-location'
  | 'settings-maintenance'
  | 'settings-security'
  | 'settings-audit'
  | 'preview-customer'
  | 'preview-employee'
  | 'preview-dual'
  | 'preview-handover';

export interface BrandingSettings {
  appName: string;
  companyName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  darkBgColor: string;
  mainLogoUrl: string;
  appIconUrl: string;
  splashLogoUrl: string;
  lightLogoUrl: string;
  darkLogoUrl: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  slug: string;
  documentType:
    | 'privacy_policy'
    | 'terms_conditions'
    | 'worker_terms'
    | 'customer_terms'
    | 'cancellation_refund'
    | 'payment_policy'
    | 'code_of_conduct'
    | 'safety_guidelines'
    | 'community_guidelines'
    | 'cookie_policy';
  content: string;
  status: 'draft' | 'published' | 'archived';
  version: string;
  effectiveDate: string;
  lastUpdatedDate: string;
  author: string;
  requiresExplicitConsent: boolean;
  publishedHistory: {
    version: string;
    publishedAt: string;
    publishedBy: string;
    changeSummary: string;
  }[];
}

export interface GeneralCompanySettings {
  companyName: string;
  displayName: string;
  companyEmail: string;
  supportPhone: string;
  customerSupportEmail: string;
  workerSupportEmail: string;
  businessAddress: string;
  websiteUrl: string;
  defaultCountry: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
  defaultLanguage: string;
  supportedLanguages: string[];
  timeZone: string;
  dateFormat: string;
  helpCenterUrl: string;
  registrationNumber: string;
  emergencyHotline: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface MobileAppRemoteConfig {
  appName: string;
  tagline: string;
  publicLogoUrl: string;
  customerSupportEmail: string;
  employeeSupportEmail: string;
  supportPhone: string;
  whatsappSupportUrl: string;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minCustomerAppVersion: string;
  latestCustomerAppVersion: string;
  forceCustomerUpgrade: boolean;
  minEmployeeAppVersion: string;
  latestEmployeeAppVersion: string;
  forceEmployeeUpgrade: boolean;
  forceUpdateMessage: string;
  privacyPolicyUrl: string;
  termsConditionsUrl: string;
  helpCenterUrl: string;
  availableLanguages: string[];
  featureFlags: {
    allowWorkerBidding: boolean;
    allowCustomerPriceHike: boolean;
    enableStartOtp: boolean;
    enableEndOtp: boolean;
    enableLiveLocationTracking: boolean;
    enableEmergencySos: boolean;
    enableCashPayments: boolean;
    enableInstantPayouts: boolean;
  };
  announcements: {
    id: string;
    title: string;
    message: string;
    audience: 'all' | 'customer' | 'employee';
    isActive: boolean;
    type: 'info' | 'warning' | 'critical';
  }[];
}

export interface SettingsAuditRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  section: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  ipAddress: string;
}

// Payment Controls Configuration (Client Feedback #1)
export interface PaymentMethodSetting {
  id: 'cash' | 'upi_intent' | 'upi_qr' | 'online_gateway' | 'manual_admin';
  name: string;
  description: string;
  isEnabled: boolean;
  disabledReason?: string;
  requiresAdminConfirmation?: boolean;
  icon?: string;
}

export interface PaymentControlSettings {
  methods: PaymentMethodSetting[];
  payeeUpiId: string; // e.g. 'prnm@kotak'
  payeeName: string;  // e.g. 'PRAVEEN'
  qrCodeUrl: string;
  allowCashAtWorksite: boolean;
  minRechargeAmount: number;
  maxRechargeAmount: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

// System & Mobile Notifications (Client Feedback #3 & #4)
export interface AppNotification {
  id: string;
  recipientId: string;
  recipientRole: 'customer' | 'employee' | 'admin';
  title: string;
  message: string;
  eventType:
    | 'BOOKING_CREATED'
    | 'MATCHING_STARTED'
    | 'BID_RECEIVED'
    | 'BID_ACCEPTED'
    | 'CAPACITY_REACHED'
    | 'WORKER_ARRIVED'
    | 'START_OTP_VERIFIED'
    | 'WORK_STARTED'
    | 'END_OTP_VERIFIED'
    | 'WORK_COMPLETED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_FAILED'
    | 'PAYOUT_REQUESTED'
    | 'PAYOUT_CREDITED'
    | 'PAYOUT_REJECTED'
    | 'BOOKING_CANCELLED'
    | 'PRICE_REVISED'
    | 'DISPUTE_OPENED'
    | 'DISPUTE_RESOLVED';
  bookingId?: string;
  orderNumber?: string;
  read: boolean;
  timestamp: string;
  soundType: 'chime' | 'urgent_ring' | 'silent';
  actionUrl?: string;
}

// GPS Attendance Location Stamp (Client Feedback #5)
export interface GpsLocationStamp {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
  address?: string;
  isGeofenceValid?: boolean;
  provider: 'gps' | 'network' | 'manual_fallback';
}
