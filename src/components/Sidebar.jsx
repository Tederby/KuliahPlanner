import React from 'react';
import { Calendar, List, Settings, Inbox, HelpCircle } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, config, tasks, stashes, onShowGuide }) => {
  const tabs = [
    { id: 'schedule', icon: Calendar, label: 'Kalender' },
    { id: 'tasks', icon: List, label: `Tugas (${tasks.filter((t) => !t.completed).length})` },
    { id: 'stash', icon: Inbox, label: `Stash (${stashes.length})` },
    { id: 'matkul', icon: Settings, label: 'Config & Data' },
  ];

  return (
    <div className="md:w-64 shrink-0 space-y-2">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          KuliahPlanner.
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest"></p>
      </div>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === tab.id
              ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <tab.icon className="w-5 h-5" /> {tab.label}
        </button>
      ))}

      <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div className="text-xs font-bold text-slate-400 mb-2">Engine Info</div>
        <div className="text-[10px] text-slate-500 space-y-1">
          <p>Semester Mulai: {config.semesterStart}</p>
          <p>Target Pertemuan: {config.totalMeetings}</p>
          <p>UTS: Setelah {config.meetingsBeforeUTS} pertemuan ({config.utsWeeks} minggu)</p>
          <p>UAS: Setelah {config.meetingsBeforeUAS} pertemuan ({config.uasWeeks} minggu)</p>
        </div>
      </div>

      {/* Guide button */}
      <button
        onClick={onShowGuide}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-indigo-400 hover:bg-slate-900 transition-all text-sm"
      >
        <HelpCircle className="w-5 h-5" />
        Panduan Penggunaan
      </button>
    </div>
  );
};

export default Sidebar;
