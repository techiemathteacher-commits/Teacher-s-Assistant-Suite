import React, { useRef, useState } from 'react';
import { ClassRoster, AppSettings } from '../types';
import { exportAllDataAsJSON, parseDataFromJSON, INITIAL_ROSTERS } from '../lib/storage';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  PieChart,
  HardDrive,
  Check,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  rosters: ClassRoster[];
  onSaveRosters: (rosters: ClassRoster[]) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  rosters,
  onSaveRosters,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Export JSON Backup
  const handleExportJSON = () => {
    const jsonStr = exportAllDataAsJSON(rosters, settings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Teacher_Assistant_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseDataFromJSON(content);

      if (parsed && parsed.rosters && parsed.rosters.length > 0) {
        onSaveRosters(parsed.rosters);
        if (parsed.settings) {
          onUpdateSettings(parsed.settings);
        }
        setImportStatus('Successfully restored class rosters and settings!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default sample rosters
  const handleResetSampleData = () => {
    if (confirm('Are you sure you want to reset all data back to sample classroom rosters? This will overwrite existing lists.')) {
      onSaveRosters(INITIAL_ROSTERS);
      setImportStatus('Reset to sample data successfully.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          App Preferences & Data Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure spin physics, sound effects, and backup your classroom data
        </p>
      </div>

      {importStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {importStatus}
        </div>
      )}

      {/* Wheel Defaults */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Wheel of Names Settings
          </h3>
        </div>

        <div className="space-y-4">
          {/* Spin Duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Spin Duration ({settings.wheel.spinDuration} seconds)
              </label>
              <span className="text-[11px] text-slate-400">Controls how long the wheel spins</span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={1}
              value={settings.wheel.spinDuration}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  wheel: { ...settings.wheel, spinDuration: Number(e.target.value) },
                })
              }
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Sound Volume */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Spin Sound Volume ({Math.round(settings.wheel.volume * 100)}%)
              </label>
            </div>
            <div className="flex items-center gap-3">
              {settings.wheel.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-indigo-500" />
              )}
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.wheel.volume}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    wheel: {
                      ...settings.wheel,
                      volume: Number(e.target.value),
                      soundEnabled: Number(e.target.value) > 0,
                    },
                  })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Auto Remove Winner Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.wheel.autoRemoveWinner}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    wheel: { ...settings.wheel, autoRemoveWinner: e.target.checked },
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Automatically remove winner from remaining spins without asking
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Offline Data Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Offline Backup & Restore (JSON)
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          All your class rosters and student names are automatically saved locally inside your web browser. You can export a single backup file to transfer your classes between classroom PCs or keep a safe offline copy.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Backup (.json)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Import Backup File
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleResetSampleData}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-200 font-semibold text-xs rounded-xl border border-rose-200 dark:border-rose-800/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Sample Rosters
          </button>
        </div>
      </div>
    </div>
  );
};
