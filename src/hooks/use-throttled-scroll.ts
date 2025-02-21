import { useCallback, useRef } from 'react';

export function useThrottledScroll(delay = 100) {
  const lastScrollTime = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledScroll = useCallback(
    (target: HTMLElement) => {
      const now = Date.now();

      if (now - lastScrollTime.current >= delay) {
        // Immediate scroll if enough time has passed
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
        lastScrollTime.current = now;
      } else {
        // Schedule scroll for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
          lastScrollTime.current = Date.now();
        }, delay);
      }
    },
    [delay]
  );

  return throttledScroll;
}
