import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/app_theme.dart';
import '../../../models/category_model.dart';
import '../../../providers/app_providers.dart';
import '../../booking/screens/create_booking_screen.dart';


class CustomerHomeScreen extends ConsumerStatefulWidget {
  const CustomerHomeScreen({super.key});

  @override
  ConsumerState<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends ConsumerState<CustomerHomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ManPowerLink'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shield_outlined),
            tooltip: 'Safety & Support',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SupportSafetyScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Booking History',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const BookingHistoryScreen()),
              );
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeBody(categoriesAsync),
          const BookingHistoryScreen(),
          const SupportSafetyScreen(),
          const CustomerProfileScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        selectedItemColor: AppTheme.primaryRed,
        unselectedItemColor: AppTheme.secondaryText,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment), label: 'My Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.support_agent), label: 'Support'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildHomeBody(AsyncValue<List<CategoryModel>> categoriesAsync) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting Banner
          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Need Temporary Manpower?',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.primaryText,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Hire verified loaders, catering servers, cleaners, and warehouse workers in Mangalore.',
                    style: TextStyle(fontSize: 12, color: AppTheme.secondaryText),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.flash_on, size: 16),
                          label: const Text('Instant Dispatch'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryYellow,
                            foregroundColor: AppTheme.primaryText,
                          ),
                          onPressed: () => _openBooking(null, isInstant: true),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_today, size: 16),
                          label: const Text('Schedule Shift'),
                          onPressed: () => _openBooking(null, isInstant: false),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Categories Grid
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Service Verticals',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryText,
                ),
              ),
              Text(
                'Live Rates',
                style: TextStyle(fontSize: 11, color: AppTheme.primaryRed, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 12),

          categoriesAsync.when(
            data: (categories) => GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.25,
              ),
              itemCount: categories.length,
              itemBuilder: (ctx, index) {
                final cat = categories[index];
                return InkWell(
                  onTap: () => _openBooking(cat),
                  borderRadius: BorderRadius.circular(16),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryRed.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.work_outline, color: AppTheme.primaryRed, size: 20),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                cat.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'From ₹${cat.minPrice.toInt()}',
                                style: const TextStyle(fontSize: 11, color: AppTheme.secondaryText),
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
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Error loading categories: $err')),
          ),
        ],
      ),
    );
  }

  void _openBooking(CategoryModel? category, {bool isInstant = false}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CreateBookingScreen(initialCategory: category, isInstant: isInstant),
      ),
    );
  }
}

class BookingHistoryScreen extends StatelessWidget {
  const BookingHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking History')),
      body: const Center(child: Text('No previous bookings found.')),
    );
  }
}

class SupportSafetyScreen extends StatelessWidget {
  const SupportSafetyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support & Safety')),
      body: const Center(child: Text('24/7 Helpline: 1800-MANPOWER')),
    );
  }
}

class CustomerProfileScreen extends StatelessWidget {
  const CustomerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Customer Profile')),
      body: const Center(child: Text('Customer Profile & Settings')),
    );
  }
}
