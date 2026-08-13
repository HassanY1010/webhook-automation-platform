'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Zap,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Server,
  Terminal,
  Globe,
  Sparkles,
  Check,
  Webhook,
  User,
} from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('en');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const isRtl = lang === 'ar';

  return (
    <div
      className={`min-h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-blue-500/30 ${
        isRtl ? 'dir-rtl' : 'dir-ltr'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0F17]/80 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25">
              W
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">Webhook Automation</span>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">Enterprise SaaS Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">
              {isRtl ? 'المميزات' : 'Features'}
            </a>
            <a href="#security" className="hover:text-blue-400 transition-colors">
              {isRtl ? 'الأمان والامتثال' : 'Security'}
            </a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">
              {isRtl ? 'الأسعار والخطط' : 'Pricing'}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 text-slate-300 hover:bg-slate-800/60 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all"
              >
                <User className="w-4 h-4" />
                <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-all"
                >
                  {isRtl ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all"
                >
                  {isRtl ? 'إنشاء حساب مجاني' : 'Get Started'}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isRtl ? 'منصة أتمتة الـ Webhooks السحابية للمؤسسات v1.0' : 'Enterprise Webhook Automation Engine v1.0'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          {isRtl ? (
            <>
              أتمتة وتوجيه الـ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Webhooks</span> بذكاء وأمان فائق
            </>
          ) : (
            <>
              Automate & Route <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Webhooks</span> with AST Precision
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {isRtl
            ? 'منصة سحابية متكاملة لربط وفلترة أحداث الـ Webhook عبر محرك شروط AST معزول، حماية فائقة ضد هجمات SSRF، ومعالجة ملايين الأحداث عبر طوابير BullMQ و Redis.'
            : 'Enterprise-grade Webhook SaaS platform to ingest, validate, filter via sandboxed AST rules, and dispatch events reliably with SSRF protection and BullMQ queues.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href={isLoggedIn ? '/dashboard' : '/register'}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all"
          >
            <span>{isRtl ? 'ابدأ التجربة المجانية الآن' : 'Start Free Trial'}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
          <Link
            href="/dashboard/bots"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>{isRtl ? 'معاينة البوتات التجريبية' : 'Explore Demo Bots'}</span>
          </Link>
        </div>

        {/* Live Interactive Workflow Visual Mock */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl text-left font-mono text-xs text-slate-300 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-slate-500 text-[11px] ml-2">webhook-pipeline-execution-trace.json</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>SSRF Safe & HMAC Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left dir-ltr" dir="ltr">
            <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
              <div className="text-blue-400 font-bold mb-2 flex items-center gap-1.5">
                <Webhook className="w-3.5 h-3.5" /> 1. Inbound Event
              </div>
              <pre className="text-[11px] text-slate-400 leading-tight">
{`{
  "event": "booking.created",
  "price": 350,
  "status": "available",
  "itemId": "ROOM-101"
}`}
              </pre>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
              <div className="text-amber-400 font-bold mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 2. AST Rule Filter
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="text-emerald-400">✓ price &lt;= 500 (350)</div>
                <div className="text-emerald-400">✓ status == "available"</div>
                <div className="text-blue-400 mt-2 font-bold">[RESULT: TRUE]</div>
              </div>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
              <div className="text-purple-400 font-bold mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> 3. Worker Action
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="text-slate-300">Target: Telegram / HTTP</div>
                <div className="text-slate-400">Status: 200 OK</div>
                <div className="text-emerald-400 font-bold mt-2">Latency: 142ms</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-slate-950/40 border-t border-slate-800/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-white mb-4">
              {isRtl ? 'مميزات هندسية مصممة للشركات والمطورين' : 'Engineered for Performance & Security'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isRtl
                ? 'تقنيات متطورة تضمن معالجة الـ Webhooks دون تأخير، مع أقصى مستويات الأمان وعزل البيانات.'
                : 'Enterprise capabilities for high-throughput webhook processing and bulletproof security.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {isRtl ? 'محرك شروط AST المعزول' : 'Sandboxed AST Rule Engine'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'تقييم الشروط المعقدة بدون استدعاء eval() أو new Function() لحظر أي محاولات التسلل أو الحقن البرمجي.'
                  : 'Evaluate dynamic rules securely without eval() or new Function() calls.'}
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {isRtl ? 'حماية SSRF وتشفير AES-256' : 'SSRF Protection & Encryption'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'فحص مسبق لعنوان الـ IP وحظر الشبكات الداخلية وهجمات DNS Rebinding مع تشفير المفاتيح بـ AES-256-GCM.'
                  : 'Pre-flight DNS IP check blocking private ranges with AES-256-GCM secret encryption.'}
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {isRtl ? 'طوابير BullMQ و Redis' : 'BullMQ & Redis Queues'}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isRtl
                  ? 'معالجة موزعة ومستقلة للطلبات مع إعادة المحاولة التلقائية (Exponential Backoff) وتتبع الـ Dead-Letter Queue.'
                  : 'Distributed worker background processing with backoff retries and DLQ state tracking.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-slate-800/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-white mb-4">
              {isRtl ? 'خطط واسعار مرنة تناسب تطلعاتك' : 'Flexible Subscription Plans'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isRtl ? 'اختر الخطة المناسبة لحجم أعمالك مع إمكانية الترقية أو الإلغاء في أي وقت' : 'Choose the tier that fits your application scale.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* FREE Plan */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">FREE</span>
                <div className="text-3xl font-black text-white my-3">$0 <span className="text-xs font-normal text-slate-500">{isRtl ? '/شهر' : '/mo'}</span></div>
                <p className="text-xs text-slate-400 mb-6">
                  {isRtl ? 'للتجربة والمشاريع الشخصية الصغرى' : 'For testing and small personal side projects'}
                </p>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? '1,000 Webhook / شهر' : '1,000 Webhooks / month'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? '3 بوتات أتمتة' : '3 Automation Bots'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'الاحتفاظ بالسجلات 24 ساعة' : '24-hour log retention'}</li>
                </ul>
              </div>
              <Link href="/register" className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-all">
                {isRtl ? 'ابدأ مجاناً' : 'Get Started Free'}
              </Link>
            </div>

            {/* STARTER Plan */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">STARTER</span>
                <div className="text-3xl font-black text-white my-3">$29 <span className="text-xs font-normal text-slate-500">{isRtl ? '/شهر' : '/mo'}</span></div>
                <p className="text-xs text-slate-400 mb-6">
                  {isRtl ? 'للشركات الناشئة والتطبيقات الصاعدة' : 'For growing startups and scaling applications'}
                </p>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? '50,000 Webhook / شهر' : '50,000 Webhooks / month'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? '15 بوت أتمتة' : '15 Automation Bots'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'تكامل Telegram & SMTP' : 'Telegram & SMTP Action Integrations'}</li>
                </ul>
              </div>
              <Link href="/register" className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold text-center transition-all shadow-lg shadow-blue-600/20">
                {isRtl ? 'اشترك الآن' : 'Subscribe Now'}
              </Link>
            </div>

            {/* PRO Plan */}
            <div className="bg-gradient-to-b from-blue-950/60 to-slate-900 border-2 border-blue-500/80 p-6 rounded-2xl flex flex-col justify-between relative shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                {isRtl ? 'الأكثر شعبية' : 'MOST POPULAR'}
              </div>
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">PRO</span>
                <div className="text-3xl font-black text-white my-3">$99 <span className="text-xs font-normal text-slate-500">{isRtl ? '/شهر' : '/mo'}</span></div>
                <p className="text-xs text-slate-300 mb-6">
                  {isRtl ? 'للمشاريع والمتاجر الضخمة' : 'For large-scale enterprise workflows and SaaS stores'}
                </p>
                <ul className="space-y-3 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? '500,000 Webhook / شهر' : '500,000 Webhooks / month'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'بوتات غير محدودة' : 'Unlimited Automation Bots'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'محرك قواعد AST المتقدم' : 'Advanced Sandboxed AST Rules Engine'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'دعم فني أولوية' : 'Priority SLA Support'}</li>
                </ul>
              </div>
              <Link href="/register" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold text-center transition-all shadow-xl shadow-blue-600/30">
                {isRtl ? 'تجربة خيار المحترفين' : 'Get Pro Tier'}
              </Link>
            </div>

            {/* ENTERPRISE Plan */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">ENTERPRISE</span>
                <div className="text-3xl font-black text-white my-3">
                  {isRtl ? 'مخصص' : 'Custom'} <span className="text-xs font-normal text-slate-500">{isRtl ? '/عقد' : '/contract'}</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  {isRtl ? 'للمؤسسات والشركات الكبرى' : 'For large enterprises requiring custom SLA and isolation'}
                </p>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'استهلاك محدد حسب الطلب' : 'Custom throughput quotas'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'خوادم مخصصة و SLA' : 'Dedicated clusters & SLA guarantees'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {isRtl ? 'دعم فني مباشر 24/7' : '24/7 Direct Engineering Support'}</li>
                </ul>
              </div>
              <Link href="/register" className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-all">
                {isRtl ? 'تواصل معنا' : 'Contact Sales'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A10] py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              W
            </div>
            <span className="font-semibold text-slate-300">Webhook Automation Platform SaaS © 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              {isRtl ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">
              {isRtl ? 'إنشاء حساب' : 'Get Started'}
            </Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              {isRtl ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
