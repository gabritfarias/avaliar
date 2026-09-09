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
    'precos-sugeridos',
    'gestao-catalogo',
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
      title: '1. Como Realizar uma Avaliação no Balcão (Passo a Passo)',
      category: 'avaliacao',
      categoryLabel: 'Avaliação de Balcão',
      icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
      summary: 'Guia prático em 5 etapas: escolha do aparelho, capacidade, peças trocadas, estado de conservação e reparos.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            O fluxo de atendimento foi planejado para ser ágil e seguro no dia a dia da loja. A cada escolha feita na tela, os valores são recalculados na hora:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Modelo do iPhone
              </span>
              <p className="text-xs text-slate-600">
                Escolha o modelo trazido pelo cliente. Você pode filtrar rapidamente pelos botões de linha (ex: Linha 13, 14, 15, 16) ou digitar o nome na barra de busca.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Capacidade de Memória
              </span>
              <p className="text-xs text-slate-600">
                Toque na capacidade do aparelho (128GB, 256GB, etc.). O preço base de tabela para um aparelho impecável aparece imediatamente na tela.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Aviso de Peça Substituída
              </span>
              <p className="text-xs text-slate-600">
                Consulte em <em>Ajustes &gt; Geral &gt; Sobre</em>. Se houver peça trocada, selecione se ela é <strong>Genuína Apple</strong> ou se tem aviso de <strong>Peça Desconhecida</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                Estado de Conservação (Grade)
              </span>
              <p className="text-xs text-slate-600">
                Defina o estado estético do aparelho entre Grade A (impecável), Grade B (marcas leves) ou Grade C (desgastes acentuados). Cada grade aplica o desconto padrão da loja.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">5</span>
              Consertos Necessários pela Loja
            </span>
            <p className="text-xs text-slate-600">
              Marque as peças que a loja precisará consertar ou trocar antes de colocar o aparelho à venda (ex: tela trincada, bateria fraca, tampa traseira arranhada). O custo desses reparos será abatido do valor que você pagará ao cliente.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'pecas-substituidas',
      title: '2. Regras de Peças Substituídas: Genuína Apple vs. Desconhecida',
      category: 'avaliacao',
      categoryLabel: 'Avaliação de Balcão',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      summary: 'Diferença prática entre peças originais e avisos de peça desconhecida, com as penalidades de valor.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            Quando o atendente indica que o aparelho possui uma peça substituída (Bateria, Tela ou Câmera), o sistema exige classificar a procedência exibida no iPhone:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Genuína Apple */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">Genuína Apple</h4>
                  <span className="text-[10px] font-semibold text-emerald-700">Peça oficial reconhecida pelo aparelho</span>
                </div>
              </div>

              <ul className="text-xs text-emerald-900 space-y-1.5 pl-2 list-disc list-inside">
                <li>
                  <strong>Liberdade de Escolha:</strong> O atendente pode escolher livremente entre a <strong>Grade B</strong> ou a <strong>Grade C</strong>, dependendo da estética do celular.
                </li>
                <li>
                  <strong>Grade A Indisponível:</strong> Como o aparelho já foi aberto e teve peças trocadas, ele não pode ser considerado Grade A.
                </li>
                <li>
                  <strong>Sem Desconto Punitivo:</strong> Não há nenhuma penalidade financeira extra além do desconto normal da grade escolhida.
                </li>
              </ul>
            </div>

            {/* Desconhecida */}
            <div className="bg-red-50/70 border-2 border-red-300 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold">⚠️</span>
                <div>
                  <h4 className="font-bold text-red-950 text-sm">Peça Desconhecida</h4>
                  <span className="text-[10px] font-semibold text-red-700">Mensagem de peça não original no iPhone</span>
                </div>
              </div>

              <ul className="text-xs text-red-900 space-y-1.5 pl-2 list-disc list-inside">
                <li>
                  <strong>Trava Automática na Grade C:</strong> Por segurança comercial da loja, o sistema força a classificação diretamente na <strong>Grade C</strong>.
                </li>
                <li>
                  <strong>Desconto para 1 Peça Desconhecida:</strong> Além do desconto da Grade C, aplica um desconto extra de <strong>R$ 200,00</strong>.
                </li>
                <li>
                  <strong>Desconto para 2 ou Mais Peças:</strong> Se houver mais de uma peça desconhecida (ex: Tela e Bateria), o desconto extra sobe para <strong>R$ 300,00</strong>.
                </li>
                <li>
                  <strong>Proteção na Revenda:</strong> Esse desconto protege a margem da loja, pois aparelhos com mensagem no sistema têm maior resistência na revenda.
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Dica para o Atendente:</strong> Para checar no celular do cliente, acesse <em>Ajustes &gt; Geral &gt; Sobre</em>. Caso uma peça paralela tenha sido instalada, o próprio iPhone exibirá o aviso em destaque indicando peça desconhecida.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'precos-sugeridos',
      title: '3. Preços Sugeridos de Compra e Venda e Como Funcionam os Descontos',
      category: 'precos',
      categoryLabel: 'Preços & Cálculos',
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      summary: 'Entenda como a loja calcula o valor pago ao cliente, o teto de compra e a margem de revenda.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            O sistema apresenta 3 valores estratégicos para orientar a negociação no balcão e garantir lucro nas vendas:
          </p>

          <div className="space-y-3">
            {/* Valor Final */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Valor Final a Pagar ao Cliente
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Proposta Balcão</span>
              </div>
              <p className="text-xs text-emerald-900 mt-1.5 leading-relaxed">
                É a quantia líquida que a loja deve oferecer ao cliente. O sistema inicia no preço base do aparelho e vai subtraindo:
              </p>
              <div className="mt-2 p-2.5 bg-white rounded-lg border border-emerald-200 text-xs text-emerald-950 font-medium space-y-1">
                <div className="flex items-center justify-between">
                  <span>Preço Base de Tabela (Grade A)</span>
                  <span className="text-emerald-700 font-bold">+ Valor inicial</span>
                </div>
                <div className="flex items-center justify-between text-amber-700">
                  <span>(−) Desconto do Estado Físico (Grade B ou C)</span>
                  <span>− Desconto da Grade</span>
                </div>
                <div className="flex items-center justify-between text-red-700">
                  <span>(−) Desconto de Peça Desconhecida (se houver)</span>
                  <span>− R$ 200 ou R$ 300</span>
                </div>
                <div className="flex items-center justify-between text-red-700 border-t border-slate-100 pt-1">
                  <span>(−) Peças Quebradas que a Loja vai Reparar</span>
                  <span>− Custo das Peças</span>
                </div>
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
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                É o valor de tabela do aparelho no seu estado de conservação, <strong>sem descontar os consertos que a loja precisará fazer</strong>. Serve como um teto de referência para o atendente saber até quanto o aparelho vale sem avarias.
              </p>
            </div>

            {/* Sugerido Venda */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Valor Sugerido para Venda (Revenda na Vitrine)
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-600/40 px-2 py-0.5 rounded-full">Margem (+R$ 500)</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                É o preço recomendado para colocar o iPhone à venda na vitrine da loja com margem saudável e garantia. O sistema adiciona automaticamente <strong>R$ 500,00 de margem</strong> sobre o valor de referência do aparelho.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'gestao-catalogo',
      title: '4. Gestão de Modelos e Peças de Reposição',
      category: 'catalogo',
      categoryLabel: 'Catálogo & Modelos',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      summary: 'Como cadastrar novos aparelhos, ajustar preços de tabela e manter a tela de peças sempre limpa.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            O catálogo de iPhones, as capacidades, os preços-base de Grade A, os custos de peças e os descontos de grade pertencem a uma <strong>tabela oficial global e centralizada</strong>. Exclusivamente o perfil Administrador (<strong>Master</strong>) tem acesso à aba <strong>"Configurações & Preços"</strong> para gerenciar os valores da rede. Todos os usuários de lojas comuns utilizam automaticamente essa mesma tabela oficial nas avaliações de balcão, garantindo padronização completa de preços em todas as unidades.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Cadastro de Novos Lançamentos</span>
              </div>
              <p className="text-xs text-slate-600">
                Sempre que a loja começar a trabalhar com um novo modelo (como novos lançamentos da Apple), clique no botão <strong>"Novo Modelo"</strong>. Digite o nome do modelo e adicione as capacidades com seus preços base para Grade A.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Criação Automática das Peças de Reposição</span>
              </div>
              <p className="text-xs text-slate-600">
                Ao cadastrar um novo modelo, o sistema já adiciona automaticamente as 6 peças principais de assistência (Tela, Bateria, Câmera Traseira, Tampa Traseira, Conector de Carga e Câmera Frontal). Você pode ajustar o custo de cada peça quando desejar na aba "Peças de Reposição".
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Remoção Limpa de Aparelhos do Catálogo</span>
              </div>
              <p className="text-xs text-slate-600">
                Ao apagar um aparelho antigo ou descontinuado do catálogo, o sistema limpa automaticamente todas as capacidades e peças associadas a ele. Dessa forma, a tela de peças fica sempre limpa e organizada, mostrando somente os aparelhos que a loja realmente trabalha no momento.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'historico-atendimentos',
      title: '5. Histórico de Atendimentos e Segurança das Vendas',
      category: 'historico',
      categoryLabel: 'Histórico & Comprovante',
      icon: <History className="w-5 h-5 text-purple-600" />,
      summary: 'Como consultar atendimentos anteriores, emitir comprovantes e manter seus registros sempre protegidos.',
      content: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            A aba <strong>"Histórico"</strong> funciona como o arquivo digital de todas as negociações já concluídas no balcão:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-600" />
                Busca de Atendimentos
              </h4>
              <p className="text-xs text-slate-600">
                Localize qualquer atendimento digitando o nome do cliente, o modelo do celular, a data da avaliação ou filtrando pela grade de conservação.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Comprovante Detalhado
              </h4>
              <p className="text-xs text-slate-600">
                Clique no botão <strong>"Comprovante"</strong> para visualizar o recibo da negociação, com todos os valores e descontos explicados, pronto para imprimir ou enviar ao cliente.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-900">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Suas Avaliações Ficam Sempre Salvas e Protegidas</span>
            </div>
            <p className="leading-relaxed">
              Todas as avaliações salvas no sistema ficam guardadas com as informações completas da negociação: o nome do aparelho, a capacidade, a conservação, as peças trocadas e o valor final pago. Mesmo se a loja excluir um modelo de celular do catálogo no futuro, <strong>o histórico daquela negociação antiga continuará intacto, completo e visível</strong>, sem perder nenhum dado.
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
            <span>Central de Ajuda & Manual do Lojista</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Como Utilizar o Sistema de Avaliação
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Guia prático para o dia a dia da loja: como avaliar iPhones no balcão, identificar peças trocadas, calcular preços com segurança e consultar o histórico de atendimentos.
          </p>

          {/* Barra de Busca de Ajuda */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por assunto (ex: tela trocada, venda, desconto, grade B)..."
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* Filtros por Categoria & Ações de Expansão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todos os Assuntos' },
            { id: 'avaliacao', label: 'Avaliação & Peças' },
            { id: 'precos', label: 'Preços & Lucro' },
            { id: 'catalogo', label: 'Catálogo de Aparelhos' },
            { id: 'historico', label: 'Histórico de Atendimentos' },
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
            <p className="font-bold text-slate-700">Nenhum assunto encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente buscar com outras palavras como "bateria", "preço" ou "cliente".
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
              Consulte sempre o menu "Ajustes" para conferir os descontos atuais definidos para a Grade B e Grade C.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <span>iAvalia Pro • Sistema de Avaliação</span>
        </div>
      </div>
    </div>
  );
};
