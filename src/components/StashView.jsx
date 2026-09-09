import React from 'react';
import { Inbox } from 'lucide-react';

const StashView = ({
  stashes,
  reschedules,
  courses,
  editingStash,
  rescheduleForm,
  setRescheduleForm,
  onRestoreStash,
  onOpenReschedule,
  onCancelReschedule,
  onSaveReschedule,
  onReturnRescheduledToStash,
}) => {
  return (
    <div className="space-y-5">
      <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
        <h2 className="text-lg font-bold text-theme-text mb-2 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-accent" /> Stash Kelas
        </h2>
        <p className="text-xs text-theme-muted">
          List kelas yang di-stash dari kalender. Atur jadwal baru atau batalkan stash agar kembali ke slot semula.
        </p>
        <div className="space-y-2 mt-4">
          {stashes.map((stash) => {
            const course = courses.find((c) => c.id === stash.courseId);
            if (!course) return null;
            return (
              <div
                key={stash.id}
                className="bg-theme-surface-subtle p-3.5 rounded-md border border-rose-200 dark:border-rose-950/50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-sm text-theme-text">{course.name}</h3>
                  <div className="text-xs text-theme-muted mt-1 flex items-center gap-2 flex-wrap">
                    <span className="font-mono bg-theme-surface text-theme-muted border border-theme px-1.5 py-0.5 rounded text-[10px]">
                      P-{stash.meetingNum || '?'}
                    </span>
                    <span className="text-[10px] text-theme-muted">
                      Minggu #{stash.weekNum || '?'}
                    </span>
                  </div>
                  <div className="text-xs text-theme-muted mt-1 font-mono">
                    <p>Jadwal asli: {stash.originalDate} | {stash.originalTime || course.startTime}</p>
                    <p className="font-sans">Lokasi: {course.location || 'Belum diisi'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => onOpenReschedule(stash)}
                    className="flex-1 md:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm text-center"
                  >
                    Atur Jadwal Baru
                  </button>
                  <button
                    onClick={() => onRestoreStash(stash.id)}
                    className="flex-1 md:flex-none px-3 py-2 bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Batalkan Stash
                  </button>
                </div>
              </div>
            );
          })}
          {stashes.length === 0 && (
            <p className="text-theme-muted text-xs text-center py-4">Belum ada kelas yang di-stash.</p>
          )}
        </div>
      </div>

      {editingStash && (
        <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-theme-text">Jadwal Baru untuk Kelas</h3>
              <p className="text-xs text-theme-muted">Atur ulang kelas yang sebelumnya di-stash.</p>
            </div>
            <button onClick={onCancelReschedule} className="text-xs text-theme-muted hover:text-theme-text">
              Batal
            </button>
          </div>
          <form onSubmit={onSaveReschedule} className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs text-theme-muted mb-1">Tanggal Baru</label>
              <input
                required
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                className="w-full bg-theme-surface-subtle border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-muted mb-1">Jam Baru</label>
              <input
                required
                type="time"
                value={rescheduleForm.time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                className="w-full bg-theme-surface-subtle border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-accent-contrast px-3.5 py-2 rounded-md font-medium text-xs transition-colors shadow-sm"
              >
                Simpan Jadwal Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {reschedules.length > 0 && (
        <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
          <h3 className="text-sm font-semibold text-theme-text mb-3">Jadwal Ulang yang Sudah Ditetapkan</h3>
          <div className="space-y-2">
            {reschedules.map((rs) => {
              const course = courses.find((c) => c.id === rs.courseId);
              if (!course) return null;
              return (
                <div
                  key={rs.id}
                  className="bg-theme-surface-subtle p-3.5 rounded-md border border-theme flex flex-col md:flex-row md:justify-between md:items-center gap-2"
                >
                  <div>
                    <div className="font-semibold text-sm text-theme-text flex items-center gap-2">
                      {course.name}
                      <span className="text-[10px] font-mono bg-theme-surface text-theme-muted border border-theme px-1.5 py-0.5 rounded">
                        P-{rs.meetingNum || '?'}
                      </span>
                    </div>
                    <div className="text-xs text-theme-muted mt-0.5 font-mono">
                      Awal: {rs.originalDate} | Baru: {rs.newDate} {rs.newTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-[11px] text-theme-muted bg-theme-surface px-2 py-0.5 rounded border border-theme">Terjadwal ulang</span>
                    {onReturnRescheduledToStash && (
                      <button
                        onClick={() => onReturnRescheduledToStash(rs.id)}
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      >
                        Kembalikan ke Stash
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StashView;
