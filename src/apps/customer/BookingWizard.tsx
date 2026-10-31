import React, { useState } from 'react';
import {
  MapPin,
  Briefcase,
  Users,
  Clock,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Plus,
  Minus,
  Upload,
  CheckCircle2,
  Lock,
  Send,
  QrCode,
  Wallet,
  ShieldCheck,
  Check,
  Edit2,
  Search,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileText,
  Volume2,
} from 'lucide-react';
import { ServiceCategory, ServiceZone } from '../../types';

export interface BookingWizardProps {
  categories: ServiceCategory[];
  selectedCategory: ServiceCategory;
  onSelectCategory: (cat: ServiceCategory) => void;
  jobLocation: string;
  onLocationChange: (loc: string) => void;
  gpsCoordinates: { lat: number; lng: number } | null;
  isGpsAutoFilled: boolean;
  isDetectingGps: boolean;
  onAutoDetectGps: () => void;
  onOpenAddressPicker: () => void;
  serviceZones: ServiceZone[];
  selectedZoneId: string;
  onSelectZoneId: (zoneId: string) => void;
  jobTitle: string;
  onChangeJobTitle: (title: string) => void;
  requiredWorkers: number;
  onChangeWorkers: (count: number) => void;
  pricingModel: 'hourly' | 'full_package';
  onChangePricingModel: (model: 'hourly' | 'full_package') => void;
  pricePerHourPerHead: number;
  onChangePricePerHour: (price: number) => void;
  shiftHours: number;
  onChangeShiftHours: (hours: number) => void;
  shiftPackages: Array<{
    id: string;
    title: string;
    badge: string;
    approxHours: number;
    fixedRatePerWorker: number;
    description: string;
  }>;
  selectedPackageId: string;
  onSelectPackageId: (id: string) => void;
  customPackageHours: number;
  onChangeCustomHours: (hours: number) => void;
  customPackageRate: number;
  onChangeCustomRate: (rate: number) => void;
  dateSelection: 'today' | 'tomorrow' | 'day_after' | 'custom';
  onChangeDateSelection: (d: 'today' | 'tomorrow' | 'day_after' | 'custom') => void;
  jobDate: string;
  onChangeJobDate: (date: string) => void;
  timeSlotSelection: string;
  onChangeTimeSlot: (slot: string) => void;
  remarks: string;
  onChangeRemarks: (remarks: string) => void;
  paymentSelection: 'wallet' | 'upi_qr' | 'cash';
  onChangePaymentSelection: (mode: 'wallet' | 'upi_qr' | 'cash') => void;
  walletBalance: number;
  totalEstimatedCost: number;
  costPerWorker: number;
  platformUpiId: string;
  paymentScreenshotUrl: string | null;
  paymentScreenshotName: string | null;
  onScreenshotUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveScreenshot: () => void;
  upiRefNumber: string;
  onChangeUpiRef: (ref: string) => void;
  onPublishJob: () => void;
  onAddCustomCategory: () => void;
  onGoBackToHome?: () => void;
}

// Preset categories matching the exact ones in the user diagram
const DIAGRAM_CATEGORIES = [
  {
    id: 'food_tiffin',
    name: 'Food / Tiffin Service',
    description: 'Food serving, event dining',
    iconEmoji: '🍲',
    rate: 800,
    hourlyRate: 100,
  },
  {
    id: 'loading_unloading',
    name: 'Loading & Unloading',
    description: 'Material, goods, packing',
    iconEmoji: '📦',
    rate: 900,
    hourlyRate: 120,
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    description: 'Cleaning, maintenance',
    iconEmoji: '🧹',
    rate: 700,
    hourlyRate: 90,
  },
  {
    id: 'event_staffing',
    name: 'Event Staffing',
    description: 'Events, functions, support',
    iconEmoji: '🎪',
    rate: 850,
    hourlyRate: 110,
  },
  {
    id: 'construction_helper',
    name: 'Construction Helper',
    description: 'Site work, labour support',
    iconEmoji: '👷',
    rate: 950,
    hourlyRate: 130,
  },
  {
    id: 'packing_moving',
    name: 'Packing & Moving',
    description: 'Packing, shifting, setup',
    iconEmoji: '🚚',
    rate: 900,
    hourlyRate: 120,
  },
];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  jobLocation,
  onLocationChange,
  gpsCoordinates,
  isGpsAutoFilled,
  isDetectingGps,
  onAutoDetectGps,
  onOpenAddressPicker,
  jobTitle,
  onChangeJobTitle,
  requiredWorkers,
  onChangeWorkers,
  pricingModel,
  onChangePricingModel,
  pricePerHourPerHead,
  onChangePricePerHour,
  shiftHours,
  onChangeShiftHours,
  jobDate,
  onChangeJobDate,
  timeSlotSelection,
  onChangeTimeSlot,
  remarks,
  onChangeRemarks,
  paymentSelection,
  onChangePaymentSelection,
  walletBalance,
  totalEstimatedCost,
  costPerWorker,
  platformUpiId,
  paymentScreenshotUrl,
  paymentScreenshotName,
  onScreenshotUpload,
  onRemoveScreenshot,
  upiRefNumber,
  onChangeUpiRef,
  onPublishJob,
  onAddCustomCategory,
  onGoBackToHome,
}) => {
  // Step 1 to 7 matching the exact 7 screens in the user diagram
  const [step, setStep] = useState<number>(1);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Exact work types from screen 4 of user image:
  // Full Day (8 Hours) [selected] | Half Day (4 Hours) | Hourly Basis | Package Based
  const [workTypeSelection, setWorkTypeSelection] = useState<
    'full_day' | 'half_day' | 'hourly_basis' | 'package_based'
  >('full_day');

  // Exact work schedule from screen 5 of user image:
  // Instant Work (Now) | Scheduled Work (Future Date) [selected]
  const [scheduleType, setScheduleType] = useState<'instant' | 'scheduled'>('scheduled');

  // Exact time bounds from screen 5 of user image: From 09:00 AM To 05:00 PM (Duration: 8 Hours)
  const [timeFrom, setTimeFrom] = useState('09:00 AM');
  const [timeTo, setTimeTo] = useState('05:00 PM');
  const [locationSearchInput, setLocationSearchInput] = useState('');

  // Default display location matching user image: "Udupi, Karnataka – 576101"
  const displayLocation = jobLocation.includes('Udupi')
    ? jobLocation
    : 'Udupi, Karnataka – 576101';

  // Rate calculation matching user image:
  // Full day = ₹800/worker, 5 workers = ₹4,000 Base Amount
  const currentWorkerRate = workTypeSelection === 'full_day' ? 800 : workTypeSelection === 'half_day' ? 450 : pricePerHourPerHead;
  const currentTotalAmount = requiredWorkers * (workTypeSelection === 'hourly_basis' ? currentWorkerRate * shiftHours : currentWorkerRate);
  const extraHoursRate = 150; // Exact ₹150 / hour / worker from user image screen 5 & 6

  // Step header titles matching user image:
  // 1: Job Location | 2: Service Category | 3: Job Details | 4: Job Details | 5: Date & Time | 6: Price Details | 7: Review & Post
  const stepTitles = [
    'Job Location',
    'Service Category',
    'Job Details',
    'Job Details',
    'Date & Time',
    'Price Details',
    'Review & Post',
  ];

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onGoBackToHome) {
      onGoBackToHome();
    }
  };

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      onPublishJob();
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-[580px] flex flex-col font-sans select-none text-[#202124]">
      {/* ======================================================== */}
      {/* 1. TOP APP BAR (EXACT RED HEADER MATCHING USER IMAGE)     */}
      {/* ======================================================== */}
      <div className="bg-[#D71920] text-white px-3.5 py-3 flex items-center justify-between shadow-sm shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 hover:bg-white/20 p-1 -ml-1 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white stroke-[2.5]" />
        </button>
        <h1 className="text-sm font-black tracking-wide text-white flex-1 text-center pr-6">
          {stepTitles[step - 1]}
        </h1>
      </div>

      {/* ======================================================== */}
      {/* 2. NUMERICAL STEPPER (1 2 3 4 5 6 7 - EXACT PILL ROW)    */}
      {/* ======================================================== */}
      <div className="bg-white px-4 pt-3 pb-2 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between max-w-xs mx-auto relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const isActive = step === num;
            const isCompleted = step > num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setStep(num)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black relative z-10 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC928] text-[#202124] shadow-sm ring-2 ring-[#FFC928]/40 scale-110'
                    : isCompleted
                    ? 'bg-[#FFC928] text-[#202124]'
                    : 'bg-[#E5E7EB] text-slate-500'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STEP CONTENT BODY                                     */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ====================================================== */}
        {/* SCREEN 2 / STEP 1: JOB LOCATION                        */}
        {/* ====================================================== */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-sm font-black text-[#202124]">Select Work Location</h2>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationSearchInput}
                onChange={(e) => setLocationSearchInput(e.target.value)}
                placeholder="Search area, landmark..."
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920] shadow-2xs font-medium"
              />
            </div>

            {/* Concentric Circle Radar Map (Exact visual from user image) */}
            <div
              onClick={onOpenAddressPicker}
              className="w-full h-44 rounded-2xl bg-[#E8F5E9] relative overflow-hidden border border-emerald-200 cursor-pointer shadow-inner flex items-center justify-center group"
            >
              {/* Concentric rings */}
              <div className="absolute w-56 h-56 rounded-full border border-emerald-300/40 animate-ping" />
              <div className="absolute w-40 h-40 rounded-full border border-emerald-400/50" />
              <div className="absolute w-28 h-28 rounded-full border border-emerald-500/60" />
              <div className="absolute w-16 h-16 rounded-full bg-emerald-400/20" />

              {/* Pinpoint in center */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#D71920] text-white flex items-center justify-center shadow-lg border-2 border-white scale-110">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="mt-1 bg-white/90 text-[#202124] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-slate-200">
                  📍 Tap to adjust Pin
                </span>
              </div>

              {/* Reticle icon button on bottom right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAutoDetectGps();
                }}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white text-[#D71920] shadow-md border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50"
                title="Locate me"
              >
                <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Selected Location Card */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                  <span>Selected Location</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenAddressPicker}
                  className="text-slate-400 hover:text-[#D71920] p-1 cursor-pointer"
                  title="Edit address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs font-black text-[#202124] flex items-center justify-between">
                <span>{displayLocation}</span>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onAutoDetectGps}
                  className="text-[11px] font-bold text-[#D71920] flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Navigation className="w-3 h-3 text-[#D71920]" />
                  <span>Use Current Location</span>
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                  Lat: {gpsCoordinates?.lat.toFixed(4) || '13.3409'}°N
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* SCREEN 3 / STEP 2: SERVICE CATEGORY                    */}
        {/* ====================================================== */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#202124]">Select Service Category</h2>
                <p className="text-[11px] text-[#D71920] font-bold">
                  (Available in {displayLocation.split(',')[0]})
                </p>
              </div>
              <button
                type="button"
                onClick={onAddCustomCategory}
                className="text-[10px] font-bold text-[#D71920] bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg border border-red-200 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Custom</span>
              </button>
            </div>

            {/* List of Category Cards from user image */}
            <div className="space-y-2">
              {DIAGRAM_CATEGORIES.map((cat) => {
                const isSelected =
                  selectedCategory?.name?.toLowerCase().includes(cat.name.split('/')[0].trim().toLowerCase()) ||
                  (cat.id === 'food_tiffin' && selectedCategory?.name?.includes('Food'));
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      const match = categories.find((c) =>
                        c.name.toLowerCase().includes(cat.name.split('/')[0].trim().toLowerCase())
                      );
                      if (match) {
                        onSelectCategory(match);
                        onChangePricePerHour(cat.hourlyRate);
                      } else {
                        onSelectCategory({
                          id: cat.id,
                          name: cat.name,
                          slug: cat.id,
                          description: cat.description,
                          icon: 'Utensils',
                          isActive: true,
                          minPrice: 500,
                          maxPrice: 3000,
                          hourlyRate: cat.hourlyRate,
                          fullDayRate: cat.rate,
                          halfDayRate: 450,
                          overtimeMultiplier: 1.5,
                          requiredSkills: [cat.name],
                        });
                        onChangePricePerHour(cat.hourlyRate);
                      }
                      onChangeJobTitle(`${cat.name} for Corporate Event`);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFFDF0] border-2 border-[#D71920] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg shrink-0 border border-amber-200">
                        {cat.iconEmoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#202124]">{cat.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#D71920] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* SCREEN 4 / STEP 3 & 4: JOB DETAILS                     */}
        {/* ====================================================== */}
        {(step === 3 || step === 4) && (
          <div className="space-y-4 animate-fadeIn">
            {/* 1. Required Workers with [-] 5 [+] Yellow Stepper */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-black text-[#202124] block">Required Workers</span>
              <div className="flex items-center justify-center gap-6 py-2">
                <button
                  type="button"
                  onClick={() => onChangeWorkers(Math.max(1, requiredWorkers - 1))}
                  className="w-10 h-10 rounded-xl bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-black text-lg flex items-center justify-center shadow-xs cursor-pointer border border-amber-400"
                >
                  <Minus className="w-5 h-5 stroke-[3]" />
                </button>

                <span className="text-3xl font-black text-[#202124] min-w-10 text-center font-mono">
                  {requiredWorkers}
                </span>

                <button
                  type="button"
                  onClick={() => onChangeWorkers(requiredWorkers + 1)}
                  className="w-10 h-10 rounded-xl bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-black text-lg flex items-center justify-center shadow-xs cursor-pointer border border-amber-400"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* 2. Work Type Options matching user image */}
            <div className="space-y-2">
              <span className="text-xs font-black text-[#202124] block">Work Type</span>

              {/* Option A: Full Day (8 Hours) [Default Selected] */}
              <div
                onClick={() => {
                  setWorkTypeSelection('full_day');
                  onChangePricingModel('full_package');
                  onChangeShiftHours(8);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  workTypeSelection === 'full_day'
                    ? 'bg-[#FFF9D6] border-2 border-[#D71920] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-[#D71920] flex items-center justify-center">
                    {workTypeSelection === 'full_day' && (
                      <div className="w-2 h-2 rounded-full bg-[#D71920]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#202124]">Full Day (8 Hours)</h4>
                    <p className="text-[10px] text-slate-500">Includes 8 hours work</p>
                  </div>
                </div>
                {workTypeSelection === 'full_day' && (
                  <Check className="w-4 h-4 text-[#D71920] stroke-[3]" />
                )}
              </div>

              {/* Option B: Half Day (4 Hours) */}
              <div
                onClick={() => {
                  setWorkTypeSelection('half_day');
                  onChangePricingModel('full_package');
                  onChangeShiftHours(4);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  workTypeSelection === 'half_day'
                    ? 'bg-[#FFF9D6] border-2 border-[#D71920] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                    {workTypeSelection === 'half_day' && (
                      <div className="w-2 h-2 rounded-full bg-[#D71920]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#202124]">Half Day (4 Hours)</h4>
                    <p className="text-[10px] text-slate-500">Up to 4 hours work</p>
                  </div>
                </div>
                {workTypeSelection === 'half_day' && (
                  <Check className="w-4 h-4 text-[#D71920] stroke-[3]" />
                )}
              </div>

              {/* Option C: Hourly Basis */}
              <div
                onClick={() => {
                  setWorkTypeSelection('hourly_basis');
                  onChangePricingModel('hourly');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  workTypeSelection === 'hourly_basis'
                    ? 'bg-[#FFF9D6] border-2 border-[#D71920] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                    {workTypeSelection === 'hourly_basis' && (
                      <div className="w-2 h-2 rounded-full bg-[#D71920]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#202124]">Hourly Basis</h4>
                    <p className="text-[10px] text-slate-500">Set rate per hour</p>
                  </div>
                </div>
                {workTypeSelection === 'hourly_basis' && (
                  <Check className="w-4 h-4 text-[#D71920] stroke-[3]" />
                )}
              </div>

              {/* Option D: Package Based */}
              <div
                onClick={() => {
                  setWorkTypeSelection('package_based');
                  onChangePricingModel('full_package');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  workTypeSelection === 'package_based'
                    ? 'bg-[#FFF9D6] border-2 border-[#D71920] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                    {workTypeSelection === 'package_based' && (
                      <div className="w-2 h-2 rounded-full bg-[#D71920]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#202124]">Package Based</h4>
                    <p className="text-[10px] text-slate-500">Fixed amount for the work</p>
                  </div>
                </div>
                {workTypeSelection === 'package_based' && (
                  <Check className="w-4 h-4 text-[#D71920] stroke-[3]" />
                )}
              </div>
            </div>

            {/* Job Title and Additional Info */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">Job Requirement Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => onChangeJobTitle(e.target.value)}
                placeholder="Food Serving for Corporate Event"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#D71920]"
              />
              <label className="text-[11px] font-bold text-slate-600 block pt-1">
                Additional Information / Instructions
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => onChangeRemarks(e.target.value)}
                placeholder="Serve lunch for approx. 250 people. Punctuality is required."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#D71920]"
              />
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* SCREEN 5 / STEP 5: DATE & TIME                         */}
        {/* ====================================================== */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            {/* 1. Select Work Schedule: Instant vs Scheduled */}
            <div className="space-y-2">
              <span className="text-xs font-black text-[#202124] block">Select Work Schedule</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType('instant')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    scheduleType === 'instant'
                      ? 'bg-[#FFF9D6] border-2 border-[#D71920] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center">
                    {scheduleType === 'instant' && (
                      <div className="w-2 h-2 rounded-full bg-[#D71920]" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Instant Work</span>
                    <span className="text-[9px] text-slate-500 block">(Now)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleType('scheduled')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    scheduleType === 'scheduled'
                      ? 'bg-[#FFF9D6] border-2 border-[#D71920] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D71920] flex items-center justify-center">
                    {scheduleType === 'scheduled' && (
                      <div className="w-2 h-2 rounded-full bg-[#D71920]" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-tight">Scheduled Work</span>
                    <span className="text-[9px] text-slate-500 block">(Future Date)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Work Date Card */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-xs font-black text-[#202124] block">Work Date</span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#D71920]" />
                  <span className="text-xs font-bold text-[#202124]">
                    {jobDate === '2026-10-15' || !jobDate ? 'Wed, 18 Nov 2026' : jobDate}
                  </span>
                </div>
                <input
                  type="date"
                  value={jobDate}
                  onChange={(e) => onChangeJobDate(e.target.value)}
                  className="text-xs bg-transparent text-slate-400 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Work Time: From & To */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-black text-[#202124] block">Work Time</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">From</label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-bold text-[#202124]">
                    <Clock className="w-3.5 h-3.5 text-[#D71920]" />
                    <input
                      type="text"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full bg-transparent focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block">To</label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-bold text-[#202124]">
                    <Clock className="w-3.5 h-3.5 text-[#D71920]" />
                    <input
                      type="text"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full bg-transparent focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs font-black text-[#202124]">Duration: 8 Hours</span>
              </div>
            </div>

            {/* Extra Hours Rate notice (Exact light yellow card with clock icon) */}
            <div className="bg-[#FFFDF0] p-3 rounded-2xl border border-amber-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#A80F18] font-bold">
                <Clock className="w-4 h-4 text-[#D71920]" />
                <span>Extra Hours Rate</span>
              </div>
              <span className="font-black text-[#D71920]">₹150 / hour / worker</span>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* SCREEN 6 / STEP 6: PRICE DETAILS                       */}
        {/* ====================================================== */}
        {step === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-xs font-black text-[#202124] uppercase tracking-wider">
                Price Details (Estimate)
              </h2>

              {/* Itemized Table matching user image */}
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600">Work Type</span>
                  <span className="font-bold text-[#202124]">
                    {workTypeSelection === 'full_day' ? 'Full Day (8 Hours)' : 'Half Day (4 Hours)'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600">Workers Required</span>
                  <span className="font-bold text-[#202124]">{requiredWorkers}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600">Rate per Worker</span>
                  <span className="font-bold text-[#202124]">₹{currentWorkerRate}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600">Base Amount</span>
                  <span className="font-bold text-[#202124]">₹{currentTotalAmount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600">Extra Hours Rate</span>
                  <span className="font-bold text-[#202124]">₹150 / hour</span>
                </div>
              </div>
            </div>

            {/* Estimated Total Card (Big Vibrant Yellow Box with Large Red ₹4,000) */}
            <div className="bg-[#FFFAEC] p-5 rounded-2xl border-2 border-[#FFC928] text-center space-y-1 shadow-xs">
              <span className="text-xs font-bold text-slate-600 block">Estimated Total</span>
              <span className="text-4xl font-black text-[#D71920] block tracking-tight">
                ₹{currentTotalAmount.toLocaleString()}
              </span>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Final amount may change based on actual working hours (OT), if applicable.
              </span>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* SCREEN 7 / STEP 7: REVIEW & POST                       */}
        {/* ====================================================== */}
        {step === 7 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-sm font-black text-[#202124]">Review & Post Job</h2>

            {/* Summary Details Card (Matching user image screen 7) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Location</span>
                  <span className="font-black text-[#202124]">{displayLocation}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Category</span>
                  <span className="font-bold text-[#202124]">{selectedCategory.name}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Workers</span>
                  <span className="font-bold text-[#202124]">{requiredWorkers}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Work Type</span>
                  <span className="font-bold text-[#202124]">Full Day (8 Hours)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Date</span>
                  <span className="font-bold text-[#202124]">
                    {jobDate === '2026-10-15' || !jobDate ? 'Wed, 18 Nov 2026' : jobDate}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Time</span>
                  <span className="font-bold text-[#202124]">{timeFrom} – {timeTo}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <span className="text-emerald-700 font-bold text-sm shrink-0">₹</span>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimated Amount</span>
                  <span className="font-black text-[#D71920] text-sm">₹{currentTotalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Job Title</span>
                  <span className="font-bold text-[#202124]">
                    {jobTitle || 'Food Serving for Corporate Event'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-100">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Additional Information</span>
                  <span className="font-medium text-slate-600">
                    {remarks || 'Serve lunch for approx. 250 people.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector & UPI QR Proof */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <span className="text-xs font-black text-[#202124] block">Payment Mode</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => onChangePaymentSelection('upi_qr')}
                  className={`py-1.5 rounded-lg cursor-pointer transition-all ${
                    paymentSelection === 'upi_qr'
                      ? 'bg-[#D71920] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  UPI QR
                </button>
                <button
                  type="button"
                  onClick={() => onChangePaymentSelection('wallet')}
                  className={`py-1.5 rounded-lg cursor-pointer transition-all ${
                    paymentSelection === 'wallet'
                      ? 'bg-[#D71920] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Wallet (₹{walletBalance})
                </button>
                <button
                  type="button"
                  onClick={() => onChangePaymentSelection('cash')}
                  className={`py-1.5 rounded-lg cursor-pointer transition-all ${
                    paymentSelection === 'cash'
                      ? 'bg-[#D71920] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Cash
                </button>
              </div>

              {paymentSelection === 'upi_qr' && (
                <div className="space-y-2 pt-1">
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-300 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Official UPI</span>
                      <span className="font-mono font-black text-[#D71920] text-xs">{platformUpiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(platformUpiId);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="px-2 py-1 text-[10px] font-bold bg-[#FFC928] text-[#202124] rounded-lg"
                    >
                      {copiedUpi ? '✓ Copied' : 'Copy UPI'}
                    </button>
                  </div>

                  {/* Screenshot upload receipt */}
                  <label className="flex items-center justify-center p-2.5 rounded-xl bg-slate-50 border border-dashed border-amber-300 hover:border-[#D71920] cursor-pointer text-center gap-2">
                    <Upload className="w-4 h-4 text-[#D71920]" />
                    <span className="text-[11px] font-bold text-[#202124]">
                      {paymentScreenshotName ? paymentScreenshotName : 'Attach Payment Screenshot (Optional)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Big Yellow Post Job Now Button (Screen 7 in user image) */}
            <button
              type="button"
              onClick={onPublishJob}
              className="w-full py-3.5 bg-[#FFC928] hover:bg-[#E5A900] active:scale-[0.99] text-[#D71920] font-black text-sm rounded-2xl shadow-md border-2 border-[#D71920] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Volume2 className="w-5 h-5 text-[#D71920] stroke-[2.5]" />
              <span>Post Job Now</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. RED BOTTOM ACTION BAR: Next → (SCREENS 1 TO 6)        */}
      {/* ======================================================== */}
      {step < 7 && (
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 bg-[#D71920] hover:bg-[#A80F18] active:scale-[0.99] text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 text-white stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
};
