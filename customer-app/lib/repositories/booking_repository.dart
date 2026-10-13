import '../core/network/api_client.dart';
import '../models/booking_model.dart';

class BookingRepository {
  final ApiClient apiClient;

  BookingRepository(this.apiClient);

  Future<List<BookingModel>> getCustomerBookings() async {
    try {
      final response = await apiClient.dio.get('/bookings');
      if (response.data['success'] == true) {
        final List data = response.data['data'] ?? [];
        return data.map((e) => BookingModel.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      // Graceful fallback to initial bookings if offline / demo
      return [];
    }
  }

  Future<BookingModel> createBooking(Map<String, dynamic> bookingData) async {
    final response = await apiClient.dio.post('/bookings', data: bookingData);
    if (response.data['success'] == true) {
      return BookingModel.fromJson(response.data['data']);
    }
    throw Exception(response.data['message'] ?? 'Failed to create booking');
  }

  Future<void> raiseBookingPrice(String bookingId, double newPrice, String reason) async {
    await apiClient.dio.put(
      '/bookings/$bookingId/raise-price',
      data: {'newPrice': newPrice, 'reason': reason},
    );
  }

  Future<void> rateWorker(String bookingId, String workerId, double rating, String comments) async {
    await apiClient.dio.post(
      '/bookings/$bookingId/rate',
      data: {
        'workerId': workerId,
        'rating': rating,
        'comments': comments,
      },
    );
  }
}
