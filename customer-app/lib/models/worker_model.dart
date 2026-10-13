class WorkerModel {
  final String id;
  final String name;
  final String phone;
  final String avatar;
  final double rating;
  final int completedJobs;
  final double hourlyRate;
  final List<String> skills;
  final String city;

  WorkerModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.avatar,
    required this.rating,
    required this.completedJobs,
    required this.hourlyRate,
    required this.skills,
    required this.city,
  });

  factory WorkerModel.fromJson(Map<String, dynamic> json) {
    return WorkerModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      avatar: json['avatar'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      completedJobs: json['completedJobs'] ?? 0,
      hourlyRate: (json['hourlyRate'] ?? 200).toDouble(),
      skills: List<String>.from(json['skills'] ?? []),
      city: json['city'] ?? 'Mangalore',
    );
  }
}
