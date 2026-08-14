'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, Globe, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { lang, setLang } = useLanguage();
  const isRtl = lang === 'ar';
  const [email, setEmail] = useState('admin@webhookplatform.io');
  const [password, setPassword] = useState('Admin123456!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });

    setLoading(false);

    if (res.success && res.data) {
      login(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } else {
      let errorMsg =
        (typeof res.error === 'string' ? res.error : res.error?.message) ||
        res.message;

      if (!errorMsg || errorMsg === 'Unauthorized') {
        if (res.statusCode === 500) {
          errorMsg = isRtl
            ? 'حدث خطأ في الخادم (HTTP 500)، يرجى مراجعة حالة النظام.'
            : 'Server error (HTTP 500). Please check system status.';
        } else {
          errorMsg = isRtl
            ? 'فشل تسجيل الدخول، تأكد من صحة البريد الإلكتروني وكلمة المرور.'
            : 'Login failed, check your email and password.';
        }
      }

      setError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@webhookplatform.io');
    setPassword('Admin123456!');
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-[#0B0F17] p-4 relative overflow-hidden text-slate-100 font-sans ${
        isRtl ? 'dir-rtl' : 'dir-ltr'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Language switcher top corner */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white transition-all shadow-md"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="text-center space-y-2 mb-8">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/25 mx-auto mb-4 hover:scale-105 transition-all">
              W
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isRtl ? 'تسجيل الدخول لمنظومتك' : 'Sign In to Your Workspace'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {isRtl
              ? 'إدارة الـ Webhooks والبوتات والتنفيذات الآلية'
              : 'Manage your automated webhooks, bots, and executions'}
          </p>
        </div>

        {/* Quick Demo Credentials Autofill Banner */}
        <div className="mb-6 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-medium">
              {isRtl ? 'بيانات التجربة للمسؤول مجهزة تلقائياً' : 'Default Admin Demo Account Loaded'}
            </span>
          </div>
          <button
            onClick={fillDemoAdmin}
            type="button"
            className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg transition-all"
          >
            {isRtl ? 'تعبئة التجربة' : 'Auto Fill'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-[#0B0F17] border border-slate-800 rounded-xl ${
                  isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                } py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono`}
                placeholder="admin@webhookplatform.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-[#0B0F17] border border-slate-800 rounded-xl ${
                  isRtl ? 'pr-9 pl-10' : 'pl-9 pr-10'
                } py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-3.5 text-slate-500 hover:text-slate-300 ${isRtl ? 'left-3' : 'right-3'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all mt-6"
          >
            {loading
              ? isRtl
                ? 'جاري التحقق من الهوية...'
                : 'Authenticating...'
              : isRtl
              ? 'الدخول للوحة التحكم'
              : 'Sign In to Dashboard'}
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {isRtl ? 'ليس لديك حساب بعد؟' : "Don't have an account?"}{' '}
          <Link href="/register" className="text-blue-400 font-bold hover:underline">
            {isRtl ? 'إنشاء حساب جديد' : 'Create Account'}
          </Link>
        </div>

        {/* Security certification badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isRtl
              ? 'تشفير AES-256 • حماية SSRF • عزل تام للمستأجرين'
              : 'AES-256 Encrypted • SSRF Guarded • Tenant Isolated'}
          </span>
        </div>
      </div>
    </div>
  );
}
