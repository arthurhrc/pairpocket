"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Heart, LayoutDashboard, ArrowLeftRight, LayoutGrid, Target, LogOut, Menu, X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorias", icon: LayoutGrid },
  { href: "/goals", label: "Metas", icon: Target },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.push("/login"); return; }
        setUser(data);
      });
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const Sidebar = () => (
    <aside className="flex h-full flex-col bg-white border-r border-gray-100">
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Heart className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">PairPocket</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", active ? "text-indigo-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
              <p className="truncate text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      )}
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 flex h-full w-64 flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-gray-900">PairPocket</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
