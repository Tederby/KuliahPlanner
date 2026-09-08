import React from 'react';
import { CheckSquare, Trash2, Plus, X, Pencil } from 'lucide-react';
import { getDeadlineInfo } from './TaskDetailModal';
import { renderMarkdownToHTML } from '../utils/markdown';

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
  // Sort: incomplete + urgent first, then by deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.urgency !== b.urgency) return a.urgency === 'high' ? -1 : 1;
    return (a.deadline || '').localeCompare(b.deadline || '');
  });

  return (
    <div className="bg-theme-surface p-5 rounded-lg border border-theme shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-accent" /> Daftar Tugas
          {tasks.filter((t) => !t.completed).length > 0 && (
            <span className="text-xs font-normal text-theme-muted ml-1">
              ({tasks.filter((t) => !t.completed).length} aktif)
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
          {showTaskForm ? 'Tutup' : 'Tambah Tugas'}
        </button>
      </div>

      {showTaskForm && (
        <form
          onSubmit={onAddTask}
          className={`bg-theme-surface-subtle p-4 rounded-md border mb-5 space-y-3.5 ${editingTaskId ? 'border-amber-500/50' : 'border-theme'}`}
        >
          {editingTaskId && (
            <div className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Pencil className="w-3 h-3" /> Mengedit tugas
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-theme-muted mb-1">Judul Tugas *</label>
              <input
                required
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                placeholder="Judul tugas..."
              />
            </div>
            <div>
              <label className="block text-xs text-theme-muted mb-1">Matkul *</label>
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
                Jam Deadline <span className="text-theme-muted opacity-80">(opsional, default 23:59)</span>
              </label>
              <input
                type="time"
                value={newTask.deadlineTime}
                onChange={(e) => setNewTask({ ...newTask, deadlineTime: e.target.value })}
                className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                placeholder="23:59"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-muted mb-1">Urgency</label>
              <select
                value={newTask.urgency}
                onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })}
                className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
              >
                <option value="low">Rendah</option>
                <option value="high">Tinggi</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-theme-muted mb-1">
              Deskripsi <span className="text-theme-muted opacity-80">(opsional, format Markdown)</span>
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-theme-surface border border-theme rounded-md p-2 text-xs text-theme-text outline-none focus:border-accent resize-y min-h-[70px] font-mono transition-colors"
              placeholder="Deskripsi tugas... (mendukung **bold**, *italic*, `code`, - list)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 ${editingTaskId ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-accent hover:bg-accent-hover text-accent-contrast'} px-3.5 py-2 rounded-md font-medium text-xs transition-colors shadow-sm`}
            >
              {editingTaskId ? 'Perbarui Tugas' : 'Simpan Tugas'}
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

      <div className="space-y-2">
        {sortedTasks.map((t) => {
          const course = courses.find((c) => c.id === t.courseId);
          const deadlineInfo = t.deadline ? getDeadlineInfo(t.deadline) : null;
          const datePart = t.deadline?.split('T')[0] || '';
          const timePart = t.deadline?.split('T')[1] || '23:59';

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
                    <span className={`font-semibold text-sm ${t.completed ? 'line-through text-theme-muted' : 'text-theme-text'}`}>
                      {t.title}
                    </span>
                    {t.urgency === 'high' && !t.completed && (
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.5 rounded font-mono font-medium">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-theme-muted mt-1 flex items-center gap-3 flex-wrap">
                    <span>📚 {course?.name || 'Unknown'}</span>
                    <span className="font-mono">📅 {datePart} {timePart !== '23:59' ? `⏰ ${timePart}` : ''}</span>
                  </div>

                  {/* Countdown badge */}
                  {deadlineInfo && !t.completed && (
                    <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${deadlineInfo.bg} ${deadlineInfo.color}`}>
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
                    title="Edit tugas"
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
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setShowTaskForm(true)}
          className="w-full py-2.5 border border-dashed border-theme text-theme-muted rounded-md hover:border-accent hover:text-accent transition-colors text-xs font-medium"
        >
          + Tambah Tugas Manual
        </button>
      </div>
    </div>
  );
};

export default TaskView;
