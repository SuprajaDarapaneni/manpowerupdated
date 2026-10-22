import React from 'react';
import { ShieldCheck, Clock, User, Globe } from 'lucide-react';
import { AuditLogItem } from '../../types';

interface AuditTrailViewProps {
  logs: AuditLogItem[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#202124]/10 shadow-xs">
        <h1 className="text-xl font-bold text-[#202124]">Security & Operational Audit Trail</h1>
        <p className="text-xs text-[#686868] mt-1">
          Immutable event log of all administrative actions, worker approvals, pricing modifications, and commission overrides.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#202124]/10 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#202124]/10 bg-[#FFFDF8] text-[#686868]">
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Action Performed</th>
              <th className="py-3 px-4 font-semibold">Actor</th>
              <th className="py-3 px-4 font-semibold">Target / Resource</th>
              <th className="py-3 px-4 font-semibold">Client IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202124]/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#FFFDF8] transition-colors">
                <td className="py-3 px-4 text-[#686868] font-mono text-[11px]">{log.timestamp}</td>
                <td className="py-3 px-4 font-semibold text-[#202124]">{log.action}</td>
                <td className="py-3 px-4 text-[#686868]">{log.actor}</td>
                <td className="py-3 px-4 text-[#202124] max-w-sm truncate">{log.target}</td>
                <td className="py-3 px-4 text-[#686868] font-mono text-[11px]">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
