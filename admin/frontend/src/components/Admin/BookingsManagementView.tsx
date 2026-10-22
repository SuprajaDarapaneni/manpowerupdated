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
  Plus,
  Trash2,
  X,
  FileText,
  DollarSign,
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
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

  const customers = dataService.getCustomers();
  const categories = dataService.getCategories();

  // Create order form state
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || 'c-1',
    categoryId: categories[0]?.id || 'cat-1',
    jobTitle: 'Loading and moving inventory cartons',
    requiredWorkers: 2,
    pricingModel: 'hourly' as 'hourly' | 'full_package',
    pricePerHourPerHead: 250,
    shiftHours: 8,
    offeredPricePerWorker: 2000,
    packageTitle: 'Full Day Turnkey Logistics Package',
    packageApproxHours: 8,
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    address: 'Mangalore Port Warehouse, Gate 4',
    remarks: 'Requires safety boots, gloves, and hard hats. Punctuality is strictly required.',
  });

  const currentBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0];

  const handleAcceptBid = (bidId: string) => {
    if (!currentBooking) return;
    dataService.acceptBid(currentBooking.id, bidId);
  };

  const handleUpdateStatus = (newStatus: Booking['status']) => {
    if (!currentBooking) return;
    dataService.updateBookingStatus(currentBooking.id, newStatus);
  };

  const handleDeleteBooking = (bookingId: string, orderNumber: string) => {
    if (confirm(`Are you sure you want to cancel and delete "${orderNumber}"?`)) {
      dataService.deleteBooking(bookingId);
      const remaining = bookings.filter((b) => b.id !== bookingId);
      if (remaining.length > 0) {
        setActiveBookingId(remaining[0].id);
      }
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === formData.customerId) || customers[0];
    const category = categories.find((c) => c.id === formData.categoryId) || categories[0];

    const totalEst =
      formData.pricingModel === 'hourly'
        ? formData.pricePerHourPerHead * formData.shiftHours * formData.requiredWorkers
        : formData.offeredPricePerWorker * formData.requiredWorkers;

    const newBooking = dataService.createBooking({
      customerId: customer?.id || 'c-1',
      customerName: customer?.name || 'Enterprise Employer',
      customerPhone: customer?.phone || '+91 99001 55432',
      categoryId: category?.id || 'cat-1',
      categoryName: category?.name || 'General Labor',
      jobTitle: formData.jobTitle,
      requiredWorkers: Number(formData.requiredWorkers) || 1,
      mode: 'fixed_price',
      offeredPricePerWorker: formData.pricingModel === 'hourly'
        ? formData.pricePerHourPerHead * formData.shiftHours
        : Number(formData.offeredPricePerWorker) || 2000,
      totalEstimatedAmount: totalEst,
      pricingModel: formData.pricingModel,
      pricePerHourPerHead: formData.pricePerHourPerHead,
      shiftHours: formData.shiftHours,
      packageTitle: formData.packageTitle,
      packageApproxHours: Number(formData.packageApproxHours) || 8,
      scheduledDate: formData.scheduledDate,
      startTime: formData.startTime,
      remarks: formData.remarks,
      specialInstructions: formData.remarks,
      workLocation: {
        address: formData.address,
        city: 'Mangalore, Karnataka',
        lat: 12.914,
        lng: 74.856,
      },
    });

    setIsCreatingOrder(false);
    if (newBooking?.id) {
      setActiveBookingId(newBooking.id);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingOrder(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dispatch Order</span>
          </button>
          {currentBooking && (
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
          )}
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
            <option value="SEARCHING_EMPLOYEES">Searching Employees</option>
            <option value="OFFERS_SENT">Offers Sent / Bidding</option>
            <option value="CONFIRMED">Confirmed / Staffed</option>
            <option value="WORK_STARTED">Work In Progress</option>
            <option value="ORDER_COMPLETED">Order Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Details Grid */}
      {currentBooking ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Order Overview + Bids Received */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Overview Card */}
            <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-[#202124]/10 gap-3">
                <div>
                  <span className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
                    Order Details
                  </span>
                  <h2 className="text-lg font-bold text-[#202124] mt-0.5">
                    {currentBooking.orderNumber} — {currentBooking.categoryName}
                  </h2>
                  <p className="text-xs text-[#686868]">{currentBooking.customerName} ({currentBooking.customerPhone})</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#686868]">Change Status:</span>
                    <select
                      value={currentBooking.status}
                      onChange={(e) => handleUpdateStatus(e.target.value as any)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#202124]/15 bg-[#FFFDF8] focus:outline-none focus:border-[#D71920]"
                    >
                      <option value="SEARCHING_EMPLOYEES">SEARCHING EMPLOYEES</option>
                      <option value="OFFERS_SENT">OFFERS SENT</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="WORKER_ARRIVED">WORKER ARRIVED</option>
                      <option value="WORK_STARTED">WORK STARTED</option>
                      <option value="ORDER_COMPLETED">ORDER COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleDeleteBooking(currentBooking.id, currentBooking.orderNumber)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Cancel and Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spec strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#202124]/10 text-xs">
                <div>
                  <span className="text-[#686868] block">Location</span>
                  <span className="font-semibold text-[#202124] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D71920] shrink-0" />
                    {currentBooking.workLocation.address}
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Schedule</span>
                  <span className="font-semibold text-[#202124] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D71920] shrink-0" />
                    {currentBooking.scheduledDate} ({currentBooking.startTime})
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Workers Needed</span>
                  <span className="font-semibold text-[#202124] flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#D71920] shrink-0" />
                    {currentBooking.acceptedWorkersCount} / {currentBooking.requiredWorkers} assigned
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Total Order Value</span>
                  <span className="font-bold text-[#D71920] text-sm tabular-nums mt-0.5 block">
                    ₹{currentBooking.totalEstimatedAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pricing Model & Remarks Banner */}
              <div className="py-3 px-4 my-4 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-[#FFC928] text-[#202124]">
                      {currentBooking.pricingModel === 'full_package' ? 'Full Turnkey Package' : 'Hourly Basis'}
                    </span>
                    {currentBooking.pricePerHourPerHead && (
                      <span className="font-semibold text-[#202124]">
                        ₹{currentBooking.pricePerHourPerHead}/hr/head ({currentBooking.shiftHours || 8} hrs)
                      </span>
                    )}
                    {currentBooking.packageApproxHours && (
                      <span className="text-[#686868]">
                        Approx Duration: {currentBooking.packageApproxHours}
                      </span>
                    )}
                  </div>
                  <span className="text-[#686868]">
                    Platform Fee: ₹{currentBooking.platformCommissionAmount} ({currentBooking.platformCommissionRate}%)
                  </span>
                </div>

                {/* Additional Remarks Field */}
                {(currentBooking.remarks || currentBooking.specialInstructions) && (
                  <div className="pt-2 border-t border-[#202124]/5">
                    <span className="font-semibold text-[#202124] block">Additional Remarks / Job Note:</span>
                    <p className="text-[#686868] italic mt-0.5">
                      "{currentBooking.remarks || currentBooking.specialInstructions}"
                    </p>
                  </div>
                )}
              </div>

              {/* Attendance & Verification OTP strip */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#D71920]" />
                  <span className="font-semibold text-[#202124]">Start OTP:</span>
                  <span className="font-mono text-sm font-bold text-[#D71920] bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {currentBooking.startOtp}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-[#202124]">End OTP:</span>
                  <span className="font-mono text-sm font-bold text-[#202124] bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {currentBooking.endOtp}
                  </span>
                </div>
                <div className="text-[11px] text-[#686868]">
                  Verified on-site by worker & employer
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
                            <span className="flex items-center gap-1 px-3 py-1 bg-[#FFC928]/30 text-[#A80F18] text-xs font-bold rounded-lg border border-[#FFC928]/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D71920]" />
                              Accepted
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="px-3.5 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Accept Bid
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

          {/* Right Col: Confirmed Workforce & Timeline */}
          <div className="space-y-6">
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFC928]/30 text-[#A80F18]">
                        {worker.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shift Timeline */}
            <div className="bg-white rounded-2xl border border-[#202124]/10 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
                Shift Status Progression
              </h3>
              <div className="space-y-3 text-xs">
                {(currentBooking.timelineTree || []).map((node, i) => (
                  <div key={node.id} className="flex items-start gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        node.completed
                          ? 'bg-[#D71920] text-white'
                          : 'bg-neutral-200 text-[#686868]'
                      }`}
                    >
                      {node.completed ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${node.completed ? 'text-[#202124]' : 'text-[#686868]'}`}>
                        {node.title}
                      </p>
                      <p className="text-[11px] text-[#686868]">{node.description}</p>
                      <span className="text-[10px] text-[#A80F18] font-mono">{node.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-[#202124]/10 text-center">
          <ClipboardList className="w-8 h-8 text-[#686868] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#202124]">No orders match the current filter</p>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreatingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
              <h2 className="text-base font-bold text-[#202124]">Create Dispatch Order</h2>
              <button
                onClick={() => setIsCreatingOrder(false)}
                className="p-1 text-[#686868] hover:text-[#202124] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] mb-1">
                    Employer / Customer *
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.companyName || 'Employer'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202124] mb-1">
                    Service Vertical *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Job Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g. Loading heavy containers at warehouse"
                  className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] mb-1">
                    Workers Required *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.requiredWorkers}
                    onChange={(e) => setFormData({ ...formData, requiredWorkers: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#202124] mb-1">
                    Pricing Basis *
                  </label>
                  <select
                    value={formData.pricingModel}
                    onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  >
                    <option value="hourly">Hourly Basis (₹/hr/head)</option>
                    <option value="full_package">Full Package Turnkey</option>
                  </select>
                </div>

                {formData.pricingModel === 'hourly' ? (
                  <div>
                    <label className="block font-semibold text-[#202124] mb-1">
                      Rate / Hour / Head (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerHourPerHead}
                      onChange={(e) => setFormData({ ...formData, pricePerHourPerHead: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-[#202124] mb-1">
                      Package Price / Worker (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.offeredPricePerWorker}
                      onChange={(e) => setFormData({ ...formData, offeredPricePerWorker: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] mb-1">
                    Duration / Approx Hours
                  </label>
                    <input
                      type="number"
                      value={formData.packageApproxHours}
                      onChange={(e) => setFormData({ ...formData, packageApproxHours: Number(e.target.value) || 8 })}
                      placeholder="e.g. 8"
                      className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                    />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Worksite Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Port Road, Baikampady Industrial Area"
                  className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Additional Remarks / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Safety gear required, gate clearance details, water provided on-site"
                  className="w-full px-3 py-2 bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#202124]/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingOrder(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#686868] hover:text-[#202124] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Publish Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
