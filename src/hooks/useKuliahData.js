import { useState, useEffect } from 'react';
import { getInitialState, saveData } from '../utils/storage';
import { validateCourse, validateTask, validateConfig } from '../utils/validators';

export const useKuliahData = () => {
  const initialState = getInitialState();

  const [config, setConfig] = useState(initialState.config);
  const [courses, setCourses] = useState(initialState.courses);
  const [stashes, setStashes] = useState(initialState.stashes);
  const [reschedules, setReschedules] = useState(initialState.reschedules);
  const [tasks, setTasks] = useState(initialState.tasks);
  const [error, setError] = useState(null);

  // Form states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', courseId: '', deadline: '', urgency: 'low', type: 'matkul' });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', sks: 3, day: 'Senin', startTime: '07:00', location: '' });
  const [editingStash, setEditingStash] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });

  useEffect(() => {
    saveData({ config, courses, stashes, reschedules, tasks });
  }, [config, courses, stashes, reschedules, tasks]);

  // --- CONFIG HANDLERS ---
  const handleUpdateConfig = (newConfig) => setConfig(newConfig);

  const handleConfigBlur = () => {
    const validationError = validateConfig(config);
    setError(validationError);
  };

  // --- COURSE HANDLERS ---
  const handleAddCourse = (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validateCourse(newCourse);
    if (validationError) { setError(validationError); return; }
    setCourses([...courses, { ...newCourse, id: Date.now() }]);
    setShowCourseForm(false);
    setNewCourse({ name: '', sks: 3, day: 'Senin', startTime: '07:00', location: '' });
  };

  const removeCourse = (id) => {
    setCourses(courses.filter((c) => c.id !== id));
    setStashes(stashes.filter((s) => s.courseId !== id));
    setTasks(tasks.filter((t) => t.courseId !== id));
  };

  // --- TASK HANDLERS ---
  const handleAddTask = (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validateTask(newTask);
    if (validationError) { setError(validationError); return; }
    setTasks([...tasks, { ...newTask, id: Date.now(), completed: false }]);
    setShowTaskForm(false);
    setNewTask({ title: '', courseId: '', deadline: '', urgency: 'low', type: 'matkul' });
  };

  const removeTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const toggleTaskComplete = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  // --- STASH HANDLERS ---
  const handleStash = (courseId, date, meetingNum, weekNum, originalTime) => {
    setStashes([
      ...stashes,
      { id: Date.now(), courseId, originalDate: date, meetingNum, weekNum, originalTime, notes: '' },
    ]);
  };

  const restoreStash = (id) => setStashes(stashes.filter((s) => s.id !== id));

  const openRescheduleStash = (stash) => {
    const course = courses.find((c) => c.id === stash.courseId);
    setEditingStash(stash);
    setRescheduleForm({ date: stash.originalDate, time: stash.originalTime || course?.startTime || '07:00' });
  };

  const cancelReschedule = () => {
    setEditingStash(null);
    setRescheduleForm({ date: '', time: '' });
  };

  const saveReschedule = (e) => {
    e.preventDefault();
    if (!editingStash) return;
    if (!rescheduleForm.date || !rescheduleForm.time) {
      setError('Tanggal dan jam baru harus diisi');
      return;
    }
    setReschedules([...reschedules, { ...editingStash, newDate: rescheduleForm.date, newTime: rescheduleForm.time }]);
    setStashes(stashes.filter((s) => s.id !== editingStash.id));
    cancelReschedule();
  };

  const returnRescheduledToStash = (rescheduleId) => {
    const reschedule = reschedules.find((r) => r.id === rescheduleId);
    if (!reschedule) return;
    setReschedules(reschedules.filter((r) => r.id !== rescheduleId));
    setStashes([
      ...stashes,
      {
        id: Date.now(),
        courseId: reschedule.courseId,
        originalDate: reschedule.originalDate,
        meetingNum: reschedule.meetingNum,
        weekNum: reschedule.weekNum,
        originalTime: reschedule.originalTime,
        notes: '',
      },
    ]);
  };

  return {
    // State
    config, courses, stashes, reschedules, tasks, error, setError,
    // Form state
    showTaskForm, setShowTaskForm, newTask, setNewTask,
    showCourseForm, setShowCourseForm, newCourse, setNewCourse,
    editingStash, rescheduleForm, setRescheduleForm,
    // Handlers
    handleUpdateConfig, handleConfigBlur,
    handleAddCourse, removeCourse,
    handleAddTask, removeTask, toggleTaskComplete,
    handleStash, restoreStash, openRescheduleStash, cancelReschedule, saveReschedule,
    returnRescheduledToStash,
  };
};
