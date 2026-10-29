import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/app_theme.dart';
import '../../../models/category_model.dart';
import '../../../models/location_model.dart';
import '../../../widgets/location_picker_sheet.dart';
import '../../../providers/app_providers.dart';
import 'booking_detail_screen.dart';

class CreateBookingScreen extends ConsumerStatefulWidget {
  final CategoryModel? initialCategory;
  final bool isInstant;

  const CreateBookingScreen({
    super.key,
    this.initialCategory,
    this.isInstant = false,
  });

  @override
  ConsumerState<CreateBookingScreen> createState() => _CreateBookingScreenState();
}

class _CreateBookingScreenState extends ConsumerState<CreateBookingScreen> {
  int _currentStep = 0;
  CategoryModel? _selectedCategory;

  int _requiredWorkers = 2;
  String _durationType = 'full_day';
  DateTime _scheduledDate = DateTime.now().add(const Duration(days: 1));
  final TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  final TimeOfDay _endTime = const TimeOfDay(hour: 17, minute: 0);

  final _addressController = TextEditingController(text: 'Dock 4, Panambur Port Corridor, Mangalore');
  WorksiteLocation? _selectedLocation = WorksiteLocation.presetHubs[4]; // Default Panambur Dock 4
  final _descriptionController = TextEditingController(text: 'Unloading 2 shipping containers with boxed goods.');
  final _specialInstructionsController = TextEditingController(text: 'Safety boots and gloves mandatory.');
  late final TextEditingController _offeredPriceController;

  // Food / Tiffin Service dynamic fields
  bool _morningTiffin = true;
  bool _lunch = true;
  bool _eveningTea = true;

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    final initialPrice = _selectedCategory?.fullDayRate ?? 2000;
    _offeredPriceController = TextEditingController(text: initialPrice.toInt().toString());
  }

  double get _offeredPrice => double.tryParse(_offeredPriceController.text) ?? 2000.0;
  double get _baseCost => _offeredPrice * _requiredWorkers;
  double get _platformFee => _baseCost * 0.10;
  double get _tax => _platformFee * 0.05;
  double get _totalEstimated => _baseCost + _platformFee + _tax;

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Post Manpower Requirement'),
      ),
      body: categoriesAsync.when(
        data: (categories) {
          _selectedCategory ??= categories.first;

          return Theme(
            data: Theme.of(context).copyWith(
              colorScheme: const ColorScheme.light(primary: AppTheme.primaryRed),
            ),
            child: Stepper(
              type: StepperType.vertical,
              currentStep: _currentStep,
              onStepTapped: (step) => setState(() => _currentStep = step),
              onStepContinue: () => _handleNextStep(categories),
              onStepCancel: () {
                if (_currentStep > 0) {
                  setState(() => _currentStep -= 1);
                } else {
                  Navigator.of(context).pop();
                }
              },
              controlsBuilder: (context, details) {
                final isLast = _currentStep == 4;
                return Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    children: [
                      ElevatedButton(
                        onPressed: _isSubmitting ? null : details.onStepContinue,
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 18,
                                width: 18,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : Text(isLast ? 'Confirm & Broadcast' : 'Next Step'),
                      ),
                      const SizedBox(width: 12),
                      if (_currentStep > 0)
                        TextButton(
                          onPressed: details.onStepCancel,
                          child: const Text('Back'),
                        ),
                    ],
                  ),
                );
              },
              steps: [
                // STEP 1: Service Vertical & Workers Count
                Step(
                  title: const Text('Service & Manpower Count', style: TextStyle(fontWeight: FontWeight.bold)),
                  isActive: _currentStep >= 0,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      DropdownButtonFormField<CategoryModel>(
                        initialValue: _selectedCategory,
                        decoration: const InputDecoration(labelText: 'Select Vertical'),
                        items: categories
                            .map((c) => DropdownMenuItem(value: c, child: Text(c.name)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedCategory = val;
                              _offeredPriceController.text = val.fullDayRate.toInt().toString();
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Number of Workers Needed:'),
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline),
                                onPressed: () {
                                  if (_requiredWorkers > 1) {
                                    setState(() => _requiredWorkers--);
                                  }
                                },
                              ),
                              Text('$_requiredWorkers', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              IconButton(
                                icon: const Icon(Icons.add_circle_outline),
                                onPressed: () => setState(() => _requiredWorkers++),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _descriptionController,
                        maxLines: 2,
                        decoration: const InputDecoration(labelText: 'Work Description / Scope'),
                      ),
                    ],
                  ),
                ),

                // STEP 2: Food & Tiffin Service Dynamic Details (If Selected) or Schedule
                Step(
                  title: const Text('Schedule & Duration', style: TextStyle(fontWeight: FontWeight.bold)),
                  isActive: _currentStep >= 1,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      DropdownButtonFormField<String>(
                        initialValue: _durationType,
                        decoration: const InputDecoration(labelText: 'Duration Type'),
                        items: const [
                          DropdownMenuItem(value: 'full_day', child: Text('Full Day (8 Hours)')),
                          DropdownMenuItem(value: 'half_day', child: Text('Half Day (4 Hours)')),
                          DropdownMenuItem(value: 'hourly', child: Text('Hourly Basis')),
                          DropdownMenuItem(value: 'work_basis', child: Text('Work / Task Basis')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _durationType = val);
                        },
                      ),
                      const SizedBox(height: 14),
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text('Date: ${_scheduledDate.toLocal().toString().split(' ')[0]}'),
                        trailing: const Icon(Icons.calendar_month, color: AppTheme.primaryRed),
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: _scheduledDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 30)),
                          );
                          if (picked != null) setState(() => _scheduledDate = picked);
                        },
                      ),

                      // Dynamic Catering Questions if Food vertical selected
                      if (_selectedCategory?.isFoodTiffin == true) ...[
                        const Divider(),
                        const Text(
                          'Catering & Tiffin Specifications:',
                          style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryRed),
                        ),
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Morning Tiffin Needed'),
                          value: _morningTiffin,
                          onChanged: (val) => setState(() => _morningTiffin = val ?? true),
                        ),
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Lunch Serving Needed'),
                          value: _lunch,
                          onChanged: (val) => setState(() => _lunch = val ?? true),
                        ),
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Evening Tea Needed'),
                          value: _eveningTea,
                          onChanged: (val) => setState(() => _eveningTea = val ?? true),
                        ),
                      ],
                    ],
                  ),
                ),

                // STEP 3: Worksite Location
                Step(
                  title: const Text('Worksite Details', style: TextStyle(fontWeight: FontWeight.bold)),
                  isActive: _currentStep >= 2,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Location Picker Trigger Card
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.primaryRed.withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.location_on, color: AppTheme.primaryRed, size: 18),
                                    const SizedBox(width: 6),
                                    Text(
                                      _selectedLocation?.name ?? 'Selected Worksite',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF0FDF4),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: const Color(0xFF86EFAC)),
                                  ),
                                  child: Text(
                                    _selectedLocation?.categoryTag.toUpperCase() ?? 'VERIFIED',
                                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF16A34A)),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _selectedLocation != null
                                  ? '${_selectedLocation!.area} · Lat: ${_selectedLocation!.latitude.toStringAsFixed(4)}°, Lng: ${_selectedLocation!.longitude.toStringAsFixed(4)}°'
                                  : 'Coordinates: Mangalore Service Zone',
                              style: const TextStyle(fontSize: 11, color: AppTheme.secondaryText),
                            ),
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: () async {
                                  final picked = await LocationPickerSheet.show(
                                    context,
                                    initialLocation: _selectedLocation,
                                  );
                                  if (picked != null) {
                                    setState(() {
                                      _selectedLocation = picked;
                                      _addressController.text = picked.address;
                                    });
                                  }
                                },
                                icon: const Icon(Icons.edit_location_alt, size: 16),
                                label: const Text('Pick Location (Hubs / Search / Manual)'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryRed,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Quick Hubs Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            const Text('Quick Hubs: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.secondaryText)),
                            ...WorksiteLocation.presetHubs.take(4).map((hub) {
                              final isCurrent = _selectedLocation?.id == hub.id;
                              return Padding(
                                padding: const EdgeInsets.only(right: 6),
                                child: ActionChip(
                                  label: Text(hub.area, style: TextStyle(fontSize: 11, color: isCurrent ? Colors.white : AppTheme.primaryText)),
                                  backgroundColor: isCurrent ? AppTheme.primaryRed : const Color(0xFFF1F3F5),
                                  padding: const EdgeInsets.symmetric(horizontal: 4),
                                  onPressed: () {
                                    setState(() {
                                      _selectedLocation = hub;
                                      _addressController.text = hub.address;
                                    });
                                  },
                                ),
                              );
                            }),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),

                      TextField(
                        controller: _addressController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: 'Worksite Street Address',
                          prefixIcon: Icon(Icons.location_city, color: AppTheme.primaryRed),
                          helperText: 'Editable address for on-site worker navigation',
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _specialInstructionsController,
                        decoration: const InputDecoration(
                          labelText: 'Safety Requirements & PPE instructions',
                        ),
                      ),
                    ],
                  ),
                ),

                // STEP 4: Pricing Proposal & Minimum Validation
                Step(
                  title: const Text('Offered Budget & Price Floor', style: TextStyle(fontWeight: FontWeight.bold)),
                  isActive: _currentStep >= 3,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: _offeredPriceController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Offered Price per Worker (₹)',
                          prefixText: '₹ ',
                          helperText: 'Category minimum floor: ₹${_selectedCategory?.minPrice.toInt() ?? 500}',
                        ),
                      ),
                      if (_errorMessage != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(color: AppTheme.stateError, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),
                ),

                // STEP 5: Final Review & Total Calculation
                Step(
                  title: const Text('Review Estimated Total', style: TextStyle(fontWeight: FontWeight.bold)),
                  isActive: _currentStep >= 4,
                  content: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.black12),
                    ),
                    child: Column(
                      children: [
                        _buildSummaryRow('Base Labor ($_requiredWorkers workers)', '₹${_baseCost.toStringAsFixed(0)}'),
                        _buildSummaryRow('Platform Service Fee (10%)', '₹${_platformFee.toStringAsFixed(0)}'),
                        _buildSummaryRow('Applicable Tax (5%)', '₹${_tax.toStringAsFixed(0)}'),
                        const Divider(),
                        _buildSummaryRow('Estimated Total', '₹${_totalEstimated.toStringAsFixed(0)}', isBold: true),
                        const SizedBox(height: 8),
                        const Text(
                          'Overtime beyond shift will be billed automatically at 1.5x hourly rate.',
                          style: TextStyle(fontSize: 11, color: AppTheme.secondaryText),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 12, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
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

  void _handleNextStep(List<CategoryModel> categories) {
    setState(() => _errorMessage = null);

    // Validate pricing floor on step 3
    if (_currentStep == 3) {
      final minFloor = _selectedCategory?.minPrice ?? 500;
      if (_offeredPrice < minFloor) {
        setState(() {
          _errorMessage = 'Offered price cannot be below the category minimum rate of ₹$minFloor.';
        });
        return;
      }
    }

    if (_currentStep < 4) {
      setState(() => _currentStep += 1);
    } else {
      _submitBooking();
    }
  }

  void _submitBooking() async {
    setState(() => _isSubmitting = true);

    try {
      final bookingData = {
        'categoryId': _selectedCategory?.id ?? 'cat-1',
        'categoryName': _selectedCategory?.name ?? 'Loading & Unloading',
        'requiredWorkers': _requiredWorkers,
        'offeredPricePerWorker': _offeredPrice,
        'totalEstimatedAmount': _totalEstimated,
        'scheduledDate': _scheduledDate.toLocal().toString().split(' ')[0],
        'startTime': '${_startTime.hour}:${_startTime.minute}',
        'endTime': '${_endTime.hour}:${_endTime.minute}',
        'durationType': _durationType,
        'description': _descriptionController.text,
        'specialInstructions': _specialInstructionsController.text,
        'workLocation': {
          'address': _addressController.text,
          'city': _selectedLocation?.city ?? 'Mangalore, Karnataka',
          'area': _selectedLocation?.area ?? 'Panambur',
          'latitude': _selectedLocation?.latitude ?? 12.9340,
          'longitude': _selectedLocation?.longitude ?? 74.8140,
        },
      };

      final repo = ref.read(bookingRepositoryProvider);
      final newBooking = await repo.createBooking(bookingData);

      if (mounted) {
        setState(() => _isSubmitting = false);
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => BookingDetailScreen(bookingId: newBooking.id, initialBooking: newBooking),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMessage = e.toString();
        });
      }
    }
  }
}
