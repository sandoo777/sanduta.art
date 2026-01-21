"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui";
import { useCustomers, type CustomerNote } from "@/modules/customers/useCustomers";
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface CustomerNotesProps {
  customerId: number;
  notes: CustomerNote[];
  onUpdate: () => void;
}

export default function CustomerNotes({
  customerId,
  notes,
  onUpdate,
}: CustomerNotesProps) {
  const { confirm, Dialog } = useConfirmDialog();
  const { addNote, deleteNote, loading } = useCustomers();
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addNote(customerId, newNote.trim());
      setNewNote("");
      setIsAdding(false);
      onUpdate();
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Eroare la adăugarea notei");
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: number) => {
    await confirm({
      title: 'Șterge notă',
      message: 'Sigur vrei să ștergi această notă?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteNote(customerId, noteId);
          onUpdate();
        } catch (err) {
          console.error("Error deleting note:", err);
          alert("Eroare la ștergerea notei");
        }
      }
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adaugă Notă
        </button>
      )}

      {/* Add Note Form */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Scrie nota aici..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote("");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Anulează
            </button>
            <button
              onClick={handleAddNote}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading || !newNote.trim()}
            >
              {loading ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
          title="Nu există note"
          description="Adaugă prima notă pentru acest client"
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Note Content */}
              <p className="text-gray-800 whitespace-pre-wrap mb-3">{note.content}</p>

              {/* Note Meta */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>
                    {note.createdBy?.name || note.createdBy?.email || "Unknown"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{formatDate(note.createdAt)}</span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Șterge nota"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
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
