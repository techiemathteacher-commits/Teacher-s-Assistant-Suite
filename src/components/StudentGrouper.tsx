import React, { useState, useEffect } from 'react';
import { Student, Group, GroupingOptions } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Shuffle,
  Copy,
  Download,
  Check,
  Maximize2,
  Minimize2,
  ArrowRightLeft,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';

interface StudentGrouperProps {
  students: Student[];
  className: string;
}

const NAMING_THEMES = {
  numbered: ['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5', 'Group 6', 'Group 7', 'Group 8', 'Group 9', 'Group 10'],
  colors: ['Team Red', 'Team Blue', 'Team Green', 'Team Yellow', 'Team Purple', 'Team Orange', 'Team Cyan', 'Team Pink'],
  animals: ['Lions', 'Tigers', 'Eagles', 'Falcons', 'Panthers', 'Bears', 'Wolves', 'Hawks'],
  planets: ['Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury', 'Neptune', 'Uranus', 'Pluto'],
};

export const StudentGrouper: React.FC<StudentGrouperProps> = ({ students, className }) => {
  const activeStudents = students.filter((s) => s.active);

  // Grouping Options State
  const [options, setOptions] = useState<GroupingOptions>({
    strategy: 'by_size',
    groupSize: 3,
    groupCount: 4,
    namingTheme: 'numbered',
    balanceGender: false,
    remainderStrategy: 'distribute',
  });

  // Generated Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [copied, setCopied] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  // Swap Student State
  const [selectedStudentForSwap, setSelectedStudentForSwap] = useState<{
    groupId: string;
    student: Student;
  } | null>(null);

  // Initial Auto Group Generation on Mount or Roster Change
  const generateGroups = () => {
    if (activeStudents.length === 0) {
      setGroups([]);
      return;
    }

    // 1. Copy and shuffle active students
    let pool = [...activeStudents].sort(() => Math.random() - 0.5);

    // If balance gender requested, separate M and F
    if (options.balanceGender) {
      const males = pool.filter((s) => s.gender === 'M');
      const females = pool.filter((s) => s.gender === 'F');
      const others = pool.filter((s) => s.gender !== 'M' && s.gender !== 'F');

      // Interleave males and females
      pool = [];
      const maxLen = Math.max(males.length, females.length, others.length);
      for (let i = 0; i < maxLen; i++) {
        if (males[i]) pool.push(males[i]);
        if (females[i]) pool.push(females[i]);
        if (others[i]) pool.push(others[i]);
      }
    }

    let targetGroupCount = 1;
    if (options.strategy === 'by_size') {
      const size = Math.max(1, options.groupSize);
      targetGroupCount = Math.ceil(pool.length / size);
    } else {
      targetGroupCount = Math.max(1, options.groupCount);
    }

    const themeNames = NAMING_THEMES[options.namingTheme] || NAMING_THEMES.numbered;

    // Initialize group objects
    const newGroups: Group[] = Array.from({ length: targetGroupCount }, (_, idx) => ({
      id: `group-${idx + 1}`,
      name: themeNames[idx] || `Group ${idx + 1}`,
      students: [],
    }));

    // Distribute students round-robin
    pool.forEach((student, index) => {
      const groupIdx = index % targetGroupCount;
      newGroups[groupIdx].students.push(student);
    });

    setGroups(newGroups);
    setSelectedStudentForSwap(null);
  };

  useEffect(() => {
    generateGroups();
  }, [students]);

  // Handle student swap or move to group
  const handleStudentClick = (groupId: string, student: Student) => {
    if (!selectedStudentForSwap) {
      // First click: select student to move/swap
      setSelectedStudentForSwap({ groupId, student });
    } else if (
      selectedStudentForSwap.groupId === groupId &&
      selectedStudentForSwap.student.id === student.id
    ) {
      // Deselect
      setSelectedStudentForSwap(null);
    } else {
      // Second click: swap with target student
      const srcGroupId = selectedStudentForSwap.groupId;
      const srcStudent = selectedStudentForSwap.student;

      setGroups((prevGroups) =>
        prevGroups.map((g) => {
          if (g.id === srcGroupId && g.id === groupId) {
            // Same group swap (no change needed)
            return g;
          }
          if (g.id === srcGroupId) {
            return {
              ...g,
              students: g.students.map((s) => (s.id === srcStudent.id ? student : s)),
            };
          }
          if (g.id === groupId) {
            return {
              ...g,
              students: g.students.map((s) => (s.id === student.id ? srcStudent : s)),
            };
          }
          return g;
        })
      );

      setSelectedStudentForSwap(null);
    }
  };

  // Move student to an empty spot or specific group
  const moveStudentToGroup = (targetGroupId: string) => {
    if (!selectedStudentForSwap) return;
    const { groupId: srcGroupId, student } = selectedStudentForSwap;
    if (srcGroupId === targetGroupId) return;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === srcGroupId) {
          return { ...g, students: g.students.filter((s) => s.id !== student.id) };
        }
        if (g.id === targetGroupId) {
          return { ...g, students: [...g.students, student] };
        }
        return g;
      })
    );

    setSelectedStudentForSwap(null);
  };

  // Copy formatted group list to clipboard
  const handleCopy = () => {
    const text = groups
      .map(
        (g) =>
          `📌 ${g.name} (${g.students.length}):\n` +
          g.students.map((s, idx) => `   ${idx + 1}. ${s.name}`).join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download CSV / TXT
  const handleDownload = () => {
    const text = groups
      .map((g) => `${g.name}:\n` + g.students.map((s) => `- ${s.name}`).join('\n'))
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${className.replace(/[^a-z0-9]/gi, '_')}_Groups.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Student Grouper
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {className} • {activeStudents.length} students available
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={generateGroups}
            disabled={activeStudents.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle & Group
          </button>

          <button
            onClick={handleCopy}
            disabled={groups.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl transition-colors disabled:opacity-50"
            title="Copy groups text to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>

          <button
            onClick={handleDownload}
            disabled={groups.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl transition-colors disabled:opacity-50"
            title="Download text file"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={() => setIsProjectorMode(!isProjectorMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 font-medium text-xs rounded-xl transition-colors ${
              isProjectorMode
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {isProjectorMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isProjectorMode ? 'Standard View' : 'Projector View'}
          </button>
        </div>
      </div>

      {/* Grouping Configuration Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Strategy Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Grouping Mode
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setOptions((prev) => ({ ...prev, strategy: 'by_size' }));
                  generateGroups();
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  options.strategy === 'by_size'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                By Group Size
              </button>
              <button
                type="button"
                onClick={() => {
                  setOptions((prev) => ({ ...prev, strategy: 'by_count' }));
                  generateGroups();
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  options.strategy === 'by_count'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                By # of Groups
              </button>
            </div>
          </div>

          {/* Number Selector (Size or Count) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {options.strategy === 'by_size' ? 'Students Per Group' : 'Total Number of Groups'}
            </label>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6].map((num) => {
                const isSelected =
                  options.strategy === 'by_size'
                    ? options.groupSize === num
                    : options.groupCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (options.strategy === 'by_size') {
                        setOptions((prev) => ({ ...prev, groupSize: num }));
                      } else {
                        setOptions((prev) => ({ ...prev, groupCount: num }));
                      }
                      generateGroups();
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Naming Theme */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Group Names Theme
            </label>
            <select
              value={options.namingTheme}
              onChange={(e) => {
                setOptions((prev) => ({
                  ...prev,
                  namingTheme: e.target.value as GroupingOptions['namingTheme'],
                }));
                generateGroups();
              }}
              className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="numbered">Group 1, Group 2...</option>
              <option value="colors">Team Red, Team Blue...</option>
              <option value="animals">Lions, Tigers, Eagles...</option>
              <option value="planets">Mars, Jupiter, Saturn...</option>
            </select>
          </div>

          {/* Gender Balance Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Mix Options
            </label>
            <label className="flex items-center gap-2 p-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options.balanceGender}
                onChange={(e) => {
                  setOptions((prev) => ({ ...prev, balanceGender: e.target.checked }));
                  generateGroups();
                }}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-medium">Mix Genders / Attributes</span>
            </label>
          </div>
        </div>

        {/* Swap Mode Instruction bar */}
        {selectedStudentForSwap && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Selected <strong>{selectedStudentForSwap.student.name}</strong>. Click another student to <strong>SWAP</strong> positions or click "Move Here" on any group card.
              </span>
            </div>
            <button
              onClick={() => setSelectedStudentForSwap(null)}
              className="text-amber-700 dark:text-amber-400 font-bold hover:underline ml-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Generated Groups Cards Grid */}
      {groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-medium">No active students available to group.</p>
          <p className="text-xs mt-1">Make sure you have active students in the selected class roster.</p>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            isProjectorMode
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {groups.map((group, groupIdx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: groupIdx * 0.04 }}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                selectedStudentForSwap && selectedStudentForSwap.groupId !== group.id
                  ? 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Group Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                      {groupIdx + 1}
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {group.name}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {group.students.length} students
                  </span>
                </div>

                {/* Students List */}
                <div className="space-y-1.5 min-h-[100px]">
                  {group.students.map((student) => {
                    const isSelected =
                      selectedStudentForSwap?.student.id === student.id;
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleStudentClick(group.id, student)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-900 dark:text-amber-100 font-bold shadow-xs scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className={`text-xs ${isProjectorMode ? 'text-base font-bold' : 'font-medium'}`}>
                          {student.name}
                        </span>

                        {student.gender && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                            {student.gender}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Move to group button during swap */}
              {selectedStudentForSwap && selectedStudentForSwap.groupId !== group.id && (
                <button
                  type="button"
                  onClick={() => moveStudentToGroup(group.id)}
                  className="mt-3 w-full py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors"
                >
                  Move {selectedStudentForSwap.student.name} Here
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
