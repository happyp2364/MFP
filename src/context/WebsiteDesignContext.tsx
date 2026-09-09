import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebsiteDesignSettings, ResponsiveDevice, SectionResponsiveConfig, PageSectionConfig } from '../types/websiteDesign';
import { DEFAULT_WEBSITE_DESIGN_SETTINGS, sanitizeWebsiteDesignSettings, applyWebsiteDesignTokens } from '../data/defaultWebsiteDesign';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface WebsiteDesignContextType {
  websiteDesignSettings: WebsiteDesignSettings;
  draftDesignSettings: WebsiteDesignSettings;
  updateDraftDesignSettings: (newSettings: WebsiteDesignSettings, pushHistory?: boolean) => void;
  saveWebsiteDesignSettings: (settingsToSave?: WebsiteDesignSettings, userEmail?: string) => Promise<void>;
  resetSectionDesign: (sectionKey: keyof WebsiteDesignSettings) => void;
  resetAllDesign: (userEmail?: string) => Promise<void>;
  isDesignLoading: boolean;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  reorderHomeSections: (newOrder: string[]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  toggleSectionLock: (sectionId: string) => void;
  updateSectionResponsiveConfig: (sectionId: string, device: ResponsiveDevice, config: Partial<SectionResponsiveConfig>) => void;
}

const WebsiteDesignContext = createContext<WebsiteDesignContextType | undefined>(undefined);

export const WebsiteDesignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [websiteDesignSettings, setWebsiteDesignSettings] = useState<WebsiteDesignSettings>(DEFAULT_WEBSITE_DESIGN_SETTINGS);
  const [draftDesignSettings, setDraftDesignSettings] = useState<WebsiteDesignSettings>(DEFAULT_WEBSITE_DESIGN_SETTINGS);
  const [isDesignLoading, setIsDesignLoading] = useState<boolean>(true);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<WebsiteDesignSettings[]>([]);
  const [redoStack, setRedoStack] = useState<WebsiteDesignSettings[]>([]);

  // Synchronize Firestore settings with single realtime listener
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const docRef = doc(db, 'settings', 'website_design_config');
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const sanitized = sanitizeWebsiteDesignSettings(snapshot.data());
            setWebsiteDesignSettings(sanitized);
            setDraftDesignSettings(sanitized);
            applyWebsiteDesignTokens(sanitized);
          } else {
            setWebsiteDesignSettings(DEFAULT_WEBSITE_DESIGN_SETTINGS);
            setDraftDesignSettings(DEFAULT_WEBSITE_DESIGN_SETTINGS);
            applyWebsiteDesignTokens(DEFAULT_WEBSITE_DESIGN_SETTINGS);
          }
          setIsDesignLoading(false);
        },
        (error) => {
          console.warn('Firestore website_design_config listener error (falling back to defaults):', error);
          setWebsiteDesignSettings(DEFAULT_WEBSITE_DESIGN_SETTINGS);
          setDraftDesignSettings(DEFAULT_WEBSITE_DESIGN_SETTINGS);
          applyWebsiteDesignTokens(DEFAULT_WEBSITE_DESIGN_SETTINGS);
          setIsDesignLoading(false);
        }
      );
    } catch (err) {
      console.warn('Error setting up website_design_config listener:', err);
      applyWebsiteDesignTokens(DEFAULT_WEBSITE_DESIGN_SETTINGS);
      setIsDesignLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Check if draft differs from persisted settings
  const hasUnsavedChanges = JSON.stringify(draftDesignSettings) !== JSON.stringify(websiteDesignSettings);

  // Update local draft and immediately update CSS variables for live preview
  const updateDraftDesignSettings = (newSettings: WebsiteDesignSettings, pushHistory = true) => {
    const sanitized = sanitizeWebsiteDesignSettings(newSettings);
    if (pushHistory) {
      setUndoStack((prev) => [...prev.slice(-20), draftDesignSettings]);
      setRedoStack([]);
    }
    setDraftDesignSettings(sanitized);
    applyWebsiteDesignTokens(sanitized);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, undoStack.length - 1);
    setRedoStack((prev) => [draftDesignSettings, ...prev]);
    setUndoStack(newUndo);
    setDraftDesignSettings(previous);
    applyWebsiteDesignTokens(previous);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    setUndoStack((prev) => [...prev, draftDesignSettings]);
    setRedoStack(newRedo);
    setDraftDesignSettings(next);
    applyWebsiteDesignTokens(next);
  };

  // Persist draft or given settings to Firestore
  const saveWebsiteDesignSettings = async (settingsToSave?: WebsiteDesignSettings, userEmail?: string) => {
    const target = settingsToSave ? sanitizeWebsiteDesignSettings(settingsToSave) : draftDesignSettings;
    const payload: WebsiteDesignSettings = {
      ...target,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'Admin',
    };

    setWebsiteDesignSettings(payload);
    setDraftDesignSettings(payload);
    applyWebsiteDesignTokens(payload);
    setUndoStack([]);
    setRedoStack([]);

    try {
      await setDoc(doc(db, 'settings', 'website_design_config'), payload, { merge: true });
    } catch (e) {
      console.error('Failed to persist website_design_config to Firestore:', e);
    }
  };

  // Reset a specific section to default values
  const resetSectionDesign = (sectionKey: keyof WebsiteDesignSettings) => {
    if (sectionKey in DEFAULT_WEBSITE_DESIGN_SETTINGS) {
      const updatedDraft = {
        ...draftDesignSettings,
        [sectionKey]: { ...(DEFAULT_WEBSITE_DESIGN_SETTINGS[sectionKey] as any) },
      };
      updateDraftDesignSettings(updatedDraft);
    }
  };

  // Reset all design tokens to initial default
  const resetAllDesign = async (userEmail?: string) => {
    const defaults = { ...DEFAULT_WEBSITE_DESIGN_SETTINGS };
    setDraftDesignSettings(defaults);
    setWebsiteDesignSettings(defaults);
    applyWebsiteDesignTokens(defaults);
    setUndoStack([]);
    setRedoStack([]);

    try {
      await setDoc(doc(db, 'settings', 'website_design_config'), defaults, { merge: true });
    } catch (e) {
      console.error('Failed to reset website_design_config in Firestore:', e);
    }
  };

  // Helper: Reorder homepage sections safely
  const reorderHomeSections = (newOrder: string[]) => {
    if (!draftDesignSettings.layout) return;
    const updated = {
      ...draftDesignSettings,
      layout: {
        ...draftDesignSettings.layout,
        homeSectionOrder: newOrder,
      },
    };
    updateDraftDesignSettings(updated);
  };

  // Helper: Toggle section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    if (!draftDesignSettings.layout) return;
    const currentSec = draftDesignSettings.layout.sections[sectionId];
    if (!currentSec) return;

    const updated = {
      ...draftDesignSettings,
      layout: {
        ...draftDesignSettings.layout,
        sections: {
          ...draftDesignSettings.layout.sections,
          [sectionId]: {
            ...currentSec,
            visible: !currentSec.visible,
          },
        },
      },
    };
    updateDraftDesignSettings(updated);
  };

  // Helper: Toggle section lock
  const toggleSectionLock = (sectionId: string) => {
    if (!draftDesignSettings.layout) return;
    const currentSec = draftDesignSettings.layout.sections[sectionId];
    if (!currentSec) return;

    const updated = {
      ...draftDesignSettings,
      layout: {
        ...draftDesignSettings.layout,
        sections: {
          ...draftDesignSettings.layout.sections,
          [sectionId]: {
            ...currentSec,
            locked: !currentSec.locked,
          },
        },
      },
    };
    updateDraftDesignSettings(updated);
  };

  // Helper: Update responsive config for section
  const updateSectionResponsiveConfig = (
    sectionId: string,
    device: ResponsiveDevice,
    config: Partial<SectionResponsiveConfig>
  ) => {
    if (!draftDesignSettings.layout) return;
    const currentSec = draftDesignSettings.layout.sections[sectionId];
    if (!currentSec) return;

    const updated = {
      ...draftDesignSettings,
      layout: {
        ...draftDesignSettings.layout,
        sections: {
          ...draftDesignSettings.layout.sections,
          [sectionId]: {
            ...currentSec,
            [device]: {
              ...currentSec[device],
              ...config,
            },
          },
        },
      },
    };
    updateDraftDesignSettings(updated);
  };

  return (
    <WebsiteDesignContext.Provider
      value={{
        websiteDesignSettings,
        draftDesignSettings,
        updateDraftDesignSettings,
        saveWebsiteDesignSettings,
        resetSectionDesign,
        resetAllDesign,
        isDesignLoading,
        hasUnsavedChanges,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undo,
        redo,
        reorderHomeSections,
        toggleSectionVisibility,
        toggleSectionLock,
        updateSectionResponsiveConfig,
      }}
    >
      {children}
    </WebsiteDesignContext.Provider>
  );
};

export const useWebsiteDesign = () => {
  const context = useContext(WebsiteDesignContext);
  if (!context) {
    throw new Error('useWebsiteDesign must be used within a WebsiteDesignProvider');
  }
  return context;
};

