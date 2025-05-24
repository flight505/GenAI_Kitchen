import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  previousState: any;
  newState: any;
  metadata?: Record<string, any>;
}

interface HistoryState {
  // History tracking
  entries: HistoryEntry[];
  currentIndex: number;
  maxHistorySize: number;
  
  // Settings
  isTrackingEnabled: boolean;
  excludedActions: string[];
  
  // Analytics
  actionCounts: Record<string, number>;
  undoCount: number;
  redoCount: number;
}

interface HistoryActions {
  // History management
  addEntry: (action: string, description: string, previousState: any, newState: any, metadata?: Record<string, any>) => void;
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  
  // Navigation
  goToEntry: (id: string) => void;
  goToIndex: (index: number) => void;
  
  // Settings
  setTrackingEnabled: (enabled: boolean) => void;
  addExcludedAction: (action: string) => void;
  removeExcludedAction: (action: string) => void;
  setMaxHistorySize: (size: number) => void;
  
  // Computed
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistoryStats: () => {
    totalActions: number;
    mostFrequentActions: Array<{ action: string; count: number }>;
    averageUndosPerSession: number;
  };
  
  // Export/Import
  exportHistory: () => string;
  importHistory: (data: string) => boolean;
}

const initialState: HistoryState = {
  entries: [],
  currentIndex: -1,
  maxHistorySize: 50,
  isTrackingEnabled: true,
  excludedActions: ['setIsDrawing', 'setBrushSize', 'setMaskOpacity'], // UI-only actions
  actionCounts: {},
  undoCount: 0,
  redoCount: 0
};

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,
          
          // History management
          addEntry: (action, description, previousState, newState, metadata) => {
            const state = get();
            
            // Skip if tracking is disabled or action is excluded
            if (!state.isTrackingEnabled || state.excludedActions.includes(action)) {
              return;
            }
            
            set((state) => {
              // Remove any entries after currentIndex (branching history)
              if (state.currentIndex < state.entries.length - 1) {
                state.entries = state.entries.slice(0, state.currentIndex + 1);
              }
              
              // Add new entry
              const entry: HistoryEntry = {
                id: `history-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action,
                description,
                previousState,
                newState,
                metadata
              };
              
              state.entries.push(entry);
              
              // Limit history size
              if (state.entries.length > state.maxHistorySize) {
                state.entries = state.entries.slice(-state.maxHistorySize);
              }
              
              state.currentIndex = state.entries.length - 1;
              
              // Update action counts
              state.actionCounts[action] = (state.actionCounts[action] || 0) + 1;
            });
          },
          
          undo: () => {
            const state = get();
            if (state.currentIndex <= 0) return false;
            
            set((state) => {
              state.currentIndex--;
              state.undoCount++;
            });
            
            // Return the previous state to apply
            const entry = get().entries[get().currentIndex];
            if (entry) {
              // The calling code should handle applying the previous state
              return true;
            }
            return false;
          },
          
          redo: () => {
            const state = get();
            if (state.currentIndex >= state.entries.length - 1) return false;
            
            set((state) => {
              state.currentIndex++;
              state.redoCount++;
            });
            
            // Return the new state to apply
            const entry = get().entries[get().currentIndex];
            if (entry) {
              // The calling code should handle applying the new state
              return true;
            }
            return false;
          },
          
          clearHistory: () => {
            set((state) => {
              state.entries = [];
              state.currentIndex = -1;
              state.actionCounts = {};
              state.undoCount = 0;
              state.redoCount = 0;
            });
          },
          
          // Navigation
          goToEntry: (id) => {
            const state = get();
            const index = state.entries.findIndex(e => e.id === id);
            if (index !== -1) {
              set((state) => {
                state.currentIndex = index;
              });
            }
          },
          
          goToIndex: (index) => {
            const state = get();
            if (index >= 0 && index < state.entries.length) {
              set((state) => {
                state.currentIndex = index;
              });
            }
          },
          
          // Settings
          setTrackingEnabled: (enabled) => {
            set((state) => {
              state.isTrackingEnabled = enabled;
            });
          },
          
          addExcludedAction: (action) => {
            set((state) => {
              if (!state.excludedActions.includes(action)) {
                state.excludedActions.push(action);
              }
            });
          },
          
          removeExcludedAction: (action) => {
            set((state) => {
              state.excludedActions = state.excludedActions.filter(a => a !== action);
            });
          },
          
          setMaxHistorySize: (size) => {
            set((state) => {
              state.maxHistorySize = Math.max(1, Math.min(100, size));
              // Trim history if needed
              if (state.entries.length > state.maxHistorySize) {
                state.entries = state.entries.slice(-state.maxHistorySize);
                state.currentIndex = Math.min(state.currentIndex, state.entries.length - 1);
              }
            });
          },
          
          // Computed
          canUndo: () => {
            const state = get();
            return state.currentIndex > 0;
          },
          
          canRedo: () => {
            const state = get();
            return state.currentIndex < state.entries.length - 1;
          },
          
          getHistoryStats: () => {
            const state = get();
            const actionArray = Object.entries(state.actionCounts)
              .map(([action, count]) => ({ action, count }))
              .sort((a, b) => b.count - a.count);
            
            return {
              totalActions: state.entries.length,
              mostFrequentActions: actionArray.slice(0, 5),
              averageUndosPerSession: state.entries.length > 0 
                ? state.undoCount / state.entries.length 
                : 0
            };
          },
          
          // Export/Import
          exportHistory: () => {
            const state = get();
            return JSON.stringify({
              entries: state.entries,
              currentIndex: state.currentIndex,
              actionCounts: state.actionCounts,
              undoCount: state.undoCount,
              redoCount: state.redoCount
            }, null, 2);
          },
          
          importHistory: (data) => {
            try {
              const parsed = JSON.parse(data);
              set((state) => {
                state.entries = parsed.entries || [];
                state.currentIndex = parsed.currentIndex || -1;
                state.actionCounts = parsed.actionCounts || {};
                state.undoCount = parsed.undoCount || 0;
                state.redoCount = parsed.redoCount || 0;
              });
              return true;
            } catch (error) {
              console.error('Failed to import history:', error);
              return false;
            }
          }
        }))
      ),
      {
        name: 'history-storage',
        partialize: (state) => ({
          maxHistorySize: state.maxHistorySize,
          excludedActions: state.excludedActions,
          actionCounts: state.actionCounts,
          undoCount: state.undoCount,
          redoCount: state.redoCount
        })
      }
    )
  )
);