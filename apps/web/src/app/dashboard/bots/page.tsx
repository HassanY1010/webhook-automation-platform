'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import { Bot, Plus, Play, Pause, ExternalLink, Copy, Check } from 'lucide-react';

export default function BotsListPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    setLoading(true);
    const res = await apiRequest('/bots');
    setLoading(false);
    if (res.success && res.data) {
      setBots(res.data);
    }
  };

  const toggleBot = async (botId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await apiRequest(`/bots/${botId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchBots();
  };

  const copyWebhookUrl = (publicKey: string) => {
    const url = `http://localhost:4000/webhooks/${publicKey}`;
    navigator.clipboard.writeText(url);
    setCopiedId(publicKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('bots')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl ? 'إدارة وتكوين ومراقبة بوتات الأتمتة النشطة' : 'Manage, configure, and monitor active automation workflows'}
          </p>
        </div>

        <Link
          href="/dashboard/bots/new"
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t('createBot')}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          {isRtl ? 'جاري تحميل بوتات الأتمتة...' : 'Loading automation bots...'}
        </div>
      ) : bots.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center space-y-3">
          <Bot className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            {isRtl ? 'لا توجد بوتات مجهزة بعد' : 'No Bots Configured Yet'}
          </h3>
          <p className="text-xs text-slate-500">
            {isRtl ? 'قم بإنشاء بوت الأتمتة الأول لبدء استقبال الـ Webhooks' : 'Create your first automation bot to start receiving webhooks'}
          </p>
          <Link
            href="/dashboard/bots/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg mt-2"
          >
            {t('createBot')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{bot.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">v{bot.version} • {t('mode')}: {bot.mode}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    bot.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {bot.status === 'ACTIVE' ? (isRtl ? 'نشط' : 'ACTIVE') : (isRtl ? 'متوقف' : 'PAUSED')}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{bot.description || (isRtl ? 'لا يوجد وصف محدد.' : 'No description provided.')}</p>

              {/* Webhook Endpoint */}
              <div className="bg-dark-bg p-2.5 rounded-lg border border-dark-border flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  /webhooks/{bot.publicKey}
                </span>
                <button
                  onClick={() => copyWebhookUrl(bot.publicKey)}
                  className="p-1 text-slate-400 hover:text-blue-400"
                  title={isRtl ? 'نسخ رابط الـ Webhook' : 'Copy Webhook URL'}
                >
                  {copiedId === bot.publicKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="pt-3 border-t border-dark-border flex items-center justify-between">
                <button
                  onClick={() => toggleBot(bot.id, bot.status)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border ${
                    bot.status === 'ACTIVE'
                      ? 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10'
                      : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                  }`}
                >
                  {bot.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {bot.status === 'ACTIVE' ? (isRtl ? 'إيقاف' : 'Pause') : (isRtl ? 'تفعيل' : 'Activate')}
                </button>

                <Link
                  href={`/dashboard/bots/${bot.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  <span>{isRtl ? 'التفاصيل' : 'Details'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
