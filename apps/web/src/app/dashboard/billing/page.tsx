'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { CreditCard, Check, Zap, ArrowUpRight, BarChart3, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [currentTier, setCurrentTier] = useState('ENTERPRISE');

  const plans = [
    {
      id: 'STARTER',
      name: isRtl ? 'خطة المبتدئين (Starter)' : 'Starter Tier',
      price: '$29',
      events: '100,000',
      retention: isRtl ? '30 يوم احتفاظ بالسجلات' : '30 Days Log Retention',
      bots: '5 Bots',
    },
    {
      id: 'PRO',
      name: isRtl ? 'الخطة الاحترافية (Pro)' : 'Pro Tier',
      price: '$99',
      events: '1,000,000',
      retention: isRtl ? '90 يوم احتفاظ بالسجلات' : '90 Days Log Retention',
      bots: '25 Bots',
    },
    {
      id: 'ENTERPRISE',
      name: isRtl ? 'خطة المؤسسات (Enterprise)' : 'Enterprise Tier',
      price: '$299',
      events: '10,000,000',
      retention: isRtl ? '365 يوم احتفاظ بالسجلات' : '365 Days Log Retention',
      bots: isRtl ? 'بوتات غير محدودة' : 'Unlimited Bots',
    },
  ];

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-xl font-bold text-slate-100">{t('billing')}</h1>
        <p className="text-xs text-slate-400">
          {isRtl ? 'مستويات الخطط، حصص الاستهلاك الفعلي، وإحصائيات الحساب' : 'Plan tiers, event quotas, and usage metering abstractions'}
        </p>
      </div>

      {/* Current Active Plan Card */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-blue-400" />
            <span>{t('currentPlan')}</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {currentTier} TIER
          </div>
          <div className="text-xs text-slate-300">
            {isRtl
              ? '10,000,000 حدث/شهر • بوتات غير محدودة • احتفاظ بالسجلات لمدة 365 يوم • دعم مباشر 24/7'
              : '10,000,000 events/mo • Unlimited Bots • 365 Days Log Retention • 24/7 SLA Support'}
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            {isRtl ? 'الاشتراك نشط' : 'Active Subscription'}
          </span>
        </div>
      </div>

      {/* Real-time Usage Metering */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? 'إحصائيات استهلاك الحصص للشهر الحالي' : 'Current Monthly Quota Consumption'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">1,465 / 10,000,000 events (0.01%)</span>
        </div>

        <div className="w-full bg-dark-bg rounded-full h-3 p-0.5 border border-dark-border">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[2%]" />
        </div>
      </div>

      {/* Available Plans Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`p-6 rounded-2xl border transition-all space-y-5 relative ${
              currentTier === p.id
                ? 'bg-slate-900/90 border-blue-500/50 shadow-xl shadow-blue-500/10'
                : 'bg-dark-card border-dark-border hover:border-slate-700'
            }`}
          >
            {currentTier === p.id && (
              <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {isRtl ? 'خاطتك الحالية' : 'Current Plan'}
              </span>
            )}

            <div>
              <h4 className="font-bold text-sm text-slate-100">{p.name}</h4>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">{p.price}</span>
                <span className="text-xs text-slate-400">/{isRtl ? 'شهر' : 'month'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{p.events} {isRtl ? 'حدث/شهر' : 'events/mo'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{p.bots}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{p.retention}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentTier(p.id)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentTier === p.id
                  ? 'bg-slate-800 text-slate-400 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {currentTier === p.id ? (isRtl ? 'الخطة المفعلة حالياً' : 'Active Plan') : (isRtl ? 'التحويل لهذه الخطة' : 'Switch to this Plan')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
