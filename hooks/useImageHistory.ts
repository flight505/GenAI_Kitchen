import { useState, useCallback } from 'react';

export interface ImageHistoryEntry {
  url: string;
  prompt?: string;
  timestamp: number;
  type: 'original' | 'generated' | 'inpainted' | 'variation';
}

export function useImageHistory() {
  const [history, setHistory] = useState<ImageHistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [redoStack, setRedoStack] = useState<ImageHistoryEntry[]>([]);

  // Add a new image to history
  const addToHistory = useCallback((entry: Omit<ImageHistoryEntry, 'timestamp'>) => {
    const newEntry: ImageHistoryEntry = {
      ...entry,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // If we're not at the end of history, remove everything after current index
      const newHistory = currentIndex < prev.length - 1 
        ? prev.slice(0, currentIndex + 1) 
        : prev;
      
      return [...newHistory, newEntry];
    });
    
    setCurrentIndex(prev => prev + 1);
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, [currentIndex]);

  // Undo to previous image
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const currentEntry = history[currentIndex];
      setRedoStack(prev => [...prev, currentEntry]);
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  // Redo to next image
  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const redoEntry = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      setCurrentIndex(prev => prev + 1);
      return redoEntry;
    }
    return null;
  }, [redoStack]);

  // Get current image
  const getCurrentImage = useCallback(() => {
    return currentIndex >= 0 ? history[currentIndex] : null;
  }, [currentIndex, history]);

  // Reset history
  const resetHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    setRedoStack([]);
  }, []);

  return {
    history,
    currentIndex,
    canUndo: currentIndex > 0,
    canRedo: redoStack.length > 0,
    addToHistory,
    undo,
    redo,
    getCurrentImage,
    resetHistory,
  };
}