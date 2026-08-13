'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { ToggleLeft, ToggleRight, Shield, Server, Sliders, Database, Zap, RefreshCw, CheckCircle, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const isRtl = lang === 'ar';
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.email === 'admin@webhookplatform.io';

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-dark-card border border-rose-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">403 - {isRtl ? 'غير مصرح بالوصول' : 'Access Forbidden'}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRtl
                ? 'عذراً! هذه اللوحة مخصصة لمدير المنظومة الفائق فقط (Super Admin). حسابك الحلي كعميل عادي لا يمتلك الصلاحيات العليا.'
                : 'Super Admin privileges required. Your standard client account does not have authorization to view this panel.'}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all w-full"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isRtl ? 'العودة إلى لوحة التحكم الرئيسية' : 'Return to Dashboard'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const [flags, setFlags] = useState([
    { key: 'polling_enabled', description: isRtl ? 'تفعيل مصادر الاستعلام الدوري HTTP Polling' : 'Enable HTTP Polling Sources', isEnabled: true },
    { key: 'telegram_enabled', description: isRtl ? 'تفعيل إجراءات إرسال تنبيهات تلجرام' : 'Enable Telegram Actions', isEnabled: true },
    { key: 'email_enabled', description: isRtl ? 'تفعيل إجراءات البريد الإلكتروني SMTP' : 'Enable SMTP Email Actions', isEnabled: true },
    { key: 'billing_enabled', description: isRtl ? 'تفعيل هيكلية الاشتراكات والفواتير التلقائية' : 'Enable Subscription Billing Architecture', isEnabled: true },
    { key: 'demo_mode_enabled', description: isRtl ? 'تفعيل وضع المساحات والبيئات التجريبية' : 'Enable Interactive Demo Workspaces', isEnabled: true },
    { key: 'hmac_verification_strict', description: isRtl ? 'تفعيل التدقيق الصارم لتوقيعات HMAC-SHA256' : 'Strict HMAC-SHA256 Signature Verification', isEnabled: true },
  ]);

  const toggleFlag = (key: string) => {
    setFlags(flags.map((f) => (f.key === key ? { ...f, isEnabled: !f.isEnabled } : f)));
  };

  const triggerAction = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('admin')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl ? 'إدارة المنظومة الشاملة، التحكم بأعلام الميزات الديناميكية، وإجراءات الصيانة العليا' : 'Global System Management & Dynamic Feature Flags Control Panel'}
          </p>
        </div>

        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>SUPER ADMIN PRIVILEGES</span>
        </span>
      </div>

      {/* Action Notification Banner */}
      {actionMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{actionMsg}</span>
        </div>
      )}

      {/* Global System Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'إجمالي المؤسسات' : 'Total Workspaces'}</div>
          <div className="text-2xl font-black text-white font-mono">148</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'البوتات النشطة' : 'Active Bots'}</div>
          <div className="text-2xl font-black text-blue-400 font-mono">1,240</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'الأحداث المعالجة' : 'Total Ingested Events'}</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">14.8M</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'طابور الـ Redis' : 'Redis Queue Speed'}</div>
          <div className="text-2xl font-black text-purple-400 font-mono">10,000/s</div>
        </div>
      </div>

      {/* Dynamic Feature Flags Grid */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? 'أعلام ميزات المنظومة الديناميكية (Dynamic Feature Flags)' : 'Dynamic Feature Flags'}</span>
          </h3>
        </div>

        <div className="space-y-3">
          {flags.map((f) => (
            <div key={f.key} className="bg-dark-bg p-4 rounded-xl border border-dark-border flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-100 font-mono">{f.key}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      f.isEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {f.isEnabled ? (isRtl ? 'مُفعل' : 'ENABLED') : (isRtl ? 'معطل' : 'DISABLED')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{f.description}</div>
              </div>

              <button onClick={() => toggleFlag(f.key)} className="text-slate-300 transition-all hover:scale-105">
                {f.isEnabled ? (
                  <ToggleRight className="w-9 h-9 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global System Maintenance Actions */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          <span>{isRtl ? 'إجراءات الصيانة وإدارة النظام العليا' : 'System Maintenance & Ops Actions'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => triggerAction(isRtl ? 'تم تنظيف ذاكرة الـ Redis الكاش بنجاح!' : 'Redis cache purged successfully!')}
            className="bg-dark-bg hover:bg-slate-800 text-slate-200 border border-dark-border rounded-xl p-4 text-xs font-semibold text-left space-y-1 transition-all"
          >
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تحديث كاش الـ Redis' : 'Purge Redis Cache'}</span>
            </div>
            <div className="text-[10px] text-slate-400">{isRtl ? 'تفريغ وتفريغ الذاكرة المؤقتة' : 'Flush transient memory keys'}</div>
          </button>

          <button
            onClick={() => triggerAction(isRtl ? 'تمت إعادة فهرسة جداول PostgreSQL بنجاح!' : 'Database tables re-indexed successfully!')}
            className="bg-dark-bg hover:bg-slate-800 text-slate-200 border border-dark-border rounded-xl p-4 text-xs font-semibold text-left space-y-1 transition-all"
          >
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{isRtl ? 'فهرسة قواعد البيانات' : 'Re-index Database'}</span>
            </div>
            <div className="text-[10px] text-slate-400">{isRtl ? 'تحسين سرعة الاستعلامات' : 'Optimize queries speed'}</div>
          </button>

          <button
            onClick={() => triggerAction(isRtl ? 'تمت إعادة مزامنة معالجات BullMQ!' : 'BullMQ Workers re-synced!')}
            className="bg-dark-bg hover:bg-slate-800 text-slate-200 border border-dark-border rounded-xl p-4 text-xs font-semibold text-left space-y-1 transition-all"
          >
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{isRtl ? 'مزامنة المعالجات' : 'Sync Worker Pipeline'}</span>
            </div>
            <div className="text-[10px] text-slate-400">{isRtl ? 'إعادة ضبط طوابير التنفيذ' : 'Reset execution queues'}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
