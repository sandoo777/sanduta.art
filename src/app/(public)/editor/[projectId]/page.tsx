'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/modules/editor/editorStore';
import EditorLayout from '@/components/public/editor/EditorLayout';
import EditorTopbar from '@/components/public/editor/EditorTopbar';
import EditorSidebarLeft from '@/components/public/editor/EditorSidebarLeft';
import EditorCanvas from '@/components/public/editor/EditorCanvas';
import EditorSidebarRight from '@/components/public/editor/EditorSidebarRight';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditorPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const { setProject } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create new project if ID is 'new'
        if (projectId === 'new') {
          const response = await fetch('/api/editor/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Proiect Nou',
              elements: [],
              canvas: { width: 800, height: 600 },
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create project');
          }
          
          const newProject = await response.json();
          setProject(newProject);
          
          // Redirect to the new project URL
          router.replace(`/editor/${newProject.id}`);
        } else {
          // Load existing project
          const response = await fetch(`/api/editor/projects/${projectId}`);
          
          if (response.status === 404) {
            setError('Proiect negăsit');
            return;
          }
          
          if (!response.ok) {
            throw new Error('Failed to load project');
          }
          
          const project = await response.json();
          setProject(project);
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Eroare la încărcarea proiectului');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, setProject, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă proiectul...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Proiectul nu a putut fi încărcat</p>
          <button
            onClick={() => router.push('/editor/new')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Creează proiect nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      topbar={<EditorTopbar />}
      leftSidebar={<EditorSidebarLeft />}
      canvas={<EditorCanvas />}
      rightSidebar={<EditorSidebarRight />}
    />
  );
}
