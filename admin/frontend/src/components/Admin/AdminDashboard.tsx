import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  DollarSign,
  Calendar,
  RefreshCw,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Booking, Worker, Customer, ServiceCategory } from '../../types';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardProps {
  bookings: Booking[];
  workers: Worker[];
  customers: Customer[];
  categories: ServiceCategory[];
  onNavigateTab: (tab: AdminTab) => void;
  onSelectBooking: (bookingId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings,
  workers,
  customers,
  categories,
  onNavigateTab,
  onSelectBooking,
}) => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Metrics calculations
  const totalCustomers = customers.length;
  const totalEmployees = workers.length;
  const activeEmployees = workers.filter((w) => w.isAvailable && w.approvalStatus === 'approved').length;
  const pendingApprovals = workers.filter((w) => w.approvalStatus === 'pending');

  const activeBookings = bookings.filter((b) => !['ORDER_COMPLETED', 'CANCELLED'].includes(b.status));
  const jobsAwaitingWorkers = bookings.filter((b) =>
    ['CREATED', 'SEARCHING_EMPLOYEES', 'OFFERS_SENT', 'EMPLOYEES_ACCEPTING_OR_BIDDING'].includes(b.status)
  );
  const confirmedBookings = bookings.filter((b) => ['CONFIRMED', 'REQUIRED_COUNT_REACHED'].includes(b.status));
  const ongoingJobs = bookings.filter((b) =>
    ['EMPLOYEES_TRAVELLING', 'ARRIVAL_VERIFIED', 'WORK_STARTED', 'WORK_IN_PROGRESS'].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === 'ORDER_COMPLETED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');

  const totalBookingValue = bookings.reduce((sum, b) => sum + (b.totalEstimatedAmount || 0), 0);
  const platformCommission = bookings.reduce((sum, b) => sum + (b.platformCommissionAmount || 0), 0);
  const pendingPayments = bookings
    .filter((b) => b.paymentStatus === 'pending' || b.paymentStatus === 'initiated')
    .reduce((sum, b) => sum + (b.totalEstimatedAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Date Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#202124]">
              Workforce Command & Analytics
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFC928] text-[#202124] rounded">
              LIVE MONGODB DATA
            </span>
          </div>
          <p className="text-xs text-[#686868] mt-1">
            Real-time tracking of temporary manpower allocations, bids, and settlements across Mangalore region.
          </p>
        </div>

        {/* Date Filter & Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex bg-[#FFFDF8] p-1 rounded-xl border border-[#202124]/15 text-xs">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                  dateRange === range
                    ? 'bg-[#D71920] text-white shadow-xs'
                    : 'text-[#686868] hover:text-[#202124]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh dashboard metrics"
            className="p-2 text-[#686868] hover:text-[#202124] bg-[#FFFDF8] border border-[#202124]/15 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid 1: Core Workforce & Financials */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-xl border border-[#202124]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#686868]">Total Employers</span>
            <div className="p-2 bg-[#FFC928]/20 text-[#D71920] rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#202124] tabular-nums">{totalCustomers}</span>
            <span className="text-[11px] font-medium text-[#D71920] flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +18%
            </span>
          </div>
          <p className="text-[11px] text-[#686868] mt-1">Active client companies</p>
        </div>

        {/* Total Workers & Active */}
        <div className="bg-white p-5 rounded-xl border border-[#202124]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#686868]">Total Employees</span>
            <div className="p-2 bg-[#FFC928]/30 text-[#D71920] rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#202124] tabular-nums">{totalEmployees}</span>
            <span className="text-[11px] font-semibold text-[#A80F18] bg-[#FFC928]/30 px-1.5 py-0.5 rounded">
              {activeEmployees} active on duty
            </span>
          </div>
          <p className="text-[11px] text-[#686868] mt-1">Verified manpower pool</p>
        </div>

        {/* Total Booking Value (GMV) */}
        <div className="bg-white p-5 rounded-xl border border-[#202124]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#686868]">Gross Booking Value</span>
            <div className="p-2 bg-[#D71920]/10 text-[#D71920] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#202124] tabular-nums">
              ₹{totalBookingValue.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-[#D71920]">+24%</span>
          </div>
          <p className="text-[11px] text-[#686868] mt-1">Payroll committed across shifts</p>
        </div>

        {/* Platform Commission */}
        <div className="bg-white p-5 rounded-xl border border-[#202124]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#686868]">Platform Fee</span>
            <div className="p-2 bg-[#FFC928] text-[#202124] rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#D71920] tabular-nums">
              ₹{platformCommission.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-[#A80F18]">10% avg margin</span>
          </div>
          <p className="text-[11px] text-[#686868] mt-1">Retained revenue in ledger</p>
        </div>
      </div>

      {/* KPI Stats Grid 2: Shift Lifecycle States */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10 text-xs">
          <span className="text-[#686868] block">Jobs Searching</span>
          <span className="text-lg font-bold text-[#D71920] tabular-nums">
            {jobsAwaitingWorkers.length}
          </span>
          <span className="text-[10px] text-[#686868] block mt-0.5">Broadcasting</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10 text-xs">
          <span className="text-[#686868] block">Confirmed Orders</span>
          <span className="text-lg font-bold text-[#202124] tabular-nums">
            {confirmedBookings.length}
          </span>
          <span className="text-[10px] text-[#686868] block mt-0.5">Staffed 100%</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10 text-xs">
          <span className="text-[#686868] block">Ongoing Shifts</span>
          <span className="text-lg font-bold text-[#D71920] tabular-nums">
            {ongoingJobs.length}
          </span>
          <span className="text-[10px] text-[#686868] block mt-0.5">Clocked in</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10 text-xs">
          <span className="text-[#686868] block">Completed Shifts</span>
          <span className="text-lg font-bold text-[#A80F18] tabular-nums">
            {completedBookings.length}
          </span>
          <span className="text-[10px] text-[#686868] block mt-0.5">OTP verified</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10 text-xs">
          <span className="text-[#686868] block">Pending Payments</span>
          <span className="text-lg font-bold text-[#202124] tabular-nums">
            ₹{pendingPayments.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#686868] block mt-0.5">In Escrow</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#202124]/10 text-xs">
          <span className="text-[#686868] block">Cancelled</span>
          <span className="text-lg font-bold text-[#D71920] tabular-nums">
            {cancelledBookings.length}
          </span>
          <span className="text-[10px] text-[#686868] block mt-0.5">0 no-shows</span>
        </div>
      </div>

      {/* Main Grid: Orders & Live Bidding + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#202124]/10 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#202124]">Live Orders & Worker Bids</h2>
              <p className="text-xs text-[#686868]">Incoming customer bookings, worker bidding allocations, and start OTP status</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-semibold text-[#D71920] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all orders <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#202124]/10 text-[#686868]">
                  <th className="pb-2.5 font-medium">Order ID</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Customer</th>
                  <th className="pb-2.5 font-medium">Staffing</th>
                  <th className="pb-2.5 font-medium">Budget</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202124]/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="py-3 font-semibold text-[#202124]">{booking.orderNumber}</td>
                    <td className="py-3 text-[#202124]">{booking.categoryName}</td>
                    <td className="py-3 text-[#686868]">{booking.customerName}</td>
                    <td className="py-3">
                      <span className="font-medium tabular-nums">
                        {booking.acceptedWorkersCount} / {booking.requiredWorkers}
                      </span>
                      <span className="text-[10px] text-[#686868] ml-1">workers</span>
                    </td>
                    <td className="py-3 font-medium text-[#202124] tabular-nums">
                      ₹{booking.offeredPricePerWorker}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-[#FFC928] text-[#202124]'
                            : booking.status === 'ORDER_COMPLETED'
                            ? 'bg-[#FFC928]/30 text-[#A80F18]'
                            : 'bg-[#D71920]/10 text-[#D71920]'
                        }`}
                      >
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          onSelectBooking(booking.id);
                          onNavigateTab('bookings');
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium bg-[#FFFDF8] hover:bg-[#FFC928]/20 border border-[#202124]/15 rounded text-[#202124] transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Pending Approval Alert & Service Verticals */}
        <div className="space-y-6">
          {/* Pending Applications Alert */}
          {pendingApprovals.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    {pendingApprovals.length} Worker Applications Pending
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Aadhaar verification and skill profiling required before allowing bidding on active client jobs.
                  </p>
                  <button
                    onClick={() => onNavigateTab('workers')}
                    className="mt-2 text-xs font-bold text-[#D71920] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Review Worker Queue <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-[#202124]/10 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              Quick Admin Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('categories')}
                className="w-full text-left p-2.5 bg-[#FFFDF8] hover:bg-slate-50 rounded-lg border border-[#202124]/10 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-semibold text-[#202124]">Add or Edit Service Categories</span>
                <ChevronRight className="w-4 h-4 text-[#686868]" />
              </button>
              <button
                onClick={() => onNavigateTab('commission')}
                className="w-full text-left p-2.5 bg-[#FFFDF8] hover:bg-slate-50 rounded-lg border border-[#202124]/10 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-semibold text-[#202124]">Configure Commission Rates</span>
                <ChevronRight className="w-4 h-4 text-[#686868]" />
              </button>
              <button
                onClick={() => onNavigateTab('pricing')}
                className="w-full text-left p-2.5 bg-[#FFFDF8] hover:bg-slate-50 rounded-lg border border-[#202124]/10 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-semibold text-[#202124]">Matching Radius & OTP Rules</span>
                <ChevronRight className="w-4 h-4 text-[#686868]" />
              </button>
              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full text-left p-2.5 bg-[#FFFDF8] hover:bg-slate-50 rounded-lg border border-[#202124]/10 flex items-center justify-between text-xs cursor-pointer"
              >
                <span className="font-semibold text-[#202124]">Export Financial Reports (CSV)</span>
                <ChevronRight className="w-4 h-4 text-[#686868]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
