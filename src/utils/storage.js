import { formatDateStr } from './dateUtils';

export const STORAGE_KEY = 'kuliahplanner_data';
export const DEVICE_ID_KEY = 'kuliahplanner_device_id';

/**
 * getDeviceId
 * Returns unique device identifier stored in localStorage, generating one if needed.
 */
export const getDeviceId = () => {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'browser-unknown';
  }
};

/**
 * loadData
 * Returns { data, error } — error berisi pesan string jika gagal, null jika sukses.
 */
export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: null, error: null };
    return { data: JSON.parse(raw), error: null };
  } catch (e) {
    console.error('Error loading data:', e);
    return { data: null, error: 'Data tersimpan corrupt atau tidak bisa dibaca. Direset ke default.' };
  }
};

/**
 * saveData
 * Returns { success: bool, error: string | null, savedAt: string }
 */
export const saveData = (data) => {
  try {
    const updatedAt = data._updatedAt || new Date().toISOString();
    const payload = {
      _version: 1,
      _updatedAt: updatedAt,
      _deviceId: data._deviceId || getDeviceId(),
      ...data,
    };
    // Ensure _updatedAt reflects the latest change
    payload._updatedAt = updatedAt;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { success: true, error: null, savedAt: updatedAt };
  } catch (e) {
    console.error('Error saving data:', e);
    // QuotaExceededError = localStorage penuh
    const isQuota = e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError');
    return {
      success: false,
      error: isQuota
        ? 'Storage penuh! Data tidak tersimpan. Coba export dulu terus hapus data lama.'
        : `Gagal menyimpan data: ${e.message}`,
      savedAt: null,
    };
  }
};

// ─── Export / Import ───────────────────────────────────────────────────────────

/**
 * exportDataAsJSON(data)
 * Trigger download file JSON ke browser user.
 */
export const exportDataAsJSON = (data) => {
  const payload = {
    _version: 1,
    _exportedAt: new Date().toISOString(),
    _updatedAt: data._updatedAt || new Date().toISOString(),
    _deviceId: data._deviceId || getDeviceId(),
    ...data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = formatDateStr(new Date());
  a.href     = url;
  a.download = `kuliahplanner-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * importDataFromJSON(file)
 * Returns Promise<{ data, error }>
 * Validasi ringan: cek field wajib ada.
 */
export const importDataFromJSON = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        // Validasi minimal
        const required = ['config', 'courses', 'stashes', 'reschedules', 'tasks'];
        const missing  = required.filter((k) => !(k in parsed));
        if (missing.length) {
          resolve({ data: null, error: `File tidak valid. Field kurang: ${missing.join(', ')}` });
          return;
        }
        resolve({ data: parsed, error: null });
      } catch {
        resolve({ data: null, error: 'File bukan JSON yang valid.' });
      }
    };
    reader.onerror = () => resolve({ data: null, error: 'Gagal membaca file.' });
    reader.readAsText(file);
  });
};

export const getInitialState = () => {
  const { data: saved } = loadData();
  const today = formatDateStr(new Date());
  const defaultState = {
    _version: 1,
    _updatedAt: null,
    _deviceId: getDeviceId(),
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
    _version: saved._version || 1,
    _updatedAt: saved._updatedAt || null,
    _deviceId: saved._deviceId || getDeviceId(),
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