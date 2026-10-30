'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

interface ToastProps {
  children: ReactNode;
  action?: ReactNode;
  onDismiss: () => void;
}

const VISIBLE_MS = 5000;

/** Remount with a new `key` to show the next message; it replaces the current one. */
export function Toast({ children, action, onDismiss }: ToastProps) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dismiss = useRef(onDismiss);

  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => dismiss.current(), VISIBLE_MS);
  }, []);

  useEffect(() => {
    schedule();
    return () => clearTimeout(timer.current);
  }, [schedule]);

  return (
    <div className="ar-toast-region">
      <div
        className="ar-toast"
        role="status"
        onMouseEnter={() => clearTimeout(timer.current)}
        onMouseLeave={schedule}
      >
        <div className="ar-toast__text">{children}</div>
        {action}
      </div>
    </div>
  );
}
