import { StateCreator, StoreApi } from 'zustand';
import { useHistoryStore } from '@/store/historyStore';

export interface UndoableOptions {
  // Limit number of history entries
  limit?: number;
  // Filter which actions to track
  filter?: (action: string) => boolean;
  // Equality function to check if state changed
  equality?: (a: any, b: any) => boolean;
  // Describe the action for history display
  describe?: (action: string, state: any) => string;
}

export const undoable = <T extends object>(
  config: StateCreator<T, [], [], T>,
  options: UndoableOptions = {}
): StateCreator<T & {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}, [], [], T> => (set, get, api) => {
  const { limit = 50, filter, equality, describe } = options;
  
  // Track history internally
  let history: T[] = [];
  let currentIndex = -1;
  
  // Wrap the original store
  const store = config(
    (partial, replace) => {
      // Capture state before change
      const prevState = get();
      
      // Apply the state change
      set(partial, replace);
      
      // Capture state after change
      const newState = get();
      
      // Check if state actually changed
      const hasChanged = equality 
        ? !equality(prevState, newState)
        : JSON.stringify(prevState) !== JSON.stringify(newState);
      
      if (hasChanged) {
        // Add to history
        if (currentIndex < history.length - 1) {
          // Remove future history when new action is taken
          history = history.slice(0, currentIndex + 1);
        }
        
        history.push(newState);
        
        // Limit history size
        if (history.length > limit) {
          history = history.slice(-limit);
        }
        
        currentIndex = history.length - 1;
        
        // Also track in global history if available
        if (typeof window !== 'undefined') {
          const historyStore = useHistoryStore.getState();
          const actionName = getActionName(partial);
          
          if (!filter || filter(actionName)) {
            historyStore.addEntry(
              actionName,
              describe ? describe(actionName, newState) : actionName,
              prevState,
              newState
            );
          }
        }
      }
    },
    get,
    api as StoreApi<T>
  );
  
  // Add undo/redo functionality
  return {
    ...store,
    
    undo: () => {
      if (currentIndex > 0) {
        currentIndex--;
        set(history[currentIndex] as T);
      }
    },
    
    redo: () => {
      if (currentIndex < history.length - 1) {
        currentIndex++;
        set(history[currentIndex] as T);
      }
    },
    
    canUndo: () => currentIndex > 0,
    
    canRedo: () => currentIndex < history.length - 1,
    
    clearHistory: () => {
      history = [get()];
      currentIndex = 0;
    }
  };
};

// Helper to extract action name from partial update
function getActionName(partial: any): string {
  if (typeof partial === 'function') {
    // Try to extract function name
    const fnString = partial.toString();
    const match = fnString.match(/function\s+(\w+)/);
    return match ? match[1] : 'anonymous';
  }
  
  // For object updates, use keys as action name
  if (typeof partial === 'object' && partial !== null) {
    const keys = Object.keys(partial);
    return keys.length === 1 ? `set${keys[0]}` : 'updateState';
  }
  
  return 'unknown';
}