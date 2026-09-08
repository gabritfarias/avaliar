import React, { useState } from 'react';
import { Evaluation } from '../types';
import { deleteEvaluation } from '../services/api';
import { ReceiptModal } from './ReceiptModal';
import {
  History,
  Search,
  Trash2,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  Smartphone,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface EvaluationHistoryProps {
  evaluations: Evaluation[];
  onRefresh: () => void;
}

export const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({
  evaluations,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  const filteredEvaluations = evaluations.filter((ev) => {
    const term = searchTerm.toLowerCase();
    const modelName = (ev.variant?.model?.name || ev.modelName || '').toLowerCase();
    const capacity = (ev.variant?.capacity || ev.capacityName || '').toLowerCase();
    const customer = (ev.customerName || '').toLowerCase();
    const notes = (ev.notes || '').toLowerCase();
    return (
      modelName.includes(term) ||
      capacity.includes(term) ||
      customer.includes(term) ||
      notes.includes(term)
    );
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta avaliação do histórico?')) return;
    try {
      await deleteEvaluation(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir avaliação');
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 sm:!pb-12 space-y-4 sm:space-y-6"
    >
      {/* Modal de Recibo */}
      <ReceiptModal
        evaluation={selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
      />

      {/* Header & Filtro */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Histórico de Avaliações
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro persistente de todas as avaliações no SQLite.
            </p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar modelo, cliente..."
              className="w-full min-h-[44px] pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="w-8 h-8 absolute right-1 top-1.5 flex items-center justify-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Avaliações */}
      {filteredEvaluations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center text-slate-400">
          <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
          <h4 className="font-bold text-slate-700 text-sm sm:text-base">Nenhuma avaliação encontrada</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Faça sua primeira avaliação na aba "Avaliar" para visualizá-la aqui.'}
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. MOBILE VIEW: Cartões Empilhados Verticais (Zero scroll horizontal)     */}
          {/* ========================================================================= */}
          <div className="md:hidden space-y-3">
            {filteredEvaluations.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3 transition"
              >
                {/* Topo do Card: ID e Data */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      #{ev.id.toString().padStart(5, '0')}
                    </span>
                    {ev.customerName && (
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">
                        • {ev.customerName}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(ev.createdAt)}</span>
                  </div>
                </div>

                {/* Dados do Aparelho & Grade */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        {ev.variant?.model?.name || ev.modelName || 'Aparelho'}
                      </h4>
                      {(ev.variant?.capacity || ev.capacityName) && (
                        <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.2 rounded font-mono font-bold">
                          {ev.variant?.capacity || ev.capacityName}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 ml-5">
                      Base Grade A: {formatCurrency(ev.basePriceGradeA)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`font-black px-2.5 py-0.5 rounded-md text-xs border ${
                        ev.grade === 'A'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : ev.grade === 'B'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      Grade {ev.grade}
                    </span>

                    {ev.hasReplacedPart && (
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Peça Trocada
                      </span>
                    )}
                  </div>
                </div>

                {/* Peças Abatidas */}
                {ev.parts && ev.parts.length > 0 ? (
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-xs">
                    <div className="flex justify-between items-center text-slate-500 mb-1">
                      <span>Peças substituídas ({ev.parts.length}):</span>
                      <span className="font-bold text-red-600">- {formatCurrency(ev.totalPartsDeduction)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ev.parts.map((p) => (
                        <span
                          key={p.id}
                          className="bg-white text-slate-700 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {p.partName}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Sem deduções de peças
                  </div>
                )}

                {/* Valor Final & Botões Táteis */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Valor a Pagar
                    </span>
                    <span className="text-xl font-black text-emerald-700 block">
                      {formatCurrency(ev.finalValue)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEvaluation(ev)}
                      className="min-h-[44px] px-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Recibo</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="min-h-[44px] min-w-[44px] text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 rounded-xl flex items-center justify-center transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 2. DESKTOP VIEW: Tabela Completa (para telas maiores >= 768px)             */}
          {/* ========================================================================= */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] sm:text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">ID & Data</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Aparelho</th>
                    <th className="p-4">Grade & Alerta</th>
                    <th className="p-4">Peças Abatidas</th>
                    <th className="p-4 text-right">Valor Final</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                      {/* ID & Data */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">#{ev.id.toString().padStart(5, '0')}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(ev.createdAt)}
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="p-4">
                        {ev.customerName ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ev.customerName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Não informado</span>
                        )}
                        {ev.notes && (
                          <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {ev.notes}
                          </p>
                        )}
                      </td>

                      {/* Aparelho */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-slate-500" />
                          <span className="font-bold text-slate-900">
                            {ev.variant?.model?.name || ev.modelName || 'Aparelho'}
                          </span>
                          {(ev.variant?.capacity || ev.capacityName) && (
                            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-mono font-bold">
                              {ev.variant?.capacity || ev.capacityName}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Base Grade A: {formatCurrency(ev.basePriceGradeA)}
                        </span>
                      </td>

                      {/* Grade & Alerta */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-md text-xs border ${
                              ev.grade === 'A'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ev.grade === 'B'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            Grade {ev.grade}
                          </span>

                          {ev.hasReplacedPart && (
                            <span
                              title="Aparelho possui mensagem de peça trocada"
                              className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              Peça Não Original
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Peças Abatidas */}
                      <td className="p-4">
                        {ev.parts && ev.parts.length > 0 ? (
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {ev.parts.map((p) => (
                                <span
                                  key={p.id}
                                  className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded"
                                >
                                  {p.partName}
                                </span>
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-red-600 block mt-1">
                              - {formatCurrency(ev.totalPartsDeduction)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Nenhuma
                          </span>
                        )}
                      </td>

                      {/* Valor Final */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="text-base font-extrabold text-emerald-700 block">
                          {formatCurrency(ev.finalValue)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedEvaluation(ev)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Ver Detalhes / Recibo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Excluir Avaliação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

