import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog
 * Props:
 *  - isOpen   : bool
 *  - title    : string
 *  - message  : string
 *  - onConfirm: fn
 *  - onCancel : fn
 *  - danger   : bool (merah vs biru)
 */
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, danger = true }) => {
  // R3: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onCancel}
    >
      <div
        className="bg-theme-surface rounded-t-2xl sm:rounded-xl border-t sm:border border-theme shadow-2xl w-full max-w-sm p-5 pb-[calc(var(--safe-area-bottom)+1.25rem)] sm:pb-5 animate-[slideUp_0.2s_ease-out_sm:animate-none]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-theme-muted/30 rounded-full mx-auto -mt-1 mb-4 sm:hidden shrink-0" />

        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-md border ${danger ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400' : 'bg-theme-surface-subtle border-theme text-accent'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-theme-text text-base">{title}</h3>
        </div>

        <p className="text-theme-muted text-xs mb-5 leading-relaxed">{message}</p>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 px-3.5 py-2 bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme rounded-md font-medium text-xs transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-3.5 py-2 rounded-md font-medium text-xs transition-colors shadow-sm ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-accent hover:bg-accent-hover text-accent-contrast'
            }`}
          >
            Ya, Lanjut
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;