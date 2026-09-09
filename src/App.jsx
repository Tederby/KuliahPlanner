import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

import { useToast }          from './hooks/useToast';
import { useTheme }          from './hooks/useTheme';
import { useKuliahData }     from './hooks/useKuliahData';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useSupabaseSync }   from './hooks/useSupabaseSync';

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
import AuthModal        from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab]       = useState('schedule');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask]   = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const theme = useTheme();
  const { toasts, showToast, dismissToast } = useToast();

  const data = useKuliahData({ showToast });
  const cloudSync = useSupabaseSync({ showToast });
  const isSyncApplyingRef = useRef(false);

  const handleCloudSync = (silent = false) => {
    cloudSync.syncData({
      localData: {
        config: data.config,
        courses: data.courses,
        stashes: data.stashes,
        reschedules: data.reschedules,
        tasks: data.tasks,
        _updatedAt: data.updatedAt,
        _deviceId: data.deviceId,
      },
      onApplyCloudData: (cloudData, label) => {
        isSyncApplyingRef.current = true;
        data.applyFullData(cloudData, label);
      },
      silent,
    });
  };

  const cloudSyncProps = {
    isConfigured: cloudSync.isConfigured,
    user: cloudSync.user,
    username: cloudSync.username,
    userProfile: cloudSync.userProfile,
    isSyncing: cloudSync.isSyncing,
    lastSyncTime: cloudSync.lastSyncTime,
    autoSyncEnabled: cloudSync.autoSyncEnabled,
    onSync: () => handleCloudSync(false),
    onLogin: cloudSync.openAuthModal,
    onLogout: () => {
      // K1: Confirm before logout, warn about unsync'd data
      const syncWarning = cloudSync.autoSyncEnabled && cloudSync.lastSyncTime
        ? ''
        : ' Data lokal yang belum di-sync tidak akan otomatis dibackup setelah logout.';
      data.openConfirm({
        title: 'Keluar dari Akun?',
        message: `Kamu akan keluar dari akun Supabase Cloud.${syncWarning} Kamu bisa login kembali kapan saja.`,
        danger: true,
        onConfirm: cloudSync.signOut,
      });
    },
    onToggleAutoSync: cloudSync.setAutoSyncEnabled,
  };

  // Background auto-sync with debounce (3s) when data changes and user is authenticated
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!cloudSync.user || !cloudSync.autoSyncEnabled) return;

    // Prevent re-triggering auto-sync immediately after cloud data was applied
    if (isSyncApplyingRef.current) {
      isSyncApplyingRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      handleCloudSync(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    data.config,
    data.courses,
    data.stashes,
    data.reschedules,
    data.tasks,
    cloudSync.user,
    cloudSync.autoSyncEnabled,
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

  // S4: Reset form state when switching tabs to prevent stale edit context
  useEffect(() => {
    if (data.editingCourseId || data.showCourseForm) {
      data.cancelEditCourse();
    }
    if (data.editingTaskId || data.showTaskForm) {
      data.cancelEditTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
          cloudSync={cloudSyncProps}
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
              onReturnRescheduledToStash={data.returnRescheduledToStash}
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
              onClearUndo={() => {
                // S3: Confirm before clearing undo history
                data.openConfirm({
                  title: 'Bersihkan Riwayat Undo?',
                  message: 'Semua snapshot undo akan dihapus permanen dan tidak bisa dikembalikan. Lanjut?',
                  danger: true,
                  onConfirm: data.clearUndoHistory,
                });
              }}
              cloudSync={cloudSyncProps}
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
        conflictData={cloudSync.conflictData}
        onResolve={cloudSync.resolveConflict}
      />

      <AuthModal
        isOpen={cloudSync.isAuthModalOpen}
        onClose={cloudSync.closeAuthModal}
        onSignIn={cloudSync.signIn}
        onSignUp={cloudSync.signUp}
        isConfigured={cloudSync.isConfigured}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}