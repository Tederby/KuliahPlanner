import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

import { useToast }          from './hooks/useToast';
import { useTheme }          from './hooks/useTheme';
import { useKuliahData }     from './hooks/useKuliahData';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useSupabaseSync }   from './hooks/useSupabaseSync';

import Sidebar          from './components/Sidebar';
import MobileHeader    from './components/MobileHeader';
import BottomNav       from './components/BottomNav';
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

import { App as CapApp } from '@capacitor/app';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { syncLocalNotifications } from './utils/notificationService';

export default function App() {
  const [activeTab, setActiveTab]       = useState('schedule');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask]   = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const theme = useTheme();
  const { toasts, showToast, dismissToast } = useToast();

  const data = useKuliahData({ showToast });
  const cloudSync = useSupabaseSync({ showToast });
  const handleCloudSyncRef = useRef(null);

  const handleCloudSync = (silent = false) => {
    cloudSync.syncData({
      localData: {
        config: data.config,
        courses: data.courses,
        stashes: data.stashes,
        reschedules: data.reschedules,
        tasks: data.tasks,
        attendances: data.attendances,
        notificationSettings: data.notificationSettings,
        maxAbsencePercent: data.maxAbsencePercent,
        _updatedAt: data.updatedAt,
        _deviceId: data.deviceId,
      },
      onApplyCloudData: (cloudData, label, isFromCloud) => {
        data.applyFullData(cloudData, label, isFromCloud);
      },
      isDirty: data.isDirty,
      markClean: data.markClean,
      silent,
    });
  };
  handleCloudSyncRef.current = handleCloudSync;

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

  // Immediate sync when session is established or user signs in
  const prevUserRef = useRef(null);
  useEffect(() => {
    if (cloudSync.user && cloudSync.autoSyncEnabled) {
      if (!prevUserRef.current || prevUserRef.current.id !== cloudSync.user.id) {
        prevUserRef.current = cloudSync.user;
        handleCloudSyncRef.current?.(true);
      }
    } else {
      prevUserRef.current = null;
    }
  }, [cloudSync.user, cloudSync.autoSyncEnabled]);

  // Seamless auto-pull on tab focus or device switch
  useEffect(() => {
    if (!cloudSync.user || !cloudSync.autoSyncEnabled) return;

    let lastCheck = 0;
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastCheck > 5000) {
          lastCheck = now;
          handleCloudSyncRef.current?.(true);
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [cloudSync.user, cloudSync.autoSyncEnabled]);

  // Background auto-push with debounce (5s) when user makes modifications
  useEffect(() => {
    if (!cloudSync.user || !cloudSync.autoSyncEnabled || !data.isDirty) return;

    const timer = setTimeout(() => {
      handleCloudSyncRef.current?.(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [data.isDirty, data.updatedAt, cloudSync.user, cloudSync.autoSyncEnabled]);

  const { allCalendarEvents } = useCalendarEvents({
    courses:    data.courses,
    config:     data.config,
    stashes:    data.stashes,
    reschedules: data.reschedules,
    tasks:      data.tasks,
  });

  // Automatically synchronize Capacitor local notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      syncLocalNotifications({
        calendarEvents: allCalendarEvents,
        tasks: data.tasks,
        courses: data.courses,
        settings: data.notificationSettings,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [allCalendarEvents, data.tasks, data.courses, data.notificationSettings]);

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

  // Keep refs for hardware back button listener
  const activeTabRef = useRef(activeTab);
  const selectedEventRef = useRef(selectedEvent);
  const selectedTaskRef = useRef(selectedTask);
  const showOnboardingRef = useRef(showOnboarding);
  const dataRef = useRef(data);
  const cloudSyncRef = useRef(cloudSync);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedEventRef.current = selectedEvent; }, [selectedEvent]);
  useEffect(() => { selectedTaskRef.current = selectedTask; }, [selectedTask]);
  useEffect(() => { showOnboardingRef.current = showOnboarding; }, [showOnboarding]);
  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { cloudSyncRef.current = cloudSync; }, [cloudSync]);

  // Hardware Back Button handling on Android native
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backListener = null;
    const setupListener = async () => {
      backListener = await CapApp.addListener('backButton', () => {
        if (selectedEventRef.current) {
          setSelectedEvent(null);
        } else if (selectedTaskRef.current) {
          setSelectedTask(null);
        } else if (showOnboardingRef.current) {
          setShowOnboarding(false);
        } else if (cloudSyncRef.current?.isAuthModalOpen) {
          cloudSyncRef.current.closeAuthModal();
        } else if (dataRef.current?.confirmDialog?.isOpen) {
          dataRef.current.closeConfirm();
        } else if (dataRef.current?.showTaskForm) {
          dataRef.current.cancelEditTask();
        } else if (dataRef.current?.showCourseForm) {
          dataRef.current.cancelEditCourse();
        } else if (dataRef.current?.editingStash) {
          dataRef.current.cancelReschedule();
        } else if (activeTabRef.current !== 'schedule') {
          setActiveTab('schedule');
        } else {
          CapApp.exitApp();
        }
      });
    };

    setupListener();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, []);

  // Sync SystemBars (status bar) theme with dark/light mode
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      SystemBars.setStyle({
        style: theme.isDark ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
      }).catch(() => {});
    } catch (e) {}
  }, [theme.isDark]);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col font-sans antialiased transition-colors duration-200">
      <MobileHeader
        theme={theme}
        cloudSync={cloudSyncProps}
        onShowGuide={() => setShowOnboarding(true)}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-3.5 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        <div className="hidden md:block shrink-0">
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
        </div>

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
              theme={theme}
              attendances={data.attendances}
              onSetAttendance={data.setAttendanceStatus}
              getCourseAttendanceStats={data.getCourseAttendanceStats}
              notificationSettings={data.notificationSettings}
              onUpdateNotificationSettings={data.updateNotificationSettings}
              maxAbsencePercent={data.maxAbsencePercent}
              onUpdateMaxAbsencePercent={data.updateMaxAbsencePercent}
              showToast={showToast}
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
      </main>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onStash={handleStashFromModal}
        onReturnToStash={handleReturnToStashFromModal}
        onOpenTask={openTaskForCourse}
        attendances={data.attendances}
        onSetAttendance={data.setAttendanceStatus}
        getCourseAttendanceStats={data.getCourseAttendanceStats}
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

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasksCount={data.tasks.filter((t) => !t.completed).length}
        stashesCount={data.stashes.length}
      />
    </div>
  );
}