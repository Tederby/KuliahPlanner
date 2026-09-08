import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />,
  error:   <XCircle    className="w-4 h-4 text-rose-500 dark:text-rose-400       shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />,
  info:    <Info       className="w-4 h-4 text-accent                           shrink-0 mt-0.5" />,
};

const BG = {
  success: 'bg-theme-surface border-emerald-300 dark:border-emerald-800/80',
  error:   'bg-theme-surface border-rose-300 dark:border-rose-800/80',
  warning: 'bg-theme-surface border-amber-300 dark:border-amber-800/80',
  info:    'bg-theme-surface border-theme',
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-md border shadow-lg pointer-events-auto
            animate-[slideIn_0.15s_ease-out] ${BG[toast.type] ?? BG.info}`}
        >
          {ICONS[toast.type] ?? ICONS.info}
          <div className="flex-1 text-xs text-theme-text leading-snug">
            <p>{toast.message}</p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick?.();
                  onDismiss(toast.id);
                }}
                className="mt-1.5 inline-flex items-center text-xs font-bold text-accent hover:underline focus:outline-none"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-theme-muted hover:text-theme-text transition-colors mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;