import { useCallback, useEffect, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const handlerRef = useRef<number | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (handlerRef.current !== undefined) {
        clearTimeout(handlerRef.current);
      }
      handlerRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (handlerRef.current !== undefined) {
        clearTimeout(handlerRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
