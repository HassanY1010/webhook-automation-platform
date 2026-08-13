'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { Plus, Key, Copy, Check, ShieldAlert, Lock, Trash2, Eye, EyeOff } from 'lucide-react';

export default function ApiKeysPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const [keys, setKeys] = useState([
    {
      id: 'key_1',
      name: isRtl ? 'مفتاح الربط الفعلي (Production)' : 'Production Integration Key',
      prefix: 'sk_live_8f3a991b2c4d',
      createdAt: '2026-08-01',
      scopes: ['*'],
      environment: 'LIVE',
    },
    {
      id: 'key_2',
      name: isRtl ? 'مفتاح البيئة التجريبية (Sandbox)' : 'Test Sandbox Key',
      prefix: 'sk_test_1b9c882a7e5f',
      createdAt: '2026-08-10',
      scopes: ['read', 'events:write'],
      environment: 'TEST',
    },
  ]);

  const generateNewKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `sk_live_${randomHex}`;
    const newKeyObj = {
      id: `key_${Date.now()}`,
      name: isRtl ? `مفتاح API جديد #${keys.length + 1}` : `New API Key #${keys.length + 1}`,
      prefix: `${fullKey.slice(0, 16)}...`,
      createdAt: new Date().toISOString().split('T')[0],
      scopes: ['*'],
      environment: 'LIVE',
    };
    setKeys([newKeyObj, ...keys]);
    setNewlyCreatedKey(fullKey);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('apiKeys')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'رموز المؤسسة المحددة الصلاحيات، مفاتيح الـ REST API، والأسرار المشفرة بـ AES-256-GCM'
              : 'Scoped organization tokens and AES-256-GCM encrypted master secrets'}
          </p>
        </div>

        <button
          onClick={generateNewKey}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('generateKey')}
        </button>
      </div>

      {/* Newly Created Key Alert Banner */}
      {newlyCreatedKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3 relative">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>{isRtl ? 'تم توليد مفتاح API آمن جديد بنجاح!' : 'New Secure API Key Generated Successfully!'}</span>
          </div>
          <p className="text-xs text-slate-300">
            {isRtl
              ? 'احفظ هذا المفتاح في مكان آمن، فلن يتم عرضه مرة أخرى كاملاً لحماية حسابك:'
              : 'Save this API key in a secure vault. It will not be shown in full again for safety:'}
          </p>
          <div className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-emerald-500/20 font-mono text-xs text-emerald-300">
            <span className="truncate flex-1">{newlyCreatedKey}</span>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey, 'new_key')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5"
            >
              {copiedId === 'new_key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'new_key' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ المفتاح' : 'Copy Key')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Security Architecture Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>{isRtl ? 'تشفير AES-256-GCM' : 'AES-256-GCM Security'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl ? 'تُحفظ جميع الأسرار والمفاتيح مشفرة ومحميّة بقشور عزل المستأجرين.' : 'All secrets encrypted at rest with tenant-isolated master KMS keys.'}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Key className="w-4 h-4" />
            <span>{isRtl ? 'صلاحيات مخصصة (Scoped RBAC)' : 'Scoped RBAC Tokens'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl ? 'يمكنك تحديد نطاق صلاحيات المفتاح (قراءة فقط، كتابة أحداث، أو وصول كامل).' : 'Restrict key permissions to read-only, write-only, or full admin scopes.'}
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>{isRtl ? 'التحقق عبر Authorization Header' : 'Bearer Auth Header'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRtl ? 'مرر المفتاح في هيدر الطلب: Authorization: Bearer sk_live_...' : 'Pass in HTTP Request Header: Authorization: Bearer sk_live_...'}
          </p>
        </div>
      </div>

      {/* Active Organization Keys List */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">
          {isRtl ? 'مفاتيح المنظمة النشطة (Active Organization Keys)' : 'Active Organization Keys'}
        </h3>
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.id} className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-100">{k.name}</span>
                  <span className="text-[9px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    {k.environment}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">{k.prefix}</div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded font-mono">
                  {isRtl ? 'الصلاحيات' : 'Scopes'}: {k.scopes.join(', ')}
                </span>
                <button
                  onClick={() => copyToClipboard(k.prefix, k.id)}
                  className="bg-dark-card hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-dark-border flex items-center gap-1.5 transition-all"
                >
                  {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === k.id ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ البادئة' : 'Copy Prefix')}</span>
                </button>
                <button
                  onClick={() => deleteKey(k.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
