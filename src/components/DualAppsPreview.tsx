import React, { useState, useEffect } from 'react';
import { CustomerAppSimulator } from './CustomerSimulator/CustomerAppSimulator';
import { EmployeeAppSimulator } from './EmployeeSimulator/EmployeeAppSimulator';
import { Booking, ServiceCategory, Worker } from '../types';
import {
  Smartphone,
  HardHat,
  RefreshCw,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock,
  ShieldCheck,
  CreditCard,
  MapPin,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import { dataService, playNotificationSound } from '../services/storage';

interface DualAppsPreviewProps {
  categories: ServiceCategory[];
  workers: Worker[];
  bookings: Booking[];
  onOpenAdmin: () => void;
}

interface WorkflowStep {
  step: number;
  title: string;
  actor: 'Employer' | 'Employee' | 'Platform';
  action: string;
  description: string;
  icon: any;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: 'Employer Request (Post Job)',
    actor: 'Employer',
    action: 'Selects Zone & Posts Requirement',
    description: 'Employer selects Baikampady Zone and posts 2 Loaders at ₹2,000/day. Broadcasted to nearby workers.',
    icon: Smartphone,
  },
  {
    step: 2,
    title: 'Employee Alert & Ringtone',
    actor: 'Employee',
    action: 'Radar Alert & Audio Ring Chime',
    description: 'Worker phone rings with audible chime and toast banner showing matching shift nearby.',
    icon: Volume2,
  },
  {
    step: 3,
    title: 'Employee Accept Shift',
    actor: 'Employee',
    action: 'Accepts Order #1045 Directly',
    description: 'Ramesh accepts the shift. Order moves from searching to confirmed.',
    icon: CheckCircle2,
  },
  {
    step: 4,
    title: 'Reach Worksite (GPS Arrival)',
    actor: 'Employee',
    action: 'Travels & Logs Worksite Arrival',
    description: 'Worker arrives at Panambur Container Terminal Dock 4. GPS arrival is recorded.',
    icon: MapPin,
  },
  {
    step: 5,
    title: 'Start OTP Verification',
    actor: 'Employer',
    action: 'Customer Shares 4-Digit Start OTP',
    description: 'Worker asks employer for Start OTP, enters it, and shifts into active attendance timer.',
    icon: KeyRound,
  },
  {
    step: 6,
    title: 'Work Hold / Resume (Break Timer)',
    actor: 'Employee',
    action: 'Work Paused for Lunch, then Resumed',
    description: 'Shift paused for 45-minute lunch break, then resumed without affecting net billing.',
    icon: Clock,
  },
  {
    step: 7,
    title: 'Work End & End OTP',
    actor: 'Employer',
    action: 'Completion Inspection & End OTP',
    description: 'Work finishes. Employer verifies job completion and shares 4-digit End OTP.',
    icon: ShieldCheck,
  },
  {
    step: 8,
    title: 'Payment Calculation',
    actor: 'Platform',
    action: 'Automated Rate & Wage Calculation',
    description: 'System calculates base wage: ₹2,000, 0 overtime, and platform commission (10% = ₹200).',
    icon: CreditCard,
  },
  {
    step: 9,
    title: 'Payment Process (Cash / UPI)',
    actor: 'Employer',
    action: 'Pays Worker ₹2,000 at Site',
    description: 'Employer pays cash or scans PhonePe QR code (prnm@kotak) directly to worker.',
    icon: CreditCard,
  },
  {
    step: 10,
    title: 'Commission & Final Report',
    actor: 'Platform',
    action: 'Platform Fee Deducted & Audit Saved',
    description: '₹200 platform commission debited from worker prepaid wallet. Digital report & invoice generated.',
    icon: FileCheck2,
  },
];

export const DualAppsPreview: React.FC<DualAppsPreviewProps> = ({
  categories,
  workers,
  bookings,
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'customer' | 'employee'>('both');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Auto-play interval
  useEffect(() => {
    let timer: any = null;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= WORKFLOW_STEPS.length - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying]);

  const activeStep = WORKFLOW_STEPS[currentStepIndex];

  const handleExecuteCurrentStep = (index: number) => {
    setCurrentStepIndex(index);
    const target = bookings[0];
    if (!target) return;

    if (index === 0) {
      // Step 1: Employer request
      playNotificationSound();
    } else if (index === 1) {
      // Step 2: Employee alert
      playNotificationSound();
    } else if (index === 2) {
      // Step 3: Accept
      dataService.directAcceptJob(target.id, 'w-1');
    } else if (index === 4) {
      // Step 5: Start OTP
      dataService.verifyStartOtp(target.id, 'w-1', target.startOtp, 'Panambur Container Terminal');
    } else if (index === 5) {
      // Step 6: Hold
      dataService.holdBookingWork(target.id, 'Lunch Break');
      setTimeout(() => dataService.resumeBookingWork(target.id), 2000);
    } else if (index === 6) {
      // Step 7: End OTP
      dataService.verifyEndOtp(target.id, 'w-1', target.endOtp, 'Panambur Container Terminal');
    } else if (index === 8 || index === 9) {
      // Step 9 & 10: Settlement
      dataService.calculateAndSettleJob(target.id, 'cash');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-[#202124]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#202124] rounded-lg flex items-center gap-1 transition-colors cursor-pointer mr-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Admin</span>
            </button>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#FFC928]/30 text-[#A80F18] rounded-md">
              Complete 10-Step Workflow
            </span>
            <span className="text-xs text-[#686868]">Customer & Employee Live Walkthrough</span>
          </div>
          <h1 className="text-lg font-bold text-[#202124] mt-1">
            End-to-End Operational Lifecycle Simulator
          </h1>
          <p className="text-xs text-[#686868] mt-0.5 max-w-2xl">
            Watch the full 10 steps in action: Employer Request ➔ Employee Ring Alert ➔ Accept ➔ Reach Worksite ➔ Start OTP ➔ Work Hold/Resume ➔ Work End ➔ Payment ➔ Commission ➔ Final Report.
          </p>
        </div>

        {/* View Switchers (Both / Customer / Employee) */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <div className="flex bg-[#FFFDF8] p-1 rounded-xl border border-[#202124]/15">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'both' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
              }`}
            >
              Side-by-Side Dual View
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'customer' ? 'bg-[#FFC928] text-[#202124] shadow-xs' : 'text-[#686868] hover:text-[#202124]'
              }`}
            >
              Customer App
            </button>
            <button
              onClick={() => setActiveTab('employee')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'employee' ? 'bg-[#FFC928] text-[#202124] shadow-xs' : 'text-[#686868] hover:text-[#202124]'
              }`}
            >
              Employee App
            </button>
          </div>
        </div>
      </div>

      {/* 10-STEP WORKFLOW INTERACTIVE VIDEO / PLAYER BAR */}
      <div className="bg-[#1E1F23] text-white p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D71920] flex items-center justify-center font-black text-white text-sm border border-[#FFC928]">
              {activeStep.step}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FFC928] uppercase tracking-wider">
                  Step {activeStep.step} of 10: {activeStep.title}
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono text-white/80">
                  {activeStep.actor}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                {activeStep.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (isAutoPlaying) {
                  setIsAutoPlaying(false);
                } else {
                  if (currentStepIndex >= WORKFLOW_STEPS.length - 1) {
                    setCurrentStepIndex(0);
                  }
                  setIsAutoPlaying(true);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                isAutoPlaying
                  ? 'bg-amber-500 text-[#202124]'
                  : 'bg-[#D71920] hover:bg-[#A80F18] text-white border border-[#FFC928]'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current text-[#FFC928]" />}
              <span>{isAutoPlaying ? 'Pause Video Player' : '▶ Auto-Play 10-Step Video Walkthrough'}</span>
            </button>
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStepIndex(0);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 10 Step Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 pt-2 border-t border-white/10">
          {WORKFLOW_STEPS.map((s, idx) => {
            const isCurrent = currentStepIndex === idx;
            const isDone = currentStepIndex > idx;
            return (
              <button
                key={s.step}
                onClick={() => handleExecuteCurrentStep(idx)}
                className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                  isCurrent
                    ? 'bg-[#FFC928] text-[#202124] font-black ring-2 ring-white shadow-md'
                    : isDone
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/40'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-bold">#{s.step}</span>
                  {isDone ? <span>✓</span> : isCurrent ? <span className="animate-pulse">●</span> : null}
                </div>
                <span className="text-[10px] leading-tight font-bold truncate">
                  {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Mobile Device Viewport Studio */}
      <div className="bg-[#121316] p-6 md:p-10 rounded-3xl border border-white/5 flex flex-wrap items-start justify-center gap-10 shadow-inner">
        {/* Phone 1: Customer App */}
        {(activeTab === 'both' || activeTab === 'customer') && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 text-white">
              <div className="w-6 h-6 rounded-md bg-[#D71920] text-white flex items-center justify-center text-xs font-bold">
                C
              </div>
              <span className="text-xs font-bold">Customer App (Employer)</span>
              <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded">
                Flutter /customer-app
              </span>
            </div>
            <CustomerAppSimulator
              categories={categories}
              workers={workers}
              bookings={bookings}
            />
          </div>
        )}

        {/* Real-time sync indicator if in dual mode */}
        {activeTab === 'both' && (
          <div className="hidden 2xl:flex flex-col items-center justify-center self-center text-white/40 max-w-[120px] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FFC928]">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <span className="text-[11px] font-bold text-white/80">Live Socket Sync</span>
            <p className="text-[10px] leading-tight">
              Customer posts job ➔ Employee alerts ➔ Start OTP ➔ Hold ➔ Settle
            </p>
          </div>
        )}

        {/* Phone 2: Employee App */}
        {(activeTab === 'both' || activeTab === 'employee') && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 text-white">
              <div className="w-6 h-6 rounded-md bg-[#FFC928] text-[#202124] flex items-center justify-center text-xs font-bold">
                W
              </div>
              <span className="text-xs font-bold">Employee App (Worker)</span>
              <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded">
                Flutter /employee-app
              </span>
            </div>
            <EmployeeAppSimulator
              workers={workers}
              bookings={bookings}
            />
          </div>
        )}
      </div>
    </div>
  );
};
