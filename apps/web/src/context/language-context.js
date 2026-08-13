'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageProvider = LanguageProvider;
exports.useLanguage = useLanguage;
const react_1 = __importStar(require("react"));
const translations = {
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
    },
};
const LanguageContext = (0, react_1.createContext)(undefined);
function LanguageProvider({ children }) {
    const [lang, setLangState] = (0, react_1.useState)('ar');
    (0, react_1.useEffect)(() => {
        const saved = localStorage.getItem('lang');
        if (saved)
            setLangState(saved);
    }, []);
    const setLang = (newLang) => {
        setLangState(newLang);
        localStorage.setItem('lang', newLang);
    };
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const t = (key) => {
        return translations[lang]?.[key] || translations['en']?.[key] || key;
    };
    return (<LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      <div dir={dir} className={lang === 'ar' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>);
}
function useLanguage() {
    const context = (0, react_1.useContext)(LanguageContext);
    if (!context)
        throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
//# sourceMappingURL=language-context.js.map