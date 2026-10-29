import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';
import '../../../models/booking_model.dart';

class PaymentScreen extends StatefulWidget {
  final BookingModel booking;

  const PaymentScreen({super.key, required this.booking});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedPaymentMethod = 'online';
  bool _isProcessing = false;
  bool _paymentConfirmed = false;

  @override
  Widget build(BuildContext context) {
    final baseCost =
        widget.booking.offeredPricePerWorker * widget.booking.requiredWorkers;
    final platformFee = baseCost * 0.10;
    final tax = platformFee * 0.05;
    final finalAmount = baseCost + platformFee + tax;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment & Receipt Summary'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Header Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.booking.orderNumber,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.booking.categoryName,
                      style: const TextStyle(
                          color: AppTheme.secondaryText, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Itemized Statement Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Itemized Cost Breakdown',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 12),
                    _buildRow(
                        'Labor Cost (${widget.booking.requiredWorkers} workers @ ₹${widget.booking.offeredPricePerWorker.toInt()})',
                        '₹${baseCost.toInt()}'),
                    _buildRow('Actual Shift Duration',
                        '${widget.booking.durationType.replaceAll('_', ' ')} (8 hrs)'),
                    _buildRow('Overtime Surcharge', '₹0 (0 hrs OT)'),
                    _buildRow('Platform Service Fee (10%)',
                        '₹${platformFee.toInt()}'),
                    _buildRow('GST / Tax (5%)', '₹${tax.toInt()}'),
                    const Divider(),
                    _buildRow(
                        'Total Settlement Amount', '₹${finalAmount.toInt()}',
                        isBold: true),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Payment Mode Selector
            const Text('Select Payment Option:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),

            RadioGroup<String>(
              groupValue: _selectedPaymentMethod,
              onChanged: (val) {
                if (val != null) setState(() => _selectedPaymentMethod = val);
              },
              child: const Column(
                children: [
                  RadioListTile<String>(
                    value: 'online',
                    title: Text('Online Payment (UPI, Cards, NetBanking)'),
                    subtitle: Text(
                        'Secured Escrow release upon End OTP verification'),
                  ),
                  RadioListTile<String>(
                    value: 'cash',
                    title: Text('Direct Cash Handover on Site'),
                    subtitle:
                        Text('Handed directly to assigned worker team lead'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (_paymentConfirmed)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.stateSuccess.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.stateSuccess),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle, color: AppTheme.stateSuccess),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Payment receipt confirmed and recorded in platform ledger!',
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.stateSuccess,
                            fontSize: 12),
                      ),
                    ),
                  ],
                ),
              )
            else
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isProcessing
                      ? null
                      : () {
                          setState(() => _isProcessing = true);
                          Future.delayed(const Duration(milliseconds: 700), () {
                            if (mounted) {
                              setState(() {
                                _isProcessing = false;
                                _paymentConfirmed = true;
                              });
                            }
                          });
                        },
                  child: _isProcessing
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text('Confirm ₹${finalAmount.toInt()} Payment'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(
            value,
            style: TextStyle(
              fontSize: isBold ? 15 : 12,
              fontWeight: FontWeight.bold,
              color: isBold ? AppTheme.primaryRed : AppTheme.primaryText,
            ),
          ),
        ],
      ),
    );
  }
}
