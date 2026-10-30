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
  Shield,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Employer Wallet Refund / Penalty / Credit State
  const [walletActionType, setWalletActionType] = useState<'refund' | 'penalty' | 'credit'>('refund');
  const [walletTxnId, setWalletTxnId] = useState('');
  const [walletAmount, setWalletAmount] = useState<number>(1200);
  const [walletComments, setWalletComments] = useState('');
  const [walletSuccessMessage, setWalletSuccessMessage] = useState<string | null>(null);

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

  const handleOpenWalletModal = (customer: Customer, defaultAction: 'refund' | 'penalty' | 'credit' = 'refund') => {
    setWalletModalCustomer(customer);
    setWalletActionType(defaultAction);
    const prefix = defaultAction === 'refund' ? 'TXN-REF-' : defaultAction === 'penalty' ? 'TXN-PEN-' : 'TXN-TOP-';
    setWalletTxnId(`${prefix}${Date.now().toString().slice(-6)}`);
    setWalletAmount(defaultAction === 'penalty' ? 500 : 1500);
    setWalletComments(
      defaultAction === 'refund'
        ? 'Order cancellation full refund approved by Administrator'
        : defaultAction === 'penalty'
        ? 'Worksite late cancellation penalty fee'
        : 'Direct employer wallet balance top-up'
    );
    setWalletSuccessMessage(null);
  };

  const handleExecuteWalletAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalCustomer || walletAmount <= 0) return;

    if (walletActionType === 'refund') {
      const res = dataService.issueCustomerRefund(
        walletModalCustomer.id,
        walletAmount,
        walletComments,
        walletTxnId
      );
      if (res.success) {
        setWalletSuccessMessage(`✓ Refund of ₹${walletAmount.toLocaleString()} credited to ${walletModalCustomer.name}. Txn ID: ${walletTxnId}`);
        const updated = dataService.getCustomer(walletModalCustomer.id);
        if (updated) setWalletModalCustomer(updated);
      }
    } else if (walletActionType === 'penalty') {
      const res = dataService.applyCustomerPenaltyDebit(
        walletModalCustomer.id,
        walletAmount,
        walletComments,
        walletTxnId
      );
      if (res.success) {
        setWalletSuccessMessage(`✓ Penalty of ₹${walletAmount.toLocaleString()} debited from ${walletModalCustomer.name}. Txn ID: ${walletTxnId}`);
        const updated = dataService.getCustomer(walletModalCustomer.id);
        if (updated) setWalletModalCustomer(updated);
      }
    } else {
      const res = dataService.rechargeCustomerWallet(
        walletModalCustomer.id,
        walletAmount,
        walletTxnId
      );
      if (res.success) {
        setWalletSuccessMessage(`✓ Wallet credited ₹${walletAmount.toLocaleString()} successfully.`);
        const updated = dataService.getCustomer(walletModalCustomer.id);
        if (updated) setWalletModalCustomer(updated);
      }
    }
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
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-700 text-xs tabular-nums">
                        ₹{(customer.walletBalance || 0).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleOpenWalletModal(customer, 'refund')}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-[#202124] rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-[#FFC928] shadow-2xs transition-colors"
                        title="Manage Wallet, Issue Refunds & Penalties"
                      >
                        <Wallet className="w-3 h-3 text-[#D71920]" />
                        <span>Refund / Wallet</span>
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

      {/* Comprehensive Employer Wallet, Refund & Penalty Management Center */}
      {walletModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-[#202124]/10 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#202124]/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-[#FFC928] flex items-center justify-center text-[#D71920]">
                  <Wallet className="w-5 h-5 text-[#D71920]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#202124]">
                    Employer Wallet, Refunds & Penalties
                  </h3>
                  <p className="text-[11px] text-[#686868]">
                    {walletModalCustomer.name} • {walletModalCustomer.companyName || 'Employer Account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWalletModalCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {/* Wallet Balance Hero Card */}
              <div className="bg-linear-to-r from-[#1E1F23] to-[#2D3039] p-4 rounded-2xl text-white shadow-md flex items-center justify-between border border-white/10">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
                    Current Employer Wallet Balance
                  </span>
                  <span className="text-3xl font-black text-[#FFC928]">
                    ₹{(walletModalCustomer.walletBalance || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-white/50 block mt-0.5">
                    Available for order auto-debits, refunds, or emergency dispatch settlements
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Ledger
                  </span>
                </div>
              </div>

              {/* Success Notification Alert */}
              {walletSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{walletSuccessMessage}</span>
                </div>
              )}

              {/* Action Tabs: Refund vs Penalty vs Top-up */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                    Select Administrative Action
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    Audit trail logged automatically
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setWalletActionType('refund');
                      setWalletTxnId(`TXN-REF-${Date.now().toString().slice(-6)}`);
                      setWalletAmount(1500);
                      setWalletComments('Order cancellation full refund approved by Administrator');
                      setWalletSuccessMessage(null);
                    }}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      walletActionType === 'refund'
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-black hover:bg-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Issue Refund (Credit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWalletActionType('penalty');
                      setWalletTxnId(`TXN-PEN-${Date.now().toString().slice(-6)}`);
                      setWalletAmount(500);
                      setWalletComments('Penalty fee deducted for late worksite cancellation / breach');
                      setWalletSuccessMessage(null);
                    }}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      walletActionType === 'penalty'
                        ? 'bg-[#D71920] text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-black hover:bg-slate-200'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Apply Penalty (Debit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWalletActionType('credit');
                      setWalletTxnId(`TXN-TOP-${Date.now().toString().slice(-6)}`);
                      setWalletAmount(2000);
                      setWalletComments('Manual wallet credit top-up by Administrator');
                      setWalletSuccessMessage(null);
                    }}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      walletActionType === 'credit'
                        ? 'bg-[#FFC928] text-[#202124] shadow-xs font-black'
                        : 'text-slate-600 hover:text-black hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Direct Top-Up (Credit)</span>
                  </button>
                </div>

                {/* Form Rendering Exact 4 Fields: Transaction ID, Comments, Type, Amount */}
                <form
                  onSubmit={handleExecuteWalletAction}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    walletActionType === 'refund'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : walletActionType === 'penalty'
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-black/5">
                    <span className="text-xs font-black text-[#202124] flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#D71920]" />
                      <span>
                        {walletActionType === 'refund' && 'Execute Employer Refund (Credit)'}
                        {walletActionType === 'penalty' && 'Deduct Compliance Penalty (Debit)'}
                        {walletActionType === 'credit' && 'Manual Wallet Balance Recharge'}
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                        walletActionType === 'penalty'
                          ? 'bg-red-200 text-[#D71920]'
                          : 'bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      TYPE: {walletActionType === 'penalty' ? 'DEBIT (-)' : 'CREDIT (+)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* 1. Transaction ID */}
                    <div>
                      <label className="block font-bold text-[#202124] mb-1">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={walletTxnId}
                        onChange={(e) => setWalletTxnId(e.target.value)}
                        placeholder="e.g. TXN-REF-10452"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-[#202124] focus:outline-none focus:border-[#D71920]"
                      />
                    </div>

                    {/* 2. Transaction Amount */}
                    <div>
                      <label className="block font-bold text-[#202124] mb-1">
                        Transaction Amount (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-[#202124]">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="50"
                          required
                          value={walletAmount}
                          onChange={(e) => setWalletAmount(Number(e.target.value))}
                          placeholder="1000"
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-[#202124] focus:outline-none focus:border-[#D71920]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Transaction Comments */}
                  <div>
                    <label className="block font-bold text-[#202124] mb-1 text-xs">
                      Transaction Comments / Reason *
                    </label>
                    <input
                      type="text"
                      required
                      value={walletComments}
                      onChange={(e) => setWalletComments(e.target.value)}
                      placeholder="e.g. Full refund for cancelled Order #1045 due to rain, or Penalty for late cancellation"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-[#202124] focus:outline-none focus:border-[#D71920]"
                    />
                  </div>

                  {/* Submit Action Button */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-slate-500">
                      Balance will update immediately across employer mobile app & central audit log.
                    </p>
                    <button
                      type="submit"
                      className={`px-4 py-2 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        walletActionType === 'refund'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : walletActionType === 'penalty'
                          ? 'bg-[#D71920] hover:bg-[#A80F18] text-white'
                          : 'bg-[#FFC928] hover:bg-[#E5A900] text-[#202124]'
                      }`}
                    >
                      {walletActionType === 'refund' && (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Credit Refund ₹{walletAmount.toLocaleString()}</span>
                        </>
                      )}
                      {walletActionType === 'penalty' && (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Deduct Penalty ₹{walletAmount.toLocaleString()}</span>
                        </>
                      )}
                      {walletActionType === 'credit' && (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Top-Up ₹{walletAmount.toLocaleString()}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Transaction History Table with exact 4 fields */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D71920]" />
                    <span>Employer Wallet Transaction Ledger</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    {(walletModalCustomer.walletTransactions || []).length} Recorded Transactions
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Transaction ID</th>
                        <th className="py-2.5 px-3">Transaction Comments</th>
                        <th className="py-2.5 px-3 text-center">Type</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(walletModalCustomer.walletTransactions || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                            No wallet transactions recorded for this employer yet.
                          </td>
                        </tr>
                      ) : (
                        walletModalCustomer.walletTransactions?.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2 px-3 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                              {tx.transactionId || tx.id}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-[#202124] block leading-tight">
                                {tx.comments || tx.description}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                                {tx.timestamp}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                                  tx.type === 'credit'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-[#D71920]'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right whitespace-nowrap">
                              <span
                                className={`font-mono font-black text-xs ${
                                  tx.type === 'credit' ? 'text-emerald-700' : 'text-[#D71920]'
                                }`}
                              >
                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#202124]/10 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">
                Employer ID: {walletModalCustomer.id}
              </span>
              <button
                type="button"
                onClick={() => setWalletModalCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#202124] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Wallet Center
              </button>
            </div>
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
