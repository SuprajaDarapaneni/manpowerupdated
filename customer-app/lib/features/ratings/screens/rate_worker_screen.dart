import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/app_theme.dart';
import '../../../providers/app_providers.dart';

class RateWorkerScreen extends ConsumerStatefulWidget {
  final String bookingId;
  final String workerName;

  const RateWorkerScreen({
    super.key,
    required this.bookingId,
    required this.workerName,
  });

  @override
  ConsumerState<RateWorkerScreen> createState() => _RateWorkerScreenState();
}

class _RateWorkerScreenState extends ConsumerState<RateWorkerScreen> {
  int _overallRating = 5;
  int _punctuality = 5;
  int _quality = 5;
  final _commentController = TextEditingController(text: 'Punctual and very efficient worker.');
  bool _submitted = false;

  void _submitRating() async {
    setState(() => _submitted = true);
    try {
      await ref.read(bookingRepositoryProvider).rateWorker(
            widget.bookingId,
            'w-1',
            _overallRating.toDouble(),
            _commentController.text,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Thank you! Your feedback has been recorded.')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) setState(() => _submitted = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate Worker Performance'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 32,
                    backgroundColor: AppTheme.primaryRed,
                    child: Icon(Icons.person, color: Colors.white, size: 36),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    widget.workerName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const Text('Assigned Temporary Laborer', style: TextStyle(color: AppTheme.secondaryText, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Rating Stars
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Overall Experience', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        return IconButton(
                          icon: Icon(
                            index < _overallRating ? Icons.star : Icons.star_border,
                            color: AppTheme.primaryYellow,
                            size: 32,
                          ),
                          onPressed: () => setState(() => _overallRating = index + 1),
                        );
                      }),
                    ),
                    const Divider(),
                    _buildSubRating('Punctuality & On-Time Arrival', _punctuality, (val) => setState(() => _punctuality = val)),
                    _buildSubRating('Work Quality & Physical Effort', _quality, (val) => setState(() => _quality = val)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Feedback Text
            TextField(
              controller: _commentController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Optional Comments or Praise',
                hintText: 'Share how well the job was carried out...',
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitted ? null : _submitRating,
                child: const Text('Submit Rating & Review'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubRating(String title, int value, ValueChanged<int> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 12)),
          Row(
            children: List.generate(5, (idx) {
              return InkWell(
                onTap: () => onChanged(idx + 1),
                child: Icon(
                  idx < value ? Icons.star : Icons.star_border,
                  color: AppTheme.primaryYellow,
                  size: 20,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
