import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Copy,
  Check,
  Search,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Layers,
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
  initialAddress?: string;
  isEmbedded?: boolean;
  title?: string;
}

export const PRESET_HUBS = [
  {
    name: 'Baikampady Industrial Hub (Gate 2)',
    address: 'Baikampady Industrial Area, Mangalore',
    city: 'Mangalore',
    lat: 12.942,
    lng: 74.818,
    landmark: 'Near KIADB Administrative Block',
  },
  {
    name: 'Panambur Container Terminal & Port CFS',
    address: 'New Mangalore Port Corridor, Panambur',
    city: 'Mangalore',
    lat: 12.928,
    lng: 74.809,
    landmark: 'Port Gate 3 / CFS Dock',
  },
  {
    name: 'Mangalore City Central Wholesale Market',
    address: 'Hampankatta Commercial Corridor, Mangalore',
    city: 'Mangalore',
    lat: 12.871,
    lng: 74.843,
    landmark: 'Central Fruit & Logistics Yard',
  },
  {
    name: 'Surathkal & Mukka Logistics Belt',
    address: 'NITK Corridor Highway, Surathkal',
    city: 'Mangalore',
    lat: 13.011,
    lng: 74.793,
    landmark: 'Highway Logistics Depot',
  },
  {
    name: 'Udupi & Manipal Commercial Hub',
    address: 'Tiger Circle & Commercial Hub, Manipal',
    city: 'Udupi',
    lat: 13.341,
    lng: 74.742,
    landmark: 'Manipal Logistics Terminal',
  },
];

export const EmbeddedLocationFetcher: React.FC<EmbeddedLocationFetcherProps> = ({
  onLocationSelected,
  initialAddress = 'Baikampady Industrial Area, Mangalore',
  isEmbedded = false,
  title = 'Embedded Worksite GPS Location Fetcher',
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9141,
    lng: 74.856,
  });
  const [accuracy, setAccuracy] = useState<number>(4.2);
  const [address, setAddress] = useState<string>(initialAddress);
  const [city, setCity] = useState<string>('Mangalore, Karnataka');
  const [isFetchingGps, setIsFetchingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Function to fetch device GPS coordinates
  const fetchLiveLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser or device.');
      return;
    }

    setIsFetchingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAccuracy(acc ? Math.round(acc) : 5);
        setLastUpdated(new Date().toLocaleTimeString());

        // Reverse-geocode or build human-readable address
        const autoAddr = `Live GPS Pin (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E), Industrial Zone, Mangalore`;
        setAddress(autoAddr);
        setCity('Mangalore, Karnataka');
        setIsFetchingGps(false);

        if (onLocationSelected) {
          onLocationSelected({
            latitude,
            longitude,
            accuracy: acc ? Math.round(acc) : 5,
            timestamp: new Date().toISOString(),
            address: autoAddr,
            city: 'Mangalore, Karnataka',
            landmark: 'Device High-Accuracy GPS Sensor',
          });
        }
      },
      (error) => {
        setIsFetchingGps(false);
        // Fallback gracefully without breaking
        setGpsError(
          error.message ||
            'Location permission denied or timed out. Defaulting to Mangalore Industrial Hub coordinates.'
        );
        setCoords({ lat: 12.942, lng: 74.818 });
        setAddress('Baikampady Industrial Hub, Mangalore');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    fetchLiveLocation();
  }, []);

  const handleCopyCoords = () => {
    const text = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPreset = (hub: (typeof PRESET_HUBS)[0]) => {
    setSelectedHub(hub.name);
    setCoords({ lat: hub.lat, lng: hub.lng });
    setAddress(hub.address);
    setCity(hub.city);
    setAccuracy(3);
    setLastUpdated(new Date().toLocaleTimeString());

    if (onLocationSelected) {
      onLocationSelected({
        latitude: hub.lat,
        longitude: hub.lng,
        accuracy: 3,
        timestamp: new Date().toISOString(),
        address: hub.address,
        city: hub.city,
        landmark: hub.landmark,
      });
    }
  };

  const handleConfirmLocation = () => {
    if (onLocationSelected) {
      onLocationSelected({
        latitude: coords.lat,
        longitude: coords.lng,
        accuracy,
        timestamp: new Date().toISOString(),
        address,
        city,
        landmark: selectedHub || 'Custom Map Pin',
      });
    }
  };

  const filteredHubs = PRESET_HUBS.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.landmark.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`bg-white rounded-3xl border border-amber-200/90 shadow-sm overflow-hidden flex flex-col ${
        isEmbedded ? 'p-3' : 'p-5 max-w-2xl mx-auto my-3'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D71920] text-white flex items-center justify-center shadow-xs">
            <Navigation className={`w-4 h-4 ${isFetchingGps ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#202124]">{title}</h3>
            <p className="text-[10px] text-slate-500 font-medium">
              High-Accuracy Worksite Coordinates & Address Resolver
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            GPS Live
          </span>
          <button
            type="button"
            onClick={fetchLiveLocation}
            disabled={isFetchingGps}
            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-[#D71920] rounded-xl border border-amber-200 transition-colors cursor-pointer"
            title="Refresh GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-[#A80F18] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 shrink-0 text-[#D71920]" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Interactive Map Visual Simulation */}
      <div className="relative mt-3 h-44 rounded-2xl overflow-hidden border-2 border-[#FFC928] bg-slate-900 shadow-inner flex items-center justify-center">
        {/* Synthetic Radar Grid Map background */}
        <div
          className="absolute inset-0 opacity-40 bg-[radial-gradient(#FFC928_1px,transparent_1px)] [background-size:16px_16px]"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(255, 201, 40, 0.25) 0%, rgba(215, 25, 32, 0.15) 60%, rgba(15, 23, 42, 0.95) 100%)',
          }}
        />

        {/* Concentric distance radar rings */}
        <div className="absolute w-40 h-40 rounded-full border border-amber-400/30 animate-ping opacity-25" />
        <div className="absolute w-28 h-28 rounded-full border border-amber-400/50" />
        <div className="absolute w-14 h-14 rounded-full border border-red-500/60" />

        {/* Central Crosshair & Pin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <MapPin className="w-8 h-8 text-[#D71920] fill-[#FFC928] drop-shadow-md animate-bounce" />
            <div className="w-2.5 h-1 bg-black/60 rounded-full mx-auto blur-[1px]"></div>
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/60 text-[10px] font-mono text-amber-300 font-bold shadow-lg">
            {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
          </div>
        </div>

        {/* Map Top Overlays */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/20 text-[9px] font-mono text-white font-bold">
            Mangalore Port Zone
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/40 text-[9px] font-mono text-emerald-300 font-bold">
            ±{accuracy}m Accuracy
          </span>
        </div>

        <div className="absolute bottom-2 right-2 z-10">
          <button
            type="button"
            onClick={fetchLiveLocation}
            className="px-2.5 py-1 rounded-xl bg-[#D71920] hover:bg-[#A80F18] text-white text-[10px] font-bold shadow-md flex items-center gap-1 cursor-pointer"
          >
            <Crosshair className="w-3 h-3 text-[#FFC928]" />
            <span>Recenter GPS</span>
          </button>
        </div>
      </div>

      {/* Coordinate & Accuracy Data Panel */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200">
          <span className="text-[10px] text-slate-500 block">Latitude</span>
          <span className="font-mono font-bold text-[#202124]">{coords.lat.toFixed(6)}</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200">
          <span className="text-[10px] text-slate-500 block">Longitude</span>
          <span className="font-mono font-bold text-[#202124]">{coords.lng.toFixed(6)}</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block">Accuracy</span>
            <span className="font-mono font-bold text-emerald-700">±{accuracy} meters</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Copy Coordinates"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Address Form Field */}
      <div className="mt-3 space-y-1">
        <label className="text-[11px] font-bold text-[#202124] flex items-center justify-between">
          <span>Resolved Worksite Address</span>
          <span className="text-[9px] text-slate-400">Updated: {lastUpdated}</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-amber-300 rounded-xl font-bold text-[#202124] focus:outline-none focus:border-[#D71920]"
            placeholder="Type or select a verified worksite location..."
          />
        </div>
      </div>

      {/* Quick Landmark Picker */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#D71920]" />
            <span>Select Industrial Hub Landmark</span>
          </span>
          <span className="text-[9px] text-slate-400">{filteredHubs.length} verified hubs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
          {filteredHubs.map((hub) => {
            const isSelected = selectedHub === hub.name;
            return (
              <button
                key={hub.name}
                type="button"
                onClick={() => handleSelectPreset(hub)}
                className={`p-2 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FFC928]/25 border-2 border-[#D71920] shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202124] text-[11px] truncate">{hub.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#D71920] shrink-0" />}
                </div>
                <p className="text-[9px] text-slate-500 truncate mt-0.5">{hub.landmark}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm Selection CTA */}
      <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-500">
          <span>Coordinates ready for auto-dispatching</span>
        </div>
        <button
          type="button"
          onClick={handleConfirmLocation}
          className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 text-[#FFC928]" />
          <span>Apply This Worksite Location</span>
        </button>
      </div>
    </div>
  );
};
