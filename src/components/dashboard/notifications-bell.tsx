"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

interface AppNotification {
  id: string;
  type: "recurring" | "goal" | "overspending";
  title: string;
  message: string;
}

const typeIcon: Record<AppNotification["type"], string> = {
  recurring: "🔁",
  goal: "🎯",
  overspending: "⚠️",
};

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : []))
      .then(setNotifications)
      .catch(() => {});
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  const visible = notifications.filter((n) => !dismissed.has(n.id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {visible.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">Notificações</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          {visible.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Sem notificações</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {visible.map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 text-lg leading-none">{typeIcon[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                  <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-gray-500 shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
