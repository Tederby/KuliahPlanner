import React, { useEffect } from 'react';
import { Clock, Info, Plus, Inbox, AlertTriangle, X } from 'lucide-react';

const EventModal = ({
  event,
  onClose,
  onStash,
  onReturnToStash,
  onOpenTask,
  attendances = {},
  onSetAttendance,
  getCourseAttendanceStats,
}) => {
  // R3: Close on Escape key
  useEffect(() => {
    if (!event) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  const courseIdKey = event.courseId || event.id;
  const currentAttendance = event.meetingNum ? attendances[`${courseIdKey}_${event.meetingNum}`] : null;
  const attendanceStats = (courseIdKey && getCourseAttendanceStats)
    ? getCourseAttendanceStats(courseIdKey)
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-theme-surface rounded-t-2xl sm:rounded-xl border-t sm:border border-theme shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out_sm:animate-none]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-theme-muted/30 rounded-full mx-auto my-2 sm:hidden shrink-0" />

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

        <div className="p-5 space-y-4 overflow-y-auto pb-[calc(var(--safe-area-bottom)+1.25rem)] sm:pb-5">
          <div className="flex items-start gap-3 bg-theme-surface-subtle p-3 rounded-md border border-theme">
            <Info className="w-4 h-4 text-theme-muted shrink-0 mt-0.5" />
            <div className="text-xs text-theme-text">
              <span className="block text-theme-muted mb-0.5">Lokasi & Bobot</span>
              {event.location || 'Ruang belum diatur'} • {event.sks} SKS
            </div>
          </div>

          {/* Attendance Tracker & Jatah Bolos Section */}
          {event.meetingNum && (
            <div className="bg-theme-surface-subtle border border-theme rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-theme-text">Status Presensi Pertemuan Ini</span>
                {currentAttendance && (
                  <button
                    onClick={() => onSetAttendance?.(courseIdKey, event.meetingNum, null)}
                    className="text-[10px] text-theme-muted hover:text-rose-500 underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Attendance Toggle Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSetAttendance?.(courseIdKey, event.meetingNum, currentAttendance === 'present' ? null : 'present')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    currentAttendance === 'present'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                      : 'bg-theme-surface hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                  }`}
                >
                  <span>✓</span> Hadir
                </button>

                <button
                  type="button"
                  onClick={() => onSetAttendance?.(courseIdKey, event.meetingNum, currentAttendance === 'permit' ? null : 'permit')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    currentAttendance === 'permit'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-theme-surface hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                  }`}
                >
                  <span>ℹ</span> Izin / Sakit
                </button>

                <button
                  type="button"
                  onClick={() => onSetAttendance?.(courseIdKey, event.meetingNum, currentAttendance === 'absent' ? null : 'absent')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    currentAttendance === 'absent'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-theme-surface hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800/60'
                  }`}
                >
                  <span>✕</span> Alpa / Bolos
                </button>
              </div>

              {/* Jatah Bolos Counter */}
              {attendanceStats && (
                <div className="pt-2 border-t border-theme/60 text-[11px] space-y-1">
                  <div className="flex justify-between items-center text-theme-muted">
                    <span>Kehadiran Total: <strong className="text-theme-text">{attendanceStats.presentCount}/{attendanceStats.totalMeetings}</strong> ({attendanceStats.attendanceRate}%)</span>
                    <span>Alpa: <strong className={attendanceStats.absentCount > 0 ? 'text-rose-500' : 'text-theme-text'}>{attendanceStats.absentCount}x</strong></span>
                  </div>

                  <div className="flex items-center justify-between font-medium">
                    <span className="text-theme-muted">Sisa Jatah Bolos:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      attendanceStats.isDanger
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                        : attendanceStats.isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {attendanceStats.remainingAbsence} kali lagi (Maks. {attendanceStats.maxAllowedAbsence}x)
                    </span>
                  </div>

                  {attendanceStats.isDanger && (
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                      ⚠️ Melebihi batas absen! Kamu berisiko dilarang mengikuti UAS.
                    </p>
                  )}
                  {attendanceStats.isWarning && !attendanceStats.isDanger && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      ⚡ Peringatan: Jatah bolos tersisa {attendanceStats.remainingAbsence}x lagi!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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
