'use client';

/**
 * Backup Dashboard - Admin Interface
 * 
 * Interfață pentru management backup:
 * - Vizualizare backup-uri (list, status, size)
 * - Create manual backup
 * - Restore backup (full/partial/granular)
 * - Download backup
 * - Monitor health
 * - View retention policy
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BackupMetadata, BackupStatus, BackupCategory } from '@/modules/backup/useBackupEngine';
import { logger } from '@/lib/logger';

interface BackupHealth {
  status: 'healthy' | 'warning' | 'critical';
  lastBackup?: Date;
  storageUsage?: number;
  failedBackups?: number;
  issues: string[];
}

export default function BackupDashboard() {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [health, setHealth] = useState<BackupHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  // Load backups and health on mount
  useEffect(() => {
    loadBackups();
    loadHealth();
  }, []);

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      logger.error('BackupDashboard', 'Failed to load backups', { error });
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      const res = await fetch('/api/admin/backups/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data.health);
      }
    } catch (error) {
      logger.error('BackupDashboard', 'Failed to load health', { error });
    }
  };

  const createBackup = async (category: BackupCategory) => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });

      if (res.ok) {
        await loadBackups();
        alert('Backup creat cu succes!');
      } else {
        const data = await res.json();
        alert(`Eroare: ${data.error || 'Failed to create backup'}`);
      }
    } catch (error) {
      logger.error('BackupDashboard', 'Failed to create backup', { error });
      alert('Eroare la crearea backup-ului');
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (backupId: string, mode: 'FULL' | 'DATABASE_ONLY' | 'FILES_ONLY') => {
    if (!confirm(`Sigur vrei să restorezi acest backup în mod ${mode}? Această operațiune poate suprascrie date existente.`)) {
      return;
    }

    setRestoring(backupId);
    try {
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId, mode }),
      });

      if (res.ok) {
        alert('Backup restabilit cu succes!');
      } else {
        const data = await res.json();
        alert(`Eroare: ${data.error || 'Failed to restore backup'}`);
      }
    } catch (error) {
      logger.error('BackupDashboard', 'Failed to restore backup', { error });
      alert('Eroare la restabilirea backup-ului');
    } finally {
      setRestoring(null);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const res = await fetch(`/api/admin/backups/${backupId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${backupId}.tar.gz`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Eroare la descărcarea backup-ului');
      }
    } catch (error) {
      logger.error('BackupDashboard', 'Failed to download backup', { error });
      alert('Eroare la descărcarea backup-ului');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Sigur vrei să ștergi acest backup? Această acțiune este ireversibilă.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/backups/${backupId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadBackups();
        alert('Backup șters cu succes');
      } else {
        alert('Eroare la ștergerea backup-ului');
      }
    } catch (error) {
      logger.error('BackupDashboard', 'Failed to delete backup', { error });
      alert('Eroare la ștergerea backup-ului');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup & Recovery</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestionează backup-uri și restaurează date
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => loadBackups()}
            disabled={creating}
          >
            🔄 Reîmprospătează
          </Button>
          <Button
            variant="primary"
            onClick={() => createBackup(BackupCategory.FULL)}
            loading={creating}
          >
            ➕ Backup Manual
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {health && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">System Health</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <Badge value={health.status.toUpperCase()} />
                </div>
                {health.lastBackup && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Last Backup:</span>
                    <span>{formatDate(health.lastBackup)}</span>
                  </div>
                )}
                {health.storageUsage !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Storage:</span>
                    <span>{health.storageUsage.toFixed(2)}%</span>
                    {health.storageUsage > 80 && (
                      <Badge value="HIGH" />
                    )}
                  </div>
                )}
              </div>
            </div>
            {health.issues.length > 0 && (
              <div className="text-right">
                <h3 className="font-semibold text-red-600 mb-1">Issues:</h3>
                <ul className="text-sm space-y-1">
                  {health.issues.map((issue, idx) => (
                    <li key={idx} className="text-red-600">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">📊 Database Backup</h3>
          <p className="text-sm text-gray-600 mb-3">
            Creează backup doar pentru baza de date PostgreSQL
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => createBackup(BackupCategory.DATABASE)}
            disabled={creating}
            className="w-full"
          >
            Create DB Backup
          </Button>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">📁 Files Backup</h3>
          <p className="text-sm text-gray-600 mb-3">
            Creează backup pentru fișiere (uploads, media, etc.)
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => createBackup(BackupCategory.FILES)}
            disabled={creating}
            className="w-full"
          >
            Create Files Backup
          </Button>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">⚙️ Config Backup</h3>
          <p className="text-sm text-gray-600 mb-3">
            Creează backup pentru configurări (users, products, etc.)
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => createBackup(BackupCategory.CONFIG)}
            disabled={creating}
            className="w-full"
          >
            Create Config Backup
          </Button>
        </Card>
      </div>

      {/* Backups List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Backup History</h2>
        {backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nu există backup-uri disponibile
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{backup.category}</h3>
                      <Badge value={backup.status} />
                      {backup.encrypted && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          🔒 Encrypted
                        </span>
                      )}
                      {backup.compressed && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          📦 Compressed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>ID: <code className="text-xs">{backup.id}</code></div>
                      <div>Created: {formatDate(backup.createdAt)}</div>
                      {backup.size && <div>Size: {formatSize(backup.size)}</div>}
                      {backup.duration && <div>Duration: {(backup.duration / 1000).toFixed(2)}s</div>}
                    </div>
                  </div>

                  {backup.status === BackupStatus.COMPLETED && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => restoreBackup(backup.id, 'FULL')}
                        loading={restoring === backup.id}
                      >
                        🔄 Restore Full
                      </Button>
                      {backup.category === BackupCategory.DATABASE && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => restoreBackup(backup.id, 'DATABASE_ONLY')}
                          loading={restoring === backup.id}
                        >
                          🗄️ Restore DB
                        </Button>
                      )}
                      {backup.category === BackupCategory.FILES && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => restoreBackup(backup.id, 'FILES_ONLY')}
                          loading={restoring === backup.id}
                        >
                          📁 Restore Files
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadBackup(backup.id)}
                      >
                        ⬇️ Download
                        </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteBackup(backup.id)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  )}
                </div>

                {backup.error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300">
                    <strong>Error:</strong> {backup.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Retention Policy Info */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">📋 Retention Policy</h3>
        <ul className="text-sm space-y-1">
          <li>• Daily backups: Kept for <strong>30 days</strong></li>
          <li>• Weekly backups: Kept for <strong>84 days</strong> (12 weeks)</li>
          <li>• Monthly backups: Kept for <strong>365 days</strong> (1 year)</li>
          <li>• Tagged versions (STABLE, MILESTONE): Kept indefinitely</li>
        </ul>
      </Card>
    </div>
  );
}
