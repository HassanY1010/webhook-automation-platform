'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { Webhook, RefreshCw, Plus, Copy, Check, ShieldCheck, Play, Key, Clock } from 'lucide-react';

export default function SourcesPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [sources, setSources] = useState([
    {
      id: 'src_1',
      name: isRtl ? 'بوابة Stripe للمدفوعات' : 'Stripe Payments Gateway',
      type: 'WEBHOOK',
      publicKey: 'src_stripe_live_891f',
      endpoint: 'http://localhost:4000/webhooks/src_stripe_live_891f',
      hmacHeader: 'X-Webhook-Signature',
      toleranceSeconds: 300,
      status: 'ACTIVE',
      eventsCount: 1420,
    },
    {
      id: 'src_2',
      name: isRtl ? 'مستطلع طلبيات Shopify' : 'Shopify Orders Poller',
      type: 'POLLING',
      interval: '30 seconds',
      endpoint: 'https://httpbin.org/get',
      status: 'SCHEDULED',
      eventsCount: 890,
    },
    {
      id: 'src_3',
      name: isRtl ? 'بوابة حجوزات الفنادق المباشرة' : 'Direct Hotel Booking Gateway',
      type: 'WEBHOOK',
      publicKey: 'bot_suggae9rmsr1vln4',
      endpoint: 'http://localhost:4000/webhooks/bot_suggae9rmsr1vln4',
      hmacHeader: 'X-Webhook-Signature',
      toleranceSeconds: 300,
      status: 'ACTIVE',
      eventsCount: 45,
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('sources')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'تكوين بوابات الـ Webhooks، مفاتيح توقيع HMAC-SHA256، وجداول الاستعلام الدوري'
              : 'Configure Webhook Gateway parameters, HMAC secret keys, and polling schedules'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          {isRtl ? 'إضافة مصدر جديد' : 'Create Ingestion Source'}
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Webhook Adapter */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">{isRtl ? 'محول الـ Webhook المباشر (Direct Webhook Ingestion)' : 'Direct Webhook Adapter'}</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">{isRtl ? 'استقبال نشط • حماية HMAC' : 'Active Ingestion • HMAC Guarded'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl
              ? 'يستقبل طلبات الـ HTTP POST بشكل غير متزامن، يثبت صحة توقيعات HMAC-SHA256، ويحمي من هجمات الإعادة (Replay Attacks) بمهلة 300 ثانية.'
              : 'Ingests HTTP POST webhooks asynchronously, verifies HMAC-SHA256 signatures, enforces 300s replay tolerance, and returns HTTP 202.'}
          </p>
        </div>

        {/* Polling API Adapter */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">{isRtl ? 'محول الاستعلام الدوري (HTTP Polling Adapter)' : 'HTTP Polling Adapter'}</h3>
              <span className="text-[10px] text-purple-400 font-semibold">{isRtl ? 'جدولة زمنية نشطة via BullMQ' : 'BullMQ Repeatable Jobs Active'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl
              ? 'يقوم باستعلام الـ REST APIs الخارجية دورياً (كل 10ث، 30ث، 1د) عبر مهام BullMQ التكرارية لاستخراج الأحداث الجديدة.'
              : 'Polls external REST APIs periodically (10s, 30s, 1m, 5m intervals) using BullMQ repeatable background jobs.'}
          </p>
        </div>
      </div>

      {/* Active Sources List */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">
          {isRtl ? 'المصادر والبوابات النشطة في مؤسستك' : 'Active Ingestion Sources & Gateways'}
        </h3>

        <div className="space-y-3">
          {sources.map((src) => (
            <div key={src.id} className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-100">{src.name}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                      src.type === 'WEBHOOK'
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                        : 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                    }`}
                  >
                    {src.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>{src.endpoint}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={() => copyToClipboard(src.endpoint, src.id)}
                  className="bg-dark-card hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-dark-border flex items-center gap-1.5 transition-all"
                >
                  {copiedId === src.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === src.id ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الرابط' : 'Copy Endpoint')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
