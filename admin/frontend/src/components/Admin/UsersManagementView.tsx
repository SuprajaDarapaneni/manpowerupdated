import React, { useState } from 'react';
import {
  Users,
  Shield,
  Building2,
  HardHat,
  Search,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  UserCheck,
  UserX,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { Customer, Worker, AdminUser } from '../../types';
import { dataService } from '../../services/storage';

interface UsersManagementViewProps {
  customers: Customer[];
  workers: Worker[];
  adminUsers: AdminUser[];
}

const AVAILABLE_PERMISSIONS = [
  'all',
  'read_bookings',
  'write_bookings',
  'manage_workers',
  'approve_workers',
  'view_financials',
  'resolve_disputes',
  'dispatch_jobs',
  'export_reports',
];

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  customers,
  workers,
  adminUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'workers' | 'staff'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin' as AdminUser['role'],
    permissions: ['read_bookings', 'manage_workers'] as string[],
    status: 'active' as AdminUser['status'],
  });

  const filteredStaff = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.phone.includes(searchQuery)
  );

  const handleToggleStaffStatus = (user: AdminUser) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    dataService.setAdminUserStatus(user.id, nextStatus);
  };

  const handleOpenCreateStaff = () => {
    setFormData({
      name: '',
      email: '',
      role: 'admin',
      permissions: ['read_bookings', 'manage_workers', 'dispatch_jobs'],
      status: 'active',
    });
    setIsCreatingStaff(true);
    setEditingStaff(null);
  };

  const handleOpenEditStaff = (user: AdminUser) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      status: user.status,
    });
    setEditingStaff(user);
    setIsCreatingStaff(false);
  };

  const handleDeleteStaff = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete staff account "${name}"?`)) {
      dataService.deleteAdminUser(userId);
      if (editingStaff?.id === userId) setEditingStaff(null);
    }
  };

  const handleTogglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== perm),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, perm],
      });
    }
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingStaff) {
      dataService.updateAdminUser({
        ...editingStaff,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.role === 'super_admin' ? ['all'] : formData.permissions,
        status: formData.status,
      });
      setEditingStaff(null);
    } else if (isCreatingStaff) {
      dataService.addAdminUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.role === 'super_admin' ? ['all'] : formData.permissions,
        status: formData.status,
        lastLogin: 'Never',
      });
      setIsCreatingStaff(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">User & Access Management</h1>
          <p className="text-xs text-[#686868] mt-1">
            Centrally manage RBAC roles, permissions, operational staff, employers, and temporary workers.
          </p>
        </div>
        {/* Sub-tabs */}
        <div className="flex bg-[#FFFDF8] p-1 rounded-xl border border-[#202124]/15">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'staff' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Admin Staff ({adminUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'workers' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Workers ({workers.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'customers' ? 'bg-[#D71920] text-white shadow-xs' : 'text-[#686868] hover:text-[#202124]'
            }`}
          >
            Employers ({customers.length})
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search in ${activeTab}...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
          />
        </div>
        {activeTab === 'staff' && (
          <button
            onClick={handleOpenCreateStaff}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        )}
      </div>

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
                <th className="py-3 px-4 font-semibold">Staff Member</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Assigned Permissions</th>
                <th className="py-3 px-4 font-semibold">Last Active</th>
                <th className="py-3 px-4 font-semibold">Account State</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {filteredStaff.map((user) => (
                <tr key={user.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#202124]">{user.name}</td>
                  <td className="py-3 px-4 font-mono text-[#686868]">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.role === 'super_admin'
                          ? 'bg-red-50 text-[#D71920]'
                          : user.role === 'admin'
                          ? 'bg-[#FFC928] text-[#202124]'
                          : 'bg-[#FFC928]/30 text-[#A80F18]'
                      }`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((p) => (
                        <span key={p} className="px-1.5 py-0.5 text-[10px] bg-slate-100 rounded text-[#202124]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#686868]">{user.lastLogin}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.status === 'active' ? 'bg-[#FFC928] text-[#202124]' : 'bg-[#D71920]/10 text-[#D71920]'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {user.role !== 'super_admin' ? (
                        <>
                          <button
                            onClick={() => handleToggleStaffStatus(user)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                              user.status === 'active'
                                ? 'text-[#D71920] hover:bg-red-50'
                                : 'text-[#202124] hover:bg-[#FFC928]/20'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleOpenEditStaff(user)}
                            className="p-1.5 text-[#686868] hover:text-[#D71920] rounded hover:bg-red-50 cursor-pointer"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(user.id, user.name)}
                            className="p-1.5 text-[#686868] hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-[#686868] italic">Protected Super Admin</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
                <th className="py-3 px-4 font-semibold">Worker</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">KYC Proof</th>
                <th className="py-3 px-4 font-semibold">Rate</th>
                <th className="py-3 px-4 font-semibold">Approval Status</th>
                <th className="py-3 px-4 font-semibold text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {filteredWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#202124]">{w.name}</td>
                  <td className="py-3 px-4 font-mono text-[#686868]">{w.phone}</td>
                  <td className="py-3 px-4 font-mono text-[#686868]">{w.idProofNumber || 'Aadhaar Verified'}</td>
                  <td className="py-3 px-4 font-semibold text-[#202124]">₹{w.hourlyRate}/hr</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        w.approvalStatus === 'approved'
                          ? 'bg-[#FFC928] text-[#202124]'
                          : w.approvalStatus === 'pending'
                          ? 'bg-[#FFC928]/30 text-[#A80F18]'
                          : 'bg-[#D71920]/10 text-[#D71920]'
                      }`}
                    >
                      {w.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {w.approvalStatus === 'pending' ? (
                      <button
                        onClick={() => dataService.setWorkerApproval(w.id, 'approved')}
                        className="px-2.5 py-1 bg-[#D71920] text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          dataService.setWorkerApproval(
                            w.id,
                            w.approvalStatus === 'approved' ? 'suspended' : 'approved'
                          )
                        }
                        className="px-2.5 py-1 text-[#686868] hover:text-[#D71920] rounded text-[11px] cursor-pointer"
                      >
                        {w.approvalStatus === 'approved' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
                <th className="py-3 px-4 font-semibold">Employer Name</th>
                <th className="py-3 px-4 font-semibold">Company</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Orders Count</th>
                <th className="py-3 px-4 font-semibold">Wallet</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#202124]">{c.name}</td>
                  <td className="py-3 px-4 text-[#686868]">{c.companyName || 'Individual'}</td>
                  <td className="py-3 px-4 font-mono text-[#686868]">{c.phone}</td>
                  <td className="py-3 px-4 font-bold text-[#D71920]">{c.totalBookings} orders</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹{(c.walletBalance || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'active' ? 'bg-[#FFC928] text-[#202124]' : 'bg-[#D71920]/10 text-[#D71920]'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {(isCreatingStaff || editingStaff) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
              <h2 className="text-base font-bold text-[#202124]">
                {editingStaff ? `Edit Staff Member: ${editingStaff.name}` : 'Add New Staff Member'}
              </h2>
              <button
                onClick={() => {
                  setIsCreatingStaff(false);
                  setEditingStaff(null);
                }}
                className="p-1 text-[#686868] hover:text-[#202124] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Nair"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="priya@manpowerlink.com"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  >
                    <option value="admin">Administrator</option>
                    <option value="staff">Operations & Support Staff</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-2">
                  Granular Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#FFFDF8] p-3 rounded-xl border border-[#202124]/10 max-h-40 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => handleTogglePermission(perm)}
                        className="rounded text-[#D71920] focus:ring-[#D71920]"
                      />
                      <span className="text-[#202124]">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#202124]/10">
                <div>
                  {editingStaff && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(editingStaff.id, editingStaff.name)}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingStaff(false);
                      setEditingStaff(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#686868] hover:text-[#202124] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    {editingStaff ? 'Update Staff Member' : 'Create Staff Member'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
