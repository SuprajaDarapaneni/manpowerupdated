import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../repositories/booking_repository.dart';
import '../repositories/category_repository.dart';
import '../models/category_model.dart';
import '../models/booking_model.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return CategoryRepository(client);
});

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return BookingRepository(client);
});

final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final repo = ref.watch(categoryRepositoryProvider);
  return repo.getCategories();
});

final customerBookingsProvider = FutureProvider<List<BookingModel>>((ref) async {
  final repo = ref.watch(bookingRepositoryProvider);
  return repo.getCustomerBookings();
});
