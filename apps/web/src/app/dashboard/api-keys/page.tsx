'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import {
  Plus,
  Key,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Trash2,
  AlertCircle,
  Clock,
  Loader2,
  Search,
  XCircle,
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdBy?: {
    fullName: string;
    email: string;
  };
}

export default function ApiKeysPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{
    name: string;
    rawKey: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    expiresInDays: '90',
    scopes: ['*'],
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest('/api-keys');
      if (res.success && res.data) {
        setKeys(res.data);
      } else {
        setError(res.error?.message || 'Failed to load API keys');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setFormSubmitting(true);
      setFormError(null);

      const expiresInDays =
        formData.expiresInDays === 'never'
          ? null
          : parseInt(formData.expiresInDays, 10);

      const res = await apiRequest('/api-keys', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          expiresInDays,
          scopes: formData.scopes,
        }),
      });

      if (res.success && res.data) {
        setShowCreateModal(false);
        setNewlyCreatedKey({
          name: res.data.apiKey.name,
          rawKey: res.data.rawKey,
        });
        setFormData({ name: '', expiresInDays: '90', scopes: ['*'] });
        await fetchKeys();
      } else {
        setFormError(res.error?.message || 'Failed to create API key');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create API key');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (
      !confirm(
        isRtl
          ? `هل أنت متأكد من إلغاء مفتاح الـ API "${keyName}"؟ سيتوقف أي خادم يستخدمه فوراً.`
          : `Are you sure you want to revoke API Key "${keyName}"? Any server using it will immediately receive 401 Unauthorized.`
      )
    ) {
      return;
    }

    try {
      const res = await apiRequest(`/api-keys/${keyId}/revoke`, {
        method: 'POST',
      });
      if (res.success) {
        await fetchKeys();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revoke API key');
    }
  };

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (
      !confirm(
        isRtl
          ? `هل أنت متأكد من حذف سجل المفتاح "${keyName}" نهائياً؟`
          : `Are you sure you want to permanently delete API Key record "${keyName}"?`
      )
    ) {
      return;
    }

    try {
      const res = await apiRequest(`/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        await fetchKeys();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredKeys = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.prefix.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('apiKeys')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'رموز المؤسسة للربط المباشر بين الخوادم (Server-to-Server)، ومفاتيح الـ REST API المشفرة بـ SHA-256'
              : 'Scoped organization tokens for Server-to-Server integration with SHA-256 hashed storage'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('generateKey') || (isRtl ? 'توليد مفتاح جديد' : 'Create API Key')}
        </button>
      </div>

      {/* Security Architecture Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>{isRtl ? 'تخزين مشفر بـ SHA-256' : 'SHA-256 Key Hashing'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl
              ? 'لا يتم تخزين المفاتيح الأصلية أبداً في قاعدة البيانات، بل يُخزن الـ Hash فقط لمطابقة الطلبات بأمان.'
              : 'Raw keys are never stored in plaintext. Only cryptographic SHA-256 hashes are verified.'}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Key className="w-4 h-4" />
            <span>{isRtl ? 'صلاحيات مخصصة (Scoped RBAC)' : 'Scoped RBAC Tokens'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl
              ? 'يمكنك تقييد وصول كل مفتاح لنطاقات معينة والتحكم الكامل في وقت الصلاحية والإلغاء الفوري.'
              : 'Restrict key permissions to specific scopes with custom expiration periods and instant revocation.'}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>{isRtl ? 'مصادقة Bearer Header' : 'Bearer Auth Header'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl
              ? 'مرر المفتاح في رأس الطلب: Authorization: Bearer wh_live_... أو x-api-key.'
              : 'Authenticate external requests with Header: Authorization: Bearer wh_live_...'}
          </p>
        </div>
      </div>

      {/* Newly Created Key Alert Banner */}
      {newlyCreatedKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3 relative shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>
                {isRtl
                  ? `تم توليد مفتاح API جديد بنجاح لـ "${newlyCreatedKey.name}"!`
                  : `New Secure API Key Generated for "${newlyCreatedKey.name}"!`}
              </span>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300">
            {isRtl
              ? 'احفظ هذا المفتاح في مكان آمن الآن، فلن يتم عرضه مرة أخرى كاملاً لحماية أمان مؤسستك:'
              : 'Save this API key in a secure vault now. It will never be shown in full again:'}
          </p>

          <div className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-emerald-500/20 font-mono text-xs text-emerald-300">
            <span className="truncate flex-1">{newlyCreatedKey.rawKey}</span>
            <button
              onClick={() =>
                copyToClipboard(newlyCreatedKey.rawKey, 'new_key')
              }
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 shrink-0"
            >
              {copiedId === 'new_key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'new_key' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ المفتاح' : 'Copy Key')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Organization Keys List */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-slate-200">
            {isRtl ? 'مفاتيح المنظمة النشطة (Active Organization Keys)' : 'Active Organization Keys'}
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className={`w-3.5 h-3.5 text-slate-500 absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'بحث في المفاتيح...' : 'Search keys...'}
              className={`w-full bg-[#0B0F17] border border-slate-800 rounded-xl ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              } py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">{isRtl ? 'جاري تحميل المفاتيح...' : 'Loading API keys...'}</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-dark-border rounded-xl space-y-3">
            <Key className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs text-slate-400">
              {isRtl ? 'لا توجد مفاتيح API في المنظمة حالياً.' : 'No API keys found.'}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              {isRtl ? '+ إنشاء أول مفتاح API' : '+ Create your first API Key'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredKeys.map((k) => {
              const isRevoked = k.status === 'REVOKED';
              const isExpired = k.status === 'EXPIRED';
              const isActive = k.status === 'ACTIVE';

              return (
                <div
                  key={k.id}
                  className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-100">{k.name}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isRevoked
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {k.status}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                      <span>{k.prefix}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 flex-wrap">
                      <div>
                        {isRtl ? 'الصلاحيات:' : 'Scopes:'}{' '}
                        <span className="text-slate-300 font-mono">
                          {k.scopes.join(', ')}
                        </span>
                      </div>
                      <div>
                        {isRtl ? 'آخر استخدام:' : 'Last Used:'}{' '}
                        <span className="text-slate-300">
                          {k.lastUsedAt
                            ? new Date(k.lastUsedAt).toLocaleString()
                            : isRtl
                            ? 'لم يستخدم بعد'
                            : 'Never'}
                        </span>
                      </div>
                      <div>
                        {isRtl ? 'تاريخ الانتهاء:' : 'Expires:'}{' '}
                        <span className="text-slate-300">
                          {k.expiresAt
                            ? new Date(k.expiresAt).toLocaleDateString()
                            : isRtl
                            ? 'دائم'
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {isActive && (
                      <button
                        onClick={() => handleRevokeKey(k.id, k.name)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        title={isRtl ? 'إلغاء المفتاح' : 'Revoke Key'}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{isRtl ? 'إلغاء' : 'Revoke'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteKey(k.id, k.name)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title={isRtl ? 'حذف السجل' : 'Delete Record'}
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

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100">
                {isRtl ? 'توليد مفتاح API جديد' : 'Generate New API Key'}
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

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'اسم المفتاح / الغرض' : 'Key Name / Description'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={
                    isRtl
                      ? 'مثال: خادم المعالجة الخلفي Backend Server'
                      : 'e.g. Production Backend Worker'
                  }
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'مدة الصلاحية' : 'Expiration Period'}
                </label>
                <select
                  value={formData.expiresInDays}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresInDays: e.target.value })
                  }
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="30">{isRtl ? '30 يوماً' : '30 Days'}</option>
                  <option value="60">{isRtl ? '60 يوماً' : '60 Days'}</option>
                  <option value="90">{isRtl ? '90 يوماً (موصى به)' : '90 Days (Recommended)'}</option>
                  <option value="365">{isRtl ? 'سنة واحدة' : '1 Year'}</option>
                  <option value="never">{isRtl ? 'دائم (بدون انتهاء)' : 'Never Expire'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'نطاق الصلاحيات (Scopes)' : 'Permissions Scopes'}
                </label>
                <select
                  value={formData.scopes[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, scopes: [e.target.value] })
                  }
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="*">{isRtl ? 'وصول كامل (Full Access: *)' : 'Full Access (*)'}</option>
                  <option value="events:write">{isRtl ? 'إرسال أحداث فقط (events:write)' : 'Ingest Events Only (events:write)'}</option>
                  <option value="read">{isRtl ? 'قراءة فقط (read)' : 'Read Only (read)'}</option>
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
                  <span>{isRtl ? 'توليد المفتاح' : 'Generate Key'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
