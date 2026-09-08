import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, BookOpen, Pencil } from 'lucide-react';
import { renderMarkdownToHTML } from '../utils/markdown';
import { monthNames } from '../utils/dateUtils';
import { getCourseColor } from '../utils/courseColors';

const getDeadlineInfo = (deadline) => {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    if (overdueDays === 0) return { text: 'Terlambat beberapa jam', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
    if (overdueDays === 1) return { text: 'Terlambat 1 hari', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
    return { text: `Terlambat ${overdueDays} hari`, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
  }
  if (diffHours <= 0) return { text: 'Deadline sekarang', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
  if (diffHours <= 3) return { text: `${diffHours} jam lagi`, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
  if (diffHours <= 24) return { text: `${diffHours} jam lagi (Hari ini)`, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/60', icon: '•' };
  if (diffDays === 1) return { text: 'Besok', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/60', icon: '•' };
  if (diffDays === 2) return { text: 'Lusa', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/60', icon: '•' };
  if (diffDays <= 3) return { text: `${diffDays} hari lagi`, color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800/60', icon: '•' };
  if (diffDays <= 7) return { text: `${diffDays} hari lagi`, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/60', icon: '•' };
  return { text: `${diffDays} hari lagi`, color: 'text-theme-muted', bg: 'bg-theme-surface-subtle border border-theme', icon: '•' };
};

const TaskDetailModal = ({ task, courses, onClose, onToggleComplete, onEdit }) => {
  if (!task) return null;

  const course = courses.find((c) => c.id === task.courseId);
  const deadlineInfo = getDeadlineInfo(task.deadline);
  const datePart = task.deadline.split('T')[0];
  const timePart = task.deadline.split('T')[1] || '23:59';
  const dlDate = new Date(datePart);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-theme-surface rounded-lg border border-theme shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-theme-surface-subtle border-b border-theme p-5">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
              task.urgency === 'high'
                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                : 'bg-theme-surface text-theme-muted border border-theme'
            }`}>
              {task.urgency === 'high' ? 'Urgent' : 'Normal'}
            </span>
            <button onClick={onClose} className="text-theme-muted hover:text-theme-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-bold text-theme-text leading-tight mt-2">{task.title}</h2>
          {course && (
            <div className="text-xs text-theme-muted mt-1.5 flex items-center gap-1.5 font-medium">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: getCourseColor(course) }}
              />
              <BookOpen className="w-3.5 h-3.5 text-theme-muted" />
              {course.name}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          {/* Deadline + Countdown */}
          <div className="flex items-start gap-3 bg-theme-surface-subtle p-3.5 rounded-md border border-theme">
            <Clock className="w-4 h-4 text-theme-muted shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-theme-muted mb-0.5">Deadline</div>
              <div className="text-xs text-theme-text font-mono font-medium">
                {dlDate.getDate()} {monthNames[dlDate.getMonth()]} {dlDate.getFullYear()}, {timePart}
              </div>
              <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                <span className="font-bold leading-none">{deadlineInfo.icon}</span>
                <span>{deadlineInfo.text}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="bg-theme-surface-subtle p-3.5 rounded-md border border-theme">
              <div className="text-[11px] text-theme-muted mb-1.5">Deskripsi</div>
              <div
                className="text-xs text-theme-text leading-relaxed max-h-[150px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(task.description) }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 border-t border-theme space-y-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(task.id);
                }}
                className="w-full bg-theme-surface-subtle hover:bg-theme-surface text-theme-text border border-theme py-2 px-4 rounded-md font-medium text-xs transition-colors flex justify-center items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5 text-theme-muted" /> Edit Tugas Ini
              </button>
            )}
            <button
              onClick={() => {
                onToggleComplete(task.id);
                onClose();
              }}
              className={`w-full py-2 px-4 rounded-md font-medium text-xs transition-colors flex justify-center items-center gap-1.5 shadow-sm ${
                task.completed
                  ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                  : 'bg-accent hover:bg-accent-hover text-accent-contrast'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
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
