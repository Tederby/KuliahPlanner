export const BACKUP_FILENAME = 'kuliahplanner-backup.json';
export const CLIENT_ID_STORAGE_KEY = 'kuliahplanner_google_client_id';
export const FILE_ID_STORAGE_KEY = 'kuliahplanner_google_file_id';
export const LAST_SYNC_STORAGE_KEY = 'kuliahplanner_last_sync_time';

/**
 * getStoredClientId
 * Retrieves stored Google OAuth client ID from localStorage or Vite environment.
 */
export const getStoredClientId = () => {
  try {
    const custom = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (custom && custom.trim()) return custom.trim();
  } catch {}
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
};

/**
 * setStoredClientId
 * Saves a user-provided Google OAuth client ID into localStorage.
 */
export const setStoredClientId = (clientId) => {
  try {
    if (!clientId) {
      localStorage.removeItem(CLIENT_ID_STORAGE_KEY);
    } else {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId.trim());
    }
  } catch (err) {
    console.error('Failed to save Client ID:', err);
  }
};

/**
 * getCachedFileId
 */
export const getCachedFileId = () => {
  try {
    return localStorage.getItem(FILE_ID_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * setCachedFileId
 */
export const setCachedFileId = (fileId) => {
  try {
    if (fileId) {
      localStorage.setItem(FILE_ID_STORAGE_KEY, fileId);
    } else {
      localStorage.removeItem(FILE_ID_STORAGE_KEY);
    }
  } catch {}
};

/**
 * getLastSyncTime
 */
export const getLastSyncTime = () => {
  try {
    return localStorage.getItem(LAST_SYNC_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * setLastSyncTime
 */
export const setLastSyncTime = (isoString) => {
  try {
    localStorage.setItem(LAST_SYNC_STORAGE_KEY, isoString);
  } catch {}
};

/**
 * requestAccessToken
 * Requests an OAuth 2.0 access token using Google Identity Services (GIS).
 */
export const requestAccessToken = (clientId) => {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      return reject(new Error('Google Client ID belum diatur. Masukkan Client ID di pengaturan.'));
    }

    const checkGIS = (retries = 10) => {
      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
            callback: (response) => {
              if (response.error) {
                reject(new Error(response.error_description || response.error || 'Autentikasi Google dibatalkan atau gagal.'));
              } else {
                resolve(response.access_token);
              }
            },
          });

          // Trigger auth popup
          tokenClient.requestAccessToken({ prompt: '' });
        } catch (err) {
          reject(err);
        }
      } else if (retries > 0) {
        setTimeout(() => checkGIS(retries - 1), 300);
      } else {
        reject(new Error('Google Identity Services gagal dimuat. Periksa koneksi internet Anda.'));
      }
    };

    checkGIS();
  });
};

/**
 * getUserProfile
 * Fetches user profile (email) using access token.
 */
export const getUserProfile = async (accessToken) => {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

/**
 * findBackupFile
 * Searches for existing backup file in user's Google Drive.
 */
export const findBackupFile = async (accessToken) => {
  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gagal mencari file di Google Drive (${res.status})`);
  }

  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

/**
 * downloadBackupData
 * Downloads and parses backup JSON from Google Drive.
 */
export const downloadBackupData = async (fileId, accessToken) => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error(`Gagal mengunduh file backup dari Google Drive (${res.status})`);
  }

  return await res.json();
};

/**
 * createBackupFile
 * Uploads a new backup JSON using multipart/related specification.
 */
export const createBackupFile = async (payload, accessToken) => {
  const boundary = '-------KPBoundary' + Math.random().toString(36).substring(2, 10);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
    description: 'KuliahPlanner Cloud Backup',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(payload, null, 2) +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal mengunggah file ke Google Drive (${res.status})`);
  }

  return await res.json();
};

/**
 * updateBackupFile
 * Updates existing backup file content via simple media upload.
 */
export const updateBackupFile = async (fileId, payload, accessToken) => {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload, null, 2),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gagal memperbarui file di Google Drive (${res.status})`);
  }

  return await res.json();
};
