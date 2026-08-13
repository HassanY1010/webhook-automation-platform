'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import { RotateCcw, CheckCircle } from 'lucide-react';

export default function DeadLetterQueuePage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [dlqJobs, setDlqJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDlq();
  }, []);

  const fetchDlq = async () => {
    setLoading(true);
    const res = await apiRequest('/executions/dlq');
    setLoading(false);
    if (res.success && res.data) {
      setDlqJobs(res.data);
    }
  };

  const retryJob = async (id: string) => {
    await apiRequest(`/executions/${id}/retry`, { method: 'POST' });
    fetchDlq();
  };

  const simulateFailedJob = () => {
    const mockFailedJob = {
      id: `dlq_err_${Math.random().toString(36).substring(2, 9)}`,
      bot: { name: isRtl ? 'بوت الربط الخارجي (Payment Gateway Retry)' : 'Payment Gateway Retry Bot' },
      status: 'FAILED',
      retryAttempt: 3,
      errorReason: isRtl ? '503 Service Unavailable - الخادم المستهدف لا يستجيب' : '503 Service Unavailable - Target server unreachable',
      createdAt: new Date().toISOString(),
    };
    setDlqJobs((prev) => [mockFailedJob, ...prev]);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('dlqTitle')}</h1>
          <p className="text-xs text-slate-400">{t('dlqSubtitle')}</p>
        </div>

        <button
          onClick={simulateFailedJob}
          className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          {isRtl ? 'محاكاة حدث فاشل لاختبار الـ DLQ' : 'Simulate Failed Event for DLQ Test'}
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500 py-12 text-center">
          {isRtl ? 'جاري تحميل قائمة المهام الفاشلة...' : 'Loading Dead Letter Queue...'}
        </div>
      ) : dlqJobs.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-100">
            {isRtl ? 'طابور المهام الفاشلة (DLQ) فارغ ونظيف' : 'DLQ is Completely Clean'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {isRtl
              ? 'تم تنفيذ جميع إجراءات الأتمتة بنجاح بدون أي أخطاء دائمية. يمكنك ضغط زر "محاكاة حدث فاشل" بالأعلى لتجربة آلية إعادة التنفيذ والتعافي التلقائي!'
              : 'All automation actions executed cleanly without permanent failures. Click "Simulate Failed Event" above to test automated retries!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dlqJobs.map((job) => (
            <div key={job.id} className="bg-dark-card border border-rose-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-100">{job.bot?.name || (isRtl ? 'بوت الأتمتة' : 'Automation Bot')}</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    {isRtl ? 'فشل نهائي (DLQ)' : 'DEAD LETTER QUEUED'}
                  </span>
                </div>
                <div className="text-xs text-rose-300 font-mono">
                  {job.errorReason || (isRtl ? 'فشل الاتصال بالخادم الخارجي' : 'External Endpoint HTTP 500 Connection Timeout')}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  ID: {job.id} • {isRtl ? 'المحاولات السابقة' : 'Retry Attempts'}: {job.retryAttempt} / 3
                </div>
              </div>

              <button
                onClick={() => retryJob(job.id)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 self-end md:self-auto transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('retryFailedJob')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
