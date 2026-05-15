import React from 'react';
import { Clock, Info, Plus, Inbox, AlertTriangle, X } from 'lucide-react';

const EventModal = ({ event, onClose, onStash, onReturnToStash, onOpenTask }) => {
  if (!event) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-indigo-900/40 border-b border-indigo-500/20 p-6">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              Pertemuan Ke-{event.meetingNum}
            </span>
            <span className="text-indigo-300 text-xs font-mono">Minggu Sem Ke-{event.weekNum}</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">{event.name}</h2>
          <div className="flex flex-col gap-2">
            <div className="text-indigo-200 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> {event.date} | {event.startTime} - {event.endTime}
            </div>
            {event.isRescheduled && (
              <div className="inline-flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded bg-amber-500/15 border border-amber-500/20">
                <span>Rescheduled</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <span className="block text-slate-500 text-xs mb-1">Lokasi Ruangan</span>
              {event.location} ({event.sks} SKS)
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => onOpenTask(event.id, event.date)}
              className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Tambah Tugas Untuk Matkul Ini
            </button>

            {event.isRescheduled ? (
              <button
                onClick={() => onReturnToStash(event.rescheduleId)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
              >
                <Inbox className="w-5 h-5" /> Kembalikan ke Stash
              </button>
            ) : (
              <button
                onClick={() => onStash(event.id, event.date, event.meetingNum, event.weekNum, event.startTime)}
                className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" /> Dosen Ghosting? Stash Kelas Ini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
