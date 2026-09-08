import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Pencil,
  Calendar,
  MapPin,
  Users,
  User,
} from 'lucide-react';
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
    if (overdueDays === 0) return { text: 'Sudah lewat beberapa jam', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
    if (overdueDays === 1) return { text: 'Sudah lewat 1 hari', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
    return { text: `Sudah lewat ${overdueDays} hari`, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
  }
  if (diffHours <= 0) return { text: 'Hari ini', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60', icon: '•' };
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

  const isEvent = task.type === 'event';
  const course = !isEvent ? courses.find((c) => c.id === task.courseId) : null;
  const deadlineInfo = task.deadline ? getDeadlineInfo(task.deadline) : null;
  const datePart = task.deadline?.split('T')[0] || '';
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
            <div className="flex items-center gap-1.5 flex-wrap">
              {isEvent ? (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Acara / Kegiatan
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-theme-surface text-theme-muted border border-theme flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Tugas Kuliah
                </span>
              )}

              {task.urgency === 'high' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60">
                  {isEvent ? 'Penting' : 'Urgent'}
                </span>
              )}

              {!isEvent && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-theme-surface text-theme-muted border border-theme flex items-center gap-1">
                  {task.taskCategory === 'group' ? (
                    <>
                      <Users className="w-3 h-3 text-sky-500" /> Kelompok
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" /> Individu
                    </>
                  )}
                </span>
              )}
            </div>

            <button onClick={onClose} className="text-theme-muted hover:text-theme-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-theme-text leading-tight mt-2">{task.title}</h2>

          {!isEvent && course && (
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
          {/* Time & Countdown */}
          <div className="flex items-start gap-3 bg-theme-surface-subtle p-3.5 rounded-md border border-theme">
            <Clock className="w-4 h-4 text-theme-muted shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-theme-muted mb-0.5">
                {isEvent ? 'Waktu Pelaksanaan' : 'Batas Deadline'}
              </div>
              <div className="text-xs text-theme-text font-mono font-medium">
                {dlDate.getDate()} {monthNames[dlDate.getMonth()]} {dlDate.getFullYear()}
                {isEvent ? (
                  task.startTime ? ` • ${task.startTime}${task.endTime ? ` - ${task.endTime}` : ''}` : ''
                ) : (
                  task.deadline?.includes('T') ? `, ${task.deadline.split('T')[1]}` : ''
                )}
              </div>
              {deadlineInfo && !task.completed && (
                <div
                  className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${deadlineInfo.bg} ${deadlineInfo.color}`}
                >
                  <span className="font-bold leading-none">{deadlineInfo.icon}</span>
                  <span>{deadlineInfo.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location if Event */}
          {isEvent && task.location && (
            <div className="flex items-start gap-3 bg-theme-surface-subtle p-3 rounded-md border border-theme">
              <MapPin className="w-4 h-4 text-theme-muted shrink-0 mt-0.5" />
              <div className="text-xs text-theme-text">
                <span className="block text-[11px] text-theme-muted mb-0.5">Lokasi / Ruang</span>
                {task.location}
              </div>
            </div>
          )}

          {/* Group details if Task */}
          {!isEvent && task.taskCategory === 'group' && (task.groupName || task.groupMembers) && (
            <div className="bg-theme-surface-subtle p-3 rounded-md border border-theme space-y-1.5">
              <div className="text-[11px] text-theme-muted font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" /> Informasi Kelompok
              </div>
              {task.groupName && (
                <div className="text-xs text-theme-text">
                  <span className="text-theme-muted">Nama/No:</span> {task.groupName}
                </div>
              )}
              {task.groupMembers && (
                <div className="text-xs text-theme-text">
                  <span className="text-theme-muted">Anggota:</span> {task.groupMembers}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="bg-theme-surface-subtle p-3.5 rounded-md border border-theme">
              <div className="text-[11px] text-theme-muted mb-1.5">Catatan / Deskripsi</div>
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
                <Pencil className="w-3.5 h-3.5 text-theme-muted" /> Edit {isEvent ? 'Acara' : 'Tugas'} Ini
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
