// File generated for FirebaseOptions configuration
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyC8RtcSC8Q78aPazWU7bOl2IxE2VcZnVoo',
    appId: '1:886450696629:web:597fe9fbb19ac6c13da9fc',
    messagingSenderId: '886450696629',
    projectId: 'future-audio-ndpgw',
    authDomain: 'future-audio-ndpgw.firebaseapp.com',
    storageBucket: 'future-audio-ndpgw.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyC8RtcSC8Q78aPazWU7bOl2IxE2VcZnVoo',
    appId: '1:886450696629:android:597fe9fbb19ac6c13da9fc',
    messagingSenderId: '886450696629',
    projectId: 'future-audio-ndpgw',
    storageBucket: 'future-audio-ndpgw.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyC8RtcSC8Q78aPazWU7bOl2IxE2VcZnVoo',
    appId: '1:886450696629:ios:597fe9fbb19ac6c13da9fc',
    messagingSenderId: '886450696629',
    projectId: 'future-audio-ndpgw',
    storageBucket: 'future-audio-ndpgw.firebasestorage.app',
    iosBundleId: 'com.manpowerlink.customer.customerApp',
  );
}
