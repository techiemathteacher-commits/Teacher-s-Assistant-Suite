import React, { useState } from 'react';
import { ClassRoster, Student } from '../types';
import { BulkImportModal } from './BulkImportModal';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';

interface ClassRosterManagerProps {
  rosters: ClassRoster[];
  activeRosterId: string;
  onSelectRoster: (id: string) => void;
  onSaveRosters: (rosters: ClassRoster[]) => void;
}

export const ClassRosterManager: React.FC<ClassRosterManagerProps> = ({
  rosters,
  activeRosterId,
  onSelectRoster,
  onSaveRosters,
}) => {
  // Active Roster
  const activeRoster = rosters.find((r) => r.id === activeRosterId) || rosters[0];

  // Search filter inside student list
  const [searchQuery, setSearchQuery] = useState('');

  // New Student Input
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'M' | 'F' | ''>('');

  // Bulk Import Modal state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // New Class Modal State
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');

  // Edit Class Name State
  const [isEditingClassHeader, setIsEditingClassHeader] = useState(false);
  const [editClassName, setEditClassName] = useState('');

  // Edit Individual Student State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');

  // Filtered student list
  const filteredStudents = activeRoster
    ? activeRoster.students.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Add Single Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !activeRoster) return;

    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newStudentName.trim(),
      gender: newStudentGender || undefined,
      active: true,
    };

    const updatedRosters = rosters.map((r) => {
      if (r.id === activeRoster.id) {
        return {
          ...r,
          updatedAt: Date.now(),
          students: [...r.students, newStudent],
        };
      }
      return r;
    });

    onSaveRosters(updatedRosters);
    setNewStudentName('');
    setNewStudentGender('');
  };

  // Bulk Import Students
  const handleBulkImport = (names: string[]) => {
    if (!activeRoster) return;

    const newStudents: Student[] = names.map((name) => ({
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      active: true,
    }));

    const updatedRosters = rosters.map((r) => {
      if (r.id === activeRoster.id) {
        return {
          ...r,
          updatedAt: Date.now(),
          students: [...r.students, ...newStudents],
        };
      }
      return r;
    });

    onSaveRosters(updatedRosters);
  };

  // Toggle student active state
  const toggleStudentActive = (studentId: string) => {
    if (!activeRoster) return;

    const updatedRosters = rosters.map((r) => {
      if (r.id === activeRoster.id) {
        return {
          ...r,
          updatedAt: Date.now(),
          students: r.students.map((s) =>
            s.id === studentId ? { ...s, active: !s.active } : s
          ),
        };
      }
      return r;
    });

    onSaveRosters(updatedRosters);
  };

  // Delete student
  const handleDeleteStudent = (studentId: string) => {
    if (!activeRoster) return;

    const updatedRosters = rosters.map((r) => {
      if (r.id === activeRoster.id) {
        return {
          ...r,
          updatedAt: Date.now(),
          students: r.students.filter((s) => s.id !== studentId),
        };
      }
      return r;
    });

    onSaveRosters(updatedRosters);
  };

  // Edit student name save
  const handleSaveStudentEdit = (studentId: string) => {
    if (!editStudentName.trim() || !activeRoster) return;

    const updatedRosters = rosters.map((r) => {
      if (r.id === activeRoster.id) {
        return {
          ...r,
          updatedAt: Date.now(),
          students: r.students.map((s) =>
            s.id === studentId ? { ...s, name: editStudentName.trim() } : s
          ),
        };
      }
      return r;
    });

    onSaveRosters(updatedRosters);
    setEditingStudentId(null);
  };

  // Create new Class Roster
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newRoster: ClassRoster = {
      id: `roster-${Date.now()}`,
      name: newClassName.trim(),
      gradeOrSubject: newClassSubject.trim() || undefined,
      students: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedRosters = [...rosters, newRoster];
    onSaveRosters(updatedRosters);
    onSelectRoster(newRoster.id);

    setNewClassName('');
    setNewClassSubject('');
    setIsCreatingClass(false);
  };

  // Delete entire Class Roster
  const handleDeleteClass = (rosterId: string) => {
    const targetRoster = rosters.find((r) => r.id === rosterId);
    const rosterName = targetRoster ? targetRoster.name : 'this class';

    if (!window.confirm(`Are you sure you want to delete "${rosterName}"? All student entries in this class will be permanently deleted.`)) {
      return;
    }

    const updatedRosters = rosters.filter((r) => r.id !== rosterId);
    onSaveRosters(updatedRosters);

    if (updatedRosters.length > 0) {
      if (activeRosterId === rosterId || !updatedRosters.some((r) => r.id === activeRosterId)) {
        onSelectRoster(updatedRosters[0].id);
      }
    } else {
      onSelectRoster('');
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Class Roster Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize student lists per subject/period with persistent offline storage
          </p>
        </div>

        <button
          onClick={() => setIsCreatingClass(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </button>
      </div>

      {/* Main Roster Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class Selector Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Your Classes ({rosters.length})
          </span>

          <div className="space-y-1">
            {rosters.length === 0 ? (
              <div className="text-center py-6 px-2 text-xs text-slate-400">
                No classes yet. Click "Create New Class" above.
              </div>
            ) : (
              rosters.map((roster) => {
                const isSelected = roster.id === activeRosterId;
                const studentCount = roster.students.length;
                const activeCount = roster.students.filter((s) => s.active).length;

                return (
                  <div
                    key={roster.id}
                    onClick={() => onSelectRoster(roster.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <BookOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs truncate">{roster.name}</div>
                        <div className="text-[10px] font-normal text-slate-400 truncate">
                          {activeCount}/{studentCount} Active
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(roster.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/80 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title={`Delete ${roster.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Class Student Editor */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          {!activeRoster ? (
            <div className="text-center py-16 space-y-4">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Class Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a class from the list on the left, or create a brand new class roster to begin adding students.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingClass(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create New Class
              </button>
            </div>
          ) : (
            <>
              {/* Class Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {activeRoster.name}
                    </h3>
                    {activeRoster.gradeOrSubject && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {activeRoster.gradeOrSubject}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Total: {activeRoster.students.length} students • Active on tools: {activeRoster.students.filter((s) => s.active).length}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkImportOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Bulk Import
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteClass(activeRoster.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-200/80 dark:border-rose-900/60 transition-colors cursor-pointer"
                    title={`Delete ${activeRoster.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Class
                  </button>
                </div>
              </div>

          {/* Add Student Single Input Form */}
          <form
            onSubmit={handleAddStudent}
            className="flex flex-col sm:flex-row gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex-1">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Enter student full name..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={newStudentGender}
              onChange={(e) => setNewStudentGender(e.target.value as 'M' | 'F' | '')}
              className="px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Gender (Optional)</option>
              <option value="M">Male (M)</option>
              <option value="F">Female (F)</option>
            </select>

            <button
              type="submit"
              disabled={!newStudentName.trim()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </form>

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students in this roster..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Student Table / Cards List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No students found in this roster. Click "Add Student" or "Bulk Import".
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isEditing = editingStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      student.active
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                        : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleStudentActive(student.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title={student.active ? 'Click to mark Absent / Inactive' : 'Click to mark Active'}
                      >
                        {student.active ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editStudentName}
                            onChange={(e) => setEditStudentName(e.target.value)}
                            className="px-2 py-1 text-xs border border-indigo-500 rounded bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveStudentEdit(student.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span
                            className={`text-sm font-semibold text-slate-900 dark:text-white block ${
                              !student.active ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {student.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                      {student.gender && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {student.gender}
                        </span>
                      )}

                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingStudentId(student.id);
                            setEditStudentName(student.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                          title="Edit Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
        className={activeRoster?.name || ''}
      />

      {/* Create Class Modal */}
      {isCreatingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Class Roster
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Period 4 - Geometry"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject / Grade Tag (Optional)
                </label>
                <input
                  type="text"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  placeholder="e.g. Grade 10 Math"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingClass(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newClassName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
