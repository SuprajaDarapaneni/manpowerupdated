import React, { useState } from 'react';

export default function AdminApp() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#202124] flex">
      {/* Standalone Admin Frontend Panel */}
      <aside className="w-64 bg-[#1E1F23] text-white p-4">
        <h1 className="font-bold text-base text-[#D71920]">ManPowerLink Admin</h1>
        <p className="text-xs text-white/50 mt-1">Standalone Web Panel</p>
      </aside>
      <main className="flex-1 p-6">
        <h2 className="text-lg font-bold">Admin Workforce Command Center</h2>
        <p className="text-xs text-[#686868]">Connected to Central Backend at /api/v1</p>
      </main>
    </div>
  );
}
