import React, { useState } from 'react';
import { X, User, Lock, Cloud, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onSignIn, onSignUp, isConfigured }) => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConfigured) {
      setError('Supabase belum dikonfigurasi. Silakan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.');
      return;
    }

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Mohon masukkan username Anda.');
      return;
    }

    if (cleanUsername.length < 3) {
      setError('Username minimal terdiri dari 3 karakter.');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setError('Username hanya boleh berisi huruf, angka, titik, strip (-), atau garis bawah (_).');
      return;
    }

    if (!password) {
      setError('Mohon masukkan password Anda.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'signup') {
        await onSignUp({ username: cleanUsername, password });
      } else {
        await onSignIn({ username: cleanUsername, password });
      }
      // On success, state inside useSupabaseSync will close the modal or notify
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memproses autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-theme-surface rounded-xl border border-theme shadow-2xl w-full max-w-md overflow-hidden animate-[scaleUp_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-theme-surface-subtle border-b border-theme p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-theme-text">Akun Supabase Cloud</h3>
              <p className="text-[11px] text-theme-muted">Sinkronisasi data multi-perangkat instan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-theme bg-theme-surface-subtle/50 p-1">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all text-center ${
              activeTab === 'signin'
                ? 'bg-theme-surface text-accent shadow-sm border border-theme'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all text-center ${
              activeTab === 'signup'
                ? 'bg-theme-surface text-accent shadow-sm border border-theme'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Notice if not configured in .env */}
        {!isConfigured && (
          <div className="m-4 mb-0 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Konfigurasi Supabase Belum Terpasang</p>
              <p className="text-[11px] opacity-90">
                Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di file <code>.env</code> untuk mengaktifkan sinkronisasi cloud.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-[fadeIn_0.15s_ease-out]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-theme-text">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="misal: mahasiswasakti"
                className="w-full bg-theme-surface-subtle border border-theme rounded-lg pl-9 pr-3 py-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <p className="text-[10px] text-theme-muted">
              Hanya huruf, angka, titik, atau garis bawah (minimal 3 karakter).
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-theme-text">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-theme-surface-subtle border border-theme rounded-lg pl-9 pr-9 py-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-muted hover:text-theme-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Only for Signup) */}
          {activeTab === 'signup' && (
            <div className="space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
              <label className="block text-xs font-semibold text-theme-text">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password di atas"
                  className="w-full bg-theme-surface-subtle border border-theme rounded-lg pl-9 pr-3 py-2 text-xs text-theme-text outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Info note */}
          <div className="p-2.5 rounded-lg bg-theme-surface-subtle border border-theme text-[11px] text-theme-muted">
            <span className="font-semibold text-theme-text">Tanpa verifikasi email:</span> Akun kamu langsung aktif dan siap digunakan untuk backup/sync jadwal kuliah antar-perangkat.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent-hover text-accent-contrast font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{activeTab === 'signup' ? 'Daftar & Masuk' : 'Masuk ke Akun'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
