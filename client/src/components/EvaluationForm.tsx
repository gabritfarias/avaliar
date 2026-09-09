import React, { useState, useEffect, useMemo } from 'react';
import { Model, Variant, CalculationBreakdown, GradeSettings, Evaluation, ReplacedComponentDetail } from '../types';
import { calculateEvaluation, saveEvaluation } from '../services/api';
import { CalculationSummary } from './CalculationSummary';
import { ReceiptModal } from './ReceiptModal';
import {
  Smartphone,
  HardDrive,
  AlertTriangle,
  Award,
  Wrench,
  User,
  FileText,
  Lock,
  Check,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';

const AVAILABLE_COMPONENTS = [
  { id: 'Bateria', label: 'Bateria', icon: '🔋' },
  { id: 'Tela', label: 'Tela', icon: '📱' },
  { id: 'Câmera', label: 'Câmera', icon: '📷' },
];

interface EvaluationFormProps {
  models: Model[];
  settings: GradeSettings;
  onEvaluationSaved: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  models,
  settings,
  onEvaluationSaved,
}) => {
  // Selection states
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [hasReplacedPart, setHasReplacedPart] = useState<boolean>(false);
  const [replacedDetails, setReplacedDetails] = useState<ReplacedComponentDetail[]>([]);
  const [grade, setGrade] = useState<'A' | 'B' | 'C'>('A');
  const [selectedPartIds, setSelectedPartIds] = useState<number[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Calculation & saving states
  const [calculation, setCalculation] = useState<CalculationBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedEvaluation, setSavedEvaluation] = useState<Evaluation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Model search / filter
  const [searchModel, setSearchModel] = useState<string>('');

  // Selected Model object
  const selectedModel = useMemo(() => {
    return models.find((m) => m.id === selectedModelId) || null;
  }, [models, selectedModelId]);

  // Selected Variant object
  const selectedVariant = useMemo(() => {
    if (!selectedModel || !selectedVariantId) return null;
    return selectedModel.variants.find((v) => v.id === selectedVariantId) || null;
  }, [selectedModel, selectedVariantId]);

  // Dynamic categories/series based on actual models in the catalog
  const dynamicSeries = useMemo(() => {
    const list: Array<{ id: string; label: string }> = [{ id: 'all', label: 'Todos' }];
    const foundNumbers = new Set<string>();

    models.forEach((m) => {
      const matches = m.name.match(/\b\d+\b/g);
      if (matches) {
        matches.forEach((num) => foundNumbers.add(num));
      }
    });

    const sortedNumbers = Array.from(foundNumbers).sort((a, b) => Number(a) - Number(b));
    sortedNumbers.forEach((num) => {
      list.push({ id: num, label: `Linha ${num}` });
    });

    return list;
  }, [models]);

  // Filter models by series and search text
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(searchModel.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedSeries === 'all') return true;
      return m.name.toLowerCase().includes(selectedSeries.toLowerCase());
    });
  }, [models, selectedSeries, searchModel]);

  // Initial and reactive selection: keep selection valid when models are added or deleted
  useEffect(() => {
    if (models.length > 0) {
      const modelStillExists = models.some((m) => m.id === selectedModelId);
      if (!selectedModelId || !modelStillExists) {
        const defaultModel = models[0];
        setSelectedModelId(defaultModel.id);
        if (defaultModel.variants.length > 0) {
          setSelectedVariantId(defaultModel.variants[0].id);
        } else {
          setSelectedVariantId(null);
        }
      }
    } else {
      setSelectedModelId(null);
      setSelectedVariantId(null);
    }
  }, [models, selectedModelId]);

  // When model changes, automatically select its first variant and reset parts
  const handleModelSelect = (model: Model) => {
    setSelectedModelId(model.id);
    setSelectedPartIds([]);
    if (model.variants.length > 0) {
      setSelectedVariantId(model.variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
  };

  const unknownPartsCount = useMemo(() => {
    if (!hasReplacedPart) return 0;
    return replacedDetails.filter((d) => d.status === 'UNKNOWN').length;
  }, [hasReplacedPart, replacedDetails]);

  const hasUnknownPart = unknownPartsCount > 0;

  // Sync grade locking: unknown parts force Grade C
  useEffect(() => {
    if (hasUnknownPart) {
      setGrade('C');
    } else if (hasReplacedPart && grade === 'A') {
      setGrade('B');
    }
  }, [hasUnknownPart, hasReplacedPart]);

  // When replaced part flag changes:
  const handleReplacedPartToggle = (checked: boolean) => {
    setHasReplacedPart(checked);
    if (checked) {
      if (grade === 'A') {
        setGrade('B');
      }
    } else {
      setReplacedDetails([]);
      setGrade('A');
    }
  };

  const handleToggleComponent = (compName: string) => {
    setReplacedDetails((prev) => {
      const exists = prev.find((d) => d.name === compName);
      if (exists) {
        return prev.filter((d) => d.name !== compName);
      } else {
        return [...prev, { name: compName, status: 'GENUINE' }];
      }
    });
  };

  const handleSetComponentStatus = (compName: string, status: 'GENUINE' | 'UNKNOWN') => {
    setReplacedDetails((prev) =>
      prev.map((d) => (d.name === compName ? { ...d, status } : d))
    );
  };

  // Toggle parts checklist
  const handlePartToggle = (partId: number) => {
    setSelectedPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    if (!selectedVariantId) {
      setCalculation(null);
      return;
    }

    let isMounted = true;
    setIsCalculating(true);

    calculateEvaluation({
      variantId: selectedVariantId,
      grade,
      hasReplacedPart,
      replacedDetails,
      partIds: selectedPartIds,
    })
      .then((data) => {
        if (isMounted) {
          setCalculation(data);
          setIsCalculating(false);
        }
      })
      .catch((err) => {
        console.error('Calculation error:', err);
        if (isMounted) setIsCalculating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedVariantId, grade, hasReplacedPart, replacedDetails, selectedPartIds]);

  // Save evaluation to database
  const handleSaveEvaluation = async () => {
    if (!selectedVariantId) return;

    try {
      setIsSaving(true);
      const res = await saveEvaluation({
        variantId: selectedVariantId,
        grade,
        hasReplacedPart,
        replacedDetails,
        partIds: selectedPartIds,
        customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSavedEvaluation(res.evaluation);
      setToastMessage('Avaliação gravada com sucesso no banco de dados!');
      onEvaluationSaved();

      // Clear customer form fields
      setCustomerName('');
      setNotes('');
      setSelectedPartIds([]);
      setHasReplacedPart(false);
      setReplacedDetails([]);
      setGrade('A');
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar avaliação');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div
      style={{ paddingBottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' }}
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:pb-12"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-auto sm:bottom-20 right-3 left-3 sm:left-auto sm:right-5 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-white">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Recibo Modal pós-gravação */}
      <ReceiptModal evaluation={savedEvaluation} onClose={() => setSavedEvaluation(null)} />

      {/* Main Grid Layout: Form on Left, Sticky Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form Steps (8 cols on desktop, full width on mobile) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Passo 1: Seleção de Modelo */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    1
                  </span>
                  Modelo do iPhone
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  {models.length} {models.length === 1 ? 'modelo disponível' : 'modelos disponíveis'} no catálogo
                </p>
              </div>

              {/* Filtro por Família (Pills horizontais com rolagem suave e min 44px) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                {dynamicSeries.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeries(s.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                      selectedSeries === s.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown nativo no mobile para seleção instantânea se preferir */}
            <div className="block sm:hidden mb-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Seletor Rápido
              </label>
              <select
                value={selectedModelId || ''}
                onChange={(e) => {
                  const m = models.find((mod) => mod.id === Number(e.target.value));
                  if (m) handleModelSelect(m);
                }}
                className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              >
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.variants.length} capacidades)
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                placeholder="Buscar modelo (ex: 15 Pro, 13 mini)..."
                className="w-full min-h-[44px] pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              {searchModel && (
                <button
                  onClick={() => setSearchModel('')}
                  className="w-8 h-8 absolute right-1 top-1.5 flex items-center justify-center text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Grid de Modelos Touch Friendly */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 max-h-56 overflow-y-auto p-0.5">
              {filteredModels.map((model) => {
                const isSelected = model.id === selectedModelId;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`min-h-[56px] p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] select-none ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/50'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 active:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs sm:text-sm leading-tight">{model.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 block font-medium ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {model.variants.length} opções
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Passo 2: Seleção de Capacidade */}
          {selectedModel && (
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 animate-in fade-in duration-150">
              <div className="mb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    2
                  </span>
                  Capacidade de Armazenamento
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Preços base calculados para {selectedModel.name}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {selectedModel.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`min-h-[56px] p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center active:scale-[0.98] select-none ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 active:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <HardDrive
                          className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}
                        />
                        <span className="font-extrabold text-sm sm:text-base">{v.capacity}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        Base: {formatCurrency(v.priceGradeA)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Passo 3: Verificação de Peça Substituída */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    3
                  </span>
                  Peça Substituída
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Verifique se há aviso em "Ajustes &gt; Geral &gt; Sobre" no iPhone
                </p>
              </div>

              {hasReplacedPart && (
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                  hasUnknownPart
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {hasUnknownPart ? `Peça Desconhecida (${unknownPartsCount})` : 'Genuína Apple'}
                </span>
              )}
            </div>

            {/* Checkbox em Destaque Touch Friendly */}
            <label
              className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer select-none active:scale-[0.99] min-h-[56px] ${
                hasReplacedPart
                  ? hasUnknownPart
                    ? 'border-red-400 bg-red-50/50 shadow-xs'
                    : 'border-amber-500 bg-amber-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={hasReplacedPart}
                onChange={(e) => handleReplacedPartToggle(e.target.checked)}
                className="mt-0.5 w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">
                  Aparelho possui peça substituída
                </span>
                <span className="text-[11px] sm:text-xs text-slate-600 mt-1 block leading-relaxed">
                  Permite classificar como <strong>Genuína Apple</strong> (Grade B ou C) ou <strong>Desconhecida</strong> (trava Grade C com penalidade).
                </span>
              </div>
            </label>

            {/* Seletor Dinâmico de Peças e Status (Genuína vs Desconhecida) */}
            {hasReplacedPart && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Qual peça foi substituída e qual o status?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {AVAILABLE_COMPONENTS.map((comp) => {
                    const detail = replacedDetails.find((d) => d.name === comp.id);
                    const isSelected = !!detail;
                    return (
                      <div
                        key={comp.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? detail.status === 'UNKNOWN'
                              ? 'border-red-400 bg-red-50/60 shadow-xs ring-1 ring-red-400/30'
                              : 'border-emerald-400 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-400/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleComponent(comp.id)}
                          className="w-full flex items-center justify-between text-left cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{comp.icon}</span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {comp.label}
                            </span>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? detail.status === 'UNKNOWN'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-emerald-600 text-white'
                                : 'border border-slate-300 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </button>

                        {/* Seletor do status da peça (Genuína vs Desconhecida) */}
                        {isSelected && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Classificação:
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSetComponentStatus(comp.id, 'GENUINE')}
                                className={`min-h-[34px] px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95 ${
                                  detail.status === 'GENUINE'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                Genuína Apple
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSetComponentStatus(comp.id, 'UNKNOWN')}
                                className={`min-h-[34px] px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95 ${
                                  detail.status === 'UNKNOWN'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-red-50'
                                }`}
                              >
                                Desconhecida
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Banner informativo se houver peça desconhecida */}
                {hasUnknownPart && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        {unknownPartsCount === 1 ? '1 peça desconhecida' : `${unknownPartsCount} peças desconhecidas`} selecionada(s):
                      </p>
                      <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                        • Grade C aplicada automaticamente.<br />
                        • Penalidade de <strong>{unknownPartsCount === 1 ? 'R$ 200,00' : 'R$ 300,00'}</strong> deduzida nos valores de compra e venda.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Passo 4: Grade de Conservação */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    4
                  </span>
                  Grade de Conservação
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Estado estético e integridade do aparelho
                </p>
              </div>

              {hasUnknownPart ? (
                <span className="text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-md">
                  Travado em Grade C (Peça Desconhecida)
                </span>
              ) : hasReplacedPart ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                  Escolha manual: Grade B ou C (Genuína Apple)
                </span>
              ) : null}
            </div>

            {/* Cards de Seleção de Grade Touch-friendly */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Grade A */}
              <button
                type="button"
                disabled={hasReplacedPart}
                onClick={() => setGrade('A')}
                className={`min-h-[64px] p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between select-none ${
                  hasReplacedPart
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
                    : grade === 'A'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/30 shadow-xs active:scale-[0.98]'
                    : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer active:bg-slate-50 active:scale-[0.98]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm sm:text-base text-slate-900">Grade A</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Preço Cheio
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Sem marcas relevantes e bateria saudável (&gt; 85%).
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700">
                  {hasReplacedPart ? 'Indisponível (peça substituída)' : 'Sem desconto (Valor Base)'}
                </div>
              </button>

              {/* Grade B */}
              <button
                type="button"
                disabled={hasUnknownPart}
                onClick={() => setGrade('B')}
                className={`min-h-[64px] p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between select-none ${
                  hasUnknownPart
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
                    : grade === 'B'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/30 shadow-xs cursor-pointer active:scale-[0.98]'
                    : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer active:bg-slate-50 active:scale-[0.98]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm sm:text-base text-slate-900">Grade B</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      - R$ {settings.discountB.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Marcas de uso leves, bateria &le; 85% ou peça genuína.
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] font-bold text-blue-700">
                  {hasUnknownPart ? 'Indisponível (peça desconhecida)' : `Desconto: - ${formatCurrency(settings.discountB)}`}
                </div>
              </button>

              {/* Grade C */}
              <button
                type="button"
                onClick={() => setGrade('C')}
                className={`min-h-[64px] p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between active:scale-[0.98] cursor-pointer select-none ${
                  grade === 'C'
                    ? hasUnknownPart
                      ? 'border-red-500 bg-red-50/70 ring-2 ring-red-500/30 shadow-xs'
                      : 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white active:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm sm:text-base text-slate-900">Grade C</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hasUnknownPart
                        ? 'bg-red-100 text-red-900 border border-red-300'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      - R$ {settings.discountC.toFixed(0)}
                      {hasUnknownPart && ` + R$ ${unknownPartsCount >= 2 ? '300' : '200'}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {hasUnknownPart
                      ? 'Travamento obrigatório devido a peça desconhecida.'
                      : 'Muitas marcas, desgastes acentuados ou peça substituída.'}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] font-bold text-amber-800">
                  Desconto Grade: - {formatCurrency(settings.discountC)}
                  {hasUnknownPart && (
                    <span className="text-red-700 block text-[10px]">
                      + Penalidade Desconhecida: - {formatCurrency(unknownPartsCount >= 2 ? 300 : 200)}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </section>

          {/* Passo 5: Abatimento por Troca de Peças */}
          {selectedModel && (
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">
                      5
                    </span>
                    Peças a Substituir
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Marque peças que a loja precisará reparar
                  </p>
                </div>

                {selectedPartIds.length > 0 && (
                  <button
                    onClick={() => setSelectedPartIds([])}
                    className="min-h-[36px] px-2 text-xs text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer"
                  >
                    Desmarcar
                  </button>
                )}
              </div>

              {selectedModel.parts.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma peça cadastrada para este modelo.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedModel.parts.map((part) => {
                    const isChecked = selectedPartIds.includes(part.id);
                    return (
                      <label
                        key={part.id}
                        className={`min-h-[50px] flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                          isChecked
                            ? 'border-red-400 bg-red-50/60 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white active:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePartToggle(part.id)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-slate-800">
                            {part.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isChecked ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          - {formatCurrency(part.cost)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Passo 6: Dados Opcionais do Cliente */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">
                6
              </span>
              Dados do Atendimento (Opcional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Nome do Cliente
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Observações do Balcão
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Aparelho impecável com caixa"
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Real-time Calculation Summary (4 cols desktop, bottom bar on mobile) */}
        <div className="lg:col-span-4">
          <CalculationSummary
            calculation={calculation}
            loading={isCalculating}
            onSave={handleSaveEvaluation}
            isSaving={isSaving}
            canSave={Boolean(selectedVariantId && calculation)}
          />
        </div>
      </div>
    </div>
  );
};

