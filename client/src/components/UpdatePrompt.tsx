import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { onServiceWorkerUpdate, skipWaitingAndReload } from '../registerSW';

export function UpdatePrompt() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = onServiceWorkerUpdate((reg) => {
      setRegistration(reg);
      setHasUpdate(true);
      setDismissed(false);
    });

    return () => unsubscribe();
  }, []);

  if (!hasUpdate || dismissed) {
    return null;
  }

  const handleUpdate = () => {
    skipWaitingAndReload(registration);
  };

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-emerald-500/40 p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              Nova versão disponível
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            </h4>
            <p className="text-[11px] text-slate-300 truncate">
              Toque para recarregar as melhorias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleUpdate}
            type="button"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-md min-h-[44px]"
            title="Recarregar aplicação"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl active:scale-90 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
