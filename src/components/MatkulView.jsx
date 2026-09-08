import React, { useRef } from 'react';
import { Settings, BookOpen, Plus, X, Trash2, Download, Upload, Pencil, AlertCircle, Clock, Check } from 'lucide-react';
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
}) => {
  const importRef = useRef(null);

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

      {/* Export / Import */}
      <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
        <h2 className="text-lg font-bold text-theme-text mb-1 flex items-center gap-2">
          <Download className="w-5 h-5 text-accent" /> Backup & Restore Data
        </h2>
        <p className="text-xs text-theme-muted mb-4">
          Export buat backup, import untuk restore atau pindah device. Data disimpan di localStorage browser.
        </p>
        <div className="flex flex-wrap gap-2.5">
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
        </div>
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