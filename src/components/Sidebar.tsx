import React from 'react';
import { AppTab } from '../types';
import {
  PieChart,
  Users2,
  BookOpen,
  Trophy,
  Award,
  Layers,
  Settings2,
  ClipboardList,
  Settings,
  FolderOpen,
  Gamepad2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  totalClassesCount: number;
  totalStudentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  totalClassesCount,
  totalStudentsCount,
}) => {
  const primaryNavItems = [
    {
      id: 'wheel' as AppTab,
      label: 'Wheel of Names',
      icon: PieChart,
      description: 'Random student picker',
    },
    {
      id: 'grouper' as AppTab,
      label: 'Student Grouper',
      icon: Users2,
      description: 'Instant group generator',
    },
  ];

  const gameNavItems = [
    {
      id: 'millionaire' as AppTab,
      label: 'Millionaire Game',
      icon: Trophy,
      description: 'Game Show Reviewer',
    },
    {
      id: 'quizbee' as AppTab,
      label: 'Classroom Quiz Bowl',
      icon: Award,
      description: 'Inter-Group Competition',
    },
    {
      id: 'flashcard' as AppTab,
      label: 'Flashcard Deck',
      icon: Layers,
      description: 'Interactive Flip Review',
    },
    {
      id: 'editor' as AppTab,
      label: 'Question Bank',
      icon: Settings2,
      description: 'Manage & Edit Quizzes',
    },
  ];

  const managementNavItems = [
    {
      id: 'rosters' as AppTab,
      label: 'Class Rosters',
      icon: ClipboardList,
      description: 'Manage class lists',
    },
    {
      id: 'settings' as AppTab,
      label: 'App Settings',
      icon: Settings,
      description: 'Preferences & Backup',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
        {/* Main Tools */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Classroom Tools
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-none mb-1">{item.label}</div>
                  <div
                    className={`text-xs truncate ${
                      isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Games & Review Section directly under Student Grouper */}
        <div className="space-y-1">
          <div className="px-3 pt-2 pb-1 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5" /> Classroom Games
            </span>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold">
              GAMES & QUIZ
            </span>
          </div>
          {gameNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (activeTab === 'review' && item.id === 'millionaire');
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-100/70 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-none mb-1 flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div
                    className={`text-xs truncate ${
                      isActive ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Management Section */}
        <div className="space-y-1">
          <div className="px-3 pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Class Management
          </div>
          {managementNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-none mb-1">{item.label}</div>
                  <div
                    className={`text-xs truncate ${
                      isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Offline Desktop Status Badge */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <FolderOpen className="w-3.5 h-3.5 text-indigo-500" /> Saved Offline
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono">
            LOCAL
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 text-center">
          <div>
            <span className="text-xs text-slate-400 block">Classes</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {totalClassesCount}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Students</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {totalStudentsCount}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
