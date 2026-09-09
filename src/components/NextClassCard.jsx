import React, { useMemo } from 'react';
import { Clock, MapPin, ChevronRight, CheckCircle2, Coffee, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { formatDateStr } from '../utils/dateUtils';
import { getCourseColor } from '../utils/courseColors';

export default function NextClassCard({ allCalendarEvents = [], onSelectEvent }) {
  const todayStr = useMemo(() => formatDateStr(new Date()), []);

  const todayClasses = useMemo(() => {
    return allCalendarEvents
      .filter((ev) => ev.type === 'course' && ev.date === todayStr && ev.startTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [allCalendarEvents, todayStr]);

  const { statusType, activeClass, nextClass, remainingTimeText, progressPercent } = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    if (todayClasses.length === 0) {
      return { statusType: 'no_class' };
    }

    // 1. Check if any class is currently happening
    for (const c of todayClasses) {
      const startMin = parseMinutes(c.startTime);
      const endMin = parseMinutes(c.endTime || c.startTime) + (c.endTime ? 0 : (c.sks || 3) * 50);
      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        const remainingMin = endMin - currentMinutes;
        const totalDuration = Math.max(1, endMin - startMin);
        const elapsed = currentMinutes - startMin;
        const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));

        return {
          statusType: 'in_progress',
          activeClass: c,
          remainingTimeText: remainingMin > 0 ? `Tersisa ${remainingMin} menit lagi` : 'Hampir selesai',
          progressPercent: pct,
        };
      }
    }

    // 2. Check next upcoming class today
    for (const c of todayClasses) {
      const startMin = parseMinutes(c.startTime);
      if (startMin > currentMinutes) {
        const diffMin = startMin - currentMinutes;
        let diffText = '';
        if (diffMin < 60) {
          diffText = `Dimulai dalam ${diffMin} menit`;
        } else {
          const h = Math.floor(diffMin / 60);
          const m = diffMin % 60;
          diffText = `Dimulai dalam ${h} jam ${m > 0 ? `${m} mnt` : ''}`;
        }

        return {
          statusType: 'upcoming',
          nextClass: c,
          remainingTimeText: diffText,
        };
      }
    }

    // 3. All classes today finished
    return { statusType: 'all_finished' };
  }, [todayClasses]);

  // If no classes today
  if (statusType === 'no_class') {
    return (
      <div className="mb-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Hari Ini Bebas Kuliah
            </div>
            <p className="text-xs sm:text-sm text-theme-muted truncate">
              Tidak ada jadwal kelas untuk hari ini. Waktunya refresh otak atau cicil tugas!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If all classes finished
  if (statusType === 'all_finished') {
    return (
      <div className="mb-5 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-indigo-500/10 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-indigo-950/30 border border-sky-200 dark:border-sky-800/50 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              Kuliah Hari Ini Selesai
            </div>
            <p className="text-xs sm:text-sm text-theme-muted truncate">
              Semua kelas hari ini telah berakhir ({todayClasses.length} mata kuliah). Istirahat yang cukup!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // In progress
  if (statusType === 'in_progress' && activeClass) {
    const courseColor = getCourseColor(activeClass);
    return (
      <div
        onClick={() => onSelectEvent?.(activeClass)}
        className="mb-5 relative overflow-hidden bg-white dark:bg-theme-card border-2 border-emerald-500 dark:border-emerald-500/80 rounded-xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: courseColor }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Sedang Berlangsung
                </span>
                {activeClass.meetingNum && (
                  <span className="text-[11px] text-theme-muted font-medium">
                    Pertemuan {activeClass.meetingNum}
                  </span>
                )}
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  • {remainingTimeText}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-theme-text truncate group-hover:text-theme-primary transition-colors">
                {activeClass.name}
              </h4>
              <div className="flex items-center gap-3 text-xs text-theme-muted mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  {activeClass.startTime} - {activeClass.endTime || ''}
                </span>
                {activeClass.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {activeClass.location}
                  </span>
                )}
                {activeClass.sks && <span>{activeClass.sks} SKS</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end sm:self-center">
            <button className="flex items-center gap-1 text-xs font-semibold text-theme-primary group-hover:translate-x-0.5 transition-transform">
              Detail Kelas <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live progress indicator bar */}
        <div className="mt-3 w-full bg-emerald-100 dark:bg-emerald-950/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent || 50}%` }}
          />
        </div>
      </div>
    );
  }

  // Upcoming
  if (statusType === 'upcoming' && nextClass) {
    const courseColor = getCourseColor(nextClass);
    return (
      <div
        onClick={() => onSelectEvent?.(nextClass)}
        className="mb-5 bg-white dark:bg-theme-card border border-amber-300 dark:border-amber-700/60 rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: courseColor }}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  Kelas Berikutnya
                </span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  • {remainingTimeText}
                </span>
                {nextClass.meetingNum && (
                  <span className="text-[11px] text-theme-muted font-medium">
                    (P-{nextClass.meetingNum})
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm sm:text-base text-theme-text truncate group-hover:text-theme-primary transition-colors">
                {nextClass.name}
              </h4>
              <div className="flex items-center gap-3 text-xs text-theme-muted mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {nextClass.startTime} - {nextClass.endTime || ''}
                </span>
                {nextClass.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {nextClass.location}
                  </span>
                )}
                {nextClass.sks && <span>{nextClass.sks} SKS</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end sm:self-center">
            <button className="flex items-center gap-1 text-xs font-semibold text-theme-primary group-hover:translate-x-0.5 transition-transform">
              Lihat Jadwal <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
