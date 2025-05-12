"use client";

import { useState } from "react";
import { Check, Copy, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "choose" | "create" | "join" | "done";

interface Props {
  onComplete: () => void;
}

export function CoupleOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/couples", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar carteira");
      setInviteCode(data.inviteCode);
      setStep("create");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/couples/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Código inválido");
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Olá! Você foi convidado(a) para a nossa carteira compartilhada no PairPocket.\n\nUse o código: *${inviteCode}*\n\nBaixe o app e cadastre-se em: https://pairpocket.app`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  }

  const steps = ["Criar ou entrar", "Configurar", "Pronto!"];
  const stepIndex = step === "choose" ? 0 : step === "done" ? 2 : 1;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < stepIndex
                    ? "bg-indigo-600 text-white"
                    : i === stepIndex
                    ? "border-2 border-indigo-600 text-indigo-600"
                    : "border-2 border-gray-200 text-gray-300"
                }`}
              >
                {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === stepIndex ? "font-semibold text-gray-800" : "text-gray-400"}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Step: choose */}
        {step === "choose" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Vincule seu parceiro(a)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">
                Para começar, crie uma carteira compartilhada ou entre em uma existente.
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button className="w-full" onClick={handleCreate} disabled={loading}>
                {loading ? "Criando..." : "Criar nova carteira"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep("join")}>
                Entrar com código de convite
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: join */}
        {step === "join" && (
          <Card>
            <CardHeader>
              <CardTitle>Entrar com código</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Peça ao seu parceiro(a) o código de convite da carteira.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="join-code">Código de convite</Label>
                <Input
                  id="join-code"
                  placeholder="Ex: ABC12345"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("choose")}>Voltar</Button>
                <Button className="flex-1" onClick={handleJoin} disabled={loading || !joinCode.trim()}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: created — share code */}
        {step === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Carteira criada!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Compartilhe o código abaixo com seu parceiro(a) para que ele(a) possa entrar.
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3">
                <span className="flex-1 font-mono text-lg font-bold tracking-widest text-indigo-700">
                  {inviteCode}
                </span>
                <button
                  onClick={copyCode}
                  className="text-indigo-500 transition-colors hover:text-indigo-700"
                  aria-label="Copiar código"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={copyCode}>
                  {copied ? <><Check className="h-4 w-4 text-green-500 mr-1" />Copiado!</> : <><Copy className="h-4 w-4 mr-1" />Copiar código</>}
                </Button>
                <Button variant="outline" className="w-full text-green-700 border-green-300 hover:bg-green-50" onClick={shareWhatsApp}>
                  <svg className="h-4 w-4 mr-1 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Seu parceiro(a) pode entrar em "Entrar com código de convite" no cadastro.
              </p>
              <Button className="w-full" onClick={() => setStep("done")}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: done */}
        {step === "done" && (
          <Card>
            <CardContent className="py-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">Tudo pronto!</p>
                <p className="text-sm text-gray-500">
                  Vocês estão conectados. Aqui estão os próximos passos:
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: "💸", title: "Registre sua primeira transação", desc: "Anote uma despesa ou receita recente." },
                  { icon: "🎯", title: "Defina uma meta financeira", desc: "Ex: viagem, reserva de emergência." },
                  { icon: "📊", title: "Explore o dashboard", desc: "Veja gráficos e insights em tempo real." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={onComplete}>
                Ir para o dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
