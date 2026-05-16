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
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckSquare /> Daftar Tugas
          {tasks.filter((t) => !t.completed).length > 0 && (
            <span className="text-sm font-normal text-slate-400 ml-1">
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
        >
          {showTaskForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showTaskForm ? 'Tutup' : 'Tambah Tugas'}
        </button>
      </div>

      {showTaskForm && (
        <form
          onSubmit={onAddTask}
          className={`bg-slate-900 p-4 rounded-xl border mb-6 space-y-4 ${editingTaskId ? 'border-amber-500/50' : 'border-indigo-500/50'}`}
        >
          {editingTaskId && (
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Pencil className="w-3 h-3" /> Mengedit tugas
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-slate-400 mb-1">Judul Tugas *</label>
              <input
                required
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
                placeholder="Judul tugas..."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Matkul *</label>
              <select
                required
                value={newTask.courseId}
                onChange={(e) => setNewTask({ ...newTask, courseId: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tanggal Deadline *</label>
              <input
                required
                type="date"
                value={newTask.deadlineDate}
                onChange={(e) => setNewTask({ ...newTask, deadlineDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Jam Deadline <span className="text-slate-600">(opsional, default 23:59)</span>
              </label>
              <input
                type="time"
                value={newTask.deadlineTime}
                onChange={(e) => setNewTask({ ...newTask, deadlineTime: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
                placeholder="23:59"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Urgency</label>
              <select
                value={newTask.urgency}
                onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              >
                <option value="low">Rendah</option>
                <option value="high">Tinggi</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Deskripsi <span className="text-slate-600">(opsional, mendukung format Markdown)</span>
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500 resize-y min-h-[80px] font-mono text-sm"
              placeholder="Deskripsi tugas... (mendukung **bold**, *italic*, `code`, - list)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 ${editingTaskId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-md font-bold transition-colors`}
            >
              {editingTaskId ? 'Perbarui Tugas' : 'Simpan Tugas'}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md font-bold transition-colors"
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
              className={`p-4 bg-slate-900 rounded-lg border transition-colors ${
                t.completed ? 'border-slate-600 opacity-60' : 'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold ${t.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {t.title}
                    </span>
                    {t.urgency === 'high' && !t.completed && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span>📚 {course?.name || 'Unknown'}</span>
                    <span>📅 {datePart} {timePart !== '23:59' ? `⏰ ${timePart}` : ''}</span>
                  </div>

                  {/* Countdown badge */}
                  {deadlineInfo && !t.completed && (
                    <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                      <span>{deadlineInfo.icon}</span>
                      <span>{deadlineInfo.text}</span>
                    </div>
                  )}

                  {/* Description preview */}
                  {t.description && (
                    <div
                      className="mt-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700/50 leading-relaxed max-h-[100px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(t.description) }}
                    />
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onStartEdit(t.id)}
                    className="text-indigo-400 hover:bg-indigo-950 p-2 rounded transition-colors"
                    title="Edit tugas"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleComplete(t.id)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      t.completed
                        ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-600'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {t.completed ? '✓ Selesai' : 'Done'}
                  </button>
                  <button
                    onClick={() => onRemoveTask(t.id)}
                    className="text-rose-500 hover:bg-rose-950 p-2 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setShowTaskForm(true)}
          className="w-full py-3 border-2 border-dashed border-slate-700 text-slate-400 rounded-lg hover:border-indigo-500 hover:text-indigo-400 transition-colors"
        >
          + Tambah Tugas Manual
        </button>
      </div>
    </div>
  );
};

export default TaskView;
