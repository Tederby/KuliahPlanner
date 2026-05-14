import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, List, Clock, AlertTriangle, Settings, BookOpen, Trash2, CheckSquare, Bell, CalendarClock, Inbox, Plus, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';

// --- UTILS ---
const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatDateStr = (date) => {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

const getDayIndex = (dayName) => daysOfWeek.indexOf(dayName);

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateStr(d);
};

// --- VALIDATION UTILS ---
const validateCourse = (course) => {
  if (!course.name?.trim()) return 'Nama matkul wajib diisi';
  if (course.sks < 1 || course.sks > 6) return 'SKS harus antara 1-6';
  if (!course.startTime) return 'Jam mulai wajib diisi';
  if (!course.day) return 'Hari wajib dipilih';
  return null;
};

const validateTask = (task) => {
  if (!task.title?.trim()) return 'Judul tugas wajib diisi';
  if (!task.deadline) return 'Deadline wajib diisi';
  if (!task.courseId) return 'Pilih matkul untuk tugas ini';
  return null;
};

const validateConfig = (config) => {
  if (!config.semesterStart) return 'Tanggal mulai semester wajib';
  if (config.sksMinutes < 30) return 'SKS minutes minimal 30 menit';
  if (config.totalMeetings < 1) return 'Total pertemuan minimal 1';
  return null;
};

// --- LOCALSTORAGE UTILS ---
const STORAGE_KEY = 'kuliahplanner_data';

const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return null;
};

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

const getInitialState = () => {
  const saved = loadData();
  if (saved) {
    return saved;
  }

  const today = formatDateStr(new Date());
  return {
    config: {
      semesterStart: today,
      sksMinutes: 50,
      totalMeetings: 14,
      utsWeek: 8,
      uasWeek: 16
    },
    courses: [
      { id: 1, name: 'Rekayasa Perangkat Lunak', sks: 3, day: 'Rabu', startTime: '08:00', location: 'Ruang E101' },
      { id: 2, name: 'Sistem Operasi', sks: 3, day: 'Kamis', startTime: '13:00', location: 'Ruang E102' }
    ],
    stashes: [],
    tasks: [
      { id: 1, title: 'Makalah RPL', type: 'matkul', courseId: 1, deadline: `${today}T23:59`, urgency: 'high', completed: false }
    ]
  };
};

export default function App() {
  const initialState = getInitialState();
  
  const [activeTab, setActiveTab] = useState('schedule');
  const [viewMode, setViewMode] = useState('week');
  const [currentDateObj, setCurrentDateObj] = useState(new Date());

  // State
  const [config, setConfig] = useState(initialState.config);
  const [courses, setCourses] = useState(initialState.courses);
  const [stashes, setStashes] = useState(initialState.stashes);
  const [tasks, setTasks] = useState(initialState.tasks);

  // UI States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', courseId: '', deadline: '', urgency: 'low', type: 'matkul' });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', sks: 3, day: 'Senin', startTime: '07:00', location: '' });
  
  // Error state
  const [error, setError] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveData({ config, courses, stashes, tasks });
  }, [config, courses, stashes, tasks]);

  // --- LOGIC ENGINE ---
  const calculateEndTime = (start, sks) => {
    if (!start) return '';
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes + (sks * config.sksMinutes);
    const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endMins = (totalMinutes % 60).toString().padStart(2, '0');
    return `${endHours}:${endMins}`;
  };

  const generatedInstances = useMemo(() => {
    try {
      if (courses.length === 0) return [];

      const instances = [];
      const semesterStartDate = new Date(config.semesterStart);
      const semesterStartDayIndex = semesterStartDate.getDay() === 0 ? 6 : semesterStartDate.getDay() - 1;

      courses.forEach(course => {
        const courseDayIndex = getDayIndex(course.day);
        let daysUntilFirstClass = courseDayIndex - semesterStartDayIndex;
        if (daysUntilFirstClass < 0) daysUntilFirstClass += 7;
        
        let runningDate = addDays(config.semesterStart, daysUntilFirstClass);
        let meetingCount = 1;
        let weekCounter = 1;

        while (meetingCount <= config.totalMeetings) {
          if (weekCounter === config.utsWeek || weekCounter === config.uasWeek) {
            weekCounter++;
            runningDate = addDays(runningDate, 7);
            continue;
          }

          const isStashed = stashes.some(s => s.courseId === course.id && s.originalDate === runningDate);

          if (!isStashed) {
            const endTime = calculateEndTime(course.startTime, course.sks);
            instances.push({
              instanceId: `${course.id}-${runningDate}`,
              type: 'course',
              ...course,
              date: runningDate,
              endTime,
              meetingNum: meetingCount,
              weekNum: weekCounter
            });
          }
          
          meetingCount++;
          weekCounter++;
          runningDate = addDays(runningDate, 7);
        }
      });
      return instances;
    } catch (e) {
      console.error('Error generating instances:', e);
      return [];
    }
  }, [courses, config, stashes]);

  const allCalendarEvents = useMemo(() => {
    const taskEvents = tasks.filter(t => !t.completed).map(t => {
      const datePart = t.deadline.split('T')[0];
      const timePart = t.deadline.split('T')[1] || '23:59';
      return {
        instanceId: `task-${t.id}`,
        type: 'task',
        title: t.title,
        date: datePart,
        startTime: timePart,
        urgency: t.urgency,
        rawTask: t
      };
    });
    return [...generatedInstances, ...taskEvents];
  }, [generatedInstances, tasks]);

  // --- HANDLERS ---
  const handleStash = (courseId, date) => {
    setStashes([...stashes, { id: Date.now(), courseId, originalDate: date, notes: '' }]);
    setSelectedEvent(null);
  };

  const openTaskForCourse = (courseId, date) => {
    setNewTask({ title: '', courseId: courseId, deadline: `${date}T23:59`, urgency: 'low', type: 'matkul' });
    setShowTaskForm(true);
    setActiveTab('tasks');
    setSelectedEvent(null);
  };

  const navDate = (dir) => {
    const d = new Date(currentDateObj);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + (dir * 7));
    else d.setDate(d.getDate() + dir);
    setCurrentDateObj(d);
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateCourse(newCourse);
    if (validationError) {
      setError(validationError);
      return;
    }

    setCourses([...courses, { ...newCourse, id: Date.now() }]);
    setShowCourseForm(false);
    setNewCourse({ name: '', sks: 3, day: 'Senin', startTime: '07:00', location: '' });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateTask(newTask);
    if (validationError) {
      setError(validationError);
      return;
    }

    setTasks([...tasks, { ...newTask, id: Date.now(), completed: false }]);
    setShowTaskForm(false);
    setNewTask({ title: '', courseId: '', deadline: '', urgency: 'low', type: 'matkul' });
  };

  const handleUpdateConfig = (newConfig) => {
    setError(null);
    const validationError = validateConfig(newConfig);
    if (validationError) {
      setError(validationError);
      return;
    }
    setConfig(newConfig);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
    setStashes(stashes.filter(s => s.courseId !== id));
    setTasks(tasks.filter(t => t.courseId !== id));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTaskComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const restoreStash = (id) => {
    setStashes(stashes.filter(s => s.id !== id));
  };

  // --- RENDERERS ---
  const renderCalendarCell = (dateStr) => {
    const dayEvents = allCalendarEvents.filter(e => e.date === dateStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
    const isToday = dateStr === formatDateStr(new Date());

    return (
      <div key={dateStr} className={`min-h-[100px] p-1 border-r border-b border-slate-700/50 ${isToday ? 'bg-indigo-950/20' : 'bg-slate-800'}`}>
        <div className={`text-xs font-bold text-right p-1 ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
          {new Date(dateStr).getDate()}
        </div>
        <div className="space-y-1">
          {dayEvents.map(ev => (
            <div 
              key={ev.instanceId} 
              onClick={() => ev.type === 'course' && setSelectedEvent(ev)}
              className={`text-[10px] p-1 rounded cursor-pointer truncate ${
                ev.type === 'course' 
                  ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/80 border border-indigo-500/30' 
                  : ev.urgency === 'high' ? 'bg-rose-900/50 text-rose-300 border border-rose-500/30' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {ev.startTime} - {ev.type === 'course' ? ev.name : `[TGS] ${ev.title}`}
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
          {daysOffsetArray.map(offset => {
            const d = new Date(viewMode === 'day' ? currentDateObj : startOfWeek);
            if (viewMode === 'week') d.setDate(d.getDate() + offset);
            const dateStr = formatDateStr(d);
            const isToday = dateStr === formatDateStr(new Date());
            return (
              <div key={offset} className={`flex-1 text-center py-2 text-sm font-bold border-r border-slate-700 ${isToday ? 'text-indigo-400 bg-indigo-950/30' : 'text-slate-400'}`}>
                {daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1]} <br/>
                <span className="text-xs font-normal">{d.getDate()}/{d.getMonth()+1}</span>
              </div>
            );
          })}
        </div>
        
        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto relative bg-slate-800" style={{ backgroundImage: 'linear-gradient(to bottom, #334155 1px, transparent 1px)', backgroundSize: '100% 60px' }}>
          {/* Time Labels */}
          {hours.map(h => (
            <div key={h} className="absolute left-0 w-16 text-right pr-2 text-xs text-slate-500" style={{ top: `${(h - 6) * 60}px`, transform: 'translateY(-50%)' }}>
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}

          {/* Events Columns */}
          <div className="absolute top-0 bottom-0 left-16 right-0 flex">
            {daysOffsetArray.map(offset => {
              const d = new Date(viewMode === 'day' ? currentDateObj : startOfWeek);
              if (viewMode === 'week') d.setDate(d.getDate() + offset);
              const dateStr = formatDateStr(d);
              const dayEvents = allCalendarEvents.filter(e => e.date === dateStr);

              return (
                <div key={offset} className="flex-1 border-r border-slate-700/30 relative">
                  {dayEvents.map(ev => {
                    const [h, m] = ev.startTime.split(':').map(Number);
                    const top = ((h - 6) * 60) + m;
                    
                    let height = 30;
                    if (ev.type === 'course') {
                       const [eh, em] = ev.endTime.split(':').map(Number);
                       height = ((eh - h) * 60) + (em - m);
                    }

                    if (top < 0) return null;

                    return (
                      <div 
                        key={ev.instanceId}
                        onClick={() => ev.type === 'course' && setSelectedEvent(ev)}
                        className={`absolute left-1 right-1 rounded-md p-1.5 text-xs overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:z-10 shadow-lg border ${
                          ev.type === 'course' 
                            ? 'bg-indigo-600/90 text-white border-indigo-400' 
                            : ev.urgency === 'high' ? 'bg-rose-600/90 text-white border-rose-400' : 'bg-emerald-600/90 text-white border-emerald-400'
                        }`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="font-bold leading-tight">{ev.type === 'course' ? ev.name : `[Task] ${ev.title}`}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{ev.startTime} {ev.type === 'course' && `- ${ev.endTime}`}</div>
                        {ev.type === 'course' && <div className="text-[9px] mt-1 bg-black/20 inline-block px-1 rounded">P-{ev.meetingNum}</div>}
                      </div>
                    )
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSchedule = () => (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 rounded-lg p-1">
            <button onClick={() => navDate(-1)} className="p-2 hover:bg-slate-700 rounded text-slate-400"><ChevronLeft className="w-4 h-4"/></button>
            <div className="px-4 py-2 font-bold text-white min-w-[150px] text-center">
              {viewMode === 'month' ? `${monthNames[currentDateObj.getMonth()]} ${currentDateObj.getFullYear()}` : 
               viewMode === 'week' ? `Minggu ${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}` :
               `${currentDateObj.getDate()} ${monthNames[currentDateObj.getMonth()]}`}
            </div>
            <button onClick={() => navDate(1)} className="p-2 hover:bg-slate-700 rounded text-slate-400"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-1">
          {['month', 'week', 'day', 'agenda'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-2 rounded-md text-sm transition-colors capitalize ${viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Renderers */}
      {viewMode === 'month' && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
           <div className="grid grid-cols-7 bg-slate-800 border-b border-slate-700">
             {daysOfWeek.map(d => <div key={d} className="py-2 text-center text-xs font-bold text-slate-400">{d}</div>)}
           </div>
           <div className="grid grid-cols-7">
              {Array.from({length: 35}).map((_, i) => {
                const d = new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), 1);
                const startOffset = d.getDay() === 0 ? 6 : d.getDay() - 1;
                d.setDate(d.getDate() - startOffset + i);
                return renderCalendarCell(formatDateStr(d));
              })}
           </div>
        </div>
      )}

      {viewMode === 'week' && renderTimelineView([0,1,2,3,4,5,6])}
      {viewMode === 'day' && renderTimelineView([0])}
      
      {viewMode === 'agenda' && (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
          {allCalendarEvents.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime)).slice(0, 20).map(ev => (
            <div key={ev.instanceId} className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${ev.type === 'course' ? 'border-indigo-500 bg-slate-900 hover:bg-slate-700/50' : 'border-rose-500 bg-rose-950/20'}`}>
              <div className="w-24 text-sm text-slate-400 font-mono text-center bg-slate-950/50 p-2 rounded">
                <span className="block text-indigo-400 text-xs font-bold mb-1">{new Date(ev.date).getDate()} {monthNames[new Date(ev.date).getMonth()].substring(0,3)}</span>
                {ev.startTime}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-lg flex items-center gap-2">
                  {ev.type === 'course' ? ev.name : ev.title}
                  {ev.type === 'course' && <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">P-{ev.meetingNum}</span>}
                </div>
                <div className="text-sm text-slate-400">{ev.type === 'course' ? `${ev.location} • ${ev.sks} SKS` : 'Tugas / Deadline'}</div>
              </div>
              {ev.type === 'course' && (
                <button onClick={() => setSelectedEvent(ev)} className="px-3 py-2 bg-slate-800 hover:bg-indigo-900/50 text-indigo-400 rounded-lg transition-colors text-sm">
                  Detail & Aksi
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <div className="md:w-64 shrink-0 space-y-2">
          <div className="mb-8 px-4">
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">KuliahPlanner.</h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest"></p>
          </div>

          {[
            { id: 'schedule', icon: Calendar, label: `Full Kalender` },
            { id: 'tasks', icon: List, label: `Tugas (${tasks.filter(t=>!t.completed).length})` },
            { id: 'matkul', icon: Settings, label: 'Config & Data' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
          
          <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
             <div className="text-xs font-bold text-slate-400 mb-2">Engine Info</div>
             <div className="text-[10px] text-slate-500 space-y-1">
                <p>Semester Mulai: {config.semesterStart}</p>
                <p>Target Pertemuan: {config.totalMeetings}</p>
                <p>UTS: Minggu ke-{config.utsWeek} (Kosong)</p>
                <p>UAS: Minggu ke-{config.uasWeek} (Kosong)</p>
             </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-rose-900/20 border border-rose-900/50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-rose-400">Error</p>
                <p className="text-sm text-rose-300">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'schedule' && renderSchedule()}
          
          {activeTab === 'matkul' && (
            <div className="space-y-6">
              {/* Global Settings */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5"/> Konfigurasi Semester</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tanggal Mulai Semester</label>
                    <input type="date" value={config.semesterStart} onChange={e => handleUpdateConfig({...config, semesterStart: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Durasi 1 SKS (Menit)</label>
                    <input type="number" value={config.sksMinutes} onChange={e => handleUpdateConfig({...config, sksMinutes: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Target Pertemuan</label>
                    <input type="number" value={config.totalMeetings} onChange={e => handleUpdateConfig({...config, totalMeetings: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Minggu UTS (Kosong)</label>
                    <input type="number" value={config.utsWeek} onChange={e => handleUpdateConfig({...config, utsWeek: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Minggu UAS (Kosong)</label>
                    <input type="number" value={config.uasWeek} onChange={e => handleUpdateConfig({...config, uasWeek: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Course List & Add */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5"/> Data Matkul Induk</h2>
                  <button onClick={() => setShowCourseForm(!showCourseForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2">
                    {showCourseForm ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} Tambah Matkul
                  </button>
                </div>

                {showCourseForm && (
                  <form onSubmit={handleAddCourse} className="bg-slate-900 p-4 rounded-xl border border-indigo-500/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs text-slate-400 mb-1">Nama Matkul</label>
                      <input required type="text" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" placeholder="Kalkulus Lanjut" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Hari</label>
                      <select value={newCourse.day} onChange={e => setNewCourse({...newCourse, day: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500">
                        {daysOfWeek.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Jam Mulai</label>
                      <input required type="time" value={newCourse.startTime} onChange={e => setNewCourse({...newCourse, startTime: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">SKS</label>
                      <input required type="number" min="1" max="6" value={newCourse.sks} onChange={e => setNewCourse({...newCourse, sks: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Lokasi Ruang</label>
                      <input type="text" value={newCourse.location} onChange={e => setNewCourse({...newCourse, location: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" placeholder="Lab A" />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-bold transition-colors">Simpan Matkul</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {courses.map(course => (
                    <div key={course.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          {course.name} <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{course.sks} SKS</span>
                        </h3>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>{course.day}, {course.startTime}</span>
                          <span>• {course.location}</span>
                        </div>
                      </div>
                      <button onClick={() => removeCourse(course.id)} className="text-rose-500 hover:bg-rose-950 p-2 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Belum ada matkul, bebas tugas coy.</p>}
                </div>
              </div>

              {/* Stashes / Limbo */}
              <div className="bg-rose-950/20 p-6 rounded-xl border border-rose-900/50">
                <h2 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2"><Inbox className="w-5 h-5"/> Limbo / Kelas Di-Stash</h2>
                <p className="text-xs text-slate-400 mb-4">Daftar pertemuan spesifik yang dosennya ghosting. Balikin ke kalender kalau jadwal gantinya udah jelas.</p>
                <div className="space-y-3">
                  {stashes.map(stash => {
                    const course = courses.find(c => c.id === stash.courseId);
                    if (!course) return null;
                    return (
                      <div key={stash.id} className="bg-slate-900 p-4 rounded-lg border border-rose-900/30 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-white text-sm">{course.name}</h3>
                          <div className="text-xs text-rose-300 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3"/> Jadwal Asli: {stash.originalDate}
                          </div>
                        </div>
                        <button onClick={() => restoreStash(stash.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs transition-colors">
                          Balikin ke Kalender
                        </button>
                      </div>
                    )
                  })}
                  {stashes.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Kosong. Alhamdulillah dosen pada amanah.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CheckSquare/> Daftar Tugas</h2>
              {showTaskForm && (
                <form onSubmit={handleAddTask} className="bg-slate-900 p-4 rounded-xl border border-indigo-500/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-slate-400 mb-1">Judul Tugas</label>
                    <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" placeholder="Judul..." />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Matkul</label>
                    <select required value={newTask.courseId} onChange={e => setNewTask({...newTask, courseId: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500">
                      <option value="">-- Pilih Matkul --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Deadline</label>
                    <input required type="datetime-local" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Urgency</label>
                    <select value={newTask.urgency} onChange={e => setNewTask({...newTask, urgency: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500">
                      <option value="low">Rendah</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button type="submit" className="flex-1 bg-emerald-600 w-full hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold transition-colors">Save Task</button>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md font-bold transition-colors">Cancel</button>
                  </div>
                </form>
              )}
              <div className="space-y-2">
                 {tasks.map(t => {
                   const course = courses.find(c => c.id === t.courseId);
                   return (
                     <div key={t.id} className={`p-4 bg-slate-900 rounded-lg border transition-colors ${t.completed ? 'border-slate-600 opacity-60' : 'border-slate-700'}`}>
                       <div className="flex items-start justify-between gap-3">
                         <div className="flex-1">
                           <div className={`font-bold ${t.completed ? 'line-through text-slate-500' : 'text-white'}`}>{t.title}</div>
                           <div className="text-xs text-slate-400 mt-1">
                             <p>Matkul: {course?.name || 'Unknown'}</p>
                             <p>Deadline: {t.deadline.replace('T', ' ')}</p>
                             <p>Urgency: <span className={t.urgency === 'high' ? 'text-rose-400' : 'text-emerald-400'}>{t.urgency === 'high' ? '🔴 Tinggi' : '🟢 Rendah'}</span></p>
                           </div>
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => toggleTaskComplete(t.id)} className={`px-3 py-1 rounded text-xs transition-colors ${t.completed ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-600' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                             {t.completed ? '✓ Selesai' : 'Done'}
                           </button>
                           <button onClick={() => removeTask(t.id)} className="text-rose-500 hover:bg-rose-950 p-2 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                         </div>
                       </div>
                     </div>
                   );
                 })}
                 <button onClick={() => setShowTaskForm(true)} className="w-full py-3 border-2 border-dashed border-slate-700 text-slate-400 rounded-lg hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                   + Tambah Tugas Manual
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EVENT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-indigo-900/40 border-b border-indigo-500/20 p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Pertemuan Ke-{selectedEvent.meetingNum}
                </span>
                <span className="text-indigo-300 text-xs font-mono">Minggu Sem Ke-{selectedEvent.weekNum}</span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">{selectedEvent.name}</h2>
              <div className="text-indigo-200 mt-2 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4"/> {selectedEvent.date} | {selectedEvent.startTime} - {selectedEvent.endTime}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
                <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <span className="block text-slate-500 text-xs mb-1">Lokasi Ruangan</span>
                  {selectedEvent.location} ({selectedEvent.sks} SKS)
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button 
                  onClick={() => openTaskForCourse(selectedEvent.id, selectedEvent.date)}
                  className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Tambah Tugas Untuk Matkul Ini
                </button>
                <button 
                  onClick={() => handleStash(selectedEvent.id, selectedEvent.date)}
                  className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" /> Dosen Ghosting? Stash Kelas Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
