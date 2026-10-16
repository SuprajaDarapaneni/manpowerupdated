import mongoose, { Schema, Document } from 'mongoose';

// 1. User & Auth Schema
export interface IUser extends Document {
  email: string;
  phone: string;
  passwordHash: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer' | 'employee';
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'staff', 'customer', 'employee'],
      default: 'customer',
      index: true,
    },
    isActive: { type: Boolean, default: true },
    mfaEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 2. Service Category Schema
export interface IServiceCategory extends Document {
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

export const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Package' },
    isActive: { type: Boolean, default: true, index: true },
    minPrice: { type: Number, required: true, default: 500 },
    maxPrice: { type: Number, required: true, default: 3500 },
    hourlyRate: { type: Number, required: true, default: 200 },
    fullDayRate: { type: Number, required: true, default: 1800 },
    halfDayRate: { type: Number, required: true, default: 950 },
    overtimeMultiplier: { type: Number, default: 1.5 },
    requiredSkills: [{ type: String }],
    dynamicFields: {
      isFoodTiffin: Boolean,
      morningTiffin: Boolean,
      lunch: Boolean,
      eveningTea: Boolean,
      peopleCountPrompt: Boolean,
    },
  },
  { timestamps: true }
);

// 3. Worker Profile Schema
export interface IWorkerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  categoryIds: mongoose.Types.ObjectId[];
  skills: string[];
  hourlyRate: number;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat] for 2dsphere
    address: string;
    city: string;
  };
  isAvailable: boolean;
  approvalStatus: 'approved' | 'pending' | 'rejected' | 'suspended';
  approvalDecisionNote?: string;
  completedJobsCount: number;
  totalEarnings: number;
  idProofType: string;
  idProofNumber: string;
  emergencyContact?: string;
}

export const WorkerProfileSchema = new Schema<IWorkerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'ServiceCategory' }],
    skills: [{ type: String }],
    hourlyRate: { type: Number, default: 200 },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [74.856, 12.914] }, // Mangalore
      address: String,
      city: String,
    },
    isAvailable: { type: Boolean, default: true, index: true },
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    approvalDecisionNote: { type: String, default: '' },
    completedJobsCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    idProofType: { type: String, default: 'Aadhaar' },
    idProofNumber: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
  },
  { timestamps: true }
);
WorkerProfileSchema.index({ 'location.coordinates': '2dsphere' });

// 4. Customer Profile Schema
export interface ICustomerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  avatar: string;
  address: string;
  city: string;
  totalBookings: number;
  status: 'active' | 'restricted' | 'suspended';
}

export const CustomerProfileSchema = new Schema<ICustomerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    companyName: { type: String, default: '' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, default: '' },
    address: { type: String, default: 'Mangalore' },
    city: { type: String, default: 'Mangalore' },
    totalBookings: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'restricted', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

// 5. Booking Schema
export interface IBooking extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone?: string;
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  requiredWorkers: number;
  acceptedWorkersCount: number;
  assignedWorkers: {
    workerId: mongoose.Types.ObjectId;
    workerName: string;
    workerPhone?: string;
    agreedRate: number;
    status: string;
    startOtpVerified: boolean;
    endOtpVerified: boolean;
    workStartTime?: string;
    workEndTime?: string;
    breaksMinutes?: number;
    overtimeHours?: number;
  }[];
  offeredPricePerWorker: number;
  totalEstimatedAmount: number;
  platformCommissionAmount: number;
  platformCommissionRate: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  startOtp: string;
  endOtp: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationType: string;
  description: string;
  specialInstructions?: string;
  priceRevisions?: {
    revisedAt: Date;
    previousPrice: number;
    newPrice: number;
    reason: string;
  }[];
  foodDetails?: {
    morningTiffin?: boolean;
    lunch?: boolean;
    eveningTea?: boolean;
    peopleCount?: number;
    servingMethod?: string;
  };
}

export const BookingSchema = new Schema<IBooking>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    categoryName: { type: String, required: true },
    requiredWorkers: { type: Number, required: true, default: 1 },
    acceptedWorkersCount: { type: Number, default: 0 },
    assignedWorkers: [
      {
        workerId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile' },
        workerName: String,
        workerPhone: String,
        agreedRate: Number,
        status: String,
        startOtpVerified: Boolean,
        endOtpVerified: Boolean,
        workStartTime: String,
        workEndTime: String,
        breaksMinutes: Number,
        overtimeHours: Number,
      },
    ],
    offeredPricePerWorker: { type: Number, required: true },
    totalEstimatedAmount: { type: Number, required: true },
    platformCommissionAmount: { type: Number, default: 0 },
    platformCommissionRate: { type: Number, default: 10 },
    status: { type: String, default: 'CREATED', index: true },
    paymentStatus: { type: String, default: 'pending', index: true },
    paymentMethod: { type: String, default: 'online' },
    startOtp: { type: String, required: true },
    endOtp: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationType: { type: String, default: 'full_day' },
    description: { type: String, required: true },
    specialInstructions: { type: String, default: '' },
    priceRevisions: [
      {
        revisedAt: { type: Date, default: Date.now },
        previousPrice: Number,
        newPrice: Number,
        reason: String,
      },
    ],
    foodDetails: {
      morningTiffin: Boolean,
      lunch: Boolean,
      eveningTea: Boolean,
      peopleCount: Number,
      servingMethod: String,
    },
  },
  { timestamps: true }
);

// 6. Commission & Settlement Schema
export interface ICommissionRule extends Document {
  type: 'percentage' | 'fixed';
  percentageValue: number;
  fixedValue: number;
  payer: 'customer' | 'worker' | 'split';
  taxRate: number;
  categoryOverrides: {
    categoryId: mongoose.Types.ObjectId;
    type: 'percentage' | 'fixed';
    value: number;
  }[];
}

export const CommissionRuleSchema = new Schema<ICommissionRule>(
  {
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    percentageValue: { type: Number, default: 10 },
    fixedValue: { type: Number, default: 50 },
    payer: { type: String, enum: ['customer', 'worker', 'split'], default: 'customer' },
    taxRate: { type: Number, default: 5 },
    categoryOverrides: [
      {
        categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory' },
        type: { type: String, enum: ['percentage', 'fixed'] },
        value: Number,
      },
    ],
  },
  { timestamps: true }
);

// 7. Dispute Schema
export interface IDispute extends Document {
  bookingId: mongoose.Types.ObjectId;
  orderNumber: string;
  reportedBy: 'customer' | 'employee';
  reporterName: string;
  againstName: string;
  reason: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'refunded';
  evidencePhotos: string[];
  resolutionNote?: string;
  refundAmount?: number;
}

export const DisputeSchema = new Schema<IDispute>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    orderNumber: { type: String, required: true },
    reportedBy: { type: String, enum: ['customer', 'employee'], required: true },
    reporterName: { type: String, required: true },
    againstName: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, enum: ['open', 'investigating', 'resolved', 'refunded'], default: 'open' },
    evidencePhotos: [{ type: String }],
    resolutionNote: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 8. Safety Incident Schema
export interface ISafetyIncident extends Document {
  incidentNumber: string;
  bookingId?: mongoose.Types.ObjectId;
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
}

export const SafetyIncidentSchema = new Schema<ISafetyIncident>(
  {
    incidentNumber: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    orderNumber: { type: String, default: '' },
    reporterName: { type: String, required: true },
    reporterRole: { type: String, enum: ['customer', 'employee'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    worksiteLocation: { type: String, required: true },
    status: { type: String, enum: ['reported', 'investigating', 'escalated', 'resolved'], default: 'reported' },
    policeInvolved: { type: Boolean, default: false },
    resolutionSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

// 9. Audit Log Schema
export interface IAuditLog extends Document {
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    actor: { type: String, required: true },
    actorRole: { type: String, required: true },
    target: { type: String, required: true },
    timestamp: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// 10. AppSettings Schema (Single-document collection for platform & remote app configs)
export interface IAppSettings extends Document {
  branding: {
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
  };
  general: {
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
  };
  appConfig: {
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
    whatsappSupportUrl: string;
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
    announcements: Array<{
      id: string;
      title: string;
      message: string;
      audience: string;
      isActive: boolean;
      type: string;
    }>;
  };
  security: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    enforceMfaForStaff: boolean;
    rateLimitRequestsPerMin: number;
    dataRetentionMonths: number;
    allowAccountSelfDeletion: boolean;
  };
  payments: {
    enabledMethods: string[];
    allowCash: boolean;
    onlineProvider: string;
    currency: string;
    payoutSchedule: string;
    autoReconcile: boolean;
  };
}

export const AppSettingsSchema = new Schema<IAppSettings>(
  {
    branding: {
      appName: { type: String, default: 'ManPowerLink' },
      companyName: { type: String, default: 'ManPowerLink Technologies Inc.' },
      tagline: { type: String, default: 'Instant On-Demand Temporary Labor Marketplace' },
      primaryColor: { type: String, default: '#D71920' },
      secondaryColor: { type: String, default: '#FFC928' },
      darkBgColor: { type: String, default: '#1E1F23' },
      mainLogoUrl: { type: String, default: '' },
      appIconUrl: { type: String, default: '' },
      splashLogoUrl: { type: String, default: '' },
      lightLogoUrl: { type: String, default: '' },
      darkLogoUrl: { type: String, default: '' },
      lastUpdatedBy: { type: String, default: 'system' },
    },
    general: {
      companyName: { type: String, default: 'ManPowerLink Technologies Inc.' },
      displayName: { type: String, default: 'ManPowerLink' },
      companyEmail: { type: String, default: 'corporate@manpowerlink.com' },
      supportPhone: { type: String, default: '+91 800 555 0199' },
      customerSupportEmail: { type: String, default: 'support@manpowerlink.com' },
      workerSupportEmail: { type: String, default: 'worker-support@manpowerlink.com' },
      businessAddress: { type: String, default: 'Level 4, ManPowerLink Tower, MG Road, Bangalore 560001, India' },
      websiteUrl: { type: String, default: 'https://manpowerlink.com' },
      defaultCountry: { type: String, default: 'India' },
      defaultCurrency: { type: String, default: 'INR' },
      supportedCurrencies: { type: [String], default: ['INR', 'USD', 'AED'] },
      defaultLanguage: { type: String, default: 'en' },
      supportedLanguages: { type: [String], default: ['en', 'hi', 'kn', 'ta', 'te'] },
      timeZone: { type: String, default: 'Asia/Kolkata' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      helpCenterUrl: { type: String, default: 'https://help.manpowerlink.com' },
      registrationNumber: { type: String, default: 'CIN: U72900KA2026PTC081290' },
      emergencyHotline: { type: String, default: '+91 1800 911 2026' },
      socialLinks: {
        facebook: { type: String, default: 'https://facebook.com/manpowerlink' },
        twitter: { type: String, default: 'https://twitter.com/manpowerlink' },
        linkedin: { type: String, default: 'https://linkedin.com/company/manpowerlink' },
        instagram: { type: String, default: 'https://instagram.com/manpowerlink' },
      },
    },
    appConfig: {
      allowNewRegistrations: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { type: String, default: 'ManPowerLink is currently undergoing scheduled platform upgrades.' },
      minCustomerAppVersion: { type: String, default: '1.0.0' },
      latestCustomerAppVersion: { type: String, default: '1.0.0' },
      forceCustomerUpgrade: { type: Boolean, default: false },
      minEmployeeAppVersion: { type: String, default: '1.0.0' },
      latestEmployeeAppVersion: { type: String, default: '1.0.0' },
      forceEmployeeUpgrade: { type: Boolean, default: false },
      forceUpdateMessage: { type: String, default: 'A new version with critical safety and attendance features is available. Please update.' },
      whatsappSupportUrl: { type: String, default: 'https://wa.me/919900155432' },
      featureFlags: {
        allowWorkerBidding: { type: Boolean, default: true },
        allowCustomerPriceHike: { type: Boolean, default: true },
        enableStartOtp: { type: Boolean, default: true },
        enableEndOtp: { type: Boolean, default: true },
        enableLiveLocationTracking: { type: Boolean, default: true },
        enableEmergencySos: { type: Boolean, default: true },
        enableCashPayments: { type: Boolean, default: true },
        enableInstantPayouts: { type: Boolean, default: true },
      },
      announcements: { type: [Schema.Types.Mixed], default: [] },
    },
    security: {
      sessionTimeoutMinutes: { type: Number, default: 60 },
      maxLoginAttempts: { type: Number, default: 5 },
      enforceMfaForStaff: { type: Boolean, default: false },
      rateLimitRequestsPerMin: { type: Number, default: 120 },
      dataRetentionMonths: { type: Number, default: 36 },
      allowAccountSelfDeletion: { type: Boolean, default: true },
    },
    payments: {
      enabledMethods: { type: [String], default: ['cash', 'online', 'wallet'] },
      allowCash: { type: Boolean, default: true },
      onlineProvider: { type: String, default: 'razorpay' },
      currency: { type: String, default: 'INR' },
      payoutSchedule: { type: String, default: 'daily' },
      autoReconcile: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// 11. Legal Document Schema
export interface ILegalDocument extends Document {
  title: string;
  slug: string;
  documentType: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  version: string;
  effectiveDate: string;
  lastUpdatedDate: string;
  author: string;
  requiresExplicitConsent: boolean;
  publishedHistory: Array<{
    version: string;
    publishedAt: string;
    publishedBy: string;
    changeSummary: string;
  }>;
}

export const LegalDocumentSchema = new Schema<ILegalDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    documentType: { type: String, required: true, index: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    version: { type: String, default: '1.0.0' },
    effectiveDate: { type: String, default: '2026-01-01' },
    lastUpdatedDate: { type: String, default: '2026-10-13' },
    author: { type: String, default: 'Legal Dept.' },
    requiresExplicitConsent: { type: Boolean, default: true },
    publishedHistory: [
      {
        version: { type: String, required: true },
        publishedAt: { type: String, required: true },
        publishedBy: { type: String, required: true },
        changeSummary: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// 12. Legal Acceptance Audit Record
export interface ILegalAcceptance extends Document {
  userId: string;
  userRole: 'customer' | 'employee';
  documentId: string;
  documentType: string;
  versionAccepted: string;
  ipAddress: string;
  acceptedAt: Date;
}

export const LegalAcceptanceSchema = new Schema<ILegalAcceptance>(
  {
    userId: { type: String, required: true, index: true },
    userRole: { type: String, required: true },
    documentId: { type: String, required: true },
    documentType: { type: String, required: true },
    versionAccepted: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    acceptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Model Exports
export const UserModel = mongoose.model<IUser>('User', UserSchema);
export const ServiceCategoryModel = mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);
export const WorkerProfileModel = mongoose.model<IWorkerProfile>('WorkerProfile', WorkerProfileSchema);
export const CustomerProfileModel = mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);
export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
export const CommissionRuleModel = mongoose.model<ICommissionRule>('CommissionRule', CommissionRuleSchema);
export const DisputeModel = mongoose.model<IDispute>('Dispute', DisputeSchema);
export const SafetyIncidentModel = mongoose.model<ISafetyIncident>('SafetyIncident', SafetyIncidentSchema);
export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export const AppSettingsModel = mongoose.model<IAppSettings>('AppSettings', AppSettingsSchema);
export const LegalDocumentModel = mongoose.model<ILegalDocument>('LegalDocument', LegalDocumentSchema);
export const LegalAcceptanceModel = mongoose.model<ILegalAcceptance>('LegalAcceptance', LegalAcceptanceSchema);
