'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import type {
  MaterialPropertyListItem,
  MaterialPropertyListType,
} from '@/modules/settings/useMaterialPropertyLists';

type DialogMode = 'add' | 'edit' | null;

type MaterialPropertyQuickControlsProps = {
  type: MaterialPropertyListType;
  label: string;
  items: MaterialPropertyListItem[];
  selectedValue: string;
  mutating: boolean;
  error: string | null;
  addValue: (type: MaterialPropertyListType, value: string, enabled?: boolean) => Promise<unknown>;
  updateValue: (
    type: MaterialPropertyListType,
    id: string,
    patch: { value?: string; enabled?: boolean },
  ) => Promise<unknown>;
  deleteValue: (type: MaterialPropertyListType, id: string) => Promise<unknown>;
  clearError: () => void;
  onApplyValue: (value: string) => void;
};

export function MaterialPropertyQuickControls({
  type,
  label,
  items,
  selectedValue,
  mutating,
  error,
  addValue,
  updateValue,
  deleteValue,
  clearError,
  onApplyValue,
}: MaterialPropertyQuickControlsProps) {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [enabledDraft, setEnabledDraft] = useState(true);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const trimmedSelected = selectedValue.trim();
  const selectedEntry = trimmedSelected
    ? items.find((item) => item.value === trimmedSelected) ?? null
    : null;

  const openAddDialog = () => {
    setDialogMode('add');
    setNameDraft('');
    setEnabledDraft(true);
    setLocalMessage(null);
    clearError();
  };

  const openEditDialog = () => {
    if (!selectedEntry) return;
    setDialogMode('edit');
    setNameDraft(selectedEntry.value);
    setEnabledDraft(selectedEntry.enabled);
    setLocalMessage(null);
    clearError();
  };

  const closeDialog = () => {
    setDialogMode(null);
    setLocalMessage(null);
  };

  const handleSave = async () => {
    const value = nameDraft.trim();
    if (!value) {
      setLocalMessage('Numele este obligatoriu.');
      return;
    }

    try {
      if (dialogMode === 'add') {
        await addValue(type, value, enabledDraft);
        onApplyValue(value);
      } else if (dialogMode === 'edit' && selectedEntry) {
        await updateValue(type, selectedEntry.id, { value, enabled: enabledDraft });
        onApplyValue(value);
      }
      closeDialog();
    } catch {
      // Error is surfaced via the `error` prop.
    }
  };

  const handleToggleDisable = async () => {
    if (!selectedEntry) return;
    try {
      await updateValue(type, selectedEntry.id, { enabled: !selectedEntry.enabled });
    } catch {
      // Error is surfaced via the `error` prop.
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;

    if (selectedEntry.usageCount > 0) {
      setLocalMessage(`Nu poate fi șters: folosit de ${selectedEntry.usageCount} material(e). Poți dezactiva în schimb.`);
      return;
    }

    const confirmed = window.confirm(`Ștergi "${selectedEntry.value}"?`);
    if (!confirmed) return;

    try {
      await deleteValue(type, selectedEntry.id);
      onApplyValue('');
      setLocalMessage(null);
    } catch {
      // Error is surfaced via the `error` prop.
    }
  };

  return (
    <>
      <div className="mt-1.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={openAddDialog}
          disabled={mutating}
          title={`Adaugă ${label}`}
          aria-label={`Adaugă ${label}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={openEditDialog}
          disabled={mutating || !selectedEntry}
          title={`Redenumește ${label}`}
          aria-label={`Redenumește ${label}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => void handleToggleDisable()}
          disabled={mutating || !selectedEntry}
          title={selectedEntry && !selectedEntry.enabled ? `Activează ${label}` : `Dezactivează ${label}`}
          aria-label={selectedEntry && !selectedEntry.enabled ? `Activează ${label}` : `Dezactivează ${label}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          {selectedEntry && !selectedEntry.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={mutating || !selectedEntry}
          title={`Șterge ${label}`}
          aria-label={`Șterge ${label}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {localMessage && <p className="mt-1 text-xs text-amber-600">{localMessage}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <Modal isOpen={dialogMode !== null} onClose={closeDialog} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {dialogMode === 'add' ? `Adaugă ${label}` : `Editează ${label}`}
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <FormLabel htmlFor={`quick-property-name-${type}`}>Nume</FormLabel>
              <Input
                id={`quick-property-name-${type}`}
                value={nameDraft}
                onChange={(event) => {
                  if (localMessage) setLocalMessage(null);
                  if (error) clearError();
                  setNameDraft(event.target.value);
                }}
                placeholder={`Nume pentru ${label}`}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={enabledDraft}
                onChange={(event) => setEnabledDraft(event.target.checked)}
                className="h-4 w-4 rounded"
              />
              Activ
            </label>

            {dialogMode === 'edit' && selectedEntry && selectedEntry.usageCount > 0 ? (
              <p className="text-xs text-amber-700">
                Acest item este folosit de {selectedEntry.usageCount} materiale. Ștergerea va fi blocată până când usage count devine 0.
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Anulează
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleSave()}
              disabled={mutating || !nameDraft.trim()}
            >
              Salvează
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
