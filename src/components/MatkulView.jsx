import React, { useRef, useState } from 'react';
import {
  Settings, BookOpen, Plus, X, Trash2, Download, Upload, Pencil,
  AlertCircle, Clock, Check, Cloud, RefreshCw, Undo2, LogOut, CheckCircle2, User
} from 'lucide-react';
import { daysOfWeek } from '../utils/dateUtils';
import {
  COURSE_COLOR_PALETTE,
  getCourseColor,
  calculateCourseEndTime,
  checkCourseClash,
} from '../utils/courseColors';

const MatkulView = ({
  config,
  courses,
  showCourseForm,
  setShowCourseForm,
  newCourse,
  setNewCourse,
  editingCourseId,
  onStartEditCourse,
  onCancelEditCourse,
  onUpdateConfig,
  onConfigBlur,
  onAddCourse,
  onRemoveCourse,
  onExport,
  onImport,
  undoCount = 0,
  onUndo,
  undoHistory = [],
  onClearUndo,
  cloudSync,
}) => {
  const importRef = useRef(null);
  const [showUndoHistory, setShowUndoHistory] = useState(false);

  const totalSks = courses.reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
  const liveEndTime = calculateCourseEndTime(newCourse.startTime, newCourse.sks, config.sksMinutes);
  const clashInfo = checkCourseClash(newCourse, courses, editingCourseId, config.sksMinutes);

  return (
    <div className="space-y-5">
      {/* Global Settings */}
      <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
        <h2 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" /> Konfigurasi Semester
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { label: 'Tanggal Mulai Semester', key: 'semesterStart', type: 'date' },
            { label: 'Durasi 1 SKS (Menit)', key: 'sksMinutes', type: 'number' },
            { label: 'Target Pertemuan', key: 'totalMeetings', type: 'number' },
            { label: 'Berapa kali kuliah sampai UTS?', key: 'meetingsBeforeUTS', type: 'number' },
            { label: 'Berapa lama minggu UTS?', key: 'utsWeeks', type: 'number' },
            { label: 'Berapa kali kuliah sampai UAS?', key: 'meetingsBeforeUAS', type: 'number' },
            { label: 'Berapa lama minggu UAS?', key: 'uasWeeks', type: 'number' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs text-theme-muted mb-1">{label}</label>
              <input
                type={type}
                value={type === 'number' ? (config[key] || '') : config[key]}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    [key]: e.target.value === '' ? null : type === 'number' ? Number(e.target.value) : e.target.value,
                  })
                }
                onBlur={type === 'number' ? onConfigBlur : undefined}
                className="w-full bg-theme-surface-subtle border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Akun Cloud & Sinkronisasi */}
      <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <Cloud className="w-5 h-5 text-accent" /> Akun Cloud & Sinkronisasi
            </h2>
            <p className="text-xs text-theme-muted mt-0.5">
              Sinkronkan data jadwal dan tugas secara instan ke cloud Supabase agar selalu update di laptop dan HP.
            </p>
          </div>
          {cloudSync?.userProfile && (
            <div className="flex items-center gap-2">
              <button
                onClick={cloudSync?.onSync}
                disabled={cloudSync?.isSyncing}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs transition-all shadow-sm ${
                  cloudSync?.isSyncing
                    ? 'bg-accent/70 text-accent-contrast cursor-wait'
                    : 'bg-accent hover:bg-accent-hover text-accent-contrast'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSync?.isSyncing ? 'animate-spin' : ''}`} />
                {cloudSync?.isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
              </button>
            </div>
          )}
        </div>

        {!cloudSync?.userProfile ? (
          <div className="p-5 bg-theme-surface-subtle border border-theme rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-semibold text-theme-text">Belum Terhubung ke Akun Cloud</h3>
                <p className="text-xs text-theme-muted max-w-md">
                  Gunakan username dan password untuk masuk atau mendaftar tanpa verifikasi email, lalu nikmati sinkronisasi otomatis antar-perangkat.
                </p>
              </div>
              <button
                onClick={cloudSync?.onLogin}
                disabled={cloudSync?.isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-theme-surface hover:bg-theme-surface-subtle text-theme-text border border-theme font-medium text-xs shadow-sm hover:border-accent/40 active:scale-[0.99] transition-all shrink-0"
              >
                <Cloud className="w-4 h-4 text-accent" />
                <span>{cloudSync?.isSyncing ? 'Menghubungkan...' : 'Masuk / Buat Akun'}</span>
              </button>
            </div>
            <p className="text-[11px] text-theme-muted text-center sm:text-left pt-2 border-t border-theme-subtle">
              Dengan menggunakan layanan cloud, Anda menyetujui{' '}
              <a href="privacy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-theme-text">
                Kebijakan Privasi
              </a>{' '}
              dan{' '}
              <a href="terms.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-theme-text">
                Syarat & Ketentuan
              </a>{' '}
              KuliahPlanner.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-theme-surface-subtle border border-theme rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-accent-contrast font-bold text-sm flex items-center justify-center">
                  {(cloudSync.userProfile.name || cloudSync.userProfile.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-theme-text">
                      @{cloudSync.userProfile.name || cloudSync.userProfile.username}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Terhubung
                    </span>
                  </div>
                  <p className="text-xs text-theme-muted">Supabase Cloud Storage</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={cloudSync?.onLogout}
                  className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar Akun
                </button>
              </div>
            </div>

            <div className="p-3 bg-theme-surface-subtle border border-theme rounded-md flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cloudSync.autoSyncEnabled}
                    onChange={(e) => cloudSync.onToggleAutoSync?.(e.target.checked)}
                    className="rounded border-theme text-accent focus:ring-accent"
                  />
                  <span className="font-medium text-theme-text">Sinkronisasi Otomatis di Latar Belakang</span>
                </label>
              </div>
              <div className="text-theme-muted">
                Terakhir sinkron:{' '}
                <strong className="text-theme-text font-medium">
                  {cloudSync.lastSyncTime
                    ? new Date(cloudSync.lastSyncTime).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Belum pernah'}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export / Import & Undo */}
      <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-theme-text mb-1 flex items-center gap-2">
            <Download className="w-5 h-5 text-accent" /> Backup & Restore Data
          </h2>
          <p className="text-xs text-theme-muted">
            Export buat backup file, import untuk restore, dan gunakan Undo Lokal jika salah menghapus data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-accent hover:bg-accent-hover text-accent-contrast rounded-md font-medium text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme rounded-md font-medium text-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Import JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => { onImport(e.target.files?.[0]); e.target.value = ''; }}
          />

          <div className="h-6 w-px bg-theme-border mx-1 hidden sm:block" />

          <button
            onClick={onUndo}
            disabled={!undoCount}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-medium text-xs border transition-colors ${
              undoCount
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-sm'
                : 'bg-theme-surface-subtle text-theme-muted/50 border-theme cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            Urungkan Aksi Terakhir {undoCount > 0 && `(${undoCount})`}
          </button>

          {undoCount > 0 && (
            <button
              onClick={() => setShowUndoHistory(!showUndoHistory)}
              className="text-xs text-theme-muted hover:text-theme-text underline"
            >
              {showUndoHistory ? 'Tutup Riwayat' : 'Lihat Riwayat Undo'}
            </button>
          )}
        </div>

        {/* Undo History List */}
        {showUndoHistory && undoHistory?.length > 0 && (
          <div className="p-3 bg-theme-surface-subtle rounded-md border border-theme space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-theme-muted">
              <span>Riwayat Snapshot Lokal (Maks. 10)</span>
              {onClearUndo && (
                <button
                  onClick={onClearUndo}
                  className="text-rose-500 hover:underline font-normal text-[11px]"
                >
                  Bersihkan Riwayat
                </button>
              )}
            </div>
            <ul className="space-y-1.5 max-h-40 overflow-y-auto">
              {undoHistory.map((item, idx) => (
                <li
                  key={item.id || idx}
                  className="text-xs text-theme-text flex items-center justify-between py-1 px-2 rounded bg-theme-surface border border-theme"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[11px] text-theme-muted">
                    {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Course List & Add */}
      <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" /> Data Matkul Induk
            </h2>
            <span className="text-xs font-medium text-theme-muted bg-theme-surface-subtle px-2 py-0.5 rounded border border-theme">
              Total {totalSks} SKS ({courses.length} Matkul)
            </span>
          </div>
          <button
            onClick={() => {
              if (showCourseForm) {
                onCancelEditCourse?.();
                setShowCourseForm(false);
              } else {
                setShowCourseForm(true);
              }
            }}
            className="bg-accent hover:bg-accent-hover text-accent-contrast px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {showCourseForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCourseForm ? 'Tutup Form' : 'Tambah Matkul'}
          </button>
        </div>

        {showCourseForm && (
          <form
            onSubmit={onAddCourse}
            className={`bg-theme-surface-subtle p-4 rounded-md border mb-5 space-y-4 ${
              editingCourseId ? 'border-amber-500/50' : 'border-theme'
            }`}
          >
            {editingCourseId && (
              <div className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Pencil className="w-3 h-3" /> Mengedit mata kuliah
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs text-theme-muted mb-1">Nama Matkul *</label>
                <input
                  required
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  placeholder="Kalkulus Lanjut"
                />
              </div>
              <div>
                <label className="block text-xs text-theme-muted mb-1">Hari *</label>
                <select
                  value={newCourse.day}
                  onChange={(e) => setNewCourse({ ...newCourse, day: e.target.value })}
                  className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs text-theme-muted">Jam Mulai *</label>
                  {liveEndTime && (
                    <span className="text-[10px] text-accent font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Selesai: {liveEndTime}
                    </span>
                  )}
                </div>
                <input
                  required
                  type="time"
                  value={newCourse.startTime}
                  onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                  className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-theme-muted mb-1">
                  SKS (Bobot) <span className="text-theme-muted opacity-80">(1-6 SKS)</span> *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="6"
                  value={newCourse.sks}
                  onChange={(e) => setNewCourse({ ...newCourse, sks: Number(e.target.value) })}
                  className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs text-theme-muted mb-1">Lokasi Ruang</label>
                <input
                  type="text"
                  value={newCourse.location}
                  onChange={(e) => setNewCourse({ ...newCourse, location: e.target.value })}
                  className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  placeholder="Gedung B, Lab Komputer 2"
                />
              </div>

              {/* Color Picker Swatches */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs text-theme-muted mb-1.5">
                  Warna Label Matkul <span className="text-theme-muted opacity-80">(opsional, auto-assign jika kosong)</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COURSE_COLOR_PALETTE.map((c) => {
                    const isSelected = (newCourse.color || '').toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewCourse({ ...newCourse, color: c.hex })}
                        style={{ backgroundColor: c.hex }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'ring-2 ring-offset-2 ring-offset-theme-surface ring-theme-text scale-110' : 'hover:scale-105 opacity-85 hover:opacity-100'
                        }`}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Clash Warning Banner */}
            {clashInfo.hasClash && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Peringatan Bentrok Jadwal:</span> Jadwal ini bertabrakan dengan matkul{' '}
                  <span className="font-medium underline">{clashInfo.clashingCourse.name}</span> ({clashInfo.clashingCourse.startTime} -{' '}
                  {calculateCourseEndTime(clashInfo.clashingCourse.startTime, clashInfo.clashingCourse.sks, config.sksMinutes)}).
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              {editingCourseId && (
                <button
                  type="button"
                  onClick={onCancelEditCourse}
                  className="bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme px-4 py-2 rounded-md font-medium text-xs transition-colors"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className={`${
                  editingCourseId
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-accent hover:bg-accent-hover text-accent-contrast'
                } px-4 py-2 rounded-md font-medium text-xs transition-colors shadow-sm`}
              >
                {editingCourseId ? 'Perbarui Matkul' : 'Simpan Matkul'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {courses.map((course, idx) => {
            const courseColor = getCourseColor(course, idx);
            const endTime = calculateCourseEndTime(course.startTime, course.sks, config.sksMinutes);
            return (
              <div
                key={course.id}
                className="bg-theme-surface-subtle p-3.5 rounded-md border border-theme flex justify-between items-center gap-3 transition-colors hover:border-theme-subtle"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 mt-1 shadow-xs"
                    style={{ backgroundColor: courseColor }}
                    title={`Label warna: ${courseColor}`}
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-theme-text flex items-center gap-2 flex-wrap">
                      <span className="truncate">{course.name}</span>
                      <span className="text-[10px] font-mono bg-theme-surface text-theme-muted border border-theme px-1.5 py-0.5 rounded shrink-0">
                        {course.sks} SKS
                      </span>
                    </h3>
                    <div className="text-xs text-theme-muted mt-1 flex items-center gap-3 flex-wrap">
                      <span className="font-mono">
                        {course.day}, {course.startTime}{endTime ? ` - ${endTime}` : ''}
                      </span>
                      <span>• {course.location || 'Ruang belum ditentukan'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onStartEditCourse(course.id)}
                    className="text-theme-muted hover:text-accent hover:bg-theme-surface p-1.5 rounded transition-colors"
                    title="Edit data mata kuliah"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveCourse(course.id)}
                    className="text-theme-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-theme-surface p-1.5 rounded transition-colors"
                    title="Hapus mata kuliah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <p className="text-theme-muted text-xs text-center py-4">Belum ada data mata kuliah.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatkulView;