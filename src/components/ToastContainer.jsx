import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
  error:   <XCircle    className="w-5 h-5 text-rose-400    shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  info:    <Info       className="w-5 h-5 text-indigo-400  shrink-0" />,
};

const BG = {
  success: 'bg-emerald-950/80 border-emerald-700/50',
  error:   'bg-rose-950/80    border-rose-700/50',
  warning: 'bg-amber-950/80   border-amber-700/50',
  info:    'bg-slate-800      border-slate-600',
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm pointer-events-auto
            animate-[slideIn_0.2s_ease-out] ${BG[toast.type] ?? BG.info}`}
        >
          {ICONS[toast.type] ?? ICONS.info}
          <p className="flex-1 text-sm text-slate-200 leading-snug">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;