import 'package:flutter_riverpod/flutter_riverpod.dart';

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
  String status;
  final String startOtp;
  final String endOtp;
  final String scheduledTime;
  bool isOnBreak;
  final String? remarks;
  final String? pricingType;
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
    this.pricingType,
    this.hourlyRate,
    this.durationPackage,
    this.approxTimeToComplete,
    this.latitude = 12.9141,
    this.longitude = 74.8560,
    this.distanceInKm,
  });
}

class WorkerJobsState {
  final List<AssignedJob> radarJobs;
  final List<AssignedJob> myWorkJobs;

  WorkerJobsState({
    required this.radarJobs,
    required this.myWorkJobs,
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
          myWorkJobs: [],
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
      approxTimeToComplete: approxTimeToComplete,
      remarks: remarks,
      latitude: latitude,
      longitude: longitude,
    );

    state = state.copyWith(
      radarJobs: [newJob, ...state.radarJobs],
    );

    return newJob;
  }
}

final workerJobsProvider =
    StateNotifierProvider<WorkerJobsNotifier, WorkerJobsState>((ref) {
  return WorkerJobsNotifier();
});
