import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';
import '../../home/screens/customer_home_screen.dart';

class CustomerLoginScreen extends StatefulWidget {
  const CustomerLoginScreen({super.key});

  @override
  State<CustomerLoginScreen> createState() => _CustomerLoginScreenState();
}

class _CustomerLoginScreenState extends State<CustomerLoginScreen> {
  final _phoneController = TextEditingController(text: '+91 99001 55432');
  final _passwordController = TextEditingController(text: 'Password@123');
  bool _isLoading = false;

  void _handleLogin() {
    setState(() => _isLoading = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() => _isLoading = false);
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const CustomerHomeScreen()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Brand Header
                Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryRed,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryRed.withOpacity(0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'M',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'ManPowerLink',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: AppTheme.primaryText,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Customer & Employer Portal',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.secondaryText,
                  ),
                ),
                const SizedBox(height: 36),

                // Card Container
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Sign In',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Mobile Phone',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.phone_outlined, size: 20),
                          ),
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          'Password',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.lock_outline, size: 20),
                          ),
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _handleLogin,
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Text('Continue to Marketplace'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Center(
                  child: Text(
                    'Connected to Central Backend API v1',
                    style: TextStyle(fontSize: 11, color: AppTheme.secondaryText),
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
