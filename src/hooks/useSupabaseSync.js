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
} from '../utils/supabase';
import { getDeviceId } from '../utils/storage';

export const useSupabaseSync = ({ showToast }) => {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncState] = useState(getLastSyncTime);
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState(getStoredAutoSync);
  const [conflictData, setConflictData] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync Supabase Auth session on mount and subscribe to changes
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
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

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  /**
   * Register new user with username and password
   */
  const signUp = useCallback(
    async ({ username, password }) => {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase belum dikonfigurasi. Periksa file .env Anda.');
      }

      const cleanUsername = username.trim();
      if (cleanUsername.length < 3) {
        throw new Error('Username minimal terdiri dari 3 karakter.');
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
        throw new Error('Username hanya boleh berisi huruf, angka, titik, underscore, atau tanda hubung.');
      }
      if (password.length < 6) {
        throw new Error('Password minimal terdiri dari 6 karakter.');
      }

      const email = formatUsernameEmail(cleanUsername);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanUsername,
          },
        },
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
      if (!cleanUsername || !password) {
        throw new Error('Mohon masukkan username dan password.');
      }

      const email = formatUsernameEmail(cleanUsername);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setLastSyncTime(null);
    setLastSyncState(null);
    showToast('Berhasil keluar dari akun Supabase.', 'info');
  }, [showToast]);

  /**
   * Synchronize data with Supabase user_backups table
   */
  const syncData = useCallback(
    async ({ localData, onApplyCloudData, silent = false }) => {
      if (!isSupabaseConfigured || !supabase) {
        if (!silent) {
          showToast('Supabase belum dikonfigurasi. Silakan isi konfigurasi di file .env.', 'warning');
        }
        return false;
      }

      if (!user) {
        if (!silent) {
          openAuthModal();
          showToast('Silakan masuk atau buat akun terlebih dahulu untuk sinkronisasi.', 'info');
        }
        return false;
      }

      setIsSyncing(true);

      try {
        const deviceId = localData._deviceId || getDeviceId();

        // 1. Fetch current backup from Supabase
        const { data: cloudRow, error: fetchErr } = await supabase
          .from('user_backups')
          .select('data, updated_at, device_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchErr) {
          throw new Error(fetchErr.message);
        }

        // 2. If no cloud backup exists, push initial local data
        if (!cloudRow || !cloudRow.data) {
          const nowIso = new Date().toISOString();
          const payload = {
            ...localData,
            _updatedAt: nowIso,
            _deviceId: deviceId,
          };

          const { error: insertErr } = await supabase
            .from('user_backups')
            .upsert({
              user_id: user.id,
              data: payload,
              device_id: deviceId,
              updated_at: nowIso,
            });

          if (insertErr) throw new Error(insertErr.message);

          const timeMs = new Date(nowIso).getTime();
          setLastSyncTime(timeMs);
          setLastSyncState(timeMs);

          if (!silent) {
            showToast('Data berhasil dibackup pertama kali ke Supabase Cloud!', 'success');
          }
          return true;
        }

        // 3. Existing cloud backup found: validate content
        const cloudData = cloudRow.data;
        const required = ['config', 'courses', 'stashes', 'reschedules', 'tasks'];
        const isCloudValid = required.every((k) => k in cloudData);

        if (!isCloudValid) {
          const nowIso = new Date().toISOString();
          const payload = { ...localData, _updatedAt: nowIso, _deviceId: deviceId };

          await supabase.from('user_backups').upsert({
            user_id: user.id,
            data: payload,
            device_id: deviceId,
            updated_at: nowIso,
          });

          const timeMs = new Date(nowIso).getTime();
          setLastSyncTime(timeMs);
          setLastSyncState(timeMs);

          if (!silent) {
            showToast('Data cloud lama diganti dengan data lokal terbaru.', 'warning');
          }
          return true;
        }

        const cloudTime = new Date(cloudRow.updated_at || cloudData._updatedAt || 0).getTime();
        const localTime = new Date(localData._updatedAt || 0).getTime();

        // 4. Conflict detection: cloud is significantly newer (>2000ms) and from another device
        if (cloudTime > localTime + 2000 && cloudRow.device_id !== deviceId) {
          setConflictData({
            cloudData,
            localData,
            cloudTime,
            localTime,
            onApplyCloudData,
          });
          return true;
        }

        // 5. Local is newer or identical: update cloud
        const nowIso = new Date().toISOString();
        const payload = {
          ...localData,
          _updatedAt: nowIso,
          _deviceId: deviceId,
        };

        const { error: updateErr } = await supabase
          .from('user_backups')
          .upsert({
            user_id: user.id,
            data: payload,
            device_id: deviceId,
            updated_at: nowIso,
          });

        if (updateErr) throw new Error(updateErr.message);

        const timeMs = new Date(nowIso).getTime();
        setLastSyncTime(timeMs);
        setLastSyncState(timeMs);

        if (!silent) {
          showToast('Sinkronisasi selesai! Data cloud Supabase diperbarui.', 'success');
        }
        return true;
      } catch (err) {
        console.error('Supabase sync error:', err);
        if (!silent) {
          showToast(`Gagal sinkronisasi: ${err.message}`, 'error');
        }
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [user, openAuthModal, showToast]
  );

  /**
   * Resolve cloud sync conflict
   */
  const resolveConflict = useCallback(
    async (action) => {
      if (!conflictData) return;

      const { cloudData, localData, onApplyCloudData } = conflictData;
      setConflictData(null);

      if (action === 'use_cloud') {
        if (typeof onApplyCloudData === 'function') {
          onApplyCloudData(cloudData, 'Dari Supabase Cloud');
        }
        const nowMs = Date.now();
        setLastSyncTime(nowMs);
        setLastSyncState(nowMs);
        showToast('Data dari Supabase Cloud berhasil dimuat!', 'success');
      } else if (action === 'use_local') {
        if (!user || !supabase) return;
        setIsSyncing(true);
        try {
          const nowIso = new Date().toISOString();
          const deviceId = localData._deviceId || getDeviceId();
          const payload = {
            ...localData,
            _updatedAt: nowIso,
            _deviceId: deviceId,
          };

          await supabase.from('user_backups').upsert({
            user_id: user.id,
            data: payload,
            device_id: deviceId,
            updated_at: nowIso,
          });

          const timeMs = new Date(nowIso).getTime();
          setLastSyncTime(timeMs);
          setLastSyncState(timeMs);
          showToast('Supabase Cloud berhasil ditimpa dengan data lokal.', 'success');
        } catch (err) {
          showToast(`Gagal menimpa data Supabase: ${err.message}`, 'error');
        } finally {
          setIsSyncing(false);
        }
      }
    },
    [conflictData, user, showToast]
  );

  const username = extractUsername(user);
  const userProfile = user
    ? {
        name: username,
        username,
        email: user.email,
      }
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
