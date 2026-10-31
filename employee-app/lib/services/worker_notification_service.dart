import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class WorkerNotificationPayload {
  final String title;
  final String body;
  final String type;
  final Map<String, dynamic> data;
  final DateTime timestamp;

  WorkerNotificationPayload({
    required this.title,
    required this.body,
    this.type = 'SHIFT',
    Map<String, dynamic>? data,
    DateTime? timestamp,
  })  : data = data ?? {},
        timestamp = timestamp ?? DateTime.now();
}

/// Comprehensive Worker Push & Heads-Up Notification Service
class WorkerNotificationService {
  static final WorkerNotificationService _instance = WorkerNotificationService._internal();
  factory WorkerNotificationService() => _instance;
  WorkerNotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel',
    'Worker Shift Alerts & Notifications',
    description: 'High-priority notifications for new job broadcasts, OTPs, and wage deposits.',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
    showBadge: true,
  );

  bool _isInitialized = false;

  final StreamController<WorkerNotificationPayload> _streamController =
      StreamController<WorkerNotificationPayload>.broadcast();

  Stream<WorkerNotificationPayload> get notificationsStream => _streamController.stream;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const darwinSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: darwinSettings,
      );

      await _localNotifications.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          debugPrint('Worker Notification tapped: ${response.payload}');
        },
      );

      final androidPlugin = _localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(_channel);
        await androidPlugin.requestNotificationsPermission();
      }

      _isInitialized = true;
      debugPrint('WorkerNotificationService: Initialized successfully.');
    } catch (e) {
      debugPrint('WorkerNotificationService init error: $e');
    }
  }

  Future<void> showSystemNotification({
    required String title,
    required String body,
    String type = 'SHIFT',
    Map<String, dynamic>? data,
  }) async {
    try {
      if (!_isInitialized) {
        await initialize();
      }

      final id = DateTime.now().millisecondsSinceEpoch ~/ 1000;

      final androidDetails = AndroidNotificationDetails(
        _channel.id,
        _channel.name,
        channelDescription: _channel.description,
        importance: Importance.max,
        priority: Priority.high,
        ticker: title,
        icon: '@mipmap/ic_launcher',
        enableVibration: true,
        playSound: true,
        channelShowBadge: true,
        styleInformation: BigTextStyleInformation(
          body,
          contentTitle: title,
          summaryText: type,
        ),
      );

      const darwinDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      final details = NotificationDetails(
        android: androidDetails,
        iOS: darwinDetails,
      );

      await _localNotifications.show(
        id: id,
        title: title,
        body: body,
        notificationDetails: details,
        payload: type,
      );
      debugPrint('[WORKER HEADS-UP NOTIFICATION] Dispatched: $title - $body');
    } catch (e) {
      debugPrint('Worker notification error: $e');
    }
  }

  void triggerNotification({
    required String title,
    required String body,
    String type = 'SHIFT',
    Map<String, dynamic>? data,
    bool showSystemPush = true,
  }) {
    final payload = WorkerNotificationPayload(
      title: title,
      body: body,
      type: type,
      data: data,
    );
    _streamController.add(payload);

    if (showSystemPush) {
      showSystemNotification(
        title: title,
        body: body,
        type: type,
        data: data,
      );
    }
  }
}
