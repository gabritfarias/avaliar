import React from 'react';
import { Evaluation } from '../types';
import { X, Printer, CheckCircle, AlertTriangle, Smartphone, Calendar, User, FileText, TrendingUp, ShoppingBag, Store } from 'lucide-react';

interface ReceiptModalProps {
  evaluation: Evaluation | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92dvh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg">Comprovante de Avaliação</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar comprovante"
            className="text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl active:bg-slate-800 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain" id="printable-receipt">
          {/* Header Info */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avaliação Nº</p>
              <p className="text-xl font-bold text-slate-900">#{evaluation.id.toString().padStart(5, '0')}</p>
              {evaluation.store?.name && (
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Store className="w-3 h-3 text-emerald-600" />
                  <span>{evaluation.store.name}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-slate-500 text-xs justify-end">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(evaluation.createdAt)}</span>
              </div>
              {evaluation.customerName && (
                <div className="flex items-center space-x-1 text-slate-700 text-sm font-medium mt-1 justify-end">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evaluation.customerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Aparelho Avaliado */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Aparelho
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">
                  {evaluation.variant?.model?.name || evaluation.modelName || 'Aparelho'}
                  {(evaluation.variant?.capacity || evaluation.capacityName) ? ` - ${evaluation.variant?.capacity || evaluation.capacityName}` : ''}
                </h4>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg font-bold text-sm ${
                  evaluation.grade === 'A'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : evaluation.grade === 'B'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  Grade {evaluation.grade}
                </span>
              </div>
            </div>

            {evaluation.hasReplacedPart && (
              <div className={`mt-3 flex items-center space-x-2 text-xs font-medium p-2.5 rounded-lg border ${
                (evaluation.unknownPartsDeduction || 0) > 0
                  ? 'text-red-800 bg-red-50 border-red-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200'
              }`}>
                <AlertTriangle className={`w-4 h-4 shrink-0 ${(evaluation.unknownPartsDeduction || 0) > 0 ? 'text-red-600' : 'text-amber-600'}`} />
                <span>
                  {(evaluation.unknownPartsDeduction || 0) > 0
                    ? `Aviso de Peça Desconhecida (Grade C forçada)${evaluation.replacedComponents ? `: ${evaluation.replacedComponents}` : ''}`
                    : `Aparelho possui peça substituída${evaluation.replacedComponents ? ` (${evaluation.replacedComponents})` : ''}`}
                </span>
              </div>
            )}
          </div>

          {/* Memória de Cálculo Detalhada */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Memória de Cálculo
            </h5>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Preço Base de Compra (Grade A):</span>
                <span className="font-semibold text-slate-900">{formatCurrency(evaluation.basePriceGradeA)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Desconto da Grade ({evaluation.grade}):</span>
                <span className="font-medium text-amber-600">
                  {evaluation.gradeDiscount > 0 ? `- ${formatCurrency(evaluation.gradeDiscount)}` : 'R$ 0,00'}
                </span>
              </div>

              {(evaluation.unknownPartsDeduction || 0) > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>Penalidade Peça Desconhecida ({evaluation.unknownPartsCount || 1}x):</span>
                  <span className="font-semibold">- {formatCurrency(evaluation.unknownPartsDeduction || 0)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 font-medium pt-1 border-t border-dashed border-slate-200">
                <span>Subtotal da Grade:</span>
                <span className="text-slate-900">
                  {formatCurrency(evaluation.basePriceGradeA - evaluation.gradeDiscount - (evaluation.unknownPartsDeduction || 0))}
                </span>
              </div>

              {/* Peças Abatidas */}
              {evaluation.parts.length > 0 ? (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Peças a substituir pela loja:</p>
                  <div className="space-y-1.5 pl-2">
                    {evaluation.parts.map((part) => (
                      <div key={part.id} className="flex justify-between items-center text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          {part.partName}
                        </span>
                        <span className="font-medium text-red-600">- {formatCurrency(part.cost)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mt-2 pt-1 border-t border-slate-100">
                    <span>Total de deduções de peças:</span>
                    <span className="text-red-600">- {formatCurrency(evaluation.totalPartsDeduction)}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-1 text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Nenhuma peça necessita troca.
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {evaluation.notes && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                <FileText className="w-3 h-3" /> Observações do Avaliador:
              </div>
              <p>{evaluation.notes}</p>
            </div>
          )}

          {/* Cards Valores Sugeridos (Compra e Venda de Referência) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Valor Sugerido para Compra */}
            <div className="bg-slate-100 text-slate-900 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 mb-0.5">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor Sugerido p/ Compra</p>
              </div>
              <div className="text-xl font-black text-slate-800">
                {formatCurrency(evaluation.suggestedPurchasePrice || (evaluation.basePriceGradeA - evaluation.gradeDiscount))}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Teto da Grade {evaluation.grade} sem avarias</p>
            </div>

            {/* Valor Sugerido para Venda */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Valor Sugerido p/ Venda</p>
              </div>
              <div className="text-xl font-black text-emerald-400">
                {formatCurrency(evaluation.suggestedSellingPrice || (evaluation.basePriceGradeA - evaluation.gradeDiscount + 500))}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Revenda sugerida (+R$ 500)</p>
            </div>
          </div>

          {/* Valor Final a Pagar ao Cliente */}
          <div className="bg-emerald-500 text-slate-950 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-950/80">Valor de Compra Proposto</p>
              <p className="text-xs text-emerald-950/70">Aparelho avaliado (abatimento na troca)</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">{formatCurrency(evaluation.finalValue)}</span>
            </div>
          </div>

          {/* Seção de Trade-in / Fechamento de Negócio se houver */}
          {evaluation.targetDeviceName && (
            <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-4 border border-slate-700 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Fechamento de Negócio (Trade-in)
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-medium bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {evaluation.paymentMethodLabel || evaluation.paymentMethod}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Aparelho Desejado:</span>
                  <span className="font-bold text-white text-sm block truncate">
                    {evaluation.targetDeviceName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Preço de Venda:</span>
                  <span className="font-bold text-white text-sm block">
                    {formatCurrency(evaluation.targetDeviceValue || 0)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>(-) Aparelho do Cliente (Entrada):</span>
                  <span className="font-semibold text-emerald-400">
                    - {formatCurrency(evaluation.finalValue)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Diferença Bruta (Volta):</span>
                  <span>{formatCurrency(evaluation.tradeInDifference || 0)}</span>
                </div>
                {(evaluation.paymentFeeAmount || 0) > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Taxa da Forma de Pagamento ({((evaluation.paymentFeeRate || 0) * 100).toFixed(0)}%):</span>
                    <span>+ {formatCurrency(evaluation.paymentFeeAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-700 text-sm font-bold">
                  <span className="text-white">Total Final a Pagar:</span>
                  <span className="text-base text-emerald-400 font-black">
                    {formatCurrency(evaluation.finalTradeInValue || (evaluation.tradeInDifference || 0))}
                  </span>
                </div>
                {(evaluation.installments || 1) > 1 && (
                  <div className="text-right text-xs text-emerald-300 font-bold">
                    Condição: {evaluation.installments}x de {formatCurrency(evaluation.installmentValue || 0)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3">
          <button
            onClick={printReceipt}
            className="min-h-[44px] flex items-center justify-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 active:bg-slate-200 hover:bg-slate-100 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
          <button
            onClick={onClose}
            className="min-h-[44px] flex items-center justify-center px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold active:bg-slate-800 hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
