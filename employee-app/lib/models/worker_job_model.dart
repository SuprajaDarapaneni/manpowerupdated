class WorkerJobOffer {
  final String id;
  final String bookingId;
  final String orderNumber;
  final String categoryName;
  final String customerName;
  final String worksiteAddress;
  final double distanceKm;
  final int requiredWorkers;
  final int acceptedWorkers;
  final double payoutAmount;
  final String scheduledDate;
  final String scheduledTime;
  final String durationType;
  final int estimatedHours;
  final String status;
  final bool isOvertimeEligible;

  WorkerJobOffer({
    required this.id,
    required this.bookingId,
    required this.orderNumber,
    required this.categoryName,
    required this.customerName,
    required this.worksiteAddress,
    required this.distanceKm,
    required this.requiredWorkers,
    required this.acceptedWorkers,
    required this.payoutAmount,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.durationType,
    required this.estimatedHours,
    required this.status,
    this.isOvertimeEligible = true,
  });

  factory WorkerJobOffer.fromJson(Map<String, dynamic> json) {
    return WorkerJobOffer(
      id: json['id'] ?? '',
      bookingId: json['bookingId'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      categoryName: json['categoryName'] ?? '',
      customerName: json['customerName'] ?? '',
      worksiteAddress: json['worksiteAddress'] ?? '',
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 2.5,
      requiredWorkers: json['requiredWorkers'] ?? 1,
      acceptedWorkers: json['acceptedWorkers'] ?? 0,
      payoutAmount: (json['payoutAmount'] as num?)?.toDouble() ?? 0.0,
      scheduledDate: json['scheduledDate'] ?? '',
      scheduledTime: json['scheduledTime'] ?? '',
      durationType: json['durationType'] ?? 'Full Day',
      estimatedHours: json['estimatedHours'] ?? 8,
      status: json['status'] ?? 'PENDING',
      isOvertimeEligible: json['isOvertimeEligible'] ?? true,
    );
  }
}

class WorkerProfile {
  final String id;
  final String name;
  final String phone;
  final String email;
  final double rating;
  final int completedJobs;
  final double totalEarnings;
  final double pendingPayout;
  final String approvalStatus;
  final bool isOnline;
  final List<String> skills;

  WorkerProfile({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.rating,
    required this.completedJobs,
    required this.totalEarnings,
    required this.pendingPayout,
    required this.approvalStatus,
    required this.isOnline,
    required this.skills,
  });

  factory WorkerProfile.fromJson(Map<String, dynamic> json) {
    return WorkerProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      completedJobs: json['completedJobs'] ?? 0,
      totalEarnings: (json['totalEarnings'] as num?)?.toDouble() ?? 0.0,
      pendingPayout: (json['pendingPayout'] as num?)?.toDouble() ?? 0.0,
      approvalStatus: json['approvalStatus'] ?? 'pending',
      isOnline: json['isOnline'] ?? false,
      skills: (json['skills'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}
