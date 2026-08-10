import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook pentru debouncing - optimizează search-uri și input-uri
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pentru debounced callback
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number = 300
): (...args: TArgs) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: TArgs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Funcție vanilla pentru debounce (pentru uso în afara React)
 */
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  delay: number = 300
): (...args: TArgs) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return function (...args: TArgs) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Hook pentru throttle - limitează frecvența apelurilor
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    let timerId: NodeJS.Timeout | undefined;

    if (lastExecuted.current === null || now >= lastExecuted.current + interval) {
      timerId = setTimeout(() => {
        lastExecuted.current = now;
        setThrottledValue(value);
      }, 0);
    } else {
      timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [value, interval]);

  return throttledValue;
}

/**
 * Hook pentru optimizarea scroll events
 */
export function useThrottledScroll(callback: () => void, delay: number = 100) {
  const lastRun = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (lastRun.current === null || now - lastRun.current >= delay) {
        lastRun.current = now;
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, delay]);
}
