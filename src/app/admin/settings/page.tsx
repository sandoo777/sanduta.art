import Link from "next/link";
import { Activity, Settings2, ShieldCheck } from "lucide-react";

export default function SettingsOverviewPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Settings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/settings/system"
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Settings2 className="h-6 w-6" />
            </div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">System Settings</h2>
              <span className="text-sm font-medium text-slate-500 transition group-hover:text-slate-900">
                Open →
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Configure company data, localization, and production cost parameters used across the platform.
            </p>
          </Link>

          <Link
            href="/admin/settings/audit-logs"
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Activity className="h-6 w-6" />
            </div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">Audit Logs</h2>
              <span className="text-sm font-medium text-slate-500 transition group-hover:text-slate-900">
                Open →
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Review login activity, security events, and system actions performed by users inside the admin area.
            </p>
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <ShieldCheck className="h-5 w-5" />
          Everything is organized into dedicated sections, keeping the main settings page clean and easier to navigate.
        </div>
      </div>
    </div>
  );
}
