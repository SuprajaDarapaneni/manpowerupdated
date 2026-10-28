import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/customer_notification_service.dart';
import '../main.dart';

class WorkerCreateJobSheet extends ConsumerStatefulWidget {
  const WorkerCreateJobSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const WorkerCreateJobSheet(),
    );
  }

  @override
  ConsumerState<WorkerCreateJobSheet> createState() => _WorkerCreateJobSheetState();
}

class _WorkerCreateJobSheetState extends ConsumerState<WorkerCreateJobSheet> {
  final _formKey = GlobalKey<FormState>();

  final _titleController = TextEditingController(text: 'Container De-stuffing & Palletizing');
  final _addressController = TextEditingController(text: 'Baikampady Industrial Estate Gate 2, Mangalore');
  final _customerNameController = TextEditingController(text: 'Apex Logistics Mangalore');
  final _customerPhoneController = TextEditingController(text: '+91 99001 55432');
  final _wageController = TextEditingController(text: '650');
  final _scheduledTimeController = TextEditingController(text: 'Today, 02:00 PM - 10:00 PM');
  final _remarksController = TextEditingController(text: 'Heavy lifting required. Safety boots and reflective vest mandatory.');

  String _selectedCategory = 'Loading & Unloading';
  final String _pricingType = 'DAILY'; // 'DAILY' | 'HOURLY' | 'FULL_PACKAGE'
  int _workersNeeded = 4;
  bool _notifyCustomerApp = true;
  bool _isSubmitting = false;

  final List<String> _categories = [
    'Loading & Unloading',
    'Civil Construction',
    'Food & Catering Services',
    'Warehouse Logistics & Packing',
    'Factory & Industrial Assembly',
    'Housekeeping & Cleaning',
    'Electrical & Plumbing',
    'Drivers & Heavy Machinery',
  ];

  final List<Map<String, String>> _quickHubs = [
    {
      'label': 'Baikampady Gate 2',
      'address': 'Baikampady Industrial Estate Gate 2, Mangalore',
    },
    {
      'label': 'NMPT Dock 4',
      'address': 'Panambur Container Terminal Dock 4, Mangalore',
    },
    {
      'label': 'Surathkal Yard',
      'address': 'Surathkal Commercial Logistics Hub, NH 66',
    },
    {
      'label': 'Pumpwell Complex',
      'address': 'Pumpwell Commercial Warehousing Center, Mangalore',
    },
    {
      'label': 'Kodialbail Hall',
      'address': 'Kodialbail Banquet Hall Complex, Mangalore',
    },
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _addressController.dispose();
    _customerNameController.dispose();
    _customerPhoneController.dispose();
    _wageController.dispose();
    _scheduledTimeController.dispose();
    _remarksController.dispose();
    super.dispose();
  }

  Future<void> _submitJob() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    HapticFeedback.mediumImpact();

    final wage = double.tryParse(_wageController.text.trim()) ?? 650.0;
    final title = _titleController.text.trim();
    final address = _addressController.text.trim();
    final customerName = _customerNameController.text.trim();
    final customerPhone = _customerPhoneController.text.trim();
    final scheduledTime = _scheduledTimeController.text.trim();
    final remarks = _remarksController.text.trim();

    // 1. Create and add the job in the worker provider
    final newJob = ref.read(workerJobsProvider.notifier).createAndBroadcastJob(
          title: title,
          category: _selectedCategory,
          customerName: customerName.isNotEmpty ? customerName : 'Direct Employer',
          customerPhone: customerPhone.isNotEmpty ? customerPhone : '+91 99000 00000',
          address: address,
          dailyWage: wage,
          workersNeeded: _workersNeeded,
          scheduledTime: scheduledTime,
          pricingType: _pricingType,
          remarks: remarks.isNotEmpty ? remarks : null,
        );

    NotificationDispatchResult? dispatchResult;

    // 2. If the notification option is enabled, dispatch push notification to Customer App
    if (_notifyCustomerApp) {
      dispatchResult = await CustomerNotificationService().notifyCustomerAppOnJobCreated(
        orderNumber: newJob.orderNumber,
        title: title,
        category: _selectedCategory,
        address: address,
        workersNeeded: _workersNeeded,
        wage: wage,
        scheduledTime: scheduledTime,
        remarks: remarks,
      );
    }

    setState(() => _isSubmitting = false);

    if (!mounted) return;
    Navigator.pop(context); // Close sheet

    // 3. Show confirmation feedback dialog
    _showSuccessDialog(newJob, dispatchResult);
  }

  void _showSuccessDialog(AssignedJob job, NotificationDispatchResult? result) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: WorkerTheme.successGreen.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle, color: WorkerTheme.successGreen, size: 28),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Job Broadcasted!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Job #${job.orderNumber} "${job.title}" has been created and listed on the radar for $_workersNeeded workers.',
              style: const TextStyle(fontSize: 13, color: WorkerTheme.textPrimary),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _notifyCustomerApp ? Colors.blue.shade50 : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: _notifyCustomerApp ? Colors.blue.shade200 : Colors.black12,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        _notifyCustomerApp ? Icons.notifications_active : Icons.notifications_off_outlined,
                        color: _notifyCustomerApp ? Colors.blue.shade800 : Colors.grey,
                        size: 18,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _notifyCustomerApp
                            ? 'FCM PUSH SENT TO CUSTOMER APP'
                            : 'NO PUSH NOTIFICATION REQUESTED',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _notifyCustomerApp ? Colors.blue.shade900 : Colors.black54,
                        ),
                      ),
                    ],
                  ),
                  if (_notifyCustomerApp && result != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      '• Target Channel: ${result.target}',
                      style: const TextStyle(fontSize: 11, color: Colors.black87),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '• Notification Title: ${result.title}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.black87),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '• Message: ${result.body}',
                      style: const TextStyle(fontSize: 10, color: Colors.black54),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: WorkerTheme.primaryRed,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('OK, Got it'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 10, bottom: 6),
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: WorkerTheme.primaryRed.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.add_business, color: WorkerTheme.primaryRed, size: 24),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Create Work Requirement',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Broadcast shifts & notify Customer App in real time',
                        style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Form Body
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Category Dropdown
                  const Text('Manpower Category *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedCategory,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: _categories
                        .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13))))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedCategory = val);
                      }
                    },
                  ),
                  const SizedBox(height: 14),

                  // Job Title
                  const Text('Work Title *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      hintText: 'e.g. Container Unloading & Palletizing',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.work_outline, size: 18),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter a work title' : null,
                  ),
                  const SizedBox(height: 14),

                  // Worksite Location & Quick Hubs
                  const Text('Worksite Location / Address *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _addressController,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Enter complete industrial address, gate number, or landmark',
                      contentPadding: const EdgeInsets.all(12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.location_on_outlined, size: 20),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please specify worksite address' : null,
                  ),
                  const SizedBox(height: 8),
                  const Text('Quick Mangalore Hubs:', style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _quickHubs.map((hub) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ActionChip(
                            label: Text(hub['label']!, style: const TextStyle(fontSize: 11)),
                            avatar: const Icon(Icons.place, size: 14, color: WorkerTheme.primaryRed),
                            backgroundColor: WorkerTheme.primaryYellow.withValues(alpha: 0.15),
                            side: BorderSide(color: WorkerTheme.darkGold.withValues(alpha: 0.3)),
                            onPressed: () {
                              setState(() {
                                _addressController.text = hub['address']!;
                              });
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Workers Needed & Wage Row
                  Row(
                    children: [
                      // Workers Stepper
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Workers Needed *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.black26),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline, size: 20),
                                    onPressed: _workersNeeded > 1
                                        ? () => setState(() => _workersNeeded--)
                                        : null,
                                  ),
                                  Text(
                                    '$_workersNeeded',
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline, size: 20, color: WorkerTheme.primaryRed),
                                    onPressed: () => setState(() => _workersNeeded++),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),

                      // Wage per worker
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Wage / Rate (₹) *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _wageController,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                prefixText: '₹ ',
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              validator: (v) => (v == null || double.tryParse(v) == null) ? 'Enter valid wage' : null,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Shift Timings
                  const Text('Scheduled Shift Timing *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _scheduledTimeController,
                    decoration: InputDecoration(
                      hintText: 'e.g. Today, 02:00 PM - 10:00 PM',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.schedule, size: 18),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter shift timings' : null,
                  ),
                  const SizedBox(height: 14),

                  // Employer / Customer Name & Phone
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Employer / Customer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _customerNameController,
                              decoration: InputDecoration(
                                hintText: 'Company or Name',
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Contact Phone', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _customerPhoneController,
                              keyboardType: TextInputType.phone,
                              decoration: InputDecoration(
                                hintText: '+91 99000 00000',
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Remarks
                  const Text('Special Instructions & Notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _remarksController,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Safety equipment, entry gates, food arrangements...',
                      contentPadding: const EdgeInsets.all(12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ==========================================================
                  // PRIMARY REQUIREMENT: NOTIFY CUSTOMER APP PUSH TOGGLE
                  // ==========================================================
                  Container(
                    decoration: BoxDecoration(
                      color: _notifyCustomerApp ? Colors.red.shade50.withValues(alpha: 0.5) : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _notifyCustomerApp ? WorkerTheme.primaryRed : Colors.black12,
                        width: _notifyCustomerApp ? 1.5 : 1.0,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SwitchListTile(
                          value: _notifyCustomerApp,
                          activeThumbColor: WorkerTheme.primaryRed,
                          activeTrackColor: WorkerTheme.primaryRed.withValues(alpha: 0.4),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                          title: Row(
                            children: [
                              const Text(
                                'Notify Customer App',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: _notifyCustomerApp ? WorkerTheme.primaryRed : Colors.grey,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'FCM PUSH',
                                  style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          subtitle: const Text(
                            'Sends real-time push notification alert to customer app devices upon creation',
                            style: TextStyle(fontSize: 11, color: WorkerTheme.textSecondary),
                          ),
                          onChanged: (val) {
                            setState(() => _notifyCustomerApp = val);
                          },
                        ),

                        if (_notifyCustomerApp) ...[
                          const Divider(height: 1),
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.cell_tower, size: 14, color: WorkerTheme.primaryRed),
                                    SizedBox(width: 6),
                                    Text(
                                      'Target: Customer App (Topic: all_customers)',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: WorkerTheme.primaryRed),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.black12),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.notifications_active, color: WorkerTheme.primaryRed, size: 16),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              '📢 New Work Request Created: #${1048 + ref.watch(workerJobsProvider).radarJobs.length}',
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${_titleController.text.isNotEmpty ? _titleController.text : "Work"} ($_selectedCategory) · $_workersNeeded workers requested at ${_addressController.text.isNotEmpty ? _addressController.text : "worksite"}.',
                                        style: const TextStyle(fontSize: 10, color: Colors.black87),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Submit Button
                  ElevatedButton.icon(
                    onPressed: _isSubmitting ? null : _submitJob,
                    icon: _isSubmitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.send_rounded, size: 20),
                    label: Text(
                      _isSubmitting
                          ? 'Broadcasting...'
                          : (_notifyCustomerApp ? 'Create Job & Notify Customer App' : 'Create Job (No Push)'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: WorkerTheme.primaryRed,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 3,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
