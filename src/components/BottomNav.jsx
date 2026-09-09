import React from 'react';
import { Calendar, CheckSquare, Inbox, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, tasksCount = 0, stashesCount = 0 }) => {
  const tabs = [
    {
      id: 'schedule',
      label: 'Jadwal',
      icon: Calendar,
      badge: 0,
    },
    {
      id: 'tasks',
      label: 'Tugas',
      icon: CheckSquare,
      badge: tasksCount,
    },
    {
      id: 'stash',
      label: 'Stash',
      icon: Inbox,
      badge: stashesCount,
    },
    {
      id: 'matkul',
      label: 'Pengaturan',
      icon: Settings,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-surface border-t border-theme px-2 pt-1.5 pb-[calc(var(--safe-area-bottom)+0.35rem)] shadow-lg select-none"
    >
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-lg transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-accent font-semibold'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold bg-accent text-accent-contrast flex items-center justify-center shadow-xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-tight tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
