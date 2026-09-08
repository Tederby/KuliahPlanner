import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

import { useToast }          from './hooks/useToast';
import { useTheme }          from './hooks/useTheme';
import { useKuliahData }     from './hooks/useKuliahData';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useGoogleDriveSync } from './hooks/useGoogleDriveSync';

import Sidebar          from './components/Sidebar';
import EventModal       from './components/EventModal';
import ScheduleView     from './components/ScheduleView';
import StashView        from './components/StashView';
import MatkulView       from './components/MatkulView';
import TaskView         from './components/TaskView';
import ToastContainer   from './components/ToastContainer';
import ConfirmDialog    from './components/ConfirmDialog';
import TaskDetailModal  from './components/TaskDetailModal';
import OnboardingGuide, { ONBOARDING_KEY } from './components/OnboardingGuide';
import SyncConflictModal from './components/SyncConflictModal';

export default function App() {
  const [activeTab, setActiveTab]       = useState('schedule');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask]   = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const theme = useTheme();
  const { toasts, showToast, dismissToast } = useToast();

  const data = useKuliahData({ showToast });
  const driveSync = useGoogleDriveSync({ showToast });

  const handleDriveSync = (silent = false) => {
    driveSync.syncData({
      localData: {
        config: data.config,
        courses: data.courses,
        stashes: data.stashes,
        reschedules: data.reschedules,
        tasks: data.tasks,
      },
      onApplyCloudData: data.applyFullData,
      silent,
    });
  };

  const handleDriveLogin = () => {
    driveSync.login({
      localData: {
        config: data.config,
        courses: data.courses,
        stashes: data.stashes,
        reschedules: data.reschedules,
        tasks: data.tasks,
      },
      onApplyCloudData: data.applyFullData,
    });
  };

  const driveSyncProps = {
    clientId: driveSync.clientId,
    userProfile: driveSync.userProfile,
    isSyncing: driveSync.isSyncing,
    lastSyncTime: driveSync.lastSyncTime,
    autoSyncEnabled: driveSync.autoSyncEnabled,
    onSaveClientId: driveSync.saveClientId,
    onSync: () => handleDriveSync(false),
    onLogin: handleDriveLogin,
    onLogout: driveSync.logout,
    onToggleAutoSync: driveSync.setAutoSyncEnabled,
  };

  // Background auto-sync with debounce (3s) when data changes and user is authenticated
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!driveSync.userProfile || !driveSync.autoSyncEnabled) return;

    const timer = setTimeout(() => {
      handleDriveSync(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    data.config,
    data.courses,
    data.stashes,
    data.reschedules,
    data.tasks,
    driveSync.userProfile,
    driveSync.autoSyncEnabled,
  ]);

  const { allCalendarEvents } = useCalendarEvents({
    courses:    data.courses,
    config:     data.config,
    stashes:    data.stashes,
    reschedules: data.reschedules,
    tasks:      data.tasks,
  });

  // Show onboarding on first visit
  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  const handleStashFromModal = (courseId, date, meetingNum, weekNum, originalTime) => {
    data.handleStash(courseId, date, meetingNum, weekNum, originalTime);
    setSelectedEvent(null);
  };

  const handleReturnToStashFromModal = (rescheduleId) => {
    data.returnRescheduledToStash(rescheduleId);
    setSelectedEvent(null);
  };

  const openTaskForCourse = (courseId, date) => {
    data.setNewTask({
      title: '', courseId, deadlineDate: date, deadlineTime: '',
      urgency: 'low', type: 'matkul', description: '',
    });
    data.setShowTaskForm(true);
    setActiveTab('tasks');
    setSelectedEvent(null);
  };

  const handleQuickAddTask = (dateStr) => {
    data.setNewTask({
      title: '', courseId: '', deadlineDate: dateStr, deadlineTime: '',
      urgency: 'low', type: 'matkul', description: '',
    });
    data.setShowTaskForm(true);
    setActiveTab('tasks');
  };

  const handleSelectTask = (taskEvent) => {
    // Find the full task from data.tasks using taskId
    const fullTask = data.tasks.find((t) => t.id === taskEvent.taskId);
    if (fullTask) {
      setSelectedTask(fullTask);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-4 md:p-6 lg:p-8 font-sans antialiased transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 lg:gap-8">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          config={data.config}
          tasks={data.tasks}
          stashes={data.stashes}
          courses={data.courses}
          onShowGuide={() => setShowOnboarding(true)}
          theme={theme}
          driveSync={driveSyncProps}
        />

        <div className="flex-1 min-w-0">
          {/* Error Alert */}
          {data.error && (
            <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-md flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-rose-700 dark:text-rose-300">Error</p>
                <p className="text-xs text-rose-600 dark:text-rose-400/90">{data.error}</p>
              </div>
              <button onClick={() => data.setError(null)} className="ml-auto text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              allCalendarEvents={allCalendarEvents}
              onSelectEvent={setSelectedEvent}
              onSelectTask={handleSelectTask}
              onQuickAddTask={handleQuickAddTask}
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
              editingCourseId={data.editingCourseId}
              onStartEditCourse={data.startEditCourse}
              onCancelEditCourse={data.cancelEditCourse}
              onUpdateConfig={data.handleUpdateConfig}
              onConfigBlur={data.handleConfigBlur}
              onAddCourse={data.handleAddCourse}
              onRemoveCourse={data.removeCourse}
              onExport={data.handleExport}
              onImport={data.handleImport}
              undoCount={data.undoCount}
              onUndo={data.handleUndo}
              undoHistory={data.getUndoHistory()}
              onClearUndo={data.clearUndoHistory}
              driveSync={driveSyncProps}
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
              editingTaskId={data.editingTaskId}
              onAddTask={data.handleAddTask}
              onRemoveTask={data.removeTask}
              onToggleComplete={data.toggleTaskComplete}
              onStartEdit={data.startEditTask}
              onCancelEdit={data.cancelEditTask}
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

      <TaskDetailModal
        task={selectedTask}
        courses={data.courses}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={data.toggleTaskComplete}
        onEdit={(taskId) => {
          setSelectedTask(null);
          setActiveTab('tasks');
          data.startEditTask(taskId);
        }}
      />

      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem(ONBOARDING_KEY, 'true');
        }}
      />

      <ConfirmDialog
        isOpen={data.confirmDialog.isOpen}
        title={data.confirmDialog.title}
        message={data.confirmDialog.message}
        danger={data.confirmDialog.danger}
        onConfirm={data.handleConfirm}
        onCancel={data.closeConfirm}
      />

      <SyncConflictModal
        conflictData={driveSync.conflictData}
        onResolve={driveSync.resolveConflict}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}