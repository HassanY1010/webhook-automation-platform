'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { Bell, Search, ShieldCheck, Menu, CheckCircle2, AlertTriangle, Zap, Key, X, ArrowRight, ArrowLeft, Trash2, Check } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL'>('ALL');

  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: isRtl ? '🚨 تنبيه أمان: محاولة توقيع HMAC غير صالحة' : '🚨 Security Alert: Invalid HMAC Signature',
      message: isRtl ? 'تم رفض 3 طلبات من IP غير معروف لتزوير توقيع البوابة.' : 'Rejected 3 requests from unverified IP attempting header spoofing.',
      time: isRtl ? 'منذ 2 دقيقة' : '2m ago',
      type: 'CRITICAL',
      unread: true,
      href: '/dashboard/sources',
    },
    {
      id: 'notif_2',
      title: isRtl ? '⚡ زيادة سريعة في المعاملات (Traffic Spike)' : '⚡ Traffic Spike Detected',
      message: isRtl ? 'معالجة 1,420 حدث في دقيقة واحدة عبر بوت حجز الفنادق.' : 'Processed 1,420 events/min on Automatic Hotel Booking Bot.',
      time: isRtl ? 'منذ 15 دقيقة' : '15m ago',
      type: 'INFO',
      unread: true,
      href: '/dashboard/executions',
    },
    {
      id: 'notif_3',
      title: isRtl ? '⚠️ فشل مؤقت ونقل لطابور الـ DLQ' : '⚠️ Temporary Failure Sent to DLQ',
      message: isRtl ? 'فشل استجابة API الخارجيه HTTP 503 وتم نقلها لـ DLQ.' : 'External endpoint HTTP 503 timeout saved in DLQ queue.',
      time: isRtl ? 'منذ 40 دقيقة' : '40m ago',
      type: 'CRITICAL',
      unread: false,
      href: '/dashboard/dlq',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => (filter === 'CRITICAL' ? n.type === 'CRITICAL' : true));

  return (
    <header className="h-16 border-b border-dark-border bg-dark-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="relative w-full">
          <Search className={`w-4 h-4 absolute top-3 text-slate-500 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={isRtl ? 'ابحث عن البوتات، الأحداث، أو السجلات...' : 'Search bots, events, executions...'}
            className={`w-full bg-dark-bg border border-dark-border rounded-xl ${
              isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
            } py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isRtl ? 'عزل تام للمستأجرين' : 'Tenant Isolated'}</span>
        </div>

        {/* Smart Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 relative border border-slate-800 transition-all"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Smart Notification Center Dropdown Drawer */}
          {showNotifications && (
            <div
              className={`absolute top-12 ${
                isRtl ? 'left-0 sm:-left-20' : 'right-0 sm:-right-20'
              } w-[340px] sm:w-[380px] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl z-50 space-y-4 text-slate-100 font-sans`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <h3 className="font-extrabold text-sm text-white">{isRtl ? 'مركز الإشعارات الذكي' : 'Smart Notification Center'}</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} {isRtl ? 'جديد' : 'new'}
                    </span>
                  )}
                </div>

                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notification Filters & Controls */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'الكل' : 'All'}
                  </button>
                  <button
                    onClick={() => setFilter('CRITICAL')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      filter === 'CRITICAL' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isRtl ? 'عالي الأهمية' : 'Critical'}
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-blue-400 font-bold hover:underline flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{isRtl ? 'تحديد الكل كمقروء' : 'Mark all read'}</span>
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">{isRtl ? 'لا توجد إشعارات حالياً' : 'No notifications found.'}</div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2 relative ${
                        n.unread
                          ? n.type === 'CRITICAL'
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs text-slate-100">{n.title}</div>
                        <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                        <Link
                          href={n.href}
                          onClick={() => setShowNotifications(false)}
                          className="text-[10px] text-blue-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>{isRtl ? 'الانتقال للتفاصيل' : 'Inspect Trace'}</span>
                          {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                        </Link>

                        <button onClick={() => removeNotification(n.id)} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-dark-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {user?.fullName?.[0] || 'U'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-slate-200">{user?.fullName || (isRtl ? 'المسؤول' : 'User')}</div>
            <div className="text-[10px] text-slate-400">{user?.email || 'admin@webhookplatform.io'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
