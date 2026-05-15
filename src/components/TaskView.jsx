import React from 'react';
import { CheckSquare, Trash2 } from 'lucide-react';

const TaskView = ({
  tasks,
  courses,
  showTaskForm,
  setShowTaskForm,
  newTask,
  setNewTask,
  onAddTask,
  onRemoveTask,
  onToggleComplete,
}) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <CheckSquare /> Daftar Tugas
      </h2>

      {showTaskForm && (
        <form
          onSubmit={onAddTask}
          className="bg-slate-900 p-4 rounded-xl border border-indigo-500/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1">Judul Tugas</label>
            <input
              required
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
              placeholder="Judul..."
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Matkul</label>
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
          <div>
            <label className="block text-xs text-slate-400 mb-1">Deadline</label>
            <input
              required
              type="datetime-local"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
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
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 w-full hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold transition-colors"
            >
              Save Task
            </button>
            <button
              type="button"
              onClick={() => setShowTaskForm(false)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tasks.map((t) => {
          const course = courses.find((c) => c.id === t.courseId);
          return (
            <div
              key={t.id}
              className={`p-4 bg-slate-900 rounded-lg border transition-colors ${
                t.completed ? 'border-slate-600 opacity-60' : 'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className={`font-bold ${t.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    <p>Matkul: {course?.name || 'Unknown'}</p>
                    <p>Deadline: {t.deadline.replace('T', ' ')}</p>
                    <p>
                      Urgency:{' '}
                      <span className={t.urgency === 'high' ? 'text-rose-400' : 'text-emerald-400'}>
                        {t.urgency === 'high' ? '🔴 Tinggi' : '🟢 Rendah'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
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
