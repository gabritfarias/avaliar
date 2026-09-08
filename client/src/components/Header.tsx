import React from 'react';
import { Smartphone, History, Settings, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'avaliacao' | 'historico' | 'admin';
  setActiveTab: (tab: 'avaliacao' | 'historico' | 'admin') => void;
  evaluationCount?: number;
}



export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, evaluationCount = 0 }) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 pt-safe">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo e Nome */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer select-none active:opacity-80"
              onClick={() => setActiveTab('avaliacao')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shrink-0">
                <Smartphone className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">iAvalia Pro</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Balcão
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 leading-none">Avaliação de iPhones</p>
              </div>
            </div>

            {/* Navegação Desktop (escondida no mobile) */}
            <nav className="hidden md:flex items-center space-x-1.5">
              <button
                onClick={() => setActiveTab('avaliacao')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === 'avaliacao'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Nova Avaliação</span>
              </button>

              <button
                onClick={() => setActiveTab('historico')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === 'historico'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
                {evaluationCount > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'historico'
                        ? 'bg-slate-900 text-emerald-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {evaluationCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações & Preços</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar Fixa para Mobile (Estilo App Nativo iOS/Android) */}
      <nav
        aria-label="Navegação mobile"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/98 backdrop-blur-md border-t border-slate-800 shadow-2xl"
      >
        <div className="grid grid-cols-3 h-14">
          <button
            onClick={() => setActiveTab('avaliacao')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-all cursor-pointer select-none active:scale-95 ${
              activeTab === 'avaliacao'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Avaliar</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-all cursor-pointer select-none relative active:scale-95 ${
              activeTab === 'historico'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <History className="w-5 h-5 mb-0.5" />
              {evaluationCount > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {evaluationCount > 99 ? '99+' : evaluationCount}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight">Histórico</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-all cursor-pointer select-none active:scale-95 ${
              activeTab === 'admin'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Ajustes</span>
          </button>
        </div>
      </nav>
    </>
  );
};

