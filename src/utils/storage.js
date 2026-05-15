import { formatDateStr } from './dateUtils';

export const STORAGE_KEY = 'kuliahplanner_data';

export const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return null;
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

export const getInitialState = () => {
  const saved = loadData();
  const today = formatDateStr(new Date());
  const defaultState = {
    config: {
      semesterStart: today,
      sksMinutes: 50,
      totalMeetings: 14,
      meetingsBeforeUTS: 7,
      utsWeeks: 2,
      meetingsBeforeUAS: 14,
      uasWeeks: 2,
    },
    courses: [],
    stashes: [],
    reschedules: [],
    tasks: [],
  };

  if (!saved) return defaultState;

  return {
    config: {
      semesterStart: saved.config?.semesterStart || defaultState.config.semesterStart,
      sksMinutes: saved.config?.sksMinutes ?? defaultState.config.sksMinutes,
      totalMeetings: saved.config?.totalMeetings ?? defaultState.config.totalMeetings,
      meetingsBeforeUTS: saved.config?.meetingsBeforeUTS ?? defaultState.config.meetingsBeforeUTS,
      utsWeeks: saved.config?.utsWeeks ?? defaultState.config.utsWeeks,
      meetingsBeforeUAS: saved.config?.meetingsBeforeUAS ?? defaultState.config.meetingsBeforeUAS,
      uasWeeks: saved.config?.uasWeeks ?? defaultState.config.uasWeeks,
    },
    courses: Array.isArray(saved.courses) ? saved.courses : defaultState.courses,
    stashes: Array.isArray(saved.stashes) ? saved.stashes : defaultState.stashes,
    reschedules: Array.isArray(saved.reschedules) ? saved.reschedules : defaultState.reschedules,
    tasks: Array.isArray(saved.tasks) ? saved.tasks : defaultState.tasks,
  };
};
