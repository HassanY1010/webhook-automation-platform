'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const language_context_1 = require("@/context/language-context");
const auth_context_1 = require("@/context/auth-context");
const lucide_react_1 = require("lucide-react");
function Sidebar() {
    const pathname = (0, navigation_1.usePathname)();
    const { t, lang, setLang } = (0, language_context_1.useLanguage)();
    const { logout } = (0, auth_context_1.useAuth)();
    const menuItems = [
        { href: '/dashboard', label: t('dashboard'), icon: lucide_react_1.LayoutDashboard },
        { href: '/dashboard/bots', label: t('bots'), icon: lucide_react_1.Bot },
        { href: '/dashboard/executions', label: t('executions'), icon: lucide_react_1.Terminal },
        { href: '/dashboard/sources', label: t('sources'), icon: lucide_react_1.Webhook },
        { href: '/dashboard/dlq', label: t('dlq'), icon: lucide_react_1.AlertOctagon },
        { href: '/dashboard/api-keys', label: t('apiKeys'), icon: lucide_react_1.Key },
        { href: '/dashboard/team', label: t('team'), icon: lucide_react_1.Users },
        { href: '/dashboard/billing', label: t('billing'), icon: lucide_react_1.CreditCard },
        { href: '/dashboard/status', label: t('status'), icon: lucide_react_1.Activity },
        { href: '/dashboard/admin', label: t('admin'), icon: lucide_react_1.Shield },
    ];
    return (<aside className="w-64 border-r border-dark-border bg-dark-card flex flex-col justify-between min-h-screen p-4">
      <div>
        <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-dark-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            W
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wide">Webhook Automation</h1>
            <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Enterprise SaaS</span>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (<link_1.default key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`}/>
                {item.label}
              </link_1.default>);
        })}
        </nav>
      </div>

      <div className="space-y-3 pt-4 border-t border-dark-border">
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2">
            <lucide_react_1.Globe className="w-4 h-4 text-slate-400"/>
            <span>Language</span>
          </div>
          <span className="font-bold text-blue-400 uppercase">{lang === 'ar' ? 'العربية' : 'English'}</span>
        </button>

        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all">
          <lucide_react_1.LogOut className="w-4 h-4"/>
          {t('logout')}
        </button>
      </div>
    </aside>);
}
//# sourceMappingURL=sidebar.js.map