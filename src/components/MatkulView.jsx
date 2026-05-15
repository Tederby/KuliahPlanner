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
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Konfigurasi Semester
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="block text-xs text-slate-400 mb-1">{label}</label>
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
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Export / Import */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Download className="w-5 h-5" /> Backup & Restore Data
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Export buat backup, import untuk restore atau pindah device. Data localStorage bisa hilang kapan aja, jadi sering-sering backup.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-xl font-bold transition-colors"
          >
            <Upload className="w-4 h-4" /> Import JSON
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
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Data Matkul Induk
          </h2>
          <button
            onClick={() => setShowCourseForm(!showCourseForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
          >
            {showCourseForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} Tambah Matkul
          </button>
        </div>

        {showCourseForm && (
          <form
            onSubmit={onAddCourse}
            className="bg-slate-900 p-4 rounded-xl border border-indigo-500/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-slate-400 mb-1">Nama Matkul</label>
              <input
                required
                type="text"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
                placeholder="Kalkulus Lanjut"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hari</label>
              <select
                value={newCourse.day}
                onChange={(e) => setNewCourse({ ...newCourse, day: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              >
                {daysOfWeek.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Jam Mulai</label>
              <input
                required
                type="time"
                value={newCourse.startTime}
                onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">SKS</label>
              <input
                required
                type="number"
                min="1"
                max="6"
                value={newCourse.sks}
                onChange={(e) => setNewCourse({ ...newCourse, sks: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Lokasi Ruang</label>
              <input
                type="text"
                value={newCourse.location}
                onChange={(e) => setNewCourse({ ...newCourse, location: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
                placeholder="Lab A"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-bold transition-colors"
              >
                Simpan Matkul
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  {course.name}{' '}
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {course.sks} SKS
                  </span>
                </h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>{course.day}, {course.startTime}</span>
                  <span>• {course.location}</span>
                </div>
              </div>
              <button
                onClick={() => onRemoveCourse(course.id)}
                className="text-rose-500 hover:bg-rose-950 p-2 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Belum ada matkul, bebas tugas coy.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatkulView;