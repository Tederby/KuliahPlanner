import { useState, useRef, useCallback } from 'react';
import {
  getStoredClientId,
  setStoredClientId,
  getCachedFileId,
  setCachedFileId,
  getLastSyncTime,
  setLastSyncTime,
  requestAccessToken,
  getUserProfile,
  findBackupFile,
  downloadBackupData,
  createBackupFile,
  updateBackupFile,
} from '../utils/googleDrive';

export const USER_PROFILE_KEY = 'kuliahplanner_google_user_profile';
export const AUTO_SYNC_KEY = 'kuliahplanner_auto_sync_enabled';

const getStoredProfile = () => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredAutoSync = () => {
  try {
    const val = localStorage.getItem(AUTO_SYNC_KEY);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
};

export const useGoogleDriveSync = ({ showToast }) => {
  const [clientId, setClientId] = useState(getStoredClientId());
  const [userProfile, setUserProfile] = useState(getStoredProfile);
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState(getStoredAutoSync);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncState] = useState(getLastSyncTime());
  const [conflictData, setConflictData] = useState(null);

  const tokenRef = useRef(null);

  const handleUpdateClientId = useCallback((newId) => {
    setStoredClientId(newId);
    setClientId(newId.trim());
    tokenRef.current = null;
  }, []);

  const setAutoSyncEnabled = useCallback((enabled) => {
    setAutoSyncEnabledState(enabled);
    try {
      localStorage.setItem(AUTO_SYNC_KEY, String(enabled));
    } catch {}
  }, []);

  const logout = useCallback(() => {
    tokenRef.current = null;
    setUserProfile(null);
    try {
      localStorage.removeItem(USER_PROFILE_KEY);
    } catch {}
    setCachedFileId(null);
    showToast('Berhasil keluar dari akun Google.', 'info');
  }, [showToast]);

  const ensureToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;
    const token = await requestAccessToken(clientId);
    tokenRef.current = token;

    // Fetch user profile once token is acquired
    try {
      const profile = await getUserProfile(token);
      if (profile?.email) {
        setUserProfile(profile);
        try {
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
        } catch {}
      }
    } catch {}

    return token;
  }, [clientId]);

  /**
   * syncData
   * Synchronizes current local data with Google Drive.
   * silent: if true, skips toast on success (useful for auto-sync)
   */
  const syncData = useCallback(
    async ({ localData, onApplyCloudData, silent = false }) => {
      if (!clientId) {
        if (!silent) {
          showToast('Google Client ID belum diatur. Silakan periksa file .env atau opsi pengembang.', 'warning');
        }
        return false;
      }

      setIsSyncing(true);

      try {
        let token;
        try {
          token = await ensureToken();
        } catch (authErr) {
          setIsSyncing(false);
          if (!silent) {
            showToast(authErr.message || 'Gagal autentikasi Google.', 'error');
          }
          return false;
        }

        // 1. Identify backup file
        let fileId = getCachedFileId();
        let fileObj = null;

        if (fileId) {
          try {
            fileObj = await downloadBackupData(fileId, token);
          } catch {
            fileId = null;
            setCachedFileId(null);
          }
        }

        if (!fileId) {
          const found = await findBackupFile(token);
          if (found) {
            fileId = found.id;
            setCachedFileId(fileId);
            fileObj = await downloadBackupData(fileId, token);
          }
        }

        // 2. If no file exists in Drive yet, create initial backup
        if (!fileId || !fileObj) {
          const nowIso = new Date().toISOString();
          const initialPayload = {
            ...localData,
            _updatedAt: nowIso,
          };
          const created = await createBackupFile(initialPayload, token);
          if (created?.id) {
            setCachedFileId(created.id);
            setLastSyncTime(nowIso);
            setLastSyncState(nowIso);
            if (!silent) {
              showToast('Data berhasil dibackup pertama kali ke Google Drive!', 'success');
            }
          }
          setIsSyncing(false);
          return true;
        }

        // 3. File exists: validate & compare timestamps
        const cloudData = fileObj;
        const required = ['config', 'courses', 'stashes', 'reschedules', 'tasks'];
        const isCloudValid = required.every((k) => k in cloudData);

        if (!isCloudValid) {
          const nowIso = new Date().toISOString();
          const payload = { ...localData, _updatedAt: nowIso };
          await updateBackupFile(fileId, payload, token);
          setLastSyncTime(nowIso);
          setLastSyncState(nowIso);
          if (!silent) {
            showToast('Data cloud lama diganti dengan data lokal terbaru.', 'warning');
          }
          setIsSyncing(false);
          return true;
        }

        const cloudTime = new Date(cloudData._updatedAt || 0).getTime();
        const localTime = new Date(localData._updatedAt || 0).getTime();

        // 4. Check for conflict (cloud is newer by > 2000ms and device IDs differ)
        if (cloudTime > localTime + 2000 && cloudData._deviceId !== localData._deviceId) {
          setConflictData({
            cloudData,
            localData,
            cloudTime,
            localTime,
            fileId,
            token,
            onApplyCloudData,
          });
          setIsSyncing(false);
          return true;
        }

        // 5. Local is newer or identical -> update cloud
        const nowIso = new Date().toISOString();
        const payload = {
          ...localData,
          _updatedAt: nowIso,
        };

        await updateBackupFile(fileId, payload, token);
        setLastSyncTime(nowIso);
        setLastSyncState(nowIso);
        if (!silent) {
          showToast('Sinkronisasi selesai! Google Drive diperbarui.', 'success');
        }
        return true;
      } catch (err) {
        console.error('Sync error:', err);
        if (err.message === 'UNAUTHORIZED') {
          tokenRef.current = null;
          if (!silent) {
            showToast('Sesi Google kedaluwarsa. Silakan login kembali.', 'warning');
          }
        } else if (!silent) {
          showToast(`Gagal sinkronisasi: ${err.message}`, 'error');
        }
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [clientId, ensureToken, showToast]
  );

  /**
   * login
   * Requests authorization and signs in the user.
   */
  const login = useCallback(
    async ({ localData, onApplyCloudData }) => {
      if (!clientId) {
        showToast('Google Client ID belum diatur. Silakan periksa file .env Anda.', 'error');
        return false;
      }
      setIsSyncing(true);
      try {
        const token = await requestAccessToken(clientId);
        tokenRef.current = token;
        const profile = await getUserProfile(token);
        if (profile?.email) {
          setUserProfile(profile);
          try {
            localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
          } catch {}
          showToast(`Selamat datang, ${profile.name || profile.email}!`, 'success');
        }
        setIsSyncing(false);
        if (localData && onApplyCloudData) {
          await syncData({ localData, onApplyCloudData, silent: false });
        }
        return true;
      } catch (err) {
        setIsSyncing(false);
        showToast(err.message || 'Login Google dibatalkan atau gagal.', 'error');
        return false;
      }
    },
    [clientId, showToast, syncData]
  );

  /**
   * resolveConflict
   * Handles user resolution from the conflict modal.
   */
  const resolveConflict = useCallback(
    async (decision) => {
      if (!conflictData) return;
      const { cloudData, localData, fileId, token, onApplyCloudData } = conflictData;
      setConflictData(null);

      if (decision === 'use_cloud') {
        onApplyCloudData(cloudData, 'Sebelum Sync dari Cloud');
        const nowIso = new Date().toISOString();
        setLastSyncTime(nowIso);
        setLastSyncState(nowIso);
        showToast('Data dari Google Drive berhasil dimuat!', 'success');
      } else if (decision === 'use_local') {
        try {
          setIsSyncing(true);
          const nowIso = new Date().toISOString();
          const payload = { ...localData, _updatedAt: nowIso };
          await updateBackupFile(fileId, payload, token);
          setLastSyncTime(nowIso);
          setLastSyncState(nowIso);
          showToast('Google Drive berhasil ditimpa dengan data lokal.', 'success');
        } catch (err) {
          showToast(`Gagal menimpa data Google Drive: ${err.message}`, 'error');
        } finally {
          setIsSyncing(false);
        }
      }
    },
    [conflictData, showToast]
  );

  return {
    clientId,
    userProfile,
    isSyncing,
    lastSyncTime,
    conflictData,
    autoSyncEnabled,
    setAutoSyncEnabled,
    saveClientId: handleUpdateClientId,
    syncData,
    login,
    logout,
    resolveConflict,
  };
};
