/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { CONFIG } from "../config";

interface AppState {
  farms: any[];
  batches: any[];
  media: any[];
  currentUser: any;
  authToken: string | null;
  isOffline: boolean;
}

/**
 * Custom hook for managing global app state with debounced storage sync
 */
export function useAppState(initialState: AppState) {
  const [state, setState] = useState(initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced save to localStorage
  const saveToStorage = useCallback(() => {
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          CONFIG.SESSION.STORAGE_KEY,
          JSON.stringify({
            farms: state.farms,
            batches: state.batches,
            media: state.media
          })
        );
      } catch (error) {
        console.error("Failed to save state to localStorage:", error);
      }
    }, CONFIG.SYNC.DEBOUNCE_MS);
  }, [state]);

  // Save whenever state changes
  useEffect(() => {
    saveToStorage();
  }, [state.farms, state.batches, state.media, saveToStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return {
    state,
    setState,
    updateFarms: (farms: any[]) => setState(prev => ({ ...prev, farms })),
    updateBatches: (batches: any[]) => setState(prev => ({ ...prev, batches })),
    updateMedia: (media: any[]) => setState(prev => ({ ...prev, media })),
    setCurrentUser: (user: any) => setState(prev => ({ ...prev, currentUser: user })),
    setAuthToken: (token: string | null) => setState(prev => ({ ...prev, authToken: token })),
    setIsOffline: (offline: boolean) => setState(prev => ({ ...prev, isOffline: offline }))
  };
}

/**
 * Hook for managing form state with automatic field updates
 */
export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return { values, setValues, handleChange, reset };
}

/**
 * Hook for tracking async operations (loading, error, success)
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [state, setState] = useState<{
    loading: boolean;
    data: T | null;
    error: Error | null;
  }>({
    loading: false,
    data: null,
    error: null
  });

  const execute = useCallback(async () => {
    setState({ loading: true, data: null, error: null });
    try {
      const result = await asyncFunction();
      setState({ loading: false, data: result, error: null });
      return result;
    } catch (error) {
      setState({ loading: false, data: null, error: error as Error });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delayMs: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Hook for throttled values using requestAnimationFrame
 */
export function useThrottleRAF<T>(value: T): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      setThrottledValue(value);
      rafIdRef.current = null;
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [value]);

  return throttledValue;
}

/**
 * Hook for previous value tracking
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook for local storage with type safety
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Failed to read ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Failed to write ${key} to localStorage:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}
