'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import {
  Webhook,
  RefreshCw,
  Plus,
  Copy,
  Check,
  ShieldCheck,
  Key,
  Clock,
  Trash2,
  Power,
  RotateCw,
  AlertCircle,
  ExternalLink,
  Bot as BotIcon,
  Loader2,
  Search,
} from 'lucide-react';

interface SourceItem {
  id: string;
  name: string;
  type: string;
  status: string;
  publicKey: string;
  eventsCount: number;
  lastEventAt: string | null;
  hasSecret: boolean;
  createdAt: string;
  bot: {
    id: string;
    name: string;
    status: string;
    mode: string;
  } | null;
}

interface BotItem {
  id: string;
  name: string;
  status: string;
}

export default function SourcesPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [sources, setSources] = useState<SourceItem[]>([]);
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdSecretData, setCreatedSecretData] = useState<{
    name: string;
    publicKey: string;
    secret: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    botId: '',
    type: 'WEBHOOK',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://webhook-auto-api.onrender.com';

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/sources');
      if (res.success && res.data) {
        setSources(res.data);
      } else {
        setError(res.error?.message || 'Failed to load sources');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const fetchBots = async () => {
    try {
      const res = await apiRequest('/bots?limit=100');
      if (res.success && res.data) {
        setBots(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchSources();
    fetchBots();
  }, []);

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setFormSubmitting(true);
      setFormError(null);

      const res = await apiRequest('/sources', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          botId: formData.botId || null,
          type: formData.type,
        }),
      });

      if (res.success && res.data) {
        setShowCreateModal(false);
        setCreatedSecretData({
          name: res.data.source.name,
          publicKey: res.data.source.publicKey,
          secret: res.data.secret,
        });
        setFormData({ name: '', botId: '', type: 'WEBHOOK' });
        await fetchSources();
      } else {
        setFormError(res.error?.message || 'Failed to create source');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create source');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (sourceId: string) => {
    try {
      const res = await apiRequest(`/sources/${sourceId}/toggle`, {
        method: 'POST',
      });
      if (res.success) {
        await fetchSources();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleRotateSecret = async (sourceId: string, sourceName: string) => {
    if (
      !confirm(
        isRtl
          ? `هل أنت متأكد من تدوير مفتاح السر للمصدر "${sourceName}"؟ سيتوقف المفتاح القديم فوراً.`
          : `Are you sure you want to rotate HMAC secret for "${sourceName}"? Old secret will stop working immediately.`
      )
    ) {
      return;
    }

    try {
      const res = await apiRequest(`/sources/${sourceId}/rotate-secret`, {
        method: 'POST',
      });
      if (res.success && res.data) {
        const src = sources.find((s) => s.id === sourceId);
        setCreatedSecretData({
          name: sourceName,
          publicKey: src?.publicKey || '',
          secret: res.data.secret,
        });
        await fetchSources();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to rotate secret');
    }
  };

  const handleDeleteSource = async (sourceId: string, sourceName: string) => {
    if (
      !confirm(
        isRtl
          ? `هل أنت متأكد من حذف المصدر "${sourceName}"؟ لا يمكن التراجع عن هذه الخطوة.`
          : `Are you sure you want to delete source "${sourceName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await apiRequest(`/sources/${sourceId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        await fetchSources();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete source');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.publicKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.bot && s.bot.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('sources')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'إدارة بوابات الـ Webhooks، مفاتيح توقيع HMAC-SHA256، وربط مصادر الأحداث بالبوتات'
              : 'Manage Webhook Ingestion Gateways, HMAC-SHA256 secrets, and Bot connections'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          {isRtl ? 'إضافة مصدر جديد' : 'Create Ingestion Source'}
        </button>
      </div>

      {/* Top Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                {isRtl ? 'محول الـ Webhook المباشر (Direct Webhook Ingestion)' : 'Direct Webhook Adapter'}
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {isRtl ? 'استقبال نشط • حماية HMAC مشفرة بـ AES-256' : 'Active Ingestion • AES-256 HMAC Guarded'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl
              ? 'يستقبل طلبات الـ HTTP POST بشكل غير متزامن، يثبت صحة توقيعات HMAC-SHA256 المشفرة، ويحمي من هجمات الإعادة بمهلة 300 ثانية.'
              : 'Ingests HTTP POST webhooks asynchronously, verifies AES-256 encrypted HMAC-SHA256 signatures, and pushes to BullMQ.'}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                {isRtl ? 'عزل أمني تام للمنظمات (Multi-Tenant Isolation)' : 'Multi-Tenant Isolation'}
              </h3>
              <span className="text-[10px] text-purple-400 font-semibold">
                {isRtl ? 'حماية معزولة على مستوى قاعدة البيانات' : 'Strict Database-level Tenant Isolation'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl
              ? 'جميع المصادر والمفاتيح مشفرة ومحكومة بالصلاحيات وتخضع لعزل كامل بحيث لا يمكن لأي منظمة الوصول لمصادر منظمة أخرى.'
              : 'All ingestion sources and HMAC signing secrets are securely bound to your organization workspace.'}
          </p>
        </div>
      </div>

      {/* Secret Creation Success Banner / Modal */}
      {createdSecretData && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3 relative shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isRtl
                  ? `تم إنشاء مفاتيح المصدر "${createdSecretData.name}" بنجاح!`
                  : `Source Credentials Generated for "${createdSecretData.name}"!`}
              </span>
            </div>
            <button
              onClick={() => setCreatedSecretData(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300">
            {isRtl
              ? 'احفظ مفتاح HMAC السري الآن في مكان آمن. لن يتم عرضه مرة أخرى كاملاً لحماية أمان بياناتك:'
              : 'Save this HMAC Secret Key in your secure vault now. It will never be shown in full again:'}
          </p>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">
                {isRtl ? 'رابط الـ Webhook المخصص:' : 'Dedicated Webhook Endpoint URL:'}
              </span>
              <div className="flex items-center gap-3 bg-black/60 p-2.5 rounded-xl border border-emerald-500/20 font-mono text-xs text-emerald-300">
                <span className="truncate flex-1">
                  {`${apiBaseUrl}/webhooks/${createdSecretData.publicKey}`}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${apiBaseUrl}/webhooks/${createdSecretData.publicKey}`,
                      'new_url'
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 shrink-0"
                >
                  {copiedId === 'new_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'new_url' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الرابط' : 'Copy URL')}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">
                {isRtl ? 'مفتاح توقيع الـ HMAC Secret:' : 'HMAC Signing Secret (Raw):'}
              </span>
              <div className="flex items-center gap-3 bg-black/60 p-2.5 rounded-xl border border-emerald-500/20 font-mono text-xs text-amber-300">
                <span className="truncate flex-1">{createdSecretData.secret}</span>
                <button
                  onClick={() =>
                    copyToClipboard(createdSecretData.secret, 'new_secret')
                  }
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 shrink-0"
                >
                  {copiedId === 'new_secret' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'new_secret' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ السر' : 'Copy Secret')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources List Container */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-slate-200">
            {isRtl ? 'المصادر والبوابات النشطة في مؤسستك' : 'Active Ingestion Sources & Gateways'}
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className={`w-3.5 h-3.5 text-slate-500 absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'بحث في المصادر...' : 'Search sources...'}
              className={`w-full bg-[#0B0F17] border border-slate-800 rounded-xl ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              } py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">{isRtl ? 'جاري تحميل المصادر...' : 'Loading sources...'}</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-dark-border rounded-xl space-y-3">
            <Webhook className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs text-slate-400">
              {isRtl ? 'لا توجد مصادر مطابقة حالياً.' : 'No ingestion sources found.'}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              {isRtl ? '+ إنشاء أول مصدر أحداث' : '+ Create your first source'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSources.map((src) => {
              const webhookUrl = `${apiBaseUrl}/webhooks/${src.publicKey}`;
              const isActive = src.status === 'ACTIVE';

              return (
                <div
                  key={src.id}
                  className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:border-slate-700"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {src.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-dark-border">
                      <span className="truncate flex-1">{webhookUrl}</span>
                      <button
                        onClick={() => copyToClipboard(webhookUrl, src.id)}
                        className="text-slate-400 hover:text-blue-400 flex items-center gap-1 text-[10px] font-sans"
                        title={isRtl ? 'نسخ الرابط' : 'Copy Endpoint'}
                      >
                        {copiedId === src.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1">
                        <BotIcon className="w-3 h-3 text-slate-400" />
                        <span>
                          {src.bot
                            ? `${isRtl ? 'البوت المرتبط:' : 'Connected Bot:'} ${src.bot.name}`
                            : isRtl
                            ? 'غير مرتبط ببوت'
                            : 'No Bot Linked'}
                        </span>
                      </div>
                      <div>
                        {isRtl ? 'الأحداث المستلمة:' : 'Events Count:'}{' '}
                        <span className="text-slate-300 font-bold">{src.eventsCount}</span>
                      </div>
                      <div>
                        {isRtl ? 'تاريخ الإنشاء:' : 'Created:'}{' '}
                        {new Date(src.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                    <button
                      onClick={() => handleToggleStatus(src.id)}
                      className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
                        isActive
                          ? 'bg-dark-card border-dark-border text-slate-300 hover:text-amber-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={isActive ? (isRtl ? 'إيقاف مؤقت' : 'Pause') : (isRtl ? 'تفعيل' : 'Activate')}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleRotateSecret(src.id, src.name)}
                      className="bg-dark-card hover:bg-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-dark-border flex items-center gap-1 transition-all"
                      title={isRtl ? 'تدوير مفتاح HMAC' : 'Rotate HMAC Secret'}
                    >
                      <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px]">{isRtl ? 'تدوير السر' : 'Rotate'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSource(src.id, src.name)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title={isRtl ? 'حذف المصدر' : 'Delete Source'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Source Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100">
                {isRtl ? 'إنشاء مصدر Webhook جديد' : 'Create Ingestion Source'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'اسم المصدر' : 'Source Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={
                    isRtl ? 'مثال: بوابة دفع Stripe' : 'e.g. Stripe Payment Gateway'
                  }
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'البوت المستهدف' : 'Target Automation Bot'}
                </label>
                <select
                  value={formData.botId}
                  onChange={(e) =>
                    setFormData({ ...formData, botId: e.target.value })
                  }
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">
                    {isRtl ? '-- اختر بوتاً لربطه (اختياري) --' : '-- Select Bot (Optional) --'}
                  </option>
                  {bots.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'نوع المصدر' : 'Source Ingestion Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="WEBHOOK">Direct HTTP Webhook</option>
                  <option value="REST_API">REST API Ingestion</option>
                  <option value="CUSTOM_HTTP">Custom HTTP Endpoint</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 border border-slate-800"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                >
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isRtl ? 'إنشاء المصدر' : 'Create Source'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
