import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme/employee_theme.dart';
import 'providers/worker_providers.dart';
import 'models/worker_job_model.dart';

void main() {
  runApp(const ProviderScope(child: ManPowerLinkWorkerApp()));
}

class ManPowerLinkWorkerApp extends StatelessWidget {
  const ManPowerLinkWorkerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ManPowerLink Worker',
      debugShowCheckedModeBanner: false,
      theme: EmployeeAppTheme.lightTheme,
      home: const WorkerRootNavigation(),
    );
  }
}

class WorkerRootNavigation extends ConsumerStatefulWidget {
  const WorkerRootNavigation({super.key});

  @override
  ConsumerState<WorkerRootNavigation> createState() => _WorkerRootNavigationState();
}

class _WorkerRootNavigationState extends ConsumerState<WorkerRootNavigation> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      const WorkerDashboardScreen(),
      const WorkerActiveJobsScreen(),
      const WorkerEarningsScreen(),
      const WorkerProfileScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xFFFFC928),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.flash_on_outlined),
            selectedIcon: Icon(Icons.flash_on, color: Color(0xFFD71920)),
            label: 'Job Feed',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment, color: Color(0xFFD71920)),
            label: 'My Jobs',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_outlined),
            selectedIcon: Icon(Icons.account_balance_wallet, color: Color(0xFFD71920)),
            label: 'Earnings',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: Color(0xFFD71920)),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class WorkerDashboardScreen extends ConsumerWidget {
  const WorkerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(workerOnlineStatusProvider);
    final offersAsync = ref.watch(workerOffersProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFFC928),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('MPL WORKER', style: TextStyle(color: Color(0xFF1E1F23), fontWeight: FontWeight.bold, fontSize: 11)),
            ),
            const SizedBox(width: 8),
            const Text('Job Radar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          Switch(
            value: isOnline,
            activeColor: const Color(0xFFFFC928),
            activeTrackColor: const Color(0xFF16834A),
            onChanged: (val) {
              ref.read(workerOnlineStatusProvider.notifier).state = val;
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1F23),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isOnline ? const Color(0xFF16834A) : Colors.grey,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isOnline ? 'Active on Job Radar' : 'Offline - Not receiving jobs',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        Text(
                          isOnline ? 'Broadcasting location within 15 km search zone' : 'Turn switch on to receive nearby job offers',
                          style: const TextStyle(color: Colors.white60, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Available Job Broadcasts', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF202124))),
                TextButton(
                  onPressed: () => ref.refresh(workerOffersProvider),
                  child: const Text('Refresh', style: TextStyle(color: Color(0xFFD71920))),
                ),
              ],
            ),
            const SizedBox(height: 8),

            offersAsync.when(
              data: (offers) {
                if (offers.isEmpty) {
                  return const Center(child: Text('No active job requests in your radius right now.'));
                }
                return Column(
                  children: offers.map((offer) => _buildJobOfferCard(context, ref, offer)).toList(),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Text('Error loading offers: $err'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobOfferCard(BuildContext context, WidgetRef ref, WorkerJobOffer offer) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0x15202124)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD71920).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(offer.categoryName, style: const TextStyle(color: Color(0xFFD71920), fontWeight: FontWeight.bold, fontSize: 12)),
                ),
                Text('₹${offer.payoutAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF16834A))),
              ],
            ),
            const SizedBox(height: 10),
            Text(offer.orderNumber, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF202124))),
            Text(offer.customerName, style: const TextStyle(color: Color(0xFF686868), fontSize: 13)),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFF686868)),
                const SizedBox(width: 4),
                Expanded(child: Text(offer.worksiteAddress, style: const TextStyle(fontSize: 12, color: Color(0xFF686868)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                Text('${offer.distanceKm} km away', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF202124))),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Offer declined.')));
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF686868),
                      side: const BorderSide(color: Color(0xFFCCCCCC)),
                    ),
                    child: const Text('Decline'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () async {
                      final repo = ref.read(workerRepositoryProvider);
                      await repo.acceptJob(offer.bookingId);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: Color(0xFF16834A),
                            content: Text('Job accepted! Proceed to worksite and prepare Start OTP.'),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD71920),
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Accept Job'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class WorkerActiveJobsScreen extends StatelessWidget {
  const WorkerActiveJobsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Active Work')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: Color(0xFFFFC928), width: 1.5),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF16834A).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('CONFIRMED / EN ROUTE', style: TextStyle(color: Color(0xFF16834A), fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                      const Text('₹2,200', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text('Order #1045 - Loading & Unloading', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const Text('Apex Logistics & Warehousing', style: TextStyle(color: Color(0xFF686868), fontSize: 13)),
                  const SizedBox(height: 12),
                  const Text('Worksite: Gate 4, Industrial Logistics Hub, Bangalore', style: TextStyle(fontSize: 13)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            _showOtpDialog(context, isStart: true);
                          },
                          icon: const Icon(Icons.pin, size: 18),
                          label: const Text('Enter Start OTP'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD71920)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            _showOtpDialog(context, isStart: false);
                          },
                          icon: const Icon(Icons.check_circle_outline, size: 18),
                          label: const Text('End Job OTP'),
                          style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF1E1F23)),
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

  void _showOtpDialog(BuildContext context, {required bool isStart}) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isStart ? 'Verify Arrival (Start OTP)' : 'Complete Work (End OTP)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(isStart ? 'Ask customer for 4-digit Start OTP to begin job timer:' : 'Ask customer for 4-digit End OTP to conclude job and trigger payout:'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              maxLength: 4,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'e.g. 4829',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF16834A),
                  content: Text(isStart ? 'Start OTP Verified! Attendance recorded.' : 'End OTP Verified! Job marked completed. Payout released.'),
                ),
              );
            },
            child: const Text('Verify & Submit'),
          ),
        ],
      ),
    );
  }
}

class WorkerEarningsScreen extends StatelessWidget {
  const WorkerEarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Earnings & Wallet')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1F23),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 6),
                const Text('₹2,850.00', style: TextStyle(color: Color(0xFFFFC928), fontSize: 32, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Career Earnings: ₹38,400', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payout requested to bank account.')));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD71920),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      child: const Text('Request Payout', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Recent Completed Shifts', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildShiftTile('Order #1040', 'Loading Cargo', 'Yesterday', '₹2,200', 'Paid'),
          _buildShiftTile('Order #1034', 'Warehouse Dispatch', '3 days ago', '1,800', 'Paid'),
          _buildShiftTile('Order #1029', 'Catering Helper', 'Last week', '₹1,500', 'Paid'),
        ],
      ),
    );
  }

  Widget _buildShiftTile(String order, String title, String date, String amount, String status) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const CircleAvatar(
        backgroundColor: Color(0xFFFFF0ED),
        child: Icon(Icons.check, color: Color(0xFFD71920), size: 18),
      ),
      title: Text('$order • $title', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      subtitle: Text(date, style: const TextStyle(fontSize: 12, color: Color(0xFF686868))),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF16834A))),
          Text(status, style: const TextStyle(fontSize: 11, color: Color(0xFF686868))),
        ],
      ),
    );
  }
}

class WorkerProfileScreen extends StatelessWidget {
  const WorkerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Worker Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Center(
            child: CircleAvatar(
              radius: 40,
              backgroundColor: Color(0xFF1E1F23),
              child: Text('RK', style: TextStyle(color: Color(0xFFFFC928), fontSize: 24, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text('Ramesh Kumar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const Center(
            child: Text('+91 98765 43210 • Verified Worker ★ 4.85', style: TextStyle(color: Color(0xFF686868), fontSize: 13)),
          ),
          const SizedBox(height: 24),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.verified_user_outlined, color: Color(0xFF16834A)),
            title: const Text('Verification & Documents'),
            subtitle: const Text('Aadhaar & Police Clearance Verified'),
            trailing: const Icon(Icons.chevron_right),
          ),
          ListTile(
            leading: const Icon(Icons.build_outlined, color: Color(0xFFD71920)),
            title: const Text('Skills & Categories'),
            subtitle: const Text('Loading & Unloading, Heavy Cargo'),
            trailing: const Icon(Icons.chevron_right),
          ),
          ListTile(
            leading: const Icon(Icons.emergency_outlined, color: Color(0xFFC62828)),
            title: const Text('Emergency SOS & Safety Hotline'),
            subtitle: const Text('24x7 Safety Assistance'),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  backgroundColor: Color(0xFFC62828),
                  content: Text('Safety alert triggered! Dispatch team notified.'),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
