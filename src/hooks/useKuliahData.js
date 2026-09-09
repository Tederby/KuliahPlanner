import { useState, useEffect, useCallback, useRef } from 'react';
import { getInitialState, saveData, exportDataAsJSON, importDataFromJSON, generateId } from '../utils/storage';
import { getIsDirty, setIsDirty } from '../utils/supabase';
import {
  pushSnapshot,
  popSnapshot,
  getUndoCount,
  getUndoHistory,
  clearUndoHistory,
} from '../utils/undoHistory';
import { validateCourse, validateTask, validateConfig } from '../utils/validators';
import { getCourseColor, getNextAvailableColor, checkCourseClash, calculateCourseEndTime } from '../utils/courseColors';
import { daysOfWeek } from '../utils/dateUtils';

export const useKuliahData = ({ showToast }) => {
  const initialState = getInitialState();

  const [config, setConfig]           = useState(initialState.config);
  const [courses, setCourses]         = useState(initialState.courses);
  const [stashes, setStashes]         = useState(initialState.stashes);
  const [reschedules, setReschedules] = useState(initialState.reschedules);
  const [tasks, setTasks]             = useState(initialState.tasks);
  const [error, setError]             = useState(null);
  const [undoCount, setUndoCount]     = useState(getUndoCount());
  const [isDirty, setIsDirtyState]     = useState(getIsDirty);

  const isFirstRender = useRef(true);
  const isApplyingCloudDataRef = useRef(false);

  const [showTaskForm, setShowTaskForm]     = useState(false);
  const [editingTaskId, setEditingTaskId]   = useState(null);
  const [newTask, setNewTask]               = useState({
    type: 'task', // 'task' | 'event'
    title: '',
    courseId: '',
    deadlineDate: '',
    deadlineTime: '',
    startTime: '',
    endTime: '',
    location: '',
    urgency: 'low',
    taskCategory: 'individual', // 'individual' | 'group'
    groupName: '',
    groupMembers: '',
    description: '',
  });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [newCourse, setNewCourse]           = useState({
    name: '', sks: 3, day: 'Senin', startTime: '07:00', location: '', color: '',
  });
  const [editingStash, setEditingStash]     = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });

  const [updatedAt, setUpdatedAt] = useState(initialState._updatedAt || new Date().toISOString());

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: '', message: '', onConfirm: null, danger: true,
  });

  const openConfirm = ({ title, message, onConfirm, danger = true }) =>
    setConfirmDialog({ isOpen: true, title, message, onConfirm, danger });

  const closeConfirm = () =>
    setConfirmDialog((prev) => ({ ...prev, isOpen: false, onConfirm: null }));

  const handleConfirm = () => {
    confirmDialog.onConfirm?.();
    closeConfirm();
  };

  const markClean = useCallback(() => {
    setIsDirty(false);
    setIsDirtyState(false);
  }, []);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    setIsDirtyState(true);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isApplyingCloudDataRef.current) {
      isApplyingCloudDataRef.current = false;
      saveData({
        config,
        courses,
        stashes,
        reschedules,
        tasks,
        _updatedAt: updatedAt,
      });
      return;
    }

    const nowIso = new Date().toISOString();
    setUpdatedAt(nowIso);
    setIsDirty(true);
    setIsDirtyState(true);

    const { error: saveError } = saveData({
      config,
      courses,
      stashes,
      reschedules,
      tasks,
      _updatedAt: nowIso,
    });
    if (saveError) showToast(saveError, 'error', 0);
  }, [config, courses, stashes, reschedules, tasks]);

  const saveSnapshot = useCallback((label) => {
    pushSnapshot(label, { config, courses, stashes, reschedules, tasks });
    setUndoCount(getUndoCount());
  }, [config, courses, stashes, reschedules, tasks]);

  const handleUndo = useCallback(() => {
    const snapshot = popSnapshot();
    if (!snapshot || !snapshot.data) {
      showToast('Tidak ada riwayat untuk diurungkan.', 'info');
      return false;
    }
    const d = snapshot.data;
    if (d.config) setConfig(d.config);
    if (Array.isArray(d.courses)) setCourses(d.courses);
    if (Array.isArray(d.stashes)) setStashes(d.stashes);
    if (Array.isArray(d.reschedules)) setReschedules(d.reschedules);
    if (Array.isArray(d.tasks)) setTasks(d.tasks);
    setUndoCount(getUndoCount());
    showToast(`Diurungkan: ${snapshot.label}`, 'success');
    return true;
  }, [showToast]);

  const applyFullData = useCallback((newData, snapshotLabel = null, isFromCloud = false) => {
    if (snapshotLabel) {
      pushSnapshot(snapshotLabel, { config, courses, stashes, reschedules, tasks });
      setUndoCount(getUndoCount());
    }
    const incomingTime = newData._updatedAt || new Date().toISOString();
    setUpdatedAt(incomingTime);

    if (isFromCloud) {
      isApplyingCloudDataRef.current = true;
      setIsDirty(false);
      setIsDirtyState(false);
    }

    if (newData.config) setConfig(newData.config);
    if (Array.isArray(newData.courses)) setCourses(newData.courses);
    if (Array.isArray(newData.stashes)) setStashes(newData.stashes);
    if (Array.isArray(newData.reschedules)) setReschedules(newData.reschedules);
    if (Array.isArray(newData.tasks)) setTasks(newData.tasks);
  }, [config, courses, stashes, reschedules, tasks]);

  const handleUpdateConfig = (newConfig) => setConfig(newConfig);
  const handleConfigBlur = () => setError(validateConfig(config));

  const resetCourseForm = () => {
    setNewCourse({
      name: '',
      sks: 3,
      day: 'Senin',
      startTime: '07:00',
      location: '',
      color: '',
    });
    setEditingCourseId(null);
    setShowCourseForm(false);
  };

  const startEditCourse = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    setNewCourse({
      name: course.name,
      sks: course.sks,
      day: course.day,
      startTime: course.startTime,
      location: course.location || '',
      color: getCourseColor(course),
    });
    setEditingCourseId(courseId);
    setShowCourseForm(true);
  };

  const cancelEditCourse = () => {
    resetCourseForm();
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    setError(null);
    const err = validateCourse(newCourse);
    if (err) { setError(err); return; }

    const courseColor = newCourse.color || getNextAvailableColor(courses);

    if (editingCourseId) {
      setCourses(courses.map((c) => (c.id === editingCourseId ? {
        ...c,
        name: newCourse.name,
        sks: Number(newCourse.sks),
        day: newCourse.day,
        startTime: newCourse.startTime,
        location: newCourse.location,
        color: courseColor,
      } : c)));
      showToast('Mata kuliah berhasil diperbarui!', 'success');
    } else {
      setCourses([...courses, {
        ...newCourse,
        sks: Number(newCourse.sks),
        color: courseColor,
        id: generateId(),
      }]);
      showToast('Matkul berhasil ditambahkan!', 'success');
    }
    resetCourseForm();
  };

  const removeCourse = (id) => {
    const course      = courses.find((c) => c.id === id);
    const stashCount  = stashes.filter((s) => s.courseId === id).length;
    const taskCount   = tasks.filter((t) => t.courseId === id).length;
    const extras      = [...(stashCount ? [`${stashCount} stash`] : []), ...(taskCount ? [`${taskCount} tugas`] : [])];
    const extraMsg    = extras.length ? ` Ini juga hapus ${extras.join(' dan ')} terkait.` : '';
    openConfirm({
      title: 'Hapus Matkul?',
      message: `Yakin hapus "${course?.name}"?${extraMsg} Aksi ini dapat diurungkan via tombol Undo.`,
      onConfirm: () => {
        saveSnapshot(`Hapus Matkul "${course?.name}"`);
        setCourses(courses.filter((c) => c.id !== id));
        setStashes(stashes.filter((s) => s.courseId !== id));
        setTasks(tasks.filter((t) => t.courseId !== id));
        showToast(`"${course?.name}" dihapus.`, 'warning', 6000, {
          label: 'Urungkan',
          onClick: handleUndo,
        });
      },
    });
  };

  const resetTaskForm = () => {
    setNewTask({
      type: 'task',
      title: '',
      courseId: '',
      deadlineDate: '',
      deadlineTime: '',
      startTime: '',
      endTime: '',
      location: '',
      urgency: 'low',
      taskCategory: 'individual',
      groupName: '',
      groupMembers: '',
      description: '',
    });
    setEditingTaskId(null);
    setShowTaskForm(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    setError(null);
    const err = validateTask(newTask);
    if (err) { setError(err); return; }

    const isEvent = newTask.type === 'event';
    const deadline = isEvent
      ? `${newTask.deadlineDate}T${newTask.startTime || '00:00'}`
      : `${newTask.deadlineDate}T${newTask.deadlineTime || '23:59'}`;
    const courseId = isEvent ? null : (newTask.courseId ? Number(newTask.courseId) : null);

    const taskData = {
      title: newTask.title.trim(),
      courseId,
      deadline,
      urgency: newTask.urgency || 'low',
      type: newTask.type || 'task',
      startTime: newTask.startTime || '',
      endTime: newTask.endTime || '',
      location: newTask.location?.trim() || '',
      taskCategory: newTask.taskCategory || 'individual',
      groupName: newTask.groupName?.trim() || '',
      groupMembers: newTask.groupMembers?.trim() || '',
      description: newTask.description || '',
    };

    if (editingTaskId) {
      setTasks(tasks.map((t) => (t.id === editingTaskId ? { ...t, ...taskData } : t)));
      showToast(isEvent ? 'Acara diperbarui!' : 'Tugas diperbarui!', 'success');
    } else {
      setTasks([...tasks, { ...taskData, id: generateId(), completed: false }]);
      showToast(isEvent ? 'Acara ditambahkan!' : 'Tugas ditambahkan!', 'success');
    }
    resetTaskForm();
  };

  const startEditTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const datePart = task.deadline?.split('T')[0] || '';
    const timePart = task.deadline?.split('T')[1] || '';
    const isEvent = task.type === 'event';

    setNewTask({
      type: task.type || 'task',
      title: task.title,
      courseId: task.courseId || '',
      deadlineDate: datePart,
      deadlineTime: !isEvent && timePart !== '23:59' ? timePart : '',
      startTime: task.startTime || (isEvent && timePart !== '00:00' ? timePart : ''),
      endTime: task.endTime || '',
      location: task.location || '',
      urgency: task.urgency || 'low',
      taskCategory: task.taskCategory || 'individual',
      groupName: task.groupName || '',
      groupMembers: task.groupMembers || '',
      description: task.description || '',
    });
    setEditingTaskId(taskId);
    setShowTaskForm(true);
  };

  const cancelEditTask = () => {
    resetTaskForm();
  };

  const removeTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    const label = task?.type === 'event' ? 'Acara' : 'Tugas';
    openConfirm({
      title: `Hapus ${label}?`,
      message: `Yakin hapus ${label.toLowerCase()} "${task?.title}"? Aksi ini dapat diurungkan via tombol Undo.`,
      onConfirm: () => {
        saveSnapshot(`Hapus ${label} "${task?.title}"`);
        setTasks(tasks.filter((t) => t.id !== id));
        showToast(`${label} "${task?.title}" dihapus.`, 'warning', 6000, {
          label: 'Urungkan',
          onClick: handleUndo,
        });
      },
    });
  };

  const toggleTaskComplete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const wasCompleted = task.completed;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    const label = task.type === 'event' ? 'Acara' : 'Tugas';
    showToast(
      wasCompleted
        ? `${label} "${task.title}" ditandai belum selesai.`
        : `${label} "${task.title}" ditandai selesai! ✓`,
      wasCompleted ? 'info' : 'success',
      4000,
      {
        label: 'Urungkan',
        onClick: () => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: wasCompleted } : t))),
      }
    );
  };

  const handleStash = (courseId, date, meetingNum, weekNum, originalTime) => {
    // K4: Prevent duplicate stash for the same course + date combo
    const alreadyStashed = stashes.some((s) => s.courseId === courseId && s.originalDate === date);
    if (alreadyStashed) {
      showToast('Kelas ini sudah di-stash untuk tanggal tersebut.', 'info');
      return;
    }
    setStashes([...stashes, { id: generateId(), courseId, originalDate: date, meetingNum, weekNum, originalTime, notes: '' }]);
    showToast('Kelas di-stash. Atur jadwal baru di tab Stash.', 'info');
  };

  const restoreStash = (id) => {
    setStashes(stashes.filter((s) => s.id !== id));
    showToast('Stash dibatalkan, kelas balik ke kalender.', 'success');
  };

  const openRescheduleStash = (stash) => {
    const course = courses.find((c) => c.id === stash.courseId);
    setEditingStash(stash);
    setRescheduleForm({ date: stash.originalDate, time: stash.originalTime || course?.startTime || '07:00' });
  };

  const cancelReschedule = () => { setEditingStash(null); setRescheduleForm({ date: '', time: '' }); };

  const saveReschedule = (e) => {
    e.preventDefault();
    if (!editingStash) return;
    if (!rescheduleForm.date || !rescheduleForm.time) { setError('Tanggal dan jam baru harus diisi'); return; }

    // S1: Check for schedule clash on the new date/time
    const newDateObj = new Date(rescheduleForm.date);
    const newDayIndex = newDateObj.getDay() === 0 ? 6 : newDateObj.getDay() - 1;
    const newDayName = daysOfWeek[newDayIndex];
    const course = courses.find((c) => c.id === editingStash.courseId);
    if (course) {
      const candidateForClash = {
        day: newDayName,
        startTime: rescheduleForm.time,
        sks: course.sks,
      };
      const clash = checkCourseClash(candidateForClash, courses, null, config.sksMinutes);
      if (clash.hasClash) {
        const clashEnd = calculateCourseEndTime(clash.clashingCourse.startTime, clash.clashingCourse.sks, config.sksMinutes);
        showToast(
          `⚠️ Perhatian: Jadwal baru bentrok dengan "${clash.clashingCourse.name}" (${clash.clashingCourse.startTime}-${clashEnd}). Tetap disimpan.`,
          'warning',
          8000
        );
      }
    }

    setReschedules([...reschedules, { ...editingStash, newDate: rescheduleForm.date, newTime: rescheduleForm.time }]);
    setStashes(stashes.filter((s) => s.id !== editingStash.id));
    showToast('Jadwal baru disimpan!', 'success');
    cancelReschedule();
  };

  const returnRescheduledToStash = (rescheduleId) => {
    const rs = reschedules.find((r) => r.id === rescheduleId);
    if (!rs) return;
    setReschedules(reschedules.filter((r) => r.id !== rescheduleId));
    setStashes([...stashes, { id: generateId(), courseId: rs.courseId, originalDate: rs.originalDate, meetingNum: rs.meetingNum, weekNum: rs.weekNum, originalTime: rs.originalTime, notes: '' }]);
    showToast('Dikembalikan ke stash.', 'info');
  };

  const handleExport = () => {
    exportDataAsJSON({ config, courses, stashes, reschedules, tasks });
    showToast('Data berhasil di-export!', 'success');
  };

  const handleImport = async (file) => {
    if (!file) return;
    const { data, error: importError } = await importDataFromJSON(file);
    if (importError) { showToast(importError, 'error'); return; }
    openConfirm({
      title: 'Import Data?',
      message: 'Ini akan MENGGANTI semua data yang ada sekarang dengan data dari file. Data saat ini akan disimpan ke riwayat Undo. Lanjut?',
      danger: true,
      onConfirm: () => {
        applyFullData(data, 'Sebelum Import File');
        showToast('Data berhasil di-import!', 'success', 6000, {
          label: 'Urungkan',
          onClick: handleUndo,
        });
      },
    });
  };

  return {
    config, courses, stashes, reschedules, tasks, error, setError,
    showTaskForm, setShowTaskForm, newTask, setNewTask,
    editingTaskId,
    showCourseForm, setShowCourseForm, newCourse, setNewCourse,
    editingCourseId, startEditCourse, cancelEditCourse,
    editingStash, rescheduleForm, setRescheduleForm,
    confirmDialog, handleConfirm, closeConfirm, openConfirm,
    handleUpdateConfig, handleConfigBlur,
    handleAddCourse, removeCourse,
    handleAddTask, removeTask, toggleTaskComplete,
    startEditTask, cancelEditTask,
    handleStash, restoreStash, openRescheduleStash, cancelReschedule, saveReschedule,
    returnRescheduledToStash,
    handleExport, handleImport,
    undoCount, handleUndo, saveSnapshot, applyFullData, getUndoHistory, clearUndoHistory,
    updatedAt, deviceId: initialState._deviceId || 'browser-unknown',
    isDirty, markClean, markDirty,
  };
};