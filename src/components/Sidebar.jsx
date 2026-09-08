import React from 'react';
import { Calendar, List, Settings, Inbox, HelpCircle, Cloud, RefreshCw, LogOut } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const GoogleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const Sidebar = ({ activeTab, setActiveTab, config, tasks, stashes, courses = [], onShowGuide, theme, driveSync }) => {
  const tabs = [
    { id: 'schedule', icon: Calendar, label: 'Kalender' },
    { id: 'tasks', icon: List, label: `Tugas & Acara (${tasks.filter((t) => !t.completed).length})` },
    { id: 'stash', icon: Inbox, label: `Stash (${stashes.length})` },
    { id: 'matkul', icon: Settings, label: 'Config & Data' },
  ];

  const totalSks = (courses || []).reduce((sum, c) => sum + (Number(c.sks) || 0), 0);

  return (
    <div className="md:w-60 shrink-0 space-y-2">
      <div className="mb-5 px-2 py-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent text-accent-contrast flex items-center justify-center font-bold text-xs shadow-sm">
            KP
          </div>
          <div>
            <h1 className="text-base font-bold text-theme-text tracking-tight leading-none">
              KuliahPlanner
            </h1>
            <span className="text-[11px] text-theme-muted font-medium">Academic Workspace</span>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-theme-surface-subtle text-theme-text border border-theme shadow-sm'
                : 'text-theme-muted hover:bg-theme-surface hover:text-theme-text border border-transparent'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-accent' : 'text-theme-muted'}`} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* Theme & Custom Color Switcher */}
      {theme && (
        <div className="pt-2">
          <ThemeSwitcher
            themeMode={theme.themeMode}
            setThemeMode={theme.setThemeMode}
            accentColor={theme.accentColor}
            setAccentColor={theme.setAccentColor}
            isMonochrome={theme.isMonochrome}
            setMonochrome={theme.setMonochrome}
            COLOR_PRESETS={theme.COLOR_PRESETS}
          />
        </div>
      )}

      {/* Google Sign In / User Profile Widget */}
      {driveSync && (
        <div className="pt-1">
          {!driveSync.userProfile ? (
            <button
              onClick={driveSync.onLogin}
              disabled={driveSync.isSyncing}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg bg-theme-surface hover:bg-theme-surface-subtle text-theme-text border border-theme font-medium text-xs shadow-sm transition-all hover:border-accent/40 active:scale-[0.99]"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{driveSync.isSyncing ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
            </button>
          ) : (
            <div className="p-2.5 bg-theme-surface rounded-lg border border-theme flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                {driveSync.userProfile.picture ? (
                  <img
                    src={driveSync.userProfile.picture}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-theme object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent text-accent-contrast font-bold text-xs flex items-center justify-center shrink-0">
                    {(driveSync.userProfile.name || driveSync.userProfile.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-theme-text truncate leading-tight">
                    {driveSync.userProfile.name || driveSync.userProfile.email}
                  </p>
                  <p className="text-[10px] text-theme-muted flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        driveSync.isSyncing
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="truncate">
                      {driveSync.isSyncing
                        ? 'Menyinkronkan...'
                        : driveSync.lastSyncTime
                        ? `Sync ${new Date(driveSync.lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Cloud Aktif'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={driveSync.onSync}
                  disabled={driveSync.isSyncing}
                  title="Sinkronkan Sekarang"
                  className="p-1.5 rounded text-theme-muted hover:text-accent hover:bg-theme-surface-subtle transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${driveSync.isSyncing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={driveSync.onLogout}
                  title="Keluar dari Akun"
                  className="p-1.5 rounded text-theme-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="p-3 bg-theme-surface rounded-md border border-theme">
          <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-2">Engine Info</div>
          <div className="text-[11px] text-theme-text space-y-1">
            <p className="flex justify-between"><span className="text-theme-muted">Total SKS:</span> <span className="font-semibold text-accent">{totalSks} SKS</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">Mulai:</span> <span>{config.semesterStart}</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">Pertemuan:</span> <span>{config.totalMeetings}</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">UTS:</span> <span>P-{config.meetingsBeforeUTS} ({config.utsWeeks}m)</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">UAS:</span> <span>P-{config.meetingsBeforeUAS} ({config.uasWeeks}m)</span></p>
          </div>
        </div>
      </div>

      {/* Guide button */}
      <button
        onClick={onShowGuide}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface transition-colors text-xs font-medium border border-transparent"
      >
        <HelpCircle className="w-4 h-4 text-theme-muted" />
        Panduan Penggunaan
      </button>
    </div>
  );
};

export default Sidebar;
