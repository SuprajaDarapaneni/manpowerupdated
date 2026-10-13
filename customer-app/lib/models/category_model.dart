class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String icon;
  final bool isActive;
  final double minPrice;
  final double maxPrice;
  final double hourlyRate;
  final double fullDayRate;
  final double halfDayRate;
  final double overtimeMultiplier;
  final List<String> requiredSkills;
  final bool isFoodTiffin;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.icon,
    required this.isActive,
    required this.minPrice,
    required this.maxPrice,
    required this.hourlyRate,
    required this.fullDayRate,
    required this.halfDayRate,
    required this.overtimeMultiplier,
    required this.requiredSkills,
    this.isFoodTiffin = false,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    final dynamicFields = json['dynamicFields'] as Map<String, dynamic>?;
    return CategoryModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? 'Package',
      isActive: json['isActive'] ?? true,
      minPrice: (json['minPrice'] ?? 500).toDouble(),
      maxPrice: (json['maxPrice'] ?? 3500).toDouble(),
      hourlyRate: (json['hourlyRate'] ?? 200).toDouble(),
      fullDayRate: (json['fullDayRate'] ?? 1800).toDouble(),
      halfDayRate: (json['halfDayRate'] ?? 950).toDouble(),
      overtimeMultiplier: (json['overtimeMultiplier'] ?? 1.5).toDouble(),
      requiredSkills: List<String>.from(json['requiredSkills'] ?? []),
      isFoodTiffin: dynamicFields?['isFoodTiffin'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'icon': icon,
      'isActive': isActive,
      'minPrice': minPrice,
      'maxPrice': maxPrice,
      'hourlyRate': hourlyRate,
      'fullDayRate': fullDayRate,
      'halfDayRate': halfDayRate,
      'overtimeMultiplier': overtimeMultiplier,
      'requiredSkills': requiredSkills,
      'dynamicFields': {'isFoodTiffin': isFoodTiffin},
    };
  }
}
