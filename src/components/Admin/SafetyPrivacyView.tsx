import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SafetyIncidentRecord } from '../../types';
import { dataService } from '../../services/storage';

interface SafetyPrivacyViewProps {
  incidents: SafetyIncidentRecord[];
}

export const SafetyPrivacyView: React.FC<SafetyPrivacyViewProps> = ({ incidents }) => {
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncidentRecord | null>(null);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'privacy'>('incidents');

  const handleResolveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    dataService.resolveSafetyIncident(
      selectedIncident.id,
      resolutionSummary || 'Investigated and resolved by Operations Admin.'
    );
    setSelectedIncident(null);
    setResolutionSummary('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Safety Incidents & Privacy Compliance</h1>
          <p className="text-xs text-[#686868] mt-1">
            Monitor worker worksite safety escalations, PPE protocols, emergency logs, and data retention policies.
          </p>
        </div>
        <div className="flex bg-[#FFFDF8] p-1 rounded-xl border border-[#202124]/15">
          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'incidents' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Safety Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'privacy' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Privacy & Retention
          </button>
        </div>
      </div>

      {activeSubTab === 'incidents' ? (
        <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
                <th className="py-3 px-4 font-semibold">Incident Ref</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Reported By</th>
                <th className="py-3 px-4 font-semibold">Title & Worksite</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#202124]">
                    {inc.incidentNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inc.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : inc.severity === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#202124]">
                    {inc.reporterName} ({inc.reporterRole})
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <p className="font-semibold text-[#202124]">{inc.title}</p>
                    <p className="text-[10px] text-[#686868] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#D71920]" />
                      {inc.worksiteLocation}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-50 text-[#16834A]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedIncident(inc);
                        setResolutionSummary(inc.resolutionSummary || '');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#FFFDF8] hover:bg-[#D71920] hover:text-white border border-[#202124]/15 rounded transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Privacy & Retention Tab */
        <div className="bg-white rounded-2xl border border-[#202124]/10 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-[#202124]">Data Privacy & Retention Schedules</h2>
            <p className="text-xs text-[#686868] mt-0.5">
              Governs customer phone masking, worker Aadhaar storage encryption, and GDPR/DPDP compliant retention schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#202124]/10 space-y-2">
              <span className="font-bold text-[#202124] block">Worker Aadhaar & KYC</span>
              <p className="text-[#686868]">Encrypted at rest with AES-256. Retained for 5 years after registration pursuant to labor records rules.</p>
              <span className="text-[10px] font-semibold text-[#16834A] bg-emerald-50 px-2 py-0.5 rounded block w-fit">
                Active Encryption
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#202124]/10 space-y-2">
              <span className="font-bold text-[#202124] block">GPS Geolocation Logs</span>
              <p className="text-[#686868]">Worker location captured only during active travel and shift duration. Automatically purged after 90 days.</p>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded block w-fit">
                90-Day Auto Purge
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#202124]/10 space-y-2">
              <span className="font-bold text-[#202124] block">In-App Chat Messages</span>
              <p className="text-[#686868]">Retained during booking execution. Archived 30 days post completion for dispute evidence review.</p>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded block w-fit">
                30-Day Dispute Archive
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Incident Review Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#202124]/10">
            <div className="flex items-start justify-between pb-3 border-b border-[#202124]/10">
              <div>
                <span className="text-xs font-mono font-bold text-[#D71920]">
                  {selectedIncident.incidentNumber}
                </span>
                <h3 className="text-base font-bold text-[#202124]">{selectedIncident.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-[#686868] hover:text-[#202124] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10 space-y-1">
                <p className="text-[#202124]">{selectedIncident.description}</p>
                <p className="text-[#686868] text-[11px] pt-1">
                  Location: {selectedIncident.worksiteLocation}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Administrative Resolution & Action Taken
                </label>
                <textarea
                  rows={3}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Record safety officer actions (e.g. issued replacement boots, reprimand issued, police report)..."
                  className="w-full p-2 text-xs border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202124]/10">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-3 py-1.5 text-xs text-[#686868] hover:text-[#202124]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleResolveIncident}
                className="px-4 py-1.5 bg-[#16834A] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Mark Resolved & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
