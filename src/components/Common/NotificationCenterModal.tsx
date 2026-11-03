import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  X,
  CreditCard,
  MessageSquare,
  Briefcase,
  AlertTriangle,
  Radio,
  Check,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { AppNotification } from '../../types';
import { dataService, playNotificationSound } from '../../services/storage';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientRole?: 'customer' | 'employee' | 'admin';
  role?: 'customer' | 'employee' | 'admin';
  recipientId?: string;
  title?: string;
  onNavigateAction?: (bookingId?: string, actionTab?: string) => void;
  onNavigate?: (actionTab?: string, bookingId?: string) => void;
}

type FilterCategory = 'all' | 'booking' | 'chat' | 'payment' | 'announcement';

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  recipientRole,
  role,
  recipientId,
  title,
  onNavigateAction,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const effectiveRole = recipientRole || role || 'admin';
  const allNotifications = dataService.getNotificationsForRole(effectiveRole, recipientId);
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const filteredNotifications = allNotifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'booking') return n.category === 'booking' || n.eventType.includes('BOOKING') || n.eventType.includes('BID') || n.eventType.includes('WORK');
    if (filter === 'chat') return n.category === 'chat' || n.eventType.includes('CHAT');
    if (filter === 'payment') return n.category === 'payment' || n.eventType.includes('PAYMENT') || n.eventType.includes('PAYOUT');
    if (filter === 'announcement') return n.category === 'announcement' || n.eventType === 'ADMIN_ANNOUNCEMENT';
    return true;
  });

  const handleMarkAllRead = () => {
    dataService.markAllNotificationsRead(effectiveRole, recipientId);
    playNotificationSound();
  };

  const handleClearAll = () => {
    dataService.clearNotifications(effectiveRole);
    setShowConfirmClear(false);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      dataService.markNotificationRead(notif.id);
    }
    const targetTab = notif.actionTab || (notif.category === 'chat' || notif.eventType.includes('CHAT') ? 'messages' : 'bookings');
    if (onNavigate) {
      onNavigate(targetTab, notif.bookingId);
      onClose();
    } else if (onNavigateAction) {
      onNavigateAction(notif.bookingId, targetTab);
      onClose();
    }
  };

  const getCategoryIcon = (notif: AppNotification) => {
    if (notif.category === 'chat' || notif.eventType.includes('CHAT')) {
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
    if (notif.category === 'payment' || notif.eventType.includes('PAYMENT') || notif.eventType.includes('PAYOUT')) {
      return <CreditCard className="w-4 h-4 text-emerald-500" />;
    }
    if (notif.category === 'announcement' || notif.eventType === 'ADMIN_ANNOUNCEMENT') {
      return <Megaphone className="w-4 h-4 text-purple-500" />;
    }
    if (notif.eventType === 'BOOKING_CREATED') {
      return <Radio className="w-4 h-4 text-[#D71920] animate-pulse" />;
    }
    return <Briefcase className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#1E1F23] to-[#2D3039] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D71920] flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#FFC928] text-[#202124]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/60">
                {recipientRole === 'customer' ? 'Employer Inbox & Alerts' : recipientRole === 'employee' ? 'Worker Radar & Shifts' : 'Admin Operations Alerts'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2 py-1 text-[10px] font-bold text-[#FFC928] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 bg-slate-50">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#D71920] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            All ({allNotifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('booking')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'booking'
                ? 'bg-[#D71920] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            Orders &amp; Shifts
          </button>
          <button
            type="button"
            onClick={() => setFilter('chat')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            Messages
          </button>
          <button
            type="button"
            onClick={() => setFilter('payment')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'payment'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            Payments
          </button>
          <button
            type="button"
            onClick={() => setFilter('announcement')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === 'announcement'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            Broadcasts
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-7 h-7 opacity-60" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">No notifications here</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                You're completely up to date. You will receive real-time push alerts when booking statuses change or chat messages arrive.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 group relative ${
                  !notif.read ? 'bg-amber-50/70 border border-amber-200/60 shadow-2xs' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getCategoryIcon(notif)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-black text-[#202124] line-clamp-1">{notif.title}</span>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap font-medium flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{notif.message}</p>
                  {notif.orderNumber && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {notif.orderNumber}
                      </span>
                      <span className="text-[9px] font-bold text-[#D71920] flex items-center gap-0.5 group-hover:underline">
                        <span>View Details</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  )}
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#D71920] shrink-0 mt-2" title="Unread" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dataService.deleteNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity rounded cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {allNotifications.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 text-xs">
            {showConfirmClear ? (
              <div className="flex items-center gap-2 w-full justify-between animate-in fade-in">
                <span className="text-[11px] font-bold text-red-600">Clear all notifications?</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 rounded-lg shadow-xs cursor-pointer"
                  >
                    Yes, Clear All
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-[10px] text-slate-400">
                  {allNotifications.length} total • Real-time Firebase Sync
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(true)}
                  className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
