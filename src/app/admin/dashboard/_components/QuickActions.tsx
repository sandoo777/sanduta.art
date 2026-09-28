import Link from 'next/link';

const actions = [
  {
    title: 'Inventar',
    description: 'Monitorizează stocurile și consumurile.',
    href: '/admin/inventory',
    icon: '📦',
    accent: 'from-emerald-500 to-green-500',
  },
  {
    title: 'Comenzi Achiziții',
    description: 'Gestionează comenzile de aprovizionare.',
    href: '/admin/purchase-orders',
    icon: '🧾',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    title: 'Furnizori',
    description: 'Administrează furnizorii și testele de conectare.',
    href: '/admin/suppliers',
    icon: '🚚',
    accent: 'from-amber-500 to-orange-500',
  },
] as const;

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${action.accent} text-xl text-white shadow-sm`}>
            <span aria-hidden="true">{action.icon}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">{action.title}</h3>
            <p className="text-sm text-slate-600">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
