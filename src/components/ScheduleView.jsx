import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import { formatDateStr, daysOfWeek, monthNames } from '../utils/dateUtils';
import { getCourseColor } from '../utils/courseColors';
import { getContrastColor } from '../hooks/useTheme';

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
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    const isToday = dateStr === formatDateStr(new Date());
    const isCurrentMonth = cellDateObj.getMonth() === currentDateObj.getMonth();

    return (
      <div
        key={dateStr}
        onClick={() => handleMonthCellClick(cellDateObj)}
        className={`min-h-[100px] p-1 border-r border-b border-theme cursor-pointer transition-colors group ${
          !isCurrentMonth
            ? 'bg-theme-surface-subtle/50 hover:bg-theme-surface-subtle/80'
            : isToday
            ? 'bg-accent/[0.08] ring-1 ring-inset ring-accent/60'
            : 'bg-theme-surface hover:bg-theme-surface-subtle/60'
        }`}
      >
        <div className="text-xs font-medium p-1 flex items-center justify-between gap-1">
          {isToday ? (
            <span className="text-[9px] font-bold text-accent px-1.5 py-0.2 bg-accent/15 rounded border border-accent/30">
              Hari ini
            </span>
          ) : (
            <span className="text-[9px] text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity">
              Minggu →
            </span>
          )}

          {isToday ? (
            <span className="w-5 h-5 rounded-full bg-accent text-accent-contrast flex items-center justify-center font-bold text-xs shadow-xs">
              {cellDateObj.getDate()}
            </span>
          ) : (
            <span className={!isCurrentMonth ? 'text-theme-muted/60' : 'text-theme-muted'}>
              {cellDateObj.getDate()}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {dayEvents.map((ev) => {
            const isCourse = ev.type === 'course';
            const isEvent = ev.type === 'event';
            const courseColor = isCourse ? getCourseColor(ev) : null;

            if (isEvent) {
              return (
                <div
                  key={ev.instanceId}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask(ev);
                  }}
                  className="text-[11px] px-1.5 py-0.5 rounded cursor-pointer truncate relative z-10 font-medium border bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 hover:opacity-90"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">🎉</span>
                    {ev.startTime && <span className="text-[10px] opacity-75 font-mono">{ev.startTime}</span>}
                  </div>
                  <div className="truncate">{ev.title}</div>
                </div>
              );
            }

            return (
              <div
                key={ev.instanceId}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCourse) onSelectEvent(ev);
                  else onSelectTask(ev);
                }}
                style={isCourse ? {
                  backgroundColor: `${courseColor}18`,
                  color: courseColor,
                  borderColor: `${courseColor}55`,
                } : undefined}
                className={`text-[11px] px-1.5 py-0.5 rounded cursor-pointer truncate relative z-10 font-medium border ${
                  isCourse
                    ? 'hover:opacity-90'
                    : ev.urgency === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-700/50'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isCourse && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: courseColor }} />
                  )}
                  <span className="text-[10px] opacity-75">{isCourse ? ev.startTime : '📌'}</span>
                  {ev.isRescheduled && (
                    <span className="text-[8px] uppercase tracking-wider px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-200">
                      resched
                    </span>
                  )}
                </div>
                <div className="truncate">{isCourse ? ev.name : `[TGS] ${ev.title}`}</div>
              </div>
            );
          })}
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

    const hasBanners = daysOffsetArray.some((offset) => {
      const dateStr = formatDateStr(getDayDate(offset));
      return allCalendarEvents.some(
        (e) => e.date === dateStr && (e.type === 'task' || (e.type === 'event' && (!e.startTime || !e.endTime)))
      );
    });

    // Current time line position
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = formatDateStr(now);

    return (
      <div className="bg-theme-surface rounded-lg border border-theme overflow-hidden flex flex-col h-[600px] shadow-sm">
        {/* Header Days */}
        <div className="flex border-b border-theme bg-theme-surface-subtle shrink-0">
          <div className="w-16 shrink-0 border-r border-theme"></div>
          {daysOffsetArray.map((offset) => {
            const d = getDayDate(offset);
            const dateStr = formatDateStr(d);
            const isToday = dateStr === todayStr;
            return (
              <div
                key={offset}
                onClick={() => isWeekMode && handleWeekDayClick(d)}
                className={`flex-1 text-center py-2 text-xs font-semibold border-r border-theme transition-colors ${
                  isWeekMode ? 'cursor-pointer' : ''
                } ${
                  isToday
                    ? 'bg-accent/10'
                    : isWeekMode ? 'hover:bg-theme-surface' : ''
                }`}
              >
                <div className={`leading-tight ${isToday ? 'text-accent font-bold' : 'text-theme-muted'}`}>
                  {displayDaysOfWeek[d.getDay()]}
                </div>
                <div className="mt-0.5 flex items-center justify-center">
                  {isToday ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-accent text-accent-contrast font-bold text-[10px] shadow-xs">
                      {d.getDate()}/{d.getMonth() + 1}
                    </span>
                  ) : (
                    <span className="text-[11px] font-normal text-theme-muted opacity-80">
                      {d.getDate()}/{d.getMonth() + 1}
                    </span>
                  )}
                </div>
                {isToday && (
                  <span className="inline-block text-[9px] font-bold text-accent bg-accent/15 px-1.5 py-0.2 rounded mt-0.5 border border-accent/30">
                    Hari ini
                  </span>
                )}
                {isWeekMode && !isToday && (
                  <span className="block text-[9px] text-theme-muted opacity-0 hover:opacity-100 transition-opacity">
                    Lihat hari
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* All-day task & event banners */}
        {hasBanners && (
          <div className="flex border-b border-theme shrink-0 bg-theme-surface-subtle/70">
            <div className="w-16 shrink-0 border-r border-theme flex items-center justify-end pr-2">
              <span className="text-[10px] text-theme-muted uppercase tracking-wider font-mono">Agenda</span>
            </div>
            {daysOffsetArray.map((offset) => {
              const d = getDayDate(offset);
              const dateStr = formatDateStr(d);
              const dayBanners = allCalendarEvents.filter(
                (e) => e.date === dateStr && (e.type === 'task' || (e.type === 'event' && (!e.startTime || !e.endTime)))
              );
              return (
                <div
                  key={`banner-${offset}`}
                  className={`flex-1 border-r border-theme-subtle p-1 space-y-0.5 min-h-[8px] ${
                    isWeekMode ? 'cursor-pointer hover:bg-theme-surface/50 transition-colors' : ''
                  }`}
                  onClick={() => isWeekMode && handleWeekDayClick(d)}
                >
                  {dayBanners.map((item) => {
                    const itemIsEvent = item.type === 'event';
                    if (itemIsEvent) {
                      return (
                        <div
                          key={item.instanceId}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(item);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer transition-colors bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/60"
                          title={`[Acara] ${item.title}`}
                        >
                          <span className="mr-1">🎉</span>
                          {item.title}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.instanceId}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(item);
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer transition-colors ${
                          item.urgency === 'high'
                            ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        }`}
                        title={`${item.title} — DL: ${item.startTime}`}
                      >
                        <span className="opacity-70 mr-1 font-mono">{item.startTime}</span>
                        {item.title}
                      </div>
                    );
                  })}
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
                  className="absolute left-0 right-0 border-t border-theme-subtle"
                  style={{ top: `${(h - HOUR_START) * HOUR_HEIGHT}px` }}
                />
                <div
                  className="absolute left-0 w-16 text-right pr-2 text-[11px] font-mono text-theme-muted"
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
                <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1 shrink-0"></div>
                <div className="flex-1 h-[1.5px] bg-rose-500/80"></div>
              </div>
            )}

            {/* Day columns */}
            <div className="absolute top-0 bottom-0 left-16 right-0 flex">
              {daysOffsetArray.map((offset) => {
                const d = getDayDate(offset);
                const dateStr = formatDateStr(d);
                const isToday = dateStr === todayStr;
                const dayGridEvents = allCalendarEvents.filter(
                  (e) =>
                    e.date === dateStr &&
                    (e.type === 'course' || (e.type === 'event' && e.startTime && e.endTime))
                );

                return (
                  <div
                    key={offset}
                    onClick={() => isWeekMode && handleWeekDayClick(d)}
                    className={`flex-1 border-r border-theme-subtle relative group ${
                      isToday ? 'bg-accent/[0.04]' : ''
                    } ${
                      isWeekMode ? 'cursor-pointer hover:bg-theme-surface-subtle/30 transition-colors' : ''
                    }`}
                  >
                    {/* Quick-add task button */}
                    {onQuickAddTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAddTask(dateStr);
                        }}
                        className="absolute top-1 right-1 z-30 w-5 h-5 rounded bg-theme-surface-subtle hover:bg-accent text-theme-muted hover:text-accent-contrast flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-theme shadow-sm"
                        title="Tambah tugas / acara di hari ini"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}

                    {dayGridEvents.map((ev) => {
                      const isCourse = ev.type === 'course';
                      const [h, m] = ev.startTime.split(':').map(Number);
                      const top = (h - HOUR_START) * HOUR_HEIGHT + m;
                      const [eh, em] = ev.endTime.split(':').map(Number);
                      const height = (eh - h) * HOUR_HEIGHT + (em - m);
                      if (top < 0) return null;

                      if (!isCourse) {
                        // Acara on grid
                        return (
                          <div
                            key={ev.instanceId}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(ev);
                            }}
                            className="absolute left-1 right-1 rounded p-1.5 text-xs overflow-hidden cursor-pointer border bg-purple-600 hover:bg-purple-700 text-white border-purple-500 hover:opacity-95 transition-all shadow-sm"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              zIndex: 6,
                            }}
                          >
                            <div className="font-semibold leading-tight flex items-center justify-between gap-1">
                              <span className="truncate">{ev.title}</span>
                              <span className="text-[9px] uppercase tracking-wider px-1 rounded bg-black/30 text-white border border-white/20 shrink-0">
                                Acara
                              </span>
                            </div>
                            <div className="text-[10px] opacity-85 mt-0.5 font-mono">
                              {ev.startTime} - {ev.endTime}
                            </div>
                            {ev.location && (
                              <div className="text-[9px] opacity-90 truncate mt-0.5">
                                📍 {ev.location}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const evColor = getCourseColor(ev);
                      const contrastColor = getContrastColor(evColor);

                      return (
                        <div
                          key={ev.instanceId}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev);
                          }}
                          className="absolute left-1 right-1 rounded p-1.5 text-xs overflow-hidden cursor-pointer border hover:opacity-95 transition-all shadow-sm"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            zIndex: 5,
                            backgroundColor: evColor,
                            color: contrastColor,
                            borderColor: `${evColor}dd`,
                          }}
                        >
                          <div className="font-semibold leading-tight flex items-center justify-between gap-1">
                            <span className="truncate">{ev.name}</span>
                            {ev.isRescheduled && (
                              <span className="text-[9px] uppercase tracking-wider px-1 rounded bg-black/30 text-white border border-white/20 shrink-0">
                                resched
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] opacity-85 mt-0.5 font-mono">
                            {ev.startTime} - {ev.endTime}
                          </div>
                          <div className="text-[9px] mt-1 bg-black/20 text-white inline-block px-1 rounded font-mono">
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
      <div className="bg-theme-surface p-4 rounded-lg border border-theme space-y-2 shadow-sm">
        {grouped.map((item, idx) => {
          if (item.type === 'header') {
            const d = new Date(item.date);
            const isToday = item.date === formatDateStr(new Date());
            const dayName = displayDaysOfWeek[d.getDay()];
            return (
              <div
                key={`header-${item.date}`}
                className={`flex items-center gap-3 pt-4 pb-2 ${idx > 0 ? 'mt-2 border-t border-theme' : ''}`}
              >
                <div className={`w-10 h-10 rounded-md flex flex-col items-center justify-center shrink-0 ${
                  isToday ? 'bg-accent text-accent-contrast shadow-sm' : 'bg-theme-surface-subtle text-theme-text border border-theme'
                }`}>
                  <span className="text-base font-bold leading-none">{d.getDate()}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-80">
                    {monthNames[d.getMonth()].substring(0, 3)}
                  </span>
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isToday ? 'text-accent' : 'text-theme-text'}`}>
                    {dayName}
                    {isToday && <span className="ml-2 text-[10px] font-medium bg-accent/15 text-accent px-1.5 py-0.5 rounded border border-accent/30">Hari ini</span>}
                  </div>
                  <div className="text-[11px] text-theme-muted">
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
                if (ev.type === 'task' || ev.type === 'event') onSelectTask(ev);
              }}
              className={`flex items-center gap-3 p-3 rounded-md border ${
                ev.type === 'course'
                  ? 'border-theme bg-theme-surface-subtle/50 hover:bg-theme-surface-subtle'
                  : ev.type === 'event'
                  ? 'border-purple-200 dark:border-purple-800/40 bg-purple-50/80 dark:bg-purple-950/20 hover:bg-purple-100/80 dark:hover:bg-purple-950/30 cursor-pointer'
                  : ev.urgency === 'high'
                  ? 'border-rose-200 dark:border-rose-800/40 bg-rose-50/80 dark:bg-rose-950/20 hover:bg-rose-100/80 dark:hover:bg-rose-950/30 cursor-pointer'
                  : 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/80 dark:bg-emerald-950/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/30 cursor-pointer'
              } transition-colors`}
            >
              <div className="w-20 text-xs font-mono text-center p-1.5 rounded bg-theme-surface border border-theme text-theme-muted shrink-0">
                <span className="block font-semibold text-theme-text">
                  {ev.startTime || '--:--'}
                </span>
                {ev.endTime && (
                  <span className="block text-[10px] opacity-70">
                    — {ev.endTime}
                  </span>
                )}
                {ev.type === 'task' && !ev.endTime && (
                  <span className="block text-[9px] text-theme-muted">deadline</span>
                )}
                {ev.type === 'event' && !ev.endTime && (
                  <span className="block text-[9px] text-purple-600 dark:text-purple-400">acara</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-theme-text text-sm flex items-center gap-2">
                  {ev.type === 'course' && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: getCourseColor(ev) }}
                    />
                  )}
                  <span className="truncate">{ev.type === 'course' ? ev.name : ev.title}</span>
                  {ev.type === 'course' && (
                    <span className="text-[10px] font-mono bg-theme-surface text-theme-muted px-1.5 py-0.5 rounded border border-theme shrink-0">
                      P-{ev.meetingNum}
                    </span>
                  )}
                  {ev.type === 'event' && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60">
                      🎉 Acara
                    </span>
                  )}
                  {ev.type === 'task' && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${
                      ev.urgency === 'high'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                    }`}>
                      {ev.urgency === 'high' ? 'Urgent' : 'Normal'}
                    </span>
                  )}
                </div>
                <div className="text-xs text-theme-muted mt-0.5">
                  {ev.type === 'course'
                    ? `${ev.location} • ${ev.sks} SKS`
                    : ev.type === 'event'
                    ? (ev.location ? `📍 ${ev.location}` : 'Acara / Kegiatan')
                    : 'Tugas Kuliah'}
                </div>
                {ev.isRescheduled && (
                  <div className="text-[10px] font-medium text-amber-600 dark:text-amber-300 mt-1 uppercase tracking-wider">Reschedule</div>
                )}
              </div>
              {ev.type === 'course' && (
                <button
                  onClick={() => onSelectEvent(ev)}
                  className="px-2.5 py-1.5 bg-theme-surface-subtle hover:bg-theme-surface text-theme-text rounded-md transition-colors text-xs font-medium border border-theme shrink-0"
                >
                  Detail & Aksi
                </button>
              )}
            </div>
          );
        })}

        {upcomingEvents.length === 0 && (
          <div className="text-center text-theme-muted py-12 text-sm">
            Tidak ada event mendatang.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex flex-col gap-2.5 bg-theme-surface p-3 rounded-lg border border-theme shadow-sm">
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
                  className="text-theme-muted hover:text-accent transition-colors capitalize"
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
                <span className="text-theme-muted">›</span>
              </React.Fragment>
            ))}
            <span className="text-accent font-semibold capitalize">
              {viewMode === 'month'
                ? `${monthNames[currentDateObj.getMonth()]} ${currentDateObj.getFullYear()}`
                : viewMode === 'week'
                ? getWeekHeaderText()
                : `${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}`}
            </span>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-theme-surface-subtle border border-theme rounded-md p-0.5">
              <button onClick={() => navDate(-1)} className="p-1.5 hover:bg-theme-surface rounded text-theme-muted hover:text-theme-text transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 font-semibold text-xs text-theme-text min-w-[180px] text-center">
                {viewMode === 'month'
                  ? `${monthNames[currentDateObj.getMonth()]} ${currentDateObj.getFullYear()}`
                  : viewMode === 'week'
                  ? getWeekHeaderText()
                  : `${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}`}
              </div>
              <button onClick={() => navDate(1)} className="p-1.5 hover:bg-theme-surface rounded text-theme-muted hover:text-theme-text transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Today button */}
            <button
              onClick={goToToday}
              className="px-2.5 py-1.5 bg-theme-surface-subtle hover:bg-theme-surface text-theme-text rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 border border-theme"
            >
              <CalendarDays className="w-3.5 h-3.5 text-theme-muted" />
              Hari Ini
            </button>

            {/* Back button */}
            {viewHistory.length > 0 && (
              <button
                onClick={goBack}
                className="px-2.5 py-1.5 bg-theme-surface-subtle hover:bg-theme-surface text-theme-text rounded-md text-xs font-medium transition-colors border border-theme"
              >
                ← Kembali
              </button>
            )}
          </div>

          <div className="flex bg-theme-surface-subtle border border-theme rounded-md p-0.5">
            {['month', 'week', 'day', 'agenda'].map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewHistory([]);
                  setViewMode(mode);
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                  viewMode === mode ? 'bg-accent text-accent-contrast shadow-sm' : 'text-theme-muted hover:text-theme-text'
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
        <div className="bg-theme-surface rounded-lg border border-theme overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 bg-theme-surface-subtle border-b border-theme">
            {displayDaysOfWeek.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-theme-muted">
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
