import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../models/location_model.dart';
import '../theme/app_theme.dart';

/// Interactive Location Picker modal sheet allowing customers to choose worksite locations
/// through:
/// 1. Verified Industrial & Commercial Hubs with category filters
/// 2. Instant place/area/pincode search
/// 3. Saved corporate worksites
/// 4. Complete manual address entry with supervisor details (Zero Map & Zero GPS required)
/// 5. Optional live GPS detection fallback
class LocationPickerSheet extends StatefulWidget {
  final WorksiteLocation? initialLocation;
  final List<WorksiteLocation> savedWorksites;
  final ValueChanged<WorksiteLocation>? onSaveNewWorksite;

  const LocationPickerSheet({
    super.key,
    this.initialLocation,
    this.savedWorksites = const [],
    this.onSaveNewWorksite,
  });

  static Future<WorksiteLocation?> show(
    BuildContext context, {
    WorksiteLocation? initialLocation,
    List<WorksiteLocation> savedWorksites = const [],
    ValueChanged<WorksiteLocation>? onSaveNewWorksite,
  }) {
    return showModalBottomSheet<WorksiteLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => LocationPickerSheet(
        initialLocation: initialLocation,
        savedWorksites: savedWorksites,
        onSaveNewWorksite: onSaveNewWorksite,
      ),
    );
  }

  @override
  State<LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<LocationPickerSheet>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();

  // Manual Form Controllers
  final _formKey = GlobalKey<FormState>();
  final _siteNameController = TextEditingController();
  final _plotNumberController = TextEditingController();
  final _streetController = TextEditingController();
  final _areaController = TextEditingController(text: 'Baikampady');
  final _landmarkController = TextEditingController();
  final _cityController = TextEditingController(text: 'Mangalore');
  final _pincodeController = TextEditingController(text: '575011');
  final _supervisorNameController = TextEditingController();
  final _supervisorPhoneController = TextEditingController();
  bool _saveForFuture = true;

  String _selectedCategoryFilter = 'All';
  bool _isFetchingGps = false;

  final List<String> _categories = [
    'All',
    'Industrial',
    'Port',
    'Wholesale',
    'Construction',
    'Commercial',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    if (widget.initialLocation != null) {
      final loc = widget.initialLocation!;
      _siteNameController.text = loc.name;
      _streetController.text = loc.address;
      _areaController.text = loc.area;
      _cityController.text = loc.city;
      _pincodeController.text = loc.pincode;
      _landmarkController.text = loc.landmark ?? '';
      _supervisorNameController.text = loc.contactPerson ?? '';
      _supervisorPhoneController.text = loc.contactPhone ?? '';
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _siteNameController.dispose();
    _plotNumberController.dispose();
    _streetController.dispose();
    _areaController.dispose();
    _landmarkController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    _supervisorNameController.dispose();
    _supervisorPhoneController.dispose();
    super.dispose();
  }

  List<WorksiteLocation> get _filteredHubs {
    final query = _searchController.text.trim().toLowerCase();
    return WorksiteLocation.presetHubs.where((hub) {
      final matchesCategory = _selectedCategoryFilter == 'All' ||
          hub.categoryTag.toLowerCase() == _selectedCategoryFilter.toLowerCase();
      if (!matchesCategory) return false;

      if (query.isEmpty) return true;
      return hub.name.toLowerCase().contains(query) ||
          hub.area.toLowerCase().contains(query) ||
          hub.address.toLowerCase().contains(query) ||
          hub.pincode.contains(query) ||
          (hub.landmark != null && hub.landmark!.toLowerCase().contains(query));
    }).toList();
  }

  Future<void> _fetchDeviceGps() async {
    setState(() => _isFetchingGps = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('⚠️ Device Location (GPS) is disabled. Please enable it in Settings.'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        setState(() => _isFetchingGps = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever ||
          permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('⚠️ Location permission denied. You can pick worksite manually below.'),
              backgroundColor: AppTheme.primaryRed,
            ),
          );
        }
        setState(() => _isFetchingGps = false);
        return;
      }

      Position? position;
      try {
        position = await Geolocator.getLastKnownPosition();
      } catch (_) {}

      position ??= await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 6),
      );

      final gpsLocation = WorksiteLocation(
        id: 'loc-gps-${DateTime.now().millisecondsSinceEpoch}',
        name: 'Live Device GPS Fix',
        address: 'Current Satellite Coordinates (${position.latitude.toStringAsFixed(4)}° N, ${position.longitude.toStringAsFixed(4)}° E)',
        area: 'Live Coordinates',
        city: 'Mangalore',
        pincode: '575001',
        latitude: position.latitude,
        longitude: position.longitude,
        categoryTag: 'GPS',
        landmark: 'Auto-detected by device GPS sensor',
        isGpsAutoDetected: true,
      );

      if (mounted) {
        Navigator.pop(context, gpsLocation);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not fetch GPS: $e. Please pick from list.'),
            backgroundColor: AppTheme.primaryRed,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isFetchingGps = false);
    }
  }

  void _handleManualSubmit() {
    if (!_formKey.currentState!.validate()) return;

    final String name = _siteNameController.text.trim();
    final String plot = _plotNumberController.text.trim();
    final String street = _streetController.text.trim();
    final String area = _areaController.text.trim();
    final String city = _cityController.text.trim();
    final String pincode = _pincodeController.text.trim();
    final String landmark = _landmarkController.text.trim();
    final String contactName = _supervisorNameController.text.trim();
    final String contactPhone = _supervisorPhoneController.text.trim();

    final fullAddress = [
      if (plot.isNotEmpty) plot,
      if (street.isNotEmpty) street,
      if (landmark.isNotEmpty) 'Near $landmark',
      area,
      '$city - $pincode',
    ].join(', ');

    // Approximate center coordinates based on area
    double lat = 12.9141;
    double lng = 74.8560;
    final lowerArea = area.toLowerCase();
    if (lowerArea.contains('baikampady')) {
      lat = 12.9621;
      lng = 74.8214;
    } else if (lowerArea.contains('panambur')) {
      lat = 12.9340;
      lng = 74.8140;
    } else if (lowerArea.contains('surathkal')) {
      lat = 12.9910;
      lng = 74.8080;
    } else if (lowerArea.contains('kottara')) {
      lat = 12.9050;
      lng = 74.8430;
    } else if (lowerArea.contains('yeyyadi')) {
      lat = 12.8985;
      lng = 74.8690;
    } else if (lowerArea.contains('bunder')) {
      lat = 12.8625;
      lng = 74.8390;
    } else if (lowerArea.contains('kadri')) {
      lat = 12.8810;
      lng = 74.8640;
    }

    final newLocation = WorksiteLocation(
      id: 'loc-custom-${DateTime.now().millisecondsSinceEpoch}',
      name: name.isNotEmpty ? name : '$area Worksite',
      address: fullAddress,
      area: area,
      city: city,
      pincode: pincode,
      latitude: lat,
      longitude: lng,
      categoryTag: 'Custom',
      landmark: landmark.isNotEmpty ? landmark : null,
      contactPerson: contactName.isNotEmpty ? contactName : null,
      contactPhone: contactPhone.isNotEmpty ? contactPhone : null,
      isGpsAutoDetected: false,
    );

    if (_saveForFuture && widget.onSaveNewWorksite != null) {
      widget.onSaveNewWorksite!(newLocation);
    }

    Navigator.pop(context, newLocation);
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      padding: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
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
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryRed.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.location_on, color: AppTheme.primaryRed, size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Select Worksite Location',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryText,
                        ),
                      ),
                      Text(
                        'Choose from verified hubs, saved sites, or enter manually',
                        style: TextStyle(fontSize: 11, color: AppTheme.secondaryText),
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

          // Optional Device GPS Quick Strip
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.my_location, color: Color(0xFFB45309), size: 18),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Want device GPS instead?',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF92400E)),
                  ),
                ),
                TextButton(
                  onPressed: _isFetchingGps ? null : _fetchDeviceGps,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: _isFetchingGps
                      ? const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFB45309)),
                        )
                      : const Text(
                          'Use GPS Pin',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB45309),
                            decoration: TextDecoration.underline,
                          ),
                        ),
                ),
              ],
            ),
          ),

          // Tab Bar
          TabBar(
            controller: _tabController,
            labelColor: AppTheme.primaryRed,
            unselectedLabelColor: AppTheme.secondaryText,
            indicatorColor: AppTheme.primaryRed,
            indicatorWeight: 3,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: [
              const Tab(text: 'Verified Hubs'),
              Tab(text: 'Saved Sites (${widget.savedWorksites.length})'),
              const Tab(text: 'Manual Address'),
            ],
          ),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildHubsTab(),
                _buildSavedWorksitesTab(),
                _buildManualEntryTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // TAB 1: VERIFIED WORK HUBS & SEARCH
  // ---------------------------------------------------------------------------
  Widget _buildHubsTab() {
    final hubs = _filteredHubs;

    return Column(
      children: [
        // Search field
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: TextField(
            controller: _searchController,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search by area, landmark, pincode, or hub...',
              prefixIcon: const Icon(Icons.search, color: AppTheme.primaryRed, size: 20),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {});
                      },
                    )
                  : null,
              filled: true,
              fillColor: const Color(0xFFF8F9FA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Colors.black12),
              ),
            ),
          ),
        ),

        // Category Filter Chips
        SizedBox(
          height: 38,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: _categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, idx) {
              final cat = _categories[idx];
              final isSelected = _selectedCategoryFilter == cat;
              return ChoiceChip(
                label: Text(
                  cat == 'All' ? 'All Hubs' : cat,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? Colors.white : AppTheme.primaryText,
                  ),
                ),
                selected: isSelected,
                selectedColor: AppTheme.primaryRed,
                backgroundColor: const Color(0xFFF1F3F5),
                onSelected: (val) {
                  if (val) setState(() => _selectedCategoryFilter = cat);
                },
              );
            },
          ),
        ),
        const SizedBox(height: 8),

        // Result count banner
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${hubs.length} Available Worksites in Mangalore',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.secondaryText),
              ),
              const Text('1-Tap Selection', style: TextStyle(fontSize: 11, color: AppTheme.primaryRed, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        const Divider(height: 16),

        // Hubs List
        Expanded(
          child: hubs.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.location_off_outlined, size: 40, color: Colors.black26),
                      const SizedBox(height: 8),
                      Text('No worksites found for "${_searchController.text}"',
                          style: const TextStyle(color: AppTheme.secondaryText)),
                      const SizedBox(height: 8),
                      TextButton.icon(
                        onPressed: () {
                          _searchController.clear();
                          _tabController.animateTo(2); // Switch to manual tab
                        },
                        icon: const Icon(Icons.edit, size: 16),
                        label: const Text('Enter this address manually'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  itemCount: hubs.length,
                  itemBuilder: (context, idx) {
                    final hub = hubs[idx];
                    return _buildHubCard(hub);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildHubCard(WorksiteLocation hub) {
    IconData categoryIcon = Icons.factory_outlined;
    Color badgeColor = const Color(0xFF2563EB);

    switch (hub.categoryTag.toLowerCase()) {
      case 'port':
        categoryIcon = Icons.directions_boat_outlined;
        badgeColor = const Color(0xFF0D9488);
        break;
      case 'wholesale':
        categoryIcon = Icons.storefront_outlined;
        badgeColor = const Color(0xFFD97706);
        break;
      case 'construction':
        categoryIcon = Icons.construction_outlined;
        badgeColor = const Color(0xFFDC2626);
        break;
      case 'commercial':
        categoryIcon = Icons.business_outlined;
        badgeColor = const Color(0xFF7C3AED);
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0x1F000000)),
      ),
      child: InkWell(
        onTap: () => Navigator.pop(context, hub),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: badgeColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(categoryIcon, color: badgeColor, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                hub.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: badgeColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                hub.categoryTag.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: badgeColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          hub.address,
                          style: const TextStyle(fontSize: 11, color: AppTheme.secondaryText),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (hub.landmark != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.near_me_outlined, size: 12, color: AppTheme.primaryRed),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        hub.landmark!,
                        style: const TextStyle(fontSize: 10, color: AppTheme.primaryRed, fontWeight: FontWeight.w600),
                      ),
                    ),
                    Text(
                      'PIN: ${hub.pincode}',
                      style: const TextStyle(fontSize: 10, color: AppTheme.secondaryText, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // TAB 2: SAVED WORKSITES
  // ---------------------------------------------------------------------------
  Widget _buildSavedWorksitesTab() {
    if (widget.savedWorksites.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.bookmark_border, size: 48, color: Colors.black26),
              const SizedBox(height: 12),
              const Text(
                'No Saved Worksites Yet',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 6),
              const Text(
                'Save your frequent warehouses, construction yards, or docks in the "Manual Address" tab for instant 1-tap bookings.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: AppTheme.secondaryText),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => _tabController.animateTo(2),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Worksite Manually'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryRed,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: widget.savedWorksites.length,
      itemBuilder: (context, idx) {
        final ws = widget.savedWorksites[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0x1F000000)),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.all(12),
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFFFECEE),
              child: Icon(Icons.warehouse, color: AppTheme.primaryRed),
            ),
            title: Text(ws.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 3),
                Text(ws.address, style: const TextStyle(fontSize: 12)),
                if (ws.contactPerson != null) ...[
                  const SizedBox(height: 3),
                  Text(
                    'Supervisor: ${ws.contactPerson} (${ws.contactPhone ?? 'No Phone'})',
                    style: const TextStyle(fontSize: 11, color: AppTheme.primaryRed, fontWeight: FontWeight.w600),
                  ),
                ],
              ],
            ),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.secondaryText),
            onTap: () => Navigator.pop(context, ws),
          ),
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // TAB 3: MANUAL ADDRESS ENTRY (ZERO MAPS / ZERO GPS)
  // ---------------------------------------------------------------------------
  Widget _buildManualEntryTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF86EFAC)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_outline, color: Color(0xFF16A34A), size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Zero Maps Required: Verified local workers in Mangalore are dispatched directly to your written address & supervisor contact.',
                      style: TextStyle(fontSize: 11, color: Color(0xFF166534)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Site / Facility Name
            TextFormField(
              controller: _siteNameController,
              decoration: const InputDecoration(
                labelText: 'Worksite / Facility Name *',
                hintText: 'e.g. Baikampady Warehouse Shed 4 or NMPT Dock 4',
                prefixIcon: Icon(Icons.business_outlined, color: AppTheme.primaryRed, size: 20),
              ),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter a name for this worksite' : null,
            ),
            const SizedBox(height: 12),

            // Plot / Unit / Warehouse number & Street
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    controller: _plotNumberController,
                    decoration: const InputDecoration(
                      labelText: 'Plot / Unit No.',
                      hintText: 'e.g. Plot 42-B',
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 3,
                  child: TextFormField(
                    controller: _streetController,
                    decoration: const InputDecoration(
                      labelText: 'Street / Road *',
                      hintText: 'e.g. Port Road',
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter street' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Area & Landmark
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _areaController,
                    decoration: const InputDecoration(
                      labelText: 'Area / Locality *',
                      hintText: 'e.g. Baikampady',
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter area' : null,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    controller: _landmarkController,
                    decoration: const InputDecoration(
                      labelText: 'Landmark',
                      hintText: 'Near IOCL Pump',
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // City & PIN Code
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(
                      labelText: 'City *',
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Enter city' : null,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    controller: _pincodeController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'PIN Code *',
                      hintText: '575011',
                    ),
                    validator: (v) => (v == null || v.trim().length < 6) ? 'Enter 6-digit PIN' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            const Divider(),
            const Text(
              'On-Site Supervisor Contact (For Worker Gate Entry)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryText),
            ),
            const SizedBox(height: 8),

            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _supervisorNameController,
                    decoration: const InputDecoration(
                      labelText: 'Supervisor Name',
                      hintText: 'e.g. Ganesh Rao',
                      prefixIcon: Icon(Icons.person_outline, size: 20),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    controller: _supervisorPhoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'Mobile Number',
                      hintText: '+91 98800 11223',
                      prefixIcon: Icon(Icons.phone_outlined, size: 20),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Save this worksite for future 1-tap bookings', style: TextStyle(fontSize: 13)),
              value: _saveForFuture,
              activeColor: AppTheme.primaryRed,
              onChanged: (val) => setState(() => _saveForFuture = val ?? true),
            ),
            const SizedBox(height: 14),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _handleManualSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryRed,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Confirm & Use This Worksite', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
