import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  MapPin,
  Phone,
  FileText,
  Shield,
  Eye,
} from 'lucide-react';
import { Worker } from '../../types';
import { dataService } from '../../services/storage';

interface WorkersManagementViewProps {
  workers: Worker[];
}

export const WorkersManagementView: React.FC<WorkersManagementViewProps> = ({ workers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const filtered = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.phone.includes(searchTerm) ||
      worker.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || worker.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSetStatus = (workerId: string, status: 'approved' | 'pending' | 'rejected' | 'suspended') => {
    dataService.setWorkerApproval(workerId, status);
    if (selectedWorker && selectedWorker.id === workerId) {
      setSelectedWorker({ ...selectedWorker, approvalStatus: status });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Workers Pool & Verification</h1>
          <p className="text-xs text-[#686868] mt-1">
            Manage KYC approvals, Aadhaar verification, skill proficiencies, and review ratings for all registered laborers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by worker name, skill, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'approved', 'pending', 'suspended'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#D71920] text-white shadow-xs'
                  : 'bg-[#FFFDF8] text-[#686868] hover:text-[#202124] border border-[#202124]/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Table matching PDF Screen 5 */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
                <th className="py-3 px-4 font-semibold">Worker Name</th>
                <th className="py-3 px-4 font-semibold">Contact / Phone</th>
                <th className="py-3 px-4 font-semibold">City / Location</th>
                <th className="py-3 px-4 font-semibold">Skills & Verticals</th>
                <th className="py-3 px-4 font-semibold">Hourly Rate</th>
                <th className="py-3 px-4 font-semibold">Completed Jobs</th>
                <th className="py-3 px-4 font-semibold">Rating</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {filtered.map((worker) => (
                <tr key={worker.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#202124]/10"
                      />
                      <div>
                        <p className="font-semibold text-[#202124]">{worker.name}</p>
                        <p className="text-[10px] text-[#686868]">{worker.badge || 'Verified Laborer'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#686868]">{worker.phone}</td>
                  <td className="py-3 px-4 text-[#202124]">{worker.location.city}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.slice(0, 2).map((sk) => (
                        <span key={sk} className="px-1.5 py-0.5 text-[10px] bg-slate-100 rounded text-[#202124]">
                          {sk}
                        </span>
                      ))}
                      {worker.skills.length > 2 && (
                        <span className="text-[10px] text-[#686868]">+{worker.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#202124] tabular-nums">
                    ₹{worker.hourlyRate}/hr
                  </td>
                  <td className="py-3 px-4 tabular-nums">{worker.completedJobsCount}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 font-semibold text-[#202124]">
                      <Star className="w-3.5 h-3.5 fill-[#FFC928] text-[#FFC928]" />
                      {worker.rating > 0 ? worker.rating : 'New'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        worker.approvalStatus === 'approved'
                          ? 'bg-emerald-50 text-[#16834A]'
                          : worker.approvalStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {worker.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {worker.approvalStatus === 'pending' ? (
                        <button
                          onClick={() => handleSetStatus(worker.id, 'approved')}
                          className="px-2 py-1 text-[11px] font-bold bg-[#16834A] text-white rounded hover:bg-[#126639] transition-colors"
                        >
                          Approve
                        </button>
                      ) : worker.approvalStatus === 'approved' ? (
                        <button
                          onClick={() => handleSetStatus(worker.id, 'suspended')}
                          className="px-2 py-1 text-[11px] font-semibold text-[#C62828] hover:bg-red-50 rounded transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetStatus(worker.id, 'approved')}
                          className="px-2 py-1 text-[11px] font-semibold text-[#16834A] hover:bg-emerald-50 rounded transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedWorker(worker)}
                        className="p-1 text-[#686868] hover:text-[#202124] rounded"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Profile Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#202124]/10">
            <div className="flex items-start justify-between pb-4 border-b border-[#202124]/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorker.avatar}
                  alt={selectedWorker.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-base font-bold text-[#202124]">{selectedWorker.name}</h3>
                  <p className="text-xs text-[#686868]">{selectedWorker.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-[#686868] hover:text-[#202124] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FFFDF8] rounded-xl border border-[#202124]/10">
                <div>
                  <span className="text-[#686868] block">ID Document:</span>
                  <span className="font-semibold text-[#202124]">
                    {selectedWorker.idProofType} ({selectedWorker.idProofNumber})
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Emergency Contact:</span>
                  <span className="font-semibold text-[#202124]">
                    {selectedWorker.emergencyContact || 'Verified on file'}
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Lifetime Earnings:</span>
                  <span className="font-bold text-[#16834A] tabular-nums">
                    ₹{selectedWorker.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Jobs Completed:</span>
                  <span className="font-semibold text-[#202124]">
                    {selectedWorker.completedJobsCount} jobs
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#202124] block mb-1">Registered Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWorker.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 text-[#202124] rounded text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#202124]/10">
              <div className="flex gap-2">
                {selectedWorker.approvalStatus !== 'approved' && (
                  <button
                    onClick={() => handleSetStatus(selectedWorker.id, 'approved')}
                    className="px-3 py-1.5 bg-[#16834A] text-white rounded-lg text-xs font-bold"
                  >
                    Approve Worker
                  </button>
                )}
                {selectedWorker.approvalStatus === 'approved' && (
                  <button
                    onClick={() => handleSetStatus(selectedWorker.id, 'suspended')}
                    className="px-3 py-1.5 bg-red-100 text-[#C62828] rounded-lg text-xs font-semibold"
                  >
                    Suspend Account
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-1.5 bg-slate-100 text-[#202124] rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
