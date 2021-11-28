import {useCallback, useRef} from 'react';

export default function useDebounced<T extends (...args: any[]) => void>(
  fun: T,
  delay: number,
  deps: ReadonlyArray<any> = [],
): [T, () => void] {
  const funCallback = useCallback(fun, deps);
  const timoutId = useRef<NodeJS.Timeout | undefined>(undefined);

  const cancel = useCallback(() => {
    if (timoutId.current) {
      globalThis.clearTimeout(timoutId.current);
      timoutId.current = undefined;
    }
  }, [timoutId]);

  const debounced = useCallback(
    (...args: any[]) => {
      if (timoutId.current) {
        globalThis.clearTimeout(timoutId.current);
      }

      timoutId.current = globalThis.setTimeout(() => {
        funCallback(...args);
      }, delay);
    },
    [funCallback, timoutId, delay],
  );

  return [debounced as T, cancel];
}
