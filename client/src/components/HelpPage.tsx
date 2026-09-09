import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Smartphone,
  Layers,
  TrendingUp,
  History,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Info,
  DollarSign,
  Database,
  Trash2,
  PlusCircle,
} from 'lucide-react';

interface HelpTopic {
  id: string;
  title: string;
  category: 'avaliacao' | 'catalogo' | 'precos' | 'historico';
  categoryLabel: string;
  icon: React.ReactNode;
  summary: string;
  content: React.ReactNode;
}

export const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTopicIds, setExpandedTopicIds] = useState<string[]>([
    'como-avaliar',
    'pecas-substituidas',
    'gestao-catalogo',
    'precos-sugeridos',
    'historico-atendimentos',
  ]);

  const toggleTopic = (id: string) => {
    setExpandedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedTopicIds(topics.map((t) => t.id));
  };

  const collapseAll = () => {
    setExpandedTopicIds([]);
  };

  const topics: HelpTopic[] = [
    {
      id: 'como-avaliar',
      title: '1. Como Realizar uma Nova Avaliação Passo a Passo',
      category: 'avaliacao',
      categoryLabel: 'Avaliação',
      icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
      summary: 'Guia do fluxo de 5 passos no balcão: modelo, capacidade, peça substituída, grade e reparos.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            O fluxo de avaliação foi desenhado para ser rápido e seguro no balcão, garantindo cálculo em tempo real com memória transparente:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Modelo & Série
              </span>
              <p className="text-xs text-slate-600">
                Selecione o modelo do iPhone. Utilize os filtros de série (Linha 12, 13, 14, 15, 16) ou o campo de busca rápida pelo nome.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Capacidade de Armazenamento
              </span>
              <p className="text-xs text-slate-600">
                Escolha a capacidade (ex: 128GB, 256GB). O valor base de tabela da Grade A (preço de referência novo/impecável) é carregado instantaneamente.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Peça Substituída
              </span>
              <p className="text-xs text-slate-600">
                Verifique em <em>Ajustes &gt; Geral &gt; Sobre</em>. Caso haja troca de bateria, tela ou câmera, defina se é <strong>Genuína Apple</strong> ou <strong>Desconhecida</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                Grade de Conservação
              </span>
              <p className="text-xs text-slate-600">
                Classifique o estado físico entre Grade A, Grade B ou Grade C. Cada grade possui desconto pré-definido nas configurações da loja.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">5</span>
              Peças a Substituir (Deduções da Loja)
            </span>
            <p className="text-xs text-slate-600">
              Marque os itens que a loja precisará consertar antes de colocar o iPhone à venda (ex: vidro quebrado, bateria viciada, conector com folga). O custo de cada peça cadastrada para aquele modelo será subtraído do valor final pago ao cliente.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'pecas-substituidas',
      title: '2. Regras de Peças Substituídas: Genuína Apple vs. Desconhecida',
      category: 'avaliacao',
      categoryLabel: 'Avaliação',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      summary: 'Entenda como o status da peça trocada impacta a Grade de conservação e aplica penalidades.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Ao marcar a opção <strong>"Aparelho possui peça substituída"</strong> no Passo 3, o sistema exige indicar quais peças foram trocadas (Bateria, Tela ou Câmera) e a sua respectiva procedência no iOS:
          </p>

          {/* Comparativo lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Genuína Apple */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">Genuína Apple</h4>
                  <span className="text-[10px] font-semibold text-emerald-700">Peça original reconhecida pelo iOS</span>
                </div>
              </div>

              <ul className="text-xs text-emerald-900 space-y-1.5 pl-2 list-disc list-inside">
                <li>
                  <strong>Grade B ou C Livre:</strong> O atendente pode escolher manualmente entre <strong>Grade B</strong> ou <strong>Grade C</strong>.
                </li>
                <li>
                  <strong>Grade A Bloqueada:</strong> Como o aparelho já foi aberto e reparado, ele não pode ser classificado como Grade A.
                </li>
                <li>
                  <strong>Sem Penalidade Extra:</strong> Não há dedução punitiva adicional além do desconto padrão da grade selecionada.
                </li>
              </ul>
            </div>

            {/* Desconhecida */}
            <div className="bg-red-50/70 border-2 border-red-300 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold">⚠️</span>
                <div>
                  <h4 className="font-bold text-red-950 text-sm">Peça Desconhecida</h4>
                  <span className="text-[10px] font-semibold text-red-700">Mensagem de peça não genuína no iOS</span>
                </div>
              </div>

              <ul className="text-xs text-red-900 space-y-1.5 pl-2 list-disc list-inside">
                <li>
                  <strong>Trava Obrigatória em Grade C:</strong> O sistema bloqueia automaticamente a Grade A e a Grade B.
                </li>
                <li>
                  <strong>1 Peça Desconhecida:</strong> Aplica dedução extra de <strong>- R$ 200,00</strong> somada ao desconto da Grade C.
                </li>
                <li>
                  <strong>2 ou Mais Peças Desconhecidas:</strong> Aplica dedução extra de <strong>- R$ 300,00</strong> somada ao desconto da Grade C.
                </li>
                <li>
                  <strong>Reflexo Comercial:</strong> As penalidades abatem tanto o valor pago ao cliente quanto os preços sugeridos de compra e venda.
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Dica de Balcão:</strong> Para consultar no iPhone do cliente, acesse <em>Ajustes &gt; Geral &gt; Sobre</em>. Se a peça foi trocada em assistência não autorizada, o iOS exibirá "Aviso Importante sobre a Tela/Bateria/Câmera - Peça Desconhecida".
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'precos-sugeridos',
      title: '3. Preços Sugeridos de Compra e Venda e Fórmulas de Cálculo',
      category: 'precos',
      categoryLabel: 'Preços & Cálculos',
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      summary: 'Como funciona o cálculo do Valor Final, Valor Sugerido de Compra e Margem de R$ 500 na Venda.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            O sistema trabalha com 3 valores principais para apoiar as decisões comerciais da loja:
          </p>

          <div className="space-y-3">
            {/* Valor Final */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Valor Final de Compra (Pago ao Cliente)
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Proposta Balcão</span>
              </div>
              <p className="text-xs text-emerald-900 mt-1.5">
                É o valor líquido que o atendente oferece ao cliente no balcão. Fórmula matemática:
              </p>
              <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-200 text-xs font-mono text-emerald-950">
                Valor Final = Preço Base (Grade A) - Desconto Grade - Penalidade Desconhecida - Deduções de Peças (Loja)
              </div>
            </div>

            {/* Sugerido Compra */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-slate-600" />
                  Valor Sugerido para Compra
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Teto de Tabela</span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                Representa o valor de tabela do aparelho na grade avaliada, <strong>totalmente independente dos custos de reparo da loja</strong>. Assim, o lojista sabe quanto o aparelho vale sem avarias:
              </p>
              <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
                Sugerido Compra = Preço Base (Grade A) - Desconto Grade - Penalidade Desconhecida
              </div>
            </div>

            {/* Sugerido Venda */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Valor Sugerido para Venda (Revenda)
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-600/40 px-2 py-0.5 rounded-full">Revenda (+R$ 500)</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5">
                Calculado com base na margem padrão da loja para revenda do seminovo com garantia. Adiciona R$ 500,00 sobre o preço base ajustado:
              </p>
              <div className="mt-2 p-2 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono text-emerald-300">
                Sugerido Venda = Sugerido Compra + R$ 500,00
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'gestao-catalogo',
      title: '4. Gestão de Modelos, Peças e Exclusão em Cascata',
      category: 'catalogo',
      categoryLabel: 'Catálogo & Modelos',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      summary: 'Como cadastrar novos modelos, gerenciar capacidades e como funciona a exclusão segura em cascata.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Na aba <strong>"Configurações & Preços"</strong>, os gestores da loja têm controle total sobre o catálogo de produtos e valores de tabela:
          </p>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Cadastro Livre de Novos Modelos</span>
              </div>
              <p className="text-xs text-slate-600">
                Para cadastrar um novo modelo (ex: iPhone 17 Pro ou qualquer novo lançamento), clique em <strong>"Novo Modelo"</strong>. Preencha o nome e adicione as capacidades com seus preços base para Grade A.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Autogeração e Sincronização de Peças</span>
              </div>
              <p className="text-xs text-slate-600">
                Ao cadastrar um modelo, o sistema cria automaticamente as 6 peças essenciais de reparo (Tela, Bateria, Câmera Traseira, Tampa Traseira, Conector de Carga e Câmera Frontal). Os custos dessas peças podem ser editados individualmente na aba "Peças de Reposição".
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Exclusão Segura em Cascata</span>
              </div>
              <p className="text-xs text-slate-600">
                Quando um modelo é excluído do catálogo, o banco de dados executa uma exclusão em cascata das variantes e das peças vinculadas àquele modelo. Isso impede o acúmulo de dados órfãos e garante que a aba de peças exiba apenas peças de modelos atualmente ativos.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'historico-atendimentos',
      title: '5. Histórico de Atendimentos e Integridade dos Registros',
      category: 'historico',
      categoryLabel: 'Histórico & Comprovante',
      icon: <History className="w-5 h-5 text-purple-600" />,
      summary: 'Como consultar avaliações passadas e a garantia de preservação dos dados mesmo se modelos forem excluídos.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            A aba <strong>"Histórico"</strong> registra todas as avaliações concluídas e salvas pelos atendentes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-600" />
                Busca & Filtros
              </h4>
              <p className="text-xs text-slate-600">
                Filtre por nome do cliente, modelo do iPhone, data do atendimento ou grade avaliada (A, B ou C).
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Comprovante & Recibo
              </h4>
              <p className="text-xs text-slate-600">
                Clique no botão <strong>"Comprovante"</strong> para abrir o recibo digital com memória de cálculo detalhada, pronto para impressão ou cópia.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-900">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Garantia de Preservação Histórica (Snapshot Seguro)</span>
            </div>
            <p className="leading-relaxed">
              O sistema salva no banco de dados os snapshots dos nomes do modelo (<code>modelName</code>), capacidade (<code>capacityName</code>) e peças substituídas diretamente no registro da avaliação. Se no futuro um modelo for removido do catálogo de vendas, <strong>as avaliações antigas desse aparelho continuarão salvas, completas e visíveis no histórico</strong> sem erros ou campos em branco.
            </p>
          </div>
        </div>
      ),
    },
  ];

  // Filtro de tópicos por texto e categoria
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesSearch =
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.summary.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedCategory === 'all') return true;
      return topic.category === selectedCategory;
    });
  }, [topics, searchTerm, selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* Cabeçalho da Página */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Central de Ajuda & Manual de Operação</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Como Operar o iAvalia Pro
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Manual interativo com todas as diretrizes de avaliação de balcão, regras de procedência de peças (Genuína vs. Desconhecida), cálculo de preços sugeridos e gestão do catálogo.
          </p>

          {/* Barra de Busca de Ajuda */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tema (ex: desconhecida, grade C, venda, excluir)..."
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* Filtros por Categoria & Ações de Expansão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todos os Tópicos' },
            { id: 'avaliacao', label: 'Avaliação & Peças' },
            { id: 'precos', label: 'Preços & Cálculos' },
            { id: 'catalogo', label: 'Catálogo' },
            { id: 'historico', label: 'Histórico' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <button
            onClick={expandAll}
            className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded cursor-pointer"
          >
            Expandir todos
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={collapseAll}
            className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded cursor-pointer"
          >
            Recolher todos
          </button>
        </div>
      </div>

      {/* Lista de Tópicos / Acordeons Didáticos */}
      <div className="space-y-3.5">
        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Nenhum tópico encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente buscar com outros termos como "peça", "grade" ou "compra".
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isExpanded = expandedTopicIds.includes(topic.id);
            return (
              <div
                key={topic.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Cabeçalho do Card / Acordeon */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left hover:bg-slate-50/70 transition cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {topic.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {topic.categoryLabel}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 sm:line-clamp-none">
                        {topic.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-slate-100 animate-in fade-in">
                    {topic.content}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Card Rodapé de Suporte Rápido */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Dúvidas Frequentes no Balcão?</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              Consulte sempre o menu "Ajustes" para verificar os descontos em vigor da Grade B e Grade C.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <span>Versão 1.2.0 • iAvalia Pro</span>
        </div>
      </div>
    </div>
  );
};
