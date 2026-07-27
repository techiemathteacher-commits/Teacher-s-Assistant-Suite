/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppTab, ClassRoster, AppSettings } from './types';
import {
  loadRostersFromStorage,
  saveRostersToStorage,
  loadActiveClassId,
  saveActiveClassId,
  loadSettingsFromStorage,
  saveSettingsToStorage,
} from './lib/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WheelOfNames } from './components/WheelOfNames';
import { StudentGrouper } from './components/StudentGrouper';
import { ClassRosterManager } from './components/ClassRosterManager';
import { SettingsView } from './components/SettingsView';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ReviewManager } from './components/ReviewApp/ReviewManager';

export default function App() {
  // Load initial state from Local Storage
  const [rosters, setRosters] = useState<ClassRoster[]>(() => loadRostersFromStorage());
  const [activeRosterId, setActiveRosterId] = useState<string>(() => loadActiveClassId());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettingsFromStorage());

  // UI state
  const [activeTab, setActiveTab] = useState<AppTab>('wheel');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Ensure valid active roster ID
  useEffect(() => {
    if (!rosters.some((r) => r.id === activeRosterId) && rosters.length > 0) {
      setActiveRosterId(rosters[0].id);
      saveActiveClassId(rosters[0].id);
    }
  }, [rosters, activeRosterId]);

  // Handle Roster Update
  const handleSaveRosters = (updatedRosters: ClassRoster[]) => {
    setRosters(updatedRosters);
    saveRostersToStorage(updatedRosters);
  };

  // Handle Active Class Selection
  const handleSelectRoster = (id: string) => {
    setActiveRosterId(id);
    saveActiveClassId(id);
  };

  // Handle Settings Update
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Alt + 1, 2, 3, 4, 5, 6, 7 Hotkeys for switching tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('wheel');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('grouper');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('millionaire');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('quizbee');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveTab('editor');
        } else if (e.key === '6') {
          e.preventDefault();
          setActiveTab('rosters');
        } else if (e.key === '7') {
          e.preventDefault();
          setActiveTab('settings');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Find currently active roster
  const activeRoster = rosters.find((r) => r.id === activeRosterId) || rosters[0];
  const activeStudents = activeRoster ? activeRoster.students : [];

  const totalStudentsCount = rosters.reduce((acc, r) => acc + r.students.length, 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Header */}
      <Header
        rosters={rosters}
        activeRosterId={activeRosterId}
        onSelectRoster={handleSelectRoster}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalClassesCount={rosters.length}
          totalStudentsCount={totalStudentsCount}
        />

        {/* Dynamic Tab View Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'wheel' && (
            <WheelOfNames
              students={activeStudents}
              settings={settings.wheel}
              className={activeRoster ? activeRoster.name : 'Selected Class'}
            />
          )}

          {activeTab === 'grouper' && (
            <StudentGrouper
              students={activeStudents}
              className={activeRoster ? activeRoster.name : 'Selected Class'}
            />
          )}

          {['review', 'millionaire', 'quizbee', 'flashcard', 'editor'].includes(activeTab) && (
            <ReviewManager
              students={activeStudents}
              className={activeRoster ? activeRoster.name : 'Selected Class'}
              initialMode={
                activeTab === 'quizbee'
                  ? 'quizbee'
                  : activeTab === 'flashcard'
                  ? 'flashcard'
                  : activeTab === 'editor'
                  ? 'editor'
                  : 'millionaire'
              }
            />
          )}

          {activeTab === 'rosters' && (
            <ClassRosterManager
              rosters={rosters}
              activeRosterId={activeRosterId}
              onSelectRoster={handleSelectRoster}
              onSaveRosters={handleSaveRosters}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              rosters={rosters}
              onSaveRosters={handleSaveRosters}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          )}
        </main>
      </div>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
