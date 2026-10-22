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
  Plus,
  Edit2,
  Trash2,
  X,
  Wallet,
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
  const [isCreatingWorker, setIsCreatingWorker] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Mangalore, Karnataka',
    skills: 'Loading & Unloading, General Helper',
    hourlyRate: 200,
    aadhaarNumber: 'XXXX-XXXX-4321',
    approvalStatus: 'approved' as Worker['approvalStatus'],
    walletBalance: 500,
  });

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

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      phone: '+91 ',
      email: '',
      city: 'Mangalore, Karnataka',
      skills: 'Loading & Unloading, Catering Service',
      hourlyRate: 220,
      aadhaarNumber: 'XXXX-XXXX-8921',
      approvalStatus: 'approved',
      walletBalance: 500,
    });
    setIsCreatingWorker(true);
    setEditingWorker(null);
  };

  const handleOpenEdit = (worker: Worker) => {
    setFormData({
      name: worker.name,
      phone: worker.phone,
      email: worker.email || '',
      city: worker.location.city,
      skills: worker.skills.join(', '),
      hourlyRate: worker.hourlyRate,
      aadhaarNumber: worker.idProofNumber || 'XXXX-XXXX-4321',
      approvalStatus: worker.approvalStatus,
      walletBalance: worker.walletBalance || 500,
    });
    setEditingWorker(worker);
    setIsCreatingWorker(false);
  };

  const handleDeleteWorker = (workerId: string, name: string) => {
    if (confirm(`Are you sure you want to remove worker "${name}"? This action cannot be undone.`)) {
      dataService.deleteWorker(workerId);
      if (selectedWorker?.id === workerId) setSelectedWorker(null);
      if (editingWorker?.id === workerId) setEditingWorker(null);
    }
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingWorker) {
      dataService.updateWorker({
        ...editingWorker,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        skills: skillsArray.length ? skillsArray : ['General Labor'],
        hourlyRate: Number(formData.hourlyRate) || 200,
        approvalStatus: formData.approvalStatus,
        walletBalance: Number(formData.walletBalance) || 500,
        idProofNumber: formData.aadhaarNumber,
        idProofType: 'Aadhaar Card',
        location: {
          ...editingWorker.location,
          city: formData.city,
          address: formData.city,
        },
      });
      setEditingWorker(null);
    } else if (isCreatingWorker) {
      dataService.addWorker({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80`,
        skills: skillsArray.length ? skillsArray : ['General Labor'],
        categoryIds: ['cat-1'],
        hourlyRate: Number(formData.hourlyRate) || 200,
        rating: 5.0,
        reviewCount: 1,
        completedJobsCount: 0,
        totalEarnings: 0,
        walletBalance: Number(formData.walletBalance) || 500,
        approvalStatus: formData.approvalStatus,
        isAvailable: true,
        idProofNumber: formData.aadhaarNumber,
        idProofType: 'Aadhaar Card',
        location: {
          address: formData.city,
          city: formData.city,
          lat: 12.914,
          lng: 74.856,
        },
      });
      setIsCreatingWorker(false);
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
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Worker</span>
        </button>
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
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

      {/* Workers Table */}
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
                <th className="py-3 px-4 font-semibold">Wallet</th>
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
                        <p className="text-[10px] text-[#686868]">ID: {worker.idProofNumber || 'Aadhaar Verified'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#202124]">{worker.phone}</td>
                  <td className="py-3 px-4 text-[#686868]">{worker.location.city}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {worker.skills.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 bg-[#FFC928]/20 text-[#A80F18] rounded text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#202124] tabular-nums">
                    ₹{worker.hourlyRate}/hr
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700 tabular-nums">
                    ₹{worker.walletBalance || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 font-bold text-[#202124]">
                      <Star className="w-3.5 h-3.5 fill-[#FFC928] text-[#FFC928]" />
                      {worker.rating > 0 ? worker.rating : 'New'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        worker.approvalStatus === 'approved'
                          ? 'bg-[#FFC928] text-[#202124]'
                          : worker.approvalStatus === 'pending'
                          ? 'bg-[#FFC928]/30 text-[#A80F18]'
                          : 'bg-[#D71920]/10 text-[#D71920]'
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
                          className="px-2 py-1 text-[11px] font-bold bg-[#D71920] text-white rounded hover:bg-[#A80F18] transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      ) : worker.approvalStatus === 'approved' ? (
                        <button
                          onClick={() => handleSetStatus(worker.id, 'suspended')}
                          className="px-2 py-1 text-[11px] font-semibold text-[#D71920] hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetStatus(worker.id, 'approved')}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedWorker(worker)}
                        className="p-1.5 text-[#686868] hover:text-[#202124] rounded hover:bg-neutral-100 cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(worker)}
                        className="p-1.5 text-[#686868] hover:text-[#D71920] rounded hover:bg-red-50 cursor-pointer"
                        title="Edit Worker Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorker(worker.id, worker.name)}
                        className="p-1.5 text-[#686868] hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        title="Delete Worker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Worker Modal */}
      {(isCreatingWorker || editingWorker) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
              <h2 className="text-base font-bold text-[#202124]">
                {editingWorker ? `Edit Worker: ${editingWorker.name}` : 'Register New Worker'}
              </h2>
              <button
                onClick={() => {
                  setIsCreatingWorker(false);
                  setEditingWorker(null);
                }}
                className="p-1 text-[#686868] hover:text-[#202124] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Gowda"
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mangalore, Karnataka"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Skills & Verticals (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Loading & Unloading, Catering Service, Cleaning"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Wallet Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.walletBalance}
                    onChange={(e) => setFormData({ ...formData, walletBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Aadhaar / ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    KYC Approval Status
                  </label>
                  <select
                    value={formData.approvalStatus}
                    onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#202124]/10">
                <div>
                  {editingWorker && (
                    <button
                      type="button"
                      onClick={() => handleDeleteWorker(editingWorker.id, editingWorker.name)}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Worker</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingWorker(false);
                      setEditingWorker(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#686868] hover:text-[#202124] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    {editingWorker ? 'Update Worker' : 'Register Worker'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker Profile Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorker.avatar}
                  alt={selectedWorker.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#202124]/10"
                />
                <div>
                  <h2 className="text-base font-bold text-[#202124]">{selectedWorker.name}</h2>
                  <p className="text-xs text-[#686868]">ID: {selectedWorker.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1 text-[#686868] hover:text-[#202124] rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Contact Phone</span>
                <span className="font-mono font-medium text-[#202124]">{selectedWorker.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Location / Hub</span>
                <span className="text-[#202124]">{selectedWorker.location.city}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Hourly Wage</span>
                <span className="font-bold text-[#202124]">₹{selectedWorker.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Wallet Balance</span>
                <span className="font-bold text-emerald-700">₹{selectedWorker.walletBalance || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">ID Proof Number</span>
                <span className="font-mono text-[#202124]">{selectedWorker.idProofNumber || 'XXXX-XXXX-4321'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Completed Jobs</span>
                <span className="font-bold text-[#D71920]">{selectedWorker.completedJobsCount || 0} Jobs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Total Wages Earned</span>
                <span className="font-bold text-[#202124]">₹{(selectedWorker.totalEarnings || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#202124]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedWorker.approvalStatus !== 'approved' && (
                  <button
                    onClick={() => handleSetStatus(selectedWorker.id, 'approved')}
                    className="px-3 py-1.5 bg-[#D71920] text-white rounded-lg text-xs font-bold hover:bg-[#A80F18] cursor-pointer"
                  >
                    Approve Worker
                  </button>
                )}
                {selectedWorker.approvalStatus === 'approved' && (
                  <button
                    onClick={() => handleSetStatus(selectedWorker.id, 'suspended')}
                    className="px-3 py-1.5 bg-red-100 text-[#C62828] rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Suspend Account
                  </button>
                )}
                <button
                  onClick={() => {
                    handleOpenEdit(selectedWorker);
                    setSelectedWorker(null);
                  }}
                  className="px-3 py-1.5 bg-neutral-100 text-[#202124] rounded-lg text-xs font-semibold hover:bg-neutral-200 cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="px-4 py-1.5 bg-slate-100 text-[#202124] rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
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
