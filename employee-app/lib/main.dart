import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_ringtone_player_plus/flutter_ringtone_player_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'widgets/worker_create_job_sheet.dart';

void main() {
  runApp(const ProviderScope(child: ManPowerLinkWorkerApp()));
}

// ---------------------------------------------------------------------------
// 0. WORKER ALERT RINGER (LOUD SYSTEM RINGTONE & CONTINUOUS VIBRATION)
// ---------------------------------------------------------------------------
class WorkerAlertRinger {
  static Timer? _vibrationTimer;
  static bool _isRinging = false;
  static const _player = RingtonePlayer();

  static bool get isRinging => _isRinging;

  static void startRinging() {
    if (_isRinging) return;
    _isRinging = true;
    try {
      _player.playRingtone(
        looping: true,
        volume: 1.0,
      );
    } catch (e) {
      debugPrint('WorkerAlertRinger start error: $e');
    }

    _vibrationTimer?.cancel();
    HapticFeedback.heavyImpact();
    _vibrationTimer = Timer.periodic(const Duration(milliseconds: 650), (_) {
      HapticFeedback.heavyImpact();
    });
  }

  static void stopRinging() {
    _isRinging = false;
    try {
      _player.stop();
    } catch (e) {
      debugPrint('WorkerAlertRinger stop error: $e');
    }
    _vibrationTimer?.cancel();
    _vibrationTimer = null;
  }
}

// ---------------------------------------------------------------------------
// 0. BRAND THEME & COLORS
// ---------------------------------------------------------------------------
class WorkerTheme {
  static const Color primaryRed = Color(0xFFD71920);
  static const Color darkRed = Color(0xFFA80F18);
  static const Color primaryYellow = Color(0xFFFFC928);
  static const Color darkGold = Color(0xFFE5A900);
  static const Color backgroundColor = Color(0xFFFFFDF8);
  static const Color cardColor = Colors.white;
  static const Color textPrimary = Color(0xFF202124);
  static const Color textSecondary = Color(0xFF686868);
  static const Color successGreen = Color(0xFF16834A);
}

// ---------------------------------------------------------------------------
// 1. DATA MODELS FOR JOBS, EARNINGS, WITHDRAWALS & PAYOUT METHODS
// ---------------------------------------------------------------------------
class PayoutMethod {
  final String id;
  final String type; // 'bank_transfer' | 'upi'
  final String title;
  final String maskedDetails;
  final String accountHolder;
  final String? ifsc;
  final bool isDefault;

  PayoutMethod({
    required this.id,
    required this.type,
    required this.title,
    required this.maskedDetails,
    required this.accountHolder,
    this.ifsc,
    this.isDefault = false,
  });

  PayoutMethod copyWith({bool? isDefault}) {
    return PayoutMethod(
      id: id,
      type: type,
      title: title,
      maskedDetails: maskedDetails,
      accountHolder: accountHolder,
      ifsc: ifsc,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}

class WithdrawalRecord {
  final String id;
  final double amount;
  final double fee;
  final double netAmount;
  final String methodSummary;
  final String status; // 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
  final String createdAt;
  final String? payoutReference;
  final String? rejectionReason;

  WithdrawalRecord({
    required this.id,
    required this.amount,
    this.fee = 0.0,
    required this.netAmount,
    required this.methodSummary,
    required this.status,
    required this.createdAt,
    this.payoutReference,
    this.rejectionReason,
  });
}

class EarningsTransaction {
  final String id;
  final String title;
  final double amount;
  final String type; // 'CREDIT' | 'DEBIT' | 'FEE'
  final String date;
  final String? orderId;

  EarningsTransaction({
    required this.id,
    required this.title,
    required this.amount,
    required this.type,
    required this.date,
    this.orderId,
  });
}

class AssignedJob {
  final String id;
  final String orderNumber;
  final String title;
  final String category;
  final String customerName;
  final String customerPhone;
  final String address;
  final double dailyWage;
  final int workersNeeded;
  int workersAccepted;
  String status; // 'ASSIGNED' | 'ARRIVAL_VERIFIED' | 'WORK_IN_PROGRESS' | 'WORK_COMPLETED'
  final String startOtp;
  final String endOtp;
  final String scheduledTime;
  bool isOnBreak;
  final String? remarks;
  final String? pricingType; // 'HOURLY' | 'DAILY' | 'FULL_PACKAGE'
  final double? hourlyRate;
  final String? durationPackage;
  final String? approxTimeToComplete;
  final double latitude;
  final double longitude;
  final double? distanceInKm;

  AssignedJob({
    required this.id,
    required this.orderNumber,
    required this.title,
    required this.category,
    required this.customerName,
    required this.customerPhone,
    required this.address,
    required this.dailyWage,
    required this.workersNeeded,
    required this.workersAccepted,
    required this.status,
    required this.startOtp,
    required this.endOtp,
    required this.scheduledTime,
    this.isOnBreak = false,
    this.remarks,
    this.pricingType = 'DAILY',
    this.hourlyRate,
    this.durationPackage,
    this.approxTimeToComplete,
    this.latitude = 12.9141,
    this.longitude = 74.8560,
    this.distanceInKm = 1.4,
  });
}

// ---------------------------------------------------------------------------
// 2. STATE MANAGEMENT (AUTH, JOBS, EARNINGS)
// ---------------------------------------------------------------------------

// Worker Auth State
class WorkerAuthState {
  final bool isAuthenticated;
  final String? workerName;
  final String? workerPhone;
  final String? category;
  final double rating;
  final bool isVerified;

  const WorkerAuthState({
    this.isAuthenticated = false,
    this.workerName,
    this.workerPhone,
    this.category,
    this.rating = 4.9,
    this.isVerified = true,
  });

  WorkerAuthState copyWith({
    bool? isAuthenticated,
    String? workerName,
    String? workerPhone,
    String? category,
    double? rating,
    bool? isVerified,
  }) {
    return WorkerAuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      workerName: workerName ?? this.workerName,
      workerPhone: workerPhone ?? this.workerPhone,
      category: category ?? this.category,
      rating: rating ?? this.rating,
      isVerified: isVerified ?? this.isVerified,
    );
  }
}

class WorkerAuthNotifier extends StateNotifier<WorkerAuthState> {
  WorkerAuthNotifier() : super(const WorkerAuthState());

  void signIn(String phone, String password) {
    state = state.copyWith(
      isAuthenticated: true,
      workerName: 'Ramesh Kumar',
      workerPhone: phone.isNotEmpty ? phone : '+91 98765 43210',
      category: 'Loading & Unloading',
      rating: 4.9,
      isVerified: true,
    );
  }

  void signUp(String name, String phone, String category, String password) {
    state = state.copyWith(
      isAuthenticated: true,
      workerName: name,
      workerPhone: phone,
      category: category,
      rating: 5.0,
      isVerified: false,
    );
  }

  void signOut() {
    state = const WorkerAuthState(isAuthenticated: false);
  }
}

final workerAuthProvider = StateNotifierProvider<WorkerAuthNotifier, WorkerAuthState>((ref) {
  return WorkerAuthNotifier();
});

// Worker Earnings & Financial Ledger State
class WorkerFinancialState {
  final double availableBalance;
  final double pendingBalance;
  final double reservedBalance;
  final double withdrawnTotal;
  final double prepaidWalletBalance; // Worker's prepaid wallet for platform commission deduction
  final double minimumWalletBalance; // Min balance required to receive job broadcasts (₹100)
  final double totalCashCollected;   // Direct cash & worker UPI collected from employers
  final List<PayoutMethod> payoutMethods;
  final List<WithdrawalRecord> withdrawals;
  final List<EarningsTransaction> transactions;

  const WorkerFinancialState({
    this.availableBalance = 4200.0,
    this.pendingBalance = 800.0,
    this.reservedBalance = 0.0,
    this.withdrawnTotal = 12400.0,
    this.prepaidWalletBalance = 350.0, // Initial recharge above ₹100
    this.minimumWalletBalance = 100.0,
    this.totalCashCollected = 24500.0,
    this.payoutMethods = const [],
    this.withdrawals = const [],
    this.transactions = const [],
  });

  bool get isWalletActive => prepaidWalletBalance >= minimumWalletBalance;

  WorkerFinancialState copyWith({
    double? availableBalance,
    double? pendingBalance,
    double? reservedBalance,
    double? withdrawnTotal,
    double? prepaidWalletBalance,
    double? minimumWalletBalance,
    double? totalCashCollected,
    List<PayoutMethod>? payoutMethods,
    List<WithdrawalRecord>? withdrawals,
    List<EarningsTransaction>? transactions,
  }) {
    return WorkerFinancialState(
      availableBalance: availableBalance ?? this.availableBalance,
      pendingBalance: pendingBalance ?? this.pendingBalance,
      reservedBalance: reservedBalance ?? this.reservedBalance,
      withdrawnTotal: withdrawnTotal ?? this.withdrawnTotal,
      prepaidWalletBalance: prepaidWalletBalance ?? this.prepaidWalletBalance,
      minimumWalletBalance: minimumWalletBalance ?? this.minimumWalletBalance,
      totalCashCollected: totalCashCollected ?? this.totalCashCollected,
      payoutMethods: payoutMethods ?? this.payoutMethods,
      withdrawals: withdrawals ?? this.withdrawals,
      transactions: transactions ?? this.transactions,
    );
  }
}

class WorkerFinancialNotifier extends StateNotifier<WorkerFinancialState> {
  WorkerFinancialNotifier()
      : super(WorkerFinancialState(
          availableBalance: 4200.0,
          pendingBalance: 800.0,
          reservedBalance: 0.0,
          withdrawnTotal: 12400.0,
          prepaidWalletBalance: 350.0,
          minimumWalletBalance: 100.0,
          totalCashCollected: 24500.0,
          payoutMethods: [
            PayoutMethod(
              id: 'pm-1',
              type: 'bank_transfer',
              title: 'HDFC Bank Account',
              maskedDetails: 'HDFC Bank •••• 4321',
              accountHolder: 'Ramesh Kumar',
              ifsc: 'HDFC0001234',
              isDefault: true,
            ),
            PayoutMethod(
              id: 'pm-2',
              type: 'upi',
              title: 'Primary UPI VPA',
              maskedDetails: 'ramesh@okhdfcbank',
              accountHolder: 'Ramesh Kumar',
              isDefault: false,
            ),
          ],
          withdrawals: [
            WithdrawalRecord(
              id: 'WDR-1092',
              amount: 2500.0,
              netAmount: 2500.0,
              methodSummary: 'HDFC Bank •••• 4321',
              status: 'PAID',
              createdAt: '12 Oct 2026, 03:45 PM',
              payoutReference: 'UTR8899221144',
            ),
            WithdrawalRecord(
              id: 'WDR-1091',
              amount: 1500.0,
              netAmount: 1500.0,
              methodSummary: 'ramesh@okhdfcbank',
              status: 'PAID',
              createdAt: '08 Oct 2026, 11:20 AM',
              payoutReference: 'UTR7711223399',
            ),
          ],
          transactions: [
            EarningsTransaction(
              id: 'TXN-902',
              title: 'Order #1041 Cash Shift Completed',
              amount: 1800.0,
              type: 'CREDIT',
              date: '13 Oct 2026, 06:10 PM',
              orderId: 'ORD-1041',
            ),
            EarningsTransaction(
              id: 'TXN-901',
              title: 'Platform Fee (10% Commission)',
              amount: 200.0,
              type: 'FEE',
              date: '13 Oct 2026, 06:10 PM',
              orderId: 'ORD-1041',
            ),
            EarningsTransaction(
              id: 'TXN-880',
              title: 'Bank Withdrawal Payout',
              amount: 2500.0,
              type: 'DEBIT',
              date: '12 Oct 2026, 03:45 PM',
            ),
          ],
        ));

  void addPayoutMethod(PayoutMethod method) {
    final updated = List<PayoutMethod>.from(state.payoutMethods);
    if (method.isDefault) {
      for (int i = 0; i < updated.length; i++) {
        updated[i] = updated[i].copyWith(isDefault: false);
      }
    }
    updated.add(method);
    state = state.copyWith(payoutMethods: updated);
  }

  void setDefaultPayoutMethod(String id) {
    final updated = state.payoutMethods.map((m) {
      return m.copyWith(isDefault: m.id == id);
    }).toList();
    state = state.copyWith(payoutMethods: updated);
  }

  void deletePayoutMethod(String id) {
    final updated = state.payoutMethods.where((m) => m.id != id).toList();
    state = state.copyWith(payoutMethods: updated);
  }

  bool requestWithdrawal(double amount, PayoutMethod method) {
    if (amount < 100.0 || amount > state.availableBalance) {
      return false;
    }

    final newWdrId = 'WDR-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final newWithdrawal = WithdrawalRecord(
      id: newWdrId,
      amount: amount,
      netAmount: amount,
      methodSummary: method.maskedDetails,
      status: 'PENDING',
      createdAt: 'Today, Just now',
    );

    final newTxn = EarningsTransaction(
      id: 'TXN-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      title: 'Withdrawal Requested (${method.maskedDetails})',
      amount: amount,
      type: 'DEBIT',
      date: 'Today, Just now',
    );

    state = state.copyWith(
      availableBalance: state.availableBalance - amount,
      reservedBalance: state.reservedBalance + amount,
      withdrawals: [newWithdrawal, ...state.withdrawals],
      transactions: [newTxn, ...state.transactions],
    );
    return true;
  }

  // Recharge prepaid wallet via UPI
  void rechargePrepaidWallet(double amount, String paymentMethod) {
    final newTxn = EarningsTransaction(
      id: 'TXN-RCHG-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      title: 'Prepaid Wallet Top-Up ($paymentMethod)',
      amount: amount,
      type: 'CREDIT',
      date: 'Today, Just now',
    );

    state = state.copyWith(
      prepaidWalletBalance: state.prepaidWalletBalance + amount,
      transactions: [newTxn, ...state.transactions],
    );
  }

  // Deduct 10% platform commission from worker's prepaid wallet when worker collects cash/UPI
  bool deductCommissionForCashJob(double grossAmount, String orderNumber) {
    final commission = grossAmount * 0.10; // 10% admin platform commission

    final cashTxn = EarningsTransaction(
      id: 'TXN-CASH-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      title: 'Cash/Direct UPI Received (Order #$orderNumber)',
      amount: grossAmount,
      type: 'CREDIT',
      date: 'Today, Just now',
      orderId: orderNumber,
    );

    final feeTxn = EarningsTransaction(
      id: 'TXN-COMM-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      title: 'Admin Commission (10% on Order #$orderNumber)',
      amount: commission,
      type: 'FEE',
      date: 'Today, Just now',
      orderId: orderNumber,
    );

    state = state.copyWith(
      prepaidWalletBalance: state.prepaidWalletBalance - commission,
      totalCashCollected: state.totalCashCollected + grossAmount,
      transactions: [cashTxn, feeTxn, ...state.transactions],
    );

    return state.prepaidWalletBalance >= state.minimumWalletBalance;
  }

  void creditCompletedShiftEarnings(double grossAmount, String orderNumber) {
    deductCommissionForCashJob(grossAmount, orderNumber);
  }
}

final workerFinancialProvider =
    StateNotifierProvider<WorkerFinancialNotifier, WorkerFinancialState>((ref) {
  return WorkerFinancialNotifier();
});

// Worker Jobs & Radar State
class WorkerJobsState {
  final List<AssignedJob> radarJobs;
  final List<AssignedJob> myWorkJobs;

  const WorkerJobsState({
    this.radarJobs = const [],
    this.myWorkJobs = const [],
  });

  WorkerJobsState copyWith({
    List<AssignedJob>? radarJobs,
    List<AssignedJob>? myWorkJobs,
  }) {
    return WorkerJobsState(
      radarJobs: radarJobs ?? this.radarJobs,
      myWorkJobs: myWorkJobs ?? this.myWorkJobs,
    );
  }
}

class WorkerJobsNotifier extends StateNotifier<WorkerJobsState> {
  WorkerJobsNotifier()
      : super(WorkerJobsState(
          radarJobs: [
            AssignedJob(
              id: 'job-101',
              orderNumber: '1046',
              title: 'Warehouse Pallet Stacking',
              category: 'Loading & Unloading',
              customerName: 'Coastal Freightways',
              customerPhone: '+91 99002 88771',
              address: 'Baikampady Industrial Estate Gate 2, Mangalore',
              dailyWage: 2200.0,
              workersNeeded: 4,
              workersAccepted: 2,
              status: 'AVAILABLE',
              startOtp: '4192',
              endOtp: '8831',
              scheduledTime: 'Today, 02:00 PM - 10:00 PM',
              pricingType: 'HOURLY',
              hourlyRate: 275.0,
              durationPackage: 'Hourly Basis (8 hrs)',
              approxTimeToComplete: '8 Hours',
              remarks: 'Report to Gate 2. Safety helmet & boots mandatory. Heavy pallet loading.',
            ),
            AssignedJob(
              id: 'job-102',
              orderNumber: '1047',
              title: 'Catering Support - Wedding Banquet',
              category: 'Food & Catering Services',
              customerName: 'Royal Mangalore Banquets',
              customerPhone: '+91 99003 44552',
              address: 'Kodialbail Main Hall, Mangalore',
              dailyWage: 1800.0,
              workersNeeded: 6,
              workersAccepted: 3,
              status: 'AVAILABLE',
              startOtp: '7234',
              endOtp: '1982',
              scheduledTime: 'Tomorrow, 09:00 AM - 05:00 PM',
              pricingType: 'FULL_PACKAGE',
              durationPackage: 'Full Package (Lump Sum)',
              approxTimeToComplete: 'Approx 6 Hours',
              remarks: 'Banquet dinner hall setup, buffet counter management, and post-event cleanup.',
            ),
          ],
          myWorkJobs: [
            AssignedJob(
              id: 'job-active-1',
              orderNumber: '1045',
              title: 'Container De-stuffing & Unloading',
              category: 'Loading & Unloading',
              customerName: 'Apex Logistics Mangalore',
              customerPhone: '+91 99001 55432',
              address: 'Panambur Container Terminal Dock 4, Mangalore',
              dailyWage: 2000.0,
              workersNeeded: 5,
              workersAccepted: 5,
              status: 'ASSIGNED',
              startOtp: '5918',
              endOtp: '9204',
              scheduledTime: 'Today, 08:00 AM - 04:00 PM',
              pricingType: 'DAILY',
              durationPackage: 'Single Shift (8 hrs)',
              remarks: 'Unloading 40ft container at dock 4. Tiffin meals and water provided by employer.',
            ),
          ],
        ));

  AssignedJob createAndBroadcastJob({
    required String title,
    required String category,
    required String customerName,
    required String customerPhone,
    required String address,
    required double dailyWage,
    required int workersNeeded,
    required String scheduledTime,
    String pricingType = 'DAILY',
    double? hourlyRate,
    String? durationPackage,
    String? approxTimeToComplete,
    String? remarks,
    double latitude = 12.9141,
    double longitude = 74.8560,
  }) {
    final orderNum = (1048 + state.radarJobs.length + state.myWorkJobs.length).toString();
    final newJob = AssignedJob(
      id: 'job-${DateTime.now().millisecondsSinceEpoch}',
      orderNumber: orderNum,
      title: title,
      category: category,
      customerName: customerName,
      customerPhone: customerPhone,
      address: address,
      dailyWage: dailyWage,
      workersNeeded: workersNeeded,
      workersAccepted: 0,
      status: 'AVAILABLE',
      startOtp: (1000 + (DateTime.now().millisecondsSinceEpoch % 9000)).toString(),
      endOtp: (1000 + ((DateTime.now().millisecondsSinceEpoch + 7) % 9000)).toString(),
      scheduledTime: scheduledTime,
      pricingType: pricingType,
      hourlyRate: hourlyRate,
      durationPackage: durationPackage ?? 'Single Shift (8 hrs)',
      approxTimeToComplete: approxTimeToComplete ?? '8 Hours',
      remarks: remarks,
      latitude: latitude,
      longitude: longitude,
    );

    state = state.copyWith(radarJobs: [newJob, ...state.radarJobs]);
    return newJob;
  }

  bool acceptJob(String jobId) {
    final idx = state.radarJobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;
    final job = state.radarJobs[idx];

    if (job.workersAccepted >= job.workersNeeded) {
      return false; // fully staffed
    }

    job.workersAccepted += 1;
    job.status = 'ASSIGNED';

    final updatedRadar = List<AssignedJob>.from(state.radarJobs)..removeAt(idx);
    final updatedMyWork = [job, ...state.myWorkJobs];

    state = state.copyWith(radarJobs: updatedRadar, myWorkJobs: updatedMyWork);
    return true;
  }

  void rejectJob(String jobId) {
    final updatedRadar = state.radarJobs.where((j) => j.id != jobId).toList();
    state = state.copyWith(radarJobs: updatedRadar);
  }

  void counterBidJob(String jobId, double proposedWage) {
    // Updates status to bid submitted
  }

  void verifyArrival(String jobId) {
    final updated = state.myWorkJobs.map((j) {
      if (j.id == jobId) {
        j.status = 'ARRIVAL_VERIFIED';
      }
      return j;
    }).toList();
    state = state.copyWith(myWorkJobs: updated);
  }

  bool verifyStartOtp(String jobId, String enteredOtp) {
    final idx = state.myWorkJobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;
    final job = state.myWorkJobs[idx];
    final clean = enteredOtp.trim();
    // Accept exact job startOtp or master demo codes (1234, 0000, 5918, 4192, 7234, 4829)
    final matches = clean == job.startOtp ||
        clean == '1234' ||
        clean == '0000' ||
        clean == '5918' ||
        clean == '4192' ||
        clean == '7234' ||
        clean == '4829' ||
        (clean.length == 4 && job.startOtp.isEmpty);

    if (matches) {
      job.status = 'WORK_IN_PROGRESS';
      state = state.copyWith(myWorkJobs: List.from(state.myWorkJobs));
      return true;
    }
    return false;
  }

  void toggleBreak(String jobId) {
    final updated = state.myWorkJobs.map((j) {
      if (j.id == jobId) {
        j.isOnBreak = !j.isOnBreak;
      }
      return j;
    }).toList();
    state = state.copyWith(myWorkJobs: updated);
  }

  bool verifyEndOtp(String jobId, String enteredOtp) {
    final idx = state.myWorkJobs.indexWhere((j) => j.id == jobId);
    if (idx == -1) return false;
    final job = state.myWorkJobs[idx];
    final clean = enteredOtp.trim();
    // Accept exact job endOtp or master demo codes (1234, 0000, 9204, 8831, 1982, 9154)
    final matches = clean == job.endOtp ||
        clean == '1234' ||
        clean == '0000' ||
        clean == '9204' ||
        clean == '8831' ||
        clean == '1982' ||
        clean == '9154' ||
        (clean.length == 4 && job.endOtp.isEmpty);

    if (matches) {
      job.status = 'WORK_COMPLETED';
      state = state.copyWith(myWorkJobs: List.from(state.myWorkJobs));
      return true;
    }
    return false;
  }
}

final workerJobsProvider =
    StateNotifierProvider<WorkerJobsNotifier, WorkerJobsState>((ref) {
  return WorkerJobsNotifier();
});

// ---------------------------------------------------------------------------
// 2B. WORKER NOTIFICATIONS STATE PROVIDER
// ---------------------------------------------------------------------------
class WorkerNotification {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  final bool isRead;
  final String type; // 'SHIFT', 'ARRIVAL', 'START_OTP', 'END_OTP', 'WALLET'

  WorkerNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    this.isRead = false,
    this.type = 'SHIFT',
  });

  WorkerNotification copyWith({bool? isRead}) {
    return WorkerNotification(
      id: id,
      title: title,
      body: body,
      timestamp: timestamp,
      isRead: isRead ?? this.isRead,
      type: type,
    );
  }
}

class WorkerNotificationsNotifier extends StateNotifier<List<WorkerNotification>> {
  WorkerNotificationsNotifier()
      : super([
          WorkerNotification(
            id: 'wnotif-1',
            title: '🔔 Shift Assigned: Order #1045',
            body: 'Container De-stuffing & Unloading (₹2000/day). Please travel to Panambur Dock 4.',
            timestamp: DateTime.now().subtract(const Duration(minutes: 20)),
            type: 'SHIFT',
          ),
          WorkerNotification(
            id: 'wnotif-2',
            title: '📍 Worksite Geofence Active',
            body: 'GPS pin locked at Panambur Container Terminal Dock 4. Verify arrival upon reaching.',
            timestamp: DateTime.now().subtract(const Duration(hours: 1)),
            type: 'ARRIVAL',
          ),
          WorkerNotification(
            id: 'wnotif-3',
            title: '💰 Wage Ready for Withdrawal',
            body: '₹2,000 available balance in wallet. Transfer directly via UPI or IMPS bank payout.',
            timestamp: DateTime.now().subtract(const Duration(hours: 3)),
            type: 'WALLET',
          ),
          WorkerNotification(
            id: 'wnotif-4',
            title: '⚡ Prepaid Matching Active',
            body: 'Prepaid commission wallet has ₹450 balance. Ready to receive instant high-paying shifts.',
            timestamp: DateTime.now().subtract(const Duration(hours: 5)),
            type: 'WALLET',
          ),
        ]);

  void addNotification({
    required String title,
    required String body,
    String type = 'SHIFT',
  }) {
    final notif = WorkerNotification(
      id: 'wnotif-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      body: body,
      timestamp: DateTime.now(),
      type: type,
    );
    state = [notif, ...state];
  }

  void markAsRead(String id) {
    state = state.map((n) => n.id == id ? n.copyWith(isRead: true) : n).toList();
  }

  void markAllAsRead() {
    state = state.map((n) => n.copyWith(isRead: true)).toList();
  }

  void clearAll() {
    state = [];
  }
}

final workerNotificationsProvider =
    StateNotifierProvider<WorkerNotificationsNotifier, List<WorkerNotification>>((ref) {
  return WorkerNotificationsNotifier();
});

// ---------------------------------------------------------------------------
// 3. MAIN APP & ROOT ROUTER
// ---------------------------------------------------------------------------
class ManPowerLinkWorkerApp extends ConsumerWidget {
  const ManPowerLinkWorkerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(workerAuthProvider);

    return MaterialApp(
      title: 'ManPowerLink Worker',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: WorkerTheme.backgroundColor,
        colorScheme: const ColorScheme.light(
          primary: WorkerTheme.primaryRed,
          secondary: WorkerTheme.primaryYellow,
          surface: WorkerTheme.cardColor,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E1F23),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: authState.isAuthenticated
          ? const WorkerMainShell()
          : const WorkerSignInScreen(),
    );
  }
}

// ---------------------------------------------------------------------------
// 4. WORKER AUTHENTICATION SCREENS (Sign In, Sign Up, Forgot Password)
// ---------------------------------------------------------------------------
class WorkerSignInScreen extends ConsumerStatefulWidget {
  const WorkerSignInScreen({super.key});

  @override
  ConsumerState<WorkerSignInScreen> createState() => _WorkerSignInScreenState();
}

class _WorkerSignInScreenState extends ConsumerState<WorkerSignInScreen> {
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _passwordController = TextEditingController(text: 'Worker@2026');
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  void _handleSignIn() {
    final phone = _phoneController.text.trim();
    final pwd = _passwordController.text.trim();

    if (phone.isEmpty || pwd.length < 6) {
      setState(() {
        _errorMessage = 'Please enter valid phone number and password (min 6 chars).';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) {
        ref.read(workerAuthProvider.notifier).signIn(phone, pwd);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              Center(
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: WorkerTheme.primaryYellow,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'W',
                      style: TextStyle(
                        color: Color(0xFF202124),
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Worker Portal',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: WorkerTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Accept shifts, verify attendance with OTP, and withdraw daily earnings instantly.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: WorkerTheme.textSecondary),
              ),
              const SizedBox(height: 32),
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(_errorMessage!,
                      style: const TextStyle(color: Colors.red, fontSize: 12)),
                ),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Registered Mobile Number',
                  prefixIcon: const Icon(Icons.phone_android,
                      color: WorkerTheme.primaryRed),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline,
                      color: WorkerTheme.primaryRed),
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: Colors.grey),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const WorkerForgotPasswordScreen()),
                    );
                  },
                  child: const Text(
                    'Forgot Password?',
                    style: TextStyle(
                      color: WorkerTheme.primaryRed,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSignIn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: WorkerTheme.primaryRed,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Sign In to Work Portal',
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('New worker?',
                      style: TextStyle(color: WorkerTheme.textSecondary)),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const WorkerSignUpScreen()),
                      );
                    },
                    child: const Text('Register as Verified Worker',
                        style: TextStyle(
                            color: WorkerTheme.primaryRed,
                            fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class WorkerSignUpScreen extends ConsumerStatefulWidget {
  const WorkerSignUpScreen({super.key});

  @override
  ConsumerState<WorkerSignUpScreen> createState() => _WorkerSignUpScreenState();
}

class _WorkerSignUpScreenState extends ConsumerState<WorkerSignUpScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _selectedCategory = 'Loading & Unloading';
  bool _termsAccepted = false;
  String? _error;

  void _handleRegister() {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final pwd = _passwordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();

    if (name.isEmpty || phone.isEmpty || pwd.length < 6) {
      setState(() => _error = 'Please fill all required fields (pwd min 6 chars).');
      return;
    }
    if (pwd != confirm) {
      setState(() => _error = 'Passwords do not match.');
      return;
    }
    if (!_termsAccepted) {
      setState(() => _error = 'You must accept the Worker Safety & Payout Guidelines.');
      return;
    }

    ref.read(workerAuthProvider.notifier).signUp(name, phone, _selectedCategory, pwd);
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Worker registered! Pending Aadhaar KYC verification.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Registration'),
        leading: const BackButton(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
              ),
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name as per Aadhaar')),
            const SizedBox(height: 12),
            TextField(controller: _phoneController, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Mobile Number')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(labelText: 'Primary Work Skill'),
              items: const [
                DropdownMenuItem(value: 'Loading & Unloading', child: Text('Loading & Unloading')),
                DropdownMenuItem(value: 'Food & Catering Services', child: Text('Food & Catering Services')),
                DropdownMenuItem(value: 'Housekeeping & Cleaning', child: Text('Housekeeping & Cleaning')),
                DropdownMenuItem(value: 'Warehouse & Packaging', child: Text('Warehouse & Packaging')),
              ],
              onChanged: (val) => setState(() => _selectedCategory = val ?? _selectedCategory),
            ),
            const SizedBox(height: 12),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
            const SizedBox(height: 12),
            TextField(controller: _confirmPasswordController, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm Password')),
            const SizedBox(height: 12),
            CheckboxListTile(
              value: _termsAccepted,
              onChanged: (val) => setState(() => _termsAccepted = val ?? false),
              title: const Text('I agree to Worker Guidelines, Payout Terms, and Safety Protocols', style: TextStyle(fontSize: 12)),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _handleRegister,
                style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
                child: const Text('Create Worker Account', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class WorkerForgotPasswordScreen extends StatelessWidget {
  const WorkerForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = TextEditingController();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Password Recovery'),
        leading: const BackButton(),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Enter your registered mobile number to receive a 4-digit SMS OTP challenge.', style: TextStyle(color: WorkerTheme.textSecondary)),
            const SizedBox(height: 16),
            TextField(controller: controller, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Mobile Number')),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('SMS OTP sent to mobile.')));
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
              child: const Text('Send SMS Challenge'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 4B. INCOMING JOB RINGING MODAL (LOUD ALARM AUDIO + VIBRATION + DISPATCH)
// ---------------------------------------------------------------------------
class IncomingJobRingingDialog extends ConsumerStatefulWidget {
  final AssignedJob job;
  final VoidCallback? onAccepted;

  const IncomingJobRingingDialog({
    super.key,
    required this.job,
    this.onAccepted,
  });

  @override
  ConsumerState<IncomingJobRingingDialog> createState() => _IncomingJobRingingDialogState();
}

class _IncomingJobRingingDialogState extends ConsumerState<IncomingJobRingingDialog> {
  int _secondsRemaining = 30;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    // Start continuous ringtone and vibration
    WorkerAlertRinger.startRinging();

    // 30-second response window countdown
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsRemaining > 1) {
        setState(() => _secondsRemaining--);
      } else {
        _countdownTimer?.cancel();
        WorkerAlertRinger.stopRinging();
        Navigator.of(context, rootNavigator: true).pop();
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    WorkerAlertRinger.stopRinging();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final finState = ref.watch(workerFinancialProvider);
    final canAccept = finState.isWalletActive;

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (_, __) => WorkerAlertRinger.stopRinging(),
      child: Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: WorkerTheme.primaryRed, width: 2),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Ringing Alert Header
              Container(
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: WorkerTheme.primaryRed,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.ring_volume, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '🔊 NEW SHIFT BROADCAST',
                            style: TextStyle(
                              color: WorkerTheme.darkRed,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            'App Ringing Live · Respond in ${_secondsRemaining}s',
                            style: const TextStyle(fontSize: 11, color: Colors.red, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Job Details
              Text(
                widget.job.title,
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: WorkerTheme.textPrimary),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      widget.job.category,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: WorkerTheme.textPrimary),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('Order #${widget.job.orderNumber}',
                      style: const TextStyle(fontSize: 11, color: WorkerTheme.textSecondary)),
                ],
              ),
              const SizedBox(height: 10),

              // Location & Live GPS Distance
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on, size: 16, color: WorkerTheme.primaryRed),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.job.address,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: WorkerTheme.textPrimary),
                        ),
                        const SizedBox(height: 3),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: WorkerTheme.primaryYellow.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.gps_fixed, size: 10, color: WorkerTheme.darkGold),
                              const SizedBox(width: 3),
                              Text(
                                '${widget.job.distanceInKm ?? 1.4} km away (Live GPS Pin)',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: WorkerTheme.darkGold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.schedule, size: 16, color: WorkerTheme.primaryRed),
                  const SizedBox(width: 6),
                  Text(widget.job.scheduledTime, style: const TextStyle(fontSize: 12, color: WorkerTheme.darkGold, fontWeight: FontWeight.bold)),
                ],
              ),
              if (widget.job.remarks != null && widget.job.remarks!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Notes: ${widget.job.remarks}',
                    style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: WorkerTheme.textPrimary),
                  ),
                ),
              ],
              const SizedBox(height: 12),

              // Wage Card (Cash & Commission Deduction Notice)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF86EFAC)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Wages (Cash / Worker UPI)',
                            style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary)),
                        Text(
                          '₹${widget.job.dailyWage.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: WorkerTheme.successGreen,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('Admin Commission', style: TextStyle(fontSize: 10, color: Colors.grey)),
                        Text(
                          '₹${(widget.job.dailyWage * 0.10).toStringAsFixed(0)} (10%)',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        const Text('Deducted from prepaid wallet', style: TextStyle(fontSize: 9, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Action Buttons
              if (!canAccept) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.shade300),
                  ),
                  child: const Text(
                    '⚠️ Wallet balance below ₹100. Please recharge to accept.',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.brown),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    WorkerAlertRinger.stopRinging();
                    Navigator.of(context, rootNavigator: true).pop();
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      builder: (_) => const WorkerWalletRechargeSheet(),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber.shade800,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Recharge Prepaid Wallet Now'),
                ),
              ] else ...[
                ElevatedButton.icon(
                  onPressed: () {
                    WorkerAlertRinger.stopRinging();
                    final ok = ref.read(workerJobsProvider.notifier).acceptJob(widget.job.id);
                    Navigator.of(context, rootNavigator: true).pop();
                    widget.onAccepted?.call();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(ok
                            ? 'Shift Accepted! Cash payment of ₹${widget.job.dailyWage.toStringAsFixed(0)} will be collected at worksite.'
                            : 'This shift has already reached full capacity.'),
                        backgroundColor: ok ? WorkerTheme.successGreen : WorkerTheme.primaryRed,
                      ),
                    );
                  },
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('ACCEPT SHIFT & STOP RINGING', style: TextStyle(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: WorkerTheme.successGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () {
                  WorkerAlertRinger.stopRinging();
                  ref.read(workerJobsProvider.notifier).rejectJob(widget.job.id);
                  Navigator.of(context, rootNavigator: true).pop();
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.grey.shade700,
                  side: BorderSide(color: Colors.grey.shade300),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Decline Shift'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 4C. WORKER PREPAID WALLET RECHARGE SHEET (UPI INSTANT TOP-UP)
// ---------------------------------------------------------------------------
class WorkerWalletRechargeSheet extends ConsumerStatefulWidget {
  const WorkerWalletRechargeSheet({super.key});

  @override
  ConsumerState<WorkerWalletRechargeSheet> createState() => _WorkerWalletRechargeSheetState();
}

class _WorkerWalletRechargeSheetState extends ConsumerState<WorkerWalletRechargeSheet> {
  double _rechargeAmount = 250.0;
  String _selectedPaymentMethod = 'PhonePe UPI';
  bool _isProcessing = false;

  final List<double> _quickAmounts = const [100.0, 250.0, 500.0, 1000.0];
  final List<String> _paymentMethods = const ['PhonePe UPI', 'Google Pay UPI', 'Paytm UPI', 'BHIM UPI'];

  void _handleRecharge() {
    if (_rechargeAmount < 100.0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Minimum wallet recharge is ₹100.')),
      );
      return;
    }

    setState(() => _isProcessing = true);

    Future.delayed(const Duration(milliseconds: 700), () {
      if (!mounted) return;
      ref.read(workerFinancialProvider.notifier).rechargePrepaidWallet(_rechargeAmount, _selectedPaymentMethod);
      setState(() => _isProcessing = false);
      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '₹${_rechargeAmount.toStringAsFixed(0)} successfully recharged via $_selectedPaymentMethod! You are now eligible for live ringing job requests.',
          ),
          backgroundColor: WorkerTheme.successGreen,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final finState = ref.watch(workerFinancialProvider);

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recharge Prepaid Wallet',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: WorkerTheme.textPrimary),
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 6),
          // Current Balance Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: finState.isWalletActive ? Colors.green.shade50 : Colors.red.shade50,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: finState.isWalletActive ? Colors.green.shade200 : Colors.red.shade200),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Current Prepaid Balance', style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary)),
                    Text(
                      '₹${finState.prepaidWalletBalance.toStringAsFixed(0)}',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: finState.isWalletActive ? WorkerTheme.successGreen : WorkerTheme.primaryRed,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: finState.isWalletActive ? WorkerTheme.successGreen : WorkerTheme.primaryRed,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    finState.isWalletActive ? 'ACTIVE (RINGING OK)' : 'LOW BALANCE (PAUSED)',
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          const Text(
            'ℹ️ Workers collect 100% of shift wages in Cash or to their personal UPI directly from the employer. Admin deducts a 10% platform commission from this prepaid balance. Maintain at least ₹100 to receive ringing job dispatches.',
            style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
          ),
          const SizedBox(height: 16),

          const Text('Select Recharge Amount (₹)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 8),
          Row(
            children: _quickAmounts.map((amt) {
              final isSel = _rechargeAmount == amt;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: Text('₹${amt.toStringAsFixed(0)}',
                        style: TextStyle(
                          color: isSel ? Colors.white : Colors.black87,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        )),
                    selected: isSel,
                    selectedColor: WorkerTheme.primaryRed,
                    onSelected: (_) => setState(() => _rechargeAmount = amt),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          const Text('Select UPI Payment Method', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _paymentMethods.map((pm) {
              final isSel = _selectedPaymentMethod == pm;
              return ChoiceChip(
                label: Text(pm, style: TextStyle(color: isSel ? Colors.white : Colors.black87, fontSize: 12)),
                selected: isSel,
                selectedColor: Colors.blue.shade800,
                onSelected: (_) => setState(() => _selectedPaymentMethod = pm),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: _isProcessing ? null : _handleRecharge,
              style: ElevatedButton.styleFrom(
                backgroundColor: WorkerTheme.primaryRed,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _isProcessing
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(
                      'Pay ₹${_rechargeAmount.toStringAsFixed(0)} via $_selectedPaymentMethod',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 5. MAIN AUTHENTICATED SHELL (5 FIXED DESTINATIONS)
// ---------------------------------------------------------------------------
class WorkerMainShell extends StatefulWidget {
  const WorkerMainShell({super.key});

  @override
  State<WorkerMainShell> createState() => _WorkerMainShellState();
}

class _WorkerMainShellState extends State<WorkerMainShell> {
  int _selectedIndex = 0;
  DateTime? _lastBackPressTime;

  final List<Widget> _screens = const [
    WorkerHomeTab(),
    WorkerFindJobsTab(),
    WorkerMyWorkTab(),
    WorkerMessagesTab(),
    WorkerProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_selectedIndex != 0) {
          // If on any tab other than Home, navigate back to Home first
          setState(() => _selectedIndex = 0);
        } else {
          // On Home tab, prompt double-tap to confirm exit
          final now = DateTime.now();
          if (_lastBackPressTime == null || now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
            _lastBackPressTime = now;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Press back again to exit ManPowerLink Worker'),
                duration: Duration(seconds: 2),
              ),
            );
          } else {
            SystemNavigator.pop();
          }
        }
      },
      child: Scaffold(
        body: IndexedStack(
          index: _selectedIndex,
          children: _screens,
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          backgroundColor: Colors.white,
          indicatorColor: WorkerTheme.primaryYellow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home, color: WorkerTheme.primaryRed),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.search),
              selectedIcon: Icon(Icons.search, color: WorkerTheme.primaryRed),
              label: 'Find Jobs',
            ),
            NavigationDestination(
              icon: Icon(Icons.work_outline),
              selectedIcon: Icon(Icons.work, color: WorkerTheme.primaryRed),
              label: 'My Work',
            ),
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline),
              selectedIcon: Icon(Icons.chat_bubble, color: WorkerTheme.primaryRed),
              label: 'Messages',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: WorkerTheme.primaryRed),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 6. TAB 1: WORKER HOME (EARNINGS SUMMARY & ACTIVE SHIFTS)
// ---------------------------------------------------------------------------
class WorkerHomeTab extends ConsumerStatefulWidget {
  const WorkerHomeTab({super.key});

  @override
  ConsumerState<WorkerHomeTab> createState() => _WorkerHomeTabState();
}

class _WorkerHomeTabState extends ConsumerState<WorkerHomeTab> {
  bool _isOnline = true;

  @override
  Widget build(BuildContext context) {
    final finState = ref.watch(workerFinancialProvider);
    final jobsState = ref.watch(workerJobsProvider);
    final notifs = ref.watch(workerNotificationsProvider);
    final unreadCount = notifs.where((n) => !n.isRead).length;
    final activeJob = jobsState.myWorkJobs.isNotEmpty ? jobsState.myWorkJobs.first : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              backgroundColor: WorkerTheme.primaryRed,
              child: const Icon(Icons.notifications_outlined),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const WorkerNotificationsScreen()),
              );
            },
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: FilterChip(
              label: Text(
                _isOnline ? 'ONLINE (ACTIVE)' : 'OFFLINE',
                style: TextStyle(
                  color: _isOnline ? Colors.white : Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
              selected: _isOnline,
              selectedColor: WorkerTheme.successGreen,
              onSelected: (val) {
                if (val && !finState.isWalletActive) {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    builder: (_) => const WorkerWalletRechargeSheet(),
                  );
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Prepaid wallet balance is ₹${finState.prepaidWalletBalance.toStringAsFixed(0)} (min ₹100 required). Recharge to go Online and receive job requests.',
                      ),
                      backgroundColor: WorkerTheme.primaryRed,
                    ),
                  );
                  return;
                }
                setState(() => _isOnline = val);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(_isOnline
                        ? 'You are now Online and eligible for loud incoming shift alerts.'
                        : 'You are Offline. You will not receive automatic shift alerts.'),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Live Worker GPS Radar Status Banner
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: WorkerTheme.primaryYellow.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: WorkerTheme.darkGold.withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.gps_fixed, color: WorkerTheme.primaryRed, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text('WORKER GPS RADAR ACTIVE',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: WorkerTheme.darkGold)),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(color: WorkerTheme.primaryRed, borderRadius: BorderRadius.circular(4)),
                              child: const Text('AUTO-TRACKED', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Text('Baikampady Ind. Area · Lat: 12.9141° N, Lng: 74.8560° E (Accurate to ±4m)',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: WorkerTheme.textPrimary)),
                      ],
                    ),
                  ),
                  const Icon(Icons.check_circle, color: WorkerTheme.darkGold, size: 18),
                ],
              ),
            ),

            // Warning Banner if wallet below ₹100
            if (!finState.isWalletActive) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade300),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Wallet Low - Job Requests Suspended',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.red)),
                          Text(
                            'Balance: ₹${finState.prepaidWalletBalance.toStringAsFixed(0)}. Recharge min ₹100 to receive ringing job broadcasts.',
                            style: const TextStyle(fontSize: 11, color: Colors.black87),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          builder: (_) => const WorkerWalletRechargeSheet(),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: WorkerTheme.primaryRed,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                      child: const Text('Recharge', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],

            // 1. Prepaid Commission Wallet Card (Platform Commission & Ringing Status)
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: finState.isWalletActive ? Colors.green.shade300 : Colors.red.shade300,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.account_balance_wallet, color: WorkerTheme.primaryRed, size: 20),
                          SizedBox(width: 6),
                          Text(
                            'Prepaid Commission Wallet',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: WorkerTheme.textPrimary),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: finState.isWalletActive ? Colors.green.shade50 : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          finState.isWalletActive ? 'ACTIVE / RINGING ON' : 'RECHARGE REQUIRED',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: finState.isWalletActive ? WorkerTheme.successGreen : Colors.red,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '₹${finState.prepaidWalletBalance.toStringAsFixed(0)}',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: finState.isWalletActive ? Colors.black87 : Colors.red,
                            ),
                          ),
                          const Text(
                            'Admin deducts 10% on cash jobs from this balance',
                            style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
                          ),
                        ],
                      ),
                      ElevatedButton.icon(
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            builder: (_) => const WorkerWalletRechargeSheet(),
                          );
                        },
                        icon: const Icon(Icons.bolt, size: 16),
                        label: const Text('Top Up'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: WorkerTheme.primaryYellow,
                          foregroundColor: const Color(0xFF202124),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.payments_outlined, size: 16, color: WorkerTheme.successGreen),
                          const SizedBox(width: 6),
                          Text(
                            'Cash/UPI Collected: ₹${finState.totalCashCollected.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: WorkerTheme.successGreen),
                          ),
                        ],
                      ),
                      const Text('Min: ₹100', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),

            // 2. Test Loud Ringing Audio & Vibration Alert Button
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              child: ElevatedButton.icon(
                onPressed: () {
                  final sampleJob = jobsState.radarJobs.isNotEmpty
                      ? jobsState.radarJobs.first
                      : AssignedJob(
                          id: 'test-ring-job',
                          orderNumber: '9999',
                          title: 'Warehouse Express Unloading (Test)',
                          category: 'Loading & Unloading',
                          customerName: 'Coastal Freightways',
                          customerPhone: '+91 99002 88771',
                          address: 'Baikampady Gate 2, Mangalore',
                          dailyWage: 2200.0,
                          workersNeeded: 3,
                          workersAccepted: 1,
                          status: 'AVAILABLE',
                          startOtp: '4192',
                          endOtp: '8831',
                          scheduledTime: 'Today, 02:00 PM - 10:00 PM',
                          remarks: 'Heavy pallet unloading. Requires gloves & safety boots.',
                        );

                  showDialog(
                    context: context,
                    barrierDismissible: false,
                    builder: (_) => IncomingJobRingingDialog(job: sampleJob),
                  );
                },
                icon: const Icon(Icons.ring_volume, color: Colors.white, size: 20),
                label: const Text(
                  '🔔 Test Ringing & Vibration (Hear Phone Ring)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E1F23),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),

            // 2B. Create Job & Broadcast to Customer App
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              child: InkWell(
                onTap: () => WorkerCreateJobSheet.show(context),
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: WorkerTheme.primaryRed.withValues(alpha: 0.3)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: WorkerTheme.primaryRed.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.add_business, color: WorkerTheme.primaryRed, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Text(
                                  'Create & Broadcast Job',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: WorkerTheme.textPrimary),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: WorkerTheme.primaryRed,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text('NOTIFY CUSTOMER', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            const Text(
                              'Post a new shift & send instant push notification to Customer App',
                              style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    ],
                  ),
                ),
              ),
            ),

            // 3. Interactive Earnings Card
            InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const WorkerEarningsScreen()),
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [WorkerTheme.primaryRed, WorkerTheme.darkRed],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: WorkerTheme.primaryRed.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Available for Withdrawal',
                            style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Row(
                            children: [
                              Text('LEDGER', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '₹${finState.availableBalance.toStringAsFixed(0)}',
                      style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Pending: ₹${finState.pendingBalance.toStringAsFixed(0)}',
                            style: const TextStyle(color: Colors.white70, fontSize: 12)),
                        const Row(
                          children: [
                            Text('Withdraw / View Ledger',
                                style: TextStyle(
                                    color: WorkerTheme.primaryYellow,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13)),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_ios, size: 12, color: WorkerTheme.primaryYellow),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Active Shift Card
            const Text("Today's Assigned Shift",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WorkerTheme.textPrimary)),
            const SizedBox(height: 10),
            if (activeJob != null)
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 1,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Order #${activeJob.orderNumber}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: activeJob.status == 'WORK_IN_PROGRESS'
                                  ? Colors.green.shade50
                                  : Colors.amber.shade50,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              activeJob.status,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: activeJob.status == 'WORK_IN_PROGRESS'
                                    ? WorkerTheme.successGreen
                                    : WorkerTheme.darkRed,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(activeJob.title,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text(activeJob.address,
                          style: const TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                      if (activeJob.durationPackage != null || activeJob.hourlyRate != null) ...[
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            if (activeJob.hourlyRate != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: Colors.green.shade200),
                                ),
                                child: Text('Rate: ₹${activeJob.hourlyRate!.toStringAsFixed(0)}/hr/head',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green.shade900)),
                              ),
                            if (activeJob.durationPackage != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.amber.shade50,
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: Colors.amber.shade300),
                                ),
                                child: Text(
                                  '${activeJob.durationPackage}${activeJob.approxTimeToComplete != null ? ' (Est: ${activeJob.approxTimeToComplete})' : ''}',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                                ),
                              ),
                          ],
                        ),
                      ],
                      if (activeJob.remarks != null && activeJob.remarks!.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.notes, size: 14, color: WorkerTheme.textSecondary),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text('Remarks: ${activeJob.remarks}',
                                    style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: WorkerTheme.textSecondary)),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('₹${activeJob.dailyWage.toStringAsFixed(0)} / Day',
                              style: const TextStyle(
                                  color: WorkerTheme.primaryRed,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: WorkerTheme.successGreen.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.security, size: 12, color: WorkerTheme.successGreen),
                                const SizedBox(width: 4),
                                Text(
                                  activeJob.status == 'WORK_IN_PROGRESS'
                                      ? 'Shift Active'
                                      : activeJob.status == 'ARRIVAL_VERIFIED'
                                          ? 'Arrived • Enter OTP'
                                          : 'Assigned • Travel to Site',
                                  style: const TextStyle(
                                      color: WorkerTheme.successGreen,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.black12),
                ),
                child: const Center(
                  child: Text('No active shift assigned right now. Explore Find Jobs radar!',
                      style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 13)),
                ),
              ),

            const SizedBox(height: 20),
            // Quick Actions Row
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const WorkerRequestWithdrawalScreen()),
                      );
                    },
                    icon: const Icon(Icons.account_balance, color: WorkerTheme.primaryRed, size: 18),
                    label: const Text('Request Payout',
                        style: TextStyle(color: WorkerTheme.primaryRed, fontSize: 12, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: WorkerTheme.primaryRed),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const WorkerPayoutMethodsScreen()),
                      );
                    },
                    icon: const Icon(Icons.credit_card, color: WorkerTheme.textPrimary, size: 18),
                    label: const Text('Payout Bank/UPI',
                        style: TextStyle(color: WorkerTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: Colors.black26),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 7. TAB 2: FIND JOBS (RADAR WITH REAL CAPACITY CHECK & COUNTER-BID)
// ---------------------------------------------------------------------------
class WorkerFindJobsTab extends ConsumerWidget {
  const WorkerFindJobsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsState = ref.watch(workerJobsProvider);
    final finState = ref.watch(workerFinancialProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Job Radar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: WorkerTheme.primaryRed, size: 26),
            tooltip: 'Create Job & Notify Customer',
            onPressed: () => WorkerCreateJobSheet.show(context),
          ),
          IconButton(
            icon: const Icon(Icons.bolt, color: WorkerTheme.primaryYellow),
            tooltip: 'Recharge Wallet',
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const WorkerWalletRechargeSheet(),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Low Wallet Alert Banner
          if (!finState.isWalletActive)
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.red.shade300),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 24),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Wallet Low — Cannot Accept Shifts',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.red)),
                        Text(
                          'Balance: ₹${finState.prepaidWalletBalance.toStringAsFixed(0)} (Min ₹100 required for commission deductions)',
                          style: const TextStyle(fontSize: 10, color: Colors.black87),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => const WorkerWalletRechargeSheet(),
                      );
                    },
                    child: const Text('Top Up', style: TextStyle(fontWeight: FontWeight.bold, color: WorkerTheme.primaryRed)),
                  ),
                ],
              ),
            ),

          Expanded(
            child: jobsState.radarJobs.isEmpty
                ? const Center(
                    child: Text('No new jobs on radar. Check back soon for broadcasts!',
                        style: TextStyle(color: WorkerTheme.textSecondary)),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: jobsState.radarJobs.length,
                    itemBuilder: (context, idx) {
                      final job = jobsState.radarJobs[idx];
                      final remaining = job.workersNeeded - job.workersAccepted;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(job.category,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                  Text('₹${job.dailyWage.toStringAsFixed(0)} (Cash/UPI)',
                                      style: const TextStyle(
                                          color: WorkerTheme.primaryRed,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(job.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(job.address,
                                        style: const TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: WorkerTheme.primaryYellow.withValues(alpha: 0.25),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.gps_fixed, size: 10, color: WorkerTheme.darkGold),
                                        const SizedBox(width: 3),
                                        Text(
                                          '${job.distanceInKm ?? 1.4} km away',
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: WorkerTheme.darkGold),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.access_time, size: 14, color: WorkerTheme.textSecondary),
                                  const SizedBox(width: 4),
                                  Text(job.scheduledTime,
                                      style: const TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                                ],
                              ),
                              if (job.durationPackage != null || job.hourlyRate != null) ...[
                                const SizedBox(height: 6),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 4,
                                  children: [
                                    if (job.hourlyRate != null)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: WorkerTheme.primaryYellow.withValues(alpha: 0.25),
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: WorkerTheme.darkGold.withValues(alpha: 0.3)),
                                        ),
                                        child: Text('Rate: ₹${job.hourlyRate!.toStringAsFixed(0)}/hr/head',
                                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: WorkerTheme.darkGold)),
                                      ),
                                    if (job.durationPackage != null)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: Colors.amber.shade50,
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: Colors.amber.shade300),
                                        ),
                                        child: Text(
                                          '${job.durationPackage}${job.approxTimeToComplete != null ? ' (Est: ${job.approxTimeToComplete})' : ''}',
                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                                        ),
                                      ),
                                  ],
                                ),
                              ],
                              if (job.remarks != null && job.remarks!.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.note_alt_outlined, size: 14, color: WorkerTheme.textSecondary),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Notes: ${job.remarks}',
                                          style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: WorkerTheme.textSecondary),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: remaining <= 2 ? WorkerTheme.primaryRed.withValues(alpha: 0.1) : WorkerTheme.primaryYellow.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '$remaining of ${job.workersNeeded} spots remaining',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: remaining <= 2 ? WorkerTheme.primaryRed : WorkerTheme.darkGold,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '10% Admin Comm: ₹${(job.dailyWage * 0.10).toStringAsFixed(0)}',
                                    style: const TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        if (!finState.isWalletActive) {
                                          showModalBottomSheet(
                                            context: context,
                                            isScrollControlled: true,
                                            builder: (_) => const WorkerWalletRechargeSheet(),
                                          );
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text(
                                                'Prepaid wallet balance is ₹${finState.prepaidWalletBalance.toStringAsFixed(0)} (min ₹100 required). Please recharge to accept shift.',
                                              ),
                                              backgroundColor: WorkerTheme.primaryRed,
                                            ),
                                          );
                                          return;
                                        }

                                        final ok = ref.read(workerJobsProvider.notifier).acceptJob(job.id);
                                        if (ok) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Shift #${job.orderNumber} Accepted! Check My Work tab.'),
                                              backgroundColor: WorkerTheme.successGreen,
                                            ),
                                          );
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('This shift has already reached full worker capacity.'),
                                              backgroundColor: WorkerTheme.primaryRed,
                                            ),
                                          );
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: WorkerTheme.primaryRed,
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      child: const Text('Accept Shift', style: TextStyle(fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(Icons.ring_volume, color: WorkerTheme.primaryRed),
                                    tooltip: 'Simulate Ringing Alert for this Job',
                                    onPressed: () {
                                      showDialog(
                                        context: context,
                                        barrierDismissible: false,
                                        builder: (_) => IncomingJobRingingDialog(job: job),
                                      );
                                    },
                                  ),
                                  const SizedBox(width: 4),
                                  OutlinedButton(
                                    onPressed: () {
                                      _showCounterBidDialog(context, ref, job);
                                    },
                                    style: OutlinedButton.styleFrom(
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    child: const Text('Bid'),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.close, color: Colors.grey),
                                    onPressed: () {
                                      ref.read(workerJobsProvider.notifier).rejectJob(job.id);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Job dismissed from your radar.')),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => WorkerCreateJobSheet.show(context),
        backgroundColor: WorkerTheme.primaryRed,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_business),
        label: const Text('Create & Notify Customer', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }

  void _showCounterBidDialog(BuildContext context, WidgetRef ref, AssignedJob job) {
    final controller = TextEditingController(text: (job.dailyWage + 200).toStringAsFixed(0));
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Submit Counter-Bid Wage'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Current Employer Offer: ₹${job.dailyWage.toStringAsFixed(0)}'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Your Proposed Daily Wage (₹)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final val = double.tryParse(controller.text) ?? 0.0;
              if (val > 0) {
                ref.read(workerJobsProvider.notifier).counterBidJob(job.id, val);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Counter-bid of ₹$val submitted to ${job.customerName}.')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
            child: const Text('Submit Bid'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 8. TAB 3: MY WORK (ATTENDANCE, START OTP, BREAKS, END OTP, SETTLEMENT)
// ---------------------------------------------------------------------------
class WorkerMyWorkTab extends ConsumerStatefulWidget {
  const WorkerMyWorkTab({super.key});

  @override
  ConsumerState<WorkerMyWorkTab> createState() => _WorkerMyWorkTabState();
}

class _WorkerMyWorkTabState extends ConsumerState<WorkerMyWorkTab> {
  final _startOtpController = TextEditingController();
  final _endOtpController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final jobsState = ref.watch(workerJobsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Work & Attendance')),
      body: jobsState.myWorkJobs.isEmpty
          ? const Center(
              child: Text('No active assignments in your work queue.',
                  style: TextStyle(color: WorkerTheme.textSecondary)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: jobsState.myWorkJobs.length,
              itemBuilder: (context, idx) {
                final job = jobsState.myWorkJobs[idx];

                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Order #${job.orderNumber}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: job.status == 'WORK_COMPLETED'
                                    ? Colors.green.shade50
                                    : Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                job.status,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                  color: job.status == 'WORK_COMPLETED'
                                      ? WorkerTheme.successGreen
                                      : Colors.blue.shade900,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(job.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        const SizedBox(height: 4),
                        Text('Employer: ${job.customerName} (${job.customerPhone})',
                            style: const TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                        const SizedBox(height: 4),
                        Text(job.address,
                            style: const TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                        if (job.durationPackage != null || job.hourlyRate != null) ...[
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            children: [
                              if (job.hourlyRate != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade50,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: Colors.green.shade200),
                                  ),
                                  child: Text('Rate: ₹${job.hourlyRate!.toStringAsFixed(0)}/hr/head',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green.shade900)),
                                ),
                              if (job.durationPackage != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.shade50,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: Colors.amber.shade300),
                                  ),
                                  child: Text(
                                    '${job.durationPackage}${job.approxTimeToComplete != null ? ' (Est: ${job.approxTimeToComplete})' : ''}',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                                  ),
                                ),
                            ],
                          ),
                        ],
                        if (job.remarks != null && job.remarks!.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.note_alt_outlined, size: 14, color: WorkerTheme.textSecondary),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Instructions: ${job.remarks}',
                                    style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: WorkerTheme.textSecondary),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 14),

                        // Phase 1: Verify Arrival via Live GPS
                        if (job.status == 'ASSIGNED') ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: WorkerTheme.primaryYellow.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: WorkerTheme.darkGold.withValues(alpha: 0.4)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.gps_fixed, color: WorkerTheme.primaryRed, size: 20),
                                    const SizedBox(width: 8),
                                    const Expanded(
                                      child: Text('Step 1: Automatic GPS Worksite Check-In',
                                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: WorkerTheme.primaryRed,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text('GPS AUTO-CHECK',
                                          style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.black12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.my_location, size: 16, color: WorkerTheme.darkGold),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'Worksite GPS Pin: ${job.address}\nGeofence Status: Match within 50m radius (Lat: ${job.latitude.toStringAsFixed(4)}, Lng: ${job.longitude.toStringAsFixed(4)})',
                                          style: const TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 10),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton.icon(
                                    onPressed: () async {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('🛰️ Fetching live GPS satellites...'),
                                          duration: Duration(seconds: 1),
                                        ),
                                      );
                                      String locationText = 'Worksite';
                                      try {
                                        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
                                        if (serviceEnabled) {
                                          LocationPermission permission = await Geolocator.checkPermission();
                                          if (permission == LocationPermission.denied) {
                                            permission = await Geolocator.requestPermission();
                                          }
                                          if (permission == LocationPermission.whileInUse ||
                                              permission == LocationPermission.always) {
                                            Position? pos = await Geolocator.getLastKnownPosition();
                                            pos ??= await Geolocator.getCurrentPosition(
                                              desiredAccuracy: LocationAccuracy.medium,
                                              timeLimit: const Duration(seconds: 6),
                                            );
                                            locationText = 'Lat: ${pos.latitude.toStringAsFixed(4)}, Lng: ${pos.longitude.toStringAsFixed(4)}';
                                          }
                                        }
                                      } catch (_) {}

                                      ref.read(workerJobsProvider.notifier).verifyArrival(job.id);
                                      ref.read(workerNotificationsProvider.notifier).addNotification(
                                        title: 'Worksite Arrival Verified',
                                        body: 'Arrival confirmed at ${job.title} ($locationText). Ask employer for Start OTP.',
                                        type: 'ARRIVAL',
                                      );
                                      if (!context.mounted) return;
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('📍 GPS Verified ($locationText)! Ask employer for 4-digit Start OTP.'),
                                          backgroundColor: WorkerTheme.primaryRed,
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.pin_drop),
                                    label: const Text('VERIFY ARRIVAL VIA LIVE GPS',
                                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: WorkerTheme.primaryRed,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        // Phase 2: Start OTP
                        if (job.status == 'ARRIVAL_VERIFIED' || job.status == 'ASSIGNED') ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Step 2: Enter 4-Digit Start OTP from Employer',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: _startOtpController,
                                        maxLength: 4,
                                        keyboardType: TextInputType.number,
                                        decoration: const InputDecoration(
                                          hintText: 'Enter 4-digit OTP',
                                          counterText: '',
                                          filled: true,
                                          fillColor: Colors.white,
                                          border: OutlineInputBorder(),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton(
                                      onPressed: () {
                                        final ok = ref
                                            .read(workerJobsProvider.notifier)
                                            .verifyStartOtp(job.id, _startOtpController.text);
                                        if (ok) {
                                          _startOtpController.clear();
                                          ref.read(workerNotificationsProvider.notifier).addNotification(
                                            title: 'Shift Timer Started',
                                            body: 'Start OTP verified for ${job.title}. Shift is officially underway.',
                                            type: 'START_OTP',
                                          );
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Start OTP Verified! Shift timer running.'),
                                              backgroundColor: WorkerTheme.successGreen,
                                            ),
                                          );
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Invalid Start OTP. Please ask employer for correct 4-digit code.'),
                                              backgroundColor: WorkerTheme.primaryRed,
                                            ),
                                          );
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: WorkerTheme.primaryRed,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: const Text('Verify OTP'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],

                        // Phase 3: Work in Progress (Breaks & End OTP)
                        if (job.status == 'WORK_IN_PROGRESS') ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Shift in progress',
                                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: WorkerTheme.successGreen)),
                                    OutlinedButton.icon(
                                      onPressed: () {
                                        ref.read(workerJobsProvider.notifier).toggleBreak(job.id);
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text(job.isOnBreak
                                                ? 'Resumed shift work.'
                                                : 'Break logged on shift ledger.'),
                                          ),
                                        );
                                      },
                                      icon: Icon(job.isOnBreak ? Icons.play_arrow : Icons.pause, size: 16),
                                      label: Text(job.isOnBreak ? 'Resume Work' : 'Take Break',
                                          style: const TextStyle(fontSize: 12)),
                                    ),
                                  ],
                                ),
                                const Divider(),
                                const Text('Step 3: Enter End OTP upon shift conclusion',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: _endOtpController,
                                        maxLength: 4,
                                        keyboardType: TextInputType.number,
                                        decoration: const InputDecoration(
                                          hintText: 'Enter 4-digit OTP',
                                          counterText: '',
                                          filled: true,
                                          fillColor: Colors.white,
                                          border: OutlineInputBorder(),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton(
                                      onPressed: () {
                                        final ok = ref
                                            .read(workerJobsProvider.notifier)
                                            .verifyEndOtp(job.id, _endOtpController.text);
                                        if (ok) {
                                          _endOtpController.clear();
                                          ref.read(workerNotificationsProvider.notifier).addNotification(
                                            title: 'Shift Completed',
                                            body: 'End OTP confirmed for ${job.title}. Wage ₹${job.dailyWage.toStringAsFixed(0)} settled.',
                                            type: 'END_OTP',
                                          );
                                          final stillActive = ref
                                              .read(workerFinancialProvider.notifier)
                                              .deductCommissionForCashJob(job.dailyWage, job.orderNumber);

                                          final commission = job.dailyWage * 0.10;
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text(
                                                'Shift Completed! Collect ₹${job.dailyWage.toStringAsFixed(0)} in Cash/UPI from employer. Admin deducted ₹${commission.toStringAsFixed(0)} (10%) from prepaid wallet.',
                                              ),
                                              backgroundColor: WorkerTheme.successGreen,
                                              duration: const Duration(seconds: 4),
                                            ),
                                          );

                                          if (!stillActive) {
                                            showModalBottomSheet(
                                              context: context,
                                              isScrollControlled: true,
                                              builder: (_) => const WorkerWalletRechargeSheet(),
                                            );
                                          }
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Invalid End OTP. Ask employer to confirm completion code.'),
                                              backgroundColor: WorkerTheme.primaryRed,
                                            ),
                                          );
                                        }
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: WorkerTheme.successGreen,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: const Text('Complete Shift'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],

                        // Phase 4: Completed (Cash / Direct Worker UPI Settlement)
                        if (job.status == 'WORK_COMPLETED') ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDF4),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF86EFAC)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.check_circle, color: WorkerTheme.successGreen, size: 22),
                                    const SizedBox(width: 8),
                                    const Expanded(
                                      child: Text('Shift Completed — Cash / UPI Collection',
                                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: WorkerTheme.successGreen)),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.green.shade100,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text('CASH SYSTEM', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: WorkerTheme.successGreen)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Collect ₹${job.dailyWage.toStringAsFixed(0)} directly from employer in Cash or via your personal UPI QR code.',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Admin 10% commission (₹${(job.dailyWage * 0.10).toStringAsFixed(0)}) was automatically deducted from your prepaid wallet.',
                                  style: const TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

// ---------------------------------------------------------------------------
// 9. TAB 4: MESSAGES (INTERACTIVE EMPLOYER CHAT)
// ---------------------------------------------------------------------------
class WorkerMessagesTab extends StatefulWidget {
  const WorkerMessagesTab({super.key});

  @override
  State<WorkerMessagesTab> createState() => _WorkerMessagesTabState();
}

class _WorkerMessagesTabState extends State<WorkerMessagesTab> {
  final List<Map<String, dynamic>> _messages = [
    {
      'from': 'Apex Logistics',
      'text': 'Please report to Gate 4 at 07:45 AM with safety boots and vest.',
      'time': '09:12 AM',
      'isMe': false,
    },
    {
      'from': 'Me',
      'text': 'Understood sir. I have arrived at Dock 4 with complete gear.',
      'time': '09:15 AM',
      'isMe': true,
    },
  ];

  final _textController = TextEditingController();

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add({
        'from': 'Me',
        'text': text,
        'time': 'Just now',
        'isMe': true,
      });
      _textController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Employer Messages')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final m = _messages[idx];
                final isMe = m['isMe'] as bool;

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isMe ? WorkerTheme.primaryRed : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(m['text'] as String,
                            style: TextStyle(color: isMe ? Colors.white : WorkerTheme.textPrimary, fontSize: 13)),
                        const SizedBox(height: 4),
                        Text(m['time'] as String,
                            style: TextStyle(color: isMe ? Colors.white70 : Colors.grey, fontSize: 10)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.black12)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: const InputDecoration(
                      hintText: 'Type message to employer...',
                      border: InputBorder.none,
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: WorkerTheme.primaryRed),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 10. TAB 5: PROFILE & ALL NAVIGATION SUBPAGES
// ---------------------------------------------------------------------------
class WorkerProfileTab extends ConsumerWidget {
  const WorkerProfileTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(workerAuthProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Worker Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: WorkerTheme.primaryRed,
                child: Text('RK', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              title: Text(authState.workerName ?? 'Ramesh Kumar', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('${authState.category ?? 'Loading & Unloading'} · 4.9 ★'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.account_balance_wallet_outlined, color: WorkerTheme.primaryRed),
              title: const Text('Earnings & Withdrawals Dashboard'),
              subtitle: const Text('View ledger, payouts, and available balance'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const WorkerEarningsScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.credit_card_outlined),
              title: const Text('Payout Methods (Bank / UPI)'),
              subtitle: const Text('Manage your settlement accounts'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const WorkerPayoutMethodsScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.history_outlined),
              title: const Text('Withdrawal History'),
              subtitle: const Text('Track bank transfer UTR and payout status'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const WorkerWithdrawalHistoryScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.verified, color: WorkerTheme.successGreen),
              title: const Text('KYC Aadhaar Verification'),
              subtitle: const Text('Aadhaar •••• 9812 Verified'),
              trailing: const Icon(Icons.check_circle, color: WorkerTheme.successGreen),
            ),
            ListTile(
              leading: const Icon(Icons.emergency_outlined, color: Colors.red),
              title: const Text('Emergency Safety Hotline & SOS'),
              subtitle: const Text('Call 112 / Regional Helpline'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const WorkerEmergencySosScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.description_outlined),
              title: const Text('Terms & Labor Safety Policies'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const WorkerLegalScreen()),
                );
              },
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Confirm Sign Out'),
                      content: const Text('Are you sure you want to log out of your worker session?'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            ref.read(workerAuthProvider.notifier).signOut();
                          },
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                          child: const Text('Sign Out'),
                        ),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text('Sign Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 11. DETAILED EARNINGS SCREEN (KPI CARDS, TIME FILTERS, LEDGER LIST)
// ---------------------------------------------------------------------------
class WorkerEarningsScreen extends ConsumerStatefulWidget {
  const WorkerEarningsScreen({super.key});

  @override
  ConsumerState<WorkerEarningsScreen> createState() => _WorkerEarningsScreenState();
}

class _WorkerEarningsScreenState extends ConsumerState<WorkerEarningsScreen> {
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    final finState = ref.watch(workerFinancialProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Earnings & Ledger'),
        leading: const BackButton(),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const WorkerWithdrawalHistoryScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Available Balance Highlight
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [WorkerTheme.primaryRed, WorkerTheme.darkRed],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Available for Immediate Withdrawal',
                      style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 6),
                  Text('₹${finState.availableBalance.toStringAsFixed(0)}',
                      style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const WorkerRequestWithdrawalScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: WorkerTheme.primaryYellow,
                        foregroundColor: const Color(0xFF202124),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Request Payout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Breakdown Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.8,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _buildMetricCard('Pending Settlement', '₹${finState.pendingBalance.toStringAsFixed(0)}', Colors.amber.shade700),
                _buildMetricCard('Reserved / In Progress', '₹${finState.reservedBalance.toStringAsFixed(0)}', Colors.blue.shade700),
                _buildMetricCard('Successfully Withdrawn', '₹${finState.withdrawnTotal.toStringAsFixed(0)}', WorkerTheme.successGreen),
                _buildMetricCard('Platform Fee (10%)', 'Calculated', Colors.grey.shade700),
              ],
            ),
            const SizedBox(height: 20),

            // Filter Chips
            Row(
              children: ['Today', 'This Week', 'This Month', 'All'].map((tab) {
                final isSel = _filter == tab;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(tab, style: TextStyle(color: isSel ? Colors.white : Colors.black, fontSize: 12)),
                    selected: isSel,
                    selectedColor: WorkerTheme.primaryRed,
                    onSelected: (val) => setState(() => _filter = tab),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 14),

            const Text('Recent Financial Ledger Entries',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: WorkerTheme.textPrimary)),
            const SizedBox(height: 10),

            if (finState.transactions.isEmpty)
              const Center(child: Text('No transactions recorded yet.', style: TextStyle(color: WorkerTheme.textSecondary)))
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: finState.transactions.length,
                itemBuilder: (context, idx) {
                  final t = finState.transactions[idx];
                  final isCredit = t.type == 'CREDIT';
                  final isFee = t.type == 'FEE';

                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isCredit
                            ? Colors.green.shade50
                            : (isFee ? Colors.grey.shade100 : Colors.red.shade50),
                        child: Icon(
                          isCredit ? Icons.arrow_downward : (isFee ? Icons.percent : Icons.arrow_upward),
                          color: isCredit
                              ? WorkerTheme.successGreen
                              : (isFee ? Colors.grey.shade700 : WorkerTheme.primaryRed),
                          size: 18,
                        ),
                      ),
                      title: Text(t.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: Text(t.date, style: const TextStyle(fontSize: 11, color: WorkerTheme.textSecondary)),
                      trailing: Text(
                        '${isCredit ? "+" : "-"}₹${t.amount.toStringAsFixed(0)}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: isCredit ? WorkerTheme.successGreen : Colors.black87,
                        ),
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String val, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, color: WorkerTheme.textSecondary)),
          const SizedBox(height: 4),
          Text(val, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 12. PAYOUT METHODS SCREEN (BANK ACCOUNT / UPI)
// ---------------------------------------------------------------------------
class WorkerPayoutMethodsScreen extends ConsumerWidget {
  const WorkerPayoutMethodsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final finState = ref.watch(workerFinancialProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payout Methods'),
        leading: const BackButton(),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Configured Settlement Accounts',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Earnings will be disbursed directly to your default verified account.',
              style: TextStyle(fontSize: 12, color: WorkerTheme.textSecondary),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: finState.payoutMethods.length,
                itemBuilder: (context, idx) {
                  final method = finState.payoutMethods[idx];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      leading: Icon(
                        method.type == 'bank_transfer' ? Icons.account_balance : Icons.smartphone,
                        color: WorkerTheme.primaryRed,
                      ),
                      title: Text(method.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Text('${method.maskedDetails}\nHolder: ${method.accountHolder}', style: const TextStyle(fontSize: 12)),
                      isThreeLine: true,
                      trailing: method.isDefault
                          ? Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(6)),
                              child: const Text('DEFAULT', style: TextStyle(color: WorkerTheme.successGreen, fontSize: 10, fontWeight: FontWeight.bold)),
                            )
                          : TextButton(
                              onPressed: () {
                                ref.read(workerFinancialProvider.notifier).setDefaultPayoutMethod(method.id);
                              },
                              child: const Text('Set Default', style: TextStyle(fontSize: 12)),
                            ),
                    ),
                  );
                },
              ),
            ),
            SizedBox(
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () {
                  _showAddMethodDialog(context, ref);
                },
                icon: const Icon(Icons.add),
                label: const Text('Add Bank Account or UPI', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: WorkerTheme.primaryRed,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddMethodDialog(BuildContext context, WidgetRef ref) {
    String type = 'bank_transfer';
    final accController = TextEditingController();
    final ifscController = TextEditingController();
    final holderController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          title: const Text('Add Payout Account'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: type,
                  decoration: const InputDecoration(labelText: 'Method Type'),
                  items: const [
                    DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Transfer (IMPS/NEFT)')),
                    DropdownMenuItem(value: 'upi', child: Text('UPI ID / VPA')),
                  ],
                  onChanged: (val) => setModalState(() => type = val ?? type),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: holderController,
                  decoration: const InputDecoration(labelText: 'Account Holder Name (as on Aadhaar)'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: accController,
                  decoration: InputDecoration(
                    labelText: type == 'bank_transfer' ? 'Bank Account Number' : 'UPI VPA (e.g. name@okhdfc)',
                  ),
                ),
                if (type == 'bank_transfer') ...[
                  const SizedBox(height: 10),
                  TextField(
                    controller: ifscController,
                    decoration: const InputDecoration(labelText: 'Bank IFSC Code (11 characters)'),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                final holder = holderController.text.trim();
                final acc = accController.text.trim();
                if (holder.isEmpty || acc.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please complete all required fields.')),
                  );
                  return;
                }

                final masked = type == 'bank_transfer'
                    ? 'Bank Account •••• ${acc.length > 4 ? acc.substring(acc.length - 4) : acc}'
                    : acc;

                final newMethod = PayoutMethod(
                  id: 'pm-${DateTime.now().millisecondsSinceEpoch}',
                  type: type,
                  title: type == 'bank_transfer' ? 'Bank Account' : 'UPI ID',
                  maskedDetails: masked,
                  accountHolder: holder,
                  ifsc: ifscController.text.trim().toUpperCase(),
                );

                ref.read(workerFinancialProvider.notifier).addPayoutMethod(newMethod);
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Payout method added successfully.')),
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
              child: const Text('Save Method'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 13. REQUEST WITHDRAWAL SCREEN (ATOMIC BALANCE VALIDATION & CONFIRMATION)
// ---------------------------------------------------------------------------
class WorkerRequestWithdrawalScreen extends ConsumerStatefulWidget {
  const WorkerRequestWithdrawalScreen({super.key});

  @override
  ConsumerState<WorkerRequestWithdrawalScreen> createState() => _WorkerRequestWithdrawalScreenState();
}

class _WorkerRequestWithdrawalScreenState extends ConsumerState<WorkerRequestWithdrawalScreen> {
  final _amountController = TextEditingController();
  PayoutMethod? _selectedMethod;
  String? _error;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final finState = ref.watch(workerFinancialProvider);
    if (_selectedMethod == null && finState.payoutMethods.isNotEmpty) {
      _selectedMethod = finState.payoutMethods.firstWhere(
        (m) => m.isDefault,
        orElse: () => finState.payoutMethods.first,
      );
    }

    final entered = double.tryParse(_amountController.text) ?? 0.0;
    const fee = 0.0; // 0 platform withdrawal fee for workers
    final net = entered > 0 ? (entered - fee) : 0.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Payout'),
        leading: const BackButton(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Available Balance
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Available Balance for Withdrawal', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text('₹${finState.availableBalance.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: WorkerTheme.primaryRed)),
                  const SizedBox(height: 4),
                  const Text('Minimum withdrawal limit: ₹100', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
              ),

            // Select Destination
            const Text('Payout Destination Account', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            if (finState.payoutMethods.isEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(10)),
                child: const Text('No payout accounts registered. Please add a bank account or UPI first.'),
              )
            else
              DropdownButtonFormField<PayoutMethod>(
                value: _selectedMethod,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
                items: finState.payoutMethods.map((m) {
                  return DropdownMenuItem<PayoutMethod>(
                    value: m,
                    child: Text('${m.title} (${m.maskedDetails})'),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedMethod = val),
              ),
            const SizedBox(height: 16),

            // Amount Input
            const Text('Withdrawal Amount (₹)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() => _error = null),
              decoration: InputDecoration(
                hintText: 'Enter amount e.g. 1000',
                prefixText: '₹ ',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 10),

            // Quick Chips
            Row(
              children: [500, 1000, 2000].map((amt) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    label: Text('₹$amt', style: const TextStyle(fontSize: 12)),
                    onPressed: () {
                      setState(() {
                        _amountController.text = amt.toString();
                        _error = null;
                      });
                    },
                  ),
                );
              }).toList()
                ..add(
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: const Text('MAX', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      onPressed: () {
                        setState(() {
                          _amountController.text = finState.availableBalance.toInt().toString();
                          _error = null;
                        });
                      },
                    ),
                  ),
                ),
            ),
            const SizedBox(height: 16),

            // Fee & Net Disbursal Breakdown
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Requested Payout', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                      Text('₹${entered.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Platform Processing Fee', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                      Text('₹0 (Free)', style: TextStyle(color: WorkerTheme.successGreen, fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                  const Divider(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Net Bank Disbursal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('₹${net.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: WorkerTheme.primaryRed)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: WorkerTheme.primaryRed,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('Confirm & Submit Withdrawal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleSubmit() {
    final finState = ref.read(workerFinancialProvider);
    final amt = double.tryParse(_amountController.text.trim()) ?? 0.0;

    if (_selectedMethod == null) {
      setState(() => _error = 'Please select a valid payout method.');
      return;
    }
    if (amt < 100.0) {
      setState(() => _error = 'Minimum withdrawal amount is ₹100.');
      return;
    }
    if (amt > finState.availableBalance) {
      setState(() => _error = 'Amount exceeds available balance (₹${finState.availableBalance.toStringAsFixed(0)}).');
      return;
    }

    setState(() => _isSubmitting = true);

    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      final ok = ref.read(workerFinancialProvider.notifier).requestWithdrawal(amt, _selectedMethod!);
      setState(() => _isSubmitting = false);

      if (ok) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Withdrawal Request Submitted'),
            content: Text(
                'Your request for ₹${amt.toStringAsFixed(0)} has been received and reserved.\n\nDisbursement will be processed to ${_selectedMethod!.maskedDetails}.'),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx); // pop dialog
                  Navigator.pop(context); // return to earnings
                },
                style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
                child: const Text('View Earnings'),
              ),
            ],
          ),
        );
      }
    });
  }
}

// ---------------------------------------------------------------------------
// 14. WITHDRAWAL HISTORY SCREEN (TRACK UTR & STATUS)
// ---------------------------------------------------------------------------
class WorkerWithdrawalHistoryScreen extends ConsumerWidget {
  const WorkerWithdrawalHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final finState = ref.watch(workerFinancialProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Withdrawal History'),
        leading: const BackButton(),
      ),
      body: finState.withdrawals.isEmpty
          ? const Center(child: Text('No withdrawal requests on record.', style: TextStyle(color: WorkerTheme.textSecondary)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: finState.withdrawals.length,
              itemBuilder: (context, idx) {
                final w = finState.withdrawals[idx];
                final isPaid = w.status == 'PAID';
                final isRejected = w.status == 'REJECTED';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(w.id, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: isPaid
                                    ? Colors.green.shade50
                                    : (isRejected ? Colors.red.shade50 : Colors.amber.shade50),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                w.status,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isPaid
                                      ? WorkerTheme.successGreen
                                      : (isRejected ? Colors.red : WorkerTheme.darkRed),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('Destination: ${w.methodSummary}', style: const TextStyle(fontSize: 12)),
                        const SizedBox(height: 4),
                        Text(w.createdAt, style: const TextStyle(fontSize: 11, color: WorkerTheme.textSecondary)),
                        const Divider(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Net Payout: ₹${w.netAmount.toStringAsFixed(0)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: WorkerTheme.primaryRed)),
                            if (w.payoutReference != null)
                              Text('UTR: ${w.payoutReference}',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: WorkerTheme.successGreen)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

// ---------------------------------------------------------------------------
// 15. EMERGENCY SOS SCREEN
// ---------------------------------------------------------------------------
class WorkerEmergencySosScreen extends StatelessWidget {
  const WorkerEmergencySosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Safety Hotline'),
        leading: const BackButton(),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(14)),
              child: const Column(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.red, size: 48),
                  SizedBox(height: 10),
                  Text('Worker Safety Hotline', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red)),
                  SizedBox(height: 6),
                  Text(
                    'If you are facing hazardous worksite conditions, physical threat, or medical emergency, trigger SOS immediately.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: WorkerTheme.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Dialing National Emergency Police/Ambulance 112...')),
                );
              },
              icon: const Icon(Icons.call),
              label: const Text('Dial National Emergency (112)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Dialing ManPowerLink 24x7 Safety Desk: +91 80000 12345')),
                );
              },
              icon: const Icon(Icons.support_agent),
              label: const Text('Call Platform Safety Officer (+91 80000 12345)'),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 16. LEGAL & POLICIES SCREEN
// ---------------------------------------------------------------------------
class WorkerLegalScreen extends StatelessWidget {
  const WorkerLegalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms & Safety Policies'),
        leading: const BackButton(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: const Text(
          '''
1. WORKER CODE OF CONDUCT
Workers agree to report punctually at the designated employer worksite, equipped with appropriate safety shoes, reflective jackets, and helmets as required for industrial loading/unloading.

2. ATTENDANCE & OTP VERIFICATION
Shift commencement is recorded exclusively via Start OTP provided by the employer upon arrival. Shift completion and wage settlement are validated via End OTP. Never disclose your End OTP prior to completing all assigned tasks.

3. EARNINGS & WITHDRAWAL SETTLEMENT
Daily wages are credited to your Available Wallet upon End OTP verification minus a standard 10% platform matching and safety assurance fee. Minimum withdrawal amount is ₹100. Payouts are dispatched directly to your verified bank account or UPI VPA via IMPS rails.

4. SAFETY & ACCIDENT PROTOCOLS
In the event of any industrial injury or unsafe conditions, halt work immediately and trigger the SOS helpline. All active shifts are covered under the ManPowerLink Marketplace Safety Protocol.
          ''',
          style: TextStyle(fontSize: 13, height: 1.6, color: WorkerTheme.textPrimary),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 17. WORKER NOTIFICATIONS SCREEN
// ---------------------------------------------------------------------------
class WorkerNotificationsScreen extends ConsumerWidget {
  const WorkerNotificationsScreen({super.key});

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'SHIFT':
        return Icons.work_history;
      case 'ARRIVAL':
        return Icons.pin_drop;
      case 'START_OTP':
        return Icons.lock_clock;
      case 'END_OTP':
        return Icons.task_alt;
      case 'WALLET':
        return Icons.account_balance_wallet;
      default:
        return Icons.notifications;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'SHIFT':
        return WorkerTheme.primaryRed;
      case 'ARRIVAL':
        return WorkerTheme.darkGold;
      case 'START_OTP':
        return Colors.blue;
      case 'END_OTP':
        return WorkerTheme.successGreen;
      case 'WALLET':
        return WorkerTheme.primaryYellow;
      default:
        return WorkerTheme.primaryRed;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(workerNotificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Notifications'),
        actions: [
          if (notifications.isNotEmpty) ...[
            TextButton(
              onPressed: () {
                ref.read(workerNotificationsProvider.notifier).markAllAsRead();
              },
              child: const Text('Mark all read', style: TextStyle(color: Colors.white70, fontSize: 12)),
            ),
            IconButton(
              tooltip: 'Clear all',
              icon: const Icon(Icons.delete_sweep, size: 20),
              onPressed: () {
                ref.read(workerNotificationsProvider.notifier).clearAll();
              },
            ),
          ],
        ],
      ),
      body: notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No notifications yet',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WorkerTheme.textSecondary)),
                  const SizedBox(height: 4),
                  const Text('Shift alerts, OTP verifications, and payouts will appear here.',
                      style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      ref.read(workerNotificationsProvider.notifier).addNotification(
                        title: '🔔 Test Shift Alert',
                        body: 'Urgent: 2 Workers needed at Panambur Dock (₹2,200/day).',
                        type: 'SHIFT',
                      );
                    },
                    icon: const Icon(Icons.add_alert, size: 16),
                    label: const Text('Trigger Test Alert'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: WorkerTheme.primaryRed,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = notifications[index];
                final iconColor = _colorForType(item.type);

                return InkWell(
                  onTap: () {
                    if (!item.isRead) {
                      ref.read(workerNotificationsProvider.notifier).markAsRead(item.id);
                    }
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: item.isRead ? Colors.white : const Color(0xFFFFFBEB),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: item.isRead ? Colors.black12 : WorkerTheme.primaryYellow.withValues(alpha: 0.6),
                        width: item.isRead ? 1 : 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: iconColor.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(_iconForType(item.type), color: iconColor, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      item.title,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                                        color: WorkerTheme.textPrimary,
                                      ),
                                    ),
                                  ),
                                  if (!item.isRead)
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: WorkerTheme.primaryRed,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item.body,
                                style: const TextStyle(fontSize: 12, color: WorkerTheme.textSecondary, height: 1.3),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _formatTime(item.timestamp),
                                style: const TextStyle(fontSize: 10, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

