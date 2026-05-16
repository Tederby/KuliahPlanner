import { useState, useEffect } from 'react';
import { getInitialState, saveData, exportDataAsJSON, importDataFromJSON } from '../utils/storage';
import { validateCourse, validateTask, validateConfig } from '../utils/validators';

export const useKuliahData = ({ showToast }) => {
  const initialState = getInitialState();

  const [config, setConfig]           = useState(initialState.config);
  const [courses, setCourses]         = useState(initialState.courses);
  const [stashes, setStashes]         = useState(initialState.stashes);
  const [reschedules, setReschedules] = useState(initialState.reschedules);
  const [tasks, setTasks]             = useState(initialState.tasks);
  const [error, setError]             = useState(null);

  const [showTaskForm, setShowTaskForm]     = useState(false);
  const [editingTaskId, setEditingTaskId]   = useState(null);
  const [newTask, setNewTask]               = useState({
    title: '', courseId: '', deadlineDate: '', deadlineTime: '',
    urgency: 'low', type: 'matkul', description: '',
  });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourse, setNewCourse]           = useState({ name: '', sks: 3, day: 'Senin', startTime: '07:00', location: '' });
  const [editingStash, setEditingStash]     = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });

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

  useEffect(() => {
    const { error: saveError } = saveData({ config, courses, stashes, reschedules, tasks });
    if (saveError) showToast(saveError, 'error', 0);
  }, [config, courses, stashes, reschedules, tasks]);

  const handleUpdateConfig = (newConfig) => setConfig(newConfig);
  const handleConfigBlur = () => setError(validateConfig(config));

  const handleAddCourse = (e) => {
    e.preventDefault();
    setError(null);
    const err = validateCourse(newCourse);
    if (err) { setError(err); return; }
    setCourses([...courses, { ...newCourse, id: Date.now() }]);
    setShowCourseForm(false);
    setNewCourse({ name: '', sks: 3, day: 'Senin', startTime: '07:00', location: '' });
    showToast('Matkul berhasil ditambahkan!', 'success');
  };

  const removeCourse = (id) => {
    const course      = courses.find((c) => c.id === id);
    const stashCount  = stashes.filter((s) => s.courseId === id).length;
    const taskCount   = tasks.filter((t) => t.courseId === id).length;
    const extras      = [...(stashCount ? [`${stashCount} stash`] : []), ...(taskCount ? [`${taskCount} tugas`] : [])];
    const extraMsg    = extras.length ? ` Ini juga hapus ${extras.join(' dan ')} terkait.` : '';
    openConfirm({
      title: 'Hapus Matkul?',
      message: `Yakin hapus "${course?.name}"?${extraMsg} Aksi ini gak bisa dibatalin.`,
      onConfirm: () => {
        setCourses(courses.filter((c) => c.id !== id));
        setStashes(stashes.filter((s) => s.courseId !== id));
        setTasks(tasks.filter((t) => t.courseId !== id));
        showToast(`"${course?.name}" dihapus.`, 'warning');
      },
    });
  };

  const resetTaskForm = () => {
    setNewTask({
      title: '', courseId: '', deadlineDate: '', deadlineTime: '',
      urgency: 'low', type: 'matkul', description: '',
    });
    setEditingTaskId(null);
    setShowTaskForm(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    setError(null);
    const err = validateTask(newTask);
    if (err) { setError(err); return; }

    // Combine date + optional time into deadline string
    const deadline = `${newTask.deadlineDate}T${newTask.deadlineTime || '23:59'}`;

    if (editingTaskId) {
      // Update existing task
      setTasks(tasks.map((t) => t.id === editingTaskId ? {
        ...t,
        title: newTask.title,
        courseId: newTask.courseId,
        deadline,
        urgency: newTask.urgency,
        type: newTask.type,
        description: newTask.description || '',
      } : t));
      showToast('Tugas diperbarui!', 'success');
    } else {
      // Create new task
      setTasks([...tasks, {
        title: newTask.title,
        courseId: newTask.courseId,
        deadline,
        urgency: newTask.urgency,
        type: newTask.type,
        description: newTask.description || '',
        id: Date.now(),
        completed: false,
      }]);
      showToast('Tugas ditambahkan!', 'success');
    }
    resetTaskForm();
  };

  const startEditTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const datePart = task.deadline?.split('T')[0] || '';
    const timePart = task.deadline?.split('T')[1] || '';
    setNewTask({
      title: task.title,
      courseId: task.courseId,
      deadlineDate: datePart,
      deadlineTime: timePart === '23:59' ? '' : timePart,
      urgency: task.urgency,
      type: task.type || 'matkul',
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
    openConfirm({
      title: 'Hapus Tugas?',
      message: `Yakin hapus tugas "${task?.title}"?`,
      onConfirm: () => {
        setTasks(tasks.filter((t) => t.id !== id));
        showToast('Tugas dihapus.', 'warning');
      },
    });
  };

  const toggleTaskComplete = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const handleStash = (courseId, date, meetingNum, weekNum, originalTime) => {
    setStashes([...stashes, { id: Date.now(), courseId, originalDate: date, meetingNum, weekNum, originalTime, notes: '' }]);
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
    setReschedules([...reschedules, { ...editingStash, newDate: rescheduleForm.date, newTime: rescheduleForm.time }]);
    setStashes(stashes.filter((s) => s.id !== editingStash.id));
    showToast('Jadwal baru disimpan!', 'success');
    cancelReschedule();
  };

  const returnRescheduledToStash = (rescheduleId) => {
    const rs = reschedules.find((r) => r.id === rescheduleId);
    if (!rs) return;
    setReschedules(reschedules.filter((r) => r.id !== rescheduleId));
    setStashes([...stashes, { id: Date.now(), courseId: rs.courseId, originalDate: rs.originalDate, meetingNum: rs.meetingNum, weekNum: rs.weekNum, originalTime: rs.originalTime, notes: '' }]);
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
      message: 'Ini akan MENGGANTI semua data yang ada sekarang dengan data dari file. Lanjut?',
      danger: true,
      onConfirm: () => {
        setConfig(data.config);
        setCourses(data.courses);
        setStashes(data.stashes);
        setReschedules(data.reschedules);
        setTasks(data.tasks);
        showToast('Data berhasil di-import!', 'success');
      },
    });
  };

  return {
    config, courses, stashes, reschedules, tasks, error, setError,
    showTaskForm, setShowTaskForm, newTask, setNewTask,
    editingTaskId,
    showCourseForm, setShowCourseForm, newCourse, setNewCourse,
    editingStash, rescheduleForm, setRescheduleForm,
    confirmDialog, handleConfirm, closeConfirm,
    handleUpdateConfig, handleConfigBlur,
    handleAddCourse, removeCourse,
    handleAddTask, removeTask, toggleTaskComplete,
    startEditTask, cancelEditTask,
    handleStash, restoreStash, openRescheduleStash, cancelReschedule, saveReschedule,
    returnRescheduledToStash,
    handleExport, handleImport,
  };
};