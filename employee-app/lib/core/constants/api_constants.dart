class ApiConstants {
  static const String defaultBaseUrl = 'https://ais-dev-37iy4fwehdy2jyf4opduhb-10774247811.asia-southeast1.run.app/api';
  
  static const String workerLogin = '/auth/worker/login';
  static const String workerProfile = '/auth/worker/profile';
  static const String workerOffers = '/worker/offers';
  static const String acceptOffer = '/worker/offers/{id}/accept';
  static const String rejectOffer = '/worker/offers/{id}/reject';
  static const String verifyStartOtp = '/worker/jobs/{id}/start-otp';
  static const String verifyEndOtp = '/worker/jobs/{id}/end-otp';
  static const String updateLocation = '/worker/location';
  static const String emergencyAlert = '/safety/report';
}
