import React, { useState } from 'react';
import { ReviewSet, ReviewQuestion } from '../../types';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  Download,
  Upload,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface QuestionBankEditorProps {
  reviewSets: ReviewSet[];
  activeSetId: string;
  onSelectSet: (id: string) => void;
  onSaveSets: (sets: ReviewSet[]) => void;
  onClose?: () => void;
}

export const QuestionBankEditor: React.FC<QuestionBankEditorProps> = ({
  reviewSets,
  activeSetId,
  onSelectSet,
  onSaveSets,
  onClose,
}) => {
  const activeSet = reviewSets.find((s) => s.id === activeSetId) || reviewSets[0];

  // Set editing state
  const [isEditingSetInfo, setIsEditingSetInfo] = useState<boolean>(false);
  const [setTitle, setSetTitle] = useState<string>(activeSet?.title || '');
  const [setSubject, setSetSubject] = useState<string>(activeSet?.subject || '');
  const [setDescription, setSetDescription] = useState<string>(activeSet?.description || '');

  // Question Form State (Add / Edit)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState<string>('');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState<number>(0);
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'average' | 'difficult'>('easy');
  const [qMillionaireLevel, setQMillionaireLevel] = useState<number>(1);
  const [qExplanation, setQExplanation] = useState<string>('');

  // New Review Set creation
  const [isCreatingNewSet, setIsCreatingNewSet] = useState<boolean>(false);
  const [newSetTitle, setNewSetTitle] = useState<string>('');

  const handleOpenEditQuestion = (q?: ReviewQuestion) => {
    if (q) {
      setEditingQuestionId(q.id);
      setQText(q.question);
      setQOptions([...q.options]);
      setQCorrectIndex(q.correctIndex);
      setQDifficulty(q.difficulty || 'easy');
      setQMillionaireLevel(q.millionaireLevel || 1);
      setQExplanation(q.explanation || '');
    } else {
      setEditingQuestionId('new');
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrectIndex(0);
      setQDifficulty('easy');
      setQMillionaireLevel((activeSet?.questions.length || 0) + 1);
      setQExplanation('');
    }
  };

  const handleSaveQuestion = () => {
    if (!qText.trim() || qOptions.some((opt) => !opt.trim())) {
      alert('Please fill in the question text and all option choices.');
      return;
    }

    const updatedQuestions = [...(activeSet?.questions || [])];

    if (editingQuestionId === 'new') {
      const newQuestion: ReviewQuestion = {
        id: `q-${Date.now()}`,
        question: qText.trim(),
        options: qOptions.map((o) => o.trim()),
        correctIndex: qCorrectIndex,
        difficulty: qDifficulty,
        millionaireLevel: qMillionaireLevel,
        explanation: qExplanation.trim(),
      };
      updatedQuestions.push(newQuestion);
    } else {
      const idx = updatedQuestions.findIndex((q) => q.id === editingQuestionId);
      if (idx !== -1) {
        updatedQuestions[idx] = {
          ...updatedQuestions[idx],
          question: qText.trim(),
          options: qOptions.map((o) => o.trim()),
          correctIndex: qCorrectIndex,
          difficulty: qDifficulty,
          millionaireLevel: qMillionaireLevel,
          explanation: qExplanation.trim(),
        };
      }
    }

    const updatedSets = reviewSets.map((s) => {
      if (s.id === activeSet.id) {
        return {
          ...s,
          questions: updatedQuestions,
          updatedAt: Date.now(),
        };
      }
      return s;
    });

    onSaveSets(updatedSets);
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const updatedQuestions = activeSet.questions.filter((q) => q.id !== qId);
    const updatedSets = reviewSets.map((s) => {
      if (s.id === activeSet.id) {
        return { ...s, questions: updatedQuestions, updatedAt: Date.now() };
      }
      return s;
    });
    onSaveSets(updatedSets);
  };

  const handleSaveSetDetails = () => {
    const updatedSets = reviewSets.map((s) => {
      if (s.id === activeSet.id) {
        return {
          ...s,
          title: setTitle,
          subject: setSubject,
          description: setDescription,
          updatedAt: Date.now(),
        };
      }
      return s;
    });
    onSaveSets(updatedSets);
    setIsEditingSetInfo(false);
  };

  const handleCreateNewSet = () => {
    if (!newSetTitle.trim()) return;
    const newSet: ReviewSet = {
      id: `set-${Date.now()}`,
      title: newSetTitle.trim(),
      subject: 'General Review',
      description: 'Custom teacher created review questions.',
      questions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...reviewSets, newSet];
    onSaveSets(updated);
    onSelectSet(newSet.id);
    setIsCreatingNewSet(false);
    setNewSetTitle('');
  };

  const handleDeleteSet = (setId: string) => {
    if (reviewSets.length <= 1) {
      alert('You must keep at least one review set.');
      return;
    }
    if (!confirm('Delete this entire review set and all its questions?')) return;
    const filtered = reviewSets.filter((s) => s.id !== setId);
    onSaveSets(filtered);
    onSelectSet(filtered[0].id);
  };

  const handleExportSetJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeSet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeSet.title.replace(/\s+/g, '_')}_quiz_set.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSetJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title && Array.isArray(parsed.questions)) {
          const importedSet: ReviewSet = {
            ...parsed,
            id: `set-imported-${Date.now()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          const updated = [...reviewSets, importedSet];
          onSaveSets(updated);
          onSelectSet(importedSet.id);
          alert(`Successfully imported quiz set: "${importedSet.title}" with ${importedSet.questions.length} questions!`);
        } else {
          alert('Invalid quiz set file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Set Selector Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Question Bank & Quiz Set Manager
            </h2>
            <p className="text-xs text-slate-500">
              Create, edit, and organize questions for all review modes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Select Set Dropdown */}
          <select
            value={activeSetId}
            onChange={(e) => onSelectSet(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {reviewSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.questions.length} Qs)
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreatingNewSet(true)}
            className="flex items-center gap-1 px-3.5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> New Set
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* New Set Modal/Form */}
      {isCreatingNewSet && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center gap-3">
          <input
            type="text"
            placeholder="Review Set Title (e.g., Chapter 4 Science Review)"
            value={newSetTitle}
            onChange={(e) => setNewSetTitle(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCreateNewSet}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700"
          >
            Create
          </button>
          <button
            onClick={() => setIsCreatingNewSet(false)}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Active Set Details Card */}
      {activeSet && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          {!isEditingSetInfo ? (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {activeSet.title}
                  </h3>
                  {activeSet.subject && (
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-md">
                      {activeSet.subject}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{activeSet.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSetTitle(activeSet.title);
                    setSetSubject(activeSet.subject || '');
                    setSetDescription(activeSet.description || '');
                    setIsEditingSetInfo(true);
                  }}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" /> Edit Set Info
                </button>

                <button
                  onClick={handleExportSetJSON}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                  title="Export Set as JSON"
                >
                  <Download className="w-4 h-4" /> Export
                </button>

                <label className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                  <Upload className="w-4 h-4" /> Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSetJSON}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => handleDeleteSet(activeSet.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete Set
                </button>
              </div>
            </div>
          ) : (
            /* Editing Set Info Form */
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Set Title"
                  value={setTitle}
                  onChange={(e) => setSetTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
                <input
                  type="text"
                  placeholder="Subject / Category"
                  value={setSubject}
                  onChange={(e) => setSetSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <textarea
                placeholder="Description..."
                value={setDescription}
                onChange={(e) => setSetDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm h-16"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingSetInfo(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSetDetails}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save Set Info
                </button>
              </div>
            </div>
          )}

          {/* Add Question Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Questions ({activeSet.questions.length})
            </span>
            <button
              onClick={() => handleOpenEditQuestion()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {/* Question Add/Edit Form Drawer */}
          {editingQuestionId && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 space-y-4 animate-fadeIn">
              <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <span>
                  {editingQuestionId === 'new' ? 'Add New Question' : 'Edit Question'}
                </span>
                <button onClick={() => setEditingQuestionId(null)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              </h4>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Question Prompt:
                </label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter question text..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Options inputs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Choices (Select correct answer radio):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {qOptions.map((opt, idx) => {
                    const label = ['A', 'B', 'C', 'D'][idx];
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-xl border bg-white dark:bg-slate-900 ${
                          qCorrectIndex === idx
                            ? 'border-emerald-500 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOption"
                          checked={qCorrectIndex === idx}
                          onChange={() => setQCorrectIndex(idx)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="font-bold text-xs text-slate-500">{label}:</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...qOptions];
                            newOpts[idx] = e.target.value;
                            setQOptions(newOpts);
                          }}
                          placeholder={`Option ${label}`}
                          className="flex-1 text-xs bg-transparent focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadata Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Difficulty Level:
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e: any) => setQDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="easy">Easy (10pts)</option>
                    <option value="average">Average (20pts)</option>
                    <option value="difficult">Difficult (30pts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Millionaire Tier Level (1-15):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={qMillionaireLevel}
                    onChange={(e) => setQMillionaireLevel(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Explanation / Answer Key */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Answer Key Explanation / Hint (Optional):
                </label>
                <input
                  type="text"
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain why this choice is correct..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingQuestionId(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
                >
                  Save Question
                </button>
              </div>
            </div>
          )}

          {/* List of Questions */}
          <div className="space-y-3">
            {activeSet.questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500">Q{idx + 1}.</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : q.difficulty === 'average'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {q.difficulty || 'easy'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      Level {q.millionaireLevel || 1}
                    </span>
                  </div>

                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`truncate ${
                          oIdx === q.correctIndex
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                            : ''
                        }`}
                      >
                        {['A', 'B', 'C', 'D'][oIdx]}: {opt}{' '}
                        {oIdx === q.correctIndex && '✓'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditQuestion(q)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
