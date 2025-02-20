"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

const coupleSchema = z.object({
  action: z.enum(["create", "join"]),
  inviteCode: z.string().optional(),
});

type RegisterData = z.infer<typeof registerSchema>;
type CoupleData = z.infer<typeof coupleSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "couple">("account");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [coupleAction, setCoupleAction] = useState<"create" | "join">("create");
  const [joinCode, setJoinCode] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  async function onRegister(data: RegisterData) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Erro ao criar conta");
        return;
      }
      setStep("couple");
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function onCoupleSetup() {
    setLoading(true);
    setError("");
    try {
      if (coupleAction === "create") {
        const res = await fetch("/api/couples", { method: "POST" });
        if (!res.ok) { setError("Erro ao criar carteira"); return; }
        const data = await res.json();
        setInviteCode(data.inviteCode);
      } else {
        const res = await fetch("/api/couples/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode: joinCode }),
        });
        if (!res.ok) { const b = await res.json(); setError(b.error || "Código inválido"); return; }
        router.push("/dashboard");
      }
    } catch {
      setError("Erro ao configurar carteira.");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (step === "couple") {
    if (inviteCode) {
      return (
        <>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Carteira criada! 🎉</h1>
            <p className="mt-1 text-sm text-gray-500">Compartilhe o código com seu parceiro(a)</p>
          </div>
          <div className="mb-6 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-6 text-center">
            <p className="mb-2 text-xs text-indigo-600 font-medium uppercase tracking-wider">Código de convite</p>
            <p className="text-3xl font-bold tracking-widest text-indigo-700">{inviteCode}</p>
          </div>
          <Button onClick={copyCode} variant="outline" className="w-full mb-4">
            {copied ? <><Check className="h-4 w-4 text-green-600" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar código</>}
          </Button>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Ir para o Dashboard →
          </Button>
        </>
      );
    }

    return (
      <>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Configure sua carteira</h1>
          <p className="mt-1 text-sm text-gray-500">Crie uma nova ou entre em uma existente</p>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setCoupleAction("create")}
            className={`rounded-xl border-2 p-4 text-left transition-colors ${coupleAction === "create" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <p className="text-2xl mb-1">🏠</p>
            <p className="text-sm font-semibold text-gray-900">Criar nova</p>
            <p className="text-xs text-gray-500">Convide seu parceiro(a)</p>
          </button>
          <button
            onClick={() => setCoupleAction("join")}
            className={`rounded-xl border-2 p-4 text-left transition-colors ${coupleAction === "join" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <p className="text-2xl mb-1">🔗</p>
            <p className="text-sm font-semibold text-gray-900">Entrar em uma</p>
            <p className="text-xs text-gray-500">Use um código de convite</p>
          </button>
        </div>
        <div className={`mb-4 space-y-1.5 overflow-hidden transition-all duration-200 ${coupleAction === "join" ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
          <Label>Código de convite</Label>
          <Input
            placeholder="Ex: ABC123"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="tracking-widest text-center text-lg font-bold"
          />
        </div>
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>}
        <Button className="w-full" onClick={onCoupleSetup} disabled={loading || (coupleAction === "join" && !joinCode)}>
          {loading ? "Configurando..." : coupleAction === "create" ? "Criar carteira" : "Entrar na carteira"}
        </Button>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Crie sua conta</h1>
        <p className="mt-1 text-sm text-gray-500">Rápido e gratuito</p>
      </div>
      <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" placeholder="Seu nome" {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="voce@email.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="Mínimo 6 caracteres" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">Entrar</Link>
      </div>
    </>
  );
}
