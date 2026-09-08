import React from 'react';
import { Clock, Info, Plus, Inbox, AlertTriangle, X } from 'lucide-react';

const EventModal = ({ event, onClose, onStash, onReturnToStash, onOpenTask }) => {
  if (!event) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-theme-surface rounded-lg border border-theme shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-theme-surface-subtle border-b border-theme p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="bg-theme-surface text-theme-muted border border-theme text-[10px] font-mono font-medium px-2 py-0.5 rounded">
              Pertemuan Ke-{event.meetingNum}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-theme-muted text-xs font-mono">Minggu #{event.weekNum}</span>
              <button onClick={onClose} className="text-theme-muted hover:text-theme-text transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h2 className="text-lg font-bold text-theme-text leading-tight">{event.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="text-theme-text text-xs font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-theme-muted" /> {event.date} | {event.startTime} - {event.endTime}
            </div>
            {event.isRescheduled && (
              <span className="text-amber-700 dark:text-amber-300 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60">
                Rescheduled
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 bg-theme-surface-subtle p-3 rounded-md border border-theme">
            <Info className="w-4 h-4 text-theme-muted shrink-0 mt-0.5" />
            <div className="text-xs text-theme-text">
              <span className="block text-theme-muted mb-0.5">Lokasi & Bobot</span>
              {event.location} • {event.sks} SKS
            </div>
          </div>

          <div className="pt-2 border-t border-theme space-y-2">
            <button
              onClick={() => onOpenTask(event.id, event.date)}
              className="w-full bg-accent hover:bg-accent-hover text-accent-contrast py-2 rounded-md font-medium text-xs transition-colors flex justify-center items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Tugas Untuk Matkul Ini
            </button>

            {event.isRescheduled ? (
              <button
                onClick={() => onReturnToStash(event.rescheduleId)}
                className="w-full bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme py-2 rounded-md font-medium text-xs transition-colors flex justify-center items-center gap-1.5"
              >
                <Inbox className="w-4 h-4" /> Kembalikan ke Stash
              </button>
            ) : (
              <button
                onClick={() => onStash(event.id, event.date, event.meetingNum, event.weekNum, event.startTime)}
                className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 py-2 rounded-md font-medium text-xs transition-colors flex justify-center items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" /> Dosen Ghosting? Stash Kelas Ini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
