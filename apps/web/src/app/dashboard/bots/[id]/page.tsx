'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Bot, Terminal, Copy, Check, RotateCcw, ShieldCheck, Activity } from 'lucide-react';

export default function BotDetailPage() {
  const params = useParams();
  const botId = params.id as string;
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBotDetails();
  }, [botId]);

  const fetchBotDetails = async () => {
    setLoading(true);
    const res = await apiRequest(`/bots/${botId}`);
    setLoading(false);
    if (res.success && res.data) {
      setBot(res.data);
    }
  };

  const copyUrl = () => {
    if (!bot) return;
    navigator.clipboard.writeText(`http://localhost:4000/webhooks/${bot.publicKey}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rollback = async (versionNumber: number) => {
    await apiRequest(`/bots/${botId}/rollback/${versionNumber}`, { method: 'POST' });
    fetchBotDetails();
  };

  if (loading) return <div className="text-center py-12 text-xs text-slate-500">Loading bot details...</div>;
  if (!bot) return <div className="text-center py-12 text-xs text-slate-500">Bot not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">{bot.name}</h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
              v{bot.version} ({bot.status})
            </span>
          </div>
          <p className="text-xs text-slate-400">{bot.description || 'No description'}</p>
        </div>
      </div>

      {/* Endpoint Bar */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500">Webhook Target Endpoint</div>
          <div className="text-xs font-mono text-blue-400 mt-0.5">http://localhost:4000/webhooks/{bot.publicKey}</div>
        </div>
        <button
          onClick={copyUrl}
          className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy Endpoint'}
        </button>
      </div>

      {/* Rules & Actions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-2">
          <h3 className="font-bold text-xs text-slate-300">AST Rule Set</h3>
          <pre className="bg-dark-bg p-3 rounded-lg text-[11px] text-slate-300 font-mono overflow-x-auto">
            {JSON.stringify(bot.rules, null, 2)}
          </pre>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-2">
          <h3 className="font-bold text-xs text-slate-300">Configured Actions</h3>
          <pre className="bg-dark-bg p-3 rounded-lg text-[11px] text-slate-300 font-mono overflow-x-auto">
            {JSON.stringify(bot.actions, null, 2)}
          </pre>
        </div>
      </div>

      {/* Version History & Rollback */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-xs text-slate-300">Version History</h3>
        <div className="space-y-2">
          {bot.versions?.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
              <div>
                <span className="text-xs font-bold text-slate-200">Version {v.versionNumber}</span>
                <span className="text-[10px] text-slate-500 ml-2">Published: {new Date(v.publishedAt).toLocaleString()}</span>
              </div>

              {v.versionNumber !== bot.version && (
                <button
                  onClick={() => rollback(v.versionNumber)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rollback to v{v.versionNumber}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
