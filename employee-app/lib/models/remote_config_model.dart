class WorkerRemoteConfig {
  final String appName;
  final String tagline;
  final String primaryColor;
  final String logoUrl;
  final String supportEmail;
  final String supportPhone;
  final String emergencyHotline;
  final bool maintenanceMode;
  final String minVersion;
  final String latestVersion;
  final bool forceUpgrade;
  final List<String> announcements;

  WorkerRemoteConfig({
    required this.appName,
    required this.tagline,
    required this.primaryColor,
    required this.logoUrl,
    required this.supportEmail,
    required this.supportPhone,
    required this.emergencyHotline,
    required this.maintenanceMode,
    required this.minVersion,
    required this.latestVersion,
    required this.forceUpgrade,
    required this.announcements,
  });

  factory WorkerRemoteConfig.fromJson(Map<String, dynamic> json) {
    return WorkerRemoteConfig(
      appName: json['appName'] ?? 'ManPowerLink Worker',
      tagline: json['tagline'] ?? 'Instant On-Demand Temporary Labor Marketplace',
      primaryColor: json['primaryColor'] ?? '#D71920',
      logoUrl: json['logoUrl'] ?? '',
      supportEmail: json['supportEmail'] ?? 'worker-support@manpowerlink.com',
      supportPhone: json['supportPhone'] ?? '+91 800 555 0199',
      emergencyHotline: json['emergencyHotline'] ?? '+91 1800 911 2026',
      maintenanceMode: json['maintenanceMode'] ?? false,
      minVersion: json['minVersion'] ?? '1.0.0',
      latestVersion: json['latestVersion'] ?? '1.0.0',
      forceUpgrade: json['forceUpgrade'] ?? false,
      announcements: (json['announcements'] as List<dynamic>?)
              ?.map((e) => e['title']?.toString() ?? '')
              .toList() ??
          [],
    );
  }

  static WorkerRemoteConfig fallback() {
    return WorkerRemoteConfig(
      appName: 'ManPowerLink Worker',
      tagline: 'Instant On-Demand Temporary Labor Marketplace',
      primaryColor: '#D71920',
      logoUrl: '',
      supportEmail: 'worker-support@manpowerlink.com',
      supportPhone: '+91 800 555 0199',
      emergencyHotline: '+91 1800 911 2026',
      maintenanceMode: false,
      minVersion: '1.0.0',
      latestVersion: '1.0.0',
      forceUpgrade: false,
      announcements: [],
    );
  }
}
