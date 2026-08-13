'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    bots: 'Automation Bots',
    executions: 'Execution Logs',
    sources: 'Sources & Webhooks',
    dlq: 'Dead Letter Queue',
    apiKeys: 'API Keys & Secrets',
    team: 'Team & Roles',
    billing: 'Billing & Plans',
    status: 'System Status',
    admin: 'Admin Panel',
    logout: 'Sign Out',
    totalBots: 'Total Bots',
    activeBots: 'Active Bots',
    eventsToday: 'Events Today',
    successRate: 'Success Rate',
    createBot: 'Create New Bot',
    visualRuleBuilder: 'Visual Rule Builder',
    saveBot: 'Save & Publish Bot',
    sendTestEvent: 'Send Test Event',
    dryRun: 'Dry Run Mode',
    searchPlaceholder: 'Search bots, events, executions...',
    tenantIsolated: 'Tenant Isolated',
    quickActions: 'Quick Actions',
    recentExecutions: 'Recent Execution History',
    systemOverview: 'System Performance Overview',
    viewLogs: 'View Full Logs',
    botName: 'Bot Name',
    description: 'Description',
    statusLabel: 'Status',
    mode: 'Mode',
    publicKey: 'Public Key',
    actionsCount: 'Actions Count',
    lastExecuted: 'Last Executed',
    actions: 'Actions',
    newBot: 'New Automation Bot',
    editBot: 'Edit Bot',
    deleteBot: 'Delete Bot',
    activate: 'Activate Bot',
    deactivate: 'Deactivate Bot',
    rollback: 'Rollback Version',
    botVersion: 'Version History',
    payloadSchema: 'Payload Schema',
    rulesEngine: 'Rules Engine',
    actionsConfig: 'Target Actions Config',
    executionId: 'Execution ID',
    bot: 'Bot',
    event: 'Event',
    duration: 'Duration (ms)',
    statusCode: 'Status Code',
    retry: 'Retry Execution',
    retryCount: 'Retry Count',
    payload: 'Payload Data',
    response: 'Upstream Response',
    timestamp: 'Timestamp',
    dlqTitle: 'Dead-Letter Queue Management',
    dlqSubtitle: 'Review and manually retry permanently failed worker jobs',
    retryFailedJob: 'Retry Selected Job',
    member: 'Team Member',
    role: 'Assigned Role',
    owner: 'Owner',
    editor: 'Editor',
    operator: 'Operator',
    viewer: 'Viewer',
    inviteMember: 'Invite New Member',
    changeRole: 'Change Role',
    removeMember: 'Remove Member',
    keyName: 'Key Name',
    created: 'Created Date',
    lastUsed: 'Last Used',
    generateKey: 'Generate New API Key',
    revokeKey: 'Revoke Key',
    secretWarning: 'Copy your API key now. It will not be shown again.',
    currentPlan: 'Current Subscription Plan',
    upgrade: 'Upgrade Subscription',
    monthlyUsage: 'Monthly Webhook Usage',
    activeSubscription: 'Active Subscription',
    free: 'Free Plan',
    starter: 'Starter Plan',
    pro: 'Pro Plan',
    enterprise: 'Enterprise Contract',
    apiService: 'API Gateway Service',
    workerEngine: 'Worker Execution Engine',
    databaseCluster: 'PostgreSQL Database',
    redisQueue: 'Redis Job Queue',
    operational: 'Operational (200 OK)',
    degraded: 'Degraded Performance',
    outage: 'Service Outage',
    loginTitle: 'Sign In to Your Workspace',
    loginSubtitle: 'Manage your automated webhooks, bots, and executions',
    email: 'Email Address',
    password: 'Password',
    loginButton: 'Sign In to Dashboard',
    registerTitle: 'Create Enterprise SaaS Account',
    registerSubtitle: 'Start building automated webhook pipelines in seconds',
    fullName: 'Full Name',
    orgName: 'Organization Name',
    registerButton: 'Create Free Account',
    noAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    bots: 'أتمتة البوتات',
    executions: 'سجلات التنفيذ',
    sources: 'المصادر والـ Webhooks',
    dlq: 'قائمة المهام الفاشلة (DLQ)',
    apiKeys: 'مفاتيح API والأسرار',
    team: 'الفريق والصلاحيات',
    billing: 'الاشتراكات والخطة',
    status: 'حالة النظام',
    admin: 'لوحة الإدارة',
    logout: 'تسجيل الخروج',
    totalBots: 'إجمالي البوتات',
    activeBots: 'البوتات النشطة',
    eventsToday: 'أحداث اليوم',
    successRate: 'نسبة النجاح',
    createBot: 'إنشاء بوت جديد',
    visualRuleBuilder: 'باني القواعد المرئي',
    saveBot: 'حفظ ونشر البوت',
    sendTestEvent: 'إرسال حدث تجريبي',
    dryRun: 'وضع التجربة الخالي من المخاطر',
    searchPlaceholder: 'البحث عن البوتات، الأحداث، والتنفيذات...',
    tenantIsolated: 'مستأجر معزول بأمان',
    quickActions: 'إجراءات سريعة',
    recentExecutions: 'سجل التنفيذات الأخير',
    systemOverview: 'نظرة عامة على أداء المنظومة',
    viewLogs: 'عرض السجلات الكاملة',
    botName: 'اسم البوت',
    description: 'الوصف',
    statusLabel: 'الحالة',
    mode: 'النمط',
    publicKey: 'المفتاح العام (Public Key)',
    actionsCount: 'عدد الإجراءات',
    lastExecuted: 'آخر تنفيذ',
    actions: 'الإجراءات',
    newBot: 'بوت أتمتة جديد',
    editBot: 'تعديل البوت',
    deleteBot: 'حذف البوت',
    activate: 'تفعيل البوت',
    deactivate: 'إيقاف البوت',
    rollback: 'استرجاع الإصدار السابق',
    botVersion: 'سجل الإصدارات',
    payloadSchema: 'مخطط البيانات (Payload Schema)',
    rulesEngine: 'محرك القواعد (AST Rules)',
    actionsConfig: 'إعدادات الإجراءات المستهدفة',
    executionId: 'رقم المعاملة (Execution ID)',
    bot: 'البوت',
    event: 'الحدث',
    duration: 'المدة (مللي ثانية)',
    statusCode: 'كود الاستجابة',
    retry: 'إعادة المحاولة',
    retryCount: 'عدد المحاولات',
    payload: 'بيانات الطلب (Payload)',
    response: 'استجابة السيرفر الخارجي',
    timestamp: 'التاريخ والوقت',
    dlqTitle: 'إدارة طابور المهام الفاشلة (DLQ)',
    dlqSubtitle: 'مراجعة وإعادة تنفيذ المهام الفاشلة بصفة دائمة',
    retryFailedJob: 'إعادة تنفيذ المهمة المحددة',
    member: 'عضو الفريق',
    role: 'الصلاحية الممنوحة',
    owner: 'المالك الفائق (Owner)',
    editor: 'محرر (Editor)',
    operator: 'مشغل (Operator)',
    viewer: 'مشاهد (Viewer)',
    inviteMember: 'دعوة عضو جديد',
    changeRole: 'تعديل الصلاحية',
    removeMember: 'إزالة العضو',
    keyName: 'اسم المفتاح',
    created: 'تاريخ الإنشاء',
    lastUsed: 'آخر استخدام',
    generateKey: 'توليد مفتاح API جديد',
    revokeKey: 'إلغاء المفتاح',
    secretWarning: 'احفظ مفتاح الـ API الآن، لن يتم إظهاره مرة أخرى.',
    currentPlan: 'خطة الاشتراك الحالية',
    upgrade: 'ترقية الاشتراك',
    monthlyUsage: 'الاستهلاك الشهري للـ Webhooks',
    activeSubscription: 'اشتراك نشط',
    free: 'الخطة المجانية',
    starter: 'خطة المبتدئين (Starter)',
    pro: 'الخطة الاحترافية (Pro)',
    enterprise: 'عقد الشركات (Enterprise)',
    apiService: 'خدمة الـ API Gateway',
    workerEngine: 'محرك المعالجة (Worker Engine)',
    databaseCluster: 'قاعدة بيانات PostgreSQL',
    redisQueue: 'طوابير Redis',
    operational: 'يعمل بكفاءة (200 OK)',
    degraded: 'أداء منخفض',
    outage: 'توقف الخدمة',
    loginTitle: 'تسجيل الدخول لمنظومتك',
    loginSubtitle: 'إدارة الـ Webhooks والبوتات والتنفيذات الآلية',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginButton: 'الدخول للوحة التحكم',
    registerTitle: 'إنشاء حساب جديد للمؤسسات',
    registerSubtitle: 'ابدأ بناء مسارات الـ Webhook الآلية خلال ثوانٍ',
    fullName: 'الاسم الكامل',
    orgName: 'اسم الشركة / المنظمة',
    registerButton: 'إنشاء حساب مجاني',
    noAccount: 'ليس لديك حساب بعد؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved) setLangState(saved);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      <div dir={dir} className={lang === 'ar' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
