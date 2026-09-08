import React, { useState } from 'react';
import { CalculationBreakdown } from '../types';
import {
  Calculator,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ChevronUp,
  X,
  Smartphone,
} from 'lucide-react';

interface CalculationSummaryProps {
  calculation: CalculationBreakdown | null;
  loading: boolean;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  calculation,
  loading,
  onSave,
  isSaving,
  canSave,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (!calculation) {
    return (
      <>
        {/* Desktop Empty State */}
        <div className="hidden lg:block bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
          <Calculator className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h4 className="font-semibold text-slate-700">Resumo da Avaliação</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Selecione o modelo e a capacidade ao lado para calcular o valor de compra em tempo real.
          </p>
        </div>

        {/* Mobile Sticky Placeholder Bar */}
        <div
          style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
          className="lg:hidden fixed left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 shadow-xl border-t border-slate-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Selecione modelo e capacidade</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">R$ --</span>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW: Sidebar Card Sticky                                     */}
      {/* ========================================================================= */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-20 transition-all">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-base">Memória de Cálculo</span>
            </div>
            <span className="text-xs bg-slate-700/60 border border-slate-600 px-2.5 py-1 rounded-full text-slate-300 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            {calculation.modelName} ({calculation.capacity})
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="p-5 space-y-4">
          {/* Step 1: Preço Base Grade A */}
          <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
            <div>
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block">Passo 1</span>
              <span className="text-slate-800 font-medium">Preço Base (Grade A):</span>
            </div>
            <span className="font-bold text-slate-900 text-base">
              {formatCurrency(calculation.basePriceGradeA)}
            </span>
          </div>

          {/* Step 2: Desconto da Grade */}
          <div className="space-y-1.5 py-1 border-b border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block">Passo 2</span>
                <span className="text-slate-800 font-medium flex items-center gap-1.5">
                  Ajuste Grade {calculation.effectiveGrade}:
                  {calculation.forcedGradeC && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                      Peça Trocada
                    </span>
                  )}
                </span>
              </div>
              <span className={`font-semibold ${calculation.gradeDiscount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {calculation.gradeDiscount > 0 ? `- ${formatCurrency(calculation.gradeDiscount)}` : 'R$ 0,00'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg">
              <span>Subtotal após avaliação de grade:</span>
              <span className="font-semibold text-slate-700">{formatCurrency(calculation.priceAfterGrade)}</span>
            </div>
          </div>

          {/* Step 3: Peças a Substituir */}
          <div className="space-y-2 py-1 border-b border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider block">Passo 3</span>
                <span className="text-slate-800 font-medium flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  Peças a Trocar ({calculation.parts.length}):
                </span>
              </div>
              <span className={`font-semibold ${calculation.totalPartsDeduction > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                {calculation.totalPartsDeduction > 0 ? `- ${formatCurrency(calculation.totalPartsDeduction)}` : 'R$ 0,00'}
              </span>
            </div>

            {calculation.parts.length > 0 ? (
              <div className="space-y-1 pl-2 max-h-36 overflow-y-auto">
                {calculation.parts.map((part) => (
                  <div key={part.id} className="flex justify-between items-center text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {part.name}
                    </span>
                    <span className="font-medium text-red-600">- {formatCurrency(part.cost)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 pl-2">Nenhuma peça marcada para substituição.</p>
            )}
          </div>

          {/* Final Big Value Display */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500/40 rounded-xl p-4 text-center">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Valor Final de Compra a Pagar
            </span>
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">
              {formatCurrency(calculation.finalValue)}
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-1">
              Proposta calculada para o cliente no balcão
            </p>
          </div>

          {/* Warnings if forced C */}
          {calculation.forcedGradeC && (
            <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-2.5 rounded-lg text-xs border border-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Grade C aplicada automaticamente porque o aparelho possui mensagem de peça trocada.</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onSave}
            disabled={!canSave || isSaving || loading}
            className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Salvando no Banco...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Concluir e Salvar Avaliação</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW: Sticky Bottom Bar (Fixo na parte inferior acima da Tab Bar)*/}
      {/* ========================================================================= */}
      <div
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
        className="lg:hidden fixed left-0 right-0 z-30 bg-slate-900/98 backdrop-blur-md text-white border-t border-slate-700 shadow-2xl px-3.5 py-2.5"
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Informações do Valor e Toque para Expandir */}
          <div
            onClick={() => setIsDrawerOpen(true)}
            className="flex-1 cursor-pointer select-none py-0.5 active:opacity-80 min-w-0"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none">
                Pagar ao Cliente
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 leading-none">
                <ChevronUp className="w-3 h-3" /> Memória
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-black text-emerald-400 leading-none tracking-tight">
              {formatCurrency(calculation.finalValue)}
            </div>

            <div className="text-[11px] font-medium text-slate-300 leading-tight truncate mt-1">
              {calculation.modelName} · Gr. {calculation.effectiveGrade}
              {calculation.forcedGradeC ? ' (Peça trocada)' : ''}
            </div>
          </div>

          {/* Botão de Ação Rápida com o Polegar */}
          <button
            onClick={onSave}
            disabled={!canSave || isSaving || loading}
            className="min-h-[48px] px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM SHEET (Gaveta expansível com memória de cálculo completa) */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          {/* Backdrop click to dismiss */}
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />

          {/* Drawer Content */}
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto border-t border-slate-200 animate-slide-up pb-safe">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3" />

            {/* Header do Drawer */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Memória de Cálculo</h3>
                  <p className="text-[11px] text-slate-500">
                    {calculation.modelName} ({calculation.capacity})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 active:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Drawer com todos os passos */}
            <div className="p-5 space-y-4 text-sm">
              {/* Passo 1 */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Passo 1</span>
                  <p className="font-medium text-slate-800">Preço Base (Grade A)</p>
                </div>
                <span className="font-bold text-slate-900 text-base">
                  {formatCurrency(calculation.basePriceGradeA)}
                </span>
              </div>

              {/* Passo 2 */}
              <div className="py-2 border-b border-slate-100 space-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Passo 2</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1">
                      Ajuste Grade {calculation.effectiveGrade}
                      {calculation.forcedGradeC && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          Peça Trocada
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`font-semibold ${calculation.gradeDiscount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {calculation.gradeDiscount > 0 ? `- ${formatCurrency(calculation.gradeDiscount)}` : 'R$ 0,00'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                  <span>Subtotal da Grade:</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(calculation.priceAfterGrade)}</span>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="py-2 border-b border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Passo 3</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      Peças a Trocar ({calculation.parts.length})
                    </p>
                  </div>
                  <span className={`font-semibold ${calculation.totalPartsDeduction > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {calculation.totalPartsDeduction > 0 ? `- ${formatCurrency(calculation.totalPartsDeduction)}` : 'R$ 0,00'}
                  </span>
                </div>

                {calculation.parts.length > 0 ? (
                  <div className="space-y-1.5 pl-2 max-h-32 overflow-y-auto">
                    {calculation.parts.map((part) => (
                      <div key={part.id} className="flex justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {part.name}
                        </span>
                        <span className="font-medium text-red-600">- {formatCurrency(part.cost)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 pl-2">Nenhuma peça marcada para reparo.</p>
                )}
              </div>

              {/* Card Destaque Valor Final */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500/40 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Valor Final de Compra
                </span>
                <div className="text-3xl font-black text-emerald-700 mt-1">
                  {formatCurrency(calculation.finalValue)}
                </div>
                <p className="text-[11px] text-emerald-700/80 mt-0.5">
                  Valor a ser pago ao cliente
                </p>
              </div>

              {/* Alerta se peça trocada */}
              {calculation.forcedGradeC && (
                <div className="flex items-start gap-2 bg-amber-50 text-amber-900 p-3 rounded-xl text-xs border border-amber-200">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>Grade C forçada devido a mensagem de peça não original no aparelho.</span>
                </div>
              )}

              {/* Botão de Salvar Avaliação no Drawer */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onSave();
                }}
                disabled={!canSave || isSaving || loading}
                className="w-full min-h-[48px] bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Concluir e Salvar Avaliação</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

