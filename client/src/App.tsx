import React, { useState, useEffect, useCallback } from 'react';
import { Model, GradeSettings, Evaluation, User } from './types';
import {
  fetchModels,
  fetchGradeSettings,
  fetchEvaluations,
  getStoredToken,
  getStoredUser,
  clearAuthSession,
} from './services/api';
import { Header } from './components/Header';
import { EvaluationForm } from './components/EvaluationForm';
import { AdminPricing } from './components/AdminPricing';
import { EvaluationHistory } from './components/EvaluationHistory';
import { HelpPage } from './components/HelpPage';
import { LoginPage } from './components/LoginPage';
import { UpdatePrompt } from './components/UpdatePrompt';
import { Database, RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [activeTab, setActiveTab] = useState<'avaliacao' | 'historico' | 'admin' | 'ajuda'>('avaliacao');
  const [models, setModels] = useState<Model[]>([]);
  const [settings, setSettings] = useState<GradeSettings>({ discountB: 100, discountC: 200 });
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    if (!getStoredToken()) return;

    try {
      setLoading(true);
      setError(null);
      const [modelsData, settingsData, evaluationsData] = await Promise.all([
        fetchModels(),
        fetchGradeSettings(),
        fetchEvaluations(),
      ]);
      setModels(modelsData);
      setSettings(settingsData);
      setEvaluations(evaluationsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Escuta deslogamento por token expirado
  useEffect(() => {
    const onUnauthorized = () => {
      setCurrentUser(null);
      setActiveTab('avaliacao');
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  // Carrega os dados assim que um usuário é autenticado
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, loadAllData]);

  // Se um usuário do perfil Loja tentar acessar a aba admin, redireciona para avaliação
  useEffect(() => {
    if (currentUser?.role === 'STORE' && activeTab === 'admin') {
      setActiveTab('avaliacao');
    }
  }, [currentUser, activeTab]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('avaliacao');
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setModels([]);
    setEvaluations([]);
    setActiveTab('avaliacao');
  };

  // Se não estiver logado, exibe a tela de Login
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Notificação de Nova Versão (PWA / Cache) */}
      <UpdatePrompt />

      {/* Navbar Superior */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        evaluationCount={evaluations.length}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60dvh]">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Carregando catálogo e configurações...
            </p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-900">Não foi possível conectar ao servidor</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'avaliacao' && (
              <EvaluationForm
                models={models}
                settings={settings}
                onEvaluationSaved={loadAllData}
              />
            )}

            {activeTab === 'historico' && (
              <EvaluationHistory
                evaluations={evaluations}
                onRefresh={loadAllData}
                user={currentUser}
              />
            )}

            {activeTab === 'admin' && currentUser.role === 'MASTER' && (
              <AdminPricing
                models={models}
                settings={settings}
                onRefreshData={loadAllData}
              />
            )}

            {activeTab === 'ajuda' && (
              <HelpPage />
            )}
          </>
        )}
      </main>

      {/* Rodapé Informativo */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              iAvalia Pro • Conectado como: <strong>{currentUser.name}</strong> ({currentUser.role === 'MASTER' ? 'Master' : 'Loja'})
            </span>
          </div>
          <div>
            <span>Descontos Vigentes: Grade B (- R$ {settings.discountB.toFixed(0)}) | Grade C (- R$ {settings.discountC.toFixed(0)})</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
