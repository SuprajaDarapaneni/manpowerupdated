class WorkerBidModel {
  final String id;
  final String workerId;
  final String workerName;
  final String workerAvatar;
  final double workerRating;
  final double proposedAmount;
  final String status;
  final String submittedAt;
  final String? note;

  WorkerBidModel({
    required this.id,
    required this.workerId,
    required this.workerName,
    required this.workerAvatar,
    required this.workerRating,
    required this.proposedAmount,
    required this.status,
    required this.submittedAt,
    this.note,
  });

  factory WorkerBidModel.fromJson(Map<String, dynamic> json) {
    return WorkerBidModel(
      id: json['id'] ?? '',
      workerId: json['workerId'] ?? '',
      workerName: json['workerName'] ?? '',
      workerAvatar: json['workerAvatar'] ?? '',
      workerRating: (json['workerRating'] ?? 0).toDouble(),
      proposedAmount: (json['proposedAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      submittedAt: json['submittedAt'] ?? '',
      note: json['note'],
    );
  }
}

class AssignedWorkerModel {
  final String workerId;
  final String workerName;
  final String workerPhone;
  final String workerAvatar;
  final double agreedRate;
  final String status;
  final bool startOtpVerified;
  final bool endOtpVerified;

  AssignedWorkerModel({
    required this.workerId,
    required this.workerName,
    required this.workerPhone,
    required this.workerAvatar,
    required this.agreedRate,
    required this.status,
    required this.startOtpVerified,
    required this.endOtpVerified,
  });

  factory AssignedWorkerModel.fromJson(Map<String, dynamic> json) {
    return AssignedWorkerModel(
      workerId: json['workerId'] ?? '',
      workerName: json['workerName'] ?? '',
      workerPhone: json['workerPhone'] ?? '',
      workerAvatar: json['workerAvatar'] ?? '',
      agreedRate: (json['agreedRate'] ?? 0).toDouble(),
      status: json['status'] ?? 'assigned',
      startOtpVerified: json['startOtpVerified'] ?? false,
      endOtpVerified: json['endOtpVerified'] ?? false,
    );
  }
}

class BookingModel {
  final String id;
  final String orderNumber;
  final String categoryId;
  final String categoryName;
  final int requiredWorkers;
  final int acceptedWorkersCount;
  final List<AssignedWorkerModel> assignedWorkers;
  final List<WorkerBidModel> bids;
  final double offeredPricePerWorker;
  final double totalEstimatedAmount;
  final String status;
  final String paymentStatus;
  final String startOtp;
  final String endOtp;
  final String scheduledDate;
  final String startTime;
  final String endTime;
  final String durationType;
  final String description;
  final String address;
  final String city;

  BookingModel({
    required this.id,
    required this.orderNumber,
    required this.categoryId,
    required this.categoryName,
    required this.requiredWorkers,
    required this.acceptedWorkersCount,
    required this.assignedWorkers,
    required this.bids,
    required this.offeredPricePerWorker,
    required this.totalEstimatedAmount,
    required this.status,
    required this.paymentStatus,
    required this.startOtp,
    required this.endOtp,
    required this.scheduledDate,
    required this.startTime,
    required this.endTime,
    required this.durationType,
    required this.description,
    required this.address,
    required this.city,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final assignedList = (json['assignedWorkers'] as List<dynamic>?)
            ?.map((e) => AssignedWorkerModel.fromJson(e))
            .toList() ??
        [];
    final bidsList = (json['bids'] as List<dynamic>?)
            ?.map((e) => WorkerBidModel.fromJson(e))
            .toList() ??
        [];
    final loc = json['workLocation'] as Map<String, dynamic>?;

    return BookingModel(
      id: json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      categoryId: json['categoryId'] ?? '',
      categoryName: json['categoryName'] ?? '',
      requiredWorkers: json['requiredWorkers'] ?? 1,
      acceptedWorkersCount: json['acceptedWorkersCount'] ?? 0,
      assignedWorkers: assignedList,
      bids: bidsList,
      offeredPricePerWorker: (json['offeredPricePerWorker'] ?? 0).toDouble(),
      totalEstimatedAmount: (json['totalEstimatedAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'CREATED',
      paymentStatus: json['paymentStatus'] ?? 'pending',
      startOtp: json['startOtp'] ?? '',
      endOtp: json['endOtp'] ?? '',
      scheduledDate: json['scheduledDate'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      durationType: json['durationType'] ?? 'full_day',
      description: json['description'] ?? '',
      address: loc?['address'] ?? json['address'] ?? '',
      city: loc?['city'] ?? json['city'] ?? 'Mangalore',
    );
  }
}
