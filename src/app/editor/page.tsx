'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseEditorUrl } from '@/lib/editor/generateEditorUrl';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

function EditorContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorParams, setEditorParams] = useState<any>(null);

  useEffect(() => {
    try {
      const params = parseEditorUrl(searchParams);
      setEditorParams(params);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse editor parameters');
      setIsLoading(false);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState text="Se încarcă editorul..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState title="Eroare" message={error} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-900">
      {/* Editor Header */}
      <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Editor Grafic</h1>
          {editorParams?.dimensions && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>
                {editorParams.dimensions.width} × {editorParams.dimensions.height}{' '}
                {editorParams.dimensions.unit}
              </span>
              {editorParams.bleed && (
                <span className="text-slate-400">| Bleed: {editorParams.bleed}mm</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            Anulează
          </button>
          <button
            onClick={() => {
              // TODO: Implement save and return
              alert('Salvare implementată în curând');
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Salvează și continuă
          </button>
        </div>
      </header>

      {/* Editor Canvas Area */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left Sidebar - Tools */}
        <aside className="w-16 border-r border-slate-700 bg-slate-800">
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Tool icons placeholder */}
            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 bg-slate-900 p-8">
          <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
            <div
              className="relative border-2 border-dashed border-slate-600 bg-white shadow-2xl"
              style={{
                width: editorParams?.dimensions
                  ? `${Math.min(editorParams.dimensions.width * 2, 800)}px`
                  : '800px',
                height: editorParams?.dimensions
                  ? `${Math.min(editorParams.dimensions.height * 2, 600)}px`
                  : '600px',
              }}
            >
              <div className="flex h-full items-center justify-center text-slate-400">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Canvas de lucru</p>
                  <p className="mt-1 text-sm">
                    Editorul grafic complet va fi implementat aici
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Layers & Properties */}
        <aside className="w-64 border-l border-slate-700 bg-slate-800">
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Layere</h3>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-center text-sm text-slate-400">
              Niciun layer adăugat
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingState text="Se încarcă editorul..." size="lg" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
