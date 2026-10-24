import React from 'react';
import { CustomerAppSimulator } from '../../components/CustomerSimulator/CustomerAppSimulator';
import { dataService } from '../../services/storage';

interface CustomerAppProps {
  onBackToAdmin?: () => void;
  showExitBar?: boolean;
}

/**
 * CustomerApp: Standalone Mobile Web Application for Employers
 * Decoupled from Admin Dashboard and Employee App.
 * Can be deployed independently or embedded in Flutter WebView.
 */
export const CustomerApp: React.FC<CustomerAppProps> = ({ onBackToAdmin, showExitBar = false }) => {
  const categories = dataService.getCategories();
  const workers = dataService.getWorkers();
  const bookings = dataService.getBookings();

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#202124] flex flex-col items-center justify-center p-3 sm:p-6 antialiased select-none">
      {showExitBar && onBackToAdmin && (
        <div className="w-full max-w-md mb-2 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold">Customer Mobile App (Employer)</span>
          <button
            onClick={onBackToAdmin}
            className="text-[11px] font-bold text-[#D71920] hover:underline cursor-pointer"
          >
            ← Back to Admin
          </button>
        </div>
      )}
      <CustomerAppSimulator
        categories={categories}
        workers={workers}
        bookings={bookings}
      />
    </div>
  );
};
export default CustomerApp;
