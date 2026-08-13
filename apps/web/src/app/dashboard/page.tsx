'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import { Bot, Terminal, Activity, CheckCircle2, XCircle, ArrowUpRight, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const mockChartData = [
  { time: '00:00', success: 120, failed: 2 },
  { time: '04:00', success: 340, failed: 5 },
  { time: '08:00', success: 890, failed: 12 },
  { time: '12:00', success: 1420, failed: 8 },
  { time: '16:00', success: 1980, failed: 15 },
  { time: '20:00', success: 2450, failed: 10 },
];

export default function DashboardOverview() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [stats, setStats] = useState({
    totalBots: 8,
    activeBots: 6,
    eventsToday: 2460,
    successRate: '99.2%',
  });

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('dashboard')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'نظرة عامة على استيعاب وتنفيد الـ Webhooks في الوقت الفعلي'
              : 'Real-time Webhook Ingestion & Action Execution Overview'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>{isRtl ? 'حالة الطابور: مثالية (تأخير 0ms)' : 'Queue Health: Optimal (0ms latency)'}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('totalBots')}</span>
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalBots}</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-2">
            <ArrowUpRight className="w-3 h-3" />
            <span>{isRtl ? '+2 تم إنشاؤهم هذا الأسبوع' : '+2 created this week'}</span>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('activeBots')}</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.activeBots}</div>
          <div className="text-[10px] text-slate-500 mt-2">
            {isRtl ? '2 بوت متوقف حالياً' : '2 bots currently paused'}
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('eventsToday')}</span>
            <Terminal className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.eventsToday.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[10px] text-purple-400 font-medium mt-2">
            <span>{isRtl ? 'متوسط وقت التنفيذ 120ms' : 'Avg 120 ms execution time'}</span>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('successRate')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.successRate}</div>
          <div className="text-[10px] text-emerald-400 mt-2">
            {isRtl ? '0 مهام فاشلة مستحقة في DLQ' : '0 DLQ failures outstanding'}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-200 mb-4">
          {isRtl ? 'سجل التنفيذات وإنتاجية الأحداث (24 ساعة)' : 'Executions & Traffic Throughput (24h)'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', fontSize: '12px' }} />
              <Area type="monotone" dataKey="success" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSuccess)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
