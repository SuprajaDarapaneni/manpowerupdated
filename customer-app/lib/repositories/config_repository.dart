import 'package:dio/dio.dart';
import '../models/remote_config_model.dart';
import '../core/config/env_config.dart';

class ConfigRepository {
  final Dio _dio;

  ConfigRepository({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: EnvConfig.apiBaseUrl,
                connectTimeout: const Duration(seconds: 8),
                receiveTimeout: const Duration(seconds: 8),
              ),
            );

  Future<RemoteAppConfig> fetchCustomerConfig() async {
    try {
      final res = await _dio.get('/config/customer');
      if (res.data != null && res.data['data'] != null) {
        return RemoteAppConfig.fromJson(res.data['data']);
      }
    } catch (_) {
      // Fallback safely on network timeout without crashing
    }
    return RemoteAppConfig.fallback();
  }

  Future<bool> recordLegalAcceptance({
    required String userId,
    required String documentId,
    required String documentType,
    required String versionAccepted,
  }) async {
    try {
      final res = await _dio.post('/legal/accept', data: {
        'userId': userId,
        'userRole': 'customer',
        'documentId': documentId,
        'documentType': documentType,
        'versionAccepted': versionAccepted,
      });
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return true;
    }
  }
}
