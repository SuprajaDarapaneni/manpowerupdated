import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  X,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Customer } from '../../types';
import { dataService } from '../../services/storage';

interface CustomersManagementViewProps {
  customers: Customer[];
}

export const CustomersManagementView: React.FC<CustomersManagementViewProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [walletModalCustomer, setWalletModalCustomer] = useState<Customer | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<number>(1000);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: 'Mangalore Port Warehouse, Gate 4',
    city: 'Mangalore, Karnataka',
    walletBalance: 2500,
    status: 'active' as Customer['status'],
  });

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      companyName: '',
      phone: '+91 ',
      email: '',
      address: 'Industrial Area, Baikampady',
      city: 'Mangalore, Karnataka',
      walletBalance: 2000,
      status: 'active',
    });
    setIsCreatingCustomer(true);
    setEditingCustomer(null);
  };

  const handleOpenEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      companyName: customer.companyName || '',
      phone: customer.phone,
      email: customer.email,
      address: customer.location.address,
      city: customer.location.city,
      walletBalance: customer.walletBalance || 0,
      status: customer.status,
    });
    setEditingCustomer(customer);
    setIsCreatingCustomer(false);
  };

  const handleDeleteCustomer = (customerId: string, name: string) => {
    if (confirm(`Are you sure you want to delete employer "${name}"? This action cannot be undone.`)) {
      dataService.deleteCustomer(customerId);
      if (selectedCustomer?.id === customerId) setSelectedCustomer(null);
      if (editingCustomer?.id === customerId) setEditingCustomer(null);
      if (walletModalCustomer?.id === customerId) setWalletModalCustomer(null);
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (editingCustomer) {
      dataService.updateCustomer({
        ...editingCustomer,
        name: formData.name,
        companyName: formData.companyName || undefined,
        phone: formData.phone,
        email: formData.email,
        walletBalance: Number(formData.walletBalance) || 0,
        status: formData.status,
        location: {
          address: formData.address,
          city: formData.city,
        },
      });
      setEditingCustomer(null);
    } else if (isCreatingCustomer) {
      dataService.addCustomer({
        name: formData.name,
        companyName: formData.companyName || undefined,
        phone: formData.phone,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80`,
        walletBalance: Number(formData.walletBalance) || 0,
        totalBookings: 0,
        status: formData.status,
        location: {
          address: formData.address,
          city: formData.city,
        },
      });
      setIsCreatingCustomer(false);
    }
  };

  const handleRechargeWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalCustomer || rechargeAmount <= 0) return;
    dataService.rechargeCustomerWallet(
      walletModalCustomer.id,
      rechargeAmount,
      `ADMIN_TOPUP_${Date.now().toString().slice(-6)}`
    );
    setWalletModalCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#202124]">Customers & Employers</h1>
          <p className="text-xs text-[#686868] mt-1">
            Registered businesses, logistics contractors, and event organizers booking temporary manpower.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Employer</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#686868] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, company name, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
          />
        </div>
        <span className="text-xs text-[#686868]">Total Employers: {customers.length}</span>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
                <th className="py-3 px-4 font-semibold">Employer / Customer</th>
                <th className="py-3 px-4 font-semibold">Business Unit</th>
                <th className="py-3 px-4 font-semibold">Contact Info</th>
                <th className="py-3 px-4 font-semibold">Operating Hub</th>
                <th className="py-3 px-4 font-semibold">Wallet Balance</th>
                <th className="py-3 px-4 font-semibold">Total Orders</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202124]/5">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#FFFDF8] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#202124]/10"
                      />
                      <span className="font-semibold text-[#202124]">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#686868]">{customer.companyName || 'Individual Employer'}</td>
                  <td className="py-3 px-4">
                    <p className="font-mono text-[#202124]">{customer.phone}</p>
                    <p className="text-[10px] text-[#686868]">{customer.email}</p>
                  </td>
                  <td className="py-3 px-4 text-[#202124]">{customer.location.address}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-700 tabular-nums">
                        ₹{(customer.walletBalance || 0).toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          setWalletModalCustomer(customer);
                          setRechargeAmount(1000);
                        }}
                        className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded cursor-pointer"
                        title="Top up wallet"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#D71920] tabular-nums">
                    {customer.totalBookings} orders
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        customer.status === 'active' ? 'bg-[#FFC928] text-[#202124]' : 'bg-[#D71920]/10 text-[#D71920]'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-1.5 text-[#686868] hover:text-[#202124] rounded hover:bg-neutral-100 cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(customer)}
                        className="p-1.5 text-[#686868] hover:text-[#D71920] rounded hover:bg-red-50 cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                        className="p-1.5 text-[#686868] hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        title="Delete Customer"
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

      {/* Add / Edit Customer Modal */}
      {(isCreatingCustomer || editingCustomer) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
              <h2 className="text-base font-bold text-[#202124]">
                {editingCustomer ? `Edit Employer: ${editingCustomer.name}` : 'Register New Employer'}
              </h2>
              <button
                onClick={() => {
                  setIsCreatingCustomer(false);
                  setEditingCustomer(null);
                }}
                className="p-1 text-[#686868] hover:text-[#202124] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Company / Entity Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Logistics Ltd."
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 99001 55432"
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ops@company.com"
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Operating Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Port Warehouse, Gate 4"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <option value="restricted">Restricted</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#202124]/10">
                <div>
                  {editingCustomer && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomer(editingCustomer.id, editingCustomer.name)}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Employer</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCustomer(false);
                      setEditingCustomer(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-[#686868] hover:text-[#202124] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D71920] hover:bg-[#A80F18] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    {editingCustomer ? 'Update Employer' : 'Register Employer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Top-up Modal */}
      {walletModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-3 border-b border-[#202124]/10">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#D71920]" />
                <h3 className="text-sm font-bold text-[#202124]">Credit Wallet Balance</h3>
              </div>
              <button
                onClick={() => setWalletModalCustomer(null)}
                className="p-1 text-[#686868] hover:text-[#202124] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRechargeWallet} className="space-y-4 mt-4 text-xs">
              <div>
                <span className="text-[#686868] block">Employer</span>
                <span className="font-bold text-[#202124]">{walletModalCustomer.name}</span>
                <span className="text-[11px] text-[#686868] block">
                  Current Balance: ₹{(walletModalCustomer.walletBalance || 0).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Credit Amount (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#FFFDF8] border border-[#202124]/15 rounded-lg focus:outline-none focus:border-[#D71920] font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletModalCustomer(null)}
                  className="px-3 py-1.5 text-xs text-[#686868] hover:text-[#202124] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Credit ₹{rechargeAmount.toLocaleString()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile View Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#202124]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#202124]/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#202124]/10"
                />
                <div>
                  <h2 className="text-base font-bold text-[#202124]">{selectedCustomer.name}</h2>
                  <p className="text-xs text-[#686868]">{selectedCustomer.companyName || 'Employer'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-[#686868] hover:text-[#202124] rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Phone Number</span>
                <span className="font-mono font-medium text-[#202124]">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Email</span>
                <span className="text-[#202124]">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Address</span>
                <span className="text-[#202124]">{selectedCustomer.location.address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Wallet Balance</span>
                <span className="font-bold text-emerald-700">₹{(selectedCustomer.walletBalance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Total Orders Placed</span>
                <span className="font-bold text-[#D71920]">{selectedCustomer.totalBookings}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#202124]/5">
                <span className="text-[#686868]">Status</span>
                <span className="capitalize font-bold text-[#202124]">{selectedCustomer.status}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#202124]/10 flex items-center justify-between">
              <button
                onClick={() => {
                  handleOpenEdit(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="px-3 py-1.5 bg-neutral-100 text-[#202124] rounded-lg text-xs font-semibold hover:bg-neutral-200 cursor-pointer"
              >
                Edit Employer
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
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
