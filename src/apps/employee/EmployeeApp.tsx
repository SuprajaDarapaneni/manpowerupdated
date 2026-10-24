import React from 'react';
import { EmployeeAppSimulator } from '../../components/EmployeeSimulator/EmployeeAppSimulator';
import { dataService } from '../../services/storage';

interface EmployeeAppProps {
  onBackToAdmin?: () => void;
  showExitBar?: boolean;
}

/**
 * EmployeeApp: Standalone Mobile Web Application for Workers
 * Decoupled from Admin Dashboard and Customer App.
 * Can be deployed independently or embedded in Flutter WebView.
 */
export const EmployeeApp: React.FC<EmployeeAppProps> = ({ onBackToAdmin, showExitBar = false }) => {
  const workers = dataService.getWorkers();
  const bookings = dataService.getBookings();

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#202124] flex flex-col items-center justify-center p-3 sm:p-6 antialiased select-none">
      {showExitBar && onBackToAdmin && (
        <div className="w-full max-w-md mb-2 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold">Employee Mobile App (Worker)</span>
          <button
            onClick={onBackToAdmin}
            className="text-[11px] font-bold text-[#D71920] hover:underline cursor-pointer"
          >
            ← Back to Admin
          </button>
        </div>
      )}
      <EmployeeAppSimulator
        workers={workers}
        bookings={bookings}
      />
    </div>
  );
};
export default EmployeeApp;
