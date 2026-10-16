import { Router, Request, Response } from 'express';
import { authenticateJwt, requireRole, AuthRequest } from '../middleware/auth.middleware';

export const apiRouter = Router();

// --- Public Authentication Endpoints (Customer, Worker, Recovery) ---
apiRouter.post('/auth/customer/login', (req: Request, res: Response) => {
  const { phone, email, password } = req.body;
  if (!password || (!phone && !email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide valid phone/email and password.',
    });
  }

  res.json({
    success: true,
    message: 'Welcome to ManPowerLink Customer Portal.',
    data: {
      token: `mpl_cust_${Date.now()}_token`,
      user: {
        id: 'c-1',
        name: 'Apex Logistics & Warehousing',
        phone: phone || '+91 99001 55432',
        email: email || 'apex@logistics.in',
        role: 'customer',
        city: 'Mangalore, Karnataka',
        isVerified: true,
      },
    },
  });
});

apiRouter.post('/auth/customer/register', (req: Request, res: Response) => {
  const { name, phone, email, password, city } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone, and password are required.',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Customer account created successfully.',
    data: {
      token: `mpl_cust_${Date.now()}_token`,
      user: {
        id: `c-${Date.now()}`,
        name,
        phone,
        email: email || '',
        city: city || 'Mangalore',
        role: 'customer',
        isVerified: true,
      },
    },
  });
});

apiRouter.post('/auth/worker/login', (req: Request, res: Response) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and password are required.',
    });
  }

  res.json({
    success: true,
    message: 'Worker logged in successfully.',
    data: {
      token: `mpl_wrk_${Date.now()}_token`,
      user: {
        id: 'w-1',
        name: 'Ramesh Kumar',
        phone: phone || '+91 98765 43210',
        role: 'employee',
        category: 'Loading & Unloading',
        rating: 4.9,
        approvalStatus: 'approved',
        isVerified: true,
        walletBalance: 4200,
        completedJobsCount: 142,
      },
    },
  });
});

apiRouter.post('/auth/worker/register', (req: Request, res: Response) => {
  const { name, phone, password, primaryCategory, city } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Full name, phone, and password are required.',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Worker application submitted successfully.',
    data: {
      token: `mpl_wrk_${Date.now()}_token`,
      user: {
        id: `w-${Date.now()}`,
        name,
        phone,
        role: 'employee',
        category: primaryCategory || 'General Helper',
        rating: 5.0,
        approvalStatus: 'pending',
        isVerified: false,
        walletBalance: 0,
      },
    },
  });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { identity, role } = req.body;
  if (!identity) {
    return res.status(400).json({
      success: false,
      message: 'Please provide registered email or mobile number.',
    });
  }
  res.json({
    success: true,
    message: 'If the account exists, a secure verification challenge has been initiated.',
    data: { challengeSent: true, expirySeconds: 600 },
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'OTP challenge code and new password are required.',
    });
  }
  res.json({
    success: true,
    message: 'Password has been reset successfully. Please sign in.',
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Signed out securely.',
  });
});

// Apply JWT authentication to admin routes
apiRouter.use(authenticateJwt);

// --- 1. Dashboard Metrics API ---
apiRouter.get('/dashboard/metrics', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalCustomers: 12,
      totalEmployees: 248,
      activeEmployees: 194,
      pendingApprovals: 5,
      activeBookings: 55,
      jobsSearchingWorkers: 14,
      confirmedBookings: 28,
      ongoingJobs: 13,
      completedBookings: 583,
      cancelledBookings: 18,
      totalBookingValue: 125600,
      platformCommission: 12560,
      pendingPayments: 4200,
      openDisputes: 2,
      safetyIncidents: 0,
      recentActivity: [
        { time: '10 mins ago', text: 'Order #1045 confirmed: 3 loaders assigned' },
        { time: '35 mins ago', text: 'Worker Ramesh Kumar verified on-site via Start OTP' },
        { time: '1 hour ago', text: 'New catering job posted for MG Road Banquets' },
      ],
      revenueTrends: [
        { month: 'Jun', gmv: 68000, commission: 6800 },
        { month: 'Jul', gmv: 84000, commission: 8400 },
        { month: 'Aug', gmv: 102000, commission: 10200 },
        { month: 'Sep', gmv: 118000, commission: 11800 },
        { month: 'Oct', gmv: 125600, commission: 12560 },
      ],
    },
  });
});

// --- 2. Categories API ---
apiRouter.get('/categories', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'cat-1',
        name: 'Loading & Unloading',
        slug: 'loading-unloading',
        description: 'Heavy cargo, warehouse dispatch and truck relocation workers.',
        minPrice: 500,
        maxPrice: 3500,
        hourlyRate: 250,
        fullDayRate: 2000,
        halfDayRate: 1100,
        overtimeMultiplier: 1.5,
        isActive: true,
        requiredSkills: ['Heavy Lifting (30kg+)', 'Truck Stacking'],
      },
      {
        id: 'cat-2',
        name: 'Food & Catering Service',
        slug: 'food-service',
        description: 'Tiffin preparation, event buffet servers and kitchen assistants.',
        minPrice: 400,
        maxPrice: 2800,
        hourlyRate: 180,
        fullDayRate: 1500,
        halfDayRate: 850,
        overtimeMultiplier: 1.25,
        isActive: true,
        requiredSkills: ['Hygiene Certification', 'Table Service'],
        dynamicFields: {
          isFoodTiffin: true,
          morningTiffin: true,
          lunch: true,
          eveningTea: true,
          peopleCountPrompt: true,
        },
      },
    ],
  });
});

// --- 3. Workers Management API ---
apiRouter.get('/workers', (req: Request, res: Response) => {
  const { status, search } = req.query;
  res.json({
    success: true,
    total: 3,
    data: [
      {
        id: 'w-1',
        name: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        email: 'ramesh.worker@example.com',
        rating: 4.8,
        approvalStatus: 'approved',
        completedJobs: 42,
        hourlyRate: 250,
        skills: ['Heavy Lifting', 'Truck Stacking'],
      },
      {
        id: 'w-2',
        name: 'Suresh Patil',
        phone: '+91 98765 88912',
        email: 'suresh.p@example.com',
        rating: 4.6,
        approvalStatus: 'approved',
        completedJobs: 31,
        hourlyRate: 260,
        skills: ['Heavy Lifting', 'Warehouse Safety'],
      },
      {
        id: 'w-5',
        name: 'Ganesh Devadiga',
        phone: '+91 97412 88190',
        email: 'ganesh.d@example.com',
        rating: 0,
        approvalStatus: 'pending',
        completedJobs: 0,
        hourlyRate: 200,
        skills: ['Guest Hospitality'],
      },
    ],
  });
});

apiRouter.put('/workers/:id/approval', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, decisionNote } = req.body;
  res.json({
    success: true,
    message: `Worker ${id} status updated to ${status}.`,
    data: { id, status, decisionNote, updatedBy: req.user?.email },
  });
});

// --- 4. Bookings Management API ---
apiRouter.get('/bookings', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: 3,
    data: [
      {
        id: 'b-1045',
        orderNumber: 'Order #1045',
        categoryName: 'Loading & Unloading',
        customerName: 'Apex Logistics & Warehousing',
        requiredWorkers: 4,
        acceptedWorkersCount: 3,
        offeredPricePerWorker: 2200,
        totalEstimatedAmount: 8800,
        status: 'OFFERS_SENT',
        scheduledDate: '2026-10-14',
        startOtp: '4829',
        endOtp: '9154',
      },
      {
        id: 'b-1044',
        orderNumber: 'Order #1044',
        categoryName: 'Food & Catering Service',
        customerName: 'Grand Bay Banquets',
        requiredWorkers: 2,
        acceptedWorkersCount: 2,
        offeredPricePerWorker: 1500,
        totalEstimatedAmount: 3000,
        status: 'ORDER_COMPLETED',
        scheduledDate: '2026-10-12',
        startOtp: '1182',
        endOtp: '6743',
      },
    ],
  });
});

// --- 5. Commission & Financials API ---
apiRouter.get('/commissions', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      type: 'percentage',
      percentageValue: 10,
      fixedValue: 50,
      payer: 'customer',
      taxRate: 5,
    },
  });
});

apiRouter.put('/commissions', requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Commission configuration updated in financial ledger.',
    data: req.body,
  });
});

// --- 6. Disputes API ---
apiRouter.get('/disputes', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'disp-1',
        orderNumber: 'Order #1042',
        reporterName: 'Sunil Traders',
        reportedBy: 'customer',
        againstName: 'Suresh Patil',
        reason: 'Reported 1 hour late to loading bay',
        status: 'investigating',
      },
    ],
  });
});

// --- 7. Reports & CSV Export API ---
apiRouter.get('/reports/export-csv', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const csvData =
    'Order ID,Category,Customer,Total GMV,Commission,Status,Date\n' +
    '#1045,Loading & Unloading,Apex Logistics,8800,880,OFFERS_SENT,2026-10-14\n' +
    '#1044,Food Service,Grand Bay Banquets,3000,300,ORDER_COMPLETED,2026-10-12\n';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=manpowerlink_financials.csv');
  res.send(csvData);
});

// --- 8. Bookings & Real-Time Dispatch ---
apiRouter.post('/bookings', (req: Request, res: Response) => {
  const booking = req.body;
  const newOrderNumber = `Order #${Math.floor(1000 + Math.random() * 9000)}`;
  res.status(201).json({
    success: true,
    message: 'Booking created and broadcast to eligible workers.',
    data: {
      id: `b-${Date.now()}`,
      orderNumber: newOrderNumber,
      ...booking,
      acceptedWorkersCount: 0,
      assignedWorkers: [],
      startOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      endOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'SEARCHING_EMPLOYEES',
      createdAt: new Date().toISOString(),
    },
  });
});

apiRouter.put('/bookings/:id/raise-price', (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPrice, reason } = req.body;
  res.json({
    success: true,
    message: 'Booking price increased and re-broadcast to workers.',
    data: {
      id,
      newPrice,
      reason: reason || 'Customer increased budget to accelerate worker acceptance',
      updatedAt: new Date().toISOString(),
    },
  });
});

apiRouter.post('/bookings/:id/rate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { workerId, rating, comments, punctuality, quality } = req.body;
  res.json({
    success: true,
    message: 'Rating submitted successfully.',
    data: { id, workerId, rating, comments, punctuality, quality },
  });
});

apiRouter.get('/bookings/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: [
      {
        id: 'msg-1',
        bookingId: id,
        senderId: 'w-1',
        senderName: 'Ramesh Kumar',
        senderRole: 'employee',
        text: 'Hello sir, I have accepted the booking. Can you confirm if forklift assist is available?',
        timestamp: '10:15 AM',
      },
    ],
  });
});

apiRouter.post('/bookings/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, attachmentUrl } = req.body;
  res.status(201).json({
    success: true,
    data: {
      id: `msg-${Date.now()}`,
      bookingId: id,
      senderId: 'c-1',
      senderName: 'Apex Logistics',
      senderRole: 'customer',
      text,
      attachmentUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  });
});

apiRouter.post('/safety/report', (req: Request, res: Response) => {
  const { bookingId, title, description, worksiteLocation, severity } = req.body;
  res.status(201).json({
    success: true,
    message: 'Safety incident confidential report received and escalated to operations team.',
    data: {
      incidentNumber: `INC-${Date.now()}`,
      bookingId,
      title,
      description,
      worksiteLocation,
      severity: severity || 'medium',
      status: 'reported',
      createdAt: new Date().toISOString(),
    },
  });
});

// ==========================================
// --- 9. Public App Remote Configuration ---
// ==========================================
// In-memory persistent state (simulating MongoDB AppSettings document)
let appSettingsState = {
  branding: {
    appName: 'ManPowerLink',
    companyName: 'ManPowerLink Technologies Inc.',
    tagline: 'Instant On-Demand Temporary Labor Marketplace',
    primaryColor: '#D71920',
    secondaryColor: '#FFC928',
    darkBgColor: '#1E1F23',
    mainLogoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?auto=format&fit=crop&w=400&q=80',
    appIconUrl: '',
    splashLogoUrl: '',
    lightLogoUrl: '',
    darkLogoUrl: '',
    lastUpdatedBy: 'admin@manpowerlink.com',
    lastUpdatedAt: new Date().toISOString(),
  },
  general: {
    companyName: 'ManPowerLink Technologies Inc.',
    displayName: 'ManPowerLink',
    companyEmail: 'corporate@manpowerlink.com',
    supportPhone: '+91 800 555 0199',
    customerSupportEmail: 'support@manpowerlink.com',
    workerSupportEmail: 'worker-support@manpowerlink.com',
    businessAddress: 'Level 4, ManPowerLink Tower, MG Road, Bangalore 560001, India',
    websiteUrl: 'https://manpowerlink.com',
    defaultCountry: 'India',
    defaultCurrency: 'INR',
    supportedCurrencies: ['INR', 'USD', 'AED'],
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'hi', 'kn', 'ta', 'te'],
    timeZone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    helpCenterUrl: 'https://help.manpowerlink.com',
    registrationNumber: 'CIN: U72900KA2026PTC081290',
    emergencyHotline: '+91 1800 911 2026',
    socialLinks: {
      facebook: 'https://facebook.com/manpowerlink',
      twitter: 'https://twitter.com/manpowerlink',
      linkedin: 'https://linkedin.com/company/manpowerlink',
      instagram: 'https://instagram.com/manpowerlink',
    },
  },
  appConfig: {
    appName: 'ManPowerLink',
    tagline: 'Instant On-Demand Temporary Labor Marketplace',
    publicLogoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?auto=format&fit=crop&w=400&q=80',
    customerSupportEmail: 'support@manpowerlink.com',
    employeeSupportEmail: 'worker-support@manpowerlink.com',
    supportPhone: '+91 800 555 0199',
    whatsappSupportUrl: 'https://wa.me/919900155432',
    allowNewRegistrations: true,
    maintenanceMode: false,
    maintenanceMessage: 'ManPowerLink is currently undergoing scheduled platform upgrades. Service will resume shortly.',
    minCustomerAppVersion: '1.0.0',
    latestCustomerAppVersion: '1.0.0',
    forceCustomerUpgrade: false,
    minEmployeeAppVersion: '1.0.0',
    latestEmployeeAppVersion: '1.0.0',
    forceEmployeeUpgrade: false,
    forceUpdateMessage: 'A new version with critical security and attendance tracking features is required.',
    privacyPolicyUrl: 'https://manpowerlink.com/legal/privacy',
    termsConditionsUrl: 'https://manpowerlink.com/legal/terms',
    helpCenterUrl: 'https://help.manpowerlink.com',
    availableLanguages: ['en', 'hi', 'kn', 'ta', 'te'],
    featureFlags: {
      allowWorkerBidding: true,
      allowCustomerPriceHike: true,
      enableStartOtp: true,
      enableEndOtp: true,
      enableLiveLocationTracking: true,
      enableEmergencySos: true,
      enableCashPayments: true,
      enableInstantPayouts: true,
    },
    announcements: [
      {
        id: 'ann-1',
        title: 'Diwali Festive Demand Surge Bonus',
        message: 'Earn up to 1.5x overtime multiplier on warehouse and catering shifts this week.',
        audience: 'employee' as 'customer' | 'employee' | 'all',
        isActive: true,
        type: 'info' as const,
      },
    ],
  },
  security: {
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    enforceMfaForStaff: false,
    rateLimitRequestsPerMin: 120,
    dataRetentionMonths: 36,
    allowAccountSelfDeletion: true,
  },
  payments: {
    enabledMethods: ['cash', 'online', 'wallet'],
    allowCash: true,
    onlineProvider: 'razorpay',
    currency: 'INR',
    payoutSchedule: 'daily',
    autoReconcile: true,
  },
};

// Legal Documents In-memory Store
let legalDocumentsState = [
  {
    id: 'leg-1',
    title: 'Platform Privacy Policy',
    slug: 'privacy-policy',
    documentType: 'privacy_policy',
    content: `## ManPowerLink Privacy Policy\n\n**Effective Date:** January 1, 2026\n**Jurisdiction:** India (Information Technology Act 2000 & SPDI Rules)\n\n### 1. Information We Collect\nWe collect location data for worksite attendance verification, phone numbers for two-factor authentication, and transaction records.\n\n### 2. Location Tracking and Geofencing\nWorker location is only sampled upon departure, worksite arrival verification, and emergency SOS alerts. Continuous background tracking is never enabled without explicit shift authorization.\n\n### 3. Data Deletion\nUsers may request account deletion through Settings -> Privacy & Data Deletion.`,
    status: 'published',
    version: '1.2.0',
    effectiveDate: '2026-01-01',
    lastUpdatedDate: '2026-10-13',
    author: 'Legal Dept (General Counsel)',
    requiresExplicitConsent: true,
    publishedHistory: [
      {
        version: '1.2.0',
        publishedAt: '2026-10-13',
        publishedBy: 'admin@manpowerlink.com',
        changeSummary: 'Updated geofence arrival verification clause and SOS dispatch protocols.',
      },
      {
        version: '1.1.0',
        publishedAt: '2026-06-01',
        publishedBy: 'admin@manpowerlink.com',
        changeSummary: 'Initial public regulatory release.',
      },
    ],
  },
  {
    id: 'leg-2',
    title: 'Employer & Customer Terms of Service',
    slug: 'customer-terms',
    documentType: 'customer_terms',
    content: `## Employer & Customer Terms\n\n**Effective Date:** January 1, 2026\n\n### 1. Fair Treatment & Workplace Safety\nCustomers must provide a safe working environment, access to potable water, and required protective gear.\n\n### 2. OTP Verification\nStart OTP and End OTP must be verified directly with assigned personnel.\n\n### 3. Payment Obligation\nWork verified by End OTP creates an irrevocable payment obligation.`,
    status: 'published',
    version: '1.1.0',
    effectiveDate: '2026-01-01',
    lastUpdatedDate: '2026-09-15',
    author: 'Legal Dept.',
    requiresExplicitConsent: true,
    publishedHistory: [
      {
        version: '1.1.0',
        publishedAt: '2026-09-15',
        publishedBy: 'admin@manpowerlink.com',
        changeSummary: 'Added strict guidelines on catering overtime rates.',
      },
    ],
  },
  {
    id: 'leg-3',
    title: 'Worker Code of Conduct & Standards',
    slug: 'worker-code-of-conduct',
    documentType: 'code_of_conduct',
    content: `## Worker Code of Conduct\n\n1. Punctuality: Workers must arrive at the designated worksite at least 10 minutes prior to scheduled start.\n2. Sobriety: Strict zero tolerance for alcohol or substance influence.\n3. Safety: Respect site safety regulations and wear protective footwear.`,
    status: 'published',
    version: '1.0.0',
    effectiveDate: '2026-01-01',
    lastUpdatedDate: '2026-08-10',
    author: 'Operations Director',
    requiresExplicitConsent: true,
    publishedHistory: [],
  },
];

let settingsAuditState: any[] = [
  {
    id: 'aud-set-1',
    adminId: 'admin-1',
    adminEmail: 'admin@manpowerlink.com',
    action: 'PUBLISH_BRANDING',
    section: 'Branding & Logo',
    fieldChanged: 'tagline',
    oldValue: 'On-demand labor app',
    newValue: 'Instant On-Demand Temporary Labor Marketplace',
    timestamp: '2026-10-13 10:14 AM',
    ipAddress: '192.168.1.42',
  },
];

// Public App Config Endpoint (Sanitized - NO secrets)
apiRouter.get('/config/public', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      appName: appSettingsState.branding.appName,
      companyName: appSettingsState.branding.companyName,
      tagline: appSettingsState.branding.tagline,
      primaryColor: appSettingsState.branding.primaryColor,
      secondaryColor: appSettingsState.branding.secondaryColor,
      darkBgColor: appSettingsState.branding.darkBgColor,
      logoUrl: appSettingsState.branding.mainLogoUrl,
      supportEmail: appSettingsState.general.customerSupportEmail,
      supportPhone: appSettingsState.general.supportPhone,
      currency: appSettingsState.general.defaultCurrency,
      maintenanceMode: appSettingsState.appConfig.maintenanceMode,
      maintenanceMessage: appSettingsState.appConfig.maintenanceMessage,
      minCustomerAppVersion: appSettingsState.appConfig.minCustomerAppVersion,
      latestCustomerAppVersion: appSettingsState.appConfig.latestCustomerAppVersion,
      forceCustomerUpgrade: appSettingsState.appConfig.forceCustomerUpgrade,
      minEmployeeAppVersion: appSettingsState.appConfig.minEmployeeAppVersion,
      latestEmployeeAppVersion: appSettingsState.appConfig.latestEmployeeAppVersion,
      forceEmployeeUpgrade: appSettingsState.appConfig.forceEmployeeUpgrade,
      forceUpdateMessage: appSettingsState.appConfig.forceUpdateMessage,
      featureFlags: appSettingsState.appConfig.featureFlags,
      announcements: appSettingsState.appConfig.announcements.filter((a) => a.isActive),
    },
  });
});

// Customer-specific public config
apiRouter.get('/config/customer', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      appName: appSettingsState.branding.appName,
      tagline: appSettingsState.branding.tagline,
      primaryColor: appSettingsState.branding.primaryColor,
      logoUrl: appSettingsState.branding.mainLogoUrl,
      supportEmail: appSettingsState.general.customerSupportEmail,
      supportPhone: appSettingsState.general.supportPhone,
      maintenanceMode: appSettingsState.appConfig.maintenanceMode,
      minVersion: appSettingsState.appConfig.minCustomerAppVersion,
      latestVersion: appSettingsState.appConfig.latestCustomerAppVersion,
      forceUpgrade: appSettingsState.appConfig.forceCustomerUpgrade,
      announcements: appSettingsState.appConfig.announcements.filter((a) => a.isActive && (a.audience === 'customer' || a.audience === 'all')),
    },
  });
});

// Employee-specific public config
apiRouter.get('/config/employee', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      appName: appSettingsState.branding.appName,
      tagline: appSettingsState.branding.tagline,
      primaryColor: appSettingsState.branding.primaryColor,
      logoUrl: appSettingsState.branding.mainLogoUrl,
      supportEmail: appSettingsState.general.workerSupportEmail,
      supportPhone: appSettingsState.general.supportPhone,
      emergencyHotline: appSettingsState.general.emergencyHotline,
      maintenanceMode: appSettingsState.appConfig.maintenanceMode,
      minVersion: appSettingsState.appConfig.minEmployeeAppVersion,
      latestVersion: appSettingsState.appConfig.latestEmployeeAppVersion,
      forceUpgrade: appSettingsState.appConfig.forceEmployeeUpgrade,
      announcements: appSettingsState.appConfig.announcements.filter((a) => a.isActive && (a.audience === 'employee' || a.audience === 'all')),
    },
  });
});

// ==========================================
// --- 10. Admin Settings Management CRUD ---
// ==========================================
apiRouter.get('/admin/settings', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: appSettingsState,
  });
});

apiRouter.put('/admin/settings/:section', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const { section } = req.params;
  const updates = req.body;
  const adminEmail = req.user?.email || 'admin@manpowerlink.com';

  if (section === 'branding') {
    const oldTagline = appSettingsState.branding.tagline;
    appSettingsState.branding = {
      ...appSettingsState.branding,
      ...updates,
      lastUpdatedBy: adminEmail,
      lastUpdatedAt: new Date().toISOString(),
    };
    settingsAuditState.unshift({
      id: `aud-${Date.now()}`,
      adminId: req.user?.id || 'admin-1',
      adminEmail,
      action: 'UPDATE_BRANDING',
      section: 'Branding & Logo',
      fieldChanged: 'branding_bundle',
      oldValue: oldTagline,
      newValue: appSettingsState.branding.tagline,
      timestamp: new Date().toLocaleString(),
      ipAddress: req.ip || '127.0.0.1',
    });
  } else if (section === 'general') {
    appSettingsState.general = { ...appSettingsState.general, ...updates };
  } else if (section === 'appConfig') {
    appSettingsState.appConfig = { ...appSettingsState.appConfig, ...updates };
  } else if (section === 'security') {
    appSettingsState.security = { ...appSettingsState.security, ...updates };
  } else if (section === 'payments') {
    appSettingsState.payments = { ...appSettingsState.payments, ...updates };
  }

  res.json({
    success: true,
    message: `Settings section '${section}' updated successfully.`,
    data: (appSettingsState as any)[section] || appSettingsState,
  });
});

// Secure Asset Upload Simulation (Validates mime types and file sizes)
apiRouter.post('/admin/upload/branding-asset', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const { assetType, fileName, fileSize, mimeType, dataBase64 } = req.body;

  // Strict MIME type validation
  const allowedMime = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if (!mimeType || !allowedMime.includes(mimeType)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_FILE_TYPE', message: 'Only safe PNG, JPEG, and WebP images are allowed.' },
    });
  }

  if (fileSize && fileSize > 5 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'Asset size exceeds maximum permitted 5MB limit.' },
    });
  }

  const generatedUrl = `https://storage.googleapis.com/manpowerlink-assets/${assetType || 'logo'}-${Date.now()}.png`;

  res.json({
    success: true,
    message: 'Asset securely validated and uploaded to object storage.',
    data: {
      url: generatedUrl,
      fileName,
      sizeBytes: fileSize,
      uploadedAt: new Date().toISOString(),
    },
  });
});

// ==========================================
// --- 11. Legal Documents API ---
// ==========================================
// Public published legal documents
apiRouter.get('/legal/public', (req: Request, res: Response) => {
  const published = legalDocumentsState.filter((d) => d.status === 'published');
  res.json({ success: true, data: published });
});

apiRouter.get('/legal/public/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const doc = legalDocumentsState.find((d) => d.slug === slug && d.status === 'published');
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found or unpublished.' });
  }
  res.json({ success: true, data: doc });
});

// Admin legal documents CRUD
apiRouter.get('/admin/legal', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: legalDocumentsState });
});

apiRouter.post('/admin/legal', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const doc = req.body;
  const newDoc = {
    id: `leg-${Date.now()}`,
    ...doc,
    status: doc.status || 'draft',
    version: doc.version || '1.0.0',
    lastUpdatedDate: new Date().toISOString().split('T')[0],
    publishedHistory: [],
  };
  legalDocumentsState.push(newDoc);
  res.status(201).json({ success: true, data: newDoc });
});

apiRouter.put('/admin/legal/:id', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const index = legalDocumentsState.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  const current = legalDocumentsState[index];
  const isPublishing = updates.status === 'published' && current.status !== 'published';
  let history = current.publishedHistory || [];

  if (isPublishing || updates.isNewVersion) {
    history = [
      {
        version: updates.version || current.version,
        publishedAt: new Date().toISOString().split('T')[0],
        publishedBy: req.user?.email || 'admin@manpowerlink.com',
        changeSummary: updates.changeSummary || 'Published updated legal terms',
      },
      ...history,
    ];
  }

  legalDocumentsState[index] = {
    ...current,
    ...updates,
    lastUpdatedDate: new Date().toISOString().split('T')[0],
    publishedHistory: history,
  };

  res.json({ success: true, data: legalDocumentsState[index] });
});

// Record user legal acceptance
apiRouter.post('/legal/accept', (req: Request, res: Response) => {
  const { userId, userRole, documentId, documentType, versionAccepted } = req.body;
  res.status(201).json({
    success: true,
    message: 'Explicit legal consent audited and recorded.',
    data: {
      userId,
      userRole,
      documentId,
      documentType,
      versionAccepted,
      timestamp: new Date().toISOString(),
    },
  });
});

// Settings Audit Logs
apiRouter.get('/admin/settings/audit-history', requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: settingsAuditState });
});

