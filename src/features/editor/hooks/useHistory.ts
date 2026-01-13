import { useState, useCallback, useMemo } from "react";
import type { HistoryEntry } from "../utils/stateUtils";
import { deepCloneState } from "../utils/stateUtils";

/**
 * History state structure for undo/redo functionality
 */
interface HistoryState {
  past: HistoryEntry[];      // States we can undo to
  present: HistoryEntry;      // Current state
  future: HistoryEntry[];     // States we can redo to
}

const MAX_HISTORY_SIZE = 50;

/**
 * Custom hook for managing undo/redo history
 * 
 * @param initialState - Initial state entry
 * @returns History management functions and state
 */
export function useHistory(initialState: HistoryEntry) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: deepCloneState(initialState),
    future: [],
  });

  /**
   * Push a new state to history
   * This should be called before applying an edit
   * Clears the future stack (standard undo/redo behavior)
   */
  const push = useCallback((newState: HistoryEntry) => {
    setHistory((prev) => {
      console.log('[useHistory] push called, current past length:', prev.past.length, 'future length:', prev.future.length);
      const newPast = [...prev.past, deepCloneState(prev.present)];
      
      // Limit history size - remove oldest entries if exceeded
      const trimmedPast = newPast.length > MAX_HISTORY_SIZE
        ? newPast.slice(-MAX_HISTORY_SIZE)
        : newPast;

      console.log('[useHistory] Push successful, new past length:', trimmedPast.length);

      return {
        past: trimmedPast,
        present: deepCloneState(newState),
        future: [], // Clear future when new edit is made
      };
    });
  }, []);

  /**
   * Undo: Move current state to future, restore previous state
   */
  const undo = useCallback((): HistoryEntry | null => {
    // Read the state to restore BEFORE updating history
    if (history.past.length === 0) {
      console.log('[useHistory] Nothing to undo, past is empty');
      return null;
    }

    const stateToRestore = history.past[history.past.length - 1];
    console.log('[useHistory] undo called, past length:', history.past.length, 'future length:', history.future.length);
    console.log('[useHistory] State to restore:', stateToRestore);
    
    setHistory((prev) => {
      if (prev.past.length === 0) {
        return prev; // Nothing to undo (shouldn't happen, but safety check)
      }

      const previousState = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      const newFuture = [deepCloneState(prev.present), ...prev.future];

      console.log('[useHistory] Undo successful, new past length:', newPast.length, 'new future length:', newFuture.length);

      return {
        past: newPast,
        present: deepCloneState(previousState),
        future: newFuture,
      };
    });

    return deepCloneState(stateToRestore);
  }, [history]);

  /**
   * Redo: Move current state to past, restore next state
   */
  const redo = useCallback((): HistoryEntry | null => {
    // Read the state to restore BEFORE updating history
    if (history.future.length === 0) {
      console.log('[useHistory] Nothing to redo, future is empty');
      return null;
    }

    const stateToRestore = history.future[0];
    console.log('[useHistory] redo called, past length:', history.past.length, 'future length:', history.future.length);
    console.log('[useHistory] State to restore:', stateToRestore);
    
    setHistory((prev) => {
      if (prev.future.length === 0) {
        return prev; // Nothing to redo (shouldn't happen, but safety check)
      }

      const nextState = prev.future[0];
      const newPast = [...prev.past, deepCloneState(prev.present)];
      const newFuture = prev.future.slice(1);

      console.log('[useHistory] Redo successful, new past length:', newPast.length, 'new future length:', newFuture.length);

      return {
        past: newPast,
        present: deepCloneState(nextState),
        future: newFuture,
      };
    });

    return deepCloneState(stateToRestore);
  }, [history]);

  /**
   * Check if undo is possible (reactive)
   * Computed directly from history state - React will re-render when history state changes
   */
  const canUndo = history.past.length > 0;
  
  /**
   * Check if redo is possible (reactive)
   */
  const canRedo = history.future.length > 0;

  /**
   * Get current state
   */
  const getCurrentState = useCallback((): HistoryEntry => {
    return deepCloneState(history.present);
  }, [history.present]);

  /**
   * Reset history to a new initial state
   * Useful when loading a new project
   */
  const reset = useCallback((newInitialState: HistoryEntry) => {
    setHistory({
      past: [],
      present: deepCloneState(newInitialState),
      future: [],
    });
  }, []);

  // Memoize return value to ensure stable reference, but canUndo/canRedo will update when history changes
  return useMemo(() => ({
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentState,
    reset,
  }), [push, undo, redo, canUndo, canRedo, getCurrentState, reset]);
}
