'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import { Bot, Terminal, Activity, CheckCircle2, XCircle, ArrowUpRight, Zap, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface OrgStats {
  bots: { total: number; active: number };
  executions: {
    total: number;
    success: number;
    failed: number;
    queued: number;
    last24h: number;
    last7d: number;
    successRate: string;
  };
  recentActivity: Array<{
    id: string;
    status: string;
    startedAt: string;
    bot: { name: string };
  }>;
}

export default function DashboardOverview() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/admin/org-stats');
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setError('Failed to load stats');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Build chart data from recent activity (last 7 days bucketed by day)
  const chartData = stats
    ? [
        { time: isRtl ? 'آخر 24 ساعة' : 'Last 24h', executions: stats.executions.last24h },
        { time: isRtl ? 'آخر 7 أيام' : 'Last 7d', executions: stats.executions.last7d },
        { time: isRtl ? 'الإجمالي' : 'Total', executions: stats.executions.total },
      ]
    : [];

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('dashboard')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'نظرة عامة على استيعاب وتنفيذ الـ Webhooks في الوقت الفعلي'
              : 'Real-time Webhook Ingestion & Action Execution Overview'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>{isRtl ? 'البيانات محدّثة تلقائياً كل 30 ثانية' : 'Auto-refreshes every 30 seconds'}</span>
        </div>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{isRtl ? 'جاري تحميل البيانات...' : 'Loading stats...'}</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {isRtl ? `خطأ في تحميل البيانات: ${error}` : `Error loading stats: ${error}`}
        </div>
      )}

      {/* Metric Cards — real data */}
      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{t('totalBots')}</span>
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{stats.bots.total}</div>
              <div className="text-[10px] text-slate-500 mt-2">
                {isRtl ? `${stats.bots.active} نشط` : `${stats.bots.active} active`}
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{t('activeBots')}</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats.bots.active}</div>
              <div className="text-[10px] text-slate-500 mt-2">
                {isRtl
                  ? `${stats.bots.total - stats.bots.active} غير نشط`
                  : `${stats.bots.total - stats.bots.active} inactive`}
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  {isRtl ? 'تنفيذات اليوم' : 'Executions 24h'}
                </span>
                <Terminal className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {stats.executions.last24h.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                {isRtl
                  ? `${stats.executions.queued} في الطابور`
                  : `${stats.executions.queued} queued`}
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{t('successRate')}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{stats.executions.successRate}</div>
              <div className={`text-[10px] mt-2 flex items-center gap-1 ${stats.executions.failed > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {stats.executions.failed > 0 ? (
                  <><XCircle className="w-3 h-3" /><span>{isRtl ? `${stats.executions.failed} فشل في DLQ` : `${stats.executions.failed} in DLQ`}</span></>
                ) : (
                  <span>{isRtl ? 'لا توجد أخطاء' : 'No failures'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Executions Chart — real data */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4">
              {isRtl ? 'ملخص التنفيذات' : 'Execution Summary'}
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                  <YAxis stroke="#475569" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#1F2937',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="executions"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorExec)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity — real data */}
          {stats.recentActivity.length > 0 && (
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4">
                {isRtl ? 'آخر التنفيذات' : 'Recent Executions'}
              </h3>
              <div className="space-y-2">
                {stats.recentActivity.slice(0, 5).map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between py-2 border-b border-dark-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          exec.status === 'SUCCESS'
                            ? 'bg-emerald-400'
                            : exec.status === 'FAILED'
                            ? 'bg-red-400'
                            : exec.status === 'RUNNING'
                            ? 'bg-blue-400 animate-pulse'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="text-xs text-slate-300">{exec.bot?.name || 'Unknown Bot'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          exec.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : exec.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-400'
                            : exec.status === 'RUNNING'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {exec.status}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(exec.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
