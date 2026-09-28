"use client";

import { useEffect, useState } from 'react';
import { ConsumeMaterialModal } from '@/components/jobs/ConsumeMaterialModal';
import { JobMaterialUsageTable } from '@/components/jobs/JobMaterialUsageTable';

export default function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const [jobId, setJobId] = useState<string>('');
  const [job, setJob] = useState<{ id: string; name?: string } | null>(null);
  const [materials, setMaterials] = useState<Array<{ id: string; name: string; unit?: string | null }>>([]);
  const [showConsumeModal, setShowConsumeModal] = useState(false);

  useEffect(() => {
    void params.then(({ jobId: resolvedJobId }) => {
      setJobId(resolvedJobId);
      fetch(`/api/admin/production/${resolvedJobId}`)
        .then(async (response) => {
          if (!response.ok) throw new Error('Failed to load job');
          const data = await response.json();
          setJob(data);
        })
        .catch(() => setJob(null));

      interface MaterialListItem {
        id: string;
        name: string;
        unit?: string | null;
        materialType?: string | null;
      }

      fetch('/api/admin/materials')
        .then(async (response) => {
          if (!response.ok) throw new Error('Failed to load materials');
          const payload = await response.json() as MaterialListItem[] | { items?: MaterialListItem[] };
          const loaded = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.items)
              ? payload.items
              : [];

          setMaterials(loaded.map((material) => ({
            id: material.id,
            name: material.name,
            unit: material.unit ?? material.materialType ?? 'unit',
          })));
        })
        .catch(() => setMaterials([]));
    });
  }, [params]);

  if (!job) {
    return <div className="p-6 text-sm text-slate-500">Loading job…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Production job</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{job.name ?? 'Job'}</h1>
          </div>
          <button type="button" onClick={() => setShowConsumeModal(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Consume material</button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Material usage history</h2>
          <JobMaterialUsageTable jobId={jobId} />
        </div>
      </div>

      <ConsumeMaterialModal
        jobId={jobId}
        isOpen={showConsumeModal}
        onClose={() => setShowConsumeModal(false)}
        materials={materials}
      />
    </div>
  );
}
