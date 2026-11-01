import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

/// Top-level background message handler.
/// Must be outside any class and annotated with @pragma('vm:entry-point').
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('FCM: Handling background message ID: ${message.messageId}');
  debugPrint('FCM: Background Title: ${message.notification?.title}');
  debugPrint('FCM: Background Body: ${message.notification?.body}');
  debugPrint('FCM: Background Data: ${message.data}');
}

class InAppNotificationPayload {
  final String title;
  final String body;
  final String type;
  final Map<String, dynamic> data;
  final DateTime timestamp;

  InAppNotificationPayload({
    required this.title,
    required this.body,
    this.type = 'ORDER',
    Map<String, dynamic>? data,
    DateTime? timestamp,
  })  : data = data ?? {},
        timestamp = timestamp ?? DateTime.now();
}

/// Comprehensive Firebase Cloud Messaging (FCM) & In-App Notification Service
/// Handles permission requests, FCM token retrieval & refresh,
/// foreground listening, notification tap handlers, and in-app event bus.
class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  FirebaseMessaging? get _messaging {
    try {
      return FirebaseMessaging.instance;
    } catch (e) {
      debugPrint('FCM: FirebaseMessaging unavailable: $e');
      return null;
    }
  }

  String? _fcmToken;

  /// In-app notification broadcast stream for reliable local alerts
  final StreamController<InAppNotificationPayload> _inAppController =
      StreamController<InAppNotificationPayload>.broadcast();

  Stream<InAppNotificationPayload> get inAppNotifications => _inAppController.stream;

  /// Current device FCM registration token
  String? get fcmToken => _fcmToken;

  /// Trigger an instant in-app notification with banner, sound and feed recording
  void triggerInAppNotification({
    required String title,
    required String body,
    String type = 'ORDER',
    Map<String, dynamic>? data,
  }) {
    final payload = InAppNotificationPayload(
      title: title,
      body: body,
      type: type,
      data: data,
    );
    _inAppController.add(payload);
    debugPrint('[NOTIFICATION BROADCAST] Dispatched in-app notification: $title - $body');
  }

  /// Request permissions and retrieve device FCM token
  Future<String?> initialize() async {
    try {
      final messaging = _messaging;
      if (messaging == null) {
        debugPrint('FCM: FirebaseMessaging not available on this platform. Using in-app notifications.');
        _fcmToken = 'simulated-token-${DateTime.now().millisecondsSinceEpoch}';
        return _fcmToken;
      }

      final settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('FCM: Permission status: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        debugPrint('FCM: Notification permission denied by user.');
        _fcmToken ??= 'fcm-local-permission-denied';
        return null;
      }

      // Fetch the device token with 6 second timeout
      try {
        // ignore: deprecated_member_use
        _fcmToken = await messaging.getToken().timeout(const Duration(seconds: 6));
        debugPrint('====================================================');
        debugPrint('FCM TOKEN: $_fcmToken');
        debugPrint('====================================================');
      } catch (tokenErr) {
        debugPrint('FCM: Token retrieval timed out or unavailable: $tokenErr');
        _fcmToken = 'fcm-standalone-${DateTime.now().millisecondsSinceEpoch}';
      }

      // Listen for token refresh events
      try {
        // ignore: deprecated_member_use
        messaging.onTokenRefresh.listen((newToken) {
          _fcmToken = newToken;
          debugPrint('FCM: Token refreshed: $newToken');
        });
      } catch (_) {}

      // Default topic subscriptions for customer updates
      await subscribeToTopic('all_customers');
      await subscribeToTopic('customer_mangalore');

      return _fcmToken;
    } catch (e) {
      debugPrint('FCM Initialization error: $e');
      _fcmToken = 'fcm-simulated-${DateTime.now().millisecondsSinceEpoch}';
      return _fcmToken;
    }
  }

  /// Listen for foreground messages, background opening, and cold-launch taps
  void listenToMessages({
    void Function(RemoteMessage message)? onMessageReceived,
    void Function(RemoteMessage message)? onMessageOpenedApp,
  }) {
    final messaging = _messaging;
    if (messaging == null) return;

    try {
      // 1. Foreground message stream
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('FCM: Foreground message received!');
        debugPrint('FCM Title: ${message.notification?.title}');
        debugPrint('FCM Body: ${message.notification?.body}');
        debugPrint('FCM Data: ${message.data}');

        if (onMessageReceived != null) {
          onMessageReceived(message);
        }
      });

      // 2. Notification tapped when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('FCM: Notification tapped from background state!');
        debugPrint('FCM Data: ${message.data}');

        if (onMessageOpenedApp != null) {
          onMessageOpenedApp(message);
        }
      });

      // 3. App opened from terminated state by tapping a notification
      messaging.getInitialMessage().then((RemoteMessage? message) {
        if (message != null) {
          debugPrint('FCM: App cold-launched from notification tap!');
          debugPrint('FCM Data: ${message.data}');

          if (onMessageOpenedApp != null) {
            onMessageOpenedApp(message);
          }
        }
      });
    } catch (e) {
      debugPrint('FCM: Message listener setup error: $e');
    }
  }

  /// Subscribe to a broadcast topic (e.g. city-wide alerts, promotions)
  Future<void> subscribeToTopic(String topic) async {
    final messaging = _messaging;
    if (messaging == null) return;
    try {
      await messaging.subscribeToTopic(topic);
      debugPrint('FCM: Subscribed to topic "$topic"');
    } catch (e) {
      debugPrint('FCM: Failed to subscribe to topic "$topic": $e');
    }
  }

  /// Unsubscribe from a broadcast topic
  Future<void> unsubscribeFromTopic(String topic) async {
    final messaging = _messaging;
    if (messaging == null) return;
    try {
      await messaging.unsubscribeFromTopic(topic);
      debugPrint('FCM: Unsubscribed from topic "$topic"');
    } catch (e) {
      debugPrint('FCM: Failed to unsubscribe from topic "$topic": $e');
    }
  }
}
