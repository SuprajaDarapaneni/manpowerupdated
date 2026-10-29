import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'firebase_options.dart';
import 'services/fcm_service.dart';
import 'models/location_model.dart';
import 'widgets/location_picker_sheet.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

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

// ---------------------------------------------------------------------------
// 0. BRAND THEME & COLORS
// ---------------------------------------------------------------------------
class CustomerTheme {
  static const Color primaryRed = Color(0xFFD71920);
  static const Color darkRed = Color(0xFFA80F18);
  static const Color primaryYellow = Color(0xFFFFC928);
  static const Color darkGold = Color(0xFFE5A900);
  static const Color backgroundColor = Color(0xFFFFFDF8);
  static const Color cardColor = Colors.white;
  static const Color textPrimary = Color(0xFF202124);
  static const Color textSecondary = Color(0xFF686868);
  static const Color successGreen = Color(0xFF16834A);
}

// ---------------------------------------------------------------------------
// 1. DATA MODELS & STATE FOR CUSTOMER BOOKINGS & WORKSITES
// ---------------------------------------------------------------------------
class CustomerBooking {
  final String id;
  final String orderNumber;
  final String title;
  final String category;
  final int workersNeeded;
  int workersAccepted;
  final String durationType; // 'Full Day (8h)' | 'Half Day (4h)' | 'Hourly Basis' | 'Full Package (Lump Sum / Project Basis)'
  final String scheduledDate;
  final String scheduledTime;
  final String address;
  final double pricePerWorker;
  final double totalEstimatedAmount;
  String status; // 'SEARCHING_EMPLOYEES' | 'OFFERS_SENT' | 'WORK_IN_PROGRESS' | 'ORDER_COMPLETED' | 'CANCELLED'
  final String startOtp;
  final String endOtp;
  final bool hasTiffin;
  final String? tiffinDetails;
  final String? remarks;
  final String? approxTimeToComplete;
  final double? hourlyRatePerHead;
  final int? estimatedHours;
  final String paymentMethod; // 'CASH_DIRECT_UPI'
  final double latitude;
  final double longitude;
  final bool isGpsAutoDetected;

  CustomerBooking({
    required this.id,
    required this.orderNumber,
    required this.title,
    required this.category,
    required this.workersNeeded,
    required this.workersAccepted,
    required this.durationType,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.address,
    required this.pricePerWorker,
    required this.totalEstimatedAmount,
    required this.status,
    required this.startOtp,
    required this.endOtp,
    this.hasTiffin = false,
    this.tiffinDetails,
    this.remarks,
    this.approxTimeToComplete,
    this.hourlyRatePerHead,
    this.estimatedHours,
    this.paymentMethod = 'CASH_DIRECT_UPI',
    this.latitude = 12.9141,
    this.longitude = 74.8560,
    this.isGpsAutoDetected = true,
  });
}

class SavedWorksite {
  final String id;
  final String name;
  final String address;
  final String contactPerson;
  final String contactPhone;
  final double latitude;
  final double longitude;
  final String? area;
  final String? landmark;

  SavedWorksite({
    required this.id,
    required this.name,
    required this.address,
    required this.contactPerson,
    required this.contactPhone,
    this.latitude = 12.9141,
    this.longitude = 74.8560,
    this.area,
    this.landmark,
  });

  WorksiteLocation toWorksiteLocation() {
    return WorksiteLocation(
      id: id,
      name: name,
      address: address,
      area: area ?? (address.contains('Baikampady') ? 'Baikampady' : (address.contains('Panambur') ? 'Panambur' : 'Mangalore')),
      city: 'Mangalore',
      pincode: '575011',
      latitude: latitude,
      longitude: longitude,
      categoryTag: 'Custom',
      landmark: landmark,
      contactPerson: contactPerson,
      contactPhone: contactPhone,
      isGpsAutoDetected: false,
    );
  }
}

// Customer Auth State
class CustomerAuthState {
  final bool isAuthenticated;
  final String? userName;
  final String? companyName;
  final String? userPhone;
  final String? userEmail;

  const CustomerAuthState({
    this.isAuthenticated = false,
    this.userName,
    this.companyName,
    this.userPhone,
    this.userEmail,
  });

  CustomerAuthState copyWith({
    bool? isAuthenticated,
    String? userName,
    String? companyName,
    String? userPhone,
    String? userEmail,
  }) {
    return CustomerAuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userName: userName ?? this.userName,
      companyName: companyName ?? this.companyName,
      userPhone: userPhone ?? this.userPhone,
      userEmail: userEmail ?? this.userEmail,
    );
  }
}

class CustomerAuthNotifier extends StateNotifier<CustomerAuthState> {
  CustomerAuthNotifier() : super(const CustomerAuthState());

  void signIn(String phoneOrEmail, String password) {
    state = state.copyWith(
      isAuthenticated: true,
      userName: 'Karthik Rao',
      companyName: 'Apex Logistics & Warehousing',
      userPhone: '+91 99001 55432',
      userEmail: phoneOrEmail.contains('@') ? phoneOrEmail : 'contact@apexlogistics.in',
    );
  }

  void signUp(String name, String company, String phone, String email, String password) {
    state = state.copyWith(
      isAuthenticated: true,
      userName: name,
      companyName: company.isNotEmpty ? company : name,
      userPhone: phone,
      userEmail: email,
    );
  }

  void signOut() {
    state = const CustomerAuthState(isAuthenticated: false);
  }
}

final customerAuthProvider =
    StateNotifierProvider<CustomerAuthNotifier, CustomerAuthState>((ref) {
  return CustomerAuthNotifier();
});

// Bookings Notifier
class CustomerBookingsState {
  final List<CustomerBooking> bookings;
  final List<SavedWorksite> worksites;

  const CustomerBookingsState({
    this.bookings = const [],
    this.worksites = const [],
  });

  CustomerBookingsState copyWith({
    List<CustomerBooking>? bookings,
    List<SavedWorksite>? worksites,
  }) {
    return CustomerBookingsState(
      bookings: bookings ?? this.bookings,
      worksites: worksites ?? this.worksites,
    );
  }
}

class CustomerBookingsNotifier extends StateNotifier<CustomerBookingsState> {
  CustomerBookingsNotifier()
      : super(CustomerBookingsState(
          bookings: [
            CustomerBooking(
              id: 'ord-1045',
              orderNumber: '1045',
              title: 'Container De-stuffing & Unloading',
              category: 'Loading & Unloading',
              workersNeeded: 5,
              workersAccepted: 5,
              durationType: 'Full Day (8 Hours)',
              scheduledDate: 'Today',
              scheduledTime: '08:00 AM - 04:00 PM',
              address: 'Panambur Container Terminal Dock 4, Mangalore',
              pricePerWorker: 2000.0,
              totalEstimatedAmount: 10000.0,
              status: 'OFFERS_SENT',
              startOtp: '5918',
              endOtp: '9204',
              hasTiffin: true,
              tiffinDetails: 'Morning Breakfast & Afternoon Lunch provided',
              remarks: 'Gate 4 security pass required. Report to Supervisor Ganesh.',
            ),
            CustomerBooking(
              id: 'ord-1041',
              orderNumber: '1041',
              title: 'Warehouse Pallet Stacking & Wrapping',
              category: 'Warehouse & Packaging',
              workersNeeded: 4,
              workersAccepted: 4,
              durationType: 'Full Package (Lump Sum / Project Basis)',
              scheduledDate: '13 Oct 2026',
              scheduledTime: '09:00 AM - 03:00 PM',
              address: 'Baikampady Industrial Estate Gate 2, Mangalore',
              pricePerWorker: 2000.0,
              totalEstimatedAmount: 8000.0,
              status: 'ORDER_COMPLETED',
              startOtp: '3318',
              endOtp: '7412',
              approxTimeToComplete: 'Approx 5 - 6 Hours',
              remarks: 'De-stuffing of 2 containers complete with pallet wrapping.',
            ),
          ],
          worksites: [
            SavedWorksite(
              id: 'ws-1',
              name: 'Panambur Port Terminal',
              address: 'Panambur Container Terminal Dock 4, Mangalore',
              contactPerson: 'Supervisor Ganesh',
              contactPhone: '+91 98800 11223',
            ),
            SavedWorksite(
              id: 'ws-2',
              name: 'Baikampady Warehouse #3',
              address: 'Baikampady Industrial Estate Plot 42, Mangalore',
              contactPerson: 'Manager Suresh',
              contactPhone: '+91 98800 44556',
            ),
          ],
        ));

  void createBooking({
    required String title,
    required String category,
    required int workersNeeded,
    required String durationType,
    required String address,
    required double pricePerWorker,
    required double totalEstimatedAmount,
    required String scheduledDate,
    required String scheduledTime,
    required bool hasTiffin,
    String? tiffinDetails,
    String? remarks,
    String? approxTimeToComplete,
    double? hourlyRatePerHead,
    int? estimatedHours,
    double? latitude,
    double? longitude,
    bool isGpsAutoDetected = true,
  }) {
    final orderNum = (1048 + state.bookings.length).toString();
    final newBooking = CustomerBooking(
      id: 'ord-$orderNum',
      orderNumber: orderNum,
      title: title,
      category: category,
      workersNeeded: workersNeeded,
      workersAccepted: 0,
      durationType: durationType,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      address: address,
      pricePerWorker: pricePerWorker,
      totalEstimatedAmount: totalEstimatedAmount,
      status: 'SEARCHING_EMPLOYEES',
      startOtp: (1000 + (DateTime.now().millisecondsSinceEpoch % 9000)).toString(),
      endOtp: (1000 + ((DateTime.now().millisecondsSinceEpoch + 7) % 9000)).toString(),
      hasTiffin: hasTiffin,
      tiffinDetails: tiffinDetails,
      remarks: remarks,
      approxTimeToComplete: approxTimeToComplete,
      hourlyRatePerHead: hourlyRatePerHead,
      estimatedHours: estimatedHours,
      latitude: latitude ?? 12.9141,
      longitude: longitude ?? 74.8560,
      isGpsAutoDetected: isGpsAutoDetected,
    );

    state = state.copyWith(bookings: [newBooking, ...state.bookings]);
  }

  void cancelBooking(String id) {
    final updated = state.bookings.map((b) {
      if (b.id == id) {
        b.status = 'CANCELLED';
      }
      return b;
    }).toList();
    state = state.copyWith(bookings: updated);
  }

  void addWorksite(SavedWorksite ws) {
    state = state.copyWith(worksites: [...state.worksites, ws]);
  }

  void removeWorksite(String id) {
    state = state.copyWith(
      worksites: state.worksites.where((w) => w.id != id).toList(),
    );
  }
}

final customerBookingsProvider =
    StateNotifierProvider<CustomerBookingsNotifier, CustomerBookingsState>((ref) {
  return CustomerBookingsNotifier();
});

// ---------------------------------------------------------------------------
// 1A. CUSTOMER ACTIVE LOCATION & WORKSITE STATE PROVIDER
// ---------------------------------------------------------------------------
class CustomerActiveLocationNotifier extends StateNotifier<WorksiteLocation> {
  CustomerActiveLocationNotifier() : super(WorksiteLocation.defaultLocation);

  void setLocation(WorksiteLocation location) {
    state = location;
  }
}

final customerActiveLocationProvider =
    StateNotifierProvider<CustomerActiveLocationNotifier, WorksiteLocation>((ref) {
  return CustomerActiveLocationNotifier();
});

// ---------------------------------------------------------------------------
// 1B. NOTIFICATIONS STATE PROVIDER
// ---------------------------------------------------------------------------
class CustomerNotification {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  final bool isRead;
  final String type; // 'ORDER', 'ARRIVAL', 'START_OTP', 'END_OTP', 'PAYMENT'

  CustomerNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    this.isRead = false,
    this.type = 'ORDER',
  });

  CustomerNotification copyWith({bool? isRead}) {
    return CustomerNotification(
      id: id,
      title: title,
      body: body,
      timestamp: timestamp,
      isRead: isRead ?? this.isRead,
      type: type,
    );
  }
}

class CustomerNotificationsNotifier extends StateNotifier<List<CustomerNotification>> {
  CustomerNotificationsNotifier()
      : super([
          CustomerNotification(
            id: 'notif-1',
            title: '5 of 5 Workers Confirmed for Order #1045',
            body: 'Ramesh Kumar and 4 others accepted the shift. They are on their way to Dock 4.',
            timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
            type: 'ARRIVAL',
          ),
          CustomerNotification(
            id: 'notif-2',
            title: 'Start OTP Ready for Shift #1045',
            body: 'Your attendance Start OTP is ready. Provide this code only when workers physically arrive at worksite.',
            timestamp: DateTime.now().subtract(const Duration(hours: 1)),
            type: 'START_OTP',
          ),
          CustomerNotification(
            id: 'notif-3',
            title: 'Escrow Payment Secured',
            body: '₹10,000 for Order #1045 is held securely. It will be settled upon End OTP verification.',
            timestamp: DateTime.now().subtract(const Duration(hours: 2)),
            type: 'PAYMENT',
          ),
        ]);

  void addNotification({
    required String title,
    required String body,
    String type = 'ORDER',
  }) {
    final notif = CustomerNotification(
      id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      body: body,
      timestamp: DateTime.now(),
      type: type,
    );
    state = [notif, ...state];
  }

  void markAsRead(String id) {
    state = state.map((n) => n.id == id ? n.copyWith(isRead: true) : n).toList();
  }

  void markAllAsRead() {
    state = state.map((n) => n.copyWith(isRead: true)).toList();
  }

  void clearAll() {
    state = [];
  }
}

final customerNotificationsProvider =
    StateNotifierProvider<CustomerNotificationsNotifier, List<CustomerNotification>>((ref) {
  return CustomerNotificationsNotifier();
});

// Category selection helper provider for seamless Home -> Post Job flow
final preselectedCategoryProvider = StateProvider<String?>((ref) => null);

// Active Tab provider for shell navigation
final customerActiveTabProvider = StateProvider<int>((ref) => 0);

// ---------------------------------------------------------------------------
// 2. ROOT APP ROUTER
// ---------------------------------------------------------------------------
class ManPowerLinkCustomerApp extends ConsumerStatefulWidget {
  const ManPowerLinkCustomerApp({super.key});

  @override
  ConsumerState<ManPowerLinkCustomerApp> createState() => _ManPowerLinkCustomerAppState();
}

class _ManPowerLinkCustomerAppState extends ConsumerState<ManPowerLinkCustomerApp> {
  final GlobalKey<ScaffoldMessengerState> _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
  final FCMService _fcmService = FCMService();

  @override
  void initState() {
    super.initState();
    _initializeFCM();
  }

  Future<void> _initializeFCM() async {
    final token = await _fcmService.initialize();
    if (token != null) {
      debugPrint('FCM Ready: $token');
    }

    void handleIncomingPayload(String title, String body, String type) {
      // 1. Add directly to live notifications feed
      ref.read(customerNotificationsProvider.notifier).addNotification(
            title: title,
            body: body,
            type: type,
          );

      // 2. Play tactile haptic pulse
      HapticFeedback.heavyImpact();

      // 3. Display high-priority floating in-app notification banner
      _scaffoldMessengerKey.currentState?.removeCurrentSnackBar();
      _scaffoldMessengerKey.currentState?.showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.notifications_active, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                    const SizedBox(height: 2),
                    Text(body, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: Colors.white70)),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: CustomerTheme.primaryRed,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 4),
        ),
      );
    }

    // Listen to local & cross-app broadcast events
    _fcmService.inAppNotifications.listen((payload) {
      handleIncomingPayload(payload.title, payload.body, payload.type);
    });

    // Listen to FCM push messages
    _fcmService.listenToMessages(
      onMessageReceived: (RemoteMessage message) {
        final title = message.notification?.title ?? message.data['title'] ?? 'Shift Notification';
        final body = message.notification?.body ?? message.data['body'] ?? 'You have a new update regarding your manpower booking.';
        final type = message.data['type'] ?? 'ORDER';
        handleIncomingPayload(title, body, type);
      },
      onMessageOpenedApp: (RemoteMessage message) {
        debugPrint('FCM: Notification tapped from system tray: ${message.data}');
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(customerAuthProvider);

    return MaterialApp(
      scaffoldMessengerKey: _scaffoldMessengerKey,
      title: 'ManPowerLink Customer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: CustomerTheme.backgroundColor,
        colorScheme: const ColorScheme.light(
          primary: CustomerTheme.primaryRed,
          secondary: CustomerTheme.primaryYellow,
          surface: CustomerTheme.cardColor,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: CustomerTheme.primaryRed,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: authState.isAuthenticated
          ? const CustomerMainShell()
          : const CustomerSignInScreen(),
    );
  }
}

// ---------------------------------------------------------------------------
// 3. AUTHENTICATION SCREENS (Sign In, Sign Up, Forgot Password)
// ---------------------------------------------------------------------------
class CustomerSignInScreen extends ConsumerStatefulWidget {
  const CustomerSignInScreen({super.key});

  @override
  ConsumerState<CustomerSignInScreen> createState() => _CustomerSignInScreenState();
}

class _CustomerSignInScreenState extends ConsumerState<CustomerSignInScreen> {
  final _emailPhoneController = TextEditingController(text: 'apex@logistics.in');
  final _passwordController = TextEditingController(text: 'Customer@2026');
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  void _handleSignIn() {
    final input = _emailPhoneController.text.trim();
    final pwd = _passwordController.text.trim();

    if (input.isEmpty || pwd.length < 6) {
      setState(() {
        _errorMessage = 'Please enter valid email/phone and password (min 6 chars).';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) {
        ref.read(customerAuthProvider.notifier).signIn(input, pwd);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              Center(
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: CustomerTheme.primaryRed,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: CustomerTheme.primaryRed.withValues(alpha: 0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.business_center, color: Colors.white, size: 32),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Employer & Contractor Portal',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: CustomerTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Hire verified temporary manpower on-demand with guaranteed OTP attendance.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: CustomerTheme.textSecondary),
              ),
              const SizedBox(height: 32),
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(_errorMessage!,
                      style: const TextStyle(color: Colors.red, fontSize: 12)),
                ),
              TextField(
                controller: _emailPhoneController,
                decoration: InputDecoration(
                  labelText: 'Corporate Email or Mobile',
                  prefixIcon: const Icon(Icons.email_outlined, color: CustomerTheme.primaryRed),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline, color: CustomerTheme.primaryRed),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const CustomerForgotPasswordScreen()),
                    );
                  },
                  child: const Text('Forgot Password?',
                      style: TextStyle(color: CustomerTheme.primaryRed, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSignIn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: CustomerTheme.primaryRed,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Sign In as Employer', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Need manpower for your business?', style: TextStyle(color: CustomerTheme.textSecondary)),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CustomerSignUpScreen()),
                      );
                    },
                    child: const Text('Create Account',
                        style: TextStyle(color: CustomerTheme.primaryRed, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CustomerSignUpScreen extends ConsumerStatefulWidget {
  const CustomerSignUpScreen({super.key});

  @override
  ConsumerState<CustomerSignUpScreen> createState() => _CustomerSignUpScreenState();
}

class _CustomerSignUpScreenState extends ConsumerState<CustomerSignUpScreen> {
  final _nameController = TextEditingController();
  final _companyController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _pwdController = TextEditingController();
  String? _error;

  void _handleRegister() {
    final name = _nameController.text.trim();
    final company = _companyController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();
    final pwd = _pwdController.text.trim();

    if (name.isEmpty || phone.isEmpty || email.isEmpty || pwd.length < 6) {
      setState(() => _error = 'Please complete all fields (password min 6 characters).');
      return;
    }

    ref.read(customerAuthProvider.notifier).signUp(name, company, phone, email, pwd);
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Customer account registered successfully.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register Employer Account'),
        leading: const BackButton(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(10)),
                child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
              ),
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Authorized Representative Name')),
            const SizedBox(height: 12),
            TextField(controller: _companyController, decoration: const InputDecoration(labelText: 'Company / Business Name')),
            const SizedBox(height: 12),
            TextField(controller: _phoneController, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Contact Phone Number')),
            const SizedBox(height: 12),
            TextField(controller: _emailController, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Official Corporate Email')),
            const SizedBox(height: 12),
            TextField(controller: _pwdController, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
            const SizedBox(height: 20),
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _handleRegister,
                style: ElevatedButton.styleFrom(backgroundColor: CustomerTheme.primaryRed, foregroundColor: Colors.white),
                child: const Text('Create Account', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CustomerForgotPasswordScreen extends StatefulWidget {
  const CustomerForgotPasswordScreen({super.key});

  @override
  State<CustomerForgotPasswordScreen> createState() => _CustomerForgotPasswordScreenState();
}

class _CustomerForgotPasswordScreenState extends State<CustomerForgotPasswordScreen> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleReset() {
    final input = _controller.text.trim();
    if (input.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email or mobile number.')),
      );
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Recovery code dispatched to registered contact.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reset Password'),
        leading: const BackButton(),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Enter your registered corporate email or phone to receive a recovery challenge.',
                style: TextStyle(color: CustomerTheme.textSecondary)),
            const SizedBox(height: 16),
            TextField(controller: _controller, decoration: const InputDecoration(labelText: 'Email or Mobile Number')),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _handleReset,
              style: ElevatedButton.styleFrom(backgroundColor: CustomerTheme.primaryRed, foregroundColor: Colors.white),
              child: const Text('Request Recovery Code'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 4. MAIN CUSTOMER SHELL (WITH INTELLIGENT BACK NAVIGATION & POPSCOPE)
// ---------------------------------------------------------------------------
class CustomerMainShell extends ConsumerStatefulWidget {
  const CustomerMainShell({super.key});

  @override
  ConsumerState<CustomerMainShell> createState() => _CustomerMainShellState();
}

class _CustomerMainShellState extends ConsumerState<CustomerMainShell> {
  int _selectedIndex = 0;
  DateTime? _lastBackPressTime;

  @override
  Widget build(BuildContext context) {
    ref.listen<String?>(preselectedCategoryProvider, (prev, next) {
      if (next != null) {
        ref.read(customerActiveTabProvider.notifier).state = 2;
        setState(() => _selectedIndex = 2); // switch to Post Job tab
      }
    });

    ref.listen<int>(customerActiveTabProvider, (prev, next) {
      if (_selectedIndex != next) {
        setState(() => _selectedIndex = next);
      }
    });

    final screens = [
      const CustomerHomeTab(),
      const CustomerBookingsTab(),
      const CustomerPostJobTab(),
      const CustomerMessagesTab(),
      const CustomerProfileTab(),
    ];

    // PopScope prevents Android back button from directly closing the application
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_selectedIndex != 0) {
          // If on any tab other than Home, return to Home tab first
          ref.read(customerActiveTabProvider.notifier).state = 0;
          setState(() => _selectedIndex = 0);
        } else {
          // On Home tab, prompt double-tap to confirm exit
          final now = DateTime.now();
          if (_lastBackPressTime == null || now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
            _lastBackPressTime = now;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Press back again to exit ManPowerLink'),
                duration: Duration(seconds: 2),
              ),
            );
          } else {
            SystemNavigator.pop();
          }
        }
      },
      child: Scaffold(
        body: IndexedStack(
          index: _selectedIndex,
          children: screens,
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) {
            ref.read(customerActiveTabProvider.notifier).state = index;
            setState(() {
              _selectedIndex = index;
            });
          },
          backgroundColor: Colors.white,
          indicatorColor: CustomerTheme.primaryYellow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home, color: CustomerTheme.primaryRed),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.calendar_today_outlined),
              selectedIcon: Icon(Icons.calendar_today, color: CustomerTheme.primaryRed),
              label: 'Bookings',
            ),
            NavigationDestination(
              icon: Icon(Icons.add_circle_outline),
              selectedIcon: Icon(Icons.add_circle, color: CustomerTheme.primaryRed),
              label: 'Post Job',
            ),
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline),
              selectedIcon: Icon(Icons.chat_bubble, color: CustomerTheme.primaryRed),
              label: 'Messages',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: CustomerTheme.primaryRed),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 5. TAB 1: CUSTOMER HOME (SEARCH, CATEGORIES & NOTIFICATIONS)
// ---------------------------------------------------------------------------
class CustomerHomeTab extends ConsumerStatefulWidget {
  const CustomerHomeTab({super.key});

  @override
  ConsumerState<CustomerHomeTab> createState() => _CustomerHomeTabState();
}

class _CustomerHomeTabState extends ConsumerState<CustomerHomeTab> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  final List<Map<String, dynamic>> _allCategories = const [
    {'title': 'Loading & Unloading', 'price': '₹2,000 / day', 'icon': Icons.local_shipping},
    {'title': 'Food & Catering Services', 'price': '₹1,800 / day', 'icon': Icons.restaurant},
    {'title': 'Housekeeping & Cleaning', 'price': '₹1,500 / day', 'icon': Icons.cleaning_services},
    {'title': 'Warehouse & Packaging', 'price': '₹2,200 / day', 'icon': Icons.inventory_2},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final notifs = ref.watch(customerNotificationsProvider);
    final unreadCount = notifs.where((n) => !n.isRead).length;

    final filteredCategories = _searchQuery.trim().isEmpty
        ? _allCategories
        : _allCategories
            .where((c) =>
                (c['title'] as String).toLowerCase().contains(_searchQuery.toLowerCase()))
            .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('ManPowerLink', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              backgroundColor: CustomerTheme.primaryYellow,
              textColor: const Color(0xFF202124),
              child: const Icon(Icons.notifications_outlined),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CustomerNotificationsScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Interactive Worksite & Location Banner with Location Picker
            InkWell(
              onTap: () async {
                final activeLoc = ref.read(customerActiveLocationProvider);
                final bookingsState = ref.read(customerBookingsProvider);
                final savedWorksiteLocations = bookingsState.worksites
                    .map((w) => w.toWorksiteLocation())
                    .toList();
                final picked = await LocationPickerSheet.show(
                  context,
                  initialLocation: activeLoc,
                  savedWorksites: savedWorksiteLocations,
                  onSaveNewWorksite: (newWs) {
                    ref.read(customerBookingsProvider.notifier).addWorksite(
                          SavedWorksite(
                            id: newWs.id,
                            name: newWs.name,
                            address: newWs.address,
                            contactPerson: newWs.contactPerson ?? 'Supervisor',
                            contactPhone: newWs.contactPhone ?? '+91 99000 00000',
                            latitude: newWs.latitude,
                            longitude: newWs.longitude,
                            area: newWs.area,
                            landmark: newWs.landmark,
                          ),
                        );
                  },
                );
                if (picked != null) {
                  ref.read(customerActiveLocationProvider.notifier).setLocation(picked);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('📍 Active worksite set to: ${picked.name}'),
                        backgroundColor: CustomerTheme.primaryRed,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  }
                }
              },
              borderRadius: BorderRadius.circular(10),
              child: Builder(builder: (context) {
                final activeLoc = ref.watch(customerActiveLocationProvider);
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: CustomerTheme.primaryYellow.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: CustomerTheme.darkGold.withValues(alpha: 0.35)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: CustomerTheme.primaryRed, size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  activeLoc.isGpsAutoDetected ? 'LIVE GPS PIN' : 'ACTIVE WORKSITE',
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CustomerTheme.darkGold),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: activeLoc.isGpsAutoDetected ? CustomerTheme.primaryRed : CustomerTheme.successGreen,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    activeLoc.isGpsAutoDetected ? 'GPS' : activeLoc.categoryTag.toUpperCase(),
                                    style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${activeLoc.name} · ${activeLoc.area}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              activeLoc.address,
                              style: const TextStyle(fontSize: 11, color: CustomerTheme.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.black12),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.tune, size: 12, color: CustomerTheme.primaryRed),
                            SizedBox(width: 4),
                            Text(
                              'Change',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CustomerTheme.primaryRed),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
            const Text('Hire Verified Manpower',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary)),
            const SizedBox(height: 4),
            const Text('Instant matching with background-checked local labor pool in Mangalore.',
                style: TextStyle(fontSize: 13, color: CustomerTheme.textSecondary)),
            const SizedBox(height: 16),

            // Search Bar with clear button and live filtering
            TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: 'Search service, category or verified workers...',
                prefixIcon: const Icon(Icons.search, color: CustomerTheme.primaryRed),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 20),

            // Category Cards that open Post Job pre-populated
            const Text('Popular Manpower Categories',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary)),
            const SizedBox(height: 4),
            const Text('Tap any category to configure job requirements and broadcast',
                style: TextStyle(fontSize: 12, color: CustomerTheme.textSecondary)),
            const SizedBox(height: 12),

            if (filteredCategories.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.black12),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.search_off, size: 40, color: Colors.grey),
                    const SizedBox(height: 8),
                    Text('No categories matching "$_searchQuery"',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: CustomerTheme.textSecondary)),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                      child: const Text('Show All Categories'),
                    ),
                  ],
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 1.35,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemCount: filteredCategories.length,
                itemBuilder: (context, idx) {
                  final cat = filteredCategories[idx];
                  return _buildCategoryCard(
                    context,
                    cat['title'] as String,
                    cat['price'] as String,
                    cat['icon'] as IconData,
                  );
                },
              ),
            const SizedBox(height: 20),

            // Live Guarantees
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.black12),
              ),
              child: const Column(
                children: [
                  Row(
                    children: [
                      Icon(Icons.shield_outlined, color: CustomerTheme.successGreen),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text('Guaranteed OTP Attendance Verification at start and end of every shift.',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  Divider(height: 18),
                  Row(
                    children: [
                      Icon(Icons.receipt_long_outlined, color: CustomerTheme.primaryRed),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text('100% Transparent Pricing & GST Invoicing for registered businesses.',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCard(
      BuildContext context, String title, String price, IconData icon) {
    return InkWell(
      onTap: () {
        ref.read(preselectedCategoryProvider.notifier).state = title;
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.black12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: CustomerTheme.primaryRed, size: 24),
            const SizedBox(height: 6),
            Text(title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Text(price,
                style: const TextStyle(
                    color: CustomerTheme.successGreen, fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 6. TAB 2: BOOKINGS (INTERACTIVE LIST & DETAILED ORDER SCREEN WITH REMARKS)
// ---------------------------------------------------------------------------
class CustomerBookingsTab extends ConsumerStatefulWidget {
  const CustomerBookingsTab({super.key});

  @override
  ConsumerState<CustomerBookingsTab> createState() => _CustomerBookingsTabState();
}

class _CustomerBookingsTabState extends ConsumerState<CustomerBookingsTab> {
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    final bookingsState = ref.watch(customerBookingsProvider);

    final filtered = bookingsState.bookings.where((b) {
      if (_filter == 'Active') return b.status != 'ORDER_COMPLETED' && b.status != 'CANCELLED';
      if (_filter == 'Completed') return b.status == 'ORDER_COMPLETED';
      if (_filter == 'Cancelled') return b.status == 'CANCELLED';
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('My Bookings')),
      body: Column(
        children: [
          // Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.white,
            child: Row(
              children: ['All', 'Active', 'Completed', 'Cancelled'].map((f) {
                final isSel = _filter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(f, style: TextStyle(color: isSel ? Colors.white : Colors.black, fontSize: 12)),
                    selected: isSel,
                    selectedColor: CustomerTheme.primaryRed,
                    onSelected: (val) => setState(() => _filter = f),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: filtered.isEmpty
                ? const Center(
                    child: Text('No bookings found in this category.',
                        style: TextStyle(color: CustomerTheme.textSecondary)),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, idx) {
                      final b = filtered[idx];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        child: InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => CustomerBookingDetailsScreen(booking: b),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(14),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Order #${b.orderNumber}',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: b.status == 'ORDER_COMPLETED'
                                            ? Colors.green.shade50
                                            : Colors.amber.shade50,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        b.status,
                                        style: TextStyle(
                                          color: b.status == 'ORDER_COMPLETED'
                                              ? CustomerTheme.successGreen
                                              : CustomerTheme.darkRed,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text('${b.category} · ${b.workersNeeded} Workers (${b.durationType})',
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                const SizedBox(height: 4),
                                Text(b.address,
                                    style: const TextStyle(color: CustomerTheme.textSecondary, fontSize: 12)),
                                if (b.remarks != null && b.remarks!.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text('Note: ${b.remarks}',
                                      style: const TextStyle(color: CustomerTheme.textSecondary, fontSize: 11, fontStyle: FontStyle.italic)),
                                ],
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.red.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Start OTP for Workers:',
                                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                      Text(
                                        b.startOtp,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: CustomerTheme.primaryRed,
                                          letterSpacing: 2,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Total: ₹${b.totalEstimatedAmount.toStringAsFixed(0)}',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                            color: CustomerTheme.primaryRed)),
                                    const Row(
                                      children: [
                                        Text('View Details',
                                            style: TextStyle(
                                                color: CustomerTheme.primaryRed,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12)),
                                        Icon(Icons.chevron_right, size: 16, color: CustomerTheme.primaryRed),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class CustomerBookingDetailsScreen extends ConsumerWidget {
  final CustomerBooking booking;

  const CustomerBookingDetailsScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${booking.orderNumber} Details'),
        leading: const BackButton(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Booking Status: ${booking.status}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(6)),
                        child: Text('${booking.workersAccepted} / ${booking.workersNeeded} Assigned',
                            style: const TextStyle(color: CustomerTheme.successGreen, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text('Category: ${booking.category}', style: const TextStyle(fontSize: 13)),
                  Text('Duration Option: ${booking.durationType}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  if (booking.approxTimeToComplete != null)
                    Text('Approx Duration: ${booking.approxTimeToComplete}',
                        style: const TextStyle(fontSize: 13, color: CustomerTheme.darkRed, fontWeight: FontWeight.bold)),
                  Text('Schedule: ${booking.scheduledDate}, ${booking.scheduledTime}', style: const TextStyle(fontSize: 13)),
                  Text('Worksite: ${booking.address}', style: const TextStyle(fontSize: 13)),
                  if (booking.remarks != null && booking.remarks!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
                      child: Text('Remarks / Instructions: ${booking.remarks}',
                          style: const TextStyle(fontSize: 12, color: CustomerTheme.textPrimary, fontWeight: FontWeight.w500)),
                    ),
                  ],
                  if (booking.hasTiffin && booking.tiffinDetails != null) ...[
                    const SizedBox(height: 6),
                    Text('Food/Tiffin: ${booking.tiffinDetails}',
                        style: const TextStyle(fontSize: 12, color: CustomerTheme.darkRed, fontWeight: FontWeight.w600)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // OTP Verification Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Attendance OTP Codes',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF202124))),
                  const SizedBox(height: 6),
                  const Text(
                    'Give Start OTP to workers when they arrive. Give End OTP only after you inspect and sign off on completed work.',
                    style: TextStyle(fontSize: 12, color: CustomerTheme.textSecondary),
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('START OTP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CustomerTheme.textSecondary)),
                          const SizedBox(height: 4),
                          Text(booking.startOtp,
                              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: CustomerTheme.primaryRed, letterSpacing: 2)),
                        ],
                      ),
                      Container(height: 40, width: 1, color: Colors.black26),
                      Column(
                        children: [
                          const Text('END OTP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CustomerTheme.textSecondary)),
                          const SizedBox(height: 4),
                          Text(booking.endOtp,
                              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: CustomerTheme.successGreen, letterSpacing: 2)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Price Breakdown Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                children: [
                  if (booking.hourlyRatePerHead != null)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Hourly Basis (${booking.workersNeeded} Workers × ₹${booking.hourlyRatePerHead!.toStringAsFixed(0)}/hr × ${booking.estimatedHours ?? 1} hrs)',
                            style: const TextStyle(fontSize: 12)),
                        Text('₹${booking.totalEstimatedAmount.toStringAsFixed(0)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    )
                  else if (booking.approxTimeToComplete != null)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Full Package Lump Sum (${booking.workersNeeded} Workers · ${booking.approxTimeToComplete})',
                            style: const TextStyle(fontSize: 12)),
                        Text('₹${booking.totalEstimatedAmount.toStringAsFixed(0)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    )
                  else
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${booking.workersNeeded} Workers × ₹${booking.pricePerWorker.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 13)),
                        Text('₹${booking.totalEstimatedAmount.toStringAsFixed(0)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  const SizedBox(height: 6),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Platform Matching & Safety Guarantee', style: TextStyle(fontSize: 13, color: CustomerTheme.textSecondary)),
                      Text('Included', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: CustomerTheme.successGreen)),
                    ],
                  ),
                  const Divider(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Estimated Amount', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('₹${booking.totalEstimatedAmount.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: CustomerTheme.primaryRed)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (booking.status != 'CANCELLED' && booking.status != 'ORDER_COMPLETED')
              SizedBox(
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Cancel Booking?'),
                        content: const Text(
                            'Are you sure you want to cancel this booking? As work has not commenced, full pre-authorized hold will be released.'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Keep Booking')),
                          ElevatedButton(
                            onPressed: () {
                              ref.read(customerBookingsProvider.notifier).cancelBooking(booking.id);
                              Navigator.pop(ctx);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Booking cancelled successfully.')),
                              );
                            },
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                            child: const Text('Confirm Cancellation'),
                          ),
                        ],
                      ),
                    );
                  },
                  icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                  label: const Text('Cancel Booking', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 7. TAB 3: POST JOB (INTERACTIVE DATE/TIME PICKERS, HOURLY/HEAD & FULL PACKAGE)
// ---------------------------------------------------------------------------
class CustomerPostJobTab extends ConsumerStatefulWidget {
  const CustomerPostJobTab({super.key});

  @override
  ConsumerState<CustomerPostJobTab> createState() => _CustomerPostJobTabState();
}

class _CustomerPostJobTabState extends ConsumerState<CustomerPostJobTab> {
  String _category = 'Loading & Unloading';
  int _workersCount = 4;
  String _duration = 'Full Day (8 Hours)';

  // Job Title & Pricing fields
  final _titleController = TextEditingController(text: 'Loading and moving boxes');
  final _dailyPriceController = TextEditingController(text: '2000');
  final _hourlyPricePerHeadController = TextEditingController(text: '250');
  int _estimatedHours = 5;
  final _packageLumpSumPriceController = TextEditingController(text: '8000');
  final _approxTimeController = TextEditingController(text: 'Approx 5 - 6 Hours');

  // Worksite, Notes & Food (Auto-Detected GPS with Zero Manual Entry)
  final _addressController = TextEditingController();
  final _remarksController = TextEditingController(
      text: 'Requires gloves and safety boots. Heavy boxes.');
  bool _tiffinRequired = true;
  final _tiffinController = TextEditingController(text: 'Morning Breakfast & Afternoon Lunch');

  // GPS & Location Picker State
  bool _isFetchingGps = false;
  double _gpsLat = 12.9621;
  double _gpsLng = 74.8214;
  String _gpsAccuracy = 'Verified Worksite Pin';
  WorksiteLocation? _selectedLocation;

  // Interactive DateTime Pickers
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 16, minute: 0);

  bool _isBroadcasting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final activeLoc = ref.read(customerActiveLocationProvider);
    _selectedLocation = activeLoc;
    _addressController.text = activeLoc.address;
    _gpsLat = activeLoc.latitude;
    _gpsLng = activeLoc.longitude;
    _gpsAccuracy = activeLoc.isGpsAutoDetected ? 'Live GPS Fix' : 'Verified Worksite Pin';
  }

  Future<void> _openLocationPicker() async {
    final bookingsState = ref.read(customerBookingsProvider);
    final savedWorksiteLocations = bookingsState.worksites
        .map((w) => w.toWorksiteLocation())
        .toList();

    final picked = await LocationPickerSheet.show(
      context,
      initialLocation: _selectedLocation,
      savedWorksites: savedWorksiteLocations,
      onSaveNewWorksite: (newWs) {
        ref.read(customerBookingsProvider.notifier).addWorksite(
              SavedWorksite(
                id: newWs.id,
                name: newWs.name,
                address: newWs.address,
                contactPerson: newWs.contactPerson ?? 'Supervisor',
                contactPhone: newWs.contactPhone ?? '+91 99000 00000',
                latitude: newWs.latitude,
                longitude: newWs.longitude,
                area: newWs.area,
                landmark: newWs.landmark,
              ),
            );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedLocation = picked;
        _addressController.text = picked.address;
        _gpsLat = picked.latitude;
        _gpsLng = picked.longitude;
        _gpsAccuracy = picked.isGpsAutoDetected ? 'Live GPS Fix' : 'Verified Worksite Pin';
      });
      ref.read(customerActiveLocationProvider.notifier).setLocation(picked);
    }
  }

  Future<void> _autoDetectGpsLocation() async {
    setState(() => _isFetchingGps = true);
    bool liveFixObtained = false;
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('⚠️ GPS is turned off. Tap SETTINGS to enable or use verified hub.'),
              backgroundColor: Colors.orange.shade800,
              duration: const Duration(seconds: 4),
              action: SnackBarAction(
                label: 'SETTINGS',
                textColor: Colors.white,
                onPressed: () => Geolocator.openLocationSettings(),
              ),
            ),
          );
        }
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('⚠️ Location permissions denied permanently. Please open App Settings.'),
              backgroundColor: CustomerTheme.primaryRed,
              duration: const Duration(seconds: 4),
              action: SnackBarAction(
                label: 'APP SETTINGS',
                textColor: Colors.white,
                onPressed: () => Geolocator.openAppSettings(),
              ),
            ),
          );
        }
      }

      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        // 1. Instant cached fix from fused location provider
        try {
          final lastKnown = await Geolocator.getLastKnownPosition();
          if (lastKnown != null) {
            _gpsLat = lastKnown.latitude;
            _gpsLng = lastKnown.longitude;
            _gpsAccuracy = '±${lastKnown.accuracy.toStringAsFixed(1)}m (Fused Cached Fix)';
            liveFixObtained = true;
          }
        } catch (_) {}

        // 2. Fetch fresh live satellite position with 8s timeout
        try {
          final pos = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high,
            timeLimit: const Duration(seconds: 8),
          );
          _gpsLat = pos.latitude;
          _gpsLng = pos.longitude;
          _gpsAccuracy = '±${pos.accuracy.toStringAsFixed(1)}m (Live GPS Satellites)';
          liveFixObtained = true;
        } catch (_) {
          // If live satellite query times out, retain cached fix if obtained
        }
      }
    } catch (e) {
      debugPrint('GPS auto-detection error: $e');
    }

    if (!liveFixObtained && (_gpsLat == 0.0 || _gpsLat == 12.9621)) {
      // Guaranteed verified industrial freight coordinates (Baikampady Industrial Hub, Mangalore)
      _gpsLat = 12.9612;
      _gpsLng = 74.8145;
      _gpsAccuracy = 'Verified Industrial Hub (Mangalore Baikampady)';
    }

    final latStr = _gpsLat.toStringAsFixed(4);
    final lngStr = _gpsLng.toStringAsFixed(4);
    _addressController.text = 'Live GPS Worksite Pin ($latStr° N, $lngStr° E)';

    final updatedLoc = WorksiteLocation(
      id: 'loc-gps-${DateTime.now().millisecondsSinceEpoch}',
      name: liveFixObtained ? 'Live GPS Location' : 'Mangalore Industrial Zone',
      address: 'Worksite Pin: $latStr° N, $lngStr° E',
      area: 'Industrial Corridor',
      city: 'Mangalore',
      pincode: '575011',
      latitude: _gpsLat,
      longitude: _gpsLng,
      isGpsAutoDetected: true,
    );
    _selectedLocation = updatedLoc;
    ref.read(customerActiveLocationProvider.notifier).setLocation(updatedLoc);

    if (mounted) {
      setState(() => _isFetchingGps = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('📍 GPS Locked: $latStr° N, $lngStr° E ($_gpsAccuracy)'),
          backgroundColor: liveFixObtained ? CustomerTheme.successGreen : Colors.teal.shade700,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  String _formatDate(DateTime dt) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
  }

  double _calculateTotalBudget() {
    if (_duration == 'Hourly Basis') {
      final rate = double.tryParse(_hourlyPricePerHeadController.text) ?? 0.0;
      return _workersCount * rate * _estimatedHours;
    } else if (_duration == 'Full Package (Lump Sum / Project Basis)') {
      return double.tryParse(_packageLumpSumPriceController.text) ?? 0.0;
    } else {
      final daily = double.tryParse(_dailyPriceController.text) ?? 0.0;
      return _workersCount * daily;
    }
  }

  @override
  Widget build(BuildContext context) {
    final preselected = ref.watch(preselectedCategoryProvider);
    if (preselected != null && preselected != _category) {
      _category = preselected;
      Future.microtask(() => ref.read(preselectedCategoryProvider.notifier).state = null);
    }

    final totalEstimate = _calculateTotalBudget();

    return Scaffold(
      appBar: AppBar(title: const Text('Post New Job Order')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('On-Demand Workforce Broadcast',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary)),
            const SizedBox(height: 4),
            const Text('Post requirement, specify headcount, date/time, and pay cash or direct UPI on worksite.',
                style: TextStyle(fontSize: 12, color: CustomerTheme.textSecondary)),
            const SizedBox(height: 16),

            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(10)),
                child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
              ),

            // Select Service Category
            DropdownButtonFormField<String>(
              initialValue: _category,
              decoration: const InputDecoration(labelText: 'Select Service Category', filled: true, fillColor: Colors.white),
              items: const [
                DropdownMenuItem(value: 'Loading & Unloading', child: Text('Loading & Unloading')),
                DropdownMenuItem(value: 'House Cleaning', child: Text('House Cleaning')),
                DropdownMenuItem(value: 'Packing & Moving', child: Text('Packing & Moving')),
                DropdownMenuItem(value: 'Delivery Helper', child: Text('Delivery Helper')),
                DropdownMenuItem(value: 'Construction Support', child: Text('Construction Support')),
                DropdownMenuItem(value: 'Event Staffing', child: Text('Event Staffing')),
                DropdownMenuItem(value: 'Gardening & Lawn', child: Text('Gardening & Lawn')),
                DropdownMenuItem(value: 'Warehouse Stacking', child: Text('Warehouse Stacking')),
                DropdownMenuItem(value: 'Food & Catering Services', child: Text('Food & Catering Services')),
              ],
              onChanged: (val) => setState(() => _category = val ?? _category),
            ),
            const SizedBox(height: 12),

            // Job Requirement Title
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Job Requirement Title *',
                hintText: 'e.g. Loading and moving boxes',
                prefixIcon: Icon(Icons.work_outline, color: CustomerTheme.primaryRed),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            const SizedBox(height: 12),

            // Number of workers
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Number of Workers Required', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: CustomerTheme.primaryRed),
                        onPressed: _workersCount > 1 ? () => setState(() => _workersCount--) : null,
                      ),
                      Text('$_workersCount', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, color: CustomerTheme.primaryRed),
                        onPressed: () => setState(() => _workersCount++),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Duration Type Selector (Full Day, Half Day, Hourly, Full Package)
            DropdownButtonFormField<String>(
              initialValue: _duration,
              decoration: const InputDecoration(labelText: 'Shift Duration / Billing Model', filled: true, fillColor: Colors.white),
              items: const [
                DropdownMenuItem(value: 'Full Day (8 Hours)', child: Text('Full Day (8 Hours)')),
                DropdownMenuItem(value: 'Half Day (4 Hours)', child: Text('Half Day (4 Hours)')),
                DropdownMenuItem(value: 'Hourly Basis', child: Text('Hourly Basis (Rate / Hour / Head)')),
                DropdownMenuItem(
                  value: 'Full Package (Lump Sum / Project Basis)',
                  child: Text('★ Full Package (Lump Sum / Project Basis)'),
                ),
              ],
              onChanged: (val) => setState(() => _duration = val ?? _duration),
            ),
            const SizedBox(height: 12),

            // Conditional Pricing Fields:
            if (_duration == 'Hourly Basis') ...[
              // Hourly rate per head
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Hourly Basis Pricing Details',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.blue)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _hourlyPricePerHeadController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Price per Hour per Head (₹ / hr / worker)',
                        hintText: 'e.g. 250',
                        prefixText: '₹ ',
                        filled: true,
                        fillColor: Colors.white,
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Estimated Working Hours:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline, size: 20),
                              onPressed: _estimatedHours > 1 ? () => setState(() => _estimatedHours--) : null,
                            ),
                            Text('$_estimatedHours hrs', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline, size: 20),
                              onPressed: () => setState(() => _estimatedHours++),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Text(
                      'Rate: ₹${_hourlyPricePerHeadController.text}/hr × $_estimatedHours hrs × $_workersCount workers',
                      style: const TextStyle(fontSize: 11, color: Colors.blue, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ] else if (_duration == 'Full Package (Lump Sum / Project Basis)') ...[
              // Full Package option with approximate time taking
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.amber.shade300),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Full Package / Lump Sum Project Configuration',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: CustomerTheme.darkRed)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _approxTimeController,
                      decoration: const InputDecoration(
                        labelText: 'Approximate Time Taking for Work *',
                        hintText: 'e.g. Approx 5 - 6 Hours, or 1.5 Days',
                        prefixIcon: Icon(Icons.timer_outlined, color: CustomerTheme.darkRed),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _packageLumpSumPriceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Total Lump Sum Fixed Package Price (₹) *',
                        hintText: 'e.g. 8000',
                        prefixText: '₹ ',
                        filled: true,
                        fillColor: Colors.white,
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'This lump sum amount will be divided among assigned workers upon package completion.',
                      style: TextStyle(fontSize: 11, color: CustomerTheme.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ] else ...[
              // Standard Daily / Half Day Wage
              TextField(
                controller: _dailyPriceController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: _duration.contains('Half Day')
                      ? 'Offered Half-Day Wage per Worker (₹)'
                      : 'Offered Daily Wage per Worker (₹)',
                  prefixText: '₹ ',
                  filled: true,
                  fillColor: Colors.white,
                ),
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 12),
            ],

            // Worksite Location Card with Location Picker & GPS Pin
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: CustomerTheme.primaryRed.withValues(alpha: 0.3), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: CustomerTheme.primaryRed.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: CustomerTheme.primaryRed, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            _selectedLocation?.name ?? 'Worksite Location',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: (_selectedLocation?.isGpsAutoDetected == true)
                              ? CustomerTheme.primaryYellow.withValues(alpha: 0.25)
                              : const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: (_selectedLocation?.isGpsAutoDetected == true)
                                ? CustomerTheme.darkGold.withValues(alpha: 0.4)
                                : const Color(0xFF86EFAC),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              (_selectedLocation?.isGpsAutoDetected == true) ? Icons.gps_fixed : Icons.check_circle,
                              size: 12,
                              color: (_selectedLocation?.isGpsAutoDetected == true)
                                  ? CustomerTheme.darkGold
                                  : CustomerTheme.successGreen,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _isFetchingGps
                                  ? 'FETCHING GPS...'
                                  : ((_selectedLocation?.isGpsAutoDetected == true)
                                      ? 'GPS LOCKED'
                                      : (_selectedLocation?.categoryTag.toUpperCase() ?? 'VERIFIED HUB')),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: (_selectedLocation?.isGpsAutoDetected == true)
                                    ? CustomerTheme.darkGold
                                    : CustomerTheme.successGreen,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: CustomerTheme.backgroundColor,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.black12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.map_outlined, size: 14, color: CustomerTheme.primaryRed),
                            const SizedBox(width: 6),
                            Text(
                              'Coordinates: ${_gpsLat.toStringAsFixed(4)}° N, ${_gpsLng.toStringAsFixed(4)}° E',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary),
                            ),
                            const Spacer(),
                            Text(
                              _gpsAccuracy,
                              style: const TextStyle(fontSize: 10, color: CustomerTheme.textSecondary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _addressController.text.isNotEmpty
                              ? _addressController.text
                              : 'Select or enter worksite address...',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: CustomerTheme.textPrimary),
                        ),
                        if (_selectedLocation?.landmark != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Landmark: ${_selectedLocation!.landmark}',
                            style: const TextStyle(fontSize: 11, color: CustomerTheme.primaryRed, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Quick Switch Chips (Baikampady, Panambur, APMC Kottara, Central)
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        const Text('Quick Hubs: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CustomerTheme.textSecondary)),
                        ...WorksiteLocation.presetHubs.take(4).map((hub) {
                          final isCurrent = _selectedLocation?.id == hub.id;
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ActionChip(
                              label: Text(hub.area, style: TextStyle(fontSize: 11, color: isCurrent ? Colors.white : CustomerTheme.textPrimary)),
                              backgroundColor: isCurrent ? CustomerTheme.primaryRed : const Color(0xFFF1F3F5),
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              onPressed: () {
                                setState(() {
                                  _selectedLocation = hub;
                                  _addressController.text = hub.address;
                                  _gpsLat = hub.latitude;
                                  _gpsLng = hub.longitude;
                                  _gpsAccuracy = 'Verified Worksite Pin';
                                });
                                ref.read(customerActiveLocationProvider.notifier).setLocation(hub);
                              },
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Action Buttons: Pick Location & Auto-Detect GPS
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _openLocationPicker,
                          icon: const Icon(Icons.edit_location_alt, size: 16),
                          label: const Text('Pick / Change Location', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: CustomerTheme.primaryRed,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton.icon(
                        onPressed: _isFetchingGps ? null : _autoDetectGpsLocation,
                        icon: _isFetchingGps
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: CustomerTheme.primaryRed),
                              )
                            : const Icon(Icons.my_location, size: 16, color: CustomerTheme.primaryRed),
                        label: Text(
                          _isFetchingGps ? 'Detecting...' : 'Use GPS',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CustomerTheme.primaryRed),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: CustomerTheme.primaryRed),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const SizedBox(height: 12),

            // Instructions / Notes Field (Screenshot matched)
            TextField(
              controller: _remarksController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Instructions / Notes',
                hintText: 'Requires gloves and safety boots. Heavy boxes.',
                prefixIcon: Icon(Icons.note_alt_outlined, color: CustomerTheme.primaryRed),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            const SizedBox(height: 12),

            // Cash / Direct Worker UPI Payment Model Notice
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF86EFAC)),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.payments_outlined, color: CustomerTheme.successGreen, size: 22),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Payment Mode: Cash or Direct Worker UPI',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: CustomerTheme.successGreen)),
                        SizedBox(height: 3),
                        Text(
                          'You pay wages directly to the worker at worksite via Cash or UPI upon shift completion. Admin deducts platform commission from worker\'s prepaid wallet.',
                          style: TextStyle(fontSize: 11, color: CustomerTheme.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Interactive Date & Time Pickers (DateTime Selection Widgets)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Schedule: Date & Shift Timings',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 10),
                  // Date Picker Card
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 90)),
                      );
                      if (picked != null) {
                        setState(() => _selectedDate = picked);
                      }
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: CustomerTheme.backgroundColor,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.black12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.calendar_month, color: CustomerTheme.primaryRed, size: 20),
                              const SizedBox(width: 8),
                              Text('Date: ${_formatDate(_selectedDate)}',
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            ],
                          ),
                          const Text('Change Date', style: TextStyle(color: CustomerTheme.primaryRed, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Time Pickers Row
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () async {
                            final picked = await showTimePicker(
                              context: context,
                              initialTime: _startTime,
                            );
                            if (picked != null) {
                              setState(() => _startTime = picked);
                            }
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            decoration: BoxDecoration(
                              color: CustomerTheme.backgroundColor,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.black12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.access_time, color: Colors.blue, size: 18),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text('Start: ${_startTime.format(context)}',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: InkWell(
                          onTap: () async {
                            final picked = await showTimePicker(
                              context: context,
                              initialTime: _endTime,
                            );
                            if (picked != null) {
                              setState(() => _endTime = picked);
                            }
                          },
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            decoration: BoxDecoration(
                              color: CustomerTheme.backgroundColor,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.black12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.timer_off_outlined, color: Colors.orange, size: 18),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text('End: ${_endTime.format(context)}',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Food / Tiffin requirement
            SwitchListTile(
              value: _tiffinRequired,
              onChanged: (val) => setState(() => _tiffinRequired = val),
              title: const Text('Food & Tiffin Provided by Employer', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              subtitle: const Text('Specify meals provided at worksite', style: TextStyle(fontSize: 11)),
              activeThumbColor: CustomerTheme.primaryRed,
              contentPadding: EdgeInsets.zero,
            ),
            if (_tiffinRequired) ...[
              TextField(
                controller: _tiffinController,
                decoration: const InputDecoration(
                  labelText: 'Meal Specifications (e.g. Breakfast, Lunch, Tea)',
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Total Budget Summary
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.black12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Estimated Budget', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      Text(
                        _duration == 'Hourly Basis'
                            ? '$_workersCount Workers × ₹${_hourlyPricePerHeadController.text}/hr × $_estimatedHours hrs'
                            : (_duration.contains('Full Package')
                                ? 'Full Package Lump Sum ($_workersCount workers)'
                                : '$_workersCount Workers × ₹${_dailyPriceController.text}'),
                        style: const TextStyle(fontSize: 11, color: CustomerTheme.textSecondary),
                      ),
                    ],
                  ),
                  Text('₹${totalEstimate.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: CustomerTheme.primaryRed)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _isBroadcasting ? null : _handleBroadcast,
                style: ElevatedButton.styleFrom(
                  backgroundColor: CustomerTheme.primaryRed,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _isBroadcasting
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Broadcast Job to Verified Workers', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleBroadcast() {
    final String addr = _addressController.text.trim().isNotEmpty
        ? _addressController.text.trim()
        : 'Live GPS Worksite Pin (${_gpsLat.toStringAsFixed(4)}° N, ${_gpsLng.toStringAsFixed(4)}° E)';
    final total = _calculateTotalBudget();

    if (total <= 0) {
      setState(() => _error = 'Please enter valid pricing for the required manpower.');
      return;
    }

    if (_duration == 'Full Package (Lump Sum / Project Basis)' &&
        _approxTimeController.text.trim().isEmpty) {
      setState(() => _error = 'Please enter approximate time taking for Full Package work.');
      return;
    }

    setState(() {
      _isBroadcasting = true;
      _error = null;
    });

    final formattedDate = _formatDate(_selectedDate);
    final formattedTime = '${_startTime.format(context)} - ${_endTime.format(context)}';
    final double pricePerWorker = _duration.contains('Full Package')
        ? (total / _workersCount)
        : (_duration == 'Hourly Basis'
            ? (double.tryParse(_hourlyPricePerHeadController.text) ?? 250.0)
            : (double.tryParse(_dailyPriceController.text) ?? 2000.0));

    final String jobTitle = _titleController.text.trim().isNotEmpty
        ? _titleController.text.trim()
        : '$_category Requirement';

    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      ref.read(customerBookingsProvider.notifier).createBooking(
            title: jobTitle,
            category: _category,
            workersNeeded: _workersCount,
            durationType: _duration,
            address: addr,
            pricePerWorker: pricePerWorker,
            totalEstimatedAmount: total,
            scheduledDate: formattedDate,
            scheduledTime: formattedTime,
            hasTiffin: _tiffinRequired,
            tiffinDetails: _tiffinRequired ? _tiffinController.text.trim() : null,
            remarks: _remarksController.text.trim(),
            approxTimeToComplete: _duration.contains('Full Package') ? _approxTimeController.text.trim() : null,
            hourlyRatePerHead: _duration == 'Hourly Basis' ? double.tryParse(_hourlyPricePerHeadController.text) : null,
            estimatedHours: _duration == 'Hourly Basis' ? _estimatedHours : null,
            latitude: _gpsLat,
            longitude: _gpsLng,
            isGpsAutoDetected: true,
          );

      // Trigger notification in Notification Feed and instant floating banner
      FCMService().triggerInAppNotification(
        title: 'Order Broadcast Dispatched ($jobTitle)',
        body: 'Searching $_workersCount verified workers for $_category. Live GPS pin shared with nearby employees.',
        type: 'ORDER',
      );

      setState(() => _isBroadcasting = false);

      // Switch to My Bookings tab automatically so employer can immediately track the new order
      ref.read(customerActiveTabProvider.notifier).state = 1;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Job broadcast dispatched! Workers are now receiving notifications.'),
          backgroundColor: CustomerTheme.successGreen,
        ),
      );
    });
  }
}

// ---------------------------------------------------------------------------
// 8. TAB 4: MESSAGES (INTERACTIVE WORKER CONVERSATIONS)
// ---------------------------------------------------------------------------
class CustomerMessagesTab extends StatefulWidget {
  const CustomerMessagesTab({super.key});

  @override
  State<CustomerMessagesTab> createState() => _CustomerMessagesTabState();
}

class _CustomerMessagesTabState extends State<CustomerMessagesTab> {
  final List<Map<String, dynamic>> _messages = [
    {
      'from': 'Ramesh Kumar (Worker)',
      'text': 'Sir, I have arrived at Gate 4 with my safety gear. Where should I report?',
      'time': '07:45 AM',
      'isMe': false,
    },
    {
      'from': 'Me',
      'text': 'Please report directly to Supervisor Ganesh at Container Dock 4.',
      'time': '07:48 AM',
      'isMe': true,
    },
  ];

  final _textController = TextEditingController();

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final txt = _textController.text.trim();
    if (txt.isEmpty) return;
    setState(() {
      _messages.add({
        'from': 'Me',
        'text': txt,
        'time': 'Just now',
        'isMe': true,
      });
      _textController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Worker Communications')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final m = _messages[idx];
                final isMe = m['isMe'] as bool;

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isMe ? CustomerTheme.primaryRed : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(m['text'] as String,
                            style: TextStyle(color: isMe ? Colors.white : CustomerTheme.textPrimary, fontSize: 13)),
                        const SizedBox(height: 4),
                        Text(m['time'] as String,
                            style: TextStyle(color: isMe ? Colors.white70 : Colors.grey, fontSize: 10)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.black12)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: const InputDecoration(
                      hintText: 'Type message to assigned workers...',
                      border: InputBorder.none,
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: CustomerTheme.primaryRed),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 9. TAB 5: PROFILE & ALL SUBPAGES (WORKSITES, PAYMENTS, SUPPORT, TERMS)
// ---------------------------------------------------------------------------
class CustomerProfileTab extends ConsumerWidget {
  const CustomerProfileTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(customerAuthProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Customer Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: CustomerTheme.primaryRed,
                child: Icon(Icons.business, color: Colors.white),
              ),
              title: Text(authState.companyName ?? 'Apex Logistics', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('${authState.userName ?? 'Karthik Rao'} · ${authState.userPhone ?? '+91 99001 55432'}'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.location_on_outlined, color: CustomerTheme.primaryRed),
              title: const Text('Saved Worksites'),
              subtitle: const Text('Manage warehouses and construction sites'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CustomerWorksitesScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.receipt_long_outlined),
              title: const Text('GST Invoicing & Payment History'),
              subtitle: const Text('Corporate tax receipts and invoices'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CustomerPaymentsScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.support_agent_outlined),
              title: const Text('Enterprise Customer Support'),
              subtitle: const Text('24x7 Help desk & ticket support'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CustomerSupportScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.description_outlined),
              title: const Text('Employer Terms & Cancellation Policy'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CustomerLegalScreen()),
                );
              },
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Confirm Sign Out'),
                      content: const Text('Are you sure you want to log out of your employer session?'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            ref.read(customerAuthProvider.notifier).signOut();
                          },
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                          child: const Text('Sign Out'),
                        ),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text('Sign Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 10. SUBPAGE: SAVED WORKSITES
// ---------------------------------------------------------------------------
class CustomerWorksitesScreen extends ConsumerWidget {
  const CustomerWorksitesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsState = ref.watch(customerBookingsProvider);
    final activeLocation = ref.watch(customerActiveLocationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Worksites'),
        leading: const BackButton(),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_location_alt_outlined),
            tooltip: 'Add Worksite',
            onPressed: () => _openWorksitePicker(context, ref, bookingsState),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: CustomerTheme.primaryRed,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_location_alt),
        label: const Text('Add New Worksite'),
        onPressed: () => _openWorksitePicker(context, ref, bookingsState),
      ),
      body: bookingsState.worksites.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.warehouse_outlined, size: 48, color: Colors.black26),
                  const SizedBox(height: 12),
                  const Text('No Saved Worksites', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 6),
                  const Text('Add warehouses or sites for 1-tap manpower booking without GPS.',
                      style: TextStyle(color: CustomerTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => _openWorksitePicker(context, ref, bookingsState),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Worksite Now'),
                    style: ElevatedButton.styleFrom(backgroundColor: CustomerTheme.primaryRed, foregroundColor: Colors.white),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
              itemCount: bookingsState.worksites.length,
              itemBuilder: (context, idx) {
                final ws = bookingsState.worksites[idx];
                final isCurrent = activeLocation.name == ws.name || activeLocation.address == ws.address;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: isCurrent ? CustomerTheme.primaryRed : Colors.black12,
                      width: isCurrent ? 1.5 : 1.0,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(12),
                    leading: CircleAvatar(
                      backgroundColor: isCurrent ? CustomerTheme.primaryRed : const Color(0xFFF1F3F5),
                      foregroundColor: isCurrent ? Colors.white : CustomerTheme.primaryRed,
                      child: const Icon(Icons.warehouse),
                    ),
                    title: Row(
                      children: [
                        Expanded(
                          child: Text(ws.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        ),
                        if (isCurrent)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: CustomerTheme.successGreen,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('ACTIVE', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(ws.address, style: const TextStyle(fontSize: 12)),
                        const SizedBox(height: 3),
                        Text(
                          'Supervisor: ${ws.contactPerson} (${ws.contactPhone})',
                          style: const TextStyle(fontSize: 11, color: CustomerTheme.primaryRed, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    trailing: PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert, size: 20),
                      onSelected: (val) {
                        if (val == 'select') {
                          ref.read(customerActiveLocationProvider.notifier).setLocation(ws.toWorksiteLocation());
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Active worksite set to ${ws.name}')),
                          );
                        } else if (val == 'delete') {
                          ref.read(customerBookingsProvider.notifier).removeWorksite(ws.id);
                        }
                      },
                      itemBuilder: (_) => [
                        const PopupMenuItem(value: 'select', child: Text('Set as Active Worksite')),
                        const PopupMenuItem(value: 'delete', child: Text('Delete Worksite', style: TextStyle(color: Colors.red))),
                      ],
                    ),
                    onTap: () {
                      ref.read(customerActiveLocationProvider.notifier).setLocation(ws.toWorksiteLocation());
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('📍 Active worksite set to ${ws.name}'), backgroundColor: CustomerTheme.primaryRed),
                      );
                    },
                  ),
                );
              },
            ),
    );
  }

  void _openWorksitePicker(BuildContext context, WidgetRef ref, CustomerBookingsState bookingsState) async {
    final picked = await LocationPickerSheet.show(
      context,
      savedWorksites: bookingsState.worksites.map((w) => w.toWorksiteLocation()).toList(),
      onSaveNewWorksite: (newWs) {
        ref.read(customerBookingsProvider.notifier).addWorksite(
              SavedWorksite(
                id: newWs.id,
                name: newWs.name,
                address: newWs.address,
                contactPerson: newWs.contactPerson ?? 'Supervisor',
                contactPhone: newWs.contactPhone ?? '+91 99000 00000',
                latitude: newWs.latitude,
                longitude: newWs.longitude,
                area: newWs.area,
                landmark: newWs.landmark,
              ),
            );
      },
    );

    if (picked != null) {
      if (!bookingsState.worksites.any((w) => w.name == picked.name)) {
        ref.read(customerBookingsProvider.notifier).addWorksite(
              SavedWorksite(
                id: picked.id,
                name: picked.name,
                address: picked.address,
                contactPerson: picked.contactPerson ?? 'Supervisor',
                contactPhone: picked.contactPhone ?? '+91 99000 00000',
                latitude: picked.latitude,
                longitude: picked.longitude,
                area: picked.area,
                landmark: picked.landmark,
              ),
            );
      }
      ref.read(customerActiveLocationProvider.notifier).setLocation(picked);
    }
  }
}

// ---------------------------------------------------------------------------
// 11. SUBPAGE: GST INVOICING & PAYMENT HISTORY
// ---------------------------------------------------------------------------
class CustomerPaymentsScreen extends StatelessWidget {
  const CustomerPaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GST Invoicing & Payments'),
        leading: const BackButton(),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.black12)),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Corporate GSTIN Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  SizedBox(height: 4),
                  Text('GSTIN: 29AAACA1234B1Z5', style: TextStyle(fontSize: 13, color: CustomerTheme.textSecondary)),
                  Text('Company: Apex Logistics & Warehousing Pvt Ltd', style: TextStyle(fontSize: 13, color: CustomerTheme.textSecondary)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text('Recent Invoices', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 10),
            Expanded(
              child: ListView(
                children: [
                  Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    child: ListTile(
                      leading: const Icon(Icons.picture_as_pdf, color: Colors.red),
                      title: const Text('Invoice #INV-2026-1041', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: const Text('13 Oct 2026 · ₹8,000 + GST'),
                      trailing: IconButton(
                        icon: const Icon(Icons.download, color: CustomerTheme.primaryRed),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Downloading tax invoice PDF...')),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 12. SUBPAGE: ENTERPRISE CUSTOMER SUPPORT
// ---------------------------------------------------------------------------
class CustomerSupportScreen extends StatelessWidget {
  const CustomerSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Enterprise Support'),
        leading: const BackButton(),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(12)),
              child: const Column(
                children: [
                  Icon(Icons.headset_mic, color: Colors.blue, size: 40),
                  SizedBox(height: 8),
                  Text('Dedicated Key Account Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  SizedBox(height: 4),
                  Text('Direct phone and email assistance for active shift escalations in Mangalore.',
                      textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: CustomerTheme.textSecondary)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Calling Enterprise Support Desk: +91 80000 54321')),
                );
              },
              icon: const Icon(Icons.phone),
              label: const Text('Call Key Account Manager (+91 80000 54321)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: CustomerTheme.primaryRed,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 13. SUBPAGE: NOTIFICATIONS
// ---------------------------------------------------------------------------
class CustomerNotificationsScreen extends ConsumerWidget {
  const CustomerNotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifs = ref.watch(customerNotificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shift Notifications'),
        leading: const BackButton(),
        actions: [
          IconButton(
            tooltip: 'FCM Token & Test',
            icon: const Icon(Icons.key_outlined, size: 20),
            onPressed: () {
              final token = FCMService().fcmToken ?? 'Initializing or simulated on Web/Desktop';
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Row(
                    children: [
                      Icon(Icons.notifications_active, color: CustomerTheme.primaryRed),
                      SizedBox(width: 8),
                      Text('FCM Push Token', style: TextStyle(fontSize: 16)),
                    ],
                  ),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Device Registration Token for Firebase Cloud Messaging (FCM):',
                        style: TextStyle(fontSize: 12, color: CustomerTheme.textSecondary),
                      ),
                      const SizedBox(height: 10),
                      SelectableText(
                        token,
                        style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.blue),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: token));
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('FCM Token copied to clipboard!')),
                              );
                            },
                            icon: const Icon(Icons.copy, size: 16),
                            label: const Text('Copy Token'),
                          ),
                        ],
                      ),
                    ],
                  ),
                  actions: [
                    TextButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        FCMService().triggerInAppNotification(
                          title: '🔔 Test Push Notification',
                          body: 'Worker Ramesh Kumar (Loading & Unloading) has arrived at Dock 4 via GPS.',
                          type: 'ARRIVAL',
                        );
                      },
                      icon: const Icon(Icons.send_rounded, size: 16),
                      label: const Text('Simulate Push Alert'),
                    ),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: ElevatedButton.styleFrom(backgroundColor: CustomerTheme.primaryRed, foregroundColor: Colors.white),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              );
            },
          ),
          if (notifs.isNotEmpty) ...[
            TextButton(
              onPressed: () {
                ref.read(customerNotificationsProvider.notifier).markAllAsRead();
              },
              child: const Text('Mark Read', style: TextStyle(color: Colors.white, fontSize: 12)),
            ),
            IconButton(
              tooltip: 'Clear All',
              icon: const Icon(Icons.delete_sweep_outlined, size: 20),
              onPressed: () {
                ref.read(customerNotificationsProvider.notifier).clearAll();
              },
            ),
          ],
        ],
      ),
      body: notifs.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No notifications yet',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CustomerTheme.textSecondary)),
                  const SizedBox(height: 6),
                  const Text('Shift alerts and worker arrival updates will appear here.',
                      style: TextStyle(fontSize: 13, color: CustomerTheme.textSecondary)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: notifs.length,
              itemBuilder: (context, idx) {
                final n = notifs[idx];
                IconData icon;
                Color iconColor;
                switch (n.type) {
                  case 'ARRIVAL':
                    icon = Icons.pin_drop;
                    iconColor = CustomerTheme.primaryRed;
                    break;
                  case 'START_OTP':
                    icon = Icons.lock_clock;
                    iconColor = CustomerTheme.darkGold;
                    break;
                  case 'END_OTP':
                    icon = Icons.verified;
                    iconColor = CustomerTheme.successGreen;
                    break;
                  case 'PAYMENT':
                    icon = Icons.account_balance_wallet;
                    iconColor = CustomerTheme.successGreen;
                    break;
                  default:
                    icon = Icons.work_outline;
                    iconColor = CustomerTheme.primaryRed;
                }

                final diff = DateTime.now().difference(n.timestamp);
                String timeAgo;
                if (diff.inMinutes < 60) {
                  timeAgo = '${diff.inMinutes}m ago';
                } else if (diff.inHours < 24) {
                  timeAgo = '${diff.inHours}h ago';
                } else {
                  timeAgo = '${diff.inDays}d ago';
                }

                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  elevation: n.isRead ? 0 : 2,
                  color: n.isRead ? Colors.white : Colors.red.shade50.withValues(alpha: 0.3),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: n.isRead ? Colors.black12 : CustomerTheme.primaryRed.withValues(alpha: 0.4),
                      width: n.isRead ? 0.5 : 1,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    leading: CircleAvatar(
                      backgroundColor: iconColor.withValues(alpha: 0.15),
                      child: Icon(icon, color: iconColor, size: 20),
                    ),
                    title: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            n.title,
                            style: TextStyle(
                              fontWeight: n.isRead ? FontWeight.w600 : FontWeight.bold,
                              fontSize: 13,
                              color: CustomerTheme.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          timeAgo,
                          style: const TextStyle(fontSize: 11, color: CustomerTheme.textSecondary),
                        ),
                      ],
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        n.body,
                        style: const TextStyle(fontSize: 12, color: CustomerTheme.textSecondary),
                      ),
                    ),
                    trailing: !n.isRead
                        ? Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: CustomerTheme.primaryRed,
                            ),
                          )
                        : null,
                    onTap: () {
                      ref.read(customerNotificationsProvider.notifier).markAsRead(n.id);
                    },
                  ),
                );
              },
            ),
    );
  }
}

// ---------------------------------------------------------------------------
// 14. SUBPAGE: LEGAL & CANCELLATION POLICY
// ---------------------------------------------------------------------------
class CustomerLegalScreen extends StatelessWidget {
  const CustomerLegalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Employer Terms & Policies'),
        leading: const BackButton(),
      ),
      body: const SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Text(
          '''
1. CONTRACTOR SERVICE AGREEMENT
By broadcasting a booking on ManPowerLink, employers agree to provide safe industrial working conditions, mandatory safety supervision, and any promised amenities including drinking water and tiffin meals.

2. OTP ATTENDANCE VALIDATION
Attendance is verified in real-time. Employers must share the Start OTP only upon the worker's physical arrival at the worksite. End OTP must be validated upon completion of the shift.

3. CANCELLATION & DISPUTE POLICY
Bookings cancelled prior to worker dispatch incur zero penalty. If cancelled after workers have travelled to the worksite, a standard reporting transit allowance is debited to compensate workers.
          ''',
          style: TextStyle(fontSize: 13, height: 1.6, color: CustomerTheme.textPrimary),
        ),
      ),
    );
  }
}
