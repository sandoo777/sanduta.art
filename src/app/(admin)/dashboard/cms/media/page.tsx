/**
 * Media Library - Upload și gestionare fișiere
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  Copy, 
  X,
  Folder,
  File
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCms, type MediaFile, type MediaFolder } from '@/modules/cms/useCms';

export default function CmsMediaPage() {
  const cms = useCms();
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadData = useCallback(async () => {
    const [mediaData, foldersData] = await Promise.all([
      cms.fetchMedia(currentFolder),
      cms.fetchMediaFolders(),
    ]);
    setMedia(mediaData);
    setFolders(foldersData);
  }, [cms, currentFolder]);

  const filterMedia = useCallback(() => {
    if (!searchTerm) {
      setFilteredMedia(media);
      return;
    }

    setFilteredMedia(
      media.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.originalName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [media, searchTerm]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    filterMedia();
  }, [filterMedia]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await cms.uploadMedia({ file, folderId: currentFolder });
    }

    await loadData();
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await cms.uploadMedia({ file, folderId: currentFolder });
    }

    await loadData();
  }, [currentFolder, cms]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Ștergi fișierul "${file.name}"?`)) return;
    
    const success = await cms.deleteMedia(file.id);
    if (success) {
      await loadData();
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copiat în clipboard!');
  };

  const stats = {
    total: media.length,
    images: media.filter(m => m.type === 'IMAGE').length,
    documents: media.filter(m => m.type === 'DOCUMENT').length,
    totalSize: media.reduce((sum, m) => sum + m.size, 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Media Library
          </h1>
          <p className="text-sm text-gray-600">
            Upload și gestionare imagini, PDF-uri și alte fișiere
          </p>
        </div>
        <label>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf"
          />
          <Button as="span">
            <Upload className="h-4 w-4 mr-2" />
            Upload Fișiere
          </Button>
        </label>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Caută fișiere..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Fișiere</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Imagini</div>
          <div className="text-2xl font-bold text-blue-600">{stats.images}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Documente</div>
          <div className="text-2xl font-bold text-orange-600">{stats.documents}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Spațiu Total</div>
          <div className="text-2xl font-bold text-gray-900">
            {(stats.totalSize / 1024 / 1024).toFixed(1)} MB
          </div>
        </Card>
      </div>

      {/* Folders (if any) */}
      {folders.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCurrentFolder(undefined)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                !currentFolder
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Folder className="h-4 w-4" />
              Toate
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentFolder === folder.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Folder className="h-4 w-4" />
                {folder.name} ({folder.fileCount})
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Drop Zone */}
      <Card
        className={`p-8 mb-6 border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">
            Drag & drop fișiere aici sau click pe butonul Upload
          </p>
          <p className="text-sm text-gray-500">
            Suportă imagini (JPG, PNG, GIF, WebP) și PDF-uri
          </p>
        </div>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((file) => (
          <Card
            key={file.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedFile(file)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {file.type === 'IMAGE' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="p-2">
              <div className="text-xs font-medium text-gray-900 truncate">
                {file.name}
              </div>
              <div className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <Card className="p-12 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm
              ? 'Niciun fișier nu corespunde căutării'
              : 'Niciun fișier încă'}
          </p>
        </Card>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDelete={() => {
            handleDelete(selectedFile);
            setSelectedFile(null);
          }}
          onCopyUrl={() => handleCopyUrl(selectedFile.url)}
        />
      )}
    </div>
  );
}

function FilePreviewModal({
  file,
  onClose,
  onDelete,
  onCopyUrl,
}: {
  file: MediaFile;
  onClose: () => void;
  onDelete: () => void;
  onCopyUrl: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {file.originalName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Preview */}
          <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden">
            {file.type === 'IMAGE' ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-auto max-h-96 object-contain"
              />
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Preview nu este disponibil</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-700">Nume Fișier</div>
              <div className="text-sm text-gray-900">{file.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Tip</div>
              <div className="text-sm text-gray-900">{file.mimeType}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Dimensiune</div>
              <div className="text-sm text-gray-900">
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
            {file.width && file.height && (
              <div>
                <div className="text-sm font-medium text-gray-700">Rezoluție</div>
                <div className="text-sm text-gray-900">
                  {file.width} × {file.height} px
                </div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">URL Public</div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={file.url}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button onClick={onCopyUrl} variant="secondary">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
            <Button variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Șterge
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Închide
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
