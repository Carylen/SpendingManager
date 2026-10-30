'use client';

import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animates from 0 to `target` whenever `target` or `key` changes. */
export function useCountUp(target: number, key: unknown, duration = 1000): number {
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, key, duration]);

  return value;
}
