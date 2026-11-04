import React, { useState } from 'react';
import {
  Bell,
  Send,
  Users,
  Building2,
  Sparkles,
  Volume2,
  CheckCircle2,
  Clock,
  Trash2,
  Radio,
  AlertTriangle,
  Smartphone,
  ExternalLink,
  Flame,
  ShieldAlert,
  Wallet,
  Zap,
  Info,
} from 'lucide-react';
import { dataService, playNotificationSound, playIncomingJobRingtone } from '../../services/storage';
import { AppNotification } from '../../types';

interface TemplateItem {
  id: string;
  targetRole: 'employee' | 'customer' | 'all';
  title: string;
  message: string;
  category: 'booking' | 'payment' | 'announcement' | 'chat';
  soundType: 'chime' | 'urgent_ring';
  badge: string;
  actionTab: 'find-jobs' | 'my-work' | 'profile' | 'messages' | 'home' | 'bookings';
  targetDestination: string;
}

const NOTIFICATION_TEMPLATES: TemplateItem[] = [
  // Worker / Employee Templates
  {
    id: 'emp-surge',
    targetRole: 'employee',
    title: '🔥 Demand Surge Bonus: 1.5x Wage Rate Active!',
    message: 'High demand in Baikampady & Panambur industrial hubs. Earn up to 1.5x overtime wage on all warehouse and loading shifts today!',
    category: 'booking',
    soundType: 'urgent_ring',
    badge: 'High Demand',
    actionTab: 'find-jobs',
    targetDestination: 'Shift Radar & Surge Shifts',
  },
  {
    id: 'emp-payout',
    targetRole: 'employee',
    title: '💸 Instant UPI Wallet Payouts Approved',
    message: 'Your shift earnings are available. Request an instant withdrawal directly to your personal UPI ID or bank account anytime.',
    category: 'payment',
    soundType: 'chime',
    badge: 'Wallet Payout',
    actionTab: 'profile',
    targetDestination: 'Worker Wallet & Instant UPI Payout',
  },
  {
    id: 'emp-attendance',
    targetRole: 'employee',
    title: '⏱️ Daily Attendance: Share Start OTP on Arrival',
    message: 'Remember to verify the 4-digit Start OTP with the worksite supervisor upon reaching the entrance to activate your shift timer.',
    category: 'booking',
    soundType: 'chime',
    badge: 'Attendance Rule',
    actionTab: 'my-work',
    targetDestination: 'Worksite Shift & Attendance Timer',
  },
  {
    id: 'emp-safety',
    targetRole: 'employee',
    title: '🦺 Mandatory Safety Gear Check-in',
    message: 'Safety boots and helmets are mandatory on all industrial construction and logistics shifts. Wear high-visibility gear.',
    category: 'announcement',
    soundType: 'chime',
    badge: 'Safety First',
    actionTab: 'my-work',
    targetDestination: 'Worksite Guidelines & Safety Gear',
  },
  {
    id: 'emp-zones',
    targetRole: 'employee',
    title: '📍 New Zone Added: Surathkal & Mukka Belt',
    message: 'Over 40 new logistics and manufacturing contracts launched in Surathkal. Go Online in the Employee App to receive dispatches.',
    category: 'booking',
    soundType: 'urgent_ring',
    badge: 'New Zone',
    actionTab: 'find-jobs',
    targetDestination: 'Duty Radar & Available Orders',
  },

  // Customer / Employer Templates
  {
    id: 'cust-dispatch',
    targetRole: 'customer',
    title: '⚡ Instant Labor Dispatch: Under 15 Minutes',
    message: 'Need urgent manpower? Over 50 verified workers are currently online in Mangalore ready for immediate shift allocation.',
    category: 'booking',
    soundType: 'chime',
    badge: 'Instant Manpower',
    actionTab: 'home',
    targetDestination: 'Post Job & Labor Radar',
  },
  {
    id: 'cust-upi',
    targetRole: 'customer',
    title: '📱 Instant UPI & QR Code Payments Live',
    message: 'Pay seamlessly via PhonePe, Kotak, Google Pay, or Paytm. Upload your UTR screenshot for instant admin booking verification.',
    category: 'payment',
    soundType: 'chime',
    badge: 'Payment Feature',
    actionTab: 'profile',
    targetDestination: 'Online Payment Gateway & Wallet Recharge',
  },
  {
    id: 'cust-safety',
    targetRole: 'customer',
    title: '🛡️ Fair Labor & OTP Security Assurance',
    message: 'All worker dispatches are protected with 2-step OTP attendance verification (Start OTP & End OTP) and live GPS geofencing.',
    category: 'announcement',
    soundType: 'chime',
    badge: 'Safety Assurance',
    actionTab: 'bookings',
    targetDestination: 'Active Bookings & OTP Verification',
  },
  {
    id: 'cust-monsoon',
    targetRole: 'customer',
    title: '🌧️ Weather Logistics & Waterproofing Support',
    message: 'Specialized cargo tarpaulin and warehouse drainage helpers available for heavy weather cargo operations.',
    category: 'booking',
    soundType: 'chime',
    badge: 'Specialized Labor',
    actionTab: 'home',
    targetDestination: 'Post Job (Specialized Helpers)',
  },
  {
    id: 'cust-offer',
    targetRole: 'customer',
    title: '🎉 Corporate Booking Offer: 10% Platform Fee Off',
    message: 'Book 5 or more workers for full-day shifts this week and enjoy waived platform fees on your order!',
    category: 'announcement',
    soundType: 'chime',
    badge: 'Promo Offer',
    actionTab: 'home',
    targetDestination: 'Post Job (10% Discount Applied)',
  },

  // Both / Universal Templates
  {
    id: 'all-update',
    targetRole: 'all',
    title: '📢 Important Platform Upgrade Notice',
    message: 'ManPowerLink platform has been updated with real-time GPS location tracking and instant online payment gateway verification.',
    category: 'announcement',
    soundType: 'chime',
    badge: 'System Notice',
    actionTab: 'home',
    targetDestination: 'Platform Home & Real-Time Tracking',
  },
  {
    id: 'all-festive',
    targetRole: 'all',
    title: '✨ Festive Season Workforce Guarantee',
    message: 'ManPowerLink guarantees on-demand manpower supply throughout the festival period with 24/7 dedicated dispatch support.',
    category: 'announcement',
    soundType: 'urgent_ring',
    badge: 'Festive Surge',
    actionTab: 'find-jobs',
    targetDestination: 'Duty Radar & Festive Shifts',
  },
  {
    id: 'all-support',
    targetRole: 'all',
    title: '📞 24/7 Dispatch Hotline & Support Active',
    message: 'Need help with shifts, payments, or attendance? Contact our direct support line at +91 800 555 0199 or WhatsApp anytime.',
    category: 'announcement',
    soundType: 'chime',
    badge: 'Helpline',
    actionTab: 'profile',
    targetDestination: '24/7 Helpline & WhatsApp Support',
  },
];

export const PublishNotificationsView: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<'employee' | 'customer' | 'all'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'booking' | 'payment' | 'announcement' | 'chat'>('announcement');
  const [soundType, setSoundType] = useState<'chime' | 'urgent_ring'>('chime');
  const [actionTab, setActionTab] = useState<'find-jobs' | 'my-work' | 'profile' | 'messages' | 'home' | 'bookings'>('home');
  const [targetDestination, setTargetDestination] = useState<string>('Home Screen');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Existing notifications list
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return dataService.getNotifications();
  });

  const handleApplyTemplate = (tmpl: TemplateItem) => {
    setSelectedTarget(tmpl.targetRole);
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setCategory(tmpl.category);
    setSoundType(tmpl.soundType);
    setActionTab(tmpl.actionTab);
    setTargetDestination(tmpl.targetDestination);

    if (tmpl.soundType === 'urgent_ring') {
      playIncomingJobRingtone();
    } else {
      playNotificationSound();
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter both a notification title and a message body.');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      // Dispatch notification via dataService with destination actionTab
      const newNotif = dataService.addNotification({
        recipientId: 'all',
        recipientRole: selectedTarget,
        title: title.trim(),
        message: message.trim(),
        eventType:
          category === 'payment'
            ? 'PAYMENT_RECEIVED'
            : category === 'chat'
            ? 'CHAT_MESSAGE_RECEIVED'
            : actionTab === 'my-work' || actionTab === 'bookings'
            ? 'START_OTP_VERIFIED'
            : actionTab === 'find-jobs'
            ? 'BOOKING_CREATED'
            : 'ADMIN_ANNOUNCEMENT',
        category,
        soundType,
        read: false,
        actionTab,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Play audio preview
      if (soundType === 'urgent_ring') {
        playIncomingJobRingtone();
      } else {
        playNotificationSound();
      }

      setNotifications(dataService.getNotifications());
      setIsSending(false);

      const targetLabel =
        selectedTarget === 'all'
          ? 'Both Employers and Workers (All Users)'
          : selectedTarget === 'customer'
          ? 'All Employers & Customers'
          : 'All Workers & Employees';

      setSendSuccessMsg(`Notification successfully published and broadcasted to ${targetLabel}! Device push banners and destination routing (➔ ${targetDestination}) triggered.`);

      // Clear input fields
      setTitle('');
      setMessage('');

      setTimeout(() => {
        setSendSuccessMsg(null);
      }, 6000);
    }, 400);
  };

  const handleDeleteNotification = (id: string) => {
    dataService.deleteNotification(id);
    setNotifications(dataService.getNotifications());
  };

  const filteredTemplates = NOTIFICATION_TEMPLATES.filter(
    (t) => selectedTarget === 'all' || t.targetRole === selectedTarget || t.targetRole === 'all'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#D71920] text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5 text-[#FFC928]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#202124]">
                Publish Push Notifications & Broadcasts
              </h1>
              <p className="text-xs text-[#686868] mt-0.5">
                Dispatch real-time in-app banners, ringtones, and Firebase notifications directly to Customer App, Employee App, or Both.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playIncomingJobRingtone();
            }}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#A80F18] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#D71920]" />
            <span>Test Urgent Ring</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playNotificationSound();
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>Test Chime</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {sendSuccessMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-900 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-bold">Broadcast Published Successfully!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">{sendSuccessMsg}</p>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Composer + Live Smartphone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Notification Form & Quick Templates (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Target Audience Selector */}
          <div className="bg-white p-5 rounded-2xl border border-[#202124]/10 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider">
              Step 1: Select Target Recipients
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTarget('all')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                  selectedTarget === 'all'
                    ? 'border-[#D71920] bg-red-50/50 shadow-xs ring-2 ring-[#D71920]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#202124]">Both (All Users)</h4>
                  <p className="text-[10px] text-slate-500">Employers + Workers</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTarget('customer')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                  selectedTarget === 'customer'
                    ? 'border-[#D71920] bg-red-50/50 shadow-xs ring-2 ring-[#D71920]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#202124]">Customer App</h4>
                  <p className="text-[10px] text-slate-500">Employers & Clients</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTarget('employee')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                  selectedTarget === 'employee'
                    ? 'border-[#D71920] bg-red-50/50 shadow-xs ring-2 ring-[#D71920]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#202124]">Employee App</h4>
                  <p className="text-[10px] text-slate-500">Workers & Partners</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Ready-Made Templates for Quick 1-Click Fill */}
          <div className="bg-white p-5 rounded-2xl border border-[#202124]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFC928]" />
                <span>Step 2: Choose Ready-Made Template (Or Type Custom)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Click template to auto-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleApplyTemplate(t)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-[#D71920] hover:bg-amber-50/40 transition-all cursor-pointer space-y-1.5 group text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-[#FFC928]/30 text-slate-700">
                      {t.badge}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {t.targetRole === 'all' ? 'All Users' : t.targetRole}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-[#202124] group-hover:text-[#D71920] line-clamp-1">
                    {t.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {t.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Notification Composer Form */}
          <form
            onSubmit={handleSendNotification}
            className="bg-white p-5 rounded-2xl border border-[#202124]/10 shadow-xs space-y-4"
          >
            <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider">
              Step 3: Notification Details & Sound
            </label>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🔥 High Demand Surge: 1.5x Wage Rate in Baikampady Hub"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920] focus:bg-white text-[#202124] font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the update, worksite notice, bonus incentive, or shift details..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920] focus:bg-white text-[#202124] font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Category Tag
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D71920] font-medium text-[#202124]"
                >
                  <option value="announcement">Announcement / Broadcast</option>
                  <option value="booking">Job & Shift Alert</option>
                  <option value="payment">Payment & Payout Update</option>
                  <option value="chat">Priority Message</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Alert Sound & Ringtone
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSoundType('chime');
                      playNotificationSound();
                    }}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      soundType === 'chime'
                        ? 'bg-[#16834A] text-white border-[#16834A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Gentle Chime</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSoundType('urgent_ring');
                      playIncomingJobRingtone();
                    }}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      soundType === 'urgent_ring'
                        ? 'bg-[#D71920] text-white border-[#D71920]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Urgent Ring</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3.5: Destination Screen Target (Reacts on Tap) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Tap Destination Screen <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ➔ Opens: {targetDestination}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionTab('find-jobs');
                    setTargetDestination('Shift Radar & Available Shifts');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    actionTab === 'find-jobs'
                      ? 'border-[#D71920] bg-red-50/50 ring-2 ring-[#D71920]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">🔍 Shift Radar</span>
                  <span className="text-[10px] text-slate-500">Find Jobs / Bidding</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionTab('my-work');
                    setTargetDestination('Active Worksite & Attendance OTP');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    actionTab === 'my-work'
                      ? 'border-[#D71920] bg-red-50/50 ring-2 ring-[#D71920]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">⏱️ Active Worksite</span>
                  <span className="text-[10px] text-slate-500">Shift Timer & OTPs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionTab('profile');
                    setTargetDestination('Prepaid Wallet & UPI Payouts');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    actionTab === 'profile'
                      ? 'border-[#D71920] bg-red-50/50 ring-2 ring-[#D71920]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">💳 Wallet & UPI</span>
                  <span className="text-[10px] text-slate-500">Top-Up & Withdrawal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionTab('home');
                    setTargetDestination('Post Job / Home Dashboard');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    actionTab === 'home'
                      ? 'border-[#D71920] bg-red-50/50 ring-2 ring-[#D71920]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">📝 Post Job / Home</span>
                  <span className="text-[10px] text-slate-500">Employer Dispatch</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionTab('bookings');
                    setTargetDestination('Customer Bookings & Orders');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    actionTab === 'bookings'
                      ? 'border-[#D71920] bg-red-50/50 ring-2 ring-[#D71920]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">📋 Active Bookings</span>
                  <span className="text-[10px] text-slate-500">Employer Shift Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionTab('messages');
                    setTargetDestination('Realtime Chat & Support');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    actionTab === 'messages'
                      ? 'border-[#D71920] bg-red-50/50 ring-2 ring-[#D71920]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-[#202124] block">💬 Chat & Support</span>
                  <span className="text-[10px] text-slate-500">Live Messages</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Audience: <strong className="text-slate-800 capitalize">{selectedTarget}</strong> &bull; Target: <strong className="text-emerald-700">{targetDestination}</strong>
              </span>

              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 bg-[#D71920] hover:bg-[#A80F18] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#FFC928]" />
                <span>{isSending ? 'Broadcasting...' : 'Publish & Send Notification'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Realistic Smartphone Push Banner Mockup (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1E1F23] rounded-3xl p-5 text-white shadow-xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#FFC928]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Device Push Preview
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                REAL-TIME SYNC
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              When clicked by worker or customer, app instantly navigates to <strong className="text-[#FFC928]">{targetDestination}</strong>:
            </p>

            {/* Mobile Push Toast Mockup */}
            <div className="bg-[#2D3039] p-3.5 rounded-2xl border-2 border-[#FFC928]/40 shadow-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#D71920] flex items-center justify-center font-black text-[11px] text-[#FFC928] shadow-xs">
                    M
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-white block leading-tight">
                      ManPowerLink
                    </span>
                    <span className="text-[9px] font-mono text-[#FFC928]">
                      {selectedTarget === 'all'
                        ? 'Universal Broadcast'
                        : selectedTarget === 'customer'
                        ? 'Employer Notice'
                        : 'Partner Shift Alert'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Just now</span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  {title || '🔥 Demand Surge Bonus: 1.5x Wage Rate Active'}
                </h5>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {message || 'Earn up to 1.5x overtime wage on all warehouse and loading shifts today in Baikampady.'}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-[#FFC928]">
                  <Volume2 className="w-3 h-3" />
                  <span>{soundType === 'urgent_ring' ? 'Urgent Ringtone' : 'Gentle Chime'}</span>
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Tap opens ➔ {targetDestination}
                </span>
              </div>
            </div>

            {/* Target Delivery Stats */}
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Registered Employers:</span>
                <span className="font-bold text-white">Apex Logistics + 41 others</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Registered Workers:</span>
                <span className="font-bold text-white">Ramesh Kumar + 158 verified</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Firebase Firestore Sync:</span>
                <span className="font-bold text-emerald-400">Active (collection: notifications)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Published Notifications History Table */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D71920]" />
            <h3 className="text-sm font-extrabold text-[#202124]">
              Published Notifications Log ({notifications.length} dispatches)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              dataService.clearNotifications();
              setNotifications([]);
            }}
            className="text-xs text-red-600 hover:text-red-800 font-bold cursor-pointer"
          >
            Clear History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Title &amp; Content</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Sound</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.slice(0, 15).map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.recipientRole === 'all'
                          ? 'bg-purple-100 text-purple-800'
                          : n.recipientRole === 'customer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {n.recipientRole === 'all'
                        ? 'All Users'
                        : n.recipientRole === 'customer'
                        ? 'Customer'
                        : 'Worker'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#202124]">{n.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{n.message}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="capitalize text-[11px] text-slate-600 font-medium">
                      {n.category || 'Notification'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[10px] font-mono text-slate-500">
                      {n.soundType === 'urgent_ring' ? '🔔 Urgent Ring' : '🎵 Chime'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[10px]">
                    {n.timestamp}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleDeleteNotification(n.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No notifications published yet. Use the composer above to broadcast.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
