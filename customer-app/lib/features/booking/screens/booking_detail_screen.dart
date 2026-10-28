import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/app_theme.dart';
import '../../../models/booking_model.dart';
import '../../../providers/app_providers.dart';
import '../../chat/screens/chat_screen.dart';
import '../../ratings/screens/rate_worker_screen.dart';
import '../../payments/screens/payment_screen.dart';

class BookingDetailScreen extends ConsumerStatefulWidget {
  final String bookingId;
  final BookingModel? initialBooking;

  const BookingDetailScreen({
    super.key,
    required this.bookingId,
    this.initialBooking,
  });

  @override
  ConsumerState<BookingDetailScreen> createState() =>
      _BookingDetailScreenState();
}

class _BookingDetailScreenState extends ConsumerState<BookingDetailScreen> {
  late BookingModel _booking;
  final _raisePriceController = TextEditingController();
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _booking = widget.initialBooking ??
        BookingModel(
          id: widget.bookingId,
          orderNumber: 'Order #1045',
          categoryId: 'cat-1',
          categoryName: 'Loading & Unloading',
          requiredWorkers: 4,
          acceptedWorkersCount: 3,
          assignedWorkers: [
            AssignedWorkerModel(
              workerId: 'w-1',
              workerName: 'Ramesh Kumar',
              workerPhone: '+91 98765 43210',
              workerAvatar: '',
              agreedRate: 2000,
              status: 'travelling',
              startOtpVerified: false,
              endOtpVerified: false,
            ),
          ],
          bids: [
            WorkerBidModel(
              id: 'bid-1',
              workerId: 'w-1',
              workerName: 'Ramesh Kumar',
              workerAvatar: '',
              workerRating: 4.8,
              proposedAmount: 2000,
              status: 'accepted',
              submittedAt: '08:30 AM',
            ),
          ],
          offeredPricePerWorker: 2200,
          totalEstimatedAmount: 8800,
          status: 'OFFERS_SENT',
          paymentStatus: 'pending',
          startOtp: '4829',
          endOtp: '9154',
          scheduledDate: '2026-10-14',
          startTime: '10:00 AM',
          endTime: '06:00 PM',
          durationType: 'full_day',
          description: 'Unloading 2 shipping containers with boxed FMCG goods.',
          address: 'Dock 4, Panambur Port Corridor',
          city: 'Mangalore, Karnataka',
        );
    _raisePriceController.text =
        (_booking.offeredPricePerWorker + 200).toInt().toString();
  }

  void _showRaisePriceDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Raise Offered Rate',
            style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Increase your proposed rate to attract faster worker acceptance without creating a duplicate booking:',
              style: TextStyle(fontSize: 12, color: AppTheme.secondaryText),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _raisePriceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'New Offered Rate (₹ / worker)',
                prefixText: '₹ ',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              setState(() => _isUpdating = true);
              final newPrice = double.tryParse(_raisePriceController.text) ??
                  _booking.offeredPricePerWorker;
              try {
                await ref.read(bookingRepositoryProvider).raiseBookingPrice(
                      _booking.id,
                      newPrice,
                      'Employer raised offer to expedite fulfillment',
                    );
                if (mounted) {
                  setState(() => _isUpdating = false);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text(
                            'Offer revised and broadcast to nearby workers!')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  setState(() => _isUpdating = false);
                }
              }
            },
            child: _isUpdating
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Confirm Price Update'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_booking.orderNumber),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            tooltip: 'Chat with Assigned Workers',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ChatScreen(
                      bookingId: _booking.id,
                      orderNumber: _booking.orderNumber),
                ),
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
            // Status & Order Banner
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_booking.categoryName,
                            style: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color:
                                AppTheme.primaryYellow.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _booking.status.replaceAll('_', ' '),
                            style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryText),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${_booking.scheduledDate} · ${_booking.startTime} - ${_booking.endTime}',
                      style: const TextStyle(
                          fontSize: 12, color: AppTheme.secondaryText),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                            'Filled Capacity: ${_booking.acceptedWorkersCount} / ${_booking.requiredWorkers} Workers'),
                        Text(
                          '₹${_booking.offeredPricePerWorker.toInt()} / worker',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryRed),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // OTP Verification Box
            Card(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Worksite Security & Attendance Codes',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryRed),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppTheme.background,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.black12),
                            ),
                            child: Column(
                              children: [
                                const Text('START WORK OTP',
                                    style: TextStyle(
                                        fontSize: 10,
                                        color: AppTheme.secondaryText)),
                                const SizedBox(height: 4),
                                Text(
                                  _booking.startOtp,
                                  style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 3,
                                      color: AppTheme.primaryRed),
                                ),
                                const Text('Give upon worker arrival',
                                    style: TextStyle(
                                        fontSize: 9,
                                        color: AppTheme.secondaryText)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppTheme.background,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.black12),
                            ),
                            child: Column(
                              children: [
                                const Text('END WORK OTP',
                                    style: TextStyle(
                                        fontSize: 10,
                                        color: AppTheme.secondaryText)),
                                const SizedBox(height: 4),
                                Text(
                                  _booking.endOtp,
                                  style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 3,
                                      color: AppTheme.primaryText),
                                ),
                                const Text('Provide upon shift completion',
                                    style: TextStyle(
                                        fontSize: 9,
                                        color: AppTheme.secondaryText)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Action: Raise price if unfilled
            if (_booking.acceptedWorkersCount < _booking.requiredWorkers)
              OutlinedButton.icon(
                icon: const Icon(Icons.trending_up, color: AppTheme.primaryRed),
                label: const Text('Raise Offer Rate to Accelerate Hiring'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Duration(milliseconds: 10) == Duration.zero
                      ? Size.zero
                      : const Size.fromHeight(48),
                  side: const BorderSide(color: AppTheme.primaryRed),
                ),
                onPressed: _showRaisePriceDialog,
              ),
            const SizedBox(height: 14),

            // Bids & Assigned Workers List
            const Text('Assigned Workers & Incoming Bids',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),

            ..._booking.assignedWorkers.map((w) => Card(
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppTheme.primaryRed,
                      child: Icon(Icons.person, color: Colors.white, size: 20),
                    ),
                    title: Text(w.workerName,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text(
                        'Status: ${w.status} · Agreed: ₹${w.agreedRate.toInt()}',
                        style: const TextStyle(fontSize: 11)),
                    trailing: const Icon(Icons.check_circle,
                        color: AppTheme.stateSuccess),
                  ),
                )),

            const SizedBox(height: 20),

            // Payment and Reviews Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.payment, size: 16),
                    label: const Text('Payment & Receipt'),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                            builder: (_) => PaymentScreen(booking: _booking)),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.star, size: 16),
                    label: const Text('Rate Workers'),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => RateWorkerScreen(
                            bookingId: _booking.id,
                            workerName: _booking
                                    .assignedWorkers.firstOrNull?.workerName ??
                                'Ramesh Kumar',
                          ),
                        ),
                      );
                    },
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
