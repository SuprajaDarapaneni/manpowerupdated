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
} from 'lucide-react';
import { Customer, Worker, AdminUser } from '../../types';
import { dataService } from '../../services/storage';

interface UsersManagementViewProps {
  customers: Customer[];
  workers: Worker[];
  adminUsers: AdminUser[];
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  customers,
  workers,
  adminUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'workers' | 'staff'>('staff');
  const [searchQuery, setSearchQuery] = useState('');

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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs flex items-center justify-between">
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
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((p) => (
                        <span key={p} className="px-1.5 py-0.2 text-[10px] bg-slate-100 rounded text-[#202124]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#686868]">{user.lastLogin}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.status === 'active' ? 'bg-emerald-50 text-[#16834A]' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {user.role !== 'super_admin' ? (
                      <button
                        onClick={() => handleToggleStaffStatus(user)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                          user.status === 'active'
                            ? 'text-[#C62828] hover:bg-red-50'
                            : 'text-[#16834A] hover:bg-emerald-50'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#686868] italic">Protected Root</span>
                    )}
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
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img src={w.avatar} alt={w.name} className="w-7 h-7 rounded-full object-cover border" />
                      <span className="font-semibold text-[#202124]">{w.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#686868]">{w.phone}</td>
                  <td className="py-3 px-4 text-[#202124]">{w.idProofType} ({w.idProofNumber})</td>
                  <td className="py-3 px-4 font-bold text-[#D71920]">₹{w.hourlyRate}/hr</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        w.approvalStatus === 'approved'
                          ? 'bg-emerald-50 text-[#16834A]'
                          : w.approvalStatus === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {w.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        dataService.setWorkerApproval(
                          w.id,
                          w.approvalStatus === 'approved' ? 'suspended' : 'approved'
                        )
                      }
                      className="px-2 py-1 text-[11px] font-bold text-[#202124] hover:bg-slate-100 rounded"
                    >
                      {w.approvalStatus === 'approved' ? 'Suspend' : 'Approve'}
                    </button>
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
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Company / Org</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Total Shifts</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#202124]">{c.name}</td>
                  <td className="py-3 px-4 text-[#686868]">{c.companyName}</td>
                  <td className="py-3 px-4 font-mono text-[#686868]">{c.phone}</td>
                  <td className="py-3 px-4 font-bold text-[#D71920]">{c.totalBookings}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16834A] uppercase">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
