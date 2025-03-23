"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Arthur e Barbara",
    initials: ["A", "B"],
    role: "Namorando há 2 anos",
    text: "A gente sempre esquecia quem tinha pago o quê. Com o PairPocket acabou essa confusão — abrimos o app e está tudo ali, claro e organizado. Economizamos R$ 800 só no primeiro mês.",
  },
  {
    name: "William e Priscila",
    initials: ["W", "P"],
    role: "Morando juntos há 1 ano",
    text: "Dividir as contas era sempre um assunto delicado. O split do PairPocket fez isso desaparecer. Agora cada um sabe exatamente o que paga e a gente foca no que realmente importa.",
  },
  {
    name: "Gabriel e Gabriela",
    initials: ["G", "G"],
    role: "Casados há 4 anos",
    text: "Usávamos planilha e era uma bagunça. Migramos pro PairPocket e em três meses conseguimos juntar para reforma da cozinha. Os gráficos por categoria mostraram onde estávamos gastando demais.",
  },
  {
    name: "Pedro e Giovana",
    initials: ["P", "G"],
    role: "Noivos se planejando",
    text: "Criamos uma meta para o casamento e ficamos vendo o valor crescer todo mês. O PairPocket nos deixa na mesma página e torna o planejamento muito menos estressante do que imaginávamos.",
  },
];

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % testimonials.length), []);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  const t = testimonials[current];

  return (
    <div
      className="relative mx-auto max-w-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Card className="bg-white shadow-md">
        <CardContent className="px-10 py-8">
          <div className="mb-4 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="mb-6 text-base leading-relaxed text-gray-600">"{t.text}"</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {t.initials.map((initial, i) => (
                <Avatar key={i} className="h-9 w-9 border-2 border-white">
                  <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-400">{t.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <button
        onClick={prev}
        className="absolute -left-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>
      <button
        onClick={next}
        className="absolute -right-5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
        aria-label="Próximo"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      <div className="mt-5 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-indigo-600" : "w-2 bg-gray-300"}`}
            aria-label={`Ir para depoimento ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
