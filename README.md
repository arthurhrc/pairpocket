# PairPocket 💕

Sistema de controle financeiro para casais. Gerencie receitas, despesas e metas de economia juntos, de forma simples e transparente.

**Demo em produção:** [pairpocket.vercel.app](https://pairpocket.vercel.app)

## Features

### Finanças compartilhadas
- **Carteira compartilhada** — saldo unificado do casal com visibilidade individual
- **Categorias personalizáveis** — Moradia, Alimentação, Saúde e muito mais
- **Gráficos interativos** — pizza por categoria + histórico de 6 meses
- **Metas de economia** — defina metas mensais com previsão de conclusão baseada na tendência
- **Split de despesas** — controle de quem pagou o quê
- **Despesas recorrentes** — marque gastos fixos mensais

### Análise e insights
- **Resumo financeiro mensal** — comparativo com mês anterior por categoria
- **Score de saúde financeira** — pontuação 0–100 baseada em taxa de economia e tendência
- **Alertas de gastos acima da média** — badge quando uma categoria supera a média dos últimos 3 meses
- **Comparativo mês a mês** — receitas, despesas e saldo lado a lado com variação percentual
- **Previsão de metas** — estimativa baseada na média de economia dos últimos meses

### Notificações e exportação
- **Notificações in-app** — alertas de despesas recorrentes pendentes e status de metas
- **Exportação CSV** — relatório mensal de transações com uma exportação de resumo por categoria

### Segurança
- **Rate limiting** — proteção contra brute force nos endpoints de autenticação (5 tentativas/min no login, 3 no cadastro)
- **Validação de ownership** — todas as operações em transações verificam se pertencem ao casal autenticado
- **Sanitização de inputs** — remoção de tags HTML e caracteres de controle nos campos de texto
- **Limite de tamanho de requisição** — payloads limitados a 16 KB nas rotas críticas
- **Validação de schema reforçada** — limites de tamanho e formato em todos os endpoints

### Onboarding
- **Fluxo guiado de convite** — stepper visual para criar carteira, compartilhar código e vincular parceiro(a)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
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
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com sua DATABASE_URL do Neon (neon.tech)

# 4. Sincronize o banco de dados
npx prisma db push

# 5. Inicie o servidor
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Credenciais de demonstração

| Usuário | E-mail | Senha |
|---|---|---|
| Ana Silva | ana@demo.com | demo123 |
| Carlos Oliveira | carlos@demo.com | demo123 |

## Estrutura do projeto

```text
src/
├── app/
│   ├── (auth)/          # Login e cadastro
│   ├── (dashboard)/     # Dashboard, transações, categorias, metas
│   ├── api/             # Route Handlers (REST API)
│   │   ├── auth/        # Login, registro, logout, sessão
│   │   ├── dashboard/   # Dados do dashboard com insights
│   │   ├── notifications/ # Notificações de recorrentes e metas
│   │   └── ...
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Componentes base (Button, Card, Dialog...)
│   ├── dashboard/       # Gráficos, insights, score, notificações
│   └── onboarding/      # Fluxo de convite de casal
├── lib/
│   ├── auth.ts          # Helpers de sessão
│   ├── export.ts        # Exportação CSV
│   ├── rate-limit.ts    # Rate limiting in-memory
│   ├── sanitize.ts      # Sanitização de inputs
│   └── utils.ts         # Utilitários
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
npm test           # Rodar todos os testes
npm run test:watch # Modo watch
```

---

Desenvolvido por Arthur Carvalho como projeto de portfólio full stack.
