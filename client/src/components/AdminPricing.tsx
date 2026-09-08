import React, { useState } from 'react';
import { Model, GradeSettings } from '../types';
import {
  updateGradeSettings,
  updateVariantPrice,
  addVariant,
  deleteVariant,
  addPart,
  updatePart,
  deletePart,
} from '../services/api';
import {
  Sliders,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  HardDrive,
  Wrench,
  AlertCircle,
  Smartphone,
} from 'lucide-react';

interface AdminPricingProps {
  models: Model[];
  settings: GradeSettings;
  onRefreshData: () => void;
}

export const AdminPricing: React.FC<AdminPricingProps> = ({
  models,
  settings,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'precos' | 'grades' | 'pecas'>('precos');

  // Feedback notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Grade Settings State
  const [discountB, setDiscountB] = useState<number>(settings.discountB);
  const [discountC, setDiscountC] = useState<number>(settings.discountC);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  const handleSaveGradeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await updateGradeSettings({ discountB, discountC });
      showToast('Descontos de Grade salvos com sucesso!');
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar descontos', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // 2. Variant Price Editing State
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [savingVariant, setSavingVariant] = useState<boolean>(false);

  // New Variant Modal/Form State
  const [newVariantModelId, setNewVariantModelId] = useState<number>(models[0]?.id || 1);
  const [newCapacity, setNewCapacity] = useState<string>('128GB');
  const [newPriceGradeA, setNewPriceGradeA] = useState<number>(1000);
  const [isAddingVariant, setIsAddingVariant] = useState<boolean>(false);

  const handleStartEditPrice = (variantId: number, currentPrice: number) => {
    setEditingVariantId(variantId);
    setEditingPrice(currentPrice);
  };

  const handleSavePrice = async (variantId: number) => {
    try {
      setSavingVariant(true);
      await updateVariantPrice(variantId, editingPrice);
      showToast('Preço da Grade A atualizado com sucesso!');
      setEditingVariantId(null);
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar preço', 'error');
    } finally {
      setSavingVariant(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingVariant(true);
      await addVariant(newVariantModelId, newCapacity, newPriceGradeA);
      showToast(`Capacidade ${newCapacity} adicionada com sucesso!`);
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao adicionar capacidade', 'error');
    } finally {
      setIsAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: number, capacity: string) => {
    if (!window.confirm(`Tem certeza que deseja remover a capacidade ${capacity}?`)) return;
    try {
      await deleteVariant(variantId);
      showToast('Capacidade removida com sucesso!');
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao remover capacidade', 'error');
    }
  };

  // 3. Parts Management State
  const [selectedPartsModelId, setSelectedPartsModelId] = useState<number>(models[0]?.id || 1);
  const [editingPartId, setEditingPartId] = useState<number | null>(null);
  const [editingPartCost, setEditingPartCost] = useState<number>(0);
  const [newPartName, setNewPartName] = useState<string>('');
  const [newPartCost, setNewPartCost] = useState<number>(300);
  const [isAddingPart, setIsAddingPart] = useState<boolean>(false);

  const selectedPartsModel = models.find((m) => m.id === selectedPartsModelId) || models[0];

  const handleSavePartCost = async (partId: number) => {
    try {
      await updatePart(partId, { cost: editingPartCost });
      showToast('Custo da peça atualizado com sucesso!');
      setEditingPartId(null);
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar custo da peça', 'error');
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) {
      showToast('Nome da peça é obrigatório', 'error');
      return;
    }
    try {
      setIsAddingPart(true);
      await addPart(selectedPartsModelId, newPartName.trim(), newPartCost);
      showToast('Nova peça cadastrada com sucesso!');
      setNewPartName('');
      setNewPartCost(300);
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao cadastrar peça', 'error');
    } finally {
      setIsAddingPart(false);
    }
  };

  const handleDeletePart = async (partId: number, partName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a peça "${partName}" deste modelo?`)) return;
    try {
      await deletePart(partId);
      showToast('Peça excluída com sucesso!');
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir peça', 'error');
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-32 sm:pb-12 space-y-4 sm:space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-16 sm:top-auto sm:bottom-20 right-3 left-3 sm:left-auto sm:right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in ${
            toast.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border border-emerald-500/40'
              : 'bg-red-950 text-red-200 border border-red-500/40'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium text-white flex-1">{toast.message}</span>
        </div>
      )}

      {/* Header & Sub-navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Configurações & Preços
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edite preços de compra, descontos de grade e custos de reposição.
            </p>
          </div>

          {/* Subtabs Touch Friendly */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('precos')}
              className={`min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                activeSubTab === 'precos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Preços Base</span>
            </button>

            <button
              onClick={() => setActiveSubTab('grades')}
              className={`min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                activeSubTab === 'grades'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">Grades</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pecas')}
              className={`min-h-[40px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                activeSubTab === 'pecas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">Peças</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: Preços Grade A & Capacidades */}
      {activeSubTab === 'precos' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Card: Adicionar Nova Capacidade */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-emerald-600" />
              Adicionar Capacidade a um Modelo
            </h3>
            <form onSubmit={handleAddVariant} className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo</label>
                <select
                  value={newVariantModelId}
                  onChange={(e) => setNewVariantModelId(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capacidade</label>
                <input
                  type="text"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  placeholder="Ex: 512GB ou 1TB"
                  required
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preço Base Grade A (R$)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={newPriceGradeA}
                  onChange={(e) => setNewPriceGradeA(Number(e.target.value))}
                  required
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingVariant}
                className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isAddingVariant ? 'Salvando...' : 'Cadastrar'}
              </button>
            </form>
          </div>

          {/* Lista de Modelos e Preços Base em Cartões Verticais (Zero scroll horizontal) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Catálogo de Preços Base (Grade A)</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Valores salvos instantaneamente no SQLite
                </p>
              </div>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                {models.length} Modelos
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
              {models.map((model) => (
                <div key={model.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <span className="font-extrabold text-slate-900 text-sm">{model.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {model.variants.length} opções
                    </span>
                  </div>

                  {/* Grid / Stack de variantes do modelo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {model.variants.map((variant) => {
                      const isEditing = editingVariantId === variant.id;
                      return (
                        <div
                          key={variant.id}
                          className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-2"
                        >
                          <div className="flex-1">
                            <span className="font-black text-xs sm:text-sm text-slate-900 block">
                              {variant.capacity}
                            </span>
                            {isEditing ? (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-slate-400 font-bold">R$</span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="10"
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(Number(e.target.value))}
                                  className="w-24 min-h-[36px] px-2 py-1 text-sm font-black border border-emerald-500 rounded-lg bg-emerald-50/60"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="text-xs sm:text-sm font-black text-emerald-700 block mt-0.5">
                                {formatCurrency(variant.priceGradeA)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isEditing ? (
                              <button
                                onClick={() => handleSavePrice(variant.id)}
                                disabled={savingVariant}
                                className="min-h-[40px] min-w-[40px] bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 flex items-center justify-center transition cursor-pointer"
                                title="Salvar Preço"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartEditPrice(variant.id, variant.priceGradeA)}
                                className="min-h-[40px] px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Editar
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteVariant(variant.id, variant.capacity)}
                              className="min-h-[40px] min-w-[40px] text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 rounded-xl flex items-center justify-center transition cursor-pointer"
                              title="Remover Capacidade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Descontos de Grade */}
      {activeSubTab === 'grades' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                Descontos Aplicados por Grade
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Configure os valores em R$ que serão subtraídos do preço Grade A em cada degrau de conservação.
              </p>
            </div>

            <form onSubmit={handleSaveGradeSettings} className="space-y-4">
              {/* Desconto Grade B */}
              <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      B
                    </span>
                    Desconto Grade B (R$)
                  </label>
                  <span className="text-[11px] text-blue-700 font-bold">Padrão: R$ 100</span>
                </div>
                <p className="text-xs text-blue-800/80">
                  Subtraído para aparelhos com marcas leves de uso ou bateria ≤ 85%.
                </p>
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    value={discountB}
                    onChange={(e) => setDiscountB(Number(e.target.value))}
                    required
                    className="w-full min-h-[48px] pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Desconto Grade C */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                      C
                    </span>
                    Desconto Grade C (R$)
                  </label>
                  <span className="text-[11px] text-amber-700 font-bold">Padrão: R$ 200</span>
                </div>
                <p className="text-xs text-amber-800/80">
                  Subtraído para aparelhos com muitas marcas ou mensagem de peça trocada.
                </p>
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    value={discountC}
                    onChange={(e) => setDiscountC(Number(e.target.value))}
                    required
                    className="w-full min-h-[48px] pl-10 pr-4 py-2 bg-white border border-amber-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Salvar Botão */}
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                {savingSettings ? 'Salvando...' : 'Salvar Novos Descontos de Grade'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Peças por Modelo */}
      {activeSubTab === 'pecas' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Seletor de Modelo para Peças */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Modelo para Gerenciar Peças
              </label>
              <select
                value={selectedPartsModelId}
                onChange={(e) => setSelectedPartsModelId(Number(e.target.value))}
                className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Form de adicionar peça rápida */}
            <form onSubmit={handleAddPart} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Peça</label>
                <input
                  type="text"
                  placeholder="Ex: Conector de Carga"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custo de Troca (R$)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={newPartCost}
                  onChange={(e) => setNewPartCost(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingPart}
                className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Adicionar Peça
              </button>
            </form>
          </div>

          {/* Cards de Peças do Modelo Selecionado (Zero scroll horizontal) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Peças de {selectedPartsModel.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Custos abatidos na compra quando o componente necessita de troca
                </p>
              </div>
              <span className="text-[11px] font-bold bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full">
                {selectedPartsModel.parts.length} Peças
              </span>
            </div>

            {selectedPartsModel.parts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhuma peça cadastrada para este modelo ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedPartsModel.parts.map((part) => {
                  const isEditing = editingPartId === part.id;
                  return (
                    <div
                      key={part.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/60 transition gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{part.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-slate-400">R$</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="10"
                              value={editingPartCost}
                              onChange={(e) => setEditingPartCost(Number(e.target.value))}
                              className="w-20 min-h-[36px] px-2 py-1 text-sm font-bold border border-emerald-500 rounded-lg bg-emerald-50/60"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePartCost(part.id)}
                              className="min-h-[36px] min-w-[36px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 flex items-center justify-center transition cursor-pointer"
                              title="Salvar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm font-bold text-red-600">
                            - {formatCurrency(part.cost)}
                          </span>
                        )}

                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingPartId(part.id);
                              setEditingPartCost(part.cost);
                            }}
                            className="min-h-[36px] px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg transition cursor-pointer"
                          >
                            Editar
                          </button>
                        )}

                        <button
                          onClick={() => handleDeletePart(part.id, part.name)}
                          className="min-h-[36px] min-w-[36px] text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 rounded-lg flex items-center justify-center transition cursor-pointer"
                          title="Excluir Peça"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

