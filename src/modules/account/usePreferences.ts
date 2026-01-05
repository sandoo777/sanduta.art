"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/modules/i18n";

export type Language = "RO" | "EN" | "RU";
export type Theme = "LIGHT" | "DARK" | "SYSTEM";
export type EditorUnit = "PX" | "MM" | "CM";
export type UIDensity = "COMPACT" | "STANDARD" | "SPACIOUS";

export interface UserPreferences {
  id: string;
  userId: string;
  language: Language;
  theme: Theme;
  
  // Notifications
  emailOrders: boolean;
  emailProjects: boolean;
  emailFiles: boolean;
  emailPromotions: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  
  // Editor
  editorSnapToGrid: boolean;
  editorGridVisible: boolean;
  editorGridSize: number;
  editorUnit: EditorUnit;
  editorAutoSave: number;
  editorUIDensity: UIDensity;
  
  // Configurator
  configDefaultQuantity: number;
  configDefaultProductionTime: string;
  configDefaultDelivery: string;
  configDefaultPayment: string;
  
  // Communication
  newsletter: boolean;
  specialOffers: boolean;
  personalizedRecommend: boolean;
  productNews: boolean;
  
  createdAt: string;
  updatedAt: string;
}

interface UsePreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateNotificationPreferences: (data: {
    emailOrders?: boolean;
    emailProjects?: boolean;
    emailFiles?: boolean;
    emailPromotions?: boolean;
    pushNotifications?: boolean;
    inAppNotifications?: boolean;
  }) => Promise<void>;
  updateEditorPreferences: (data: {
    editorSnapToGrid?: boolean;
    editorGridVisible?: boolean;
    editorGridSize?: number;
    editorUnit?: EditorUnit;
    editorAutoSave?: number;
    editorUIDensity?: UIDensity;
  }) => Promise<void>;
  updateConfiguratorPreferences: (data: {
    configDefaultQuantity?: number;
    configDefaultProductionTime?: string;
    configDefaultDelivery?: string;
    configDefaultPayment?: string;
  }) => Promise<void>;
  updateCommunicationPreferences: (data: {
    newsletter?: boolean;
    specialOffers?: boolean;
    personalizedRecommend?: boolean;
    productNews?: boolean;
  }) => Promise<void>;
}

export const usePreferences = (): UsePreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setLanguage } = useI18n();

  // Funcție pentru obținerea preferințelor
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/account/preferences");
      
      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      const data = await response.json();
      setPreferences(data);

      // Sincronizează limba cu i18n store
      if (data.language) {
        setLanguage(data.language);
      }

      // Aplică tema
      if (data.theme) {
        applyTheme(data.theme);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("[FETCH_PREFERENCES]", err);
    } finally {
      setLoading(false);
    }
  };

  // Funcție generică pentru actualizare
  const updatePreferences = async (data: Partial<UserPreferences>) => {
    try {
      const response = await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      const updated = await response.json();
      setPreferences(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("[UPDATE_PREFERENCES]", err);
      throw err;
    }
  };

  // Actualizare limbă
  const updateLanguage = async (language: Language) => {
    const updated = await updatePreferences({ language });
    setLanguage(language);
    return updated;
  };

  // Actualizare temă
  const updateTheme = async (theme: Theme) => {
    const updated = await updatePreferences({ theme });
    applyTheme(theme);
    return updated;
  };

  // Aplicare temă
  const applyTheme = (theme: Theme) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    if (theme === "SYSTEM") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "DARK");
    }

    // Salvează în localStorage pentru persistență
    localStorage.setItem("theme", theme);
  };

  // Actualizare preferințe notificări
  const updateNotificationPreferences = async (data: {
    emailOrders?: boolean;
    emailProjects?: boolean;
    emailFiles?: boolean;
    emailPromotions?: boolean;
    pushNotifications?: boolean;
    inAppNotifications?: boolean;
  }) => {
    return await updatePreferences(data);
  };

  // Actualizare preferințe editor
  const updateEditorPreferences = async (data: {
    editorSnapToGrid?: boolean;
    editorGridVisible?: boolean;
    editorGridSize?: number;
    editorUnit?: EditorUnit;
    editorAutoSave?: number;
    editorUIDensity?: UIDensity;
  }) => {
    return await updatePreferences(data);
  };

  // Actualizare preferințe configurator
  const updateConfiguratorPreferences = async (data: {
    configDefaultQuantity?: number;
    configDefaultProductionTime?: string;
    configDefaultDelivery?: string;
    configDefaultPayment?: string;
  }) => {
    return await updatePreferences(data);
  };

  // Actualizare preferințe comunicări
  const updateCommunicationPreferences = async (data: {
    newsletter?: boolean;
    specialOffers?: boolean;
    personalizedRecommend?: boolean;
    productNews?: boolean;
  }) => {
    return await updatePreferences(data);
  };

  // Încarcă preferințele la mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updateLanguage,
    updateTheme,
    updateNotificationPreferences,
    updateEditorPreferences,
    updateConfiguratorPreferences,
    updateCommunicationPreferences,
  };
};
