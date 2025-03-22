# PairPocket 💕

Sistema de controle financeiro para casais. Gerencie receitas, despesas e metas de economia juntos, de forma simples e transparente.

**Demo em produção:** [pairpocket.vercel.app](https://pairpocket.vercel.app)

## Features

- **Carteira compartilhada** — saldo unificado do casal com visibilidade individual
- **Categorias personalizáveis** — Moradia, Alimentação, Saúde e muito mais
- **Cards coloridos** — verde para receitas, vermelho para despesas
- **Gráficos interativos** — pizza por categoria + histórico de 6 meses
- **Metas de economia** — defina metas mensais e acompanhe o progresso
- **Split de despesas** — controle de quem pagou o quê
- **Convite por código** — vincule o parceiro(a) com um código de 6 dígitos
- **Despesas recorrentes** — marque gastos fixos mensais

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + Radix UI |
| Gráficos | Recharts |
| Backend | Next.js Route Handlers |
| Banco de dados | Prisma + PostgreSQL (Neon) |
| Deploy | Vercel |
| Testes | Vitest + Testing Library |

## Rodando localmente

```bash
# 1. Clone o repositório
git clone https://github.com/arthurhrc/pairpocket.git
cd pairpocket

# 2. Instale as dependências
yarn install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com sua DATABASE_URL do Neon (neon.tech)

# 4. Sincronize o banco de dados
yarn prisma db push

# 5. Inicie o servidor
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Credenciais de demonstração

| Usuário | E-mail | Senha |
|---|---|---|
| Ana Silva | [ana@demo.com](mailto:ana@demo.com) | demo123 |
| Carlos Oliveira | [carlos@demo.com](mailto:carlos@demo.com) | demo123 |

## Estrutura do projeto

```text
src/
├── app/
│   ├── (auth)/          # Login e cadastro
│   ├── (dashboard)/     # Dashboard, transações, categorias, metas
│   ├── api/             # Route Handlers (REST API)
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Componentes base (Button, Card, Dialog...)
│   └── dashboard/       # Gráficos e componentes específicos
├── lib/                 # Prisma, auth helpers, utils
└── types/               # Tipos TypeScript compartilhados
prisma/
├── schema.prisma        # Schema do banco
├── seed.ts              # Dados de demonstração
└── migrations/          # Histórico de migrações
tests/
└── unit/                # Testes unitários com Vitest
```

## Testes

```bash
yarn test           # Rodar todos os testes
yarn test:watch     # Modo watch
```

---

Desenvolvido por Arthur Carvalho como projeto de portfólio full stack.
