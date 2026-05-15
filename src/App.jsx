import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

import { useKuliahData } from './hooks/useKuliahData';
import { useCalendarEvents } from './hooks/useCalendarEvents';

import Sidebar from './components/Sidebar';
import EventModal from './components/EventModal';
import ScheduleView from './components/ScheduleView';
import StashView from './components/StashView';
import MatkulView from './components/MatkulView';
import TaskView from './components/TaskView';

export default function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const data = useKuliahData();
  const { allCalendarEvents } = useCalendarEvents({
    courses: data.courses,
    config: data.config,
    stashes: data.stashes,
    reschedules: data.reschedules,
    tasks: data.tasks,
  });

  const handleStashFromModal = (courseId, date, meetingNum, weekNum, originalTime) => {
    data.handleStash(courseId, date, meetingNum, weekNum, originalTime);
    setSelectedEvent(null);
  };

  const handleReturnToStashFromModal = (rescheduleId) => {
    data.returnRescheduledToStash(rescheduleId);
    setSelectedEvent(null);
  };

  const openTaskForCourse = (courseId, date) => {
    data.setNewTask({ title: '', courseId, deadline: `${date}T23:59`, urgency: 'low', type: 'matkul' });
    data.setShowTaskForm(true);
    setActiveTab('tasks');
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          config={data.config}
          tasks={data.tasks}
          stashes={data.stashes}
        />

        <div className="flex-1 min-w-0">
          {/* Error Alert */}
          {data.error && (
            <div className="mb-4 p-4 bg-rose-900/20 border border-rose-900/50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-rose-400">Error</p>
                <p className="text-sm text-rose-300">{data.error}</p>
              </div>
              <button onClick={() => data.setError(null)} className="ml-auto text-rose-400 hover:text-rose-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              allCalendarEvents={allCalendarEvents}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {activeTab === 'stash' && (
            <StashView
              stashes={data.stashes}
              reschedules={data.reschedules}
              courses={data.courses}
              editingStash={data.editingStash}
              rescheduleForm={data.rescheduleForm}
              setRescheduleForm={data.setRescheduleForm}
              onRestoreStash={data.restoreStash}
              onOpenReschedule={data.openRescheduleStash}
              onCancelReschedule={data.cancelReschedule}
              onSaveReschedule={data.saveReschedule}
            />
          )}

          {activeTab === 'matkul' && (
            <MatkulView
              config={data.config}
              courses={data.courses}
              showCourseForm={data.showCourseForm}
              setShowCourseForm={data.setShowCourseForm}
              newCourse={data.newCourse}
              setNewCourse={data.setNewCourse}
              onUpdateConfig={data.handleUpdateConfig}
              onConfigBlur={data.handleConfigBlur}
              onAddCourse={data.handleAddCourse}
              onRemoveCourse={data.removeCourse}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskView
              tasks={data.tasks}
              courses={data.courses}
              showTaskForm={data.showTaskForm}
              setShowTaskForm={data.setShowTaskForm}
              newTask={data.newTask}
              setNewTask={data.setNewTask}
              onAddTask={data.handleAddTask}
              onRemoveTask={data.removeTask}
              onToggleComplete={data.toggleTaskComplete}
            />
          )}
        </div>
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onStash={handleStashFromModal}
        onReturnToStash={handleReturnToStashFromModal}
        onOpenTask={openTaskForCourse}
      />
    </div>
  );
}
