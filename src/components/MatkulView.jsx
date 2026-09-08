import React, { useRef } from 'react';
import { Settings, BookOpen, Plus, X, Trash2, Download, Upload } from 'lucide-react';
import { daysOfWeek } from '../utils/dateUtils';

const MatkulView = ({
  config,
  courses,
  showCourseForm,
  setShowCourseForm,
  newCourse,
  setNewCourse,
  onUpdateConfig,
  onConfigBlur,
  onAddCourse,
  onRemoveCourse,
  onExport,
  onImport,
}) => {
  const importRef = useRef(null);
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
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Data Matkul Induk
          </h2>
          <button
            onClick={() => setShowCourseForm(!showCourseForm)}
            className="bg-accent hover:bg-accent-hover text-accent-contrast px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {showCourseForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} Tambah Matkul
          </button>
        </div>

        {showCourseForm && (
          <form
            onSubmit={onAddCourse}
            className="bg-theme-surface-subtle p-4 rounded-md border border-theme mb-5 grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-theme-muted mb-1">Nama Matkul</label>
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
              <label className="block text-xs text-theme-muted mb-1">Hari</label>
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
              <label className="block text-xs text-theme-muted mb-1">Jam Mulai</label>
              <input
                required
                type="time"
                value={newCourse.startTime}
                onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-muted mb-1">SKS</label>
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
            <div>
              <label className="block text-xs text-theme-muted mb-1">Lokasi Ruang</label>
              <input
                type="text"
                value={newCourse.location}
                onChange={(e) => setNewCourse({ ...newCourse, location: e.target.value })}
                className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                placeholder="Lab A"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-accent hover:bg-accent-hover text-accent-contrast px-4 py-2 rounded-md font-medium text-xs transition-colors shadow-sm"
              >
                Simpan Matkul
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-theme-surface-subtle p-3.5 rounded-md border border-theme flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-sm text-theme-text flex items-center gap-2">
                  {course.name}{' '}
                  <span className="text-[10px] font-mono bg-theme-surface text-theme-muted border border-theme px-1.5 py-0.5 rounded">
                    {course.sks} SKS
                  </span>
                </h3>
                <div className="text-xs text-theme-muted mt-1 flex items-center gap-3">
                  <span className="font-mono">{course.day}, {course.startTime}</span>
                  <span>• {course.location || 'Ruang belum ditentukan'}</span>
                </div>
              </div>
              <button
                onClick={() => onRemoveCourse(course.id)}
                className="text-theme-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-theme-surface p-1.5 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-theme-muted text-xs text-center py-4">Belum ada data mata kuliah.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatkulView;