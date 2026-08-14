'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';
import { Lock, Mail, User, Building, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, Globe } from 'lucide-react';

export default function RegisterPage() {
  const { lang, setLang } = useLanguage();
  const isRtl = lang === 'ar';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, organizationName }),
    });

    setLoading(false);

    if (res.success && res.data) {
      login(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } else {
      const errorMessage =
        (typeof res.error === 'string' ? res.error : res.error?.message) ||
        (res as any).message ||
        (isRtl ? 'فشل إنشاء الحساب، يرجى المحاولة مجدداً.' : 'Registration failed');
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-[#0B0F17] p-4 relative overflow-hidden text-slate-100 font-sans ${
        isRtl ? 'dir-rtl' : 'dir-ltr'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

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
            {isRtl ? 'إنشاء حساب جديد للمؤسسات' : 'Create Enterprise SaaS Account'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {isRtl
              ? 'ابدأ بناء مسارات الـ Webhook الآلية خلال ثوانٍ'
              : 'Start building automated webhook pipelines in seconds'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'الاسم الكامل' : 'Full Name'} *
            </label>
            <div className="relative">
              <User className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full bg-[#0B0F17] border border-slate-800 rounded-xl ${
                  isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                } py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all`}
                placeholder={isRtl ? 'مثال: أحمد محمد' : 'e.g. Alex Morgan'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'اسم المنظمة / الشركة' : 'Organization Name'} *
            </label>
            <div className="relative">
              <Building className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className={`w-full bg-[#0B0F17] border border-slate-800 rounded-xl ${
                  isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                } py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all`}
                placeholder={isRtl ? 'مثال: شركة الحلول الذكية' : 'e.g. Acme Corp'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
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
                placeholder="admin@yourcompany.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'كلمة المرور' : 'Password'} *
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
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
                ? 'جاري تجهيز مساحة العمل...'
                : 'Creating Workspace...'
              : isRtl
              ? 'إنشاء مساحة العمل والبدء'
              : 'Create Workspace & Start'}
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <Link href="/login" className="text-blue-400 font-bold hover:underline">
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>

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
