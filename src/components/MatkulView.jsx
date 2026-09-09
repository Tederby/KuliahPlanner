import React, { useRef, useState } from 'react';
import {
  Settings, BookOpen, Plus, X, Trash2, Download, Upload, Pencil,
  AlertCircle, Clock, Check, Cloud, RefreshCw, Undo2, LogOut, CheckCircle2, User, Palette,
  Bell, BellRing, UserCheck, AlertTriangle
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { daysOfWeek } from '../utils/dateUtils';
import {
  COURSE_COLOR_PALETTE,
  getCourseColor,
  calculateCourseEndTime,
  checkCourseClash,
} from '../utils/courseColors';
import { sendTestNotification } from '../utils/notificationService';

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
  theme,
  attendances = {},
  onSetAttendance,
  getCourseAttendanceStats,
  notificationSettings = {},
  onUpdateNotificationSettings,
  maxAbsencePercent = 25,
  onUpdateMaxAbsencePercent,
  showToast,
}) => {
  const importRef = useRef(null);
  const [showUndoHistory, setShowUndoHistory] = useState(false);
  const [activeAttendanceCourse, setActiveAttendanceCourse] = useState(null);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const totalSks = courses.reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
  const liveEndTime = calculateCourseEndTime(newCourse.startTime, newCourse.sks, config.sksMinutes);
  const clashInfo = checkCourseClash(newCourse, courses, editingCourseId, config.sksMinutes);

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await sendTestNotification();
      showToast?.('Notifikasi tes berhasil dikirim!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Gagal mengirim notifikasi tes.', 'warning');
    } finally {
      setIsTestingNotification(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Theme & Palette Settings */}
      {theme && (
        <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
          <h2 className="text-lg font-bold text-theme-text mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent" /> Tampilan & Tema Warna
          </h2>
          <div className="max-w-md">
            <ThemeSwitcher
              themeMode={theme.themeMode}
              setThemeMode={theme.setThemeMode}
              accentColor={theme.accentColor}
              setAccentColor={theme.setAccentColor}
              isMonochrome={theme.isMonochrome}
              setMonochrome={theme.setMonochrome}
              COLOR_PRESETS={theme.COLOR_PRESETS}
            />
          </div>
        </div>
      )}

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
          <div>
            <label className="block text-xs text-theme-muted mb-1">Toleransi Absen / Bolos (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={maxAbsencePercent}
              onChange={(e) => onUpdateMaxAbsencePercent?.(Number(e.target.value) || 0)}
              className="w-full bg-theme-surface-subtle border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Pengaturan Notifikasi & Pengingat */}
      <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
              <BellRing className="w-5 h-5 text-accent" /> Pengingat & Notifikasi Lokal
            </h2>
            <p className="text-xs text-theme-muted mt-0.5">
              Notifikasi offline native Android (.apk) untuk pengingat kelas, deadline tugas, dan briefing pagi.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestNotification}
            disabled={isTestingNotification}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Bell className={`w-3.5 h-3.5 text-accent ${isTestingNotification ? 'animate-bounce' : ''}`} />
            <span>{isTestingNotification ? 'Mengirim...' : 'Uji Coba Notifikasi'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Kelas Lead Time */}
          <div className="p-3.5 bg-theme-surface-subtle border border-theme rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-theme-text">Pengingat Sebelum Kelas</label>
              <input
                type="checkbox"
                checked={notificationSettings.classLeadMinutes > 0}
                onChange={(e) =>
                  onUpdateNotificationSettings?.({
                    classLeadMinutes: e.target.checked ? 15 : 0,
                  })
                }
                className="rounded border-theme text-accent focus:ring-accent"
              />
            </div>
            <p className="text-[11px] text-theme-muted">Bunyikan alarm pengingat sebelum jadwal kuliah dimulai.</p>
            {notificationSettings.classLeadMinutes > 0 && (
              <div className="pt-1">
                <select
                  value={notificationSettings.classLeadMinutes}
                  onChange={(e) =>
                    onUpdateNotificationSettings?.({
                      classLeadMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-theme-surface border border-theme rounded-md p-1.5 text-xs text-theme-text outline-none focus:border-accent"
                >
                  <option value={10}>10 menit sebelum mulai</option>
                  <option value={15}>15 menit sebelum mulai (Rekomendasi)</option>
                  <option value={30}>30 menit sebelum mulai</option>
                  <option value={45}>45 menit sebelum mulai</option>
                  <option value={60}>1 jam sebelum mulai</option>
                </select>
              </div>
            )}
          </div>

          {/* Daily Morning Briefing */}
          <div className="p-3.5 bg-theme-surface-subtle border border-theme rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-theme-text">Daily Briefing Pagi</label>
              <input
                type="checkbox"
                checked={notificationSettings.dailyBriefing !== false}
                onChange={(e) =>
                  onUpdateNotificationSettings?.({
                    dailyBriefing: e.target.checked,
                  })
                }
                className="rounded border-theme text-accent focus:ring-accent"
              />
            </div>
            <p className="text-[11px] text-theme-muted">Ringkasan jadwal kelas dan tugas deadline hari ini.</p>
            {notificationSettings.dailyBriefing !== false && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] text-theme-muted">Waktu:</span>
                <input
                  type="time"
                  value={notificationSettings.dailyBriefingTime || '07:00'}
                  onChange={(e) =>
                    onUpdateNotificationSettings?.({
                      dailyBriefingTime: e.target.value,
                    })
                  }
                  className="bg-theme-surface border border-theme rounded-md px-2 py-1 text-xs text-theme-text outline-none focus:border-accent"
                />
              </div>
            )}
          </div>

          {/* Task Deadline Reminders */}
          <div className="p-3.5 bg-theme-surface-subtle border border-theme rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-theme-text">Pengingat Deadline Tugas</label>
              <input
                type="checkbox"
                checked={notificationSettings.taskReminders !== false}
                onChange={(e) =>
                  onUpdateNotificationSettings?.({
                    taskReminders: e.target.checked,
                  })
                }
                className="rounded border-theme text-accent focus:ring-accent"
              />
            </div>
            <p className="text-[11px] text-theme-muted">Peringatan otomatis H-3 jam sebelum deadline tugas yang belum selesai.</p>
          </div>
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
            const courseStats = getCourseAttendanceStats ? getCourseAttendanceStats(course.id, config.totalMeetings) : null;

            return (
              <div
                key={course.id}
                className="bg-theme-surface-subtle p-3.5 rounded-md border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-theme-subtle"
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

                    {/* Attendance stats summary */}
                    {courseStats && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-theme-surface text-theme-muted border border-theme">
                          Presensi: <strong className="text-theme-text">{courseStats.presentCount}/{courseStats.totalMeetings}</strong> ({courseStats.attendanceRate}%)
                        </span>
                        <span className={`px-2 py-0.5 rounded font-medium border ${
                          courseStats.isDanger
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                            : courseStats.isWarning
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                        }`}>
                          Sisa jatah bolos: <strong>{courseStats.remainingAbsence}x</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setActiveAttendanceCourse(course)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-theme-surface hover:bg-theme-surface-subtle text-theme-text border border-theme font-medium transition-colors shadow-2xs"
                    title="Buka presensi pertemuan mata kuliah"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-accent" />
                    <span>Presensi</span>
                  </button>
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

      {/* Modal Presensi 14 Pertemuan */}
      {activeAttendanceCourse && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setActiveAttendanceCourse(null)}
        >
          <div
            className="bg-theme-surface rounded-t-2xl sm:rounded-xl border-t sm:border border-theme shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out_sm:animate-none]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="w-10 h-1 bg-theme-muted/30 rounded-full mx-auto my-2 sm:hidden shrink-0" />

            <div className="bg-theme-surface-subtle border-b border-theme p-4 sm:p-5 flex justify-between items-start gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getCourseColor(activeAttendanceCourse) }}
                  />
                  <h3 className="font-bold text-base text-theme-text">
                    Presensi: {activeAttendanceCourse.name}
                  </h3>
                </div>
                <p className="text-xs text-theme-muted">
                  Catat kehadiran tiap pertemuan untuk memantau jatah tidak hadir & syarat ujian semester.
                </p>
              </div>
              <button
                onClick={() => setActiveAttendanceCourse(null)}
                className="text-theme-muted hover:text-theme-text p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance stats banner in modal */}
            {(() => {
              const modalStats = getCourseAttendanceStats?.(activeAttendanceCourse.id, config.totalMeetings);
              if (!modalStats) return null;
              return (
                <div className="p-4 bg-theme-surface border-b border-theme space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      <span className="block font-bold text-sm">{modalStats.presentCount}</span>
                      <span className="text-[10px]">Hadir</span>
                    </div>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                      <span className="block font-bold text-sm">{modalStats.permitCount}</span>
                      <span className="text-[10px]">Izin/Sakit</span>
                    </div>
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                      <span className="block font-bold text-sm">{modalStats.absentCount}</span>
                      <span className="text-[10px]">Alpa</span>
                    </div>
                    <div className={`p-2 rounded border font-semibold ${
                      modalStats.isDanger
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
                        : modalStats.isWarning
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                        : 'bg-theme-surface-subtle text-theme-text border-theme'
                    }`}>
                      <span className="block font-bold text-sm">{modalStats.remainingAbsence}x</span>
                      <span className="text-[10px]">Sisa Bolos</span>
                    </div>
                  </div>

                  {modalStats.isDanger && (
                    <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Kamu telah melebihi batas jatah bolos ({modalStats.maxAllowedAbsence}x). Hubungi dosen atau bagian akademik!
                    </div>
                  )}
                </div>
              );
            })()}

            {/* List of Meetings */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 max-h-[50vh]">
              {Array.from({ length: config.totalMeetings || 14 }, (_, i) => i + 1).map((mNum) => {
                const currentStatus = attendances[`${activeAttendanceCourse.id}_${mNum}`];
                return (
                  <div
                    key={mNum}
                    className="p-2.5 bg-theme-surface-subtle border border-theme rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-theme-surface border border-theme text-theme-text font-bold text-[11px] flex items-center justify-center shrink-0">
                        {mNum}
                      </span>
                      <span className="text-xs font-semibold text-theme-text">Pertemuan {mNum}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSetAttendance?.(activeAttendanceCourse.id, mNum, currentStatus === 'present' ? null : 'present')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-theme-surface text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        ✓ Hadir
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetAttendance?.(activeAttendanceCourse.id, mNum, currentStatus === 'permit' ? null : 'permit')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                          currentStatus === 'permit'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-theme-surface text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                      >
                        ℹ Izin
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetAttendance?.(activeAttendanceCourse.id, mNum, currentStatus === 'absent' ? null : 'absent')}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-theme-surface text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        }`}
                      >
                        ✕ Alpa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-theme-surface-subtle border-t border-theme flex justify-end pb-[calc(var(--safe-area-bottom)+1rem)] sm:pb-4">
              <button
                onClick={() => setActiveAttendanceCourse(null)}
                className="px-4 py-2 bg-theme-surface hover:bg-theme-surface-subtle text-theme-text border border-theme text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatkulView;