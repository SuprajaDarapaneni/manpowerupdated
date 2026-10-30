import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Copy,
  Check,
  Search,
  Crosshair,
  ArrowLeft,
  X,
  ArrowUpDown,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Map as MapIcon,
} from 'lucide-react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: string;
  address: string;
  city: string;
  zoneName?: string;
  landmark?: string;
}

interface EmbeddedLocationFetcherProps {
  onLocationSelected?: (location: LocationData) => void;
  onClose?: () => void;
  initialAddress?: string;
  isEmbedded?: boolean;
  title?: string;
}

export const VERIFIED_SEARCH_PLACES = [
  {
    name: 'Baikampady Industrial Hub (Gate 2)',
    address: 'Baikampady Industrial Area, Mangalore',
    city: 'Mangalore',
    lat: 12.942,
    lng: 74.818,
    landmark: 'Near KIADB Administrative Block',
    distance: '3.2 km',
    category: 'Industrial & Port',
  },
  {
    name: 'Panambur Container Terminal & Port CFS (Gate 4)',
    address: 'New Mangalore Port Trust (NMPT) Dock 4, Panambur',
    city: 'Mangalore',
    lat: 12.928,
    lng: 74.809,
    landmark: 'Port Gate 4 / Container Freight Station',
    distance: '4.8 km',
    category: 'Logistics & Cargo',
  },
  {
    name: 'Mangalore Central Bus Stand (KSRTC Terminal)',
    address: 'Bejai Main Road, Mangalore, Karnataka 575004',
    city: 'Mangalore',
    lat: 12.8797,
    lng: 74.8468,
    landmark: 'Opposite KSRTC Division Office',
    distance: '1.5 km',
    category: 'Transit & Town',
  },
  {
    name: 'Bantwal Commercial & Freight Corridor',
    address: 'B.C. Road, Bantwal, Karnataka 574211',
    city: 'Bantwal',
    lat: 12.8931,
    lng: 75.0347,
    landmark: 'National Highway 73 Junction',
    distance: '18.4 km',
    category: 'Freight Belt',
  },
  {
    name: 'Dharmasthala / Ujire Pilgrimage Hub',
    address: 'Temple Town Commercial Area, Dharmasthala',
    city: 'Belthangady',
    lat: 12.9567,
    lng: 75.3789,
    landmark: 'Main Gate Complex',
    distance: '42.0 km',
    category: 'Commercial Belt',
  },
  {
    name: 'Surathkal & Mukka Industrial Logistics Belt',
    address: 'NITK Corridor Highway, Surathkal',
    city: 'Mangalore',
    lat: 13.011,
    lng: 74.793,
    landmark: 'Near Highway Freight Depot',
    distance: '11.5 km',
    category: 'Industrial',
  },
  {
    name: 'Udupi & Manipal Commercial Hub',
    address: 'Tiger Circle & Commercial Hub, Manipal',
    city: 'Udupi',
    lat: 13.341,
    lng: 74.742,
    landmark: 'Manipal Logistics Terminal',
    distance: '55.0 km',
    category: 'Commercial',
  },
  {
    name: 'Hampankatta Central Wholesale Market',
    address: 'Hampankatta Commercial Corridor, Mangalore',
    city: 'Mangalore',
    lat: 12.871,
    lng: 74.843,
    landmark: 'Central Fruit & Logistics Yard',
    distance: '2.1 km',
    category: 'Marketplace',
  },
];

export const EmbeddedLocationFetcher: React.FC<EmbeddedLocationFetcherProps> = ({
  onLocationSelected,
  onClose,
  initialAddress = 'Baikampady Industrial Hub, Mangalore',
  isEmbedded = false,
  title = 'Worksite Location Picker',
}) => {
  // Mode: 'search' (Search Address Mode) vs 'map' (Interactive Pin-Point Map Mode)
  // Matching the ride-hailing/MongoRide video flow
  const [viewMode, setViewMode] = useState<'search' | 'map'>('search');

  // Search input state
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [selectedChip, setSelectedChip] = useState<'worksite' | 'warehouse' | 'port' | 'others'>('worksite');

  // GPS & Map State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.928,
    lng: 74.809,
  });
  const [resolvedAddress, setResolvedAddress] = useState(initialAddress);
  const [isPanning, setIsPanning] = useState(false);
  const [accuracy, setAccuracy] = useState<number>(4);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Auto-detect GPS on mount
  const fetchLiveLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser or device.');
      return;
    }

    setIsFetchingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAccuracy(acc ? Math.round(acc) : 4);
        const autoAddr = `Live GPS Pin (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E), Industrial Zone, Mangalore`;
        setResolvedAddress(autoAddr);
        setSearchQuery(autoAddr);
        setIsFetchingGps(false);
      },
      () => {
        setIsFetchingGps(false);
        setCoords({ lat: 12.928, lng: 74.809 });
        setResolvedAddress('Panambur Container Terminal & Port CFS (Gate 4), Mangalore');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    fetchLiveLocation();
  }, []);

  const handleSelectPlace = (place: (typeof VERIFIED_SEARCH_PLACES)[0]) => {
    setCoords({ lat: place.lat, lng: place.lng });
    setResolvedAddress(`${place.name}, ${place.address}`);
    setSearchQuery(`${place.name}, ${place.address}`);
    setViewMode('map');
  };

  const handleConfirm = () => {
    if (onLocationSelected) {
      onLocationSelected({
        latitude: coords.lat,
        longitude: coords.lng,
        accuracy,
        timestamp: new Date().toISOString(),
        address: resolvedAddress || searchQuery,
        city: 'Mangalore, Karnataka',
        landmark: 'Confirmed via Worksite GPS Pin',
      });
    }
    if (onClose) {
      onClose();
    }
  };

  // Filtered places matching search query
  const filteredPlaces = VERIFIED_SEARCH_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`bg-white flex flex-col overflow-hidden text-[#202124] ${isEmbedded ? 'rounded-2xl' : 'w-full max-w-md mx-auto rounded-3xl shadow-2xl border border-slate-200 min-h-[580px]'}`}>
      {/* ==================================================================== */}
      {/* MODE 1: SEARCH PLACES SCREEN (EXACT TO VIDEO 0:00 - 0:25)           */}
      {/* ==================================================================== */}
      {viewMode === 'search' ? (
        <div className="flex flex-col flex-1 h-full min-h-[580px] bg-slate-50">
          {/* Top Bar with Back Arrow */}
          <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose || (() => {})}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#202124] transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 text-[#202124]" />
              </button>
              <h3 className="text-sm font-bold text-[#202124]">Search Worksite Location</h3>
            </div>
            <button
              type="button"
              onClick={fetchLiveLocation}
              disabled={isFetchingGps}
              className="text-[11px] font-bold text-[#D71920] bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Crosshair className={`w-3 h-3 ${isFetchingGps ? 'animate-spin' : ''}`} />
              <span>{isFetchingGps ? 'Locating...' : 'Live GPS'}</span>
            </button>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {/* Search Input Card */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter worksite, dock, or project address..."
                    className="w-full text-xs font-semibold text-[#202124] bg-transparent focus:outline-none pr-6"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Quick swap simulation
                    setSearchQuery('Panambur Container Terminal & Port CFS (Gate 4)');
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                  title="Swap destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Preset Filter Chips */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto pb-0.5">
                {[
                  { id: 'worksite', label: '+ Worksite' },
                  { id: 'warehouse', label: '+ Warehouse' },
                  { id: 'port', label: '+ Port / Cargo' },
                  { id: 'others', label: '+ Others' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setSelectedChip(chip.id as any);
                      if (chip.id === 'warehouse') setSearchQuery('Baikampady Industrial Hub');
                      if (chip.id === 'port') setSearchQuery('Panambur Port Terminal');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedChip === chip.id
                        ? 'bg-[#FFC928] text-[#202124] shadow-2xs border border-amber-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent / Search Routes Header */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Verified Industrial & Transit Routes
                </span>
                <span className="text-[10px] text-[#D71920] font-bold">Auto-Geofenced</span>
              </div>

              {/* Search places list items */}
              <div className="space-y-1.5">
                {filteredPlaces.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl text-center border border-slate-200">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No matching place found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tap "Select from Map" below to drop a pin anywhere on the live GPS map.
                    </p>
                  </div>
                ) : (
                  filteredPlaces.map((place) => (
                    <button
                      key={place.name}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="w-full bg-white hover:bg-amber-50/60 p-3 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition-all text-left flex items-start justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#FFC928]/30 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <MapPin className="w-4 h-4 text-[#D71920]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#202124] group-hover:text-[#D71920] transition-colors leading-snug">
                            {place.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {place.address}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {place.distance} away
                            </span>
                            <span className="text-[9px] text-slate-400">
                              • {place.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#D71920] group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Button: SELECT FROM MAP (Video 0:15) */}
          <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20 shadow-lg">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className="w-full py-3 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
            >
              <MapIcon className="w-4 h-4 text-[#D71920]" />
              <span>🗺️ Select from Map (Pin-Point Mode)</span>
            </button>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* MODE 2: INTERACTIVE PIN POINT MAP VIEW (EXACT TO VIDEO 0:25 - 0:52)  */
        /* ==================================================================== */
        <div className="relative flex flex-col flex-1 h-[580px] bg-slate-900 overflow-hidden">
          {/* Top Search Bar on Map */}
          <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('search')}
              className="p-2.5 rounded-xl bg-white shadow-md text-[#202124] hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title="Back to Search"
            >
              <ArrowLeft className="w-4 h-4 text-[#202124]" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={resolvedAddress}
                onChange={(e) => setResolvedAddress(e.target.value)}
                placeholder="Search places..."
                className="w-full pl-9 pr-4 py-2.5 bg-white text-[#202124] text-xs font-semibold rounded-xl shadow-md border border-slate-200 focus:outline-none focus:border-[#D71920]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Interactive Simulated Map Canvas with Pannable Background */}
          <div
            onMouseDown={() => setIsPanning(true)}
            onMouseUp={() => setIsPanning(false)}
            onTouchStart={() => setIsPanning(true)}
            onTouchEnd={() => setIsPanning(false)}
            className="flex-1 relative cursor-grab active:cursor-grabbing select-none"
            style={{
              backgroundColor: '#1E232A',
              backgroundImage:
                'radial-gradient(#3B4252 1.5px, transparent 1.5px), radial-gradient(#2E3440 1.5px, #1E232A 1.5px)',
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px',
            }}
          >
            {/* Visual Road and Water Arteries simulation for Mangalore Coast */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 100 Q 150 140 250 80 T 450 120" stroke="#FFC928" strokeWidth="8" fill="none" strokeDasharray="6 4" />
              <path d="M 80 0 Q 120 200 180 350 T 320 500" stroke="#4C566A" strokeWidth="12" fill="none" />
              <path d="M 220 0 Q 240 180 290 320 T 400 480" stroke="#5E81AC" strokeWidth="16" fill="none" opacity="0.4" />
            </svg>

            {/* Radar Distance Wave Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-amber-400/20 animate-ping opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-amber-400/40 pointer-events-none" />

            {/* FLOATING CENTRAL MAP PIN WITH DYNAMIC TOOLTIP (Exact to Video) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center pointer-events-none -mt-2">
              {/* Tooltip bubble: 'Pick me here' while dragging, 'Confirm' when stationary */}
              <div
                className={`px-3 py-1 rounded-full text-[11px] font-black shadow-lg transition-all mb-1 border ${
                  isPanning
                    ? 'bg-[#FFC928] text-[#202124] border-amber-400 scale-110'
                    : 'bg-[#D71920] text-white border-red-400 scale-100'
                }`}
              >
                {isPanning ? '📍 Pick me here' : '✓ Confirm'}
              </div>

              {/* Pin Icon with Drop Shadow */}
              <div className="relative">
                <MapPin className="w-10 h-10 text-[#D71920] fill-[#FFC928] drop-shadow-xl filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)]" />
              </div>
              <div className="w-3 h-1.5 bg-black/80 rounded-full blur-[1px] mt-0.5" />
            </div>

            {/* Top Right Map Overlay: Geofence Badge */}
            <div className="absolute top-16 right-3 z-20 flex flex-col items-end gap-1 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/20 text-[9px] font-mono text-amber-300 font-bold">
                Mangalore Port Geofence
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/40 text-[9px] font-mono text-emerald-300 font-bold">
                ±{accuracy}m GPS Accuracy
              </span>
            </div>

            {/* Floating GPS Target Locate Button (Bottom Right above bottom sheet) */}
            <button
              type="button"
              onClick={fetchLiveLocation}
              disabled={isFetchingGps}
              className="absolute bottom-40 right-4 z-20 w-11 h-11 rounded-full bg-white hover:bg-slate-50 text-[#D71920] shadow-xl border border-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Target My Current Live GPS Location"
            >
              <Crosshair className={`w-5 h-5 ${isFetchingGps ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* BOTTOM SHEET FOR RESOLVED ADDRESS & CONFIRMATION (Video 0:38 - 0:52) */}
          <div className="bg-white rounded-t-3xl p-4 border-t border-slate-200 shadow-2xl z-30 space-y-3">
            {/* Grab handle indicator */}
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto -mt-1" />

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-[#D71920]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  Resolved Worksite Address
                </span>
                <p className="text-xs font-bold text-[#202124] line-clamp-2 leading-snug">
                  {resolvedAddress}
                </p>
                <span className="text-[10px] text-emerald-700 font-mono block mt-0.5 font-semibold">
                  Lat: {coords.lat.toFixed(4)}° N, Lng: {coords.lng.toFixed(4)}° E
                </span>
              </div>
            </div>

            {/* PRIMARY CONFIRM BUTTON */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3.5 bg-linear-to-r from-[#D71920] via-[#C6171E] to-[#A80F18] hover:from-[#A80F18] hover:to-[#8E0C14] text-white font-black text-xs rounded-2xl shadow-md border-2 border-[#FFC928] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 text-[#FFC928]" />
              <span>Confirm Worksite Location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
