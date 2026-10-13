import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  UserCheck,
  MapPin,
  Calendar,
  AlertCircle,
  Key,
  ShieldCheck,
  Phone,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Booking, WorkerBid } from '../../types';
import { dataService } from '../../services/storage';

interface BookingsManagementViewProps {
  bookings: Booking[];
  selectedBookingId?: string | null;
}

export const BookingsManagementView: React.FC<BookingsManagementViewProps> = ({
  bookings,
  selectedBookingId,
}) => {
  const [activeBookingId, setActiveBookingId] = useState<string>(
    selectedBookingId || bookings[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0];

  const handleAcceptBid = (bidId: string) => {
    if (!currentBooking) return;
    dataService.acceptBid(currentBooking.id, bidId);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!currentBooking) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#202124]/10 text-center">
        <ClipboardList className="w-8 h-8 text-[#686868] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#202124]">No orders available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Orders & Shift Lifecycle Management</h1>
          <p className="text-xs text-[#686868] mt-1">
            Monitor real-time staffing capacity, worker bidding auctions, Start/End OTP attendance verifications, and price revisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#686868]">Select Order:</span>
          <select
            value={currentBooking.id}
            onChange={(e) => setActiveBookingId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
          >
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.orderNumber} - {b.categoryName} ({b.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order #, customer, vertical..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#686868]">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
          >
            <option value="all">All States ({bookings.length})</option>
            <option value="OFFERS_SENT">Offers Sent / Bidding</option>
            <option value="CONFIRMED">Confirmed / Staffed</option>
            <option value="WORK_STARTED">Work In Progress</option>
            <option value="ORDER_COMPLETED">Order Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Overview + Bids Received */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Overview Card matching PDF Screen 3 */}
          <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs">
            <div className="flex items-start justify-between pb-4 border-b border-[#202124]/10">
              <div>
                <span className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="text-lg font-bold text-[#202124] mt-0.5">
                  {currentBooking.orderNumber} — {currentBooking.categoryName}
                </h2>
                <p className="text-xs text-[#686868]">{currentBooking.customerName}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  currentBooking.status === 'CONFIRMED'
                    ? 'bg-blue-50 text-blue-700'
                    : currentBooking.status === 'ORDER_COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {currentBooking.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Spec strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#202124]/10 text-xs">
              <div>
                <span className="text-[#686868] block">Location</span>
                <span className="font-semibold text-[#202124] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
                  {currentBooking.workLocation.city}
                </span>
              </div>
              <div>
                <span className="text-[#686868] block">Date & Time</span>
                <span className="font-semibold text-[#202124] flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFC928]" />
                  {currentBooking.scheduledDate} {currentBooking.startTime}
                </span>
              </div>
              <div>
                <span className="text-[#686868] block">Employees Required</span>
                <span className="font-semibold text-[#202124] block mt-0.5">
                  {currentBooking.requiredWorkers} workers ({currentBooking.acceptedWorkersCount} filled)
                </span>
              </div>
              <div>
                <span className="text-[#686868] block">Estimated Budget</span>
                <span className="font-semibold text-[#D71920] block mt-0.5 tabular-nums">
                  ₹{currentBooking.offeredPricePerWorker} / worker
                </span>
              </div>
            </div>

            {/* Description & site notes */}
            <div className="pt-4 text-xs">
              <span className="font-semibold text-[#202124]">Work Description:</span>
              <p className="text-[#686868] mt-1 leading-relaxed">{currentBooking.description}</p>
              {currentBooking.specialInstructions && (
                <p className="text-amber-800 bg-amber-50/70 p-2.5 rounded-lg mt-2 border border-amber-200/50">
                  <span className="font-semibold">Site Notes:</span> {currentBooking.specialInstructions}
                </p>
              )}
            </div>

            {/* Lifecycle Timeline */}
            <div className="mt-5 pt-4 border-t border-[#202124]/10">
              <h4 className="text-xs font-bold text-[#202124] mb-3">Lifecycle State Machine</h4>
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
                {[
                  { step: 'CREATED', active: true },
                  { step: 'OFFERS_SENT', active: true },
                  { step: 'CONFIRMED', active: ['CONFIRMED', 'WORK_STARTED', 'ORDER_COMPLETED'].includes(currentBooking.status) },
                  { step: 'WORK_STARTED', active: ['WORK_STARTED', 'ORDER_COMPLETED'].includes(currentBooking.status) },
                  { step: 'ORDER_COMPLETED', active: currentBooking.status === 'ORDER_COMPLETED' },
                ].map((item, idx, arr) => (
                  <React.Fragment key={item.step}>
                    <span
                      className={`px-2 py-1 rounded font-bold whitespace-nowrap ${
                        item.active
                          ? 'bg-emerald-50 text-[#16834A] border border-emerald-200'
                          : 'bg-slate-100 text-[#686868]'
                      }`}
                    >
                      {item.step}
                    </span>
                    {idx < arr.length - 1 && <ArrowRight className="w-3 h-3 text-[#686868] shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Bids Received Section */}
          <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202124]">Bids Received from Workers</h3>
                <p className="text-xs text-[#686868]">
                  Worker proposals submitted for this order. Customer or Admin can approve matching bids.
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-[#FFC928]/20 text-[#A80F18] rounded">
                {currentBooking.bids.length} Bid(s)
              </span>
            </div>

            {currentBooking.bids.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#686868] bg-[#FFFDF8] rounded-xl border border-dashed border-[#202124]/15">
                No worker bids received yet. Workers in Mangalore area are receiving broadcast offers.
              </div>
            ) : (
              <div className="space-y-3">
                {currentBooking.bids.map((bid) => {
                  const isAccepted = bid.status === 'accepted';
                  return (
                    <div
                      key={bid.id}
                      className="p-3.5 rounded-xl border border-[#202124]/10 bg-[#FFFDF8] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={bid.workerAvatar}
                          alt={bid.workerName}
                          className="w-10 h-10 rounded-full object-cover border border-[#202124]/10"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#202124]">
                              {bid.workerName}
                            </span>
                            <span className="text-[11px] text-[#686868]">
                              ★ {bid.workerRating}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#686868]">
                            Submitted: {bid.submittedAt}
                          </p>
                          {bid.note && (
                            <p className="text-[11px] text-[#202124]/80 italic mt-0.5">
                              "{bid.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-[#202124] tabular-nums">
                          ₹{bid.proposedAmount}
                        </span>

                        {isAccepted ? (
                          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-[#16834A] text-xs font-bold rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accepted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcceptBid(bid.id)}
                            className="px-3.5 py-1.5 bg-[#16834A] hover:bg-[#126639] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: OTP Codes & Confirmed Workforce */}
        <div className="space-y-6">
          {/* OTP Verification & Codes */}
          <div className="bg-white rounded-2xl border border-[#202124]/10 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
              Attendance & Verification Codes
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 flex items-center justify-between">
                <div>
                  <span className="text-[#686868] block text-[11px]">Work Start OTP</span>
                  <span className="font-mono text-base font-bold text-[#D71920] tracking-wider">
                    {currentBooking.startOtp}
                  </span>
                </div>
                <span className="text-[11px] text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  Server Verified
                </span>
              </div>

              <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 flex items-center justify-between">
                <div>
                  <span className="text-[#686868] block text-[11px]">Work Completion End OTP</span>
                  <span className="font-mono text-base font-bold text-[#202124] tracking-wider">
                    {currentBooking.endOtp}
                  </span>
                </div>
                <span className="text-[11px] text-[#686868] bg-slate-100 px-2 py-0.5 rounded font-medium">
                  Releases Escrow
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#686868] mt-3">
              Codes generated server-side. Worker submits Start OTP to begin clocked work and End OTP upon finishing to release payment.
            </p>
          </div>

          {/* Confirmed Workforce */}
          <div className="bg-white rounded-2xl border border-[#202124]/10 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                Confirmed Workforce
              </h3>
              <span className="text-xs font-bold text-[#D71920] tabular-nums">
                {currentBooking.acceptedWorkersCount} / {currentBooking.requiredWorkers}
              </span>
            </div>

            {currentBooking.assignedWorkers.length === 0 ? (
              <p className="text-xs text-[#686868]">No workers confirmed yet.</p>
            ) : (
              <div className="space-y-2.5">
                {currentBooking.assignedWorkers.map((worker) => (
                  <div
                    key={worker.workerId}
                    className="p-2.5 rounded-lg border border-[#202124]/10 bg-[#FFFDF8] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={worker.workerAvatar}
                        alt={worker.workerName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-[#202124]">{worker.workerName}</p>
                        <p className="text-[10px] text-[#686868]">{worker.workerPhone}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-[#16834A]">
                      {worker.status}
                    </span>
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
