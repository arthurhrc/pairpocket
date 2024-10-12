"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toaster";
import type { Category } from "@/types";

const ICON_OPTIONS = ["🏠", "🛒", "🚗", "💊", "🎬", "📚", "💡", "👕", "🐾", "📦", "🎮", "✈️", "💰", "🍕", "🎁", "💪", "🏋️", "🎵"];
const COLOR_OPTIONS = ["#6366f1", "#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#22c55e", "#ef4444", "#6b7280"];

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("📦");
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string }>();

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  async function onSubmit({ name }: { name: string }) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon: selectedIcon, color: selectedColor }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat]);
      reset();
      setDialogOpen(false);
      toast({ title: "Categoria criada!", variant: "success" });
    } else {
      toast({ title: "Erro ao criar categoria", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-sm text-gray-500">Gerencie como seus gastos são organizados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nova categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar categoria</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input placeholder="Ex: Academia" {...register("name", { required: true })} />
                {errors.name && <p className="text-xs text-red-500">Nome obrigatório</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Ícone</Label>
                <div className="grid grid-cols-9 gap-1.5">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`rounded-lg p-1.5 text-lg transition-colors ${selectedIcon === icon ? "bg-indigo-100 ring-2 ring-indigo-500" : "hover:bg-gray-100"}`}
                    >{icon}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Criar categoria</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="transition-shadow hover:shadow-md" style={{ borderLeftColor: cat.color, borderLeftWidth: 4 }}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${cat.color}20` }}>
                {cat.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                {cat.isDefault && <p className="text-xs text-gray-400">Padrão</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
