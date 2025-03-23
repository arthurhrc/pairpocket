import Link from "next/link";
import {
  Heart, Users, LayoutGrid, Target, BarChart3,
  ArrowLeftRight, FileText, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel";


const features = [
  { icon: Users, title: "Carteira Compartilhada", desc: "Um saldo único para o casal, com visibilidade individual de cada um." },
  { icon: LayoutGrid, title: "Categorias Inteligentes", desc: "Organize gastos por Moradia, Alimentação, Saúde e muito mais." },
  { icon: Target, title: "Metas de Economia", desc: "Defina quanto querem guardar no mês e acompanhe o progresso." },
  { icon: BarChart3, title: "Gráficos Interativos", desc: "Visualize receitas e despesas mês a mês de forma clara." },
  { icon: ArrowLeftRight, title: "Split de Despesas", desc: "Divida gastos 50/50 ou proporcional à renda de cada um." },
  { icon: FileText, title: "Relatórios Mensais", desc: "Histórico completo com filtros por período e categoria." },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PairPocket</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-20 md:py-32">
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <Badge className="mb-4 inline-flex">✨ 100% gratuito para casais</Badge>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
                Finanças do casal,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  juntos e no controle
                </span>
              </h1>
              <p className="mb-8 text-lg text-gray-600">
                Chega de planilha confusa e desentendimentos. O PairPocket une as finanças do casal em um só lugar.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/register">Começar grátis →</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Ver demonstração</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Saldo do casal</p>
                    <p className="text-3xl font-bold text-gray-900">R$ 4.280,00</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                    <Heart className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-1.5 text-green-700">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium">Receitas</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-green-700">R$ 8.500</p>
                  </div>
                  <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3">
                    <div className="flex items-center gap-1.5 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-xs font-medium">Despesas</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-red-600">R$ 4.220</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { desc: "Mercado", cat: "🛒 Alimentação", val: "- R$ 380", color: "text-red-600" },
                    { desc: "Salário Ana", cat: "💰 Receita", val: "+ R$ 4.500", color: "text-green-600" },
                    { desc: "Netflix", cat: "🎬 Lazer", val: "- R$ 55", color: "text-red-600" },
                  ].map((tx) => (
                    <div key={tx.desc} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{tx.desc}</p>
                        <p className="text-xs text-gray-400">{tx.cat}</p>
                      </div>
                      <span className={`font-semibold ${tx.color}`}>{tx.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl bg-indigo-200/50" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Tudo que um casal precisa</h2>
            <p className="mt-4 text-lg text-gray-500">Ferramentas simples que resolvem problemas reais no dia a dia financeiro.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                    <f.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Casais que transformaram suas finanças</h2>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Comece hoje mesmo, é grátis</h2>
          <p className="mb-8 text-lg text-indigo-100">
            Crie sua conta, convide seu parceiro(a) e comece a controlar as finanças juntos em menos de 2 minutos.
          </p>
          <Button size="lg" className="border-white bg-white text-indigo-700 font-semibold hover:bg-indigo-50" asChild>
            <Link href="/register">Criar conta gratuita →</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-400">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-gray-700">PairPocket</span>
          </div>
          <p>© {new Date().getFullYear()} PairPocket. Feito com carinho para casais organizados.</p>
        </div>
      </footer>
    </div>
  );
}
