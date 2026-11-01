import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  ArrowLeft,
  X,
  ArrowUpDown,
  Plus,
  Check,
  Map as MapIcon,
  Navigation,
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
  // Udupi & Bengaluru Search Matchers (Exact to User Attachment Screenshot)
  {
    name: 'Udupi Garden Park',
    address: '17th Main Road, Tavarekere, Aicobo Nagar, 1st Stage, BTM 1st Stage, Bengaluru, Karnataka, India',
    city: 'Bengaluru',
    lat: 12.9182,
    lng: 77.6101,
    landmark: 'BTM 1st Stage Commercial Hub',
    distance: '1.2 km',
    category: 'Commercial Hub',
  },
  {
    name: 'UDUPI GARDEN',
    address: 'Stage 2, BTM, Bengaluru, Karnataka, India',
    city: 'Bengaluru',
    lat: 12.9165,
    lng: 77.6078,
    landmark: 'Ring Road Junction',
    distance: '1.8 km',
    category: 'Transit Depot',
  },
  {
    name: 'Udupi Sri Krishna Bhavan',
    address: 'Balepet, Chickpet, Bengaluru, Karnataka, India',
    city: 'Bengaluru',
    lat: 12.9719,
    lng: 77.5756,
    landmark: 'Wholesale Trade Market',
    distance: '4.5 km',
    category: 'Market & Cargo',
  },
  {
    name: 'Udupi Hotel, Nehru Road',
    address: 'Nehru Road, Venkatamma Layout, Kammanahalli, Bengaluru, Karnataka, India',
    city: 'Bengaluru',
    lat: 13.0098,
    lng: 77.6362,
    landmark: 'Kammanahalli Main Freight Road',
    distance: '6.1 km',
    category: 'Commercial Corridor',
  },
  {
    name: 'Udupi Sri Krishna Matha Temple Square',
    address: 'Car Street, Thenkpete, Maruthi Veethika, Udupi, Karnataka 576101',
    city: 'Udupi',
    lat: 13.3409,
    lng: 74.7563,
    landmark: 'Car Street Commercial Zone',
    distance: '54.0 km',
    category: 'Town Center',
  },
  {
    name: 'Udupi Service Bus Stand & Transit Logistics',
    address: 'KSRTC Road, Near City Bus Stand, Udupi, Karnataka 576101',
    city: 'Udupi',
    lat: 13.3442,
    lng: 74.7478,
    landmark: 'Transit Depot',
    distance: '55.2 km',
    category: 'Logistics Terminal',
  },
  {
    name: 'Malpe Port & Marine Fisheries CFS',
    address: 'Malpe Harbor Road, Udupi, Karnataka 576108',
    city: 'Udupi',
    lat: 13.3512,
    lng: 74.6982,
    landmark: 'Cargo Fish Processing Berths',
    distance: '59.0 km',
    category: 'Port & Cargo',
  },
  // Mangalore Port & Industrial Corridor Hubs (Primary App Operation Zone)
  {
    name: 'Baikampady Industrial Hub (Gate 2)',
    address: 'Baikampady Industrial Area, Mangalore, Karnataka 575011',
    city: 'Mangalore',
    lat: 12.942,
    lng: 74.818,
    landmark: 'Near KIADB Administrative Block',
    distance: '3.2 km',
    category: 'Industrial & Port',
  },
  {
    name: 'Panambur Container Terminal & Port CFS (Gate 4)',
    address: 'New Mangalore Port Trust (NMPT) Dock 4, Panambur, Mangalore, Karnataka 575010',
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
    name: 'Surathkal Cargo & Materials Yard',
    address: 'Surathkal Cargo & Materials Yard, NH 66, Surathkal, Karnataka 575014',
    city: 'Mangalore',
    lat: 13.0076,
    lng: 74.7943,
    landmark: 'NITK Commercial Corridor',
    distance: '11.5 km',
    category: 'Industrial Freight',
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
];

export const EmbeddedLocationFetcher: React.FC<EmbeddedLocationFetcherProps> = ({
  onLocationSelected,
  onClose,
  initialAddress = 'udupi',
  isEmbedded = false,
  title = 'Worksite Location Picker',
}) => {
  // Mode: 'search' (Search Address List) vs 'map' (Interactive Pin-Point Map View)
  const [viewMode, setViewMode] = useState<'search' | 'map'>('search');

  // Input states exactly matching the reference screenshot
  const [searchQuery, setSearchQuery] = useState(initialAddress || 'udupi');
  const [destinationQuery, setDestinationQuery] = useState('');

  // GPS & Map Coordinates
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9182,
    lng: 77.6101,
  });
  const [resolvedAddress, setResolvedAddress] = useState(
    'Udupi Garden Park, 17th Main Road, Tavarekere, Aicobo Nagar, 1st Stage, BTM 1st Stage, Bengaluru, Karnataka, India'
  );
  const [isPanning, setIsPanning] = useState(false);
  const [accuracy, setAccuracy] = useState<number>(4);
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  // Auto-detect GPS on demand
  const fetchLiveLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }
    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAccuracy(acc ? Math.round(acc) : 4);
        const autoAddr = `Live GPS Worksite Pin (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E), Industrial Belt`;
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

  const handleSelectPlace = (place: (typeof VERIFIED_SEARCH_PLACES)[0]) => {
    const fullAddr = `${place.name}, ${place.address}`;
    setCoords({ lat: place.lat, lng: place.lng });
    setResolvedAddress(fullAddr);
    setSearchQuery(place.name);
    // Switch to interactive map for visual pin confirmation (matching video workflow)
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
        city: 'Karnataka, India',
        landmark: 'Confirmed via Worksite GPS Pin',
      });
    }
    if (onClose) {
      onClose();
    }
  };

  // Dynamic filter matching search query (defaults to matching 'udupi' when opened like reference image)
  const filteredPlaces = VERIFIED_SEARCH_PLACES.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`bg-white flex flex-col overflow-hidden text-[#202124] ${
        isEmbedded
          ? 'rounded-2xl'
          : 'w-full max-w-md mx-auto rounded-3xl shadow-2xl border border-slate-200 min-h-[620px]'
      }`}
    >
      {/* ==================================================================== */}
      {/* MODE 1: SEARCH RESULTS VIEW (EXACT MATCH TO ATTACHED SCREENSHOT)      */}
      {/* ==================================================================== */}
      {viewMode === 'search' ? (
        <div className="flex flex-col flex-1 h-full min-h-[620px] bg-white relative">
          {/* Top Bar with Dismiss */}
          <div className="px-4 pt-3 pb-1 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose || (() => {})}
                className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close Location Picker"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <span className="text-xs font-bold text-slate-800">Select Worksite Location</span>
            </div>
            <button
              type="button"
              onClick={fetchLiveLocation}
              disabled={isFetchingGps}
              className="text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
              <span>{isFetchingGps ? 'Locating...' : 'Use Current GPS'}</span>
            </button>
          </div>

          {/* TWO-ROW SEARCH BAR WITH GREEN CIRCLE AND RED SQUARE (EXACT TO REFERENCE) */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Left Route Connectors: Green Circle -> Vertical Dashed Line -> Red Square */}
              <div className="flex flex-col items-center justify-center py-1 self-stretch shrink-0">
                <span className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
                <span className="w-0.5 flex-1 min-h-[22px] border-l-2 border-dashed border-slate-300 my-1" />
                <span className="w-3.5 h-3.5 rounded-xs bg-[#D71920] shadow-2xs" />
              </div>

              {/* Right Input Boxes */}
              <div className="flex-1 space-y-2">
                {/* 1. Worksite / Origin Search Input */}
                <div className="relative flex items-center bg-[#F3F4F6] rounded-xl px-3 py-2 border border-slate-200/60 focus-within:bg-white focus-within:border-teal-600 transition-all">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Worksite address..."
                    className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none pr-12"
                    autoFocus
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Clear"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        // Swap with destination
                        const temp = searchQuery;
                        setSearchQuery(destinationQuery || 'Panambur Container Dock 4, Mangalore');
                        setDestinationQuery(temp);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Swap"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Destination / Worksite Gate Input */}
                <div className="relative flex items-center bg-[#F3F4F6] rounded-xl px-3 py-2 border border-slate-200/60 focus-within:bg-white focus-within:border-teal-600 transition-all">
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="Destination address"
                    className="w-full text-xs font-semibold text-slate-700 placeholder:text-slate-400 bg-transparent focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!destinationQuery) {
                        setDestinationQuery('Gate 4 Entry Point, Mangalore Port CFS');
                      }
                    }}
                    className="absolute right-2.5 p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="Add destination stop"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH RESULT HEADING & CARDS LIST (EXACT TO REFERENCE SCREENSHOT) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2 pb-24">
            <h4 className="text-xs font-bold text-slate-800 tracking-tight mb-2">
              Search Result
            </h4>

            {filteredPlaces.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No matching address found</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tap "Select from Map" below to drop an exact GPS pin on the map.
                </p>
              </div>
            ) : (
              filteredPlaces.map((place) => (
                <button
                  key={place.name}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="w-full bg-white hover:bg-teal-50/40 active:bg-teal-50/70 p-3.5 rounded-2xl border border-slate-200/80 hover:border-teal-400 transition-all text-left flex items-start gap-3 group cursor-pointer shadow-2xs"
                >
                  {/* Teal Circular Pin Badge (Exact to Screenshot) */}
                  <div className="w-8 h-8 rounded-full bg-[#E0F2F1] border border-teal-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4 text-[#00796B]" />
                  </div>

                  {/* Address Text Content */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-teal-900 transition-colors leading-tight line-clamp-1">
                      {place.name}
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                      {place.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                        {place.distance} away
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        • {place.city}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* FLOATING "SELECT FROM MAP" BUTTON (EXACT TO REFERENCE SCREENSHOT) */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center z-20 pointer-events-none">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className="pointer-events-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-[#00796B] font-bold text-xs rounded-full shadow-lg border border-teal-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95 hover:shadow-xl"
            >
              <MapIcon className="w-4 h-4 text-[#00796B]" />
              <span>Select from Map</span>
            </button>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* MODE 2: INTERACTIVE PIN-POINT MAP VIEW (EXACT TO VIDEO DEMO)          */
        /* ==================================================================== */
        <div className="relative flex flex-col flex-1 h-[620px] bg-slate-900 overflow-hidden">
          {/* Top Address Bar over Map */}
          <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('search')}
              className="p-2.5 rounded-xl bg-white shadow-md text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title="Back to Search Results"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={resolvedAddress}
                onChange={(e) => setResolvedAddress(e.target.value)}
                placeholder="Search location on map..."
                className="w-full pl-9 pr-4 py-2.5 bg-white text-slate-900 text-xs font-semibold rounded-xl shadow-md border border-slate-200 focus:outline-none focus:border-teal-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Simulated Pannable Map Surface */}
          <div
            onMouseDown={() => setIsPanning(true)}
            onMouseUp={() => setIsPanning(false)}
            onTouchStart={() => setIsPanning(true)}
            onTouchEnd={() => setIsPanning(false)}
            onClick={(e) => {
              // Click to reposition pin
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const newLat = coords.lat + (y / rect.height - 0.5) * 0.01;
              const newLng = coords.lng + (x / rect.width - 0.5) * 0.01;
              setCoords({ lat: parseFloat(newLat.toFixed(6)), lng: parseFloat(newLng.toFixed(6)) });
              setResolvedAddress(
                `Worksite GPS Pin (${newLat.toFixed(4)}° N, ${newLng.toFixed(4)}° E), Industrial Zone`
              );
            }}
            className="flex-1 relative cursor-grab active:cursor-grabbing select-none"
            style={{
              backgroundColor: '#1E232A',
              backgroundImage:
                'radial-gradient(#3B4252 1.5px, transparent 1.5px), radial-gradient(#2E3440 1.5px, #1E232A 1.5px)',
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px',
            }}
          >
            {/* Visual Vector Road Corridors */}
            <svg
              className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0 100 Q 150 140 250 80 T 450 120"
                stroke="#FFC928"
                strokeWidth="8"
                fill="none"
                strokeDasharray="6 4"
              />
              <path
                d="M 80 0 Q 120 200 180 350 T 320 500"
                stroke="#4C566A"
                strokeWidth="12"
                fill="none"
              />
              <path
                d="M 220 0 Q 240 180 290 320 T 400 480"
                stroke="#5E81AC"
                strokeWidth="16"
                fill="none"
                opacity="0.5"
              />
            </svg>

            {/* Radar wave ping */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-teal-400/20 animate-ping opacity-25 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-teal-400/40 pointer-events-none" />

            {/* FLOATING CENTER MAP PIN (EXACT TO VIDEO DEMO) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center pointer-events-none -mt-2">
              <div
                className={`px-3 py-1 rounded-full text-[11px] font-black shadow-lg transition-all mb-1 border ${
                  isPanning
                    ? 'bg-[#FFC928] text-slate-900 border-amber-400 scale-110'
                    : 'bg-[#D71920] text-white border-red-400 scale-100'
                }`}
              >
                {isPanning ? '📍 Pick me here' : '✓ Confirm'}
              </div>

              <div className="relative">
                <MapPin className="w-10 h-10 text-[#D71920] fill-[#FFC928] drop-shadow-xl filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)]" />
              </div>
              <div className="w-3 h-1.5 bg-black/80 rounded-full blur-[1px] mt-0.5" />
            </div>

            {/* Live GPS Re-center Button */}
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

          {/* BOTTOM SHEET FOR CONFIRMATION (MATCHING VIDEO DEMO) */}
          <div className="bg-white rounded-t-3xl p-4 border-t border-slate-200 shadow-2xl z-30 space-y-3">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto -mt-1" />

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-[#00796B]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  Resolved Worksite Address
                </span>
                <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {resolvedAddress}
                </p>
                <span className="text-[10px] text-teal-800 font-mono block mt-0.5 font-semibold">
                  Lat: {coords.lat.toFixed(4)}° N, Lng: {coords.lng.toFixed(4)}° E • ±{accuracy}m GPS
                </span>
              </div>
            </div>

            {/* Confirm Button */}
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
