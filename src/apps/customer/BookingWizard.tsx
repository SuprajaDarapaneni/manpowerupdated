import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Clock,
  Calendar,
  Sparkles,
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
  Search,
  Edit2,
  Info,
  CalendarDays,
  FileText,
  Briefcase,
  Layers,
  DollarSign,
  AlertCircle,
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
  onExitWizard?: () => void;
}

export type WorkDurationType = 'full_day' | 'half_day' | 'hourly' | 'package';
export type WorkScheduleType = 'instant' | 'scheduled';

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
  serviceZones,
  selectedZoneId,
  onSelectZoneId,
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
  shiftPackages,
  selectedPackageId,
  onSelectPackageId,
  customPackageHours,
  onChangeCustomHours,
  customPackageRate,
  onChangeCustomRate,
  dateSelection,
  onChangeDateSelection,
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
  onExitWizard,
}) => {
  // Wizard steps: 1: Location -> 2: Category -> 3: Job Details -> 4: Date & Time -> 5: Price Details -> 6: Review & Post
  const [step, setStep] = useState<number>(1);
  const [scheduleType, setScheduleType] = useState<WorkScheduleType>('scheduled');
  const [workDurationType, setWorkDurationType] = useState<WorkDurationType>('full_day');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Derive city / area label for screen 2 ("Available in Udupi")
  const locationCity = jobLocation.includes('Udupi')
    ? 'Udupi'
    : jobLocation.includes('Mangalore')
    ? 'Mangalore'
    : 'Local Zone';

  // Step header titles matching user's image exactly
  const stepTitles: Record<number, string> = {
    1: 'Job Location',
    2: 'Service Category',
    3: 'Job Details',
    4: 'Date & Time',
    5: 'Price Details',
    6: 'Review & Post',
  };

  // Base rate calculation based on duration type
  const baseRatePerWorker =
    workDurationType === 'full_day'
      ? selectedCategory.fullDayRate || 800
      : workDurationType === 'half_day'
      ? Math.round((selectedCategory.fullDayRate || 800) * 0.55)
      : workDurationType === 'hourly'
      ? (selectedCategory.hourlyRate || 150) * shiftHours
      : customPackageRate || 1800;

  const totalCalculatedAmount = baseRatePerWorker * requiredWorkers;
  const extraHoursRate = 150;

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onExitWizard) {
      onExitWizard();
    }
  };

  return (
    <div className="flex flex-col min-h-[580px] bg-[#FFFDF8] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      {/* =================================================================== */}
      {/* TOP RED HEADER WITH BACK ARROW & SCREEN TITLE (EXACT POSTER DESIGN) */}
      {/* =================================================================== */}
      <div className="bg-[#D71920] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-white hover:bg-black/10 rounded-full transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold tracking-tight text-white">
            {stepTitles[step]}
          </h2>
        </div>

        {/* Circular Stepper Pills 1 to 7 matching the poster */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isActive = step === num;
            const isCompleted = step > num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setStep(num)}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC928] text-[#202124] ring-2 ring-white shadow-xs font-black'
                    : isCompleted
                    ? 'bg-white/80 text-[#D71920]'
                    : 'bg-white/20 text-white/80'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* WIZARD STEP BODY CONTENT                                            */}
      {/* =================================================================== */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* ================================================================= */}
        {/* SCREEN 2: SELECT WORK LOCATION (STEP 1)                           */}
        {/* ================================================================= */}
        {step === 1 && (
          <div className="space-y-3.5 animate-fadeIn">
            <div>
              <h3 className="text-sm font-extrabold text-[#202124]">Select Work Location</h3>
              <p className="text-[11px] text-slate-500">Search area or pinpoint on map</p>
            </div>

            {/* Search Input Field */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="Search area, landmark..."
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl shadow-2xs focus:outline-none focus:border-[#D71920] font-medium text-[#202124]"
              />
            </div>

            {/* Map Visual with Green Pinpoint & Crosshair Radar */}
            <div
              onClick={onOpenAddressPicker}
              className="relative h-44 rounded-2xl overflow-hidden border-2 border-slate-200 bg-linear-to-b from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center cursor-pointer group shadow-inner"
            >
              {/* Map grid lines styling */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(#14B8A6 1px, transparent 1px), radial-gradient(#14B8A6 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              />

              {/* Green Radar Circle */}
              <div className="w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-600/50 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-[#D71920] text-white flex items-center justify-center shadow-md ring-4 ring-white">
                    <span className="w-2 h-2 rounded-full bg-[#FFC928]" />
                  </div>
                </div>
              </div>

              {/* Crosshair Overlay */}
              <div className="absolute right-3 bottom-3 p-2 bg-white rounded-xl shadow-md border border-slate-200 text-slate-600 hover:text-[#D71920]">
                <Navigation className="w-4 h-4" />
              </div>

              <div className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Tap Map to Pinpoint Exact Worksite</span>
              </div>
            </div>

            {/* Selected Location Card with Edit Pencil Icon */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Selected Location
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D71920] shrink-0" />
                  <span className="text-xs font-bold text-[#202124] leading-tight line-clamp-1">
                    {jobLocation || 'Udupi, Karnataka – 576101'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAddressPicker}
                  className="p-1 text-slate-400 hover:text-[#D71920] transition-colors cursor-pointer"
                  title="Edit Address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Use Current Location Button */}
            <button
              type="button"
              onClick={onAutoDetectGps}
              disabled={isDetectingGps}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#202124] text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 text-[#D71920] ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Detecting GPS Location...' : 'Use Current Location'}</span>
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 3: SELECT SERVICE CATEGORY (STEP 2)                        */}
        {/* ================================================================= */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <h3 className="text-sm font-extrabold text-[#202124]">Select Service Category</h3>
              <p className="text-[11px] text-slate-500">(Available in {locationCity})</p>
            </div>

            {/* Category Cards matching user poster */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory.id === cat.id;
                // Specific icons & descriptions matching the poster
                const iconMap: Record<string, string> = {
                  'Food / Tiffin Service': '🍲',
                  'Loading & Unloading': '📦',
                  'Housekeeping': '🧹',
                  'Event Staffing': '🎪',
                  'Construction Helper': '👷',
                  'Packing & Moving': '🚚',
                };
                const emoji = iconMap[cat.name] || '🛠️';

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat);
                      onChangePricePerHour(cat.hourlyRate || 150);
                    }}
                    className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-linear-to-r from-amber-50 to-orange-50 border-2 border-[#D71920] shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-lg shrink-0">
                        {emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#202124]">{cat.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {cat.description || 'Verified helpers on demand'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#D71920] block">
                          ₹{cat.fullDayRate || 800}
                        </span>
                        <span className="text-[9px] text-slate-400 block">/ day</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#D71920] bg-[#D71920] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#FFC928]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 4: JOB DETAILS: WORKERS COUNT & WORK TYPE (STEP 3)         */}
        {/* ================================================================= */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Required Workers Stepper */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124] block">Required Workers</label>
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-600 font-medium">Headcount needed</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeWorkers(Math.max(1, requiredWorkers - 1))}
                    className="w-8 h-8 rounded-xl bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-black text-sm flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-black text-[#202124] min-w-6 text-center">
                    {requiredWorkers}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeWorkers(requiredWorkers + 1)}
                    className="w-8 h-8 rounded-xl bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-black text-sm flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Work Type Radio Selection matching poster */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#202124] block">Work Type</label>

              {[
                {
                  id: 'full_day' as WorkDurationType,
                  title: 'Full Day (8 Hours)',
                  desc: 'Includes 8 hours work',
                },
                {
                  id: 'half_day' as WorkDurationType,
                  title: 'Half Day (4 Hours)',
                  desc: 'Up to 4 hours work',
                },
                {
                  id: 'hourly' as WorkDurationType,
                  title: 'Hourly Basis',
                  desc: 'Set rate per hour',
                },
                {
                  id: 'package' as WorkDurationType,
                  title: 'Package Based',
                  desc: 'Fixed amount for the work',
                },
              ].map((opt) => {
                const isOptActive = workDurationType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setWorkDurationType(opt.id);
                      if (opt.id === 'hourly') {
                        onChangePricingModel('hourly');
                        onChangeShiftHours(8);
                      } else {
                        onChangePricingModel('full_package');
                      }
                    }}
                    className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                      isOptActive
                        ? 'bg-[#FFF9E6] border-2 border-[#FFC928] shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#202124]">{opt.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isOptActive
                          ? 'border-[#D71920] bg-[#D71920]'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isOptActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FFC928]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Job Requirement Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#202124] block">Job Title / Purpose</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => onChangeJobTitle(e.target.value)}
                placeholder="e.g. Food Serving for Corporate Event"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-[#202124] focus:outline-none focus:border-[#D71920]"
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 5: SELECT DATE & TIME (STEP 4)                             */}
        {/* ================================================================= */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Work Schedule (Instant vs Scheduled) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#202124] block">Select Work Schedule</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType('instant')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    scheduleType === 'instant'
                      ? 'bg-[#FFF9E6] border-2 border-[#FFC928]'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">Instant Work</span>
                  <span className="text-[10px] text-slate-500 block">(Now)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('scheduled')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    scheduleType === 'scheduled'
                      ? 'bg-[#FFF9E6] border-2 border-[#FFC928]'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">Scheduled Work</span>
                  <span className="text-[10px] text-slate-500 block">(Future Date)</span>
                </button>
              </div>
            </div>

            {/* Work Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#202124] block">Work Date</label>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D71920]" />
                  <input
                    type="date"
                    value={jobDate}
                    onChange={(e) => onChangeJobDate(e.target.value)}
                    className="text-xs font-bold text-[#202124] bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
                <span className="text-[10px] bg-amber-100 text-[#D71920] px-2 py-0.5 rounded-md font-bold">
                  Selected
                </span>
              </div>
            </div>

            {/* Work Time: From -> To */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#202124] block">Work Time</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">From</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-xs font-bold text-[#202124] w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">To</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-xs font-bold text-[#202124] w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Banner */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Shift Duration:</span>
              <span className="font-bold text-[#202124]">
                {workDurationType === 'full_day'
                  ? '8 Hours'
                  : workDurationType === 'half_day'
                  ? '4 Hours'
                  : `${shiftHours} Hours`}
              </span>
            </div>

            {/* Extra Hours Rate Notice */}
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D71920]" />
                <span className="text-slate-700 font-medium">Extra Hours Rate</span>
              </div>
              <span className="font-black text-[#D71920]">₹{extraHoursRate} / hour / worker</span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 6: VIEW PRICE DETAILS (STEP 5)                             */}
        {/* ================================================================= */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-extrabold text-[#202124]">Price Details (Estimate)</h3>
              <p className="text-[11px] text-slate-500">Transparent quote calculation</p>
            </div>

            {/* Breakdown Card */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Work Type</span>
                <span className="font-bold text-[#202124]">
                  {workDurationType === 'full_day'
                    ? 'Full Day (8 Hours)'
                    : workDurationType === 'half_day'
                    ? 'Half Day (4 Hours)'
                    : workDurationType === 'hourly'
                    ? `Hourly Basis (${shiftHours}h)`
                    : 'Package Based'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Workers Required</span>
                <span className="font-bold text-[#202124]">{requiredWorkers}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rate per Worker</span>
                <span className="font-bold text-[#202124]">₹{baseRatePerWorker.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Base Amount</span>
                <span className="font-bold text-[#202124]">
                  ₹{(baseRatePerWorker * requiredWorkers).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Extra Hours Rate</span>
                <span className="font-bold text-[#D71920]">₹{extraHoursRate} / hour</span>
              </div>
            </div>

            {/* Big Yellow Highlight Banner matching poster */}
            <div className="bg-[#FFF9E6] border-2 border-[#FFC928] p-4 rounded-3xl text-center shadow-xs space-y-0.5">
              <span className="text-xs font-bold text-[#202124] block">Estimated Total</span>
              <span className="text-3xl font-black text-[#D71920] block">
                ₹{totalCalculatedAmount.toLocaleString()}
              </span>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-2.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-[11px] text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Final amount may change based on actual working hours (OT), if applicable.
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 7: REVIEW & POST JOB (STEP 6)                              */}
        {/* ================================================================= */}
        {step === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-extrabold text-[#202124]">Review & Post Job</h3>
              <p className="text-[11px] text-slate-500">Confirm shift details and broadcast</p>
            </div>

            {/* Itemized summary list matching poster */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Location</span>
                  <span className="font-bold text-[#202124]">{jobLocation}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Briefcase className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                  <span className="font-bold text-[#202124]">{selectedCategory.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Workers</span>
                    <span className="font-bold text-[#202124]">{requiredWorkers} Workers</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Work Type</span>
                    <span className="font-bold text-[#202124]">
                      {workDurationType === 'full_day'
                        ? 'Full Day (8 Hours)'
                        : workDurationType === 'half_day'
                        ? 'Half Day (4 Hours)'
                        : 'Hourly Basis'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date</span>
                    <span className="font-bold text-[#202124]">{jobDate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Time</span>
                    <span className="font-bold text-[#202124]">{startTime} – {endTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1 border-t border-slate-100">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Estimated Amount</span>
                  <span className="text-base font-black text-[#D71920]">
                    ₹{totalCalculatedAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Edit2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Job Title</span>
                  <span className="font-bold text-[#202124]">{jobTitle || 'General Helper Work'}</span>
                </div>
              </div>

              {remarks && (
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Additional Information</span>
                    <span className="text-slate-600">{remarks}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
              <label className="text-xs font-bold text-[#202124] block">Payment Method *</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => onChangePaymentSelection('upi_qr')}
                  className={`py-1.5 rounded-xl cursor-pointer transition-all ${
                    paymentSelection === 'upi_qr'
                      ? 'bg-[#D71920] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  UPI QR & Proof
                </button>
                <button
                  type="button"
                  onClick={() => onChangePaymentSelection('wallet')}
                  className={`py-1.5 rounded-xl cursor-pointer transition-all ${
                    paymentSelection === 'wallet'
                      ? 'bg-[#D71920] text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Prepaid Wallet
                </button>
                <button
                  type="button"
                  disabled={Boolean(selectedCategory.requiresOnlinePaymentOnly)}
                  onClick={() => {
                    if (selectedCategory.requiresOnlinePaymentOnly) return;
                    onChangePaymentSelection('cash');
                  }}
                  className={`py-1.5 rounded-xl transition-all ${
                    selectedCategory.requiresOnlinePaymentOnly
                      ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
                      : paymentSelection === 'cash'
                      ? 'bg-[#D71920] text-white shadow-xs cursor-pointer'
                      : 'text-slate-600 hover:text-black cursor-pointer'
                  }`}
                >
                  Worksite Cash
                </button>
              </div>

              {/* UPI QR & Screenshot proof */}
              {paymentSelection === 'upi_qr' && (
                <div className="space-y-2 pt-1">
                  <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-300 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Platform UPI</span>
                      <span className="font-mono font-black text-[#D71920] text-xs">{platformUpiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(platformUpiId);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="px-2 py-1 text-[10px] font-bold bg-[#FFC928] text-[#202124] rounded-lg cursor-pointer"
                    >
                      {copiedUpi ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <label className="flex items-center justify-center p-2.5 rounded-xl bg-slate-50 border border-dashed border-amber-300 hover:border-[#D71920] cursor-pointer text-center text-xs font-bold text-[#202124] gap-1.5">
                    <Upload className="w-4 h-4 text-[#D71920]" />
                    <span>{paymentScreenshotName ? paymentScreenshotName : 'Attach Payment Screenshot Proof'}</span>
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
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* BOTTOM CTA ACTION BUTTON BAR (RED NEXT VS YELLOW POST JOB NOW)      */}
      {/* =================================================================== */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 bg-[#D71920] hover:bg-[#A80F18] text-white font-extrabold text-xs rounded-2xl shadow-md border border-[#FFC928] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 text-[#FFC928]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onPublishJob}
            className="w-full py-3.5 bg-[#FFC928] hover:bg-[#E5A900] text-[#202124] font-black text-xs rounded-2xl shadow-lg border-2 border-amber-400 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Send className="w-4 h-4 text-[#D71920]" />
            <span>Post Job Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
