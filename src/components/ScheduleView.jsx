import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import { formatDateStr, daysOfWeek, monthNames } from '../utils/dateUtils';

// Display order: Sunday first
const displayDaysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const ScheduleView = ({ allCalendarEvents, onSelectEvent, onSelectTask, onQuickAddTask }) => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDateObj, setCurrentDateObj] = useState(new Date());
  const [viewHistory, setViewHistory] = useState([]); // for breadcrumb back-nav
  const scrollBodyRef = useRef(null);

  const navDate = (dir) => {
    const d = new Date(currentDateObj);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDateObj(d);
  };

  const goToToday = () => {
    setCurrentDateObj(new Date());
  };

  const getStartOfWeek = (dateObj) => {
    const d = new Date(dateObj);
    d.setDate(d.getDate() - d.getDay()); // Sunday
    return d;
  };

  const getWeekHeaderText = () => {
    const start = getStartOfWeek(currentDateObj);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${endMonth}`;
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
  };

  const pushHistory = () => {
    setViewHistory((h) => [...h, { viewMode, date: new Date(currentDateObj) }]);
  };

  const goBack = () => {
    setViewHistory((h) => {
      const copy = [...h];
      const prev = copy.pop();
      if (prev) {
        setViewMode(prev.viewMode);
        setCurrentDateObj(prev.date);
      }
      return copy;
    });
  };

  const handleMonthCellClick = (dateObj) => {
    pushHistory();
    setCurrentDateObj(dateObj);
    setViewMode('week');
  };

  const handleWeekDayClick = (dateObj) => {
    pushHistory();
    setCurrentDateObj(dateObj);
    setViewMode('day');
  };

  // Auto-scroll to ~7AM area on mount / view change
  useEffect(() => {
    if (scrollBodyRef.current && (viewMode === 'week' || viewMode === 'day')) {
      const scrollTarget = 7 * 60; // 7:00 position
      scrollBodyRef.current.scrollTop = scrollTarget;
    }
  }, [viewMode]);

  const renderCalendarCell = (dateStr, cellDateObj) => {
    const dayEvents = allCalendarEvents
      .filter((e) => e.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    const isToday = dateStr === formatDateStr(new Date());
    const isCurrentMonth = cellDateObj.getMonth() === currentDateObj.getMonth();

    return (
      <div
        key={dateStr}
        onClick={() => handleMonthCellClick(cellDateObj)}
        className={`min-h-[100px] p-1 border-r border-b border-slate-700/50 cursor-pointer transition-colors group ${
          !isCurrentMonth
            ? 'bg-slate-900/50 hover:bg-slate-800/60'
            : isToday
            ? 'bg-indigo-950/20 hover:bg-indigo-950/40'
            : 'bg-slate-800 hover:bg-slate-700/60'
        }`}
      >
        <div className={`text-xs font-bold text-right p-1 flex items-center justify-end gap-1 ${
          !isCurrentMonth ? 'text-slate-600' : isToday ? 'text-indigo-400' : 'text-slate-500'
        }`}>
          <span className="text-[9px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Lihat minggu →
          </span>
          {cellDateObj.getDate()}
        </div>
        <div className="space-y-1">
          {dayEvents.map((ev) => (
            <div
              key={ev.instanceId}
              onClick={(e) => {
                e.stopPropagation();
                if (ev.type === 'course') onSelectEvent(ev);
                else if (ev.type === 'task') onSelectTask(ev);
              }}
              className={`text-[10px] p-1 rounded cursor-pointer truncate relative z-10 ${
                ev.type === 'course'
                  ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/80 border border-indigo-500/30'
                  : ev.urgency === 'high'
                  ? 'bg-rose-900/50 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{ev.type === 'course' ? ev.startTime : '📌'}</span>
                {ev.isRescheduled && (
                  <span className="text-[8px] uppercase tracking-[0.2em] px-1 rounded bg-amber-500/20 text-amber-200">
                    reschedule
                  </span>
                )}
              </div>
              <div>{ev.type === 'course' ? ev.name : `[TGS] ${ev.title}`}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimelineView = (daysOffsetArray) => {
    const HOUR_START = 0;
    const HOUR_END = 23;
    const HOUR_COUNT = HOUR_END - HOUR_START + 1;
    const HOUR_HEIGHT = 60;
    const TOTAL_HEIGHT = HOUR_COUNT * HOUR_HEIGHT;
    const hours = Array.from({ length: HOUR_COUNT }, (_, i) => i + HOUR_START);
    const startOfWeek = getStartOfWeek(currentDateObj);
    const isWeekMode = viewMode === 'week';

    const getDayDate = (offset) => {
      const d = new Date(isWeekMode ? startOfWeek : currentDateObj);
      if (isWeekMode) d.setDate(d.getDate() + offset);
      return d;
    };

    const hasTasks = daysOffsetArray.some((offset) => {
      const dateStr = formatDateStr(getDayDate(offset));
      return allCalendarEvents.some((e) => e.date === dateStr && e.type === 'task');
    });

    // Current time line position
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = formatDateStr(now);

    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-[600px]">
        {/* Header Days */}
        <div className="flex border-b border-slate-700 bg-slate-900 shrink-0">
          <div className="w-16 shrink-0 border-r border-slate-700"></div>
          {daysOffsetArray.map((offset) => {
            const d = getDayDate(offset);
            const dateStr = formatDateStr(d);
            const isToday = dateStr === todayStr;
            return (
              <div
                key={offset}
                onClick={() => isWeekMode && handleWeekDayClick(d)}
                className={`flex-1 text-center py-2 text-sm font-bold border-r border-slate-700 transition-colors ${
                  isWeekMode ? 'cursor-pointer' : ''
                } ${
                  isToday
                    ? `text-indigo-400 bg-indigo-950/30 ${isWeekMode ? 'hover:bg-indigo-950/60' : ''}`
                    : `text-slate-400 ${isWeekMode ? 'hover:bg-slate-700/50' : ''}`
                }`}
              >
                {displayDaysOfWeek[d.getDay()]} <br />
                <span className="text-xs font-normal">
                  {d.getDate()}/{d.getMonth() + 1}
                </span>
                {isWeekMode && (
                  <span className="block text-[9px] text-slate-600 mt-0.5 opacity-0 hover:opacity-100 transition-opacity">
                    Lihat hari
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* All-day task banners */}
        {hasTasks && (
          <div className="flex border-b border-slate-700 shrink-0">
            <div className="w-16 shrink-0 border-r border-slate-700 flex items-center justify-end pr-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Tugas</span>
            </div>
            {daysOffsetArray.map((offset) => {
              const d = getDayDate(offset);
              const dateStr = formatDateStr(d);
              const dayTasks = allCalendarEvents.filter(
                (e) => e.date === dateStr && e.type === 'task'
              );
              return (
                <div
                  key={`task-${offset}`}
                  className={`flex-1 border-r border-slate-700/30 p-1 space-y-0.5 min-h-[8px] ${
                    isWeekMode ? 'cursor-pointer hover:bg-slate-700/15 transition-colors' : ''
                  }`}
                  onClick={() => isWeekMode && handleWeekDayClick(d)}
                >
                  {dayTasks.map((task) => (
                    <div
                      key={task.instanceId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(task);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer hover:brightness-125 transition-all ${
                        task.urgency === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                      title={`${task.title} — DL: ${task.startTime}`}
                    >
                      <span className="opacity-70 mr-1">⏰{task.startTime}</span>
                      {task.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Grid Body */}
        <div ref={scrollBodyRef} className="flex-1 overflow-y-auto relative">
          <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
            {/* Hour labels + grid lines */}
            {hours.map((h) => (
              <React.Fragment key={h}>
                <div
                  className="absolute left-0 right-0 border-t border-slate-700/40"
                  style={{ top: `${(h - HOUR_START) * HOUR_HEIGHT}px` }}
                />
                <div
                  className="absolute left-0 w-16 text-right pr-2 text-xs text-slate-500"
                  style={{ top: `${(h - HOUR_START) * HOUR_HEIGHT}px`, transform: 'translateY(-50%)' }}
                >
                  {h.toString().padStart(2, '0')}:00
                </div>
              </React.Fragment>
            ))}

            {/* Current time line */}
            {daysOffsetArray.some((offset) => formatDateStr(getDayDate(offset)) === todayStr) && (
              <div
                className="absolute left-16 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: `${nowMinutes}px` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0 shadow-lg shadow-red-500/40"></div>
                <div className="flex-1 h-[2px] bg-red-500/80 shadow-sm shadow-red-500/30"></div>
              </div>
            )}

            {/* Day columns */}
            <div className="absolute top-0 bottom-0 left-16 right-0 flex">
              {daysOffsetArray.map((offset) => {
                const d = getDayDate(offset);
                const dateStr = formatDateStr(d);
                const dayEvents = allCalendarEvents.filter(
                  (e) => e.date === dateStr && e.type === 'course'
                );

                return (
                  <div
                    key={offset}
                    onClick={() => isWeekMode && handleWeekDayClick(d)}
                    className={`flex-1 border-r border-slate-700/30 relative group ${
                      isWeekMode ? 'cursor-pointer hover:bg-slate-700/15 transition-colors' : ''
                    }`}
                  >
                    {/* Quick-add task button */}
                    {onQuickAddTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAddTask(dateStr);
                        }}
                        className="absolute top-1 right-1 z-30 w-5 h-5 rounded bg-indigo-600/80 hover:bg-indigo-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Tambah tugas di hari ini"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}

                    {dayEvents.map((ev) => {
                      const [h, m] = ev.startTime.split(':').map(Number);
                      const top = (h - HOUR_START) * HOUR_HEIGHT + m;
                      const [eh, em] = ev.endTime.split(':').map(Number);
                      const height = (eh - h) * HOUR_HEIGHT + (em - m);
                      if (top < 0) return null;

                      return (
                        <div
                          key={ev.instanceId}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev);
                          }}
                          className="absolute left-1 right-1 rounded-md p-1.5 text-xs overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:z-10 shadow-lg border bg-indigo-600/90 text-white border-indigo-400"
                          style={{ top: `${top}px`, height: `${height}px`, zIndex: 5 }}
                        >
                          <div className="font-bold leading-tight flex items-center justify-between gap-2">
                            <span>{ev.name}</span>
                            {ev.isRescheduled && (
                              <span className="text-[10px] uppercase tracking-[0.15em] px-1 rounded bg-amber-500/20 text-amber-100">
                                reschedule
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            {ev.startTime} - {ev.endTime}
                          </div>
                          <div className="text-[9px] mt-1 bg-black/20 inline-block px-1 rounded">
                            P-{ev.meetingNum}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = allCalendarEvents
      .filter((e) => new Date(e.date) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime)
      )
      .slice(0, 30);

    const grouped = [];
    let lastDate = null;
    upcomingEvents.forEach((ev) => {
      if (ev.date !== lastDate) {
        grouped.push({ type: 'header', date: ev.date });
        lastDate = ev.date;
      }
      grouped.push({ type: 'event', ev });
    });

    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
        {grouped.map((item, idx) => {
          if (item.type === 'header') {
            const d = new Date(item.date);
            const isToday = item.date === formatDateStr(new Date());
            const dayName = displayDaysOfWeek[d.getDay()];
            return (
              <div
                key={`header-${item.date}`}
                className={`flex items-center gap-3 pt-4 pb-2 ${idx > 0 ? 'mt-2 border-t border-slate-700/60' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                  isToday ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                }`}>
                  <span className="text-lg font-black leading-none">{d.getDate()}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-70">
                    {monthNames[d.getMonth()].substring(0, 3)}
                  </span>
                </div>
                <div>
                  <div className={`text-sm font-bold ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {dayName}
                    {isToday && <span className="ml-2 text-[10px] uppercase tracking-wider bg-indigo-500/20 px-2 py-0.5 rounded-full">Hari ini</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {d.getDate()} {monthNames[d.getMonth()]} {d.getFullYear()}
                  </div>
                </div>
              </div>
            );
          }

          const ev = item.ev;
          return (
            <div
              key={ev.instanceId}
              onClick={() => {
                if (ev.type === 'task') onSelectTask(ev);
              }}
              className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ml-2 ${
                ev.type === 'course'
                  ? 'border-indigo-500 bg-slate-900 hover:bg-slate-700/50'
                  : ev.urgency === 'high'
                  ? 'border-rose-500 bg-rose-950/20 hover:bg-rose-950/30 cursor-pointer'
                  : 'border-emerald-500 bg-emerald-950/20 hover:bg-emerald-950/30 cursor-pointer'
              } transition-colors`}
            >
              <div className={`w-24 text-sm font-mono text-center p-2 rounded shrink-0 ${
                ev.type === 'course' ? 'bg-slate-950/50 text-slate-400' : 'bg-slate-950/30 text-slate-400'
              }`}>
                <span className="block text-xs font-bold mb-0.5">
                  {ev.startTime}
                </span>
                {ev.type === 'course' && ev.endTime && (
                  <span className="block text-[11px] opacity-60">
                    — {ev.endTime}
                  </span>
                )}
                {ev.type === 'task' && (
                  <span className="block text-[10px] text-slate-500">deadline</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="truncate">{ev.type === 'course' ? ev.name : ev.title}</span>
                  {ev.type === 'course' && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded shrink-0">
                      P-{ev.meetingNum}
                    </span>
                  )}
                  {ev.type === 'task' && (
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                      ev.urgency === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {ev.urgency === 'high' ? 'Urgent' : 'Normal'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400">
                  {ev.type === 'course' ? `${ev.location} • ${ev.sks} SKS` : 'Tugas / Deadline'}
                </div>
                {ev.isRescheduled && (
                  <div className="text-xs text-amber-300 mt-2 uppercase tracking-wider">Reschedule</div>
                )}
              </div>
              {ev.type === 'course' && (
                <button
                  onClick={() => onSelectEvent(ev)}
                  className="px-3 py-2 bg-slate-800 hover:bg-indigo-900/50 text-indigo-400 rounded-lg transition-colors text-sm shrink-0"
                >
                  Detail & Aksi
                </button>
              )}
            </div>
          );
        })}

        {upcomingEvents.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            Tidak ada event mendatang.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex flex-col gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
        {/* Breadcrumb */}
        {viewHistory.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            {viewHistory.map((h, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => {
                    // Jump back to this level
                    setViewHistory((hist) => hist.slice(0, i));
                    setViewMode(h.viewMode);
                    setCurrentDateObj(h.date);
                  }}
                  className="text-slate-500 hover:text-indigo-400 transition-colors capitalize"
                >
                  {h.viewMode === 'month'
                    ? `${monthNames[h.date.getMonth()]} ${h.date.getFullYear()}`
                    : h.viewMode === 'week'
                    ? (() => {
                        const s = new Date(h.date);
                        s.setDate(s.getDate() - s.getDay());
                        const e = new Date(s);
                        e.setDate(e.getDate() + 6);
                        return `${s.getDate()}-${e.getDate()} ${monthNames[e.getMonth()]}`;
                      })()
                    : `${h.date.getDate()} ${monthNames[h.date.getMonth()]}`}
                </button>
                <span className="text-slate-600">›</span>
              </React.Fragment>
            ))}
            <span className="text-indigo-400 font-bold capitalize">
              {viewMode === 'month'
                ? `${monthNames[currentDateObj.getMonth()]} ${currentDateObj.getFullYear()}`
                : viewMode === 'week'
                ? getWeekHeaderText()
                : `${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}`}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 rounded-lg p-1">
              <button onClick={() => navDate(-1)} className="p-2 hover:bg-slate-700 rounded text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 font-bold text-white min-w-[200px] text-center">
                {viewMode === 'month'
                  ? `${monthNames[currentDateObj.getMonth()]} ${currentDateObj.getFullYear()}`
                  : viewMode === 'week'
                  ? getWeekHeaderText()
                  : `${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}`}
              </div>
              <button onClick={() => navDate(1)} className="p-2 hover:bg-slate-700 rounded text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Today button */}
            <button
              onClick={goToToday}
              className="px-3 py-2 bg-slate-900 hover:bg-indigo-900/40 text-slate-400 hover:text-indigo-400 rounded-lg text-sm transition-colors flex items-center gap-1.5 border border-slate-700 hover:border-indigo-500/30"
            >
              <CalendarDays className="w-4 h-4" />
              Hari Ini
            </button>

            {/* Back button */}
            {viewHistory.length > 0 && (
              <button
                onClick={goBack}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm transition-colors border border-slate-700"
              >
                ← Kembali
              </button>
            )}
          </div>

          <div className="flex bg-slate-900 rounded-lg p-1">
            {['month', 'week', 'day', 'agenda'].map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewHistory([]);
                  setViewMode(mode);
                }}
                className={`px-4 py-2 rounded-md text-sm transition-colors capitalize ${
                  viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Renderers */}
      {viewMode === 'month' && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-800 border-b border-slate-700">
            {displayDaysOfWeek.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-bold text-slate-400">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => {
              const d = new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), 1);
              const startOffset = d.getDay();
              d.setDate(d.getDate() - startOffset + i);
              return renderCalendarCell(formatDateStr(d), d);
            })}
          </div>
        </div>
      )}

      {viewMode === 'week' && renderTimelineView([0, 1, 2, 3, 4, 5, 6])}
      {viewMode === 'day' && renderTimelineView([0])}
      {viewMode === 'agenda' && renderAgendaView()}
    </div>
  );
};

export default ScheduleView;
