import { createClient } from '@supabase/supabase-js';

export const LAST_SYNC_STORAGE_KEY = 'kuliahplanner_last_sync_time';
export const AUTO_SYNC_STORAGE_KEY = 'kuliahplanner_auto_sync_enabled';
export const SAVED_USERNAME_KEY = 'kuliahplanner_saved_username';
export const SYNC_DIRTY_KEY = 'kuliahplanner_sync_is_dirty';
export const KNOWN_CLOUD_VERSION_KEY = 'kuliahplanner_known_cloud_version';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('your-project-ref') &&
  !rawKey.includes('your-anon-key')
);

// Create Supabase client singleton if configured, or null
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Maps a plain username into a synthetic internal email address for Supabase Auth.
 * Example: "tederby" -> "tederby@kuliahplanner.local"
 */
export const formatUsernameEmail = (username) => {
  if (!username) return '';
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  return `${clean}@kuliahplanner.local`;
};

/**
 * Extracts plain username from user metadata or synthetic email.
 */
export const extractUsername = (user) => {
  if (!user) return '';
  if (user.user_metadata?.username) {
    return user.user_metadata.username;
  }
  if (user.email && user.email.includes('@')) {
    return user.email.split('@')[0];
  }
  return 'Pengguna';
};

/**
 * getLastSyncTime
 */
export const getLastSyncTime = () => {
  try {
    const val = localStorage.getItem(LAST_SYNC_STORAGE_KEY);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
};

/**
 * setLastSyncTime
 */
export const setLastSyncTime = (timestamp) => {
  try {
    if (timestamp) {
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, String(timestamp));
    } else {
      localStorage.removeItem(LAST_SYNC_STORAGE_KEY);
    }
  } catch {}
};

/**
 * getStoredAutoSync
 */
export const getStoredAutoSync = () => {
  try {
    const val = localStorage.getItem(AUTO_SYNC_STORAGE_KEY);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
};

/**
 * setStoredAutoSync
 */
export const setStoredAutoSync = (enabled) => {
  try {
    localStorage.setItem(AUTO_SYNC_STORAGE_KEY, String(enabled));
  } catch {}
};

/**
 * getIsDirty
 * Checks if local data has unsaved/unsynced mutations.
 */
export const getIsDirty = () => {
  try {
    const val = localStorage.getItem(SYNC_DIRTY_KEY);
    return val === 'true';
  } catch {
    return false;
  }
};

/**
 * setIsDirty
 * Sets the dirty flag for local data.
 */
export const setIsDirty = (dirty) => {
  try {
    localStorage.setItem(SYNC_DIRTY_KEY, String(Boolean(dirty)));
  } catch {}
};

/**
 * getKnownCloudVersion
 * Gets the last known cloud data version that this device was synced with.
 * Returns a number or null if never synced.
 */
export const getKnownCloudVersion = () => {
  try {
    const val = localStorage.getItem(KNOWN_CLOUD_VERSION_KEY);
    if (val === null) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
};

/**
 * setKnownCloudVersion
 * Updates the recorded cloud version number.
 */
export const setKnownCloudVersion = (version) => {
  try {
    if (version !== null && version !== undefined) {
      localStorage.setItem(KNOWN_CLOUD_VERSION_KEY, String(version));
    } else {
      localStorage.removeItem(KNOWN_CLOUD_VERSION_KEY);
    }
  } catch {}
};

/**
 * clearSyncTracking
 * Clears sync tracking keys upon logout.
 */
export const clearSyncTracking = () => {
  try {
    localStorage.removeItem(LAST_SYNC_STORAGE_KEY);
    localStorage.removeItem(SYNC_DIRTY_KEY);
    localStorage.removeItem(KNOWN_CLOUD_VERSION_KEY);
  } catch {}
};
