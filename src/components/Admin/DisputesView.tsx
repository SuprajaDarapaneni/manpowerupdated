import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { DisputeRecord } from '../../types';
import { dataService } from '../../services/storage';

interface DisputesViewProps {
  disputes: DisputeRecord[];
}

export const DisputesView: React.FC<DisputesViewProps> = ({ disputes }) => {
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const handleResolve = (status: 'resolved' | 'refunded') => {
    if (!selectedDispute) return;
    dataService.resolveDispute(selectedDispute.id, resolutionText || 'Resolved by Administrator', status);
    setSelectedDispute(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <h1 className="text-xl font-bold text-[#202124]">Disputes & Safety Escalations</h1>
        <p className="text-xs text-[#686868] mt-1">
          Investigate reported worker late arrivals, damaged items, customer wage queries, and safety issues.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
              <th className="py-3 px-4 font-semibold">Order / Case</th>
              <th className="py-3 px-4 font-semibold">Reported By</th>
              <th className="py-3 px-4 font-semibold">Against</th>
              <th className="py-3 px-4 font-semibold">Issue Reason</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202124]/5">
            {disputes.map((disp) => (
              <tr key={disp.id} className="hover:bg-[#FFFDF8] transition-colors">
                <td className="py-3 px-4 font-bold text-[#202124]">{disp.orderNumber}</td>
                <td className="py-3 px-4 text-[#202124]">{disp.reporterName} ({disp.reportedBy})</td>
                <td className="py-3 px-4 text-[#686868]">{disp.againstName}</td>
                <td className="py-3 px-4 max-w-sm">
                  <p className="font-semibold text-[#202124]">{disp.reason}</p>
                  <p className="text-[11px] text-[#686868] truncate">{disp.details}</p>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      disp.status === 'resolved'
                        ? 'bg-emerald-50 text-[#16834A]'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {disp.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedDispute(disp);
                      setResolutionText(disp.resolutionNote || '');
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FFFDF8] hover:bg-[#D71920] hover:text-white border border-[#202124]/15 rounded transition-colors"
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#202124]/10">
            <h3 className="text-base font-bold text-[#202124]">
              Dispute Investigation: {selectedDispute.orderNumber}
            </h3>
            <p className="text-xs text-[#686868] mt-1">{selectedDispute.reason}</p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-[#202124] leading-relaxed">
              {selectedDispute.details}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Resolution Decision / Notes
              </label>
              <textarea
                rows={3}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Enter adjustment details (e.g. Approved 1 hr deduction or dismissed)..."
                className="w-full p-2 text-xs border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setSelectedDispute(null)}
                className="px-3 py-1.5 text-xs text-[#686868] hover:text-[#202124]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve('resolved')}
                className="px-3 py-1.5 bg-[#16834A] text-white text-xs font-bold rounded-lg"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleResolve('refunded')}
                className="px-3 py-1.5 bg-[#D71920] text-white text-xs font-bold rounded-lg"
              >
                Issue Partial Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
