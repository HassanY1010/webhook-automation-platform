'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { UserPlus, Shield, Trash2, Mail, User, Check, X, ShieldCheck } from 'lucide-react';

export default function TeamPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('ADMIN');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [members, setMembers] = useState([
    { id: '1', name: isRtl ? 'مالك المنظومة الفائق' : 'System Owner', email: 'admin@webhookplatform.io', role: 'OWNER', status: 'ACTIVE' },
    { id: '2', name: isRtl ? 'مهندس النظام' : 'Hassan Engineer', email: 'hassan@company.com', role: 'ADMIN', status: 'ACTIVE' },
    { id: '3', name: isRtl ? 'مشغل العمليات' : 'Operator User', email: 'op@company.com', role: 'OPERATOR', status: 'ACTIVE' },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const newObj = {
      id: `member_${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      status: 'INVITED',
    };

    setMembers([...members, newObj]);
    setShowInviteModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
    setSuccessMsg(isRtl ? `تم إرسال دعوة الانضمام إلى ${newMemberEmail} بنجاح!` : `Invitation sent to ${newMemberEmail}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t('team')}</h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'إدارة أعضاء المؤسسة، التحكم بالصلاحيات والأدوار (OWNER, ADMIN, EDITOR, OPERATOR, VIEWER)'
              : 'Manage organization members and role-based permissions (OWNER, ADMIN, EDITOR, OPERATOR, VIEWER)'}
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-blue-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          {t('inviteMember')}
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>{isRtl ? 'دعوة عضو جديد للمؤسسة' : 'Invite New Team Member'}</span>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                <div className="relative">
                  <User className={`w-4 h-4 text-slate-500 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className={`w-full bg-dark-bg border border-dark-border rounded-xl ${
                      isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                    } py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500`}
                    placeholder={isRtl ? 'سارة المهندس' : 'Sarah Smith'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{isRtl ? 'البريد الإلكتروني' : 'Work Email'}</label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-500 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className={`w-full bg-dark-bg border border-dark-border rounded-xl ${
                      isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                    } py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono`}
                    placeholder="sarah@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{isRtl ? 'الدور والصلاحيات (RBAC Role)' : 'RBAC Role'}</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="ADMIN">{isRtl ? 'ADMIN - مدير النظام (إدارة البوتات والإعدادات)' : 'ADMIN - Full Bot & Config Access'}</option>
                  <option value="EDITOR">{isRtl ? 'EDITOR - محرر (إنشاء تعديل البوتات)' : 'EDITOR - Bot Creation & Edit'}</option>
                  <option value="OPERATOR">{isRtl ? 'OPERATOR - مشغل (مراقبة وإعادة تشغيل السجلات)' : 'OPERATOR - Audit & Log Retries'}</option>
                  <option value="VIEWER">{isRtl ? 'VIEWER - مشاهد (عرض فقط)' : 'VIEWER - Read Only Access'}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all"
                >
                  {isRtl ? 'إرسال دعوة الانضمام' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Hierarchy Badges Explanation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { role: 'OWNER', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', label: isRtl ? 'المالك الفائق' : 'Full Owner' },
          { role: 'ADMIN', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', label: isRtl ? 'مدير كامل' : 'Full Admin' },
          { role: 'EDITOR', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', label: isRtl ? 'محرر بوتات' : 'Bot Editor' },
          { role: 'OPERATOR', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', label: isRtl ? 'مشغل السجلات' : 'Ops Auditor' },
          { role: 'VIEWER', color: 'text-slate-400 border-slate-700 bg-slate-800', label: isRtl ? 'قراءة فقط' : 'Read Only' },
        ].map((r) => (
          <div key={r.role} className={`p-3 rounded-xl border ${r.color} text-center space-y-1`}>
            <div className="font-bold text-xs font-mono">{r.role}</div>
            <div className="text-[10px] opacity-80 font-sans">{r.label}</div>
          </div>
        ))}
      </div>

      {/* Members List */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">
          {isRtl ? 'أعضاء الفريق والمنظومة الحاليين' : 'Current Organization Team Members'}
        </h3>

        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {m.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-100">{m.name}</span>
                    {m.status === 'INVITED' && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        {isRtl ? 'دعوة معلقة' : 'INVITED'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{m.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-bold font-mono">
                  {m.role}
                </span>

                {m.role !== 'OWNER' && (
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
