import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(const ProviderScope(child: ManPowerLinkCustomerApp()));
}

// Brand Colors
class CustomerTheme {
  static const Color primaryRed = Color(0xFFD71920);
  static const Color darkRed = Color(0xFFA80F18);
  static const Color primaryYellow = Color(0xFFFFC928);
  static const Color backgroundColor = Color(0xFFFFFDF8);
  static const Color cardColor = Colors.white;
  static const Color textPrimary = Color(0xFF202124);
  static const Color textSecondary = Color(0xFF686868);
  static const Color successGreen = Color(0xFF16834A);
}

// Auth State Provider
final customerAuthProvider = StateNotifierProvider<CustomerAuthNotifier, CustomerAuthState>((ref) {
  return CustomerAuthNotifier();
});

class CustomerAuthState {
  final bool isAuthenticated;
  final String? userName;
  final String? userPhone;
  final String? userEmail;

  const CustomerAuthState({
    this.isAuthenticated = false,
    this.userName,
    this.userPhone,
    this.userEmail,
  });

  CustomerAuthState copyWith({
    bool? isAuthenticated,
    String? userName,
    String? userPhone,
    String? userEmail,
  }) {
    return CustomerAuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userName: userName ?? this.userName,
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
      userName: 'Apex Logistics & Warehousing',
      userPhone: '+91 99001 55432',
      userEmail: phoneOrEmail.contains('@') ? phoneOrEmail : 'contact@apexlogistics.in',
    );
  }

  void signUp(String name, String phone, String email, String password) {
    state = state.copyWith(
      isAuthenticated: true,
      userName: name,
      userPhone: phone,
      userEmail: email,
    );
  }

  void signOut() {
    state = const CustomerAuthState(isAuthenticated: false);
  }
}

class ManPowerLinkCustomerApp extends ConsumerWidget {
  const ManPowerLinkCustomerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(customerAuthProvider);

    return MaterialApp(
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
// 1. AUTHENTICATION SCREENS (Sign In, Sign Up, Forgot Password)
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

    Future.delayed(const Duration(milliseconds: 600), () {
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
              const SizedBox(height: 20),
              Center(
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: CustomerTheme.primaryRed,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: CustomerTheme.primaryRed.withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'M',
                      style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Welcome to ManPowerLink',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary),
              ),
              const SizedBox(height: 6),
              const Text(
                'Find reliable workers for your next job',
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
                  child: Text(_errorMessage!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                ),
              TextField(
                controller: _emailPhoneController,
                decoration: InputDecoration(
                  labelText: 'Email or Mobile Number',
                  prefixIcon: const Icon(Icons.person_outline, color: CustomerTheme.primaryRed),
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
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const CustomerForgotPasswordScreen()));
                  },
                  child: const Text('Forgot Password?', style: TextStyle(color: CustomerTheme.primaryRed, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSignIn,
                style: ElevatedButton.styleFrom(
                  backgroundColor: CustomerTheme.primaryRed,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Sign In', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account?", style: TextStyle(color: CustomerTheme.textSecondary, fontSize: 13)),
                  TextButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const CustomerSignUpScreen()));
                    },
                    child: const Text('Sign Up', style: TextStyle(color: CustomerTheme.primaryRed, fontWeight: FontWeight.bold, fontSize: 13)),
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
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _termsAccepted = false;
  String? _errorMessage;

  void _handleRegister() {
    if (!_termsAccepted) {
      setState(() => _errorMessage = 'Please accept Terms & Conditions.');
      return;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'Passwords do not match.');
      return;
    }
    ref.read(customerAuthProvider.notifier).signUp(
          _nameController.text.trim(),
          _phoneController.text.trim(),
          _emailController.text.trim(),
          _passwordController.text.trim(),
        );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Customer Account')),
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
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full / Business Name')),
            const SizedBox(height: 12),
            TextField(controller: _phoneController, decoration: const InputDecoration(labelText: 'Mobile Number (+91)')),
            const SizedBox(height: 12),
            TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email Address')),
            const SizedBox(height: 12),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
            const SizedBox(height: 12),
            TextField(controller: _confirmPasswordController, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm Password')),
            const SizedBox(height: 12),
            CheckboxListTile(
              value: _termsAccepted,
              onChanged: (val) => setState(() => _termsAccepted = val ?? false),
              title: const Text('I accept ManPowerLink Terms and Privacy Policy', style: TextStyle(fontSize: 12)),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _handleRegister,
                style: ElevatedButton.styleFrom(backgroundColor: CustomerTheme.primaryRed, foregroundColor: Colors.white),
                child: const Text('Create Account'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CustomerForgotPasswordScreen extends StatelessWidget {
  const CustomerForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = TextEditingController();
    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Enter your registered email or phone to receive a recovery challenge.', style: TextStyle(color: CustomerTheme.textSecondary)),
            const SizedBox(height: 16),
            TextField(controller: controller, decoration: const InputDecoration(labelText: 'Email or Mobile Number')),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Recovery code dispatched to registered contact.')));
                Navigator.pop(context);
              },
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
// 2. MAIN AUTHENTICATED SHELL WITH FIXED 5-DESTINATION BOTTOM NAVIGATION
// ---------------------------------------------------------------------------

class CustomerMainShell extends StatefulWidget {
  const CustomerMainShell({super.key});

  @override
  State<CustomerMainShell> createState() => _CustomerMainShellState();
}

class _CustomerMainShellState extends State<CustomerMainShell> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    CustomerHomeTab(),
    CustomerBookingsTab(),
    CustomerPostJobTab(),
    CustomerMessagesTab(),
    CustomerProfileTab(),
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
    );
  }
}

// Tab 1: Home
class CustomerHomeTab extends StatelessWidget {
  const CustomerHomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ManPowerLink', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Find Temporary Workers', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary)),
            const SizedBox(height: 4),
            const Text('Connect · Hire · Get Work Done', style: TextStyle(fontSize: 13, color: CustomerTheme.textSecondary)),
            const SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                hintText: 'Search service, category or verified workers...',
                prefixIcon: const Icon(Icons.search, color: CustomerTheme.primaryRed),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Popular Categories', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CustomerTheme.textPrimary)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.5,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _buildCategoryCard('Loading & Unloading', '₹2,000 / day', Icons.local_shipping),
                _buildCategoryCard('Catering & Food', '₹1,500 / day', Icons.restaurant),
                _buildCategoryCard('Housekeeping', '₹1,200 / day', Icons.cleaning_services),
                _buildCategoryCard('Warehouse Logistics', '₹1,800 / day', Icons.inventory_2),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCard(String title, String price, IconData icon) {
    return Container(
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
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), maxLines: 1),
          Text(price, style: const TextStyle(color: CustomerTheme.successGreen, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

// Tab 2: Bookings
class CustomerBookingsTab extends StatelessWidget {
  const CustomerBookingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Bookings')),
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('Order #1045', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.amber.shade100, borderRadius: BorderRadius.circular(6)),
                        child: const Text('OFFERS SENT', style: TextStyle(color: CustomerTheme.darkRed, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('Loading & Unloading - Panambur Port Dock 4', style: TextStyle(color: CustomerTheme.textSecondary, fontSize: 13)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Start OTP for Workers:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        Text('5918', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CustomerTheme.primaryRed, letterSpacing: 2)),
                      ],
                    ),
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

// Tab 3: Post Job
class CustomerPostJobTab extends StatelessWidget {
  const CustomerPostJobTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Post a Temporary Job')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Create On-Demand Booking', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const TextField(decoration: InputDecoration(labelText: 'Job Category', filled: true, fillColor: Colors.white)),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Number of Workers Required', filled: true, fillColor: Colors.white)),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Offered Pay per Worker (₹)', filled: true, fillColor: Colors.white)),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Worksite Address', filled: true, fillColor: Colors.white)),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Date & Start Time', filled: true, fillColor: Colors.white)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Job posted and broadcast to verified workers.')));
              },
              style: ElevatedButton.styleFrom(backgroundColor: CustomerTheme.primaryRed, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14)),
              child: const Text('Broadcast Job to Workers', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// Tab 4: Messages
class CustomerMessagesTab extends StatelessWidget {
  const CustomerMessagesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking Conversations')),
      body: ListView(
        children: const [
          ListTile(
            leading: CircleAvatar(backgroundColor: CustomerTheme.primaryRed, child: Text('RK', style: TextStyle(color: Colors.white))),
            title: Text('Ramesh Kumar', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('I have reached Gate 4 with my safety gear.', maxLines: 1),
            trailing: Text('10:15 AM', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ),
        ],
      ),
    );
  }
}

// Tab 5: Profile
class CustomerProfileTab extends ConsumerWidget {
  const CustomerProfileTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(customerAuthProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Customer Profile')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ListTile(
              leading: const CircleAvatar(backgroundColor: CustomerTheme.primaryRed, child: Icon(Icons.business, color: Colors.white)),
              title: Text(authState.userName ?? 'Apex Logistics', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(authState.userPhone ?? '+91 99001 55432'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.location_on_outlined),
              title: const Text('Saved Worksites'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.payment_outlined),
              title: const Text('Payment Methods & GST Invoicing'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.description_outlined),
              title: const Text('Terms & Legal Documents'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  ref.read(customerAuthProvider.notifier).signOut();
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
