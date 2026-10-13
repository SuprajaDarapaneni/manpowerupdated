import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/worker_repository.dart';
import '../models/worker_job_model.dart';

final workerRepositoryProvider = Provider<WorkerRepository>((ref) {
  return WorkerRepository();
});

final workerProfileProvider = FutureProvider<WorkerProfile>((ref) async {
  final repo = ref.watch(workerRepositoryProvider);
  return repo.getProfile();
});

final workerOffersProvider = FutureProvider<List<WorkerJobOffer>>((ref) async {
  final repo = ref.watch(workerRepositoryProvider);
  return repo.getAvailableOffers();
});

final workerOnlineStatusProvider = StateProvider<bool>((ref) => true);
