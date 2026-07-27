import React from 'react';
import {
  GraduationCap,
  Users,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Keyboard,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ClassRoster } from '../types';

interface HeaderProps {
  rosters: ClassRoster[];
  activeRosterId: string;
  onSelectRoster: (id: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  rosters,
  activeRosterId,
  onSelectRoster,
  isDarkMode,
  onToggleDarkMode,
  isFullscreen,
  onToggleFullscreen,
  onOpenShortcuts,
}) => {
  const activeRoster = rosters.find((r) => r.id === activeRosterId) || rosters[0];
  const activeCount = activeRoster ? activeRoster.students.filter((s) => s.active).length : 0;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-bold">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight tracking-tight">
              Teacher Assistant Suite
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-2.5 h-2.5" /> Offline PC App
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Smart classroom tools for teachers
          </p>
        </div>
      </div>

      {/* Class Switcher & Utilities */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Active Class Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="class-selector" className="sr-only">
            Select Class
          </label>
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2 shrink-0" />
            <select
              id="class-selector"
              value={activeRosterId}
              onChange={(e) => onSelectRoster(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none pr-6 cursor-pointer appearance-none"
            >
              {rosters.length === 0 ? (
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  No Classes Available
                </option>
              ) : (
                rosters.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {r.name} ({r.students.filter((s) => s.active).length} students)
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
          </div>

          <span className="hidden lg:inline-flex items-center ml-2 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800/60">
            {activeCount} Active
          </span>
        </div>

        {/* Header Quick Controls */}
        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2 md:pl-4">
          <button
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen / Projector Mode'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
