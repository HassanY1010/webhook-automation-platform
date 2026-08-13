'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-bg text-slate-100 font-sans">
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="p-4 md:p-6 flex-1 overflow-y-auto max-w-full">{children}</main>
      </div>
    </div>
  );
}
