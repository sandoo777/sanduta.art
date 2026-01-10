import React from 'react';

export interface OrderFile {
  id: string;
  name: string;
  url: string;
  type: 'preview' | 'final' | 'supplementary';
}

interface OrderFilesProps {
  files: OrderFile[];
  isAdmin?: boolean;
  onReplaceFile?: (fileId: string, file: File) => void;
}

export const OrderFiles: React.FC<OrderFilesProps> = ({ files, isAdmin, onReplaceFile }) => (
  <div className="space-y-4">
    {files.map((file) => (
      <div key={file.id} className="flex items-center gap-4 border-b pb-2">
        <div className="flex-1">
          <div className="font-medium">
            {file.type === 'preview' && 'Machetă'}
            {file.type === 'final' && 'Fișier final'}
            {file.type === 'supplementary' && 'Fișier suplimentar'}
          </div>
          <a href={file.url} target="_blank" rel="noopener" className="text-blue-600 underline">
            {file.name}
          </a>
        </div>
        <a href={file.url} download className="btn btn-sm btn-outline-primary">Descarcă</a>
        {isAdmin && onReplaceFile && (
          <label className="btn btn-sm btn-outline-secondary cursor-pointer">
            Înlocuiește fișierul
            <input type="file" hidden onChange={e => {
              if (e.target.files && e.target.files[0]) onReplaceFile(file.id, e.target.files[0]);
            }} />
          </label>
        )}
      </div>
    ))}
  </div>
);
