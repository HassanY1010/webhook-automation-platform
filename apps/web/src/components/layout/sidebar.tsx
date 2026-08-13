'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import {
  Bot,
  Terminal,
  Webhook,
  AlertOctagon,
  Key,
  Users,
  CreditCard,
  Activity,
  Shield,
  LogOut,
  Globe,
  LayoutDashboard,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  let pathname = '';
  try {
    pathname = usePathname() || '';
  } catch (e) {
    pathname = '';
  }
  const { t, lang, setLang } = useLanguage();
  const { logout, user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.email === 'admin@webhookplatform.io';

  const menuItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/bots', label: t('bots'), icon: Bot },
    { href: '/dashboard/executions', label: t('executions'), icon: Terminal },
    { href: '/dashboard/sources', label: t('sources'), icon: Webhook },
    { href: '/dashboard/dlq', label: t('dlq'), icon: AlertOctagon },
    { href: '/dashboard/api-keys', label: t('apiKeys'), icon: Key },
    { href: '/dashboard/team', label: t('team'), icon: Users },
    { href: '/dashboard/billing', label: t('billing'), icon: CreditCard },
    { href: '/dashboard/status', label: t('status'), icon: Activity },
    ...(isSuperAdmin ? [{ href: '/dashboard/admin', label: t('admin'), icon: Shield }] : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div>
        <div className="flex items-center justify-between px-2 py-4 mb-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              W
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-wide">Webhook Automation</h1>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Enterprise SaaS</span>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-dark-border">
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800/40 border border-slate-800"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Language</span>
          </div>
          <span className="font-bold text-blue-400 uppercase">{lang === 'ar' ? 'العربية' : 'English'}</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-dark-border bg-dark-card flex-col min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-72 bg-dark-card border-r border-dark-border z-10 flex flex-col h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
