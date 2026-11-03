import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Image,
  ChevronLeft,
  Phone,
  Check,
  CheckCheck,
  MapPin,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { Booking, ChatMessage } from '../../types';
import { dataService, playNotificationSound } from '../../services/storage';

interface RealtimeChatViewProps {
  booking?: Booking;
  bookingId?: string;
  orderNumber?: string;
  categoryName?: string;
  currentUserRole?: 'customer' | 'employee' | 'admin';
  currentRole?: 'customer' | 'employee' | 'admin';
  currentUserId: string;
  currentUserName: string;
  otherParticipant?: {
    id: string;
    name: string;
    role: 'customer' | 'employee';
    phone?: string;
    avatar?: string;
  };
  partnerRole?: 'customer' | 'employee';
  partnerId?: string;
  partnerName?: string;
  partnerPhone?: string;
  onBack?: () => void;
  onClose?: () => void;
}

export const RealtimeChatView: React.FC<RealtimeChatViewProps> = ({
  booking,
  bookingId,
  orderNumber,
  categoryName,
  currentUserRole,
  currentRole,
  currentUserId,
  currentUserName,
  otherParticipant,
  partnerRole,
  partnerId,
  partnerName,
  partnerPhone,
  onBack,
  onClose,
}) => {
  const effectiveBookingId = booking?.id || bookingId || 'b-1045';
  const effectiveOrderNumber = booking?.orderNumber || orderNumber || 'ORD-1045';
  const effectiveCategory = booking?.categoryName || categoryName || 'Shift';
  const effectiveRole = currentUserRole || currentRole || 'customer';
  const effectivePartner = otherParticipant || {
    id: partnerId || 'w-1',
    name: partnerName || 'Worksite Partner',
    role: partnerRole || (effectiveRole === 'customer' ? 'employee' : 'customer'),
    phone: partnerPhone || '+91 98765 43210',
  };
  const handleBack = onBack || onClose;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return dataService.getChatMessages(effectiveBookingId);
  });
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isSendingAttachment, setIsSendingAttachment] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (effectiveRole !== 'admin') {
      dataService.markBookingMessagesAsRead(effectiveBookingId, effectiveRole);
    }
  }, [effectiveBookingId, effectiveRole]);

  // Listen for real-time messages & read receipts
  useEffect(() => {
    const handleIncomingMessage = (e: any) => {
      const msg = e.detail as ChatMessage;
      if (!msg) return;
      if (msg.bookingId === effectiveBookingId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // If message is for current user, mark read and play sound
        if (msg.recipientRole === effectiveRole) {
          playNotificationSound();
          if (effectiveRole !== 'admin') {
            dataService.markBookingMessagesAsRead(effectiveBookingId, effectiveRole);
          }
        }
      }
    };

    const handleMessagesRead = (e: any) => {
      const { bookingId } = e.detail || {};
      if (bookingId === effectiveBookingId) {
        setMessages(dataService.getChatMessages(effectiveBookingId));
      }
    };

    const handleTypingEvent = (e: any) => {
      const { bookingId, senderRole, isTyping } = e.detail || {};
      if (bookingId === effectiveBookingId && senderRole !== effectiveRole) {
        setIsOtherTyping(isTyping);
      }
    };

    window.addEventListener('manpowerlink_chat_message', handleIncomingMessage);
    window.addEventListener('manpowerlink_messages_read', handleMessagesRead);
    window.addEventListener('manpowerlink_typing_status', handleTypingEvent);

    return () => {
      window.removeEventListener('manpowerlink_chat_message', handleIncomingMessage);
      window.removeEventListener('manpowerlink_messages_read', handleMessagesRead);
      window.removeEventListener('manpowerlink_typing_status', handleTypingEvent);
    };
  }, [effectiveBookingId, effectiveRole]);

  // Handle typing status broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Broadcast typing event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('manpowerlink_typing_status', {
          detail: { bookingId: effectiveBookingId, senderRole: effectiveRole, isTyping: true },
        })
      );

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('manpowerlink_typing_status', {
            detail: { bookingId: effectiveBookingId, senderRole: effectiveRole, isTyping: false },
          })
        );
      }, 1500);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && !attachmentPreview) return;

    const senderKey = effectiveRole === 'customer' ? 'customer' : effectiveRole === 'employee' ? 'worker' : 'admin';
    const recipientKey = effectiveRole === 'customer' ? 'employee' : 'customer';

    const newMsg = dataService.sendChatMessage({
      bookingId: effectiveBookingId,
      orderNumber: effectiveOrderNumber,
      sender: senderKey,
      senderName: currentUserName,
      senderId: currentUserId,
      recipientRole: recipientKey,
      receiverId: effectivePartner.id,
      text: text || (attachmentPreview ? '📷 Sent worksite photo' : ''),
      attachmentUrl: attachmentPreview || undefined,
      attachmentType: attachmentPreview ? 'image' : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setAttachmentPreview(null);

    // Stop typing status
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('manpowerlink_typing_status', {
          detail: { bookingId: effectiveBookingId, senderRole: effectiveRole, isTyping: false },
        })
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachmentPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const quickReplies = effectiveRole === 'customer'
    ? [
        'Please report at main gate 📍',
        'Start OTP will be provided on arrival 🔑',
        'Please wear safety boots and gloves 🧤',
        'Payment settled online ✅',
      ]
    : [
        'I am on my way to worksite 🏍️',
        'I have reached worksite gate 📍',
        'Please share the Start OTP 🔑',
        'Shift completed, thank you! 👍',
      ];

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] text-[#202124] relative overflow-hidden">
      {/* WhatsApp-Style Top App Bar */}
      <div className="bg-[#121316] text-white px-3 py-2.5 flex items-center justify-between shrink-0 shadow-md z-10 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          {handleBack && (
            <button
              type="button"
              onClick={handleBack}
              className="p-1 -ml-1 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative shrink-0">
            {effectivePartner.avatar ? (
              <img
                src={effectivePartner.avatar}
                alt={effectivePartner.name}
                className="w-9 h-9 rounded-full object-cover border border-[#FFC928]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#D71920] text-white font-black flex items-center justify-center text-xs border border-[#FFC928]">
                {effectivePartner.name.charAt(0)}
              </div>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-[#121316]" title="Online" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">
                {effectivePartner.name}
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-[#FFC928] font-semibold shrink-0">
                {effectivePartner.role === 'customer' ? 'Employer' : 'Worker'}
              </span>
            </div>
            <p className="text-[10px] text-emerald-400 font-medium leading-tight">
              {isOtherTyping ? (
                <span className="animate-pulse flex items-center gap-1 text-[#FFC928]">
                  <span>typing</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#FFC928] animate-bounce" />
                    <span className="w-1 h-1 rounded-full bg-[#FFC928] animate-bounce delay-100" />
                    <span className="w-1 h-1 rounded-full bg-[#FFC928] animate-bounce delay-200" />
                  </span>
                </span>
              ) : (
                'Online • Real-Time Chat'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex flex-col text-right pr-2">
            <span className="text-[10px] font-mono text-[#FFC928] font-bold">{effectiveOrderNumber}</span>
            <span className="text-[9px] text-white/50">{effectiveCategory}</span>
          </div>
          {effectivePartner.phone && (
            <a
              href={`tel:${effectivePartner.phone}`}
              className="p-2 bg-white/10 hover:bg-white/20 text-[#FFC928] rounded-xl transition-colors cursor-pointer"
              title={`Call ${effectivePartner.name}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Booking Context Banner */}
      <div className="bg-[#FFFDF8] border-b border-amber-200/80 px-3 py-1.5 flex items-center justify-between text-xs shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 min-w-0 text-slate-700">
          <MapPin className="w-3 h-3 text-[#D71920] shrink-0" />
          <span className="text-[10px] font-bold truncate">
            {booking?.workLocation?.address || 'Worksite Port & Dock Zone'}
          </span>
          <span className="text-[10px] text-slate-400">•</span>
          <span className="text-[10px] font-extrabold text-[#D71920]">
            ₹{booking?.offeredPricePerWorker || 800}/worker
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
          {(booking?.status || 'in_progress').replace(/_/g, ' ')}
        </span>
      </div>

      {/* WhatsApp Doodle Pattern Wallpaper Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Date separator */}
        <div className="flex justify-center my-1">
          <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-500 text-[9px] font-bold shadow-2xs border border-slate-200 uppercase tracking-wider">
            Today • Encrypted Channel
          </span>
        </div>

        {/* Message history */}
        {messages.map((msg) => {
          const isMe = (effectiveRole === 'customer' && msg.sender === 'customer') ||
                       (effectiveRole === 'employee' && msg.sender === 'worker') ||
                       (effectiveRole === 'admin' && msg.sender === 'admin');

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-150`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-2.5 rounded-2xl shadow-xs text-xs relative ${
                  isMe
                    ? effectiveRole === 'customer'
                      ? 'bg-[#D71920] text-white rounded-tr-none'
                      : 'bg-[#FFC928] text-[#202124] font-medium rounded-tr-none'
                    : 'bg-white text-[#202124] rounded-tl-none border border-slate-200'
                }`}
              >
                {/* Sender label */}
                {!isMe && (
                  <span className="text-[9px] font-extrabold text-[#D71920] block mb-0.5">
                    {msg.senderName}
                  </span>
                )}

                {/* Attachment if present */}
                {msg.attachmentUrl && (
                  <div className="mb-1.5 rounded-xl overflow-hidden border border-black/10 max-h-48 bg-black/5">
                    <img
                      src={msg.attachmentUrl}
                      alt="Worksite photo"
                      className="w-full h-auto object-cover max-h-48"
                    />
                  </div>
                )}

                {/* Text content */}
                {msg.text && (
                  <p className="leading-snug break-words whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Timestamp & Delivery status checkmarks */}
                <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                  isMe
                    ? effectiveRole === 'customer' ? 'text-white/70' : 'text-[#202124]/70'
                    : 'text-slate-400'
                }`}>
                  <span>{msg.time}</span>
                  {isMe && (
                    <span title={msg.status === 'read' ? 'Read' : msg.status === 'delivered' ? 'Delivered' : 'Sent'}>
                      {msg.status === 'read' ? (
                        <CheckCheck className={`w-3.5 h-3.5 ${effectiveRole === 'customer' ? 'text-cyan-300' : 'text-blue-700'}`} />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 opacity-80" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-80" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time typing bubble */}
        {isOtherTyping && (
          <div className="flex items-start gap-1 animate-in fade-in">
            <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Carousel */}
      <div className="px-2 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <Sparkles className="w-3 h-3 text-amber-500 shrink-0 ml-1" />
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(reply)}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-[10px] font-semibold whitespace-nowrap shadow-2xs transition-colors cursor-pointer active:scale-95"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Attachment Preview Modal Strip */}
      {attachmentPreview && (
        <div className="p-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between shrink-0 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <img src={attachmentPreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-amber-300" />
            <span className="text-[11px] font-bold text-amber-900">Worksite Photo Attached</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachmentPreview(null)}
            className="p-1 rounded-full text-slate-500 hover:text-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Input Bar */}
      <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0">
        <label className="p-2 text-slate-500 hover:text-[#D71920] hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Paperclip className="w-4 h-4" />
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex-1 flex items-center gap-1.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${effectivePartner.name}...`}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-[#202124] focus:outline-none focus:border-[#D71920] focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() && !attachmentPreview}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              inputText.trim() || attachmentPreview
                ? 'bg-[#D71920] text-white shadow-xs hover:bg-[#A80F18] active:scale-95'
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
