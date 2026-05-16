import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { renderMarkdownToHTML } from '../utils/markdown';
import { monthNames } from '../utils/dateUtils';

const getDeadlineInfo = (deadline) => {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    if (overdueDays === 0) return { text: 'Terlambat beberapa jam', color: 'text-rose-400', bg: 'bg-rose-500/20', icon: '🔴' };
    if (overdueDays === 1) return { text: 'Terlambat 1 hari!', color: 'text-rose-400', bg: 'bg-rose-500/20', icon: '🔴' };
    return { text: `Terlambat ${overdueDays} hari!`, color: 'text-rose-400', bg: 'bg-rose-500/20', icon: '🔴' };
  }
  if (diffHours <= 0) return { text: 'Deadline sekarang!', color: 'text-rose-400', bg: 'bg-rose-500/20', icon: '🔴' };
  if (diffHours <= 3) return { text: `${diffHours} jam lagi`, color: 'text-rose-400', bg: 'bg-rose-500/20', icon: '🔴' };
  if (diffHours <= 24) return { text: `${diffHours} jam lagi (Hari ini)`, color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '🟠' };
  if (diffDays === 1) return { text: 'Besok!', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '🟡' };
  if (diffDays === 2) return { text: 'Lusa', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '🟡' };
  if (diffDays <= 3) return { text: `${diffDays} hari lagi`, color: 'text-yellow-400', bg: 'bg-yellow-500/15', icon: '🟡' };
  if (diffDays <= 7) return { text: `${diffDays} hari lagi`, color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: '🟢' };
  return { text: `${diffDays} hari lagi`, color: 'text-slate-400', bg: 'bg-slate-500/10', icon: '📅' };
};

const TaskDetailModal = ({ task, courses, onClose, onToggleComplete }) => {
  if (!task) return null;

  const course = courses.find((c) => c.id === task.courseId);
  const deadlineInfo = getDeadlineInfo(task.deadline);
  const datePart = task.deadline.split('T')[0];
  const timePart = task.deadline.split('T')[1] || '23:59';
  const dlDate = new Date(datePart);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`border-b p-6 ${
          task.urgency === 'high'
            ? 'bg-rose-900/30 border-rose-500/20'
            : 'bg-emerald-900/20 border-emerald-500/20'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
              task.urgency === 'high'
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {task.urgency === 'high' ? '⚡ Urgent' : '📋 Normal'}
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">{task.title}</h2>
          {course && (
            <div className="text-sm text-slate-300 mt-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {course.name}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Deadline + Countdown */}
          <div className="flex items-start gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
            <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">Deadline</div>
              <div className="text-sm text-slate-200 font-medium">
                {dlDate.getDate()} {monthNames[dlDate.getMonth()]} {dlDate.getFullYear()}, {timePart}
              </div>
              <div className={`mt-2 inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-lg ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                <span>{deadlineInfo.icon}</span>
                <span>{deadlineInfo.text}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-500 mb-2">Deskripsi</div>
              <div
                className="text-sm text-slate-300 leading-relaxed prose-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(task.description) }}
              />
            </div>
          )}

          {/* Done button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onToggleComplete(task.id);
                onClose();
              }}
              className={`w-full py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 ${
                task.completed
                  ? 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {task.completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { getDeadlineInfo };
export default TaskDetailModal;
