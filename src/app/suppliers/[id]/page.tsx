export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-wide text-indigo-600">Supplier</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Supplier details</h1>
        <p className="mt-4 text-sm text-slate-600">ID: {id}</p>
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Supplier detail view is available via the API layer and can be expanded with full CRUD wiring when a dedicated supplier form is introduced.
        </div>
      </div>
    </div>
  );
}
