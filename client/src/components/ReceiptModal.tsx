import React from 'react';
import { Evaluation } from '../types';
import { X, Printer, CheckCircle, AlertTriangle, Smartphone, Calendar, User, FileText } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
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
                  {evaluation.variant.model.name} - {evaluation.variant.capacity}
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
              <div className="mt-3 flex items-center space-x-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Possui aviso de peça trocada / não original (Forçado Grade C)</span>
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

              <div className="flex justify-between items-center text-slate-600 font-medium pt-1 border-t border-dashed border-slate-200">
                <span>Subtotal da Grade:</span>
                <span className="text-slate-900">
                  {formatCurrency(evaluation.basePriceGradeA - evaluation.gradeDiscount)}
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

          {/* Valor Final a Pagar */}
          <div className="bg-emerald-500 text-slate-950 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-950/80">Valor de Compra Proposto</p>
              <p className="text-xs text-emerald-950/70">A pagar pela loja ao cliente</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">{formatCurrency(evaluation.finalValue)}</span>
            </div>
          </div>
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
