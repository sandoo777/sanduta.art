/**
 * Theme Publishing Hook
 * Gestionare salvare, publicare și versioning tema
 */

import { useState, useCallback } from 'react';
import type { ThemeConfig } from '@/types/theme';

export interface ThemeVersion {
  id: string;
  version: number;
  theme: ThemeConfig;
  createdAt: Date;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
}

export interface UseThemePublishingReturn {
  // State
  isDraft: boolean;
  isPublished: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isRollingBack: boolean;
  hasChanges: boolean;
  lastSaved: Date | null;
  versions: ThemeVersion[];
  
  // Actions
  saveDraft: (theme: ThemeConfig) => Promise<boolean>;
  publishTheme: () => Promise<boolean>;
  rollbackTheme: (versionId: string) => Promise<boolean>;
  loadVersions: () => Promise<void>;
  compareVersions: (v1: string, v2: string) => Promise<unknown>;
  resetTheme: () => Promise<boolean>;
}

export function useThemePublishing(): UseThemePublishingReturn {
  const [isDraft, setIsDraft] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [versions, setVersions] = useState<ThemeVersion[]>([]);

  /**
   * Salvează tema ca draft
   */
  const saveDraft = useCallback(async (theme: ThemeConfig): Promise<boolean> => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const data = await response.json();
      setLastSaved(new Date(data.updatedAt));
      setHasChanges(false);
      setIsDraft(true);
      
      return true;
    } catch (error) {
      console.error('Save draft error:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Publică tema (draft → published)
   */
  const publishTheme = useCallback(async (): Promise<boolean> => {
    try {
      setIsPublishing(true);
      
      const response = await fetch('/api/admin/theme/publish', {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to publish theme');
      }

      const data = await response.json();
      setIsPublished(true);
      setIsDraft(false);
      setLastSaved(new Date(data.updatedAt));
      
      return true;
    } catch (error) {
      console.error('Publish theme error:', error);
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, []);

  /**
   * Rollback la o versiune anterioară
   */
  const rollbackTheme = useCallback(async (versionId: string): Promise<boolean> => {
    try {
      setIsRollingBack(true);
      
      const response = await fetch('/api/admin/theme/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to rollback theme');
      }

      const data = await response.json();
      setLastSaved(new Date(data.updatedAt));
      setHasChanges(false);
      
      return true;
    } catch (error) {
      console.error('Rollback theme error:', error);
      return false;
    } finally {
      setIsRollingBack(false);
    }
  }, []);

  /**
   * Încarcă toate versiunile disponibile
   */
  const loadVersions = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/theme/versions');
      
      if (!response.ok) {
        throw new Error('Failed to load versions');
      }

      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Load versions error:', error);
    }
  }, []);

  /**
   * Compară două versiuni
   */
  const compareVersions = useCallback(async (v1: string, v2: string): Promise<unknown> => {
    try {
      const response = await fetch(
        `/api/admin/theme/compare?v1=${v1}&v2=${v2}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to compare versions');
      }

      return await response.json();
    } catch (error) {
      console.error('Compare versions error:', error);
      return null;
    }
  }, []);

  /**
   * Resetează tema la default
   */
  const resetTheme = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset theme');
      }

      setHasChanges(false);
      setIsDraft(true);
      setIsPublished(false);
      
      return true;
    } catch (error) {
      console.error('Reset theme error:', error);
      return false;
    }
  }, []);

  return {
    isDraft,
    isPublished,
    isSaving,
    isPublishing,
    isRollingBack,
    hasChanges,
    lastSaved,
    versions,
    saveDraft,
    publishTheme,
    rollbackTheme,
    loadVersions,
    compareVersions,
    resetTheme,
  };
}
