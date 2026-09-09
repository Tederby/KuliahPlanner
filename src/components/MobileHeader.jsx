import React from 'react';
import { Cloud, RefreshCw, Sun, Moon, HelpCircle } from 'lucide-react';

const MobileHeader = ({ theme, cloudSync, onShowGuide }) => {
  const isDark = theme?.isDark;

  const toggleDarkMode = () => {
    if (!theme) return;
    theme.setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <header className="md:hidden sticky top-0 z-30 bg-theme-surface/95 backdrop-blur-md border-b border-theme px-3.5 pt-[calc(var(--safe-area-top)+0.5rem)] pb-2.5 shadow-xs select-none">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-accent text-accent-contrast flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            KP
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-theme-text tracking-tight leading-none truncate">
              KuliahPlanner
            </h1>
            <span className="text-[10px] text-theme-muted font-medium block leading-tight truncate">
              Academic Workspace
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Supabase Cloud Button / Avatar */}
          {cloudSync && (
            <>
              {cloudSync.userProfile ? (
                <button
                  type="button"
                  onClick={cloudSync.onSync}
                  disabled={cloudSync.isSyncing}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-theme-surface-subtle border border-theme text-theme-text text-xs active:scale-95 transition-all"
                  title="Sinkronkan Cloud"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      cloudSync.isSyncing
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <RefreshCw
                    className={`w-3 h-3 text-accent ${
                      cloudSync.isSyncing ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="text-[10px] font-medium max-w-[60px] truncate">
                    @{cloudSync.userProfile.name || cloudSync.userProfile.username}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={cloudSync.onLogin}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-theme-surface-subtle border border-theme text-theme-text text-[11px] font-medium active:scale-95 transition-all"
                  title="Masuk Akun Supabase"
                >
                  <Cloud className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px]">Cloud</span>
                </button>
              )}
            </>
          )}

          {/* Theme Quick Toggle */}
          {theme && (
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1.5 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface-subtle border border-transparent hover:border-theme transition-colors active:scale-95"
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-theme-text" />
              )}
            </button>
          )}

          {/* Guide Help Button */}
          {onShowGuide && (
            <button
              type="button"
              onClick={onShowGuide}
              className="p-1.5 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface-subtle border border-transparent hover:border-theme transition-colors active:scale-95"
              title="Panduan Penggunaan"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
