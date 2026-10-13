import React, { useState } from 'react';
import {
  Smartphone,
  MapPin,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  Package,
  Utensils,
  Sparkles,
  Hammer,
  Truck,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronLeft,
  Clock,
  Send,
} from 'lucide-react';
import { Booking, ServiceCategory, Worker, WorkerBid } from '../../types';
import { dataService } from '../../services/storage';

interface CustomerAppSimulatorProps {
  categories: ServiceCategory[];
  workers: Worker[];
  bookings: Booking[];
}

type CustomerScreen = 'home' | 'post-job' | 'view-bids' | 'order-confirmed' | 'my-orders';

export const CustomerAppSimulator: React.FC<CustomerAppSimulatorProps> = ({
  categories,
  workers,
  bookings,
}) => {
  const [screen, setScreen] = useState<CustomerScreen>('home');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(categories[0]);
  const [activeBookingId, setActiveBookingId] = useState<string>(bookings[0]?.id || '');

  // Booking Form State
  const [requiredWorkers, setRequiredWorkers] = useState(2);
  const [offeredAmount, setOfferedAmount] = useState(2000);
  const [date, setDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [locationCity, setLocationCity] = useState('Mangalore, Karnataka');
  const [locationAddress, setLocationAddress] = useState('Panambur Container Terminal Dock 4');
  const [description, setDescription] = useState('Need heavy lifting team for container unloading.');
  const [specialInstructions, setSpecialInstructions] = useState('Safety shoes required.');

  // Food / Tiffin Service dynamic options
  const [isMorningTiffin, setIsMorningTiffin] = useState(true);
  const [isLunch, setIsLunch] = useState(true);
  const [isEveningTea, setIsEveningTea] = useState(true);
  const [peopleCount, setPeopleCount] = useState(150);

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0];

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = dataService.createBooking({
      customerId: 'c-1',
      customerName: 'Apex Logistics & Warehousing',
      customerPhone: '+91 99001 55432',
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      requiredWorkers: Number(requiredWorkers),
      offeredPricePerWorker: Number(offeredAmount),
      totalEstimatedAmount: Number(requiredWorkers) * Number(offeredAmount),
      scheduledDate: date,
      startTime,
      endTime,
      description,
      specialInstructions,
      workLocation: {
        address: locationAddress,
        city: locationCity,
        lat: 12.914,
        lng: 74.856,
      },
      foodDetails: selectedCategory.dynamicFields?.isFoodTiffin
        ? {
            morningTiffin: isMorningTiffin,
            lunch: isLunch,
            eveningTea: isEveningTea,
            peopleCount: Number(peopleCount),
            servingMethod: 'Buffet Counter Management',
          }
        : undefined,
    });

    setActiveBookingId(newBooking.id);
    setScreen('view-bids');
  };

  const handleAcceptBid = (bidId: string) => {
    if (!activeBooking) return;
    dataService.acceptBid(activeBooking.id, bidId);
    if (activeBooking.acceptedWorkersCount + 1 >= activeBooking.requiredWorkers) {
      setScreen('order-confirmed');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Device Frame */}
      <div className="w-[370px] h-[740px] bg-[#202124] rounded-[48px] p-3 shadow-2xl border-4 border-[#202124]/40 flex flex-col relative overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="w-36 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
        </div>

        {/* Screen Canvas (Flutter Theme #FFFDF8) */}
        <div className="flex-1 bg-[#FFFDF8] rounded-[38px] overflow-hidden flex flex-col text-[#202124] select-none">
          {/* Top Bar */}
          <div className="bg-[#D71920] text-white p-4 pt-3 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              {screen !== 'home' ? (
                <button
                  onClick={() => setScreen('home')}
                  className="p-1 text-white hover:bg-black/10 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-6 h-6 rounded bg-[#FFC928] text-[#202124] font-black flex items-center justify-center text-xs">
                  M
                </div>
              )}
              <span className="font-bold text-sm tracking-tight">ManPowerLink</span>
            </div>
            <button
              onClick={() => setScreen('my-orders')}
              className="text-xs font-semibold text-[#FFC928] hover:underline"
            >
              My Orders
            </button>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. HOME SCREEN */}
            {screen === 'home' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-[#202124]/10 shadow-xs">
                  <h2 className="text-base font-extrabold text-[#202124]">
                    Find Temporary Workers
                  </h2>
                  <p className="text-xs text-[#686868] mt-0.5">
                    Connect · Hire · Get Work Done across Mangalore
                  </p>
                  <div className="mt-3 flex items-center gap-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-xl px-3 py-2 text-xs">
                    <Search className="w-4 h-4 text-[#686868]" />
                    <input
                      type="text"
                      placeholder="Search loaders, kitchen staff, cleaners..."
                      className="bg-transparent focus:outline-none w-full text-xs"
                    />
                  </div>
                </div>

                {/* Categories Grid */}
                <div>
                  <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-2">
                    Service Categories
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {categories.slice(0, 4).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setOfferedAmount(cat.fullDayRate);
                          setScreen('post-job');
                        }}
                        className="p-3 bg-white border border-[#202124]/10 rounded-xl text-left hover:border-[#D71920] transition-all flex flex-col justify-between h-24 shadow-xs cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-[#D71920] flex items-center justify-center group-hover:bg-[#D71920] group-hover:text-white transition-colors">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#202124] leading-tight">{cat.name}</p>
                          <p className="text-[10px] text-[#686868]">From ₹{cat.minPrice}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nearby Available Workers list */}
                <div>
                  <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-2">
                    Nearby Verified Laborers
                  </h3>
                  <div className="space-y-2">
                    {workers.slice(0, 3).map((w) => (
                      <div
                        key={w.id}
                        className="p-2.5 bg-white border border-[#202124]/10 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={w.avatar}
                            alt={w.name}
                            className="w-9 h-9 rounded-full object-cover border"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#202124]">{w.name}</p>
                            <p className="text-[10px] text-[#686868] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#D71920]" />
                              {w.location.city} · ★ {w.rating}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#D71920] tabular-nums">
                          ₹{w.hourlyRate}/hr
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. POST JOB / REQUIREMENTS */}
            {screen === 'post-job' && (
              <form onSubmit={handlePostJob} className="space-y-3.5">
                <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10">
                  <span className="text-[11px] text-[#686868] block">Selected Vertical</span>
                  <p className="text-sm font-bold text-[#202124]">{selectedCategory.name}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#202124] block mb-1">
                      Number of Workers Needed
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRequiredWorkers(Math.max(1, requiredWorkers - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold tabular-nums">{requiredWorkers}</span>
                      <button
                        type="button"
                        onClick={() => setRequiredWorkers(requiredWorkers + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#202124] block mb-1">
                      Offered Amount per Worker (₹)
                    </label>
                    <input
                      type="number"
                      value={offeredAmount}
                      onChange={(e) => setOfferedAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                    <span className="text-[10px] text-[#686868] mt-0.5 block">
                      Min floor: ₹{selectedCategory.minPrice}
                    </span>
                  </div>

                  {/* Dynamic Food & Tiffin Service fields if selected */}
                  {selectedCategory.dynamicFields?.isFoodTiffin && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <span className="text-xs font-bold text-amber-900 block">
                        Catering / Tiffin Service Details:
                      </span>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMorningTiffin}
                          onChange={(e) => setIsMorningTiffin(e.target.checked)}
                          className="rounded text-[#D71920]"
                        />
                        <span>Morning Tiffin required</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLunch}
                          onChange={(e) => setIsLunch(e.target.checked)}
                          className="rounded text-[#D71920]"
                        />
                        <span>Lunch serving required</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEveningTea}
                          onChange={(e) => setIsEveningTea(e.target.checked)}
                          className="rounded text-[#D71920]"
                        />
                        <span>Evening Tea / Tiffin required</span>
                      </label>
                      <div>
                        <span className="text-[11px] font-semibold block text-amber-900">
                          People to serve:
                        </span>
                        <input
                          type="number"
                          value={peopleCount}
                          onChange={(e) => setPeopleCount(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs bg-white border border-amber-300 rounded mt-0.5"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-[#202124] block mb-1">
                      Work Location
                    </label>
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Address..."
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg mb-1.5 focus:outline-none focus:border-[#D71920]"
                    />
                    <input
                      type="text"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="City..."
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#202124] block mb-1">
                      Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Post Job & Broadcast to Workers
                </button>
              </form>
            )}

            {/* 3. VIEW BIDS */}
            {screen === 'view-bids' && (
              <div className="space-y-3.5">
                <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10">
                  <span className="text-[10px] text-[#686868] uppercase font-bold tracking-wider">
                    {activeBooking?.orderNumber}
                  </span>
                  <h3 className="text-sm font-bold text-[#202124]">{activeBooking?.categoryName}</h3>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-[#686868]">
                      Filled: {activeBooking?.acceptedWorkersCount} / {activeBooking?.requiredWorkers} workers
                    </span>
                    <span className="font-bold text-[#D71920]">
                      Budget: ₹{activeBooking?.offeredPricePerWorker}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#202124]">Incoming Worker Bids:</h4>
                  {activeBooking?.bids.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl text-center text-xs text-[#686868] border border-dashed">
                      Waiting for workers to review broadcast...
                    </div>
                  ) : (
                    activeBooking?.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="p-3 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={bid.workerAvatar}
                            alt={bid.workerName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#202124]">{bid.workerName}</p>
                            <p className="text-[10px] text-[#686868]">★ {bid.workerRating}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tabular-nums">₹{bid.proposedAmount}</span>
                          {bid.status === 'accepted' ? (
                            <span className="text-[11px] font-bold text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded">
                              Accepted
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="px-2.5 py-1 bg-[#16834A] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {activeBooking?.acceptedWorkersCount >= activeBooking?.requiredWorkers && (
                  <button
                    onClick={() => setScreen('order-confirmed')}
                    className="w-full py-2.5 bg-[#FFC928] text-[#202124] font-bold text-xs rounded-xl shadow-xs"
                  >
                    View Confirmed Order & OTP
                  </button>
                )}
              </div>
            )}

            {/* 4. ORDER CONFIRMED */}
            {screen === 'order-confirmed' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-[#16834A] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#202124]">Job Confirmed!</h3>
                  <p className="text-xs text-[#686868] mt-1">
                    Workers have been assigned and are en route to your worksite.
                  </p>
                </div>

                {/* Start OTP Display */}
                <div className="bg-white p-4 rounded-2xl border border-[#202124]/10 shadow-xs">
                  <span className="text-xs text-[#686868] block">
                    Give this Start OTP to Workers upon Arrival:
                  </span>
                  <span className="text-2xl font-black font-mono text-[#D71920] tracking-widest mt-1 block">
                    {activeBooking?.startOtp}
                  </span>
                  <span className="text-[10px] text-[#686868] mt-1 block">
                    End OTP: <strong className="font-mono text-[#202124]">{activeBooking?.endOtp}</strong>
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h4 className="text-xs font-bold text-[#202124]">Assigned Workers:</h4>
                  {activeBooking?.assignedWorkers.map((w) => (
                    <div
                      key={w.workerId}
                      className="p-2.5 bg-white rounded-xl border border-[#202124]/10 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold">{w.workerName}</span>
                      <span className="text-[11px] text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setScreen('my-orders')}
                  className="w-full py-2.5 bg-[#D71920] text-white font-bold text-xs rounded-xl"
                >
                  Go to My Orders
                </button>
              </div>
            )}

            {/* 5. MY ORDERS */}
            {screen === 'my-orders' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Active & Past Orders
                </h3>
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-white rounded-xl border border-[#202124]/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#202124]">{b.orderNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-700">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#686868]">{b.categoryName}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="font-bold text-[#D71920]">
                        Start OTP: <strong className="font-mono text-black">{b.startOtp}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setActiveBookingId(b.id);
                          setScreen('view-bids');
                        }}
                        className="text-[11px] font-bold text-[#D71920] hover:underline"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
