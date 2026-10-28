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

/// Comprehensive Firebase Cloud Messaging (FCM) Service
/// Handles permission requests, FCM token retrieval & refresh,
/// foreground listening, notification tap handlers, and topic subscriptions.
class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  String? _fcmToken;

  /// Current device FCM registration token
  String? get fcmToken => _fcmToken;

  /// Request permissions and retrieve device FCM token
  Future<String?> initialize() async {
    try {
      final settings = await _messaging.requestPermission(
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
        return null;
      }

      // Fetch the device token
      // ignore: deprecated_member_use
      _fcmToken = await _messaging.getToken();
      debugPrint('====================================================');
      debugPrint('FCM TOKEN: $_fcmToken');
      debugPrint('====================================================');

      // Listen for token refresh events
      // ignore: deprecated_member_use
      _messaging.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        debugPrint('FCM: Token refreshed: $newToken');
        // Forward refreshed token to your backend API here if applicable
      });

      // Default topic subscriptions for customer updates
      await subscribeToTopic('all_customers');
      await subscribeToTopic('customer_mangalore');

      return _fcmToken;
    } catch (e) {
      debugPrint('FCM Initialization error: $e');
      return null;
    }
  }

  /// Listen for foreground messages, background opening, and cold-launch taps
  void listenToMessages({
    void Function(RemoteMessage message)? onMessageReceived,
    void Function(RemoteMessage message)? onMessageOpenedApp,
  }) {
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
    _messaging.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        debugPrint('FCM: App cold-launched from notification tap!');
        debugPrint('FCM Data: ${message.data}');

        if (onMessageOpenedApp != null) {
          onMessageOpenedApp(message);
        }
      }
    });
  }

  /// Subscribe to a broadcast topic (e.g. city-wide alerts, promotions)
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      debugPrint('FCM: Subscribed to topic "$topic"');
    } catch (e) {
      debugPrint('FCM: Failed to subscribe to topic "$topic": $e');
    }
  }

  /// Unsubscribe from a broadcast topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      debugPrint('FCM: Unsubscribed from topic "$topic"');
    } catch (e) {
      debugPrint('FCM: Failed to unsubscribe from topic "$topic": $e');
    }
  }
}
