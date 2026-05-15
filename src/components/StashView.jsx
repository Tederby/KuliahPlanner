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
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <Inbox className="w-5 h-5" /> Stash Kelas
        </h2>
        <p className="text-sm text-slate-400">
          List kelas yang di-stash termasuk tanggal/jam asli. Pilih aksi untuk jadwal baru atau
          batalkan stash agar kembali ke kalender.
        </p>
        <div className="space-y-3 mt-4">
          {stashes.map((stash) => {
            const course = courses.find((c) => c.id === stash.courseId);
            if (!course) return null;
            return (
              <div
                key={stash.id}
                className="bg-slate-900 p-4 rounded-xl border border-rose-900/30 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-bold text-white text-sm">{course.name}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    <p>Jadwal asli: {stash.originalDate} | {course.startTime}</p>
                    <p>Lokasi: {course.location || 'Belum diisi'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onOpenReschedule(stash)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Atur Jadwal Baru
                  </button>
                  <button
                    onClick={() => onRestoreStash(stash.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-sm transition-colors"
                  >
                    Batalkan Stash
                  </button>
                </div>
              </div>
            );
          })}
          {stashes.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Belum ada kelas yang di-stash.</p>
          )}
        </div>
      </div>

      {editingStash && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold">Jadwal Baru untuk Kelas</h3>
              <p className="text-sm text-slate-400">Atur ulang kelas yang sebelumnya di-stash.</p>
            </div>
            <button onClick={onCancelReschedule} className="text-slate-400 hover:text-slate-200">
              Batal
            </button>
          </div>
          <form onSubmit={onSaveReschedule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tanggal Baru</label>
              <input
                required
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Jam Baru</label>
              <input
                required
                type="time"
                value={rescheduleForm.time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
              >
                Simpan Jadwal Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {reschedules.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold mb-4">Jadwal Ulang yang Sudah Ditetapkan</h3>
          <div className="space-y-3">
            {reschedules.map((rs) => {
              const course = courses.find((c) => c.id === rs.courseId);
              if (!course) return null;
              return (
                <div
                  key={rs.id}
                  className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:justify-between md:items-center gap-3"
                >
                  <div>
                    <div className="font-bold text-white">{course.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Awal: {rs.originalDate} | Baru: {rs.newDate} {rs.newTime}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">Ditandai sebagai kelas terjadwal ulang.</div>
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
