import { useState, useEffect, useCallback, useRef } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  formatUsernameEmail,
  extractUsername,
  getLastSyncTime,
  setLastSyncTime,
  getStoredAutoSync,
  setStoredAutoSync,
  getIsDirty,
  setIsDirty,
  getKnownCloudVersion,
  setKnownCloudVersion,
  clearSyncTracking,
} from '../utils/supabase';
import { getDeviceId } from '../utils/storage';

export const useSupabaseSync = ({ showToast }) => {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncState] = useState(getLastSyncTime);
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState(getStoredAutoSync);
  const [conflictData, setConflictData] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync lock: prevents concurrent sync operations from racing
  const syncLockRef = useRef(false);
  // Prevents auto-re-triggering the conflict modal after user dismisses it
  const conflictDismissedRef = useRef(false);

  // --- Auth Session Management ---

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSetAutoSync = useCallback((enabled) => {
    setAutoSyncEnabledState(enabled);
    setStoredAutoSync(enabled);
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  /**
   * Register new user with username and password
   */
  const signUp = useCallback(
    async ({ username, password }) => {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase belum dikonfigurasi. Periksa file .env Anda.');
      }

      const cleanUsername = username.trim();
      if (cleanUsername.length < 3) throw new Error('Username minimal terdiri dari 3 karakter.');
      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
        throw new Error('Username hanya boleh berisi huruf, angka, titik, underscore, atau tanda hubung.');
      }
      if (password.length < 6) throw new Error('Password minimal terdiri dari 6 karakter.');

      const email = formatUsernameEmail(cleanUsername);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: cleanUsername } },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          throw new Error('Username sudah digunakan. Silakan gunakan username lain.');
        }
        throw new Error(error.message || 'Gagal mendaftar akun.');
      }

      if (data?.user) {
        setUser(data.user);
        showToast(`Selamat datang, @${cleanUsername}! Akun berhasil dibuat.`, 'success');
        closeAuthModal();
      }
      return data;
    },
    [closeAuthModal, showToast]
  );

  /**
   * Sign in existing user with username and password
   */
  const signIn = useCallback(
    async ({ username, password }) => {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase belum dikonfigurasi. Periksa file .env Anda.');
      }

      const cleanUsername = username.trim();
      if (!cleanUsername || !password) throw new Error('Mohon masukkan username dan password.');

      const email = formatUsernameEmail(cleanUsername);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          throw new Error('Username atau password salah.');
        }
        throw new Error(error.message || 'Gagal masuk ke akun.');
      }

      if (data?.user) {
        setUser(data.user);
        const displayName = extractUsername(data.user);
        showToast(`Berhasil masuk sebagai @${displayName}.`, 'success');
        closeAuthModal();
      }
      return data;
    },
    [closeAuthModal, showToast]
  );

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    clearSyncTracking();
    setLastSyncState(null);
    conflictDismissedRef.current = false;
    showToast('Berhasil keluar dari akun Supabase.', 'info');
  }, [showToast]);

  // --- Sync Helpers ---

  /**
   * Checks if a data payload is "empty" (no courses, tasks, or stashes).
   */
  const isDataEmpty = (d) =>
    (!d?.courses || d.courses.length === 0) &&
    (!d?.tasks || d.tasks.length === 0) &&
    (!d?.stashes || d.stashes.length === 0);

  /**
   * Pushes local data to cloud with specified version number.
   * Updates all sync tracking state on success.
   */
  const pushToCloud = useCallback(
    async (localData, deviceId, newVersion, markClean) => {
      const nowIso = new Date().toISOString();
      const payload = {
        ...localData,
        _version: newVersion,
        _updatedAt: nowIso,
        _deviceId: deviceId,
      };

      const { error: upsertErr } = await supabase
        .from('user_backups')
        .upsert({
          user_id: user.id,
          data: payload,
          device_id: deviceId,
          updated_at: nowIso,
        });

      if (upsertErr) throw new Error(upsertErr.message);

      const timeMs = new Date(nowIso).getTime();
      setLastSyncTime(timeMs);
      setLastSyncState(timeMs);
      setKnownCloudVersion(newVersion);
      setIsDirty(false);
      markClean?.();
    },
    [user]
  );

  // --- Main Sync Function ---

  /**
   * Synchronize data with Supabase using version-based tracking.
   *
   * Sync strategy:
   * 1. No cloud data         → push local as version 1
   * 2. First time on device  → auto-pull if local empty, conflict modal if both have data
   * 3. Known === cloud ver.  → fast-forward push if dirty, no-op if clean
   * 4. Cloud moved ahead     → auto-pull if clean, last-writer-wins push if dirty
   *
   * Conflict modal only appears on first-time link when both local and cloud have data.
   * After that, sync is fully seamless across devices.
   */
  const syncData = useCallback(
    async ({ localData, onApplyCloudData, isDirty: isDirtyArg, markClean, silent = false }) => {
      if (!isSupabaseConfigured || !supabase) {
        if (!silent) showToast('Supabase belum dikonfigurasi.', 'warning');
        return false;
      }

      if (!user) {
        if (!silent) {
          openAuthModal();
          showToast('Silakan masuk atau buat akun terlebih dahulu untuk sinkronisasi.', 'info');
        }
        return false;
      }

      // Sync lock: prevent concurrent sync operations
      if (syncLockRef.current) return false;
      syncLockRef.current = true;
      setIsSyncing(true);

      try {
        const deviceId = localData._deviceId || getDeviceId();
        const dirty = isDirtyArg !== undefined ? Boolean(isDirtyArg) : getIsDirty();
        const knownVersion = getKnownCloudVersion();

        // 1. Fetch current cloud backup
        const { data: cloudRow, error: fetchErr } = await supabase
          .from('user_backups')
          .select('data, updated_at, device_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchErr) throw new Error(fetchErr.message);

        // 2. No cloud backup exists → push local as initial version
        if (!cloudRow || !cloudRow.data) {
          await pushToCloud(localData, deviceId, 1, markClean);
          if (!silent) showToast('Data berhasil dibackup ke Supabase Cloud!', 'success');
          return true;
        }

        // 3. Validate cloud data structure
        const cloudData = cloudRow.data;
        const cloudVersion = cloudData._version || 0;
        const required = ['config', 'courses', 'stashes', 'reschedules', 'tasks'];
        const isCloudValid = required.every((k) => k in cloudData);

        if (!isCloudValid) {
          // Cloud data is corrupt → overwrite with local
          await pushToCloud(localData, deviceId, cloudVersion + 1, markClean);
          if (!silent) showToast('Data cloud diganti karena data sebelumnya tidak valid.', 'warning');
          return true;
        }

        const cloudTime = new Date(cloudRow.updated_at || cloudData._updatedAt || 0).getTime();

        // 4. First time sync on this device (no known cloud version)
        if (knownVersion === null) {
          const localEmpty = isDataEmpty(localData);
          const cloudHasData = !isDataEmpty(cloudData);

          // 4a. Local is empty, cloud has data → auto-pull seamlessly
          if (localEmpty && cloudHasData) {
            onApplyCloudData?.(cloudData, null, true);
            setLastSyncTime(cloudTime);
            setLastSyncState(cloudTime);
            setKnownCloudVersion(cloudVersion);
            setIsDirty(false);
            markClean?.();
            if (!silent) showToast('Data jadwal berhasil dimuat dari Supabase Cloud!', 'success');
            return true;
          }

          // 4b. Both have data → show conflict modal for one-time user choice
          if (!localEmpty && cloudHasData && !conflictDismissedRef.current) {
            const localTime = new Date(localData._updatedAt || 0).getTime();
            setConflictData({
              cloudData,
              localData,
              cloudTime,
              localTime,
              cloudVersion,
              onApplyCloudData,
              markClean,
              deviceId,
            });
            return true;
          }

          // 4c. Local has data, cloud is empty (or conflict was dismissed) → push to cloud
          await pushToCloud(localData, deviceId, cloudVersion + 1, markClean);
          if (!silent) showToast('Data berhasil disinkronkan ke cloud!', 'success');
          return true;
        }

        // 5. Known version matches or exceeds cloud → no other device changed cloud
        if (knownVersion >= cloudVersion) {
          if (!dirty) {
            // Already in sync — nothing to do
            return true;
          }
          // Fast-forward push: local has new changes, cloud hasn't moved
          await pushToCloud(localData, deviceId, cloudVersion + 1, markClean);
          if (!silent) showToast('Sinkronisasi selesai!', 'success');
          return true;
        }

        // 6. Cloud moved ahead (knownVersion < cloudVersion)
        if (!dirty) {
          // Auto-pull: seamlessly accept changes from other device
          onApplyCloudData?.(cloudData, null, true);
          setLastSyncTime(cloudTime);
          setLastSyncState(cloudTime);
          setKnownCloudVersion(cloudVersion);
          setIsDirty(false);
          markClean?.();
          if (!silent) showToast('Data diperbarui dari perangkat lain.', 'success');
          return true;
        }

        // 7. Cloud moved ahead AND local is dirty → Last-Writer-Wins
        // User's latest local edit takes priority over the older remote changes.
        // This is the expected behavior for a single-user multi-device app —
        // users switch devices sequentially, not simultaneously.
        await pushToCloud(localData, deviceId, cloudVersion + 1, markClean);
        if (!silent) showToast('Sinkronisasi selesai!', 'success');
        return true;
      } catch (err) {
        console.error('Supabase sync error:', err);
        if (!silent) showToast(`Gagal sinkronisasi: ${err.message}`, 'error');
        return false;
      } finally {
        setIsSyncing(false);
        syncLockRef.current = false;
      }
    },
    [user, openAuthModal, showToast, pushToCloud]
  );

  // --- Conflict Resolution ---

  /**
   * Resolve the first-time sync conflict modal.
   * Only triggered once per device when both local and cloud have existing data.
   */
  const resolveConflict = useCallback(
    async (action) => {
      if (!conflictData) return;

      const { cloudData, localData, cloudVersion, onApplyCloudData, markClean, deviceId } = conflictData;
      setConflictData(null);

      if (action === 'use_cloud') {
        // Apply cloud data to local, saving old local to undo stack
        onApplyCloudData?.(cloudData, 'Dari Supabase Cloud', true);
        const syncMs = new Date(cloudData._updatedAt || Date.now()).getTime();
        setLastSyncTime(syncMs);
        setLastSyncState(syncMs);
        setKnownCloudVersion(cloudVersion);
        setIsDirty(false);
        markClean?.();
        showToast('Data dari Supabase Cloud berhasil dimuat!', 'success');
      } else if (action === 'use_local') {
        // Overwrite cloud with local data
        if (!user || !supabase) return;
        setIsSyncing(true);
        try {
          const nowIso = new Date().toISOString();
          const actualDeviceId = deviceId || getDeviceId();
          const newVersion = (cloudVersion || 0) + 1;
          const payload = {
            ...localData,
            _version: newVersion,
            _updatedAt: nowIso,
            _deviceId: actualDeviceId,
          };

          await supabase.from('user_backups').upsert({
            user_id: user.id,
            data: payload,
            device_id: actualDeviceId,
            updated_at: nowIso,
          });

          const timeMs = new Date(nowIso).getTime();
          setLastSyncTime(timeMs);
          setLastSyncState(timeMs);
          setKnownCloudVersion(newVersion);
          setIsDirty(false);
          markClean?.();
          showToast('Cloud berhasil ditimpa dengan data lokal.', 'success');
        } catch (err) {
          showToast(`Gagal menimpa data cloud: ${err.message}`, 'error');
        } finally {
          setIsSyncing(false);
        }
      } else {
        // Cancel: dismiss conflict, prevent auto-re-trigger until next manual sync or login
        conflictDismissedRef.current = true;
      }
    },
    [conflictData, user, showToast]
  );

  // --- Public API ---

  const username = extractUsername(user);
  const userProfile = user
    ? { name: username, username, email: user.email }
    : null;

  return {
    isConfigured: isSupabaseConfigured,
    user,
    username,
    userProfile,
    isSyncing,
    lastSyncTime,
    autoSyncEnabled,
    conflictData,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    signUp,
    signIn,
    signOut,
    syncData,
    resolveConflict,
    setAutoSyncEnabled: handleSetAutoSync,
  };
};
