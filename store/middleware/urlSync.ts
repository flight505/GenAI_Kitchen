import { StateCreator } from 'zustand';
import { parseUrlState, updateUrlState } from '@/utils/urlState';

export interface UrlSyncConfig {
  // Keys to sync with URL
  keys: string[];
  // Debounce time in ms
  debounce?: number;
  // Transform functions
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export const urlSync = <T extends object>(
  config: UrlSyncConfig
): StateCreator<T, [], [], T> => (set, get, api) => {
  let timeoutId: NodeJS.Timeout;
  
  // Initialize from URL on load
  if (typeof window !== 'undefined') {
    const urlState = parseUrlState();
    const initialState: Partial<T> = {};
    
    config.keys.forEach(key => {
      if (urlState[key] !== undefined) {
        initialState[key as keyof T] = config.deserialize 
          ? config.deserialize(urlState[key])
          : urlState[key];
      }
    });
    
    if (Object.keys(initialState).length > 0) {
      set(initialState as T);
    }
  }
  
  // Subscribe to state changes
  api.subscribe((state, prevState) => {
    if (typeof window === 'undefined') return;
    
    // Clear existing timeout
    if (timeoutId) clearTimeout(timeoutId);
    
    // Debounce URL updates
    timeoutId = setTimeout(() => {
      const updates: Record<string, string> = {};
      
      config.keys.forEach(key => {
        const value = state[key as keyof T];
        const prevValue = prevState[key as keyof T];
        
        if (value !== prevValue && value !== undefined) {
          updates[key] = config.serialize 
            ? config.serialize(value)
            : String(value);
        }
      });
      
      if (Object.keys(updates).length > 0) {
        updateUrlState(updates);
      }
    }, config.debounce || 500);
  });
  
  return {} as T;
};