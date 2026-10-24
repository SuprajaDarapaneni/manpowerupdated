import React, { useState, useEffect } from 'react';
import {
  MapPin,
  DollarSign,
  Layers,
  Plus,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Code,
  Sliders,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { ServiceZone, ZoneCategoryPrice, ServiceCategory, OtpVerificationSettings } from '../../types';
import { dataService } from '../../services/storage';

interface ZonePricingViewProps {
  initialOtpSettings?: OtpVerificationSettings;
}

export const ZonePricingView: React.FC<ZonePricingViewProps> = ({ initialOtpSettings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'set-price' | 'zones' | 'rules' | 'mongoride'>('set-price');

  // Reactive state from dataService
  const [zones, setZones] = useState<ServiceZone[]>(() => dataService.getServiceZones());
  const [prices, setPrices] = useState<ZoneCategoryPrice[]>(() => dataService.getZoneCategoryPrices());
  const [categories, setCategories] = useState<ServiceCategory[]>(() => dataService.getCategories());
  const [otpSettings, setOtpSettings] = useState<OtpVerificationSettings>(() =>
    initialOtpSettings || dataService.getOtpSettings()
  );

  // Form State for Set Price
  const [selectedZoneId, setSelectedZoneId] = useState<string>(() => zones[0]?.id || 'zone-1');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => categories[0]?.id || 'cat-1');
  const [hourlyRate, setHourlyRate] = useState<number>(280);
  const [fullDayRate, setFullDayRate] = useState<number>(2200);
  const [halfDayRate, setHalfDayRate] = useState<number>(1200);
  const [lumpSumBasePrice, setLumpSumBasePrice] = useState<number>(8000);
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState<number>(350);
  const [nightShiftAllowance, setNightShiftAllowance] = useState<number>(250);
  const [platformCommissionPercent, setPlatformCommissionPercent] = useState<number>(10);
  const [minWorkerWalletBalance, setMinWorkerWalletBalance] = useState<number>(150);

  // Filter / Search for Table
  const [tableFilterZone, setTableFilterZone] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddZoneModal, setShowAddZoneModal] = useState<boolean>(false);
  const [showCloneModal, setShowCloneModal] = useState<boolean>(false);
  const [cloneSourceZoneId, setCloneSourceZoneId] = useState<string>(zones[0]?.id || '');
  const [cloneTargetZoneId, setCloneTargetZoneId] = useState<string>(zones[1]?.id || '');

  // Add Zone Form State
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCode, setNewZoneCode] = useState('');
  const [newZoneCity, setNewZoneCity] = useState('Mangalore');
  const [newZonePincodes, setNewZonePincodes] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(12);
  const [newZoneDesc, setNewZoneDesc] = useState('');

  // Subscribe to storage
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setZones(dataService.getServiceZones());
      setPrices(dataService.getZoneCategoryPrices());
      setCategories(dataService.getCategories());
      setOtpSettings(dataService.getOtpSettings());
    });
    return unsub;
  }, []);

  // Sync price form when selected zone or category changes
  useEffect(() => {
    const existing = dataService.getPriceForZoneAndCategory(selectedZoneId, selectedCategoryId);
    if (existing) {
      setHourlyRate(existing.hourlyRate);
      setFullDayRate(existing.fullDayRate);
      setHalfDayRate(existing.halfDayRate);
      setLumpSumBasePrice(existing.lumpSumBasePrice || 8000);
      setOvertimeHourlyRate(existing.overtimeHourlyRate || 350);
      setNightShiftAllowance(existing.nightShiftAllowance || 250);
      setPlatformCommissionPercent(existing.platformCommissionPercent || 10);
      setMinWorkerWalletBalance(existing.minWorkerWalletBalance || 150);
    } else {
      // Find category default as starting point
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (cat) {
        setHourlyRate(cat.hourlyRate || 250);
        setFullDayRate(cat.fullDayRate || 2000);
        setHalfDayRate(cat.halfDayRate || 1100);
        setLumpSumBasePrice(cat.minPrice ? cat.minPrice * 4 : 7500);
        setOvertimeHourlyRate(Math.round((cat.hourlyRate || 250) * (cat.overtimeMultiplier || 1.5)));
        setNightShiftAllowance(200);
        setPlatformCommissionPercent(10);
        setMinWorkerWalletBalance(150);
      }
    }
  }, [selectedZoneId, selectedCategoryId, categories]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save Price for Selected Zone and Category
  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const zone = zones.find((z) => z.id === selectedZoneId);
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (!zone || !cat) return;

    dataService.setPriceForZoneCategory({
      zoneId: zone.id,
      zoneName: zone.name,
      categoryId: cat.id,
      categoryName: cat.name,
      hourlyRate,
      fullDayRate,
      halfDayRate,
      lumpSumBasePrice,
      overtimeHourlyRate,
      nightShiftAllowance,
      platformCommissionPercent,
      minWorkerWalletBalance,
    });

    showToast(`✓ Price successfully saved for "${cat.name}" in Zone "${zone.name}"!`);
  };

  // Add New Zone
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneCode.trim()) {
      alert('Please provide Zone Name and Code.');
      return;
    }

    const pincodeArr = newZonePincodes
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const created = dataService.addServiceZone({
      name: newZoneName.trim(),
      code: newZoneCode.trim().toUpperCase(),
      city: newZoneCity.trim() || 'Mangalore',
      state: 'Karnataka',
      description: newZoneDesc.trim() || 'Commercial and industrial service zone.',
      pincodes: pincodeArr.length > 0 ? pincodeArr : ['575001'],
      geofenceRadiusKm: Number(newZoneRadius) || 12,
      centerCoordinates: { lat: 12.914, lng: 74.856 },
      isActive: true,
      surgeMultiplier: 1.0,
    });

    // Automatically clone baseline prices to this new zone from the first zone
    if (zones[0]) {
      dataService.clonePricesToZone(zones[0].id, created.id);
    }

    setShowAddZoneModal(false);
    setNewZoneName('');
    setNewZoneCode('');
    setNewZonePincodes('');
    setNewZoneDesc('');
    setSelectedZoneId(created.id);
    showToast(`✓ Zone "${created.name}" created with default category pricing!`);
  };

  // Clone Prices
  const handleClonePrices = () => {
    if (!cloneSourceZoneId || !cloneTargetZoneId || cloneSourceZoneId === cloneTargetZoneId) {
      alert('Please select two distinct zones to clone prices.');
      return;
    }
    const count = dataService.clonePricesToZone(cloneSourceZoneId, cloneTargetZoneId);
    setShowCloneModal(false);
    showToast(`✓ Cloned ${count} category rates to target zone successfully!`);
  };

  // Filtered pricing rows
  const filteredPrices = prices.filter((p) => {
    const matchesZone = tableFilterZone === 'all' || p.zoneId === tableFilterZone;
    const matchesSearch =
      tableSearch === '' ||
      p.zoneName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesZone && matchesSearch;
  });

  return (
    <div className="space-y-6 antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#D71920] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#FFC928] animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#FFC928]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner with Sub-Tab Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#202124]/10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D71920] text-white flex items-center justify-center font-black shadow-xs">
                <MapPin className="w-4 h-4 text-[#FFC928]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
                Service Zones & Zone Pricing
              </h1>
            </div>
            <p className="text-xs text-[#686868] mt-1">
              Configure independent hourly, shift, and package rates per geographic zone. Ready for MongoRide backend integration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddZoneModal(true)}
              className="px-3.5 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-[#FFC928]"
            >
              <Plus className="w-4 h-4 text-[#FFC928]" />
              <span>+ Add Service Zone</span>
            </button>
            <button
              onClick={() => setShowCloneModal(true)}
              className="px-3.5 py-2 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#D71920]" />
              <span>Clone Zone Rates</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('set-price')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'set-price'
                ? 'bg-[#D71920] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#FFC928]" />
            <span>1. Set Price Page (Zone Matrix)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('zones')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'zones'
                ? 'bg-[#D71920] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#FFC928]" />
            <span>2. Manage Service Zones ({zones.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'rules'
                ? 'bg-[#D71920] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#FFC928]" />
            <span>3. Matching & OTP Rules</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mongoride')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'mongoride'
                ? 'bg-[#202124] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#202124] hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4 text-emerald-400" />
            <span>4. MongoRide Integration Schema</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SET PRICE PAGE (Select Zone -> Select Category -> Set Price) */}
      {/* ========================================================================= */}
      {activeSubTab === 'set-price' && (
        <div className="space-y-6">
          {/* Visual Step-by-Step Set Price Form Card */}
          <div className="bg-white rounded-3xl border-2 border-[#FFC928]/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#D71920] text-white font-extrabold flex items-center justify-center text-xs">
                  ₹
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#202124]">
                    Set Price by Zone & Service Category
                  </h3>
                  <p className="text-xs text-[#686868]">
                    Each zone has independent pricing. Select the target zone, pick the category, and set competitive rates.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFC928]/30 text-[#A80F18] border border-[#FFC928]/50">
                Live Pricing Sync
              </span>
            </div>

            <form onSubmit={handleSavePrice} className="mt-5 space-y-6">
              {/* Step 1 & Step 2 Row: Select Zone & Select Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1: Select Zone */}
                <div className="p-4 bg-[#FFFDF8] rounded-2xl border border-amber-200 space-y-2">
                  <label className="flex items-center justify-between text-xs font-extrabold text-[#202124]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#D71920] text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>Select Service Zone:</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {zones.find((z) => z.id === selectedZoneId)?.code}
                    </span>
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#202124]/15 rounded-xl font-bold text-xs text-[#202124] focus:outline-none focus:border-[#D71920] cursor-pointer"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        📍 {z.name} ({z.city} - {z.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#686868]">
                    {zones.find((z) => z.id === selectedZoneId)?.description}
                  </p>
                </div>

                {/* Step 2: Select Category */}
                <div className="p-4 bg-[#FFFDF8] rounded-2xl border border-amber-200 space-y-2">
                  <label className="flex items-center justify-between text-xs font-extrabold text-[#202124]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#D71920] text-white flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Select Service Category:</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {categories.find((c) => c.id === selectedCategoryId)?.slug}
                    </span>
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#202124]/15 rounded-xl font-bold text-xs text-[#202124] focus:outline-none focus:border-[#D71920] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        ⚡ {c.name} (Base: ₹{c.fullDayRate}/day)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#686868]">
                    {categories.find((c) => c.id === selectedCategoryId)?.description}
                  </p>
                </div>
              </div>

              {/* Step 3: Set Price Inputs */}
              <div className="p-5 bg-amber-50/40 rounded-2xl border-2 border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#202124] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#D71920] text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Set Rates for {zones.find((z) => z.id === selectedZoneId)?.name}:</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#A80F18]">
                    Category: {categories.find((c) => c.id === selectedCategoryId)?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* Hourly Rate */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Hourly Rate (₹ / hr)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={50}
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">Min 1 hr clocked billing</span>
                  </div>

                  {/* Full Day 8-Hr Rate */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Full Day Shift (8 hrs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={500}
                        value={fullDayRate}
                        onChange={(e) => setFullDayRate(Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">Standard worker day wage</span>
                  </div>

                  {/* Half Day 4-Hr Rate */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Half Day Shift (4 hrs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={300}
                        value={halfDayRate}
                        onChange={(e) => setHalfDayRate(Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">4 hours morning/afternoon</span>
                  </div>

                  {/* Lump Sum / Turnkey Base Price */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Lump Sum / Project Base
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={1000}
                        value={lumpSumBasePrice}
                        onChange={(e) => setLumpSumBasePrice(Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">Package baseline price</span>
                  </div>

                  {/* Overtime Rate */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Overtime Hourly (₹ / hr)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={50}
                        value={overtimeHourlyRate}
                        onChange={(e) => setOvertimeHourlyRate(Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">Applied after 8 shift hours</span>
                  </div>

                  {/* Night Shift Allowance */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Night Shift Bonus (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={nightShiftAllowance}
                        onChange={(e) => setNightShiftAllowance(Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">Shifts starting 8PM - 5AM</span>
                  </div>

                  {/* Platform Commission % */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Platform Fee (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={platformCommissionPercent}
                        onChange={(e) => setPlatformCommissionPercent(Number(e.target.value))}
                        className="w-full pl-3 pr-6 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        %
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 block">Auto-debited from wallet</span>
                  </div>

                  {/* Min Worker Wallet Balance */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="text-[11px] font-bold text-[#202124] block">
                      Min Wallet for Worker
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={minWorkerWalletBalance}
                        onChange={(e) => setMinWorkerWalletBalance(Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D71920]"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">Prepaid threshold to bid</span>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-[#686868]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    When customer selects this zone, these exact prices will populate in Customer App & Flutter backend.
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer border border-[#FFC928]"
                >
                  Save & Publish Zone Price
                </button>
              </div>
            </form>
          </div>

          {/* Zone Pricing Matrix Data Table */}
          <div className="bg-white rounded-3xl border border-[#202124]/10 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#202124]">
                  Active Zone Pricing Matrix ({filteredPrices.length} configurations)
                </h3>
                <p className="text-[11px] text-[#686868]">
                  Live rates currently enforced across all customer job broadcasts and worker matching.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search zone or category..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <select
                  value={tableFilterZone}
                  onChange={(e) => setTableFilterZone(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  <option value="all">All Service Zones</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDF8] border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Service Zone</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-3">Hourly Rate</th>
                    <th className="py-3 px-3">Full Day (8h)</th>
                    <th className="py-3 px-3">Half Day (4h)</th>
                    <th className="py-3 px-3">Overtime</th>
                    <th className="py-3 px-3">Commission</th>
                    <th className="py-3 px-3">Min Wallet</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPrices.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#202124] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                          <span>{row.zoneName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{row.categoryName}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#D71920]">
                        ₹{row.hourlyRate}/hr
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#202124]">
                        ₹{row.fullDayRate}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        ₹{row.halfDayRate}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        ₹{row.overtimeHourlyRate}/hr
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFC928]/30 text-[#A80F18]">
                          {row.platformCommissionPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        ₹{row.minWorkerWalletBalance}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedZoneId(row.zoneId);
                            setSelectedCategoryId(row.categoryId);
                            window.scrollTo({ top: 100, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-[#D71920] bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPrices.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No prices configured for this filter. Use the form above to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MANAGE SERVICE ZONES */}
      {/* ========================================================================= */}
      {activeSubTab === 'zones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D71920] text-white flex items-center justify-center font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#FFC928]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#202124]">{zone.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        {zone.code}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      zone.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {zone.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">{zone.description}</p>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">City / State:</span>
                    <span className="font-bold text-[#202124]">
                      {zone.city}, {zone.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Geofence Radius:</span>
                    <span className="font-bold text-[#202124]">{zone.geofenceRadiusKm} km</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Covered Pincodes:</span>
                  <div className="flex flex-wrap gap-1">
                    {zone.pincodes.map((pin) => (
                      <span
                        key={pin}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded-md"
                      >
                        {pin}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      setSelectedZoneId(zone.id);
                      setActiveSubTab('set-price');
                    }}
                    className="text-[11px] font-bold text-[#D71920] hover:underline"
                  >
                    Configure Rates →
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete zone "${zone.name}"?`)) {
                        dataService.deleteServiceZone(zone.id);
                        showToast(`Zone "${zone.name}" deleted.`);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: MATCHING & OTP VERIFICATION RULES */}
      {/* ========================================================================= */}
      {activeSubTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-[#202124]/10 p-6 shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-[#202124]">
              Worksite Attendance, OTP & Dispatch Rules
            </h3>
            <p className="text-xs text-[#686868] mt-1">
              Automated safeguards that govern worker matching algorithms and on-site attendance verification.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#202124]/10 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#202124] block">Require Work Start OTP</span>
                <span className="text-[11px] text-[#686868]">
                  Worker must input 4-digit code given by customer upon reaching worksite to start shift clock.
                </span>
              </div>
              <input
                type="checkbox"
                checked={otpSettings.requireStartOtp}
                onChange={(e) => {
                  const updated = { ...otpSettings, requireStartOtp: e.target.checked };
                  setOtpSettings(updated);
                  dataService.setOtpSettings(updated);
                  showToast('✓ Start OTP requirement updated.');
                }}
                className="rounded text-[#D71920] focus:ring-[#D71920] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#202124]/10 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#202124] block">Require Work End OTP</span>
                <span className="text-[11px] text-[#686868]">
                  Customer verifies final shift completion code before platform fee and final settlement are logged.
                </span>
              </div>
              <input
                type="checkbox"
                checked={otpSettings.requireEndOtp}
                onChange={(e) => {
                  const updated = { ...otpSettings, requireEndOtp: e.target.checked };
                  setOtpSettings(updated);
                  dataService.setOtpSettings(updated);
                  showToast('✓ End OTP requirement updated.');
                }}
                className="rounded text-[#D71920] focus:ring-[#D71920] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#202124]/10 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#202124] block">
                  GPS Geofence Worksite Arrival Check
                </span>
                <span className="text-[11px] text-[#686868]">
                  Enforces fresh device GPS capture to verify the employee is physically at the worksite coordinates.
                </span>
              </div>
              <input
                type="checkbox"
                checked={otpSettings.requireGpsArrival}
                onChange={(e) => {
                  const updated = { ...otpSettings, requireGpsArrival: e.target.checked };
                  setOtpSettings(updated);
                  dataService.setOtpSettings(updated);
                  showToast('✓ GPS Geofence requirement updated.');
                }}
                className="rounded text-[#D71920] focus:ring-[#D71920] w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: MONGORIDE INTEGRATION SCHEMA & API SPECIFICATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'mongoride' && (
        <div className="bg-white rounded-3xl border border-[#202124]/10 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#202124] text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                  M
                </span>
                <h3 className="text-base font-extrabold text-[#202124]">
                  MongoRide Backend Integration Blueprint
                </h3>
              </div>
              <p className="text-xs text-[#686868] mt-1">
                Plug-and-play MongoDB schemas and REST controllers to integrate these Service Zones & Zone Pricing directly into your MongoRide backend.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              REST & WebSocket Ready
            </span>
          </div>

          <div className="space-y-4">
            {/* MongoDB Mongoose Schema */}
            <div className="bg-[#1E1F23] text-white p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="font-mono text-emerald-400">1. MongoDB Schema: models/ZonePrice.ts</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`import mongoose from 'mongoose';

const ZonePriceSchema = new mongoose.Schema({
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceZone', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  hourlyRate: { type: Number, required: true },
  fullDayRate: { type: Number, required: true },
  halfDayRate: { type: Number, required: true },
  lumpSumBasePrice: { type: Number, default: 8000 },
  overtimeHourlyRate: { type: Number, default: 350 },
  nightShiftAllowance: { type: Number, default: 250 },
  platformCommissionPercent: { type: Number, default: 10 },
  minWorkerWalletBalance: { type: Number, default: 150 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const ZonePrice = mongoose.model('ZonePrice', ZonePriceSchema);`);
                    showToast('✓ Mongoose Schema copied to clipboard!');
                  }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold"
                >
                  Copy Schema
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`// MongoDB Model for MongoRide:
const ZonePriceSchema = new mongoose.Schema({
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceZone', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  hourlyRate: { type: Number, required: true },      // ₹/hr
  fullDayRate: { type: Number, required: true },     // ₹/8hr shift
  halfDayRate: { type: Number, required: true },     // ₹/4hr shift
  overtimeHourlyRate: { type: Number, default: 350 },// ₹/overtime hr
  platformCommissionPercent: { type: Number, default: 10 },
  minWorkerWalletBalance: { type: Number, default: 150 },
}, { timestamps: true });`}
              </pre>
            </div>

            {/* REST Endpoint Specification */}
            <div className="bg-[#1E1F23] text-white p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="font-mono text-xs text-amber-400 block">
                2. Backend REST Endpoints for MongoRide Customers:
              </span>
              <ul className="text-xs font-mono space-y-1 text-slate-300">
                <li>
                  <span className="text-emerald-400 font-bold">GET</span> /api/v1/zones{' '}
                  <span className="text-white/40">- List all active zones with geofences</span>
                </li>
                <li>
                  <span className="text-emerald-400 font-bold">GET</span>{' '}
                  /api/v1/zones/:zoneId/pricing{' '}
                  <span className="text-white/40">- Get all category rates for a customer's zone</span>
                </li>
                <li>
                  <span className="text-[#FFC928] font-bold">POST</span>{' '}
                  /api/v1/zones/:zoneId/pricing{' '}
                  <span className="text-white/40">- Set/update price for category under zone (Admin)</span>
                </li>
                <li>
                  <span className="text-emerald-400 font-bold">POST</span>{' '}
                  /api/v1/bookings/estimate{' '}
                  <span className="text-white/40">- Calculate total bill + commission for zone</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Service Zone */}
      {showAddZoneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-[#FFC928] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D71920]" />
                <h3 className="text-sm font-extrabold text-[#202124]">Create Service Zone</h3>
              </div>
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#202124] block mb-1">
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Baikampady Industrial Hub"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#202124] block mb-1">
                    Zone Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newZoneCode}
                    onChange={(e) => setNewZoneCode(e.target.value)}
                    placeholder="e.g. ZONE-MNG-01"
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#202124] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newZoneCity}
                    onChange={(e) => setNewZoneCity(e.target.value)}
                    placeholder="e.g. Mangalore"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#202124] block mb-1">
                  Pincodes (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newZonePincodes}
                  onChange={(e) => setNewZonePincodes(e.target.value)}
                  placeholder="e.g. 575011, 575010, 575019"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#202124] block mb-1">
                    Geofence Radius (km)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#202124] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newZoneDesc}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
                  placeholder="e.g. Industrial freight corridors, container berths, factories."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#D71920] hover:bg-[#A80F18] text-white rounded-xl shadow-xs cursor-pointer border border-[#FFC928]"
                >
                  Create Zone & Setup Pricing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Clone Rates from Another Zone */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-[#FFC928] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-[#D71920]" />
                <h3 className="text-sm font-extrabold text-[#202124]">Clone Zone Rates</h3>
              </div>
              <button
                onClick={() => setShowCloneModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Quickly replicate all category prices from a configured source zone into a new target zone.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#202124] block mb-1">
                  Source Zone (Copy from):
                </label>
                <select
                  value={cloneSourceZoneId}
                  onChange={(e) => setCloneSourceZoneId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#202124] block mb-1">
                  Target Zone (Apply to):
                </label>
                <select
                  value={cloneTargetZoneId}
                  onChange={(e) => setCloneTargetZoneId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCloneModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClonePrices}
                className="px-4 py-2 text-xs font-black bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] rounded-xl shadow-xs cursor-pointer"
              >
                Clone All Rates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
