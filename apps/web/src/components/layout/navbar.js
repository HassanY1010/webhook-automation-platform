'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navbar = Navbar;
const react_1 = __importDefault(require("react"));
const auth_context_1 = require("@/context/auth-context");
const lucide_react_1 = require("lucide-react");
function Navbar() {
    const { user } = (0, auth_context_1.useAuth)();
    return (<header className="h-16 border-b border-dark-border bg-dark-card/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <lucide_react_1.Search className="w-4 h-4 absolute left-3 top-3 text-slate-500"/>
          <input type="text" placeholder="Search bots, events, executions..." className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"/>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
          <lucide_react_1.ShieldCheck className="w-3.5 h-3.5"/>
          <span>Tenant Isolated</span>
        </div>

        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 relative">
          <lucide_react_1.Bell className="w-4 h-4"/>
          <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-1.5 right-1.5 animate-pulse"/>
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-dark-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white">
            {user?.fullName?.[0] || 'U'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-slate-200">{user?.fullName || 'User'}</div>
            <div className="text-[10px] text-slate-400">{user?.email || 'admin@webhookplatform.io'}</div>
          </div>
        </div>
      </div>
    </header>);
}
//# sourceMappingURL=navbar.js.map