'use client';

import { useEffect, useState } from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  createdAt: string;
  read: boolean;
}

export function NotificationsPanel() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/account/notifications?limit=10');
        const data = await response.json();
        const notifications = Array.isArray(data.notifications) ? data.notifications : [];
        setItems(notifications);
      } catch (_error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Procurement inbox</h2>
        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">{items.length}</span>
      </div>

      {loading ? <div className="text-sm text-slate-500">Loading notifications...</div> : null}

      {!loading && !items.length ? <div className="text-sm text-slate-500">No procurement notifications yet.</div> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link ?? '#'}
            className="block rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-800">{item.title}</span>
              {!item.read && <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            <div className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
