import React, { useState } from 'react';
import { Percent, CheckCircle2, Shield, Info, DollarSign, CreditCard, Banknote, Clock } from 'lucide-react';
import { CommissionSettings, Booking } from '../../types';
import { dataService } from '../../services/storage';

interface CommissionSetupViewProps {
  initialSettings: CommissionSettings;
}

export const CommissionSetupView: React.FC<CommissionSetupViewProps> = ({
  initialSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'commission-rules' | 'transactions' | 'settlements'>('commission-rules');
  const [type, setType] = useState<'percentage' | 'fixed'>(initialSettings.type);
  const [percentageValue, setPercentageValue] = useState<number>(initialSettings.percentageValue);
  const [fixedValue, setFixedValue] = useState<number>(initialSettings.fixedValue);
  const [payer, setPayer] = useState<'customer' | 'worker' | 'split'>(initialSettings.payer);
  const [taxRate, setTaxRate] = useState<number>(initialSettings.taxRate);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const bookings = dataService.getBookings();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.setCommissionSettings({
      type,
      percentageValue: Number(percentageValue) || 10,
      fixedValue: Number(fixedValue) || 50,
      payer,
      taxRate: Number(taxRate) || 5,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Commission, Payments & Settlements</h1>
          <p className="text-xs text-[#686868] mt-1">
            Configure platform fees, inspect customer online/cash payment receipts, and reconcile worker payouts.
          </p>
        </div>
        <div className="flex bg-[#FFFDF8] p-1 rounded-xl border border-[#202124]/15">
          <button
            onClick={() => setActiveTab('commission-rules')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'commission-rules' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Commission Rules
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'transactions' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Transactions ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'settlements' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Settlements & Ledger
          </button>
        </div>
      </div>

      {activeTab === 'commission-rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form matching PDF screen 4 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs">
            {savedSuccess && (
              <div className="mb-4 p-3 bg-[#FFC928]/20 border border-[#FFC928]/40 rounded-lg flex items-center gap-2 text-xs text-[#A80F18]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D71920]" />
                <span>Commission rules updated successfully and applied to all incoming orders.</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
                  Commission Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      type === 'percentage'
                        ? 'border-[#D71920] bg-red-50/20 shadow-xs'
                        : 'border-[#202124]/15 hover:border-[#202124]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="commissionType"
                        checked={type === 'percentage'}
                        onChange={() => setType('percentage')}
                        className="text-[#D71920] focus:ring-[#D71920]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#202124]">Percentage Based</p>
                        <p className="text-[11px] text-[#686868]">Example: 10% of transaction amount</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      type === 'fixed'
                        ? 'border-[#D71920] bg-red-50/20 shadow-xs'
                        : 'border-[#202124]/15 hover:border-[#202124]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="commissionType"
                        checked={type === 'fixed'}
                        onChange={() => setType('fixed')}
                        className="text-[#D71920] focus:ring-[#D71920]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#202124]">Fixed Amount</p>
                        <p className="text-[11px] text-[#686868]">Example: ₹50 flat fee per order</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                    Percentage Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={percentageValue}
                      onChange={(e) => setPercentageValue(Number(e.target.value))}
                      disabled={type !== 'percentage'}
                      className="w-full px-3 py-2 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920] disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#686868]">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                    Fixed Fee Amount (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={fixedValue}
                      onChange={(e) => setFixedValue(Number(e.target.value))}
                      disabled={type !== 'fixed'}
                      className="w-full px-3 py-2 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920] disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#686868]">
                      ₹
                    </span>
                  </div>
                </div>
              </div>

              {/* Payer Configuration */}
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                  Commission Payer Attribution
                </label>
                <select
                  value={payer}
                  onChange={(e) => setPayer(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                >
                  <option value="customer">Employer / Customer pays platform fee on booking</option>
                  <option value="worker">Deducted from Worker final payout settlement</option>
                  <option value="split">Split equally between Customer & Worker (50/50)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Save Commission Configuration
              </button>
            </form>
          </div>

          {/* Right Col: Concept Explanation Card */}
          <div className="space-y-4">
            <div className="bg-[#FFC928]/15 border border-[#FFC928]/40 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-[#A80F18] uppercase tracking-wider mb-2">
                Commission Model
              </h3>
              <p className="text-xs text-[#202124] leading-relaxed">
                Admin can set commission in two ways:
              </p>
              <div className="mt-3 space-y-2 text-xs text-[#202124]">
                <div className="p-2.5 bg-white/80 rounded-lg border border-[#FFC928]/30">
                  <span className="font-bold text-[#D71920]">1. Percentage Based:</span>
                  <p className="text-[11px] text-[#686868] mt-0.5">
                    Example: 10% of total booking value. Great for larger full-day manpower jobs.
                  </p>
                </div>
                <div className="p-2.5 bg-white/80 rounded-lg border border-[#FFC928]/30">
                  <span className="font-bold text-[#D71920]">2. Fixed Amount:</span>
                  <p className="text-[11px] text-[#686868] mt-0.5">
                    Example: ₹50 per order. Predictable fee structure for short-duration tasks.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[#A80F18] mt-3 italic">
                "More Work, More Opportunities, Better Community" — ManPowerLink
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 font-semibold">Gross Amount</th>
                <th className="py-3 px-4 font-semibold">Commission</th>
                <th className="py-3 px-4 font-semibold">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#202124]">{b.orderNumber}</td>
                  <td className="py-3 px-4 text-[#202124]">{b.customerName}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="flex items-center gap-1.5">
                      {b.paymentMethod === 'cash' ? (
                        <Banknote className="w-4 h-4 text-[#D71920]" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-[#D71920]" />
                      )}
                      {b.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#202124] tabular-nums">
                    ₹{b.totalEstimatedAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#D71920] tabular-nums">
                    ₹{b.platformCommissionAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.paymentStatus === 'successful'
                          ? 'bg-[#FFC928] text-[#202124]'
                          : b.paymentStatus === 'initiated'
                          ? 'bg-[#FFC928]/30 text-[#A80F18]'
                          : 'bg-[#D71920]/10 text-[#D71920]'
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#202124]">Worker Payout Settlements & Reconciliation</h2>
          <p className="text-xs text-[#686868]">
            Automated reconciliation between online payment gateway deposits and worker bank settlements after completion OTP verification.
          </p>
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#202124] block">Order #1044 — Food & Catering Service</span>
                <span className="text-[11px] text-[#686868]">2 workers · Completed · Full settlement reconciled</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#D71920] block tabular-nums">₹2,700 Disbursed</span>
                <span className="text-[10px] text-[#686868]">Platform Fee: ₹300</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#202124] block">Order #1043 — Commercial Cleaning</span>
                <span className="text-[11px] text-[#686868]">1 worker (Anil Poojary) · Cash collected on site</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#D71920] block tabular-nums">₹810 Net Pay</span>
                <span className="text-[10px] text-[#686868]">Platform Fee: ₹90 (Adjusted via wallet)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
