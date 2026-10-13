class RemoteAppConfig {
  final String appName;
  final String tagline;
  final String primaryColor;
  final String logoUrl;
  final String supportEmail;
  final String supportPhone;
  final bool maintenanceMode;
  final String minVersion;
  final String latestVersion;
  final bool forceUpgrade;
  final List<String> announcements;

  RemoteAppConfig({
    required this.appName,
    required this.tagline,
    required this.primaryColor,
    required this.logoUrl,
    required this.supportEmail,
    required this.supportPhone,
    required this.maintenanceMode,
    required this.minVersion,
    required this.latestVersion,
    required this.forceUpgrade,
    required this.announcements,
  });

  factory RemoteAppConfig.fromJson(Map<String, dynamic> json) {
    return RemoteAppConfig(
      appName: json['appName'] ?? 'ManPowerLink',
      tagline: json['tagline'] ?? 'Instant On-Demand Temporary Labor Marketplace',
      primaryColor: json['primaryColor'] ?? '#D71920',
      logoUrl: json['logoUrl'] ?? '',
      supportEmail: json['supportEmail'] ?? 'support@manpowerlink.com',
      supportPhone: json['supportPhone'] ?? '+91 800 555 0199',
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

  static RemoteAppConfig fallback() {
    return RemoteAppConfig(
      appName: 'ManPowerLink',
      tagline: 'Instant On-Demand Temporary Labor Marketplace',
      primaryColor: '#D71920',
      logoUrl: '',
      supportEmail: 'support@manpowerlink.com',
      supportPhone: '+91 800 555 0199',
      maintenanceMode: false,
      minVersion: '1.0.0',
      latestVersion: '1.0.0',
      forceUpgrade: false,
      announcements: [],
    );
  }
}
