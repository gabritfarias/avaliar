import React from 'react';
import { Smartphone, History, Settings, ShieldCheck, HelpCircle, LogOut, Crown, Store } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  activeTab: 'avaliacao' | 'historico' | 'admin' | 'ajuda';
  setActiveTab: (tab: 'avaliacao' | 'historico' | 'admin' | 'ajuda') => void;
  evaluationCount?: number;
  user?: User | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  evaluationCount = 0,
  user,
  onLogout,
}) => {
  const isMaster = user?.role === 'MASTER';

  const handleLogoutClick = () => {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      onLogout?.();
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 pt-safe">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo e Informações da Loja */}
            <div className="flex items-center space-x-3 select-none">
              <div
                className="flex items-center space-x-2.5 cursor-pointer active:opacity-80"
                onClick={() => setActiveTab('avaliacao')}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shrink-0">
                  <Smartphone className="w-5 h-5 text-slate-950 font-bold" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white">iAvalia Pro</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 leading-none">Avaliação de iPhones</p>
                </div>
              </div>

              {/* Badge da Loja / Usuário Ativo */}
              {user && (
                <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-750">
                  {isMaster ? (
                    <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-500/30 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-purple-400" />
                      <span>{user.name}</span>
                      <span className="text-[10px] uppercase bg-purple-900/60 px-1 py-0.2 rounded font-black text-purple-200">
                        Master
                      </span>
                    </span>
                  ) : (
                    <span className="bg-emerald-500/15 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{user.name}</span>
                      <span className="text-[10px] uppercase bg-emerald-900/60 px-1 py-0.2 rounded font-black text-emerald-200">
                        Loja
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Navegação Desktop & Ações de Usuário */}
            <div className="flex items-center space-x-2">
              {/* Menu Desktop */}
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

                {/* Aba de Configurações: Apenas para Master */}
                {isMaster && (
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
                )}

                <button
                  onClick={() => setActiveTab('ajuda')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeTab === 'ajuda'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ajuda</span>
                </button>
              </nav>

              {/* Botão de Logout (Sair) */}
              {onLogout && (
                <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-800">
                  <button
                    onClick={handleLogoutClick}
                    title="Sair da Conta"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl border border-slate-800 hover:border-red-900/50 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar Fixa para Mobile (Estilo App Nativo iOS/Android) */}
      <nav
        aria-label="Navegação mobile"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-slate-900 backdrop-blur-md border-t border-slate-800 shadow-2xl"
      >
        <div className={`grid ${isMaster ? 'grid-cols-4' : 'grid-cols-3'} h-14`}>
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

          {/* Botão de Ajustes no Mobile (Apenas para Master) */}
          {isMaster && (
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
          )}

          <button
            onClick={() => setActiveTab('ajuda')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition-all cursor-pointer select-none active:scale-95 ${
              activeTab === 'ajuda'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight">Ajuda</span>
          </button>
        </div>
      </nav>
    </>
  );
};
