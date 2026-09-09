import React, { useEffect } from 'react';
import { Cloud, HardDrive, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

const SyncConflictModal = ({ conflictData, onResolve }) => {
  // R3: Close on Escape key
  useEffect(() => {
    if (!conflictData) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onResolve('cancel');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [conflictData, onResolve]);

  if (!conflictData) return null;

  const { cloudData, localData, cloudTime, localTime } = conflictData;

  const formatTime = (timeMs) => {
    if (!timeMs) return 'Tidak diketahui';
    try {
      return new Date(timeMs).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return String(timeMs);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-theme-surface border border-theme w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-[scaleUp_0.15s_ease-out]">
        {/* Header */}
        <div className="p-5 border-b border-theme flex items-start gap-3 bg-amber-500/10">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-theme-text">{conflictData.title || 'Konflik Sinkronisasi Terdeteksi'}</h3>
            <p className="text-xs text-theme-muted mt-0.5">
              {conflictData.description || 'Data di Supabase Cloud berbeda dengan data di perangkat ini. Pilih data mana yang ingin kamu gunakan.'}
            </p>
          </div>
        </div>

        {/* Content Comparison */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Cloud Version Card */}
            <div className="p-4 rounded-lg border-2 border-accent/60 bg-accent/5 relative flex flex-col justify-between">
              {cloudTime > localTime && (
                <div className="absolute -top-2.5 right-3 bg-accent text-accent-contrast text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Lebih Baru
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 text-accent font-semibold text-xs mb-2">
                  <Cloud className="w-4 h-4" /> Supabase Cloud
                </div>
                <div className="text-xs text-theme-muted space-y-1 mb-3">
                  <p>
                    <span className="text-theme-muted/80">Diperbarui:</span>{' '}
                    <strong className="text-theme-text font-medium">{formatTime(cloudTime)}</strong>
                  </p>
                  <p>
                    <span className="text-theme-muted/80">Mata Kuliah:</span>{' '}
                    <strong className="text-theme-text font-medium">{cloudData.courses?.length || 0} matkul</strong>
                  </p>
                  <p>
                    <span className="text-theme-muted/80">Tugas & Acara:</span>{' '}
                    <strong className="text-theme-text font-medium">{cloudData.tasks?.length || 0} tugas</strong>
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-accent/90 flex items-center gap-1 font-medium mt-2 pt-2 border-t border-accent/20">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Data lokal akan diamankan ke Undo
              </p>
            </div>

            {/* Local Version Card */}
            <div className="p-4 rounded-lg border border-theme bg-theme-surface-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-theme-muted font-semibold text-xs mb-2">
                  <HardDrive className="w-4 h-4" /> Perangkat Ini (Lokal)
                </div>
                <div className="text-xs text-theme-muted space-y-1 mb-3">
                  <p>
                    <span className="text-theme-muted/80">Diperbarui:</span>{' '}
                    <strong className="text-theme-text font-medium">{formatTime(localTime)}</strong>
                  </p>
                  <p>
                    <span className="text-theme-muted/80">Mata Kuliah:</span>{' '}
                    <strong className="text-theme-text font-medium">{localData.courses?.length || 0} matkul</strong>
                  </p>
                  <p>
                    <span className="text-theme-muted/80">Tugas & Acara:</span>{' '}
                    <strong className="text-theme-text font-medium">{localData.tasks?.length || 0} tugas</strong>
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-theme-muted mt-2 pt-2 border-t border-theme">
                Versi data saat ini yang sedang aktif
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-theme-surface-subtle border-t border-theme flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onResolve('cancel')}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-theme-muted hover:text-theme-text rounded-md hover:bg-theme-surface transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onResolve('use_local')}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors"
          >
            Timpa Cloud dengan Lokal
          </button>
          <button
            type="button"
            onClick={() => onResolve('use_cloud')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-accent-contrast bg-accent hover:bg-accent-hover rounded-md shadow-sm transition-colors"
          >
            Gunakan Data Cloud <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncConflictModal;
