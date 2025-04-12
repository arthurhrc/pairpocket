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
            <CardContent className="py-10 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Tudo pronto!</p>
                <p className="mt-1 text-sm text-gray-500">
                  Sua carteira compartilhada está configurada. Comecem a registrar as finanças juntos!
                </p>
              </div>
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
