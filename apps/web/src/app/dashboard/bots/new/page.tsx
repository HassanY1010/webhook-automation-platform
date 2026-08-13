'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import { RuleBuilder } from '@/components/rule-builder';
import { RuleOperator, LogicalOperator, BotMode } from '@webhook-auto/types';
import { Check, ArrowRight, ArrowLeft, Play } from 'lucide-react';

export default function NewBotWizard() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(isRtl ? 'بوت حجز الفنادق الآلي' : 'Automatic Hotel Booking Bot');
  const [description, setDescription] = useState(
    isRtl
      ? 'يستقبل إشارات الـ Webhooks، يفحص السعر <= 500، وينفذ طلب الحجز الفوري.'
      : 'Ingests hotel webhooks, verifies price <= 500, and triggers booking request.'
  );
  const [mode, setMode] = useState<BotMode>(BotMode.LIVE);
  const [rules, setRules] = useState<any>({
    logicalOperator: LogicalOperator.AND,
    conditions: [
      { field: 'price', operator: RuleOperator.LESS_OR_EQUAL, value: 500 },
      { field: 'status', operator: RuleOperator.EQUALS, value: 'available' },
    ],
  });
  const [actionUrl, setActionUrl] = useState('https://httpbin.org/post');
  const [actionBody, setActionBody] = useState('{"bookingId":"{{event.itemId}}","price":{{event.price}}}');
  const [testResult, setTestResult] = useState<any>(null);

  const handleSaveBot = async () => {
    setLoading(true);
    const payload = {
      name,
      description,
      mode,
      rules,
      actions: [
        {
          type: 'HTTP_REQUEST',
          name: 'Primary HTTP Action',
          method: 'POST',
          url: actionUrl,
          bodyTemplate: actionBody,
        },
      ],
    };

    const res = await apiRequest('/bots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.success) {
      router.push('/dashboard/bots');
    }
  };

  const handleRunTest = async () => {
    const res = await apiRequest('/testing/send-test-event', {
      method: 'POST',
      body: JSON.stringify({
        payload: { itemId: 'hotel_998', price: 350, status: 'available' },
        rules,
        actions: [
          { type: 'HTTP_REQUEST', name: 'Primary HTTP Action', method: 'POST', url: actionUrl, bodyTemplate: actionBody },
        ],
      }),
    });
    if (res.success) {
      setTestResult(res.data);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{isRtl ? 'معالج بناء بوت أتمتة جديد' : 'Bot Creation Wizard'}</h1>
          <p className="text-xs text-slate-400">
            {isRtl ? `الخطوة ${step} من 6 • بناء ونشر مسار أتمتة للمؤسسة` : `Step ${step} of 6 • Build and deploy enterprise automation`}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step >= s ? 'bg-blue-600' : 'bg-dark-border'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-100">{isRtl ? 'الخطوة 1: المعلومات الأساسية' : 'Step 1: Basic Information'}</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('botName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 h-20"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-100">{isRtl ? 'الخطوة 2: تحديد نمط التنفيذ' : 'Step 2: Execution Mode'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: BotMode.LIVE, name: 'LIVE', desc: isRtl ? 'تنفيذ الإجراءات الفعلية على السيرفرات الحقيقية' : 'Executes real external API actions' },
                { id: BotMode.DRY_RUN, name: 'DRY_RUN', desc: isRtl ? 'تقييم الشروط الحقيقية بدون إرسال خارجي' : 'Evaluates real rules, mocks external calls' },
                { id: BotMode.DEMO, name: 'DEMO', desc: isRtl ? 'وضع بيئة تجريبية معزولة واختبارية' : 'Interactive sandbox mode for testing' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as BotMode)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    mode === m.id
                      ? 'border-blue-500 bg-blue-600/10 text-white'
                      : 'border-dark-border text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{m.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-100">{isRtl ? 'الخطوة 3: تحديد قواعد الفلترة والشرط' : 'Step 3: Define Dynamic Rules'}</h3>
            <RuleBuilder rules={rules} onChange={setRules} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-100">{isRtl ? 'الخطوة 4: تهيئة الإجراء المستهدف (HTTP Action)' : 'Step 4: Configure HTTP Action'}</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{isRtl ? 'الرابط المستهدف (Destination URL)' : 'Destination URL'}</label>
              <input
                type="url"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isRtl ? 'قالب البيانات (يدعم المتغيرات مثل {{event.price}})' : 'Body Template (supports {{event.price}})'}
              </label>
              <textarea
                value={actionBody}
                onChange={(e) => setActionBody(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 h-24"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-100">{isRtl ? 'الخطوة 5: اختبار المحاكاة المباشرة' : 'Step 5: Test Execution Trace'}</h3>
            <button
              type="button"
              onClick={handleRunTest}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRtl ? 'تشغيل اختبار محاكاة فوري' : 'Run Test Event Simulation'}
            </button>

            {testResult && (
              <div className="bg-dark-bg p-4 rounded-xl border border-dark-border space-y-2 text-xs">
                <div className="font-bold text-emerald-400">{testResult.summary}</div>
                <pre className="bg-black/50 p-3 rounded text-[11px] text-slate-300 font-mono overflow-x-auto">
                  {JSON.stringify(testResult.trace, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-100">
              {isRtl ? 'جاهز لنشر واعتماد بوت الأتمتة' : 'Ready to Deploy Automation Bot'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isRtl
                ? 'سيتم نشر البوت فوراً كإصدار أول وتخصيص رابط Webhook آمن ومستقل.'
                : 'Your bot configuration will be published immediately as Version 1 with active tenant isolation.'}
            </p>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-50"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isRtl ? 'السابق' : 'Back'}
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {isRtl ? 'الخطوة التالية' : 'Next Step'}
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveBot}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (isRtl ? 'جاري النشر...' : 'Deploying...') : (isRtl ? 'حفظ ونشر البوت' : 'Save & Publish Bot')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
