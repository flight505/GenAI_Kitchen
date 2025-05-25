/**
 * Local storage utilities for workflow persistence
 */

import { WorkflowState, WorkflowHistory, WorkflowImage } from '../types/workflow';
import { WORKFLOW_STORAGE_KEY, WORKFLOW_HISTORY_KEY, WORKFLOW_PREFERENCES_KEY } from '../constants/workflows';

// Type-safe localStorage wrapper
class LocalStorageManager {
  private isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string, defaultValue?: T): T | null {
    if (!this.isAvailable()) return defaultValue || null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : (defaultValue || null);
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue || null;
    }
  }

  set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  }

  remove(key: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  }

  clear(): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  }
}

export const storage = new LocalStorageManager();

// Workflow-specific storage functions
export const saveWorkflowState = (state: WorkflowState): boolean => {
  return storage.set(WORKFLOW_STORAGE_KEY, state);
};

export const loadWorkflowState = (): WorkflowState | null => {
  return storage.get<WorkflowState>(WORKFLOW_STORAGE_KEY);
};

// Add aliases for different naming conventions
export const saveWorkflow = (key: string, workflow: WorkflowState): boolean => {
  return storage.set(`workflow_${key}`, workflow);
};

export const loadWorkflow = (key: string): WorkflowState | null => {
  return storage.get<WorkflowState>(`workflow_${key}`);
};

export const clearWorkflow = (key: string): boolean => {
  return storage.remove(`workflow_${key}`);
};

export const clearWorkflowState = (): boolean => {
  return storage.remove(WORKFLOW_STORAGE_KEY);
};

// History storage functions
export const saveWorkflowHistory = (history: WorkflowHistory): boolean => {
  return storage.set(WORKFLOW_HISTORY_KEY, history);
};

export const loadWorkflowHistory = (): WorkflowHistory | null => {
  return storage.get<WorkflowHistory>(WORKFLOW_HISTORY_KEY);
};

export const appendToHistory = (image: WorkflowImage): boolean => {
  const history = loadWorkflowHistory() || {
    branches: [{
      id: 'main',
      name: 'Main',
      images: [],
      createdAt: new Date().toISOString()
    }],
    currentBranchId: 'main',
    checkpoints: []
  };
  
  const currentBranch = (history.branches as any[]).find((b: any) => b.id === history.currentBranchId);
  if (currentBranch) {
    currentBranch.images.push(image);
    return saveWorkflowHistory(history);
  }
  
  return false;
};

// Preferences storage
export interface UserPreferences {
  defaultModel?: string;
  autoSave?: boolean;
  showTips?: boolean;
  compactMode?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export const savePreferences = (prefs: UserPreferences): boolean => {
  return storage.set(WORKFLOW_PREFERENCES_KEY, prefs);
};

export const loadPreferences = (): UserPreferences => {
  return storage.get<UserPreferences>(WORKFLOW_PREFERENCES_KEY) || {
    defaultModel: 'canny-pro',
    autoSave: true,
    showTips: true,
    compactMode: false,
    theme: 'light'
  };
};

// Storage size management
export const getStorageSize = (): number => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
  } catch {
    return 0;
  }
  
  let totalSize = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  return totalSize;
};

export const isStorageQuotaExceeded = (): boolean => {
  // Most browsers have a 5-10MB limit
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  return getStorageSize() > MAX_SIZE;
};

// Cleanup old data
export const cleanupOldWorkflows = (daysToKeep: number = 7): number => {
  const history = loadWorkflowHistory();
  if (!history) return 0;
  
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  let removedCount = 0;
  
  history.branches.forEach((branch: any) => {
    const originalLength = branch.images.length;
    branch.images = branch.images.filter((img: any) => img.timestamp > cutoffTime);
    removedCount += originalLength - branch.images.length;
  });
  
  if (removedCount > 0) {
    saveWorkflowHistory(history);
  }
  
  return removedCount;
};