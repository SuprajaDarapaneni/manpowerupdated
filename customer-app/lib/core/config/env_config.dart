class EnvConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:5000/api/v1',
  );

  static const String socketBaseUrl = String.fromEnvironment(
    'SOCKET_BASE_URL',
    defaultValue: 'http://localhost:5000',
  );

  static const String appName = 'ManPowerLink Customer';
  static const String defaultCity = 'Mangalore';
}
