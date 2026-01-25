'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { FolderOpen, Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { AuthLink } from '@/components/common/links/AuthLink';
import Image from 'next/image';

export interface Project {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  productType: string;
  dimensions: string;
}

interface Props {
  projects: Project[];
}

export default function ProjectsClient({ projects: initialProjects }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur vrei să ștergi acest proiect?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/account/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      // Remove from local state
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Eroare la ștergerea proiectului');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      const response = await fetch(`/api/account/projects/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to duplicate project');

      // Refresh the page to show new project
      window.location.reload();
    } catch (error) {
      console.error('Error duplicating project:', error);
      alert('Eroare la duplicarea proiectului');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleExport = async (id: string, format: 'png' | 'pdf') => {
    try {
      const response = await fetch(`/api/account/projects/${id}/export?format=${format}`);
      
      if (!response.ok) throw new Error('Failed to export project');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Eroare la exportarea proiectului');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proiectele Mele</h1>
          <p className="text-gray-600 mt-2">
            Gestionează proiectele create în editorul vizual
          </p>
        </div>
        <AuthLink href="/editor">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Proiect Nou
          </Button>
        </AuthLink>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Niciun proiect salvat
          </h3>
          <p className="text-gray-600 mb-4">
            Creează primul tău proiect în editorul vizual
          </p>
          <AuthLink href="/editor">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Creează Proiect
            </Button>
          </AuthLink>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group relative">
              {deletingId === project.id && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                  <LoadingState text="Se șterge..." />
                </div>
              )}
              
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100">
                {project.thumbnail ? (
                  <Image
                    src={project.thumbnail}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <AuthLink href={`/editor/${project.id}`}>
                    <Button variant="primary" className="text-sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editează
                    </Button>
                  </AuthLink>
                  <Button
                    onClick={() => handleExport(project.id, 'png')}
                    variant="secondary"
                    className="text-sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">
                  {project.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>Tip: {project.productType}</p>
                  <p>Dimensiuni: {project.dimensions}</p>
                  <p className="text-xs">
                    Actualizat: {new Date(project.updatedAt).toLocaleDateString('ro-RO')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <AuthLink href={`/editor/${project.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full text-sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Vezi
                    </Button>
                  </AuthLink>
                  <Button
                    onClick={() => handleDuplicate(project.id)}
                    variant="ghost"
                    className="text-gray-600"
                    disabled={duplicatingId === project.id}
                  >
                    {duplicatingId === project.id ? (
                      <LoadingState text="" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDelete(project.id)}
                    variant="ghost"
                    className="text-red-600"
                    disabled={deletingId === project.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
