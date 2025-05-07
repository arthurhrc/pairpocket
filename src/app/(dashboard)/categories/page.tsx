"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  const [submitting, setSubmitting] = useState(false);

  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editIcon, setEditIcon] = useState("📦");
  const [editColor, setEditColor] = useState("#6366f1");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string }>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit } } = useForm<{ name: string }>();

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  async function onSubmit({ name }: { name: string }) {
    setSubmitting(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon: selectedIcon, color: selectedColor }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat]);
      reset();
      setSelectedIcon("📦");
      setSelectedColor("#6366f1");
      setDialogOpen(false);
      toast({ title: "Categoria criada!", variant: "success" });
    } else {
      toast({ title: "Erro ao criar categoria", variant: "destructive" });
    }
    setSubmitting(false);
  }

  function openEdit(cat: Category) {
    setEditCat(cat);
    setEditIcon(cat.icon);
    setEditColor(cat.color);
    resetEdit({ name: cat.name });
  }

  async function onEditSubmit({ name }: { name: string }) {
    if (!editCat) return;
    setEditSubmitting(true);
    const res = await fetch(`/api/categories/${editCat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon: editIcon, color: editColor }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditCat(null);
      toast({ title: "Categoria atualizada!", variant: "success" });
    } else {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
    setEditSubmitting(false);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      toast({ title: "Categoria excluída", variant: "success" });
    } else {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
    setDeleteId(null);
  }

  const catToDelete = categories.find((c) => c.id === deleteId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
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
                <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9" role="group" aria-label="Selecionar ícone">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      aria-label={`Ícone ${icon}`}
                      aria-pressed={selectedIcon === icon}
                      className={`rounded-lg p-1.5 text-lg transition-colors ${selectedIcon === icon ? "bg-indigo-100 ring-2 ring-indigo-500" : "hover:bg-gray-100"}`}
                    >{icon}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar cor">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Cor ${color}`}
                      aria-pressed={selectedColor === color}
                      className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Criando..." : "Criar categoria"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="group relative transition-shadow hover:shadow-md" style={{ borderLeftColor: cat.color, borderLeftWidth: 4 }}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${cat.color}20` }}>
                {cat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{cat.name}</p>
                {cat.isDefault && <p className="text-xs text-gray-400">Padrão</p>}
              </div>
            </CardContent>
            <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
              <button
                onClick={() => openEdit(cat)}
                aria-label="Editar categoria"
                className="rounded p-1 text-gray-300 transition-colors hover:text-indigo-500"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {!cat.isDefault && (
                <button
                  onClick={() => setDeleteId(cat.id)}
                  aria-label="Excluir categoria"
                  className="rounded p-1 text-gray-300 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editCat} onOpenChange={(open) => { if (!open) setEditCat(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar categoria</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input placeholder="Ex: Academia" {...registerEdit("name", { required: true })} />
              {errorsEdit.name && <p className="text-xs text-red-500">Nome obrigatório</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Ícone</Label>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9" role="group" aria-label="Selecionar ícone">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setEditIcon(icon)}
                    aria-label={`Ícone ${icon}`}
                    aria-pressed={editIcon === icon}
                    className={`rounded-lg p-1.5 text-lg transition-colors ${editIcon === icon ? "bg-indigo-100 ring-2 ring-indigo-500" : "hover:bg-gray-100"}`}
                  >{icon}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar cor">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditColor(color)}
                    aria-label={`Cor ${color}`}
                    aria-pressed={editColor === color}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${editColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={editSubmitting}>
              {editSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              {catToDelete
                ? `Excluir a categoria "${catToDelete.icon} ${catToDelete.name}"? Esta ação não pode ser desfeita.`
                : "Esta ação não pode ser desfeita. A categoria será removida permanentemente."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
