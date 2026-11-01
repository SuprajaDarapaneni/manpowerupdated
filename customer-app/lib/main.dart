import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'firebase_options.dart';
import 'services/fcm_service.dart';
import 'services/local_asset_server.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('Firebase initialization warning: $e');
  }

  runApp(const ProviderScope(child: ManPowerLinkCustomerApp()));
}

class ManPowerLinkCustomerApp extends StatefulWidget {
  const ManPowerLinkCustomerApp({super.key});

  @override
  State<ManPowerLinkCustomerApp> createState() => _ManPowerLinkCustomerAppState();
}

class _ManPowerLinkCustomerAppState extends State<ManPowerLinkCustomerApp> {
  final LocalAssetServer _server = LocalAssetServer();
  WebViewController? _controller;
  bool _isLoading = true;
  String? _errorMessage;
  DateTime? _lastBackPressTime;

  @override
  void initState() {
    super.initState();
    _startApp();
  }

  Future<void> _startApp() async {
    try {
      final port = await _server.start();

      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(const Color(0xFFFFFDF8))
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (String url) {
              if (mounted) {
                setState(() {
                  _isLoading = true;
                  _errorMessage = null;
                });
              }
            },
            onPageFinished: (String url) {
              if (mounted) {
                setState(() {
                  _isLoading = false;
                });
              }
            },
            onWebResourceError: (WebResourceError error) {
              debugPrint('WebView Error: ${error.description}');
            },
          ),
        );

      final targetUrl = 'http://127.0.0.1:$port/?preview=customer&standalone=true#customer';
      await controller.loadRequest(Uri.parse(targetUrl));

      if (mounted) {
        setState(() {
          _controller = controller;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  @override
  void dispose() {
    _server.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ManPowerLink Customer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFFFFDF8),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFFD71920),
          secondary: Color(0xFFFFC928),
          surface: Colors.white,
        ),
      ),
      home: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          if (_controller != null && await _controller!.canGoBack()) {
            await _controller!.goBack();
            return;
          }

          final now = DateTime.now();
          if (_lastBackPressTime == null ||
              now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
            _lastBackPressTime = now;
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Press back again to exit ManPowerLink'),
                  duration: Duration(seconds: 2),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            }
          } else {
            SystemNavigator.pop();
          }
        },
        child: Scaffold(
          backgroundColor: const Color(0xFFFFFDF8),
          body: SafeArea(
            child: Stack(
              children: [
                if (_controller != null)
                  WebViewWidget(controller: _controller!),
                if (_isLoading)
                  Container(
                    color: const Color(0xFFFFFDF8),
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(
                            color: Color(0xFFD71920),
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Loading ManPowerLink Customer...',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF202124),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (_errorMessage != null)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline,
                              color: Color(0xFFD71920), size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'Failed to Load Application',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF202124),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _errorMessage!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF686868),
                            ),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _startApp,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Try Again'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFD71920),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
