import { useState, useCallback } from 'react';

let toastId = 0;

/**
 * useToast
 * Returns: { toasts, showToast, dismissToast }
 *
 * showToast(message, type?, duration?)
 *   type: 'success' | 'error' | 'warning' | 'info'  (default: 'info')
 *   duration: ms (default: 3500, 0 = permanent)
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast]
  );

  return { toasts, showToast, dismissToast };
};