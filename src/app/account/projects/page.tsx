'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { FolderOpen, Plus, Edit2, Trash2, Eye, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  productType: string;
  dimensions: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/account/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur vrei să ștergi acest proiect?')) return;

    try {
      const response = await fetch(`/api/account/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      await fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Eroare la ștergerea proiectului');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/account/projects/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to duplicate project');

      await fetchProjects();
    } catch (error) {
      console.error('Error duplicating project:', error);
      alert('Eroare la duplicarea proiectului');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
        <Link href="/editor">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Proiect Nou
          </Button>
        </Link>
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
          <Link href="/editor">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Creează Proiect
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
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
                  <Link href={`/editor/${project.id}`}>
                    <Button variant="primary" className="text-sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editează
                    </Button>
                  </Link>
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
                  <Link href={`/editor/${project.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full text-sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Vezi
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDuplicate(project.id)}
                    variant="ghost"
                    className="text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(project.id)}
                    variant="ghost"
                    className="text-red-600"
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
