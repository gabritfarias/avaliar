import React, { useState, useEffect } from 'react';
import { Model, GradeSettings, Evaluation } from './types';
import { fetchModels, fetchGradeSettings, fetchEvaluations } from './services/api';
import { Header } from './components/Header';
import { EvaluationForm } from './components/EvaluationForm';
import { AdminPricing } from './components/AdminPricing';
import { EvaluationHistory } from './components/EvaluationHistory';
import { UpdatePrompt } from './components/UpdatePrompt';
import { Smartphone, Database, RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'avaliacao' | 'historico' | 'admin'>('avaliacao');
  const [models, setModels] = useState<Model[]>([]);
  const [settings, setSettings] = useState<GradeSettings>({ discountB: 100, discountC: 200 });
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = async () => {
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
      setError(err.message || 'Erro ao conectar com o servidor local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Notificação de Nova Versão (PWA / Cache) */}
      <UpdatePrompt />

      {/* Navbar Superior */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        evaluationCount={evaluations.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Carregando catálogo de iPhones e configurações...
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
              />
            )}

            {activeTab === 'admin' && (
              <AdminPricing
                models={models}
                settings={settings}
                onRefreshData={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Rodapé Informativo */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>SQLite Persistente via Prisma ORM • 20 Modelos Ativos (iPhone 12 ao 16 Pro Max)</span>
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
