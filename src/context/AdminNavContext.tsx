import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminNavConfig, AdminNavGroupConfig, AdminNavItemConfig } from '../types/adminNav';
import { DEFAULT_ADMIN_NAV_CONFIG, sanitizeAdminNavConfig } from '../data/defaultAdminNav';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface AdminNavContextType {
  navConfig: AdminNavConfig;
  draftNavConfig: AdminNavConfig;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  updateDraftNavConfig: (newConfig: AdminNavConfig, pushHistory?: boolean) => void;
  saveNavConfig: (userEmail?: string) => Promise<void>;
  resetToDefault: (userEmail?: string) => Promise<void>;
  toggleGroupCollapse: (groupId: string) => void;
  toggleGroupVisibility: (groupId: string) => void;
  toggleItemVisibility: (groupId: string, itemId: string) => void;
  toggleItemLock: (groupId: string, itemId: string) => void;
  moveItem: (groupId: string, itemId: string, direction: 'up' | 'down') => void;
  moveGroup: (groupId: string, direction: 'up' | 'down') => void;
  reorderItemsInGroup: (groupId: string, newItemsOrder: AdminNavItemConfig[]) => void;
  reorderGroups: (newGroupsOrder: AdminNavGroupConfig[]) => void;
}

const AdminNavContext = createContext<AdminNavContextType | undefined>(undefined);

export const AdminNavProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navConfig, setNavConfig] = useState<AdminNavConfig>(DEFAULT_ADMIN_NAV_CONFIG);
  const [draftNavConfig, setDraftNavConfig] = useState<AdminNavConfig>(DEFAULT_ADMIN_NAV_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<AdminNavConfig[]>([]);
  const [redoStack, setRedoStack] = useState<AdminNavConfig[]>([]);

  // Realtime Firestore listener for settings/admin_navigation_config
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const docRef = doc(db, 'settings', 'admin_navigation_config');
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const sanitized = sanitizeAdminNavConfig(snapshot.data());
            setNavConfig(sanitized);
            setDraftNavConfig(sanitized);
          } else {
            setNavConfig(DEFAULT_ADMIN_NAV_CONFIG);
            setDraftNavConfig(DEFAULT_ADMIN_NAV_CONFIG);
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('Firestore admin_navigation_config listener fallback:', error);
          setNavConfig(DEFAULT_ADMIN_NAV_CONFIG);
          setDraftNavConfig(DEFAULT_ADMIN_NAV_CONFIG);
          setIsLoading(false);
        }
      );
    } catch (e) {
      console.warn('Error setting up admin_navigation_config listener:', e);
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const updateDraftNavConfig = (newConfig: AdminNavConfig, pushHistory = true) => {
    if (pushHistory) {
      setUndoStack((prev) => [...prev, draftNavConfig]);
      setRedoStack([]);
    }
    setDraftNavConfig(newConfig);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [draftNavConfig, ...prev]);
    setDraftNavConfig(previous);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setUndoStack((prev) => [...prev, draftNavConfig]);
    setDraftNavConfig(next);
  };

  const saveNavConfig = async (userEmail?: string) => {
    try {
      const payload: AdminNavConfig = {
        ...draftNavConfig,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'admin',
      };

      const docRef = doc(db, 'settings', 'admin_navigation_config');
      await setDoc(docRef, payload, { merge: true });

      setNavConfig(payload);
      setUndoStack([]);
      setRedoStack([]);
    } catch (e) {
      console.error('Failed to save admin_navigation_config:', e);
      throw e;
    }
  };

  const resetToDefault = async (userEmail?: string) => {
    updateDraftNavConfig(DEFAULT_ADMIN_NAV_CONFIG, true);
  };

  const toggleGroupCollapse = (groupId: string) => {
    const updatedGroups = draftNavConfig.groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, collapsed: !g.collapsed };
      }
      return g;
    });
    // Collapsing state doesn't need undo history push
    setDraftNavConfig({ ...draftNavConfig, groups: updatedGroups });
  };

  const toggleGroupVisibility = (groupId: string) => {
    const updatedGroups = draftNavConfig.groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, visible: !g.visible };
      }
      return g;
    });
    updateDraftNavConfig({ ...draftNavConfig, groups: updatedGroups });
  };

  const toggleItemVisibility = (groupId: string, itemId: string) => {
    const updatedGroups = draftNavConfig.groups.map((g) => {
      if (g.id === groupId) {
        const updatedItems = g.items.map((it) => {
          if (it.id === itemId) {
            return { ...it, visible: !it.visible };
          }
          return it;
        });
        return { ...g, items: updatedItems };
      }
      return g;
    });
    updateDraftNavConfig({ ...draftNavConfig, groups: updatedGroups });
  };

  const toggleItemLock = (groupId: string, itemId: string) => {
    const updatedGroups = draftNavConfig.groups.map((g) => {
      if (g.id === groupId) {
        const updatedItems = g.items.map((it) => {
          if (it.id === itemId) {
            return { ...it, locked: !it.locked };
          }
          return it;
        });
        return { ...g, items: updatedItems };
      }
      return g;
    });
    updateDraftNavConfig({ ...draftNavConfig, groups: updatedGroups });
  };

  const moveItem = (groupId: string, itemId: string, direction: 'up' | 'down') => {
    const group = draftNavConfig.groups.find((g) => g.id === groupId);
    if (!group) return;

    const items = [...group.items];
    const index = items.findIndex((it) => it.id === itemId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const updatedGroups = draftNavConfig.groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, items };
      }
      return g;
    });

    updateDraftNavConfig({ ...draftNavConfig, groups: updatedGroups });
  };

  const moveGroup = (groupId: string, direction: 'up' | 'down') => {
    const groups = [...draftNavConfig.groups];
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    const temp = groups[index];
    groups[index] = groups[targetIndex];
    groups[targetIndex] = temp;

    updateDraftNavConfig({ ...draftNavConfig, groups });
  };

  const reorderItemsInGroup = (groupId: string, newItemsOrder: AdminNavItemConfig[]) => {
    const updatedGroups = draftNavConfig.groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, items: newItemsOrder };
      }
      return g;
    });
    updateDraftNavConfig({ ...draftNavConfig, groups: updatedGroups });
  };

  const reorderGroups = (newGroupsOrder: AdminNavGroupConfig[]) => {
    updateDraftNavConfig({ ...draftNavConfig, groups: newGroupsOrder });
  };

  const hasUnsavedChanges = JSON.stringify(navConfig) !== JSON.stringify(draftNavConfig);

  return (
    <AdminNavContext.Provider
      value={{
        navConfig,
        draftNavConfig,
        isLoading,
        hasUnsavedChanges,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undo,
        redo,
        updateDraftNavConfig,
        saveNavConfig,
        resetToDefault,
        toggleGroupCollapse,
        toggleGroupVisibility,
        toggleItemVisibility,
        toggleItemLock,
        moveItem,
        moveGroup,
        reorderItemsInGroup,
        reorderGroups,
      }}
    >
      {children}
    </AdminNavContext.Provider>
  );
};

export const useAdminNav = () => {
  const context = useContext(AdminNavContext);
  if (!context) {
    throw new Error('useAdminNav must be used within an AdminNavProvider');
  }
  return context;
};
