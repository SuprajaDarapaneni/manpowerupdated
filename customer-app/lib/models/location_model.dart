import 'package:flutter/foundation.dart';

@immutable
class WorksiteLocation {
  final String id;
  final String name;
  final String address;
  final String area;
  final String city;
  final String pincode;
  final double latitude;
  final double longitude;
  final String categoryTag; // 'Industrial', 'Port', 'Wholesale', 'Construction', 'Commercial', 'Custom', 'GPS'
  final String? landmark;
  final String? contactPerson;
  final String? contactPhone;
  final bool isGpsAutoDetected;

  const WorksiteLocation({
    required this.id,
    required this.name,
    required this.address,
    required this.area,
    this.city = 'Mangalore',
    this.pincode = '575011',
    required this.latitude,
    required this.longitude,
    this.categoryTag = 'Industrial',
    this.landmark,
    this.contactPerson,
    this.contactPhone,
    this.isGpsAutoDetected = false,
  });

  WorksiteLocation copyWith({
    String? id,
    String? name,
    String? address,
    String? area,
    String? city,
    String? pincode,
    double? latitude,
    double? longitude,
    String? categoryTag,
    String? landmark,
    String? contactPerson,
    String? contactPhone,
    bool? isGpsAutoDetected,
  }) {
    return WorksiteLocation(
      id: id ?? this.id,
      name: name ?? this.name,
      address: address ?? this.address,
      area: area ?? this.area,
      city: city ?? this.city,
      pincode: pincode ?? this.pincode,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      categoryTag: categoryTag ?? this.categoryTag,
      landmark: landmark ?? this.landmark,
      contactPerson: contactPerson ?? this.contactPerson,
      contactPhone: contactPhone ?? this.contactPhone,
      isGpsAutoDetected: isGpsAutoDetected ?? this.isGpsAutoDetected,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'area': area,
      'city': city,
      'pincode': pincode,
      'latitude': latitude,
      'longitude': longitude,
      'categoryTag': categoryTag,
      'landmark': landmark,
      'contactPerson': contactPerson,
      'contactPhone': contactPhone,
      'isGpsAutoDetected': isGpsAutoDetected,
    };
  }

  factory WorksiteLocation.fromJson(Map<String, dynamic> json) {
    return WorksiteLocation(
      id: json['id'] as String? ?? 'loc-${DateTime.now().millisecondsSinceEpoch}',
      name: json['name'] as String? ?? 'Worksite',
      address: json['address'] as String? ?? '',
      area: json['area'] as String? ?? '',
      city: json['city'] as String? ?? 'Mangalore',
      pincode: json['pincode'] as String? ?? '575011',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 12.9141,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 74.8560,
      categoryTag: json['categoryTag'] as String? ?? 'General',
      landmark: json['landmark'] as String?,
      contactPerson: json['contactPerson'] as String?,
      contactPhone: json['contactPhone'] as String?,
      isGpsAutoDetected: json['isGpsAutoDetected'] as bool? ?? false,
    );
  }

  /// Preset verified hubs for rapid selection without requiring maps or GPS
  static const List<WorksiteLocation> presetHubs = [
    // 🏭 Industrial & Logistics
    WorksiteLocation(
      id: 'hub-ind-1',
      name: 'Baikampady Industrial Estate - Gate 1 & 2',
      address: 'Plot 42, Main Industrial Corridor, Baikampady Industrial Area, Mangalore',
      area: 'Baikampady',
      city: 'Mangalore',
      pincode: '575011',
      latitude: 12.9621,
      longitude: 74.8214,
      categoryTag: 'Industrial',
      landmark: 'Near KSSIDC Administrative Office & IOCL Depot',
    ),
    WorksiteLocation(
      id: 'hub-ind-2',
      name: 'Baikampady Heavy Manufacturing Zone',
      address: 'Industrial Plot 118, Phase II, Baikampady, Mangalore',
      area: 'Baikampady',
      city: 'Mangalore',
      pincode: '575011',
      latitude: 12.9680,
      longitude: 74.8250,
      categoryTag: 'Industrial',
      landmark: 'Opposite KIADB Substation',
    ),
    WorksiteLocation(
      id: 'hub-ind-3',
      name: 'Yeyyadi Industrial Estate',
      address: 'Plot 18, Yeyyadi Industrial Area, Airport Road, Mangalore',
      area: 'Yeyyadi',
      city: 'Mangalore',
      pincode: '575008',
      latitude: 12.8985,
      longitude: 74.8690,
      categoryTag: 'Industrial',
      landmark: 'Near V-Trans Logistics Hub',
    ),
    WorksiteLocation(
      id: 'hub-ind-4',
      name: 'Surathkal Light Industrial Corridor',
      address: 'Near Kana Junction, Surathkal Industrial Belt, Mangalore',
      area: 'Surathkal',
      city: 'Mangalore',
      pincode: '575014',
      latitude: 12.9910,
      longitude: 74.8080,
      categoryTag: 'Industrial',
      landmark: 'Near MRPL Cargo Gate & Kana Church',
    ),

    // 🚢 Port & Cargo Docks
    WorksiteLocation(
      id: 'hub-port-1',
      name: 'Panambur New Mangalore Port - Dock 4',
      address: 'Panambur Port Corridor, Container Berth 4, NMPT, Mangalore',
      area: 'Panambur',
      city: 'Mangalore',
      pincode: '575010',
      latitude: 12.9340,
      longitude: 74.8140,
      categoryTag: 'Port',
      landmark: 'Gate 4 Customs Entry & Container Yard',
    ),
    WorksiteLocation(
      id: 'hub-port-2',
      name: 'Panambur Coal & Bulk Cargo Terminal',
      address: 'Berth 14, Coal & Iron Ore Yard, NMPT, Panambur, Mangalore',
      area: 'Panambur',
      city: 'Mangalore',
      pincode: '575010',
      latitude: 12.9410,
      longitude: 74.8110,
      categoryTag: 'Port',
      landmark: 'Adjacent to NMPT Marine Department',
    ),
    WorksiteLocation(
      id: 'hub-port-3',
      name: 'Bunder Old Port Wharf & Fish Market',
      address: 'Wharf Road, Bunder Port, Mangalore Old Town, Mangalore',
      area: 'Bunder',
      city: 'Mangalore',
      pincode: '575001',
      latitude: 12.8625,
      longitude: 74.8390,
      categoryTag: 'Port',
      landmark: 'Old Customs House & Mechanized Fishing Jetty',
    ),

    // 🛒 Wholesale Markets & APMC
    WorksiteLocation(
      id: 'hub-mkt-1',
      name: 'APMC Agro Yard & Cold Storage Hub',
      address: 'APMC Yard, Shed 7 & 8, Kottara Chowki, Mangalore',
      area: 'Kottara',
      city: 'Mangalore',
      pincode: '575006',
      latitude: 12.9050,
      longitude: 74.8430,
      categoryTag: 'Wholesale',
      landmark: 'Kottara Chowki Flyover & Wholesale Veg Market',
    ),
    WorksiteLocation(
      id: 'hub-mkt-2',
      name: 'Central Goods Shed & Railway Yard',
      address: 'Railway Goods Shed, Near Old Mangalore Central Station, Mangalore',
      area: 'Hampankatta',
      city: 'Mangalore',
      pincode: '575001',
      latitude: 12.8640,
      longitude: 74.8445,
      categoryTag: 'Wholesale',
      landmark: 'Near Southern Railway Parcel Office',
    ),
    WorksiteLocation(
      id: 'hub-mkt-3',
      name: 'Bunder Wholesale Spice & Grocery Mart',
      address: 'Azizuddin Road, Bunder Market, Mangalore',
      area: 'Bunder',
      city: 'Mangalore',
      pincode: '575001',
      latitude: 12.8610,
      longitude: 74.8375,
      categoryTag: 'Wholesale',
      landmark: 'Near Central Warehousing Corporation Depot',
    ),

    // 🏗️ Construction & Infrastructure
    WorksiteLocation(
      id: 'hub-con-1',
      name: 'Derebail High-Rise Project Site',
      address: 'Airport Road, Near Konchady, Derebail, Mangalore',
      area: 'Derebail',
      city: 'Mangalore',
      pincode: '575006',
      latitude: 12.9120,
      longitude: 74.8580,
      categoryTag: 'Construction',
      landmark: 'Near Land Trades Builders Site Gate',
    ),
    WorksiteLocation(
      id: 'hub-con-2',
      name: 'Bejai Commercial Infrastructure Complex',
      address: 'Bejai New Road, Opposite KSRTC Bus Stand, Mangalore',
      area: 'Bejai',
      city: 'Mangalore',
      pincode: '575004',
      latitude: 12.8870,
      longitude: 74.8480,
      categoryTag: 'Construction',
      landmark: 'Near KSRTC Central Bus Depot & Bharat Mall',
    ),
    WorksiteLocation(
      id: 'hub-con-3',
      name: 'Ullal Coastal Logistics & Warehouse Belt',
      address: 'Kotekar Road, Industrial Corridor, Ullal, Mangalore',
      area: 'Ullal',
      city: 'Mangalore',
      pincode: '575020',
      latitude: 12.7950,
      longitude: 74.8620,
      categoryTag: 'Construction',
      landmark: 'Near Someshwar Bypass & Logistics Park',
    ),

    // 🏢 Commercial & City Center
    WorksiteLocation(
      id: 'hub-com-1',
      name: 'Kadri Commercial Center & Event Grounds',
      address: 'Kadri Hills, Mallikatte Road, Mangalore',
      area: 'Kadri',
      city: 'Mangalore',
      pincode: '575002',
      latitude: 12.8810,
      longitude: 74.8640,
      categoryTag: 'Commercial',
      landmark: 'Near Kadri Park & Circuit House',
    ),
    WorksiteLocation(
      id: 'hub-com-2',
      name: 'Hampankatta Business & Banking District',
      address: 'K.S. Rao Road, City Centre Complex, Hampankatta, Mangalore',
      area: 'Hampankatta',
      city: 'Mangalore',
      pincode: '575001',
      latitude: 12.8710,
      longitude: 74.8420,
      categoryTag: 'Commercial',
      landmark: 'City Centre Mall & Navabharath Circle',
    ),
  ];

  static WorksiteLocation get defaultLocation => presetHubs[0];
}
