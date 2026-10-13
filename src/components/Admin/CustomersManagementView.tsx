import React, { useState } from 'react';
import { Building2, Search, MapPin, Phone, Mail, ShoppingBag } from 'lucide-react';
import { Customer } from '../../types';

interface CustomersManagementViewProps {
  customers: Customer[];
}

export const CustomersManagementView: React.FC<CustomersManagementViewProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

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
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-[#202124]/10 shadow-xs">
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
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
              <th className="py-3 px-4 font-semibold">Employer / Customer</th>
              <th className="py-3 px-4 font-semibold">Business Unit</th>
              <th className="py-3 px-4 font-semibold">Contact Info</th>
              <th className="py-3 px-4 font-semibold">Operating Hub</th>
              <th className="py-3 px-4 font-semibold">Total Orders</th>
              <th className="py-3 px-4 font-semibold">Status</th>
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
                <td className="py-3 px-4 font-bold text-[#D71920] tabular-nums">
                  {customer.totalBookings} bookings
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16834A] uppercase">
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
