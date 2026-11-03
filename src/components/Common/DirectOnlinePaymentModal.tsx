import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Zap,
  Building2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Lock,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  dataService,
  playNotificationSound,
  PLATFORM_UPI_ID,
  PLATFORM_UPI_NAME,
  getUpiIntentUrl,
} from '../../services/storage';

interface DirectOnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  orderNumber?: string;
  amount: number;
  customerName?: string;
  onPaymentSuccess: (paymentDetails: {
    method: string;
    transactionId: string;
    amount: number;
  }) => void;
}

export const DirectOnlinePaymentModal: React.FC<DirectOnlinePaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  orderNumber = 'Order #1045',
  amount,
  customerName = 'Employer',
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'gateway_cards' | 'gateway_netbanking' | 'direct_upi_qr'>('direct_upi_qr');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunchUpi = () => {
    const url = getUpiIntentUrl(amount, `Order ${orderNumber} Direct Payment to Admin`);
    window.location.href = url;
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (method === 'direct_upi_qr') {
      const clean = utrNumber.trim();
      if (!clean || clean.length < 6) {
        setValidationError('Please enter a valid 12-digit UPI Transaction Ref / UTR number from PhonePe/GPay.');
        return;
      }

      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const txnId = `UPI-ADM-${clean}`;
        playNotificationSound();
        onPaymentSuccess({
          method: 'PhonePe / Kotak UPI Direct to Admin',
          transactionId: txnId,
          amount,
        });
        onClose();
      }, 700);
    } else if (method === 'gateway_cards') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const txnId = `PG-CARD-${Date.now().toString().slice(-8)}`;
        playNotificationSound();
        onPaymentSuccess({
          method: 'Online Card Gateway (Direct Escrow to Admin)',
          transactionId: txnId,
          amount,
        });
        onClose();
      }, 900);
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const txnId = `PG-NB-${Date.now().toString().slice(-8)}`;
        playNotificationSound();
        onPaymentSuccess({
          method: `NetBanking (${selectedBank} Direct to Admin)`,
          transactionId: txnId,
          amount,
        });
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#1E1F23] to-[#2D3039] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white">Direct Online Payment</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/30">
                  ADMIN SECURED
                </span>
              </div>
              <p className="text-[10px] text-white/60">Pay Directly to Admin Escrow Ledger</p>
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

        {/* Amount Summary */}
        <div className="bg-amber-50/80 p-3 border-b border-amber-200/60 text-center shrink-0">
          <span className="text-[10px] font-bold text-amber-900 block">{orderNumber} Amount Payable</span>
          <span className="text-xl font-black text-[#D71920]">₹{amount.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block">Funds held in platform escrow until work verified by End OTP</span>
        </div>

        {/* Method Switcher */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl text-[10px] font-bold">
            <button
              type="button"
              onClick={() => {
                setMethod('direct_upi_qr');
                setValidationError(null);
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                method === 'direct_upi_qr' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600'
              }`}
            >
              <QrCode className="w-3 h-3 text-[#5f259f]" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('gateway_cards');
                setValidationError(null);
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                method === 'gateway_cards' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600'
              }`}
            >
              <CreditCard className="w-3 h-3 text-blue-600" />
              <span>Card PG</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('gateway_netbanking');
                setValidationError(null);
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                method === 'gateway_netbanking' ? 'bg-white text-[#D71920] shadow-xs' : 'text-slate-600'
              }`}
            >
              <Building2 className="w-3 h-3 text-emerald-600" />
              <span>NetBanking</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {validationError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-[11px] text-[#C62828] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Option 1: Direct UPI QR to Admin Account */}
          {method === 'direct_upi_qr' && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleLaunchUpi}
                className="w-full py-2 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-[11px] font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#FFC928]" />
                <span>Launch PhonePe / GPay &amp; Pay ₹{amount.toLocaleString()}</span>
              </button>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center space-y-1.5">
                <div className="inline-flex items-center gap-1 bg-[#5f259f] text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <span>PhonePe</span>
                  <span className="text-[#FFC928]">★</span>
                  <span>ADMIN DIRECT QR</span>
                </div>

                <div
                  onClick={handleLaunchUpi}
                  className="w-32 h-32 mx-auto bg-white p-2 rounded-2xl border-2 border-[#5f259f] shadow-2xs flex items-center justify-center cursor-pointer"
                  title="Click to open UPI App"
                >
                  <img
                    src="/phonepe-qr.svg"
                    alt="PhonePe QR - prnm@kotak"
                    className="w-full h-full object-contain"
                  />
                </div>

                <span className="text-[11px] font-black text-[#202124] block">{PLATFORM_UPI_NAME} .</span>

                <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-left">
                    <span className="text-[8px] text-slate-400 block font-bold">ADMIN UPI ID</span>
                    <span className="font-mono font-black text-[#5f259f] text-[10px]">{PLATFORM_UPI_ID}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(PLATFORM_UPI_ID);
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleProcessPayment} className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#202124] mb-0.5">
                    Enter 12-Digit UPI Transaction UTR / Ref <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value.replace(/[^0-9]/g, ''));
                      setValidationError(null);
                    }}
                    placeholder="e.g. 428919028371 (12 digits)"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isProcessing ? 'Verifying with Admin...' : `Verify & Direct Pay ₹${amount.toLocaleString()}`}</span>
                </button>
              </form>
            </div>
          )}

          {/* Option 2: Online Card Payment Gateway */}
          {method === 'gateway_cards' && (
            <form onSubmit={handleProcessPayment} className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4532 •••• •••• 8821"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Expiry</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#202124] mb-0.5">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="•••"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[#202124] focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#202124] mb-0.5">Cardholder Name</label>
                <input
                  type="text"
                  required
                  defaultValue={customerName}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#202124] focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-2 py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{isProcessing ? 'Processing 3DS...' : `Pay ₹${amount.toLocaleString()} Directly to Admin`}</span>
              </button>
            </form>
          )}

          {/* Option 3: NetBanking */}
          {method === 'gateway_netbanking' && (
            <form onSubmit={handleProcessPayment} className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#202124] mb-1">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-[#202124] font-medium focus:outline-none focus:border-[#D71920]"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                </select>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-900 leading-relaxed">
                Direct NetBanking will authenticate with your bank portal and deposit payment directly into the Admin escrow account.
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isProcessing ? 'Redirecting to Bank...' : `Proceed via ${selectedBank}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
