import React, { useState } from 'react';
import {
  Wallet,
  Zap,
  QrCode,
  Building2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  dataService,
  playNotificationSound,
  PLATFORM_UPI_ID,
  PLATFORM_UPI_NAME,
  getUpiIntentUrl,
} from '../../services/storage';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId?: string;
  workerName: string;
  currentBalance: number;
  minBalanceRequired?: number;
  onTopUpSuccess?: (amountOrBalance: number, txIdOrAmount?: any) => void;
}

export const WalletTopUpModal: React.FC<WalletTopUpModalProps> = ({
  isOpen,
  onClose,
  workerId,
  workerName,
  currentBalance,
  minBalanceRequired = -200,
  onTopUpSuccess,
}) => {
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [method, setMethod] = useState<'upi_qr' | 'online_gateway' | 'netbanking'>('upi_qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  const handleLaunchUpi = () => {
    const url = getUpiIntentUrl(effectiveAmount, `Worker Wallet Top-up for ${workerName}`);
    window.location.href = url;
  };

  const handleExecuteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (effectiveAmount < 100) {
      setError('Minimum top-up amount is ₹100.');
      return;
    }

    if (method === 'upi_qr') {
      const clean = utrNumber.trim();
      if (!clean || clean.length < 6) {
        setError('Please enter a valid 12-digit UPI Reference / UTR Number from your PhonePe/GPay transaction.');
        return;
      }

      const effectiveWorkerId = workerId || 'w-1';
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const result = dataService.rechargeWorkerWallet(effectiveWorkerId, effectiveAmount, `PhonePe UPI (UTR: ${clean})`);
        if (result.success) {
          playNotificationSound();
          if (onTopUpSuccess) {
            onTopUpSuccess(result.newBalance, effectiveAmount);
          }
          onClose();
        }
      }, 700);
    } else {
      const effectiveWorkerId = workerId || 'w-1';
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const result = dataService.rechargeWorkerWallet(effectiveWorkerId, effectiveAmount, method === 'online_gateway' ? 'Card PG Gateway' : 'NetBanking');
        if (result.success) {
          playNotificationSound();
          if (onTopUpSuccess) {
            onTopUpSuccess(result.newBalance, effectiveAmount);
          }
          onClose();
        }
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#1E1F23] to-[#2D3039] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFC928] text-[#202124] flex items-center justify-center font-black shadow-xs">
              <Wallet className="w-5 h-5 text-[#202124]" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">Top Up Worker Wallet</h3>
              <p className="text-[10px] text-white/60">Receive Shift Radar &amp; Instant Commission Debits</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-amber-50 p-3 border-b border-amber-200/60 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold text-amber-900 block">Current Balance</span>
            <span className={`text-xl font-black ${currentBalance < minBalanceRequired ? 'text-red-600' : 'text-[#202124]'}`}>
              ₹{currentBalance.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block">Min Balance to Work</span>
            <span className="text-xs font-extrabold text-amber-800">₹{minBalanceRequired}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-[#C62828] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Amount Chips */}
          <div>
            <label className="block text-[11px] font-bold text-[#202124] mb-1.5">
              Select Recharge Amount
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[200, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    amount === preset && !customAmount
                      ? 'bg-[#D71920] text-white border-[#D71920] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Or enter custom amount (e.g. ₹750)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full mt-2 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
            />
          </div>

          {/* Payment Method Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-[#202124] mb-1.5">
              Recharge Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setMethod('upi_qr')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  method === 'upi_qr' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600'
                }`}
              >
                <QrCode className="w-3 h-3 text-[#5f259f]" />
                <span>PhonePe QR</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('online_gateway')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  method === 'online_gateway' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600'
                }`}
              >
                <CreditCard className="w-3 h-3 text-blue-600" />
                <span>Card PG</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  method === 'netbanking' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600'
                }`}
              >
                <Building2 className="w-3 h-3 text-emerald-600" />
                <span>NetBanking</span>
              </button>
            </div>
          </div>

          {/* UPI Flow */}
          {method === 'upi_qr' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleLaunchUpi}
                className="w-full py-2 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-[11px] font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#FFC928]" />
                <span>Open PhonePe / UPI &amp; Pay ₹{effectiveAmount.toLocaleString()}</span>
              </button>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center space-y-1">
                <div
                  onClick={handleLaunchUpi}
                  className="w-28 h-28 mx-auto bg-white p-1.5 rounded-2xl border-2 border-[#5f259f] shadow-2xs flex items-center justify-center cursor-pointer"
                >
                  <img src="/phonepe-qr.svg" alt="PhonePe QR" className="w-full h-full object-contain" />
                </div>
                <div className="text-[10px] font-mono text-[#5f259f] font-bold">
                  {PLATFORM_UPI_ID}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#202124] mb-0.5">
                  Enter 12-Digit Transaction UTR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 428919028371"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                />
              </div>
            </div>
          )}

          {method !== 'upi_qr' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
              Online {method === 'online_gateway' ? 'Card Gateway' : 'NetBanking'} will authorize ₹{effectiveAmount.toLocaleString()} directly from your account and credit your worker wallet immediately.
            </div>
          )}

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleExecuteTopUp}
            className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928]" />
            )}
            <span>{isProcessing ? 'Crediting Wallet...' : `Top Up ₹${effectiveAmount.toLocaleString()} Now`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
