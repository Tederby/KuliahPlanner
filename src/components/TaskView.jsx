import React, { useState } from 'react';
import {
  CheckSquare,
  Trash2,
  Plus,
  X,
  Pencil,
  Filter,
  Calendar,
  Users,
  User,
  MapPin,
  Clock,
} from 'lucide-react';
import { getDeadlineInfo } from './TaskDetailModal';
import { renderMarkdownToHTML } from '../utils/markdown';
import { getCourseColor } from '../utils/courseColors';

const TaskView = ({
  tasks,
  courses,
  showTaskForm,
  setShowTaskForm,
  newTask,
  setNewTask,
  editingTaskId,
  onAddTask,
  onRemoveTask,
  onToggleComplete,
  onStartEdit,
  onCancelEdit,
}) => {
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'all' | 'completed'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'task' | 'event'
  const [courseFilter, setCourseFilter] = useState('all');

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const taskOnlyCount = tasks.filter((t) => t.type !== 'event').length;
  const eventOnlyCount = tasks.filter((t) => t.type === 'event').length;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'active' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (typeFilter === 'task' && t.type === 'event') return false;
    if (typeFilter === 'event' && t.type !== 'event') return false;
    if (courseFilter !== 'all' && Number(t.courseId) !== Number(courseFilter)) return false;
    return true;
  });

  // Sort: incomplete + urgent first, then by deadline
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.urgency !== b.urgency) return a.urgency === 'high' ? -1 : 1;
    return (a.deadline || '').localeCompare(b.deadline || '');
  });

  const isEvent = newTask.type === 'event';

  return (
    <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-accent" /> Daftar Tugas & Acara
          {activeCount > 0 && (
            <span className="text-xs font-normal text-theme-muted ml-1">
              ({activeCount} aktif)
            </span>
          )}
        </h2>
        <button
          onClick={() => {
            if (showTaskForm) {
              onCancelEdit();
            } else {
              setShowTaskForm(true);
            }
          }}
          className="bg-accent hover:bg-accent-hover text-accent-contrast px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          {showTaskForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showTaskForm ? 'Tutup Form' : 'Tambah Tugas / Acara'}
        </button>
      </div>

      {showTaskForm && (
        <form
          onSubmit={onAddTask}
          className={`bg-theme-surface-subtle p-4 rounded-md border mb-5 space-y-4 ${
            editingTaskId ? 'border-amber-500/50' : 'border-theme'
          }`}
        >
          {/* Header & Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme pb-3">
            {editingTaskId ? (
              <div className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Pencil className="w-3 h-3" /> Mengedit {isEvent ? 'acara' : 'tugas'}
              </div>
            ) : (
              <div className="text-xs font-semibold text-theme-text">Pilih Tipe Agenda:</div>
            )}

            <div className="flex items-center gap-1 bg-theme-surface p-1 rounded-md border border-theme">
              <button
                type="button"
                onClick={() => setNewTask({ ...newTask, type: 'task' })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  !isEvent
                    ? 'bg-accent text-accent-contrast shadow-sm'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Tugas Kuliah
              </button>
              <button
                type="button"
                onClick={() => setNewTask({ ...newTask, type: 'event' })}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isEvent
                    ? 'bg-accent text-accent-contrast shadow-sm'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Acara / Kegiatan
              </button>
            </div>
          </div>

          {/* Form Fields: TUGAS */}
          {!isEvent && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs text-theme-muted mb-1">Judul Tugas *</label>
                  <input
                    required
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                    placeholder="e.g. Makalah Etika Profesi Bab 1-3"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1">Mata Kuliah *</label>
                  <select
                    required
                    value={newTask.courseId}
                    onChange={(e) => setNewTask({ ...newTask, courseId: Number(e.target.value) })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  >
                    <option value="">-- Pilih Matkul --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs text-theme-muted mb-1">Tanggal Deadline *</label>
                  <input
                    required
                    type="date"
                    value={newTask.deadlineDate}
                    onChange={(e) => setNewTask({ ...newTask, deadlineDate: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1">
                    Jam Deadline <span className="text-theme-muted opacity-80">(default 23:59)</span>
                  </label>
                  <input
                    type="time"
                    value={newTask.deadlineTime}
                    onChange={(e) => setNewTask({ ...newTask, deadlineTime: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1">Urgency</label>
                  <select
                    value={newTask.urgency}
                    onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  >
                    <option value="low">Normal</option>
                    <option value="high">Mendesak / Urgent</option>
                  </select>
                </div>
              </div>

              {/* Category: Individu vs Kelompok */}
              <div className="bg-theme-surface p-3 rounded-md border border-theme space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-medium text-theme-text">Mode Pengerjaan:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNewTask({ ...newTask, taskCategory: 'individual' })}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                        newTask.taskCategory !== 'group'
                          ? 'bg-accent text-accent-contrast border-transparent'
                          : 'bg-theme-surface-subtle text-theme-muted border-theme'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> Individu
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTask({ ...newTask, taskCategory: 'group' })}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                        newTask.taskCategory === 'group'
                          ? 'bg-accent text-accent-contrast border-transparent'
                          : 'bg-theme-surface-subtle text-theme-muted border-theme'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Kelompok
                    </button>
                  </div>
                </div>

                {newTask.taskCategory === 'group' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-theme">
                    <div>
                      <label className="block text-[11px] text-theme-muted mb-1">
                        Nama / No. Kelompok <span className="opacity-80">(opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={newTask.groupName}
                        onChange={(e) => setNewTask({ ...newTask, groupName: e.target.value })}
                        className="w-full bg-theme-surface-subtle border border-theme rounded-md p-1.5 text-xs text-theme-text outline-none focus:border-accent"
                        placeholder="e.g. Kelompok 3 / Tim UI/UX"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-theme-muted mb-1">
                        Anggota Kelompok / Catatan <span className="opacity-80">(opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={newTask.groupMembers}
                        onChange={(e) => setNewTask({ ...newTask, groupMembers: e.target.value })}
                        className="w-full bg-theme-surface-subtle border border-theme rounded-md p-1.5 text-xs text-theme-text outline-none focus:border-accent"
                        placeholder="e.g. Dimas, Siti, Kevin (3 orang)"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Form Fields: ACARA / KEGIATAN */}
          {isEvent && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs text-theme-muted mb-1">Nama Acara / Kegiatan *</label>
                  <input
                    required
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                    placeholder="e.g. Seminar Nasional AI & Cloud Computing"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1">Tanggal Acara *</label>
                  <input
                    required
                    type="date"
                    value={newTask.deadlineDate}
                    onChange={(e) => setNewTask({ ...newTask, deadlineDate: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs text-theme-muted mb-1">
                    Jam Mulai <span className="text-theme-muted opacity-80">(opsional)</span>
                  </label>
                  <input
                    type="time"
                    value={newTask.startTime}
                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1">
                    Jam Selesai <span className="text-theme-muted opacity-80">(opsional)</span>
                  </label>
                  <input
                    type="time"
                    value={newTask.endTime}
                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1">Prioritas</label>
                  <select
                    value={newTask.urgency}
                    onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })}
                    className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  >
                    <option value="low">Normal</option>
                    <option value="high">Penting / Wajib Hadir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-theme-muted mb-1">
                  Lokasi / Link Ruang <span className="text-theme-muted opacity-80">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={newTask.location}
                  onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                  className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  placeholder="e.g. Auditorium Gedung C / Zoom Meeting"
                />
              </div>
            </>
          )}

          {/* Description Markdown */}
          <div>
            <label className="block text-xs text-theme-muted mb-1">
              Catatan / Deskripsi <span className="text-theme-muted opacity-80">(opsional, format Markdown)</span>
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent resize-y min-h-[70px] font-mono transition-colors"
              placeholder="Catatan tambahan, tautan dokumen, pembagian jobdesk..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 ${
                editingTaskId ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-accent hover:bg-accent-hover text-accent-contrast'
              } px-3.5 py-2 rounded-md font-medium text-xs transition-colors shadow-sm`}
            >
              {editingTaskId
                ? `Perbarui ${isEvent ? 'Acara' : 'Tugas'}`
                : `Simpan ${isEvent ? 'Acara' : 'Tugas'}`}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme px-3.5 py-2 rounded-md font-medium text-xs transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-2.5 bg-theme-surface-subtle rounded-md border border-theme">
        {/* Status & Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
          <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-theme">
            {[
              { id: 'active', label: 'Aktif', count: activeCount },
              { id: 'all', label: 'Semua', count: totalCount },
              { id: 'completed', label: 'Selesai', count: completedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-accent text-accent-contrast shadow-sm'
                    : 'text-theme-muted hover:text-theme-text hover:bg-theme-surface'
                }`}
              >
                {tab.label} <span className="opacity-75 font-mono text-[10px]">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 shrink-0">
            {[
              { id: 'all', label: 'Semua Tipe' },
              { id: 'task', label: `Tugas (${taskOnlyCount})` },
              { id: 'event', label: `Acara (${eventOnlyCount})` },
            ].map((typeTab) => (
              <button
                key={typeTab.id}
                onClick={() => setTypeFilter(typeTab.id)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors shrink-0 ${
                  typeFilter === typeTab.id
                    ? 'bg-theme-surface text-theme-text border border-theme font-semibold shadow-xs'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
              >
                {typeTab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Selector Filter */}
        {typeFilter !== 'event' && courses.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-theme-muted w-full sm:w-auto justify-end shrink-0">
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-theme-surface border border-theme rounded px-2.5 py-1.5 text-xs text-theme-text outline-none focus:border-accent flex-1 sm:flex-none"
            >
              <option value="all">Semua Matkul ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task & Event List */}
      <div className="space-y-2">
        {sortedTasks.map((t) => {
          const itemIsEvent = t.type === 'event';
          const course = !itemIsEvent ? courses.find((c) => c.id === t.courseId) : null;
          const deadlineInfo = t.deadline ? getDeadlineInfo(t.deadline) : null;
          const datePart = t.deadline?.split('T')[0] || '';
          const timePart = t.deadline?.split('T')[1] || '';

          return (
            <div
              key={t.id}
              className={`p-3.5 bg-theme-surface-subtle/50 rounded-md border transition-colors ${
                t.completed ? 'border-theme-subtle opacity-60' : 'border-theme hover:border-theme-subtle'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-semibold text-sm ${
                        t.completed ? 'line-through text-theme-muted' : 'text-theme-text'
                      }`}
                    >
                      {t.title}
                    </span>

                    {/* Badge Tipe: Acara vs Tugas */}
                    {itemIsEvent ? (
                      <span className="text-[10px] bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Acara
                      </span>
                    ) : (
                      <>
                        {t.taskCategory === 'group' ? (
                          <span className="text-[10px] bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Kelompok{t.groupName ? `: ${t.groupName}` : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-theme-surface text-theme-muted border border-theme px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <User className="w-3 h-3" /> Individu
                          </span>
                        )}
                      </>
                    )}

                    {t.urgency === 'high' && !t.completed && (
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.5 rounded font-mono font-medium">
                        {itemIsEvent ? 'Penting' : 'Urgent'}
                      </span>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="text-xs text-theme-muted mt-1.5 flex items-center gap-3 flex-wrap">
                    {!itemIsEvent && course && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: getCourseColor(course) }}
                        />
                        <span>{course.name}</span>
                      </span>
                    )}

                    <span className="font-mono flex items-center gap-1">
                      📅 {datePart}
                      {itemIsEvent ? (
                        t.startTime ? (
                          <span className="text-theme-text font-medium">
                            • ⏰ {t.startTime}{t.endTime ? ` - ${t.endTime}` : ''}
                          </span>
                        ) : null
                      ) : (
                        timePart && timePart !== '23:59' ? `⏰ ${timePart}` : ''
                      )}
                    </span>

                    {itemIsEvent && t.location && (
                      <span className="flex items-center gap-1 text-theme-text">
                        <MapPin className="w-3 h-3 text-theme-muted" /> {t.location}
                      </span>
                    )}
                  </div>

                  {/* Anggota Kelompok jika ada */}
                  {!itemIsEvent && t.taskCategory === 'group' && t.groupMembers && (
                    <div className="text-[11px] text-theme-muted mt-1 flex items-center gap-1 font-sans">
                      <Users className="w-3 h-3 text-theme-muted shrink-0" />
                      <span className="truncate">Anggota: {t.groupMembers}</span>
                    </div>
                  )}

                  {/* Countdown badge */}
                  {deadlineInfo && !t.completed && (
                    <div
                      className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${deadlineInfo.bg} ${deadlineInfo.color}`}
                    >
                      <span>{deadlineInfo.icon}</span>
                      <span>{deadlineInfo.text}</span>
                    </div>
                  )}

                  {/* Description preview */}
                  {t.description && (
                    <div
                      className="mt-2 text-xs text-theme-text bg-theme-surface p-2 rounded border border-theme leading-relaxed max-h-[100px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(t.description) }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onStartEdit(t.id)}
                    className="text-theme-muted hover:text-accent hover:bg-theme-surface p-1.5 rounded transition-colors"
                    title={`Edit ${itemIsEvent ? 'acara' : 'tugas'}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleComplete(t.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                      t.completed
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/60'
                        : 'bg-theme-surface text-theme-muted hover:bg-theme-surface-subtle hover:text-theme-text border border-theme'
                    }`}
                  >
                    {t.completed ? '✓ Selesai' : 'Done'}
                  </button>
                  <button
                    onClick={() => onRemoveTask(t.id)}
                    className="text-theme-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-theme-surface p-1.5 rounded transition-colors"
                    title={`Hapus ${itemIsEvent ? 'acara' : 'tugas'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="text-center py-8 text-xs text-theme-muted">
            {tasks.length === 0
              ? 'Belum ada agenda atau tugas yang dicatat.'
              : 'Tidak ada item yang cocok dengan filter yang dipilih.'}
          </div>
        )}

        <button
          onClick={() => setShowTaskForm(true)}
          className="w-full py-2.5 border border-dashed border-theme text-theme-muted rounded-md hover:border-accent hover:text-accent transition-colors text-xs font-medium"
        >
          + Tambah Tugas / Acara Baru
        </button>
      </div>
    </div>
  );
};

export default TaskView;
