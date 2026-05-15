import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl ${danger ? 'bg-rose-950/50' : 'bg-indigo-950/50'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-rose-400' : 'text-indigo-400'}`} />
          </div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl font-bold transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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