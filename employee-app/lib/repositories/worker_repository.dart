import 'package:dio/dio.dart';
import '../models/worker_job_model.dart';
import '../core/constants/api_constants.dart';

class WorkerRepository {
  final Dio _dio;

  WorkerRepository({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: ApiConstants.defaultBaseUrl,
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 10),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer test_worker_token',
                },
              ),
            );

  Future<WorkerProfile> getProfile() async {
    try {
      final res = await _dio.get('/workers/w-1');
      if (res.data != null && res.data['data'] != null) {
        return WorkerProfile.fromJson(res.data['data']);
      }
    } catch (_) {}
    // Fallback profile
    return WorkerProfile(
      id: 'w-1',
      name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      email: 'ramesh.worker@manpowerlink.com',
      rating: 4.85,
      completedJobs: 42,
      totalEarnings: 38400.0,
      pendingPayout: 2850.0,
      approvalStatus: 'approved',
      isOnline: true,
      skills: ['Loading & Unloading', 'Truck Stacking', 'Heavy Lifting'],
    );
  }

  Future<List<WorkerJobOffer>> getAvailableOffers() async {
    try {
      final res = await _dio.get('/bookings');
      if (res.data != null && res.data['data'] != null) {
        final list = res.data['data'] as List;
        return list.map((item) => WorkerJobOffer(
          id: item['id'] ?? 'offer-1',
          bookingId: item['id'] ?? 'b-1045',
          orderNumber: item['orderNumber'] ?? 'Order #1045',
          categoryName: item['categoryName'] ?? 'Loading & Unloading',
          customerName: item['customerName'] ?? 'Apex Logistics',
          worksiteAddress: item['worksiteAddress'] ?? 'Gate 4, Industrial Logistics Hub, Bangalore',
          distanceKm: 3.2,
          requiredWorkers: item['requiredWorkers'] ?? 4,
          acceptedWorkers: item['acceptedWorkersCount'] ?? 3,
          payoutAmount: (item['offeredPricePerWorker'] as num?)?.toDouble() ?? 2200.0,
          scheduledDate: item['scheduledDate'] ?? 'Today',
          scheduledTime: '08:30 AM',
          durationType: 'Full Day (8h)',
          estimatedHours: 8,
          status: item['status'] ?? 'OFFERS_SENT',
        )).toList();
      }
    } catch (_) {}

    return [
      WorkerJobOffer(
        id: 'offer-1',
        bookingId: 'b-1045',
        orderNumber: 'Order #1045',
        categoryName: 'Loading & Unloading',
        customerName: 'Apex Logistics & Warehousing',
        worksiteAddress: 'Gate 4, Industrial Logistics Hub, Bangalore',
        distanceKm: 3.2,
        requiredWorkers: 4,
        acceptedWorkers: 3,
        payoutAmount: 2200.0,
        scheduledDate: 'Today',
        scheduledTime: '08:30 AM',
        durationType: 'Full Day (8h)',
        estimatedHours: 8,
        status: 'OFFERS_SENT',
      ),
      WorkerJobOffer(
        id: 'offer-2',
        bookingId: 'b-1046',
        orderNumber: 'Order #1046',
        categoryName: 'Food & Catering Service',
        customerName: 'Royal Orchid Banquets',
        worksiteAddress: 'Hall B, Airport Road, Bangalore',
        distanceKm: 5.8,
        requiredWorkers: 2,
        acceptedWorkers: 1,
        payoutAmount: 1800.0,
        scheduledDate: 'Tomorrow',
        scheduledTime: '04:00 PM',
        durationType: 'Half Day (4h)',
        estimatedHours: 4,
        status: 'OFFERS_SENT',
      ),
    ];
  }

  Future<bool> acceptJob(String bookingId) async {
    try {
      final res = await _dio.post('/bookings/$bookingId/accept', data: {'workerId': 'w-1'});
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return true; // Simulate successful acceptance in offline/demo
    }
  }

  Future<bool> verifyOtp(String bookingId, String otp, {required bool isStart}) async {
    try {
      final endpoint = isStart ? '/worker/jobs/$bookingId/start-otp' : '/worker/jobs/$bookingId/end-otp';
      final res = await _dio.post(endpoint, data: {'otp': otp, 'workerId': 'w-1'});
      return res.statusCode == 200;
    } catch (_) {
      return otp.length == 4;
    }
  }

  Future<bool> reportEmergency(String bookingId, String reason) async {
    try {
      await _dio.post('/safety/report', data: {
        'bookingId': bookingId,
        'title': 'Worker Emergency Alert (SOS)',
        'description': reason,
        'severity': 'high',
        'reportedBy': 'w-1',
      });
      return true;
    } catch (_) {
      return true;
    }
  }
}
