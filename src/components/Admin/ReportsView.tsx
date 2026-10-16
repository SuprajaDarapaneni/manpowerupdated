import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { Booking } from '../../types';

interface ReportsViewProps {
  bookings: Booking[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ bookings }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalGMV = bookings.reduce((sum, b) => sum + (b.totalEstimatedAmount || 0), 0);
  const totalCommission = bookings.reduce((sum, b) => sum + (b.platformCommissionAmount || 0), 0);

  const handleExportCSV = () => {
    const headers = 'Order Number,Category,Customer,Workers,Total Amount,Commission,Status,Date\n';
    const rows = bookings
      .map(
        (b) =>
          `"${b.orderNumber}","${b.categoryName}","${b.customerName}",${b.acceptedWorkersCount}/${b.requiredWorkers},₹${b.totalEstimatedAmount},₹${b.platformCommissionAmount},"${b.status}","${b.scheduledDate}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manpowerlink_orders_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header matching PDF Screen 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Financial Reports & Settlement Analytics</h1>
          <p className="text-xs text-[#686868] mt-1">
            Reconcile gross manpower order volume, platform commissions, worker payouts, and tax liabilities.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-[#FFC928]/20 border border-[#FFC928]/40 rounded-lg flex items-center gap-2 text-xs text-[#A80F18]">
          <CheckCircle2 className="w-4 h-4 text-[#D71920]" />
          <span>Report CSV exported successfully with authentic backend transactional rows.</span>
        </div>
      )}

      {/* KPI row matching PDF Screen 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#202124]/10 shadow-xs">
          <span className="text-xs text-[#686868] font-medium">Lifetime Orders Placed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#202124] tabular-nums">583</span>
            <span className="text-xs font-semibold text-[#D71920]">+12% this month</span>
          </div>
          <p className="text-[11px] text-[#686868] mt-1">Temporary worker shifts booked</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#202124]/10 shadow-xs">
          <span className="text-xs text-[#686868] font-medium">Gross Booking Volume (GMV)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#202124] tabular-nums">₹1,25,600</span>
            <span className="text-xs font-semibold text-[#D71920]">Target 100%</span>
          </div>
          <p className="text-[11px] text-[#686868] mt-1">Total customer payroll committed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#202124]/10 shadow-xs">
          <span className="text-xs text-[#686868] font-medium">Platform Fee Retained</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#D71920] tabular-nums">₹12,560</span>
            <span className="text-xs font-semibold text-[#A80F18]">10% avg margin</span>
          </div>
          <p className="text-[11px] text-[#686868] mt-1">Platform fee retained in settlement</p>
        </div>
      </div>

      {/* Monthly Chart Bar Breakdown */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#202124] mb-4">
          Weekly Booking Growth & Settlement Volume
        </h3>

        <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-[#202124]/10">
          {[
            { day: 'Mon', gmv: 18000, height: '45%' },
            { day: 'Tue', gmv: 24000, height: '60%' },
            { day: 'Wed', gmv: 31000, height: '75%' },
            { day: 'Thu', gmv: 28000, height: '68%' },
            { day: 'Fri', gmv: 42000, height: '95%' },
            { day: 'Sat', gmv: 38000, height: '88%' },
            { day: 'Sun', gmv: 19000, height: '48%' },
          ].map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                className="w-full max-w-[40px] bg-gradient-to-t from-[#D71920] to-[#FFC928] rounded-t-md transition-all hover:opacity-90"
                style={{ height: item.height }}
                title={`${item.day}: ₹${item.gmv.toLocaleString()}`}
              />
              <span className="text-[10px] font-semibold text-[#686868]">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
