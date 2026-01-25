'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOrders } from '@/modules/orders/useOrders';
import { toast } from 'sonner';
import { Trash2, Plus, FileText, Download } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface OrderFile {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

interface OrderFilesManagerProps {
  orderId: string;
  files: OrderFile[];
  onFilesChanged?: () => void;
}

export function OrderFilesManager({
  orderId,
  files,
  onFilesChanged,
}: OrderFilesManagerProps) {
  const { confirm, Dialog } = useConfirmDialog();
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    name: '',
  });

  const { addFile, deleteFile } = useOrders();

  const handleAddFile = async () => {
    if (!formData.url || !formData.name) {
      toast.error('Completează toți câmpurile');
      return;
    }

    setIsAddingFile(true);
    const result = await addFile(orderId, {
      url: formData.url,
      name: formData.name,
    });

    if (result.success) {
      toast.success('Fișier adăugat cu succes');
      setFormData({ url: '', name: '' });
      setShowAddForm(false);
      onFilesChanged?.();
    } else {
      toast.error('Eroare: ' + result.error);
    }
    setIsAddingFile(false);
  };

  const handleDeleteFile = async (fileId: string) => {
    await confirm({
      title: 'Șterge fișier',
      message: 'Ștergi acest fișier?',
      variant: 'danger',
      onConfirm: async () => {
        const result = await deleteFile(orderId, fileId);
        if (result.success) {
          toast.success('Fișier șters cu succes');
          onFilesChanged?.();
        } else {
          toast.error('Eroare: ' + result.error);
        }
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fișiere ({files.length})</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg
            text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Adaugă fișier
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL fișier
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com/file.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume fișier
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ex: invoice.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddFile}
              disabled={isAddingFile}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium
                hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isAddingFile ? 'Se adaugă...' : 'Adaugă'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({ url: '', name: '' });
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium
                hover:bg-gray-400 transition-colors"
            >
              Anulează
            </button>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Niciun fișier"
          description="Încarcă fișiere pentru această comandă"
        />
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200
                rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText size={20} className="text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(file.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog />
    </div>
  );
}
