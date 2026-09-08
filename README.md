# iAvalia Pro — Sistema Web de Avaliação de iPhones Usados

Sistema completo e profissional desenvolvido para lojas e assistências técnicas que compram iPhones usados no balcão. O sistema calcula automaticamente o valor justo de compra com base no modelo, capacidade de armazenamento, estado de conservação (Grade A, B, C) e peças danificadas que precisarão ser substituídas pela loja.

Todos os dados, preços e histórico são **persistidos de verdade em banco de dados SQLite via Prisma ORM**.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, tsx.
- **Banco de Dados**: SQLite com Prisma ORM (arquivo persistente em disco em `server/prisma/dev.db`).
- **Arquitetura**: Separação clara de responsabilidades com regras de negócio e cálculo centralizados no backend.

---

## 📱 Catálogo de Aparelhos Cadastrados (Seed)

O sistema já vem populado com **todos os 20 modelos solicitados**, do iPhone 12 ao iPhone 16 Pro Max, com suas capacidades e preços-base de compra de mercado:

| Família | Modelos Cadastrados | Capacidades Suportadas |
| :--- | :--- | :--- |
| **iPhone 12** | iPhone 12 mini, iPhone 12, iPhone 12 Pro, iPhone 12 Pro Max | 64GB, 128GB, 256GB, 512GB |
| **iPhone 13** | iPhone 13 mini, iPhone 13, iPhone 13 Pro, iPhone 13 Pro Max | 128GB, 256GB, 512GB, 1TB |
| **iPhone 14** | iPhone 14, iPhone 14 Plus, iPhone 14 Pro, iPhone 14 Pro Max | 128GB, 256GB, 512GB, 1TB |
| **iPhone 15** | iPhone 15, iPhone 15 Plus, iPhone 15 Pro, iPhone 15 Pro Max | 128GB, 256GB, 512GB, 1TB |
| **iPhone 16** | iPhone 16, iPhone 16 Plus, iPhone 16 Pro, iPhone 16 Pro Max | 128GB, 256GB, 512GB, 1TB |

*Nota: Pelo painel de administração é possível adicionar novas capacidades, novos modelos e editar qualquer preço a qualquer momento.*

---

## 📐 Regras de Negócio & Memória de Cálculo

### 1. Grades de Conservação
| Grade | Critério | Ajuste no Valor de Compra |
| :--- | :--- | :--- |
| **Grade A** | Melhor estado possível, sem marcas relevantes e boa saúde de bateria (> 85%) | **Valor Base** (Grade A) |
| **Grade B** | Algumas marcas de uso e/ou bateria com 85% ou menos | **Grade A − Desconto B** *(padrão: R$ 100)* |
| **Grade C** | Muitas marcas de uso ou possui peça(s) trocada(s) / não originais | **Grade A − Desconto C** *(padrão: R$ 200)* |

> ⚙️ **Descontos Configuráveis**: Os descontos de R$ 100 (Grade B) e R$ 200 (Grade C) **não estão fixos no código**! Eles ficam salvos na tabela `GradeSetting` e podem ser alterados a qualquer momento na aba **Configurações & Preços**.

### 2. Peça Trocada = Grade C Automático
- Existe um seletor em destaque: **"Aparelho já possui mensagem de peça trocada / peça não original"**.
- Ao marcar essa opção, o sistema classifica **imediatamente o aparelho como Grade C** e **trava** a seleção de grade, exibindo aviso explicativo.

### 3. Abatimento por Troca de Peça
- Cada modelo de iPhone tem custos específicos para suas peças de reposição (Bateria, Tela/Display, Câmera Traseira, Conector de Carga, Tampa Traseira, Face ID/Câmera Frontal).
- O avaliador pode marcar múltiplas peças a serem trocadas. O sistema soma os custos individuais dessas peças e subtrai do valor.

### 4. Fórmula Geral de Compra
$$\text{valor\_final} = \max\Big(0,\ \text{preço\_grade\_selecionada} - \sum \text{custos\_peças\_marcadas}\Big)$$

Onde:
$$\text{preço\_grade\_selecionada} = \text{preço\_Grade\_A} - \text{desconto\_da\_grade}$$

---

## 💻 Estrutura do Projeto

```
iphone-evaluator/
├── package.json              # Scripts para rodar cliente e servidor juntos
├── README.md                 # Esta documentação
├── server/                   # Backend Node.js + Express + Prisma + SQLite
│   ├── prisma/
│   │   ├── schema.prisma     # Schema do banco de dados relacional
│   │   ├── seed.ts           # Script para popular os 20 modelos e peças
│   │   └── dev.db            # Arquivo SQLite persistente
│   ├── src/
│   │   ├── index.ts          # Inicialização do Express
│   │   ├── prisma.ts         # Singleton do Prisma Client
│   │   ├── services/
│   │   │   └── pricing.service.ts # Regras de negócio e cálculo centralizado
│   │   ├── routes/
│   │   │   ├── models.routes.ts      # CRUD de modelos e capacidades
│   │   │   ├── settings.routes.ts    # Configurações de desconto de grade
│   │   │   ├── parts.routes.ts       # Gestão de peças por modelo
│   │   │   └── evaluations.routes.ts # Cálculo e histórico de avaliações
│   │   └── tests/
│   │       └── calculate.test.ts     # Testes automatizados de regras
└── client/                   # Frontend React 19 + TypeScript + Tailwind CSS
    ├── src/
    │   ├── App.tsx           # Componente raiz e abas
    │   ├── types.ts          # Definições de tipos TypeScript
    │   ├── services/
    │   │   └── api.ts        # Integração HTTP com a API
    │   └── components/
    │       ├── Header.tsx             # Barra superior e navegação
    │       ├── EvaluationForm.tsx     # Formulário de avaliação de balcão
    │       ├── CalculationSummary.tsx # Memória de cálculo em tempo real
    │       ├── AdminPricing.tsx       # Gestão de preços, grades e peças
    │       ├── EvaluationHistory.tsx  # Histórico persistente com busca
    │       └── ReceiptModal.tsx       # Comprovante/recibo com impressão
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18 ou superior)
- npm (v9 ou superior)

### 1. Clonar ou Acessar a Pasta
```bash
cd /Users/gabrit_farias/.gemini/antigravity/scratch/iphone-evaluator
```

### 2. Instalar Dependências (se ainda não instaladas)
```bash
npm install
cd server && npm install && cd ../client && npm install && cd ..
```

### 3. Popular o Banco de Dados (Seed Inicial)
Para criar e popular o banco SQLite com todos os 20 modelos e peças:
```bash
npm run seed
```

### 4. Executar os Testes Automatizados
Para verificar todas as regras de negócio:
```bash
npm run test
```

### 5. Iniciar o Sistema (Frontend + Backend Concorrentes)
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

---

## 🧭 Telas do Sistema

1. **📱 Nova Avaliação (Balcão de Compra)**:
   - Filtros rápidos por série (iPhone 12, 13, 14, 15, 16).
   - Seleção de modelo e capacidade.
   - Checkbox de alerta de peça trocada com bloqueio para Grade C.
   - Seleção de Grade (A, B, C) com cards explicativos de cada critério.
   - Checklist de peças com custo abatido discriminado.
   - Card fixo lateral com **Memória de Cálculo passo a passo em tempo real** e destaque do valor final.
   - Botão para salvar a avaliação no banco de dados e emitir comprovante/recibo.

2. **📜 Histórico de Avaliações**:
   - Tabela com todas as avaliações salvas no SQLite.
   - Filtro de busca por nome do cliente, modelo ou anotação.
   - Exibição de data/hora, modelo, grade, flag de peça trocada, peças abatidas e valor final.
   - Botão para **abrir o comprovante detalhado** com opção de impressão.
   - Botão para excluir avaliação.

3. **⚙️ Configurações & Preços (Painel Administrativo)**:
   - **Preços Grade A**: Edição inline de preços base de qualquer capacidade e botão para adicionar novas capacidades aos modelos.
   - **Descontos de Grade**: Edição dos descontos em R$ das Grades B e C salvos diretamente no SQLite.
   - **Peças por Modelo**: Gestão de peças de reposição (adicionar, editar custo, excluir) por modelo específico de iPhone.
