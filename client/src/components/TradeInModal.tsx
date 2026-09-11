import React, { useState, useMemo } from 'react';
import { CalculationBreakdown, Model, PaymentTableType, TradeInDetails } from '../types';
import {
  X,
  Smartphone,
  CreditCard,
  Banknote,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface TradeInModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: CalculationBreakdown | null;
  customerName?: string;
  models?: Model[];
  onConfirmTradeIn: (tradeIn: TradeInDetails) => void;
  onSaveWithoutTradeIn: () => void;
  isSaving: boolean;
}

export const TradeInModal: React.FC<TradeInModalProps> = ({
  isOpen,
  onClose,
  calculation,
  customerName,
  models = [],
  onConfirmTradeIn,
  onSaveWithoutTradeIn,
  isSaving,
}) => {
  // 1. TODOS OS HOOKS DECLARADOS NO TOPO (Regra inegociável do React para evitar tela branca)
  const [targetDeviceName, setTargetDeviceName] = useState<string>('');
  const [targetDeviceValueStr, setTargetDeviceValueStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTableType>('CREDIT_CELL');
  const [cellInstallments, setCellInstallments] = useState<number>(10);
  const [baneseInstallments, setBaneseInstallments] = useState<number>(10);
  const [isBaneseMulv, setIsBaneseMulv] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sugestões de aparelhos do catálogo (useMemo executado incondicionalmente no topo)
  const modelSuggestions = useMemo(() => {
    if (!Array.isArray(models)) return [];
    const list: string[] = [];
    models.forEach((m) => {
      if (m && Array.isArray(m.variants)) {
        m.variants.forEach((v) => {
          if (v && v.capacity) {
            list.push(`${m.name} ${v.capacity}`);
          }
        });
      }
    });
    return list;
  }, [models]);

  // 2. RETORNO ANTECIPADO SOMENTE APÓS TODOS OS HOOKS
  if (!isOpen || !calculation) {
    return null;
  }

  // Funções de formatação e cálculo seguras contra null/undefined/NaN
  const formatCurrency = (val?: number | null) => {
    const num = typeof val === 'number' && !isNaN(val) ? val : 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const clientDeviceValue = typeof calculation.finalValue === 'number' ? calculation.finalValue : 0;

  // Taxas da Tabela Celular
  const getCellRate = (installments: number): number => {
    if (installments === 1) return 0.06;
    if (installments >= 2 && installments <= 4) return 0.10;
    if (installments >= 5 && installments <= 10) return 0.12;
    if (installments >= 11 && installments <= 12) return 0.15;
    if (installments >= 13 && installments <= 18) return 0.20;
    if (installments >= 19 && installments <= 21) return 0.22;
    return 0.12;
  };

  // Taxas da Tabela Banese
  const getBaneseRate = (installments: number, mulv: boolean): number => {
    if (installments <= 6) return 0.15;
    if (installments >= 7 && installments <= 10) {
      return mulv ? 0.18 : 0.15;
    }
    if (installments >= 11 && installments <= 12) {
      return mulv ? 0.20 : 0.18;
    }
    return 0.15;
  };

  // Cálculo dos valores financeiros da volta
  const parsedTargetValue = parseFloat((targetDeviceValueStr || '').replace(/\./g, '').replace(',', '.')) || 0;
  const difference = Math.max(0, parsedTargetValue - clientDeviceValue);

  // Determinar taxa e parcelas atuais com base na opção selecionada
  let feeRate = 0;
  let activeInstallments = 1;
  let paymentLabel = 'Dinheiro / Pix';

  if (paymentMethod === 'PIX') {
    feeRate = 0;
    activeInstallments = 1;
    paymentLabel = 'Dinheiro / Pix';
  } else if (paymentMethod === 'DEBIT') {
    feeRate = 0.04;
    activeInstallments = 1;
    paymentLabel = 'Cartão de Débito (+4%)';
  } else if (paymentMethod === 'CREDIT_CELL') {
    activeInstallments = cellInstallments;
    feeRate = getCellRate(cellInstallments);
    paymentLabel = `Crédito - Tabela Celular (${activeInstallments}x)`;
  } else if (paymentMethod === 'CREDIT_BANESE') {
    activeInstallments = baneseInstallments;
    feeRate = getBaneseRate(baneseInstallments, isBaneseMulv);
    paymentLabel = `Crédito - Tabela Banese (${activeInstallments}x${isBaneseMulv ? ' Mulv' : ''})`;
  }

  const feeAmount = difference * feeRate;
  const finalTradeInValue = difference + feeAmount;
  const installmentValue = activeInstallments > 0 ? finalTradeInValue / activeInstallments : finalTradeInValue;

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setTargetDeviceValueStr('');
      return;
    }
    const val = (parseInt(raw, 10) / 100).toFixed(2);
    const parts = val.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setTargetDeviceValueStr(`${intPart},${parts[1]}`);
  };

  const handleConfirm = () => {
    if (!targetDeviceName.trim()) {
      setValidationError('Por favor, informe o nome do aparelho desejado.');
      return;
    }

    if (parsedTargetValue <= 0) {
      setValidationError('Por favor, informe um valor válido de venda para o aparelho desejado.');
      return;
    }

    setValidationError(null);

    const tradeIn: TradeInDetails = {
      targetDeviceName: targetDeviceName.trim(),
      targetDeviceValue: parsedTargetValue,
      tradeInDifference: difference,
      paymentMethod,
      paymentMethodLabel: paymentLabel,
      installments: activeInstallments,
      paymentFeeRate: feeRate,
      paymentFeeAmount: feeAmount,
      finalTradeInValue,
      installmentValue,
      isMulvSpecial: paymentMethod === 'CREDIT_BANESE' ? isBaneseMulv : undefined,
    };

    onConfirmTradeIn(tradeIn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92dvh] flex flex-col overflow-hidden text-white my-auto">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Orçamento e Fechamento (Trade-in)
              </h2>
              <p className="text-xs text-slate-400">
                Calcule a diferença (volta) e o parcelamento com taxas para fechamento da troca.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {validationError && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-center gap-2 animate-shake">
              <span>⚠️ {validationError}</span>
            </div>
          )}

          {/* Comparativo: Aparelho do Cliente vs Aparelho Desejado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card Aparelho do Cliente (Avaliado) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-slate-400" />
                  Aparelho do Cliente
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  calculation.effectiveGrade === 'A'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : calculation.effectiveGrade === 'B'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  Grade {calculation.effectiveGrade || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate">
                  {calculation.modelName || 'Aparelho'} {calculation.capacity || ''}
                </p>
                {customerName && (
                  <p className="text-xs text-slate-400 truncate">Cliente: {customerName}</p>
                )}
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Valor de Entrada:</span>
                <span className="text-sm font-black text-emerald-400">
                  {formatCurrency(clientDeviceValue)}
                </span>
              </div>
            </div>

            {/* Card Aparelho Desejado (Venda da Loja) */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Aparelho Desejado (Loja)
              </span>

              {/* Nome do Aparelho Desejado */}
              <div>
                <input
                  type="text"
                  list="models-datalist"
                  placeholder="ex: iPhone 14 Pro Max 128GB"
                  value={targetDeviceName}
                  onChange={(e) => setTargetDeviceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/70 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <datalist id="models-datalist">
                  {modelSuggestions.map((name, idx) => (
                    <option key={idx} value={name} />
                  ))}
                </datalist>
              </div>

              {/* Preço de Venda do Aparelho Desejado */}
              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 shrink-0">Preço de Venda:</span>
                <div className="relative w-36">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-semibold">R$</span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={targetDeviceValueStr}
                    onChange={handlePriceInputChange}
                    className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-8 pr-2.5 py-1 text-xs text-right font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banner de Diferença (Volta Bruta) */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Diferença Bruta da Troca (Volta):</span>
                <p className="text-xs text-slate-500">
                  {formatCurrency(parsedTargetValue)} (Desejado) - {formatCurrency(clientDeviceValue)} (Cliente)
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-xl font-black text-white">
                {formatCurrency(difference)}
              </span>
            </div>
          </div>

          {/* Seção Formas de Pagamento e Taxas */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Forma de Pagamento da Volta
            </label>

            {/* Grid 4 opções de pagamento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px] cursor-pointer ${
                  paymentMethod === 'PIX'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Banknote className={`w-4 h-4 ${paymentMethod === 'PIX' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    0% Taxa
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold block">Dinheiro / Pix</span>
                  <span className="text-[10px] text-slate-400">À vista</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DEBIT')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px] cursor-pointer ${
                  paymentMethod === 'DEBIT'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <CreditCard className={`w-4 h-4 ${paymentMethod === 'DEBIT' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    +4%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold block">Débito</span>
                  <span className="text-[10px] text-slate-400">1x no cartão</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CELL')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px] cursor-pointer ${
                  paymentMethod === 'CREDIT_CELL'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Smartphone className={`w-4 h-4 ${paymentMethod === 'CREDIT_CELL' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Até 21x
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold block">Tabela Celular</span>
                  <span className="text-[10px] text-slate-400">Crédito parcelado</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_BANESE')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px] cursor-pointer ${
                  paymentMethod === 'CREDIT_BANESE'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <CreditCard className={`w-4 h-4 ${paymentMethod === 'CREDIT_BANESE' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Até 12x
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold block">Tabela Banese</span>
                  <span className="text-[10px] text-slate-400">Cartão Banese</span>
                </div>
              </button>
            </div>

            {/* Configurações de Parcelas quando Crédito - Tabela Celular */}
            {paymentMethod === 'CREDIT_CELL' && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Parcelamento (Tabela Celular):
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Taxa: {(getCellRate(cellInstallments) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {Array.from({ length: 21 }, (_, i) => i + 1).map((n) => {
                    const rate = getCellRate(n);
                    const isSelected = cellInstallments === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCellInstallments(n)}
                        className={`py-2 px-1 rounded-xl text-center transition border cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-xs block leading-tight">{n}x</span>
                        <span className={`text-[9px] block ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                          +{(rate * 100).toFixed(0)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Configurações de Parcelas quando Crédito - Tabela Banese */}
            {paymentMethod === 'CREDIT_BANESE' && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Parcelamento (Tabela Banese):
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Taxa: {(getBaneseRate(baneseInstallments, isBaneseMulv) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                    const rate = getBaneseRate(n, isBaneseMulv);
                    const isSelected = baneseInstallments === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setBaneseInstallments(n)}
                        className={`py-2 px-1 rounded-xl text-center transition border cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-xs block leading-tight">{n}x</span>
                        <span className={`text-[9px] block ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                          +{(rate * 100).toFixed(0)}%
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Opção Mulv para parcelas a partir de 7x */}
                {baneseInstallments >= 7 && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBaneseMulv}
                        onChange={(e) => setIsBaneseMulv(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                      />
                      <span>Aplicar Opção Mulv ({baneseInstallments <= 10 ? '18%' : '20%'})</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Padrão: {baneseInstallments <= 10 ? '15%' : '18%'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Resumo Financeiro Final com Destaque */}
          <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Diferença Bruta da Volta:</span>
              <span className="font-semibold text-white">{formatCurrency(difference)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Acréscimo Taxa de Pagamento ({(feeRate * 100).toFixed(0)}%):</span>
              <span className="font-semibold text-amber-400">+{formatCurrency(feeAmount)}</span>
            </div>

            <div className="pt-1 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Total Final da Volta a Pagar
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white block mt-0.5 tracking-tight">
                  {formatCurrency(finalTradeInValue)}
                </span>
              </div>

              {activeInstallments > 1 && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Parcelamento
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 block mt-0.5">
                    {activeInstallments}x de {formatCurrency(installmentValue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer / Botões de Ação */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onSaveWithoutTradeIn}
            disabled={isSaving}
            className="text-xs text-slate-400 hover:text-slate-200 underline decoration-slate-600 transition cursor-pointer order-2 sm:order-1 disabled:opacity-50"
          >
            Salvar apenas compra do usado (sem troca)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-1/3 sm:w-auto px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              Voltar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Gravando Negócio...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Salvar Negócio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
