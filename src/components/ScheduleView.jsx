import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateStr, daysOfWeek, monthNames } from '../utils/dateUtils';

const ScheduleView = ({ allCalendarEvents, onSelectEvent }) => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDateObj, setCurrentDateObj] = useState(new Date());

  const navDate = (dir) => {
    const d = new Date(currentDateObj);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDateObj(d);
  };

  const renderCalendarCell = (dateStr) => {
    const dayEvents = allCalendarEvents
      .filter((e) => e.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    const isToday = dateStr === formatDateStr(new Date());

    return (
      <div
        key={dateStr}
        className={`min-h-[100px] p-1 border-r border-b border-slate-700/50 ${isToday ? 'bg-indigo-950/20' : 'bg-slate-800'}`}
      >
        <div className={`text-xs font-bold text-right p-1 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
          {new Date(dateStr).getDate()}
        </div>
        <div className="space-y-1">
          {dayEvents.map((ev) => (
            <div
              key={ev.instanceId}
              onClick={() => ev.type === 'course' && onSelectEvent(ev)}
              className={`text-[10px] p-1 rounded cursor-pointer truncate ${
                ev.type === 'course'
                  ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/80 border border-indigo-500/30'
                  : ev.urgency === 'high'
                  ? 'bg-rose-900/50 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{ev.startTime}</span>
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
    const hours = Array.from({ length: 15 }, (_, i) => i + 6);
    const startOfWeek = new Date(currentDateObj);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-[600px]">
        {/* Header Days */}
        <div className="flex border-b border-slate-700 bg-slate-900">
          <div className="w-16 shrink-0 border-r border-slate-700"></div>
          {daysOffsetArray.map((offset) => {
            const d = new Date(viewMode === 'day' ? currentDateObj : startOfWeek);
            if (viewMode === 'week') d.setDate(d.getDate() + offset);
            const dateStr = formatDateStr(d);
            const isToday = dateStr === formatDateStr(new Date());
            return (
              <div
                key={offset}
                className={`flex-1 text-center py-2 text-sm font-bold border-r border-slate-700 ${
                  isToday ? 'text-indigo-400 bg-indigo-950/30' : 'text-slate-400'
                }`}
              >
                {daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1]} <br />
                <span className="text-xs font-normal">
                  {d.getDate()}/{d.getMonth() + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Grid Body */}
        <div
          className="flex-1 overflow-y-auto relative bg-slate-800"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '100% 60px',
          }}
        >
          {hours.map((h) => (
            <div
              key={h}
              className="absolute left-0 w-16 text-right pr-2 text-xs text-slate-500"
              style={{ top: `${(h - 6) * 60}px`, transform: 'translateY(-50%)' }}
            >
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}

          <div className="absolute top-0 bottom-0 left-16 right-0 flex">
            {daysOffsetArray.map((offset) => {
              const d = new Date(viewMode === 'day' ? currentDateObj : startOfWeek);
              if (viewMode === 'week') d.setDate(d.getDate() + offset);
              const dateStr = formatDateStr(d);
              const dayEvents = allCalendarEvents.filter((e) => e.date === dateStr);

              return (
                <div key={offset} className="flex-1 border-r border-slate-700/30 relative">
                  {dayEvents.map((ev) => {
                    const [h, m] = ev.startTime.split(':').map(Number);
                    const top = (h - 6) * 60 + m;
                    let height = 30;
                    if (ev.type === 'course') {
                      const [eh, em] = ev.endTime.split(':').map(Number);
                      height = (eh - h) * 60 + (em - m);
                    }
                    if (top < 0) return null;

                    return (
                      <div
                        key={ev.instanceId}
                        onClick={() => ev.type === 'course' && onSelectEvent(ev)}
                        className={`absolute left-1 right-1 rounded-md p-1.5 text-xs overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:z-10 shadow-lg border ${
                          ev.type === 'course'
                            ? 'bg-indigo-600/90 text-white border-indigo-400'
                            : ev.urgency === 'high'
                            ? 'bg-rose-600/90 text-white border-rose-400'
                            : 'bg-emerald-600/90 text-white border-emerald-400'
                        }`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="font-bold leading-tight flex items-center justify-between gap-2">
                          <span>{ev.type === 'course' ? ev.name : `[Task] ${ev.title}`}</span>
                          {ev.isRescheduled && (
                            <span className="text-[10px] uppercase tracking-[0.15em] px-1 rounded bg-amber-500/20 text-amber-100">
                              reschedule
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          {ev.startTime} {ev.type === 'course' && `- ${ev.endTime}`}
                        </div>
                        {ev.type === 'course' && (
                          <div className="text-[9px] mt-1 bg-black/20 inline-block px-1 rounded">
                            P-{ev.meetingNum}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
      {allCalendarEvents
        .filter((e) => new Date(e.date) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime)
        )
        .slice(0, 20)
        .map((ev) => (
          <div
            key={ev.instanceId}
            className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${
              ev.type === 'course'
                ? 'border-indigo-500 bg-slate-900 hover:bg-slate-700/50'
                : 'border-rose-500 bg-rose-950/20'
            }`}
          >
            <div className="w-24 text-sm text-slate-400 font-mono text-center bg-slate-950/50 p-2 rounded">
              <span className="block text-indigo-400 text-xs font-bold mb-1">
                {new Date(ev.date).getDate()}{' '}
                {monthNames[new Date(ev.date).getMonth()].substring(0, 3)}
              </span>
              {ev.startTime}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg flex items-center gap-2">
                {ev.type === 'course' ? ev.name : ev.title}
                {ev.type === 'course' && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    P-{ev.meetingNum}
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
                className="px-3 py-2 bg-slate-800 hover:bg-indigo-900/50 text-indigo-400 rounded-lg transition-colors text-sm"
              >
                Detail & Aksi
              </button>
            )}
          </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 rounded-lg p-1">
            <button onClick={() => navDate(-1)} className="p-2 hover:bg-slate-700 rounded text-slate-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-2 font-bold text-white min-w-[150px] text-center">
              {viewMode === 'month'
                ? `${monthNames[currentDateObj.getMonth()]} ${currentDateObj.getFullYear()}`
                : viewMode === 'week'
                ? `Minggu ${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}`
                : `${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}`}
            </div>
            <button onClick={() => navDate(1)} className="p-2 hover:bg-slate-700 rounded text-slate-400">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex bg-slate-900 rounded-lg p-1">
          {['month', 'week', 'day', 'agenda'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm transition-colors capitalize ${
                viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Renderers */}
      {viewMode === 'month' && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-800 border-b border-slate-700">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-bold text-slate-400">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => {
              const d = new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), 1);
              const startOffset = d.getDay() === 0 ? 6 : d.getDay() - 1;
              d.setDate(d.getDate() - startOffset + i);
              return renderCalendarCell(formatDateStr(d));
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
