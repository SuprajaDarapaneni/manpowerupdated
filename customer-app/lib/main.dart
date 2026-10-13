import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(const ProviderScope(child: ManPowerLinkCustomerApp()));
}

class ManPowerLinkCustomerApp extends StatelessWidget {
  const ManPowerLinkCustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ManPowerLink Customer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'PlusJakartaSans',
        scaffoldBackgroundColor: const Color(0xFFFFFDF8),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFFD71920),
          secondary: Color(0xFFFFC928),
          surface: Colors.white,
          error: Color(0xFFC62828),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFD71920),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: const CustomerHomeScreen(),
    );
  }
}

class CustomerHomeScreen extends StatelessWidget {
  const CustomerHomeScreen({super.key});

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
          child: [
            const Text(
              'Find Temporary Workers',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF202124)),
            ),
            const SizedBox(height: 4),
            const Text(
              'Connect · Hire · Get Work Done',
              style: TextStyle(fontSize: 13, color: Color(0xFF686868)),
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                hintText: 'Find the right manpower for your service',
                prefixIcon: const Icon(Icons.search, color: Color(0xFFD71920)),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
