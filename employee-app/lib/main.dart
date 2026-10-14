import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(const ProviderScope(child: ManPowerLinkWorkerApp()));
}

// Brand Colors
class WorkerTheme {
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

// Worker Auth State
final workerAuthProvider = StateNotifierProvider<WorkerAuthNotifier, WorkerAuthState>((ref) {
  return WorkerAuthNotifier();
});

class WorkerAuthState {
  final bool isAuthenticated;
  final String? workerName;
  final String? workerPhone;
  final String? category;
  final double rating;
  final bool isVerified;
  final double walletBalance;

  const WorkerAuthState({
    this.isAuthenticated = false,
    this.workerName,
    this.workerPhone,
    this.category,
    this.rating = 4.9,
    this.isVerified = true,
    this.walletBalance = 4200.0,
  });

  WorkerAuthState copyWith({
    bool? isAuthenticated,
    String? workerName,
    String? workerPhone,
    String? category,
    double? rating,
    bool? isVerified,
    double? walletBalance,
  }) {
    return WorkerAuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      workerName: workerName ?? this.workerName,
      workerPhone: workerPhone ?? this.workerPhone,
      category: category ?? this.category,
      rating: rating ?? this.rating,
      isVerified: isVerified ?? this.isVerified,
      walletBalance: walletBalance ?? this.walletBalance,
    );
  }
}

class WorkerAuthNotifier extends StateNotifier<WorkerAuthState> {
  WorkerAuthNotifier() : super(const WorkerAuthState());

  void signIn(String phone, String password) {
    state = state.copyWith(
      isAuthenticated: true,
      workerName: 'Ramesh Kumar',
      workerPhone: phone.isNotEmpty ? phone : '+91 98765 43210',
      category: 'Loading & Unloading',
      rating: 4.9,
      isVerified: true,
      walletBalance: 4200.0,
    );
  }

  void signUp(String name, String phone, String category, String password) {
    state = state.copyWith(
      isAuthenticated: true,
      workerName: name,
      workerPhone: phone,
      category: category,
      rating: 5.0,
      isVerified: false,
      walletBalance: 0.0,
    );
  }

  void signOut() {
    state = const WorkerAuthState(isAuthenticated: false);
  }
}

class ManPowerLinkWorkerApp extends ConsumerWidget {
  const ManPowerLinkWorkerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(workerAuthProvider);

    return MaterialApp(
      title: 'ManPowerLink Worker',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: WorkerTheme.backgroundColor,
        colorScheme: const ColorScheme.light(
          primary: WorkerTheme.primaryRed,
          secondary: WorkerTheme.primaryYellow,
          surface: WorkerTheme.cardColor,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E1F23),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: authState.isAuthenticated
          ? const WorkerMainShell()
          : const WorkerSignInScreen(),
    );
  }
}

// ---------------------------------------------------------------------------
// 1. WORKER AUTHENTICATION SCREENS (Sign In, Sign Up, Forgot Password)
// ---------------------------------------------------------------------------

class WorkerSignInScreen extends ConsumerStatefulWidget {
  const WorkerSignInScreen({super.key});

  @override
  ConsumerState<WorkerSignInScreen> createState() => _WorkerSignInScreenState();
}

class _WorkerSignInScreenState extends ConsumerState<WorkerSignInScreen> {
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _passwordController = TextEditingController(text: 'Worker@2026');
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  void _handleSignIn() {
    final phone = _phoneController.text.trim();
    final pwd = _passwordController.text.trim();

    if (phone.isEmpty || pwd.length < 6) {
      setState(() {
        _errorMessage = 'Please enter valid phone number and password (min 6 chars).';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        ref.read(workerAuthProvider.notifier).signIn(phone, pwd);
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
              const SizedBox(height: 20),
              Center(
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: WorkerTheme.primaryYellow,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'W',
                      style: TextStyle(color: Color(0xFF202124), fontSize: 28, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Welcome Back',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: WorkerTheme.textPrimary),
              ),
              const SizedBox(height: 6),
              const Text(
                'Find work opportunities and manage your jobs',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: WorkerTheme.textSecondary),
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
                  child: Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                ),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Registered Mobile Number',
                  prefixIcon: const Icon(Icons.phone_android, color: WorkerTheme.primaryRed),
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
                  prefixIcon: const Icon(Icons.lock_outline, color: WorkerTheme.primaryRed),
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
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const WorkerForgotPasswordScreen()));
                  },
                  child: const Text('Forgot Password?', style: TextStyle(color: WorkerTheme.primaryRed, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSignIn,
                style: ElevatedButton.styleFrom(
                  backgroundColor: WorkerTheme.primaryRed,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Sign In as Worker', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('New worker?', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 13)),
                  TextButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const WorkerSignUpScreen()));
                    },
                    child: const Text('Create an account', style: TextStyle(color: WorkerTheme.primaryRed, fontWeight: FontWeight.bold, fontSize: 13)),
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

class WorkerSignUpScreen extends ConsumerStatefulWidget {
  const WorkerSignUpScreen({super.key});

  @override
  ConsumerState<WorkerSignUpScreen> createState() => _WorkerSignUpScreenState();
}

class _WorkerSignUpScreenState extends ConsumerState<WorkerSignUpScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _selectedCategory = 'Loading & Unloading';
  bool _termsAccepted = false;
  String? _errorMessage;

  void _handleRegister() {
    if (!_termsAccepted) {
      setState(() => _errorMessage = 'Please accept Worker Terms & Conditions.');
      return;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'Passwords do not match.');
      return;
    }
    ref.read(workerAuthProvider.notifier).signUp(
          _nameController.text.trim(),
          _phoneController.text.trim(),
          _selectedCategory,
          _passwordController.text.trim(),
        );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Worker Account')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                child: Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 12)),
              ),
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name (As on Aadhaar)')),
            const SizedBox(height: 12),
            TextField(controller: _phoneController, decoration: const InputDecoration(labelText: 'Mobile Number (+91)')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(labelText: 'Primary Work Skill'),
              items: const [
                DropdownMenuItem(value: 'Loading & Unloading', child: Text('Loading & Unloading')),
                DropdownMenuItem(value: 'Food & Catering Services', child: Text('Food & Catering Services')),
                DropdownMenuItem(value: 'Housekeeping & Cleaning', child: Text('Housekeeping & Cleaning')),
                DropdownMenuItem(value: 'Warehouse & Packaging', child: Text('Warehouse & Packaging')),
              ],
              onChanged: (val) => setState(() => _selectedCategory = val ?? _selectedCategory),
            ),
            const SizedBox(height: 12),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
            const SizedBox(height: 12),
            TextField(controller: _confirmPasswordController, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm Password')),
            const SizedBox(height: 12),
            CheckboxListTile(
              value: _termsAccepted,
              onChanged: (val) => setState(() => _termsAccepted = val ?? false),
              title: const Text('I agree to Worker Guidelines, Payout Terms, and Safety Protocols', style: TextStyle(fontSize: 12)),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _handleRegister,
                style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
                child: const Text('Create Worker Account'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class WorkerForgotPasswordScreen extends StatelessWidget {
  const WorkerForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = TextEditingController();
    return Scaffold(
      appBar: AppBar(title: const Text('Worker Password Recovery')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Enter your registered mobile number to receive a 4-digit SMS OTP challenge.', style: TextStyle(color: WorkerTheme.textSecondary)),
            const SizedBox(height: 16),
            TextField(controller: controller, decoration: const InputDecoration(labelText: 'Mobile Number')),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('SMS OTP sent to mobile.')));
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
              child: const Text('Send SMS Challenge'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// 2. MAIN AUTHENTICATED SHELL WITH FIXED 5-DESTINATION BOTTOM NAVIGATION
// ---------------------------------------------------------------------------

class WorkerMainShell extends StatefulWidget {
  const WorkerMainShell({super.key});

  @override
  State<WorkerMainShell> createState() => _WorkerMainShellState();
}

class _WorkerMainShellState extends State<WorkerMainShell> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    WorkerHomeTab(),
    WorkerFindJobsTab(),
    WorkerMyWorkTab(),
    WorkerMessagesTab(),
    WorkerProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        backgroundColor: Colors.white,
        indicatorColor: WorkerTheme.primaryYellow,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: WorkerTheme.primaryRed),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.search),
            selectedIcon: Icon(Icons.search, color: WorkerTheme.primaryRed),
            label: 'Find Jobs',
          ),
          NavigationDestination(
            icon: Icon(Icons.work_outline),
            selectedIcon: Icon(Icons.work, color: WorkerTheme.primaryRed),
            label: 'My Work',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble, color: WorkerTheme.primaryRed),
            label: 'Messages',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: WorkerTheme.primaryRed),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

// Tab 1: Home
class WorkerHomeTab extends StatefulWidget {
  const WorkerHomeTab({super.key});

  @override
  State<WorkerHomeTab> createState() => _WorkerHomeTabState();
}

class _WorkerHomeTabState extends State<WorkerHomeTab> {
  bool _isOnline = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: FilterChip(
              label: Text(_isOnline ? 'ONLINE' : 'OFFLINE', style: TextStyle(color: _isOnline ? Colors.white : Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
              selected: _isOnline,
              selectedColor: Colors.green,
              onSelected: (val) => setState(() => _isOnline = val),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Earnings Widget
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [WorkerTheme.primaryRed, WorkerTheme.darkRed]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Available Wallet Balance', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  SizedBox(height: 6),
                  Text('₹4,200', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                  SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('8 shifts completed this week', style: TextStyle(color: Colors.white70, fontSize: 11)),
                      Text('Instant UPI Payout →', style: TextStyle(color: WorkerTheme.primaryYellow, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text("Today's Assigned Shift", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: const Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text('Order #1045', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('₹2,000 / Day', style: TextStyle(color: WorkerTheme.primaryRed, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    SizedBox(height: 6),
                    Text('Panambur Container Terminal Dock 4', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                    SizedBox(height: 8),
                    Text('Start Shift: Enter Start OTP upon arrival', style: TextStyle(color: WorkerTheme.successGreen, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Tab 2: Find Jobs
class WorkerFindJobsTab extends StatelessWidget {
  const WorkerFindJobsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Available Job Radar')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Text('Loading & Unloading', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('₹2,000 / worker', style: TextStyle(color: WorkerTheme.primaryRed, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text('2.4 km away · Panambur Industrial Area', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Job accepted! Moving to My Work.')));
                          },
                          style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
                          child: const Text('Accept Shift'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {},
                          child: const Text('Counter-Bid'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Tab 3: My Work
class WorkerMyWorkTab extends StatefulWidget {
  const WorkerMyWorkTab({super.key});

  @override
  State<WorkerMyWorkTab> createState() => _WorkerMyWorkTabState();
}

class _WorkerMyWorkTabState extends State<WorkerMyWorkTab> {
  final _otpController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Work & Attendance')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Active Shift: Order #1045', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 6),
                  const Text('Container Unloading at Panambur Dock 4', style: TextStyle(color: WorkerTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 16),
                  const Text('Step 1: Verify Start OTP from Employer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _otpController,
                          maxLength: 4,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: 'e.g. 5918', counterText: ''),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Start OTP Verified! Shift timer running.')));
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: WorkerTheme.primaryRed, foregroundColor: Colors.white),
                        child: const Text('Verify'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Tab 4: Messages
class WorkerMessagesTab extends StatelessWidget {
  const WorkerMessagesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Employer Messages')),
      body: ListView(
        children: const [
          ListTile(
            leading: CircleAvatar(backgroundColor: WorkerTheme.primaryYellow, child: Text('AL', style: TextStyle(color: Colors.black))),
            title: Text('Apex Logistics (Employer)', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Please report at Gate 4 with safety gear.', maxLines: 1),
            trailing: Text('09:12 AM', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ),
        ],
      ),
    );
  }
}

// Tab 5: Profile
class WorkerProfileTab extends ConsumerWidget {
  const WorkerProfileTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(workerAuthProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Worker Profile')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ListTile(
              leading: const CircleAvatar(backgroundColor: WorkerTheme.primaryRed, child: Text('RK', style: TextStyle(color: Colors.white))),
              title: Text(authState.workerName ?? 'Ramesh Kumar', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('${authState.category ?? 'Loading & Unloading'} · 4.9 ★'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.verified, color: WorkerTheme.successGreen),
              title: const Text('KYC Aadhaar Verification'),
              subtitle: const Text('Approved'),
              trailing: const Icon(Icons.check_circle, color: WorkerTheme.successGreen),
            ),
            ListTile(
              leading: const Icon(Icons.account_balance_wallet_outlined),
              title: const Text('Payout UPI Account'),
              subtitle: const Text('ramesh@okhdfcbank'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.emergency_outlined, color: Colors.red),
              title: const Text('Emergency Safety Hotline'),
              subtitle: const Text('112 / +91 80000 12345'),
              onTap: () {},
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  ref.read(workerAuthProvider.notifier).signOut();
                },
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text('Sign Out', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red)),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
