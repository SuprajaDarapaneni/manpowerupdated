import {
  ServiceCategory,
  Worker,
  Customer,
  Booking,
  CommissionSettings,
  OtpVerificationSettings,
  DisputeRecord,
  AuditLogItem,
  AdminUser,
  SafetyIncidentRecord,
  MatchingSettings,
  BrandingSettings,
  GeneralCompanySettings,
  LegalDocument,
  MobileAppRemoteConfig,
  SettingsAuditRecord,
  UpiPayoutRequest,
  PaymentControlSettings,
  PaymentMethodSetting,
  AppNotification,
  GpsLocationStamp,
} from '../types';
import {
  initialCategories,
  initialWorkers,
  initialCustomers,
  initialBookings,
  initialCommissionSettings,
  initialOtpSettings,
  initialDisputes,
  initialAuditLogs,
  initialAdminUsers,
  initialSafetyIncidents,
  initialMatchingSettings,
} from '../mockData';

const STORAGE_KEYS = {
  CATEGORIES: 'manpowerlink_categories_v1',
  WORKERS: 'manpowerlink_workers_v1',
  CUSTOMERS: 'manpowerlink_customers_v1',
  BOOKINGS: 'manpowerlink_bookings_v1',
  COMMISSION: 'manpowerlink_commission_v1',
  OTP: 'manpowerlink_otp_v1',
  DISPUTES: 'manpowerlink_disputes_v1',
  AUDIT: 'manpowerlink_audit_v1',
  VIEW_MODE: 'manpowerlink_view_mode_v2',
  ADMIN_AUTH: 'manpowerlink_admin_auth_v1',
  UPI_PAYOUT_REQUESTS: 'manpowerlink_upi_payout_requests_v1',
};

// Official Kotak / PhonePe UPI Account for Platform Recharges & Payments
export const PLATFORM_UPI_ID = 'prnm@kotak';
export const PLATFORM_UPI_NAME = 'PRAVEEN';

// Standard UPI Deep Link builder for opening PhonePe, GPay, Paytm, Kotak, BHIM
export const getUpiIntentUrl = (
  amount?: number,
  note = 'ManPowerLink Recharge',
  payeeUpi = PLATFORM_UPI_ID,
  payeeName = PLATFORM_UPI_NAME
) => {
  const amtStr = amount && amount > 0 ? `&am=${amount.toFixed(2)}` : '';
  return `upi://pay?pa=${encodeURIComponent(payeeUpi)}&pn=${encodeURIComponent(payeeName)}${amtStr}&cu=INR&tn=${encodeURIComponent(note)}`;
};

export const initialPayoutRequests: UpiPayoutRequest[] = [
  {
    id: 'payreq-1',
    requesterId: 'w-1',
    requesterName: 'Ramesh Kumar',
    requesterRole: 'employee',
    requesterPhone: '+91 98765 43210',
    beneficiaryUpiId: 'ramesh.kumar@okhdfcbank',
    amount: 1800,
    status: 'pending',
    requestedAt: '15 Oct 2026, 06:15 PM',
    adminNote: 'Waiting for admin to accept and credit to UPI',
  },
  {
    id: 'payreq-2',
    requesterId: 'w-2',
    requesterName: 'Suresh Gowda',
    requesterRole: 'employee',
    requesterPhone: '+91 98765 43211',
    beneficiaryUpiId: 'suresh.gowda@paytm',
    amount: 2400,
    status: 'accepted',
    requestedAt: '14 Oct 2026, 02:30 PM',
    acceptedAt: '14 Oct 2026, 03:00 PM',
    utrNumber: '428919028371',
    adminNote: 'Approved & credited to suresh.gowda@paytm via Kotak UPI',
  },
];

export type ViewMode = 'admin-only' | 'interactive-hub';

// Web Audio API Ringtone / Chime Synthesizer
export const playNotificationSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Play a friendly two-tone mobile ring chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.24); // D6
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } catch {
    // Audio contexts might be blocked until user interacts
  }
};

class DataService {
  private listeners: (() => void)[] = [];

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // View Mode: Defaults strictly to 'admin-only' for production client delivery.
  // The developer preview hub with top switcher is ONLY enabled if explicitly passing ?dev=true or ?hub=true.
  public getViewMode(): ViewMode {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('dev=true') || search.includes('hub=true')) {
        return 'interactive-hub';
      }
      return 'admin-only';
    }
    return 'admin-only';
  }

  public setViewMode(mode: ViewMode): void {
    this.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  }

  // Admin Auth
  public getAdminAuth(): { isAuthenticated: boolean; user: { email: string; name: string; role: string } | null } {
    return this.getItem(STORAGE_KEYS.ADMIN_AUTH, {
      isAuthenticated: false,
      user: null,
    });
  }

  public setAdminAuth(auth: { isAuthenticated: boolean; user: { email: string; name: string; role: string } | null }): void {
    this.setItem(STORAGE_KEYS.ADMIN_AUTH, auth);
  }

  // Categories
  public getCategories(): ServiceCategory[] {
    return this.getItem(STORAGE_KEYS.CATEGORIES, initialCategories);
  }

  public setCategories(categories: ServiceCategory[]): void {
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  public updateCategory(updated: ServiceCategory): void {
    const list = this.getCategories().map((c) => (c.id === updated.id ? updated : c));
    this.setCategories(list);
    this.logAudit('Service Category Modified', `Updated category: ${updated.name}`);
  }

  public addCategory(cat: Omit<ServiceCategory, 'id'>): ServiceCategory {
    const newCat: ServiceCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    const list = [...this.getCategories(), newCat];
    this.setCategories(list);
    this.logAudit('Service Category Created', `Added category: ${newCat.name}`);
    return newCat;
  }

  public deleteCategory(categoryId: string): void {
    const list = this.getCategories().filter((c) => c.id !== categoryId);
    this.setCategories(list);
    this.logAudit('Service Category Removed', `Deleted category ID: ${categoryId}`);
  }

  // Workers
  public getWorkers(): Worker[] {
    return this.getItem(STORAGE_KEYS.WORKERS, initialWorkers);
  }

  public setWorkers(workers: Worker[]): void {
    this.setItem(STORAGE_KEYS.WORKERS, workers);
  }

  public updateWorker(worker: Worker): void {
    const list = this.getWorkers().map((w) => (w.id === worker.id ? worker : w));
    this.setWorkers(list);
  }

  public setWorkerApproval(workerId: string, status: 'approved' | 'pending' | 'rejected' | 'suspended'): void {
    const worker = this.getWorkers().find((w) => w.id === workerId);
    if (!worker) return;
    const updated = { ...worker, approvalStatus: status };
    this.updateWorker(updated);
    this.logAudit(`Worker Status Changed: ${status}`, `Worker: ${worker.name} (${worker.phone})`);
  }

  public addWorker(worker: Omit<Worker, 'id'>): Worker {
    const newWorker: Worker = {
      ...worker,
      id: `w-${Date.now()}`,
      avatar: worker.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      email: worker.email || `${worker.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      rating: worker.rating || 5.0,
      reviewCount: worker.reviewCount || 1,
      categoryIds: worker.categoryIds || ['cat-1'],
      completedJobsCount: worker.completedJobsCount || 0,
      totalEarnings: worker.totalEarnings || 0,
      walletBalance: worker.walletBalance || 500,
      approvalStatus: worker.approvalStatus || 'approved',
      isAvailable: worker.isAvailable ?? true,
      walletTransactions: worker.walletTransactions || [],
    };
    const list = [newWorker, ...this.getWorkers()];
    this.setWorkers(list);
    this.logAudit('Worker Registered', `Added worker: ${newWorker.name} (${newWorker.phone})`);
    return newWorker;
  }

  public deleteWorker(workerId: string): void {
    const list = this.getWorkers().filter((w) => w.id !== workerId);
    this.setWorkers(list);
    this.logAudit('Worker Removed', `Deleted worker ID: ${workerId}`);
  }

  // Customers
  public getCustomers(): Customer[] {
    return this.getItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  }

  public setCustomers(customers: Customer[]): void {
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
  }

  public getCustomer(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  }

  public updateCustomer(customer: Customer): void {
    const list = this.getCustomers().map((c) => (c.id === customer.id ? customer : c));
    this.setCustomers(list);
  }

  public addCustomer(customer: Omit<Customer, 'id'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: `c-${Date.now()}`,
      avatar: customer.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80`,
      totalBookings: customer.totalBookings || 0,
      walletBalance: customer.walletBalance || 0,
      status: customer.status || 'active',
      walletTransactions: customer.walletTransactions || [],
    };
    const list = [newCustomer, ...this.getCustomers()];
    this.setCustomers(list);
    this.logAudit('Employer Registered', `Added employer: ${newCustomer.name} (${newCustomer.phone})`);
    return newCustomer;
  }

  public deleteCustomer(customerId: string): void {
    const list = this.getCustomers().filter((c) => c.id !== customerId);
    this.setCustomers(list);
    this.logAudit('Employer Removed', `Deleted customer ID: ${customerId}`);
  }

  // Customer Wallet Recharge via Direct PhonePe / UPI QR without 3rd party APIs
  public rechargeCustomerWallet(
    customerId: string,
    amount: number,
    utrRef: string = `UPI/${Date.now().toString().slice(-8)}`
  ): { success: boolean; newBalance: number } {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, newBalance: 0 };

    const currentBal = customer.walletBalance || 0;
    const newBal = currentBal + amount;
    const newTx = {
      id: `ctx-${Date.now()}`,
      type: 'credit' as const,
      amount,
      description: `Wallet Top-up via PhonePe / UPI QR`,
      timestamp: new Date().toLocaleString(),
      utrRef,
    };

    const updatedCustomer: Customer = {
      ...customer,
      walletBalance: newBal,
      walletTransactions: [newTx, ...(customer.walletTransactions || [])],
    };

    this.updateCustomer(updatedCustomer);
    this.logAudit('Customer Wallet Recharged', `${customer.name} credited ₹${amount} via PhonePe/UPI QR. UTR: ${utrRef}. New balance: ₹${newBal}`);
    playNotificationSound();
    return { success: true, newBalance: newBal };
  }

  // Debit Customer Wallet
  public debitCustomerWallet(
    customerId: string,
    amount: number,
    purpose: string = 'Order Advance / Booking Debit'
  ): { success: boolean; newBalance: number; error?: string } {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, newBalance: 0, error: 'Customer not found' };

    const currentBal = customer.walletBalance || 0;
    if (currentBal < amount) {
      return {
        success: false,
        newBalance: currentBal,
        error: `Insufficient wallet balance (Available: ₹${currentBal.toLocaleString()}, Required: ₹${amount.toLocaleString()}). Please top up via PhonePe/UPI QR.`,
      };
    }

    const newBal = currentBal - amount;
    const newTx = {
      id: `ctx-${Date.now()}`,
      type: 'debit' as const,
      amount,
      description: purpose,
      timestamp: new Date().toLocaleString(),
    };

    const updatedCustomer: Customer = {
      ...customer,
      walletBalance: newBal,
      walletTransactions: [newTx, ...(customer.walletTransactions || [])],
    };

    this.updateCustomer(updatedCustomer);
    this.logAudit('Customer Wallet Debited', `${customer.name} debited ₹${amount} for: ${purpose}. Remaining balance: ₹${newBal}`);
    playNotificationSound();
    return { success: true, newBalance: newBal };
  }

  // ==========================================
  // UPI Payout & Credit Requests (Ask & Accept)
  // ==========================================
  public getPayoutRequests(): UpiPayoutRequest[] {
    return this.getItem(STORAGE_KEYS.UPI_PAYOUT_REQUESTS, initialPayoutRequests);
  }

  public setPayoutRequests(requests: UpiPayoutRequest[]): void {
    this.setItem(STORAGE_KEYS.UPI_PAYOUT_REQUESTS, requests);
  }

  public createPayoutRequest(
    data: Omit<UpiPayoutRequest, 'id' | 'status' | 'requestedAt'>
  ): UpiPayoutRequest {
    const list = this.getPayoutRequests();
    const newRequest: UpiPayoutRequest = {
      ...data,
      id: `payreq-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toLocaleString(),
    };
    this.setPayoutRequests([newRequest, ...list]);
    this.logAudit(
      'UPI Payout Requested',
      `${data.requesterName} (${data.requesterRole}) asked for ₹${data.amount} credit to UPI: ${data.beneficiaryUpiId}`
    );
    playNotificationSound();
    return newRequest;
  }

  public acceptPayoutRequest(
    requestId: string,
    utrNumber?: string,
    adminNote?: string
  ): { success: boolean; error?: string } {
    const list = this.getPayoutRequests();
    const req = list.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };
    if (req.status === 'accepted') return { success: false, error: 'Already accepted' };

    const utr = utrNumber?.trim() || `KOTAK/UPI/${Date.now().toString().slice(-8)}`;

    // Debit requester's balance and record ledger entry
    if (req.requesterRole === 'employee') {
      const workers = this.getWorkers();
      const worker = workers.find((w) => w.id === req.requesterId);
      if (worker) {
        const cur = worker.walletBalance || 0;
        const newBal = Math.max(0, cur - req.amount);
        const newTx = {
          id: `wtx-${Date.now()}`,
          type: 'fee_deduction' as const,
          amount: req.amount,
          description: `Payout credited to UPI: ${req.beneficiaryUpiId} (UTR: ${utr})`,
          timestamp: new Date().toLocaleString(),
        };
        const updatedWorker = {
          ...worker,
          walletBalance: newBal,
          walletTransactions: [newTx, ...(worker.walletTransactions || [])],
        };
        this.updateWorker(updatedWorker);
      }
    } else {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === req.requesterId);
      if (customer) {
        const cur = customer.walletBalance || 0;
        const newBal = Math.max(0, cur - req.amount);
        const newTx = {
          id: `ctx-${Date.now()}`,
          type: 'debit' as const,
          amount: req.amount,
          description: `Payout credited to UPI: ${req.beneficiaryUpiId} (UTR: ${utr})`,
          timestamp: new Date().toLocaleString(),
          utrRef: utr,
        };
        const updatedCustomer = {
          ...customer,
          walletBalance: newBal,
          walletTransactions: [newTx, ...(customer.walletTransactions || [])],
        };
        this.updateCustomer(updatedCustomer);
      }
    }

    const updatedList = list.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'accepted' as const,
            acceptedAt: new Date().toLocaleString(),
            utrNumber: utr,
            adminNote: adminNote || `Approved & credited to ${r.beneficiaryUpiId} via Kotak UPI`,
          }
        : r
    );

    this.setPayoutRequests(updatedList);
    this.logAudit(
      'UPI Payout Accepted & Credited',
      `Transferred ₹${req.amount} to UPI: ${req.beneficiaryUpiId} for ${req.requesterName} (${req.requesterRole}). UTR: ${utr}`
    );
    playNotificationSound();
    return { success: true };
  }

  public rejectPayoutRequest(requestId: string, reason?: string): { success: boolean; error?: string } {
    const list = this.getPayoutRequests();
    const req = list.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Request not found' };

    const updatedList = list.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'rejected' as const,
            adminNote: reason || 'Declined by administrator',
          }
        : r
    );

    this.setPayoutRequests(updatedList);
    this.logAudit(
      'UPI Payout Rejected',
      `Declined payout request for ₹${req.amount} to ${req.beneficiaryUpiId} (${req.requesterName}). Reason: ${reason || 'N/A'}`
    );
    return { success: true };
  }

  // Bookings
  public getBookings(): Booking[] {
    return this.getItem(STORAGE_KEYS.BOOKINGS, initialBookings);
  }

  public setBookings(bookings: Booking[]): void {
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
  }

  public updateBooking(booking: Booking): void {
    const list = this.getBookings().map((b) => (b.id === booking.id ? booking : b));
    this.setBookings(list);
  }

  public updateBookingStatus(bookingId: string, status: Booking['status']): void {
    const booking = this.getBookings().find((b) => b.id === bookingId);
    if (!booking) return;
    const updated = { ...booking, status, updatedAt: new Date().toLocaleString() };
    this.updateBooking(updated);
    this.logAudit(`Order Status Updated: ${status}`, `${booking.orderNumber} set to ${status}`);
  }

  public deleteBooking(bookingId: string): void {
    const list = this.getBookings().filter((b) => b.id !== bookingId);
    this.setBookings(list);
    this.logAudit('Order Cancelled / Deleted', `Deleted booking ID: ${bookingId}`);
  }

  public createBooking(bookingData: Partial<Booking>): Booking {
    const existing = this.getBookings();
    const newId = `b-${1046 + existing.length}`;
    const startOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const endOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const commission = this.getCommissionSettings();
    const totalEst = bookingData.totalEstimatedAmount || 2000;
    const commAmount = commission.type === 'percentage'
      ? Math.round((totalEst * commission.percentageValue) / 100)
      : commission.fixedValue;

    const newBooking: Booking = {
      id: newId,
      orderNumber: `Order #${1046 + existing.length}`,
      customerId: bookingData.customerId || 'c-1',
      customerName: bookingData.customerName || 'Apex Logistics & Warehousing',
      customerPhone: bookingData.customerPhone || '+91 99001 55432',
      categoryId: bookingData.categoryId || 'cat-1',
      categoryName: bookingData.categoryName || 'Loading & Unloading',
      requiredWorkers: bookingData.requiredWorkers || 2,
      acceptedWorkersCount: 0,
      assignedWorkers: [],
      bids: [],
      mode: bookingData.mode || 'fixed_price',
      offeredPricePerWorker: bookingData.offeredPricePerWorker || 2000,
      totalEstimatedAmount: totalEst,
      platformCommissionRate: commission.percentageValue,
      platformCommissionAmount: commAmount,
      workLocation: bookingData.workLocation || {
        address: 'Mangalore Port Warehouse',
        city: 'Mangalore, Karnataka',
        lat: 12.914,
        lng: 74.856,
      },
      scheduledDate: bookingData.scheduledDate || '2026-10-15',
      startTime: bookingData.startTime || '09:00 AM',
      endTime: bookingData.endTime || '05:00 PM',
      durationType: bookingData.durationType || 'full_day',
      jobTitle: bookingData.jobTitle || 'Loading and moving boxes',
      paymentMode: bookingData.paymentMode || 'cash',
      description: bookingData.description || 'Temporary manpower required.',
      specialInstructions: bookingData.specialInstructions || bookingData.remarks || 'Requires gloves and safety boots. Heavy boxes.',
      remarks: bookingData.remarks || bookingData.specialInstructions || '',
      pricingModel: bookingData.pricingModel || 'hourly',
      pricePerHourPerHead: bookingData.pricePerHourPerHead,
      shiftHours: bookingData.shiftHours,
      packageApproxHours: bookingData.packageApproxHours,
      packageTitle: bookingData.packageTitle,
      upiTransactionRef: bookingData.upiTransactionRef,
      walletDebited: bookingData.walletDebited || false,
      foodDetails: bookingData.foodDetails,
      status: 'SEARCHING_EMPLOYEES',
      paymentStatus: bookingData.walletDebited || bookingData.upiTransactionRef ? 'successful' : 'pending',
      paymentMethod: (bookingData.paymentMethod as any) || (bookingData.paymentMode === 'wallet' ? 'wallet' : 'cash'),
      startOtp,
      endOtp,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      timelineTree: [
        {
          id: `node-${Date.now()}-1`,
          stageKey: 'JOB_POSTED',
          title: 'Job Order Published',
          description: `Customer posted requirement for ${bookingData.requiredWorkers || 2} workers at ₹${bookingData.offeredPricePerWorker || 2000}/day. Broadcast to eligible workers.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: {
            address: bookingData.workLocation?.address || 'Mangalore Port Warehouse',
            lat: bookingData.workLocation?.lat || 12.914,
            lng: bookingData.workLocation?.lng || 74.856,
          },
          actor: bookingData.customerName || 'Customer',
          completed: true,
          current: true,
        },
        {
          id: `node-${Date.now()}-2`,
          stageKey: 'WORKERS_MATCHED',
          title: 'Worker Acceptance / Bid',
          description: 'Awaiting worker job acceptance or counter-bids.',
          timestamp: 'In progress',
          location: { address: 'Mangalore Radius', lat: 12.914, lng: 74.856 },
          actor: 'Worker Matching Engine',
          completed: false,
        },
        {
          id: `node-${Date.now()}-3`,
          stageKey: 'START_OTP_VERIFIED',
          title: 'Arrival & Start OTP Check-in',
          description: `Worker provides Start OTP (${startOtp}) upon arrival at worksite to verify attendance.`,
          timestamp: 'Pending Check-in',
          location: { address: bookingData.workLocation?.address || 'Worksite', lat: 12.914, lng: 74.856 },
          actor: 'Customer & Worker',
          completed: false,
        },
        {
          id: `node-${Date.now()}-4`,
          stageKey: 'WORK_COMPLETED_OTP',
          title: 'Work Completed & End OTP Verification',
          description: `Shift completion verified via End OTP (${endOtp}). Direct cash wage collected.`,
          timestamp: 'Pending Completion',
          location: { address: bookingData.workLocation?.address || 'Worksite', lat: 12.914, lng: 74.856 },
          actor: 'Customer & Worker',
          completed: false,
        },
        {
          id: `node-${Date.now()}-5`,
          stageKey: 'CASH_PAYMENT',
          title: 'Direct Cash / UPI Settlement',
          description: 'Customer pays full wages in Cash or direct Worker UPI upon shift end.',
          timestamp: 'Pending Cash Payment',
          location: { address: 'Worksite Pay Counter', lat: 12.914, lng: 74.856 },
          actor: 'Customer to Worker',
          completed: false,
        },
        {
          id: `node-${Date.now()}-6`,
          stageKey: 'PLATFORM_FEE_DEDUCTED',
          title: 'Platform Fee Wallet Deduction',
          description: `Platform fee (₹${commAmount}) debited from worker prepaid wallet balance.`,
          timestamp: 'Pending Settlement',
          location: { address: 'ManPowerLink Platform Cloud', lat: 12.914, lng: 74.856 },
          actor: 'System Automated Wallet Debit',
          completed: false,
        },
      ],
    };

    this.setBookings([newBooking, ...existing]);
    this.logAudit('New Job Created', `${newBooking.orderNumber} by ${newBooking.customerName}`);
    playNotificationSound();
    return newBooking;
  }

  // Worker Bidding
  public submitBid(bookingId: string, workerId: string, amount: number, note?: string): void {
    const booking = this.getBookings().find((b) => b.id === bookingId);
    const worker = this.getWorkers().find((w) => w.id === workerId);
    if (!booking || !worker) return;

    const newBid = {
      id: `bid-${Date.now()}`,
      bookingId,
      workerId,
      workerName: worker.name,
      workerAvatar: worker.avatar,
      workerRating: worker.rating,
      proposedAmount: amount,
      status: 'pending' as const,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note,
    };

    const updatedBids = [...booking.bids.filter((b) => b.workerId !== workerId), newBid];
    const updatedBooking: Booking = {
      ...booking,
      bids: updatedBids,
      status: 'EMPLOYEES_ACCEPTING_OR_BIDDING',
      updatedAt: new Date().toLocaleString(),
    };

    this.updateBooking(updatedBooking);
    this.logAudit('Worker Bid Received', `${worker.name} bid ₹${amount} on ${booking.orderNumber}`);
  }

  public acceptBid(bookingId: string, bidId: string): void {
    const booking = this.getBookings().find((b) => b.id === bookingId);
    if (!booking) return;

    const bid = booking.bids.find((b) => b.id === bidId);
    if (!bid) return;

    const worker = this.getWorkers().find((w) => w.id === bid.workerId);
    if (!worker) return;

    // Check if worker already assigned
    if (booking.assignedWorkers.some((a) => a.workerId === bid.workerId)) return;

    const newAssigned = [
      ...booking.assignedWorkers,
      {
        workerId: worker.id,
        workerName: worker.name,
        workerPhone: worker.phone,
        workerAvatar: worker.avatar,
        agreedRate: bid.proposedAmount,
        status: 'assigned' as const,
        startOtpVerified: false,
      },
    ];

    const updatedBids = booking.bids.map((b) => (b.id === bidId ? { ...b, status: 'accepted' as const } : b));
    const newAcceptedCount = newAssigned.length;
    const isCapacityReached = newAcceptedCount >= booking.requiredWorkers;

    const updatedBooking: Booking = {
      ...booking,
      assignedWorkers: newAssigned,
      acceptedWorkersCount: newAcceptedCount,
      bids: updatedBids,
      status: isCapacityReached ? 'CONFIRMED' : 'OFFERS_SENT',
      updatedAt: new Date().toLocaleString(),
    };

    this.updateBooking(updatedBooking);
    this.logAudit('Employee Bid Accepted', `Customer accepted ${worker.name} on ${booking.orderNumber}`);
  }

  // Direct Worker Acceptance (Fixed Price mode)
  public directAcceptJob(bookingId: string, workerId: string): void {
    const booking = this.getBookings().find((b) => b.id === bookingId);
    const worker = this.getWorkers().find((w) => w.id === workerId);
    if (!booking || !worker) return;

    if (booking.assignedWorkers.some((a) => a.workerId === workerId)) return;
    if (booking.assignedWorkers.length >= booking.requiredWorkers) return;

    const newAssigned = [
      ...booking.assignedWorkers,
      {
        workerId: worker.id,
        workerName: worker.name,
        workerPhone: worker.phone,
        workerAvatar: worker.avatar,
        agreedRate: booking.offeredPricePerWorker,
        status: 'travelling' as const,
        startOtpVerified: false,
      },
    ];

    const newCount = newAssigned.length;
    const isConfirmed = newCount >= booking.requiredWorkers;

    const updatedBooking: Booking = {
      ...booking,
      assignedWorkers: newAssigned,
      acceptedWorkersCount: newCount,
      status: isConfirmed ? 'CONFIRMED' : 'OFFERS_SENT',
      updatedAt: new Date().toLocaleString(),
    };

    this.updateBooking(updatedBooking);
    this.logAudit('Worker Accepted Offer', `${worker.name} joined ${booking.orderNumber}`);
  }

  // Verify Start OTP
  public verifyStartOtp(bookingId: string, workerId: string, enteredOtp: string, locationAddress = 'Worksite Entrance Gate'): { success: boolean; message: string } {
    const booking = this.getBookings().find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    if (booking.startOtp !== enteredOtp.trim()) {
      return { success: false, message: 'Invalid Start OTP. Please ask the customer for the correct 4-digit code.' };
    }

    const assigned = booking.assignedWorkers.map((a) => {
      if (a.workerId === workerId) {
        return {
          ...a,
          status: 'working' as const,
          startOtpVerified: true,
          workStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return a;
    });

    const updatedTimeline = (booking.timelineTree || []).map((node) => {
      if (node.stageKey === 'START_OTP_VERIFIED') {
        return {
          ...node,
          completed: true,
          current: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: { address: locationAddress, lat: 12.914, lng: 74.856 },
        };
      }
      if (node.stageKey === 'WORK_COMPLETED_OTP') {
        return { ...node, current: true };
      }
      return node;
    });

    const updatedBooking: Booking = {
      ...booking,
      assignedWorkers: assigned,
      status: 'WORK_STARTED',
      timelineTree: updatedTimeline,
      updatedAt: new Date().toLocaleString(),
    };

    this.updateBooking(updatedBooking);
    this.logAudit('Work Started (OTP Verified)', `Start OTP verified for ${booking.orderNumber} at ${locationAddress}`);
    playNotificationSound();
    return { success: true, message: 'Work successfully verified & started!' };
  }

  // Verify End OTP & Complete Work (Customer pays Cash/UPI, Admin deducts platform fee from worker prepaid wallet)
  public verifyEndOtp(
    bookingId: string,
    workerId: string,
    enteredOtp: string,
    locationAddress = 'Worksite Supervisor Desk'
  ): { success: boolean; message: string; walletDeducted?: number; remainingWallet?: number } {
    const booking = this.getBookings().find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };

    if (booking.endOtp !== enteredOtp.trim()) {
      return { success: false, message: 'Invalid End OTP. Please ask customer to provide the completion code.' };
    }

    const assigned = booking.assignedWorkers.map((a) => {
      if (a.workerId === workerId) {
        return {
          ...a,
          status: 'completed' as const,
          endOtpVerified: true,
          workEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return a;
    });

    const allCompleted = assigned.every((a) => a.endOtpVerified);

    // Platform fee calculation (e.g. 10% = ₹200)
    const workerWage = booking.offeredPricePerWorker || 2000;
    const platformFee = Math.round(workerWage * 0.1); // 10% platform fee

    // Deduct platform fee from worker prepaid wallet
    let workerRemainingWallet = 0;
    const workers = this.getWorkers();
    const worker = workers.find((w) => w.id === workerId);
    if (worker) {
      const currentWallet = worker.walletBalance || 0;
      workerRemainingWallet = Math.max(0, currentWallet - platformFee);
      const newTx = {
        id: `wt-${Date.now()}`,
        type: 'fee_deduction' as const,
        amount: platformFee,
        description: `Platform Fee deduction for ${booking.orderNumber}`,
        timestamp: new Date().toLocaleString(),
      };
      this.updateWorker({
        ...worker,
        walletBalance: workerRemainingWallet,
        completedJobsCount: (worker.completedJobsCount || 0) + 1,
        totalEarnings: (worker.totalEarnings || 0) + workerWage,
        walletTransactions: [newTx, ...(worker.walletTransactions || [])],
      });
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedTimeline = (booking.timelineTree || []).map((node) => {
      if (node.stageKey === 'WORK_COMPLETED_OTP') {
        return {
          ...node,
          completed: true,
          current: false,
          timestamp: nowTime,
          location: { address: locationAddress, lat: 12.914, lng: 74.856 },
        };
      }
      if (node.stageKey === 'CASH_PAYMENT') {
        return {
          ...node,
          completed: true,
          current: false,
          description: `Customer paid ₹${workerWage} wage directly to worker in Cash/UPI.`,
          timestamp: nowTime,
          location: { address: locationAddress, lat: 12.914, lng: 74.856 },
        };
      }
      if (node.stageKey === 'PLATFORM_FEE_DEDUCTED') {
        return {
          ...node,
          completed: true,
          current: false,
          description: `Platform fee (₹${platformFee}) automatically debited from worker wallet.`,
          timestamp: nowTime,
          location: { address: 'ManPowerLink Platform Cloud', lat: 12.914, lng: 74.856 },
        };
      }
      return node;
    });

    const updatedBooking: Booking = {
      ...booking,
      assignedWorkers: assigned,
      status: allCompleted ? 'WORK_COMPLETED' : 'WORK_STARTED',
      paymentStatus: 'successful',
      paymentMethod: 'cash',
      finalSettlementAmount: booking.totalEstimatedAmount,
      timelineTree: updatedTimeline,
      updatedAt: new Date().toLocaleString(),
    };

    this.updateBooking(updatedBooking);
    this.logAudit(
      'Work Completed & Cash Collected',
      `Cash wage ₹${workerWage} received. Platform fee ₹${platformFee} debited from worker wallet.`
    );
    playNotificationSound();

    return {
      success: true,
      message: `Work completed! Cash of ₹${workerWage} collected. Platform fee of ₹${platformFee} debited from your wallet.`,
      walletDeducted: platformFee,
      remainingWallet: workerRemainingWallet,
    };
  }

  // Worker Prepaid Wallet Recharge
  public rechargeWorkerWallet(
    workerId: string,
    amount: number,
    method = 'UPI / NetBanking'
  ): { success: boolean; newBalance: number } {
    const workers = this.getWorkers();
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return { success: false, newBalance: 0 };

    const currentBal = worker.walletBalance || 0;
    const newBal = currentBal + amount;
    const newTx = {
      id: `wt-${Date.now()}`,
      type: 'recharge' as const,
      amount,
      description: `Prepaid Wallet Recharge via ${method}`,
      timestamp: new Date().toLocaleString(),
    };

    const updatedWorker: Worker = {
      ...worker,
      walletBalance: newBal,
      walletTransactions: [newTx, ...(worker.walletTransactions || [])],
    };

    this.updateWorker(updatedWorker);
    this.logAudit('Worker Wallet Recharged', `${worker.name} recharged ₹${amount}. New balance: ₹${newBal}`);
    playNotificationSound();
    return { success: true, newBalance: newBal };
  }

  // Commission Settings
  public getCommissionSettings(): CommissionSettings {
    return this.getItem(STORAGE_KEYS.COMMISSION, initialCommissionSettings);
  }

  public setCommissionSettings(settings: CommissionSettings): void {
    this.setItem(STORAGE_KEYS.COMMISSION, settings);
    this.logAudit('Commission Rules Updated', `Type: ${settings.type}, Value: ${settings.type === 'percentage' ? settings.percentageValue + '%' : '₹' + settings.fixedValue}`);
  }

  // OTP Settings
  public getOtpSettings(): OtpVerificationSettings {
    return this.getItem(STORAGE_KEYS.OTP, initialOtpSettings);
  }

  public setOtpSettings(settings: OtpVerificationSettings): void {
    this.setItem(STORAGE_KEYS.OTP, settings);
    this.logAudit('Verification Rules Updated', `Start OTP: ${settings.requireStartOtp}, End OTP: ${settings.requireEndOtp}`);
  }

  // Disputes
  public getDisputes(): DisputeRecord[] {
    return this.getItem(STORAGE_KEYS.DISPUTES, initialDisputes);
  }

  public setDisputes(disputes: DisputeRecord[]): void {
    this.setItem(STORAGE_KEYS.DISPUTES, disputes);
  }

  public resolveDispute(disputeId: string, resolutionNote: string, status: 'resolved' | 'refunded'): void {
    const list = this.getDisputes().map((d) => (d.id === disputeId ? { ...d, status, resolutionNote } : d));
    this.setDisputes(list);
    this.logAudit(`Dispute ${status}`, `Dispute ID: ${disputeId} resolved: ${resolutionNote}`);
  }

  // Audit Logs
  public getAuditLogs(): AuditLogItem[] {
    return this.getItem(STORAGE_KEYS.AUDIT, initialAuditLogs);
  }

  private logAudit(action: string, target: string): void {
    const existing = this.getAuditLogs();
    const newEntry: AuditLogItem = {
      id: `aud-${Date.now()}`,
      action,
      actor: 'Super Admin',
      actorRole: 'super_admin',
      target,
      timestamp: new Date().toLocaleString(),
      ipAddress: '127.0.0.1',
    };
    this.setItem(STORAGE_KEYS.AUDIT, [newEntry, ...existing.slice(0, 99)]);
  }

  // Admin Users & Staff
  public getAdminUsers(): AdminUser[] {
    return this.getItem('manpowerlink_admin_users_v1', initialAdminUsers);
  }

  public setAdminUsers(users: AdminUser[]): void {
    this.setItem('manpowerlink_admin_users_v1', users);
  }

  public setAdminUserStatus(userId: string, status: 'active' | 'suspended'): void {
    const list = this.getAdminUsers().map((u) => (u.id === userId ? { ...u, status } : u));
    this.setAdminUsers(list);
    this.logAudit(`Admin Staff Account ${status}`, `User ID: ${userId}`);
  }

  public addAdminUser(user: Omit<AdminUser, 'id'>): AdminUser {
    const newUser: AdminUser = {
      ...user,
      id: `usr-${Date.now()}`,
      lastLogin: 'Never',
      status: user.status || 'active',
      permissions: user.permissions || ['read_bookings', 'manage_workers'],
    };
    const list = [newUser, ...this.getAdminUsers()];
    this.setAdminUsers(list);
    this.logAudit('Staff Account Created', `Created staff: ${newUser.name} (${newUser.role})`);
    return newUser;
  }

  public updateAdminUser(user: AdminUser): void {
    const list = this.getAdminUsers().map((u) => (u.id === user.id ? user : u));
    this.setAdminUsers(list);
    this.logAudit('Staff Account Modified', `Updated: ${user.name} (${user.role})`);
  }

  public deleteAdminUser(userId: string): void {
    const list = this.getAdminUsers().filter((u) => u.id !== userId);
    this.setAdminUsers(list);
    this.logAudit('Staff Account Removed', `Deleted user ID: ${userId}`);
  }

  // Safety Incidents
  public getSafetyIncidents(): SafetyIncidentRecord[] {
    return this.getItem('manpowerlink_safety_incidents_v1', initialSafetyIncidents);
  }

  public resolveSafetyIncident(incidentId: string, resolutionSummary: string): void {
    const list = this.getSafetyIncidents().map((inc) =>
      inc.id === incidentId ? { ...inc, status: 'resolved' as const, resolutionSummary } : inc
    );
    this.setItem('manpowerlink_safety_incidents_v1', list);
    this.logAudit('Safety Incident Resolved', `Incident: ${incidentId} - ${resolutionSummary}`);
  }

  // Matching Settings
  public getMatchingSettings(): MatchingSettings {
    return this.getItem('manpowerlink_matching_v1', initialMatchingSettings);
  }

  public setMatchingSettings(settings: MatchingSettings): void {
    this.setItem('manpowerlink_matching_v1', settings);
    this.logAudit('Matching Settings Updated', `Radius: ${settings.searchRadiusKm}km, Timeout: ${settings.acceptanceTimeoutMins}m`);
  }

  // --- Branding Settings ---
  public getBrandingSettings(): BrandingSettings {
    return this.getItem<BrandingSettings>('manpowerlink_branding_v1', {
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
      lastUpdatedAt: new Date().toLocaleDateString(),
    });
  }

  public setBrandingSettings(branding: BrandingSettings): void {
    this.setItem('manpowerlink_branding_v1', branding);
    this.logAudit('Branding Updated', `App: ${branding.appName}, Tagline: ${branding.tagline}`);
  }

  // --- General Company Settings ---
  public getGeneralSettings(): GeneralCompanySettings {
    return this.getItem<GeneralCompanySettings>('manpowerlink_general_settings_v1', {
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
    });
  }

  public setGeneralSettings(settings: GeneralCompanySettings): void {
    this.setItem('manpowerlink_general_settings_v1', settings);
    this.logAudit('Company Settings Updated', `Updated company info for ${settings.companyName}`);
  }

  // --- Legal Documents ---
  public getLegalDocuments(): LegalDocument[] {
    return this.getItem<LegalDocument[]>('manpowerlink_legal_docs_v1', [
      {
        id: 'leg-1',
        title: 'Platform Privacy Policy',
        slug: 'privacy-policy',
        documentType: 'privacy_policy',
        content: `## ManPowerLink Privacy Policy\n\n**Effective Date:** January 1, 2026\n**Jurisdiction:** India (Information Technology Act 2000 & SPDI Rules)\n\n### 1. Information We Collect\nWe collect worksite geofence attendance verification, phone numbers for OTP security, and transaction audit trails.\n\n### 2. Location Tracking and Geofencing\nWorker location is only queried during departure, worksite arrival verification, and emergency SOS alerts. Continuous background tracking is never enabled without explicit shift authorization.\n\n### 3. Data Deletion\nUsers may request account deletion through Settings -> Privacy & Data Deletion.`,
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
        publishedHistory: [],
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
    ]);
  }

  public setLegalDocuments(docs: LegalDocument[]): void {
    this.setItem('manpowerlink_legal_docs_v1', docs);
  }

  public updateLegalDocument(doc: LegalDocument): void {
    const list = this.getLegalDocuments().map((d) => (d.id === doc.id ? doc : d));
    this.setLegalDocuments(list);
    this.logAudit('Legal Document Modified', `${doc.title} (${doc.version})`);
  }

  public addLegalDocument(doc: Omit<LegalDocument, 'id'>): LegalDocument {
    const newDoc: LegalDocument = {
      ...doc,
      id: `leg-${Date.now()}`,
    };
    this.setLegalDocuments([newDoc, ...this.getLegalDocuments()]);
    this.logAudit('Legal Document Created', `Created ${newDoc.title}`);
    return newDoc;
  }

  // --- App Remote Config ---
  public getMobileAppRemoteConfig(): MobileAppRemoteConfig {
    return this.getItem<MobileAppRemoteConfig>('manpowerlink_remote_config_v1', {
      appName: 'ManPowerLink',
      tagline: 'Instant On-Demand Temporary Labor Marketplace',
      publicLogoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?auto=format&fit=crop&w=400&q=80',
      customerSupportEmail: 'support@manpowerlink.com',
      employeeSupportEmail: 'worker-support@manpowerlink.com',
      supportPhone: '+91 800 555 0199',
      whatsappSupportUrl: 'https://wa.me/919900155432',
      allowNewRegistrations: true,
      maintenanceMode: false,
      maintenanceMessage: 'ManPowerLink is currently undergoing scheduled platform upgrades. We will be back shortly.',
      minCustomerAppVersion: '1.0.0',
      latestCustomerAppVersion: '1.0.0',
      forceCustomerUpgrade: false,
      minEmployeeAppVersion: '1.0.0',
      latestEmployeeAppVersion: '1.0.0',
      forceEmployeeUpgrade: false,
      forceUpdateMessage: 'A new version with critical safety, live location tracking and payment security is required.',
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
          audience: 'employee',
          isActive: true,
          type: 'info',
        },
      ],
    });
  }

  public setMobileAppRemoteConfig(config: MobileAppRemoteConfig): void {
    this.setItem('manpowerlink_remote_config_v1', config);
    this.logAudit('Mobile Remote Config Published', `Maintenance Mode: ${config.maintenanceMode}`);
  }

  // --- Settings Audit History ---
  public getSettingsAuditHistory(): SettingsAuditRecord[] {
    return this.getItem<SettingsAuditRecord[]>('manpowerlink_settings_audit_v1', [
      {
        id: 'aud-set-1',
        adminId: 'admin-1',
        adminEmail: 'admin@manpowerlink.com',
        action: 'UPDATE_BRANDING',
        section: 'Branding & Logo',
        fieldChanged: 'tagline',
        oldValue: 'On-demand labor app',
        newValue: 'Instant On-Demand Temporary Labor Marketplace',
        timestamp: '2026-10-13 10:14 AM',
        ipAddress: '192.168.1.42',
      },
      {
        id: 'aud-set-2',
        adminId: 'admin-1',
        adminEmail: 'admin@manpowerlink.com',
        action: 'PUBLISH_LEGAL_DOC',
        section: 'Legal Documents',
        fieldChanged: 'privacy-policy',
        oldValue: 'v1.1.0',
        newValue: 'v1.2.0 (Effective 2026-01-01)',
        timestamp: '2026-10-13 11:30 AM',
        ipAddress: '192.168.1.42',
      },
    ]);
  }

  public addSettingsAuditRecord(record: Omit<SettingsAuditRecord, 'id' | 'timestamp'>): void {
    const newRecord: SettingsAuditRecord = {
      ...record,
      id: `aud-set-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
    };
    const list = [newRecord, ...this.getSettingsAuditHistory()];
    this.setItem('manpowerlink_settings_audit_v1', list);
  }

  // Reset all to defaults
  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.WORKERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.COMMISSION);
    localStorage.removeItem(STORAGE_KEYS.OTP);
    localStorage.removeItem(STORAGE_KEYS.DISPUTES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem('manpowerlink_admin_users_v1');
    localStorage.removeItem('manpowerlink_safety_incidents_v1');
    localStorage.removeItem('manpowerlink_matching_v1');
    localStorage.removeItem('manpowerlink_branding_v1');
    localStorage.removeItem('manpowerlink_general_settings_v1');
    localStorage.removeItem('manpowerlink_legal_docs_v1');
    localStorage.removeItem('manpowerlink_remote_config_v1');
    localStorage.removeItem('manpowerlink_settings_audit_v1');
    this.notify();
  }
}

export const dataService = new DataService();
