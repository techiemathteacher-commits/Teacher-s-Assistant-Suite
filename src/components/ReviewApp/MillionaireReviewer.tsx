import React, { useState, useRef, useEffect } from 'react';
import { ReviewSet, ReviewQuestion } from '../../types';
import {
  Trophy,
  Phone,
  Users,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Maximize2,
  Minimize2,
  Plus,
  Home,
  Play,
  Pencil,
  Trash2,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MillionaireReviewerProps {
  reviewSet: ReviewSet;
  reviewSets?: ReviewSet[];
  activeSetId?: string;
  onSelectSet?: (setId: string) => void;
  onUpdateReviewSet?: (updatedSet: ReviewSet) => void;
  onEditSet?: () => void;
}

export const MONEY_LADDER = [
  { level: 15, amount: '₱1,000,000', safe: true },
  { level: 14, amount: '₱500,000', safe: false },
  { level: 13, amount: '₱250,000', safe: false },
  { level: 12, amount: '₱150,000', safe: false },
  { level: 11, amount: '₱100,000', safe: false },
  { level: 10, amount: '₱50,000', safe: true },
  { level: 9, amount: '₱35,000', safe: false },
  { level: 8, amount: '₱20,000', safe: false },
  { level: 7, amount: '₱15,000', safe: false },
  { level: 6, amount: '₱10,000', safe: false },
  { level: 5, amount: '₱5,000', safe: true },
  { level: 4, amount: '₱3,000', safe: false },
  { level: 3, amount: '₱2,000', safe: false },
  { level: 2, amount: '₱1,500', safe: false },
  { level: 1, amount: '₱1,000', safe: false },
];

export const MillionaireReviewer: React.FC<MillionaireReviewerProps> = ({
  reviewSet,
  onUpdateReviewSet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showEditQuestions, setShowEditQuestions] = useState<boolean>(false);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);

  // Form states for Add / Edit Question
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newOptionA, setNewOptionA] = useState<string>('');
  const [newOptionB, setNewOptionB] = useState<string>('');
  const [newOptionC, setNewOptionC] = useState<string>('');
  const [newOptionD, setNewOptionD] = useState<string>('');
  const [newCorrectIdx, setNewCorrectIdx] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState<string>('');

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Build mapped 15-question ladder (1 question per money tier)
  const sortedQuestions = React.useMemo(() => {
    const list: (ReviewQuestion | null)[] = [];
    for (let lvl = 1; lvl <= 15; lvl++) {
      // Find question explicitly assigned to this level
      let found = reviewSet.questions.find((q) => q.millionaireLevel === lvl);
      // Fallback if no question explicitly has millionaireLevel = lvl
      if (!found && reviewSet.questions[lvl - 1]) {
        found = reviewSet.questions[lvl - 1];
      }
      list.push(found || null);
    }
    return list;
  }, [reviewSet]);

  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [wonAmount, setWonAmount] = useState<string>('₱0');

  // Lifelines state
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    askAudience: true,
    phoneFriend: true,
  });

  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [activeLifelineModal, setActiveLifelineModal] = useState<'audience' | 'phone' | null>(null);
  const [audienceVotes, setAudienceVotes] = useState<number[]>([]);

  const currentQuestion = sortedQuestions[currentLevelIndex];
  const currentLadder = MONEY_LADDER.find((m) => m.level === currentLevelIndex + 1) || MONEY_LADDER[14];

  // Count how many tiers have valid questions
  const validQuestionsCount = sortedQuestions.filter(Boolean).length;

  const handleStartGame = () => {
    if (validQuestionsCount === 0) return;
    setGameStarted(true);
    setCurrentLevelIndex(0);
    setSelectedOption(null);
    setIsLockedIn(false);
    setIsRevealed(false);
    setGameOver(false);
    setGameWon(false);
    setWonAmount('₱0');
    setEliminatedOptions([]);
    setLifelines({ fiftyFifty: true, askAudience: true, phoneFriend: true });
  };

  const handleOpenAddOrEditModal = (targetLevel: number = 1, existingQ?: ReviewQuestion | null) => {
    setSelectedLevel(targetLevel);
    if (existingQ) {
      setEditingQuestionId(existingQ.id);
      setNewQuestionText(existingQ.question);
      setNewOptionA(existingQ.options[0] || '');
      setNewOptionB(existingQ.options[1] || '');
      setNewOptionC(existingQ.options[2] || '');
      setNewOptionD(existingQ.options[3] || '');
      setNewCorrectIdx(existingQ.correctIndex);
      setNewExplanation(existingQ.explanation || '');
    } else {
      setEditingQuestionId(null);
      setNewQuestionText('');
      setNewOptionA('');
      setNewOptionB('');
      setNewOptionC('');
      setNewOptionD('');
      setNewCorrectIdx(0);
      setNewExplanation('');
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newQuestionText.trim() ||
      !newOptionA.trim() ||
      !newOptionB.trim() ||
      !newOptionC.trim() ||
      !newOptionD.trim()
    ) {
      alert('Please complete the question and all 4 choices.');
      return;
    }

    let updatedQuestions = [...reviewSet.questions];

    if (editingQuestionId) {
      // Edit existing question
      updatedQuestions = updatedQuestions.map((q) => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            question: newQuestionText.trim(),
            options: [newOptionA.trim(), newOptionB.trim(), newOptionC.trim(), newOptionD.trim()],
            correctIndex: newCorrectIdx,
            explanation: newExplanation.trim() || undefined,
            millionaireLevel: selectedLevel,
          };
        }
        return q;
      });
    } else {
      // Create new question for selectedLevel
      const newQ: ReviewQuestion = {
        id: 'q_' + Date.now(),
        question: newQuestionText.trim(),
        options: [newOptionA.trim(), newOptionB.trim(), newOptionC.trim(), newOptionD.trim()],
        correctIndex: newCorrectIdx,
        explanation: newExplanation.trim() || undefined,
        millionaireLevel: selectedLevel,
      };
      updatedQuestions.push(newQ);
    }

    const updatedSet: ReviewSet = {
      ...reviewSet,
      questions: updatedQuestions,
      updatedAt: Date.now(),
    };

    if (onUpdateReviewSet) {
      onUpdateReviewSet(updatedSet);
    }

    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm('Are you sure you want to remove this question?')) return;
    const updatedQuestions = reviewSet.questions.filter((q) => q.id !== questionId);
    const updatedSet: ReviewSet = {
      ...reviewSet,
      questions: updatedQuestions,
      updatedAt: Date.now(),
    };
    if (onUpdateReviewSet) {
      onUpdateReviewSet(updatedSet);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isLockedIn || isRevealed || gameOver || eliminatedOptions.includes(index)) return;
    setSelectedOption(index);
  };

  const handleLockIn = () => {
    if (selectedOption === null || !currentQuestion) return;
    setIsLockedIn(true);

    setTimeout(() => {
      setIsRevealed(true);
      const isCorrect = selectedOption === currentQuestion.correctIndex;

      if (isCorrect) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        if (currentLevelIndex + 1 === 15) {
          setGameWon(true);
          setWonAmount('₱1,000,000');
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        }
      } else {
        setGameOver(true);
        let safeEarnings = '₱0';
        if (currentLevelIndex >= 10) safeEarnings = '₱50,000';
        else if (currentLevelIndex >= 5) safeEarnings = '₱5,000';
        setWonAmount(safeEarnings);
      }
    }, 1200);
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < sortedQuestions.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsLockedIn(false);
      setIsRevealed(false);
      setEliminatedOptions([]);
    }
  };

  const handleUse5050 = () => {
    if (!lifelines.fiftyFifty || !currentQuestion || isRevealed) return;
    const wrongIndices = currentQuestion.options
      .map((_, i) => i)
      .filter((i) => i !== currentQuestion.correctIndex);

    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
    const toEliminate = shuffledWrong.slice(0, 2);

    setEliminatedOptions(toEliminate);
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
  };

  const handleUseAskAudience = () => {
    if (!lifelines.askAudience || !currentQuestion || isRevealed) return;
    const correctIdx = currentQuestion.correctIndex;

    const votes = [0, 0, 0, 0];
    let remaining = 100;

    const correctVote = Math.floor(Math.random() * 30) + 55;
    votes[correctIdx] = correctVote;
    remaining -= correctVote;

    currentQuestion.options.forEach((_, idx) => {
      if (idx !== correctIdx && !eliminatedOptions.includes(idx)) {
        const vote = Math.floor(Math.random() * (remaining + 1));
        votes[idx] = vote;
        remaining -= vote;
      }
    });
    votes[correctIdx] += remaining;

    setAudienceVotes(votes);
    setActiveLifelineModal('audience');
    setLifelines((prev) => ({ ...prev, askAudience: false }));
  };

  const handleUsePhoneFriend = () => {
    if (!lifelines.phoneFriend || !currentQuestion || isRevealed) return;
    setActiveLifelineModal('phone');
    setLifelines((prev) => ({ ...prev, phoneFriend: false }));
  };

  const handleRestart = () => {
    setCurrentLevelIndex(0);
    setSelectedOption(null);
    setIsLockedIn(false);
    setIsRevealed(false);
    setGameOver(false);
    setGameWon(false);
    setWonAmount('₱0');
    setEliminatedOptions([]);
    setLifelines({ fiftyFifty: true, askAudience: true, phoneFriend: true });
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  // Add / Edit Question Modal Component
  const renderQuestionModal = () => {
    const levelLadderItem = MONEY_LADDER.find((m) => m.level === selectedLevel) || MONEY_LADDER[14];

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-900 border-2 border-amber-500/50 text-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl animate-fadeIn my-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
                {editingQuestionId ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-amber-300">
                  {editingQuestionId ? 'Edit Question' : 'Add Question'} for {levelLadderItem.amount}
                </h3>
                <p className="text-xs text-slate-400">
                  Assigning to Money Tier Level {selectedLevel} ({levelLadderItem.amount})
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuestionModal(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveQuestion} className="space-y-4">
            {/* Money Tier Level Selector */}
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                Target Money Tier Level *
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-amber-500/40 rounded-xl text-amber-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {[...MONEY_LADDER].reverse().map((item) => (
                  <option key={item.level} value={item.level}>
                    Level {item.level}: {item.amount} {item.safe ? '(Safe Haven)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Question Statement *
              </label>
              <textarea
                required
                rows={3}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="e.g. What is the national flower of the Philippines?"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Answer Choices (4 Options) *
              </label>

              {[
                { label: 'A', value: newOptionA, setter: setNewOptionA, idx: 0 },
                { label: 'B', value: newOptionB, setter: setNewOptionB, idx: 1 },
                { label: 'C', value: newOptionC, setter: setNewOptionC, idx: 2 },
                { label: 'D', value: newOptionD, setter: setNewOptionD, idx: 3 },
              ].map((opt) => (
                <div key={opt.label} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCorrectIdx(opt.idx)}
                    className={`px-3 py-2.5 rounded-xl font-black text-xs transition border flex items-center gap-1.5 cursor-pointer ${
                      newCorrectIdx === opt.idx
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                    title="Click to mark as Correct Answer"
                  >
                    <span>Option {opt.label}</span>
                    {newCorrectIdx === opt.idx && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <input
                    type="text"
                    required
                    value={opt.value}
                    onChange={(e) => opt.setter(e.target.value)}
                    placeholder={`Choice ${opt.label} option text`}
                    className={`flex-1 px-4 py-2.5 bg-slate-950 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 ${
                      newCorrectIdx === opt.idx
                        ? 'border-emerald-500/50 focus:ring-emerald-500'
                        : 'border-slate-800 focus:ring-amber-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Teacher Hint / Explanation (Optional)
              </label>
              <input
                type="text"
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="e.g. Sampaguita is known for its sweet scent."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Save Question
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 1. START GAME WINDOW (When game hasn't started yet)
  if (!gameStarted) {
    return (
      <div
        ref={containerRef}
        className={`space-y-8 ${
          isFullscreen
            ? 'fixed inset-0 z-50 bg-slate-950 p-6 md:p-12 overflow-y-auto w-screen h-screen text-slate-100'
            : 'max-w-5xl mx-auto'
        }`}
      >
        {/* Main Hero Header Card */}
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 md:p-10 text-center text-white shadow-2xl relative overflow-hidden space-y-6 animate-fadeIn">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Title Banner */}
          <div className="space-y-3 relative">
            <div className="inline-flex p-3.5 bg-amber-500/20 border-2 border-amber-500/50 rounded-2xl text-amber-300 shadow-xl shadow-amber-500/10 animate-bounce">
              <Trophy className="w-10 h-10 md:w-14 md:h-14" />
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              WHO WANTS TO BE A MILLIONAIRE?
            </h1>
            <p className="text-xs md:text-base text-amber-200/80 font-medium max-w-xl mx-auto">
              Interactive Classroom Game Show Reviewer
            </p>
          </div>

          {/* Main Controls & Start Button */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative">
            <button
              onClick={handleStartGame}
              disabled={validQuestionsCount === 0}
              className={`px-10 py-4 font-black text-lg rounded-2xl shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer ${
                validQuestionsCount > 0
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-6 h-6 fill-current" /> START GAME
            </button>

            <button
              onClick={() => setShowEditQuestions((prev) => !prev)}
              className={`px-6 py-4 border font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer ${
                showEditQuestions
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-amber-500/40 hover:bg-slate-800 text-amber-300'
              }`}
            >
              <Pencil className="w-5 h-5 text-amber-400" />
              <span>{showEditQuestions ? 'Hide Questions' : 'Edit Questions'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-5 py-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
            </button>
          </div>
        </div>

        {/* 15 MONEY TIER QUESTIONS EDITOR & SETUP GRID */}
        {showEditQuestions && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg md:text-xl font-black text-amber-300 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" /> Questions Per Money Tier (15 Levels)
                </h2>
                <p className="text-xs text-slate-400">
                  Customize or add questions specifically for each money level from ₱1,000 to ₱1,000,000.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                  {validQuestionsCount} / 15 Levels Ready
                </div>
                <button
                  onClick={() => setShowEditQuestions(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Done Editing ✕
                </button>
              </div>
            </div>

            {/* List of 15 Money Tiers */}
            <div className="space-y-3">
              {MONEY_LADDER.map((item) => {
                const q = sortedQuestions[item.level - 1];

                return (
                  <div
                    key={item.level}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      q
                        ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                        : 'bg-slate-950/40 border-dashed border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Left Tier Badge & Amount */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs font-mono border ${
                          item.safe
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-indigo-950/80 border-indigo-800 text-indigo-300'
                        }`}
                      >
                        L{item.level}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-base">
                            {item.amount}
                          </span>
                          {item.safe && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              SAFE HAVEN
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Level {item.level} Question
                        </span>
                      </div>
                    </div>

                    {/* Middle Question Text Preview */}
                    <div className="flex-1 min-w-0">
                      {q ? (
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-slate-200 line-clamp-2">
                            {q.question}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                            <span>4 Choices</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">
                              Correct: {optionLabels[q.correctIndex]}: {q.options[q.correctIndex]}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 italic">
                          No question assigned yet to {item.amount}. Click "Add Question" to set one.
                        </div>
                      )}
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      {q ? (
                        <>
                          <button
                            onClick={() => handleOpenAddOrEditModal(item.level, q)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
                            title="Edit Question"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-xs font-bold transition border border-slate-700 cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenAddOrEditModal(item.level, null)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition border border-amber-500/40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Question
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Render Modal */}
        {showQuestionModal && renderQuestionModal()}
      </div>
    );
  }

  // 2. ACTIVE GAMEPLAY ARENA
  return (
    <div
      ref={containerRef}
      className={`space-y-6 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 md:p-8 overflow-y-auto w-screen h-screen text-slate-100'
          : 'max-w-5xl mx-auto'
      }`}
    >
      {/* Sleek Game Arena Header (No Dropdown) */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-6 rounded-3xl border border-amber-500/30 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              WHO WANTS TO BE A MILLIONAIRE
            </h2>
            <p className="text-xs text-amber-200/70 font-medium">Classroom Game Show Edition</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Home / Start Window Button */}
          <button
            onClick={() => setGameStarted(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-200 font-semibold transition cursor-pointer"
            title="Return to Setup & Start Window"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Setup / Start Window</span>
          </button>

          {/* Quick Edit Current Question Button */}
          {currentQuestion && (
            <button
              onClick={() => handleOpenAddOrEditModal(currentLevelIndex + 1, currentQuestion)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-xs text-amber-300 font-semibold transition cursor-pointer"
              title="Edit Current Question"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Question</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Lifelines */}
          <button
            onClick={handleUse5050}
            disabled={!lifelines.fiftyFifty || isRevealed || gameOver}
            className={`flex flex-col items-center justify-center w-11 h-9 rounded-xl border text-xs font-bold transition ${
              lifelines.fiftyFifty
                ? 'bg-indigo-900/60 border-amber-400/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 shadow-lg shadow-amber-500/10 cursor-pointer'
                : 'bg-slate-800/50 border-slate-700 text-slate-600 line-through cursor-not-allowed'
            }`}
            title="50:50 Lifeline"
          >
            <span className="text-[10px]">50:50</span>
          </button>

          <button
            onClick={handleUseAskAudience}
            disabled={!lifelines.askAudience || isRevealed || gameOver}
            className={`flex flex-col items-center justify-center w-9 h-9 rounded-xl border text-xs font-bold transition ${
              lifelines.askAudience
                ? 'bg-indigo-900/60 border-amber-400/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 shadow-lg shadow-amber-500/10 cursor-pointer'
                : 'bg-slate-800/50 border-slate-700 text-slate-600 line-through cursor-not-allowed'
            }`}
            title="Ask the Class Lifeline"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={handleUsePhoneFriend}
            disabled={!lifelines.phoneFriend || isRevealed || gameOver}
            className={`flex flex-col items-center justify-center w-9 h-9 rounded-xl border text-xs font-bold transition ${
              lifelines.phoneFriend
                ? 'bg-indigo-900/60 border-amber-400/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 shadow-lg shadow-amber-500/10 cursor-pointer'
                : 'bg-slate-800/50 border-slate-700 text-slate-600 line-through cursor-not-allowed'
            }`}
            title="Phone a Friend / Hint Lifeline"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 cursor-pointer"
            title="Toggle Presentation Full Screen"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden md:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden md:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Game Section with Question & Money Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Question Arena */}
        <div className="lg:col-span-3 space-y-6">
          {gameWon ? (
            /* GRAND WINNER DISPLAY */
            <div className="bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 p-8 rounded-3xl border-2 border-amber-400 text-center text-white space-y-6 shadow-2xl animate-fadeIn">
              <Sparkles className="w-16 h-16 text-yellow-300 mx-auto animate-bounce" />
              <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
                CONGRATULATIONS!
              </h2>
              <p className="text-xl text-amber-200">You are a MILLIONAIRE!</p>
              <div className="text-4xl md:text-6xl font-black text-yellow-300 font-mono tracking-wider">
                {wonAmount}
              </div>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Outstanding performance! You answered all 15 questions correctly!
              </p>
              <button
                onClick={handleRestart}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-2xl shadow-lg hover:brightness-110 transition cursor-pointer"
              >
                Play Again
              </button>
            </div>
          ) : gameOver ? (
            /* GAME OVER DISPLAY */
            <div className="bg-slate-900 p-8 rounded-3xl border border-rose-500/40 text-center text-white space-y-6 shadow-xl">
              <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
              <h2 className="text-2xl md:text-3xl font-bold text-rose-300">GAME OVER</h2>
              <p className="text-slate-300">
                You walk away with guaranteed earnings of:
              </p>
              <div className="text-3xl md:text-5xl font-black text-amber-400 font-mono">
                {wonAmount}
              </div>
              {currentQuestion && (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-left text-sm max-w-md mx-auto space-y-1">
                  <div className="text-slate-400 text-xs font-semibold">Correct Answer:</div>
                  <div className="text-emerald-400 font-bold">
                    {optionLabels[currentQuestion.correctIndex]}: {currentQuestion.options[currentQuestion.correctIndex]}
                  </div>
                </div>
              )}
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            /* ACTIVE QUESTION CARD */
            <div className="bg-slate-900 border border-indigo-900/60 p-6 md:p-8 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
              {/* Question Header Badge */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wide">
                  Question for {currentLadder.amount}
                </span>
                <span className="text-slate-400 font-mono">Level {currentLevelIndex + 1} of 15</span>
              </div>

              {/* Question Text Box */}
              <div className="bg-slate-950/90 border-2 border-indigo-500/40 p-6 rounded-2xl text-center shadow-inner">
                {currentQuestion ? (
                  <h3 className="text-lg md:text-2xl font-bold text-slate-100 leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                ) : (
                  <div className="text-amber-300 font-semibold py-4">
                    No question configured for {currentLadder.amount}. Please add one in setup!
                  </div>
                )}
              </div>

              {/* 4 Option Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion?.options.map((option, idx) => {
                  const label = optionLabels[idx];
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const isEliminated = eliminatedOptions.includes(idx);

                  let optionStyle =
                    'border-indigo-500/30 bg-slate-950/80 text-slate-200 hover:border-amber-400 hover:bg-indigo-950/60';

                  if (isEliminated) {
                    optionStyle = 'border-slate-800 bg-slate-950/30 text-slate-700 cursor-not-allowed opacity-30';
                  } else if (isSelected && !isRevealed) {
                    optionStyle =
                      'border-amber-400 bg-amber-500/20 text-amber-200 font-bold ring-2 ring-amber-400/50 animate-pulse';
                  } else if (isRevealed) {
                    if (isCorrect) {
                      optionStyle =
                        'border-emerald-400 bg-emerald-500/30 text-emerald-200 font-bold ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-500/30 text-rose-200 font-bold';
                    } else {
                      optionStyle = 'border-slate-800 bg-slate-950/40 text-slate-600 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isEliminated || isLockedIn || isRevealed}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left relative group cursor-pointer ${optionStyle}`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black flex items-center justify-center shrink-0 text-sm">
                        {label}
                      </span>
                      <span className="flex-1 text-sm md:text-base font-medium">
                        {isEliminated ? '— — —' : option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Lock-in or Proceed */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
                {!isRevealed ? (
                  <button
                    onClick={handleLockIn}
                    disabled={selectedOption === null || isLockedIn || !currentQuestion}
                    className={`w-full py-4 rounded-xl font-black tracking-wide text-sm md:text-base uppercase transition shadow-lg ${
                      selectedOption !== null && !isLockedIn && currentQuestion
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 shadow-amber-500/20 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isLockedIn ? 'Checking Answer...' : 'Final Answer'}
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between gap-4">
                    {currentQuestion && selectedOption === currentQuestion.correctIndex ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" /> Correct! Moving to next tier.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                        <XCircle className="w-5 h-5" /> Incorrect answer.
                      </div>
                    )}

                    {currentQuestion && selectedOption === currentQuestion.correctIndex && (
                      <button
                        onClick={handleNextLevel}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-md cursor-pointer"
                      >
                        Next Question →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right col: Money Ladder Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-white flex flex-col justify-between shadow-lg">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 px-2 border-b border-slate-800 pb-2">
              Money Ladder Tiers
            </h4>

            <div className="space-y-1">
              {MONEY_LADDER.map((item) => {
                const isCurrent = item.level === currentLevelIndex + 1;
                const isPassed = item.level <= currentLevelIndex;

                let rowStyle = 'text-slate-400 opacity-70';
                if (isCurrent) {
                  rowStyle = 'bg-amber-500 text-slate-950 font-black rounded-lg shadow-md';
                } else if (isPassed) {
                  rowStyle = 'text-amber-300 font-semibold';
                } else if (item.safe) {
                  rowStyle = 'text-white font-bold';
                }

                return (
                  <div
                    key={item.level}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs font-mono transition-all ${rowStyle}`}
                  >
                    <span className="w-6">{item.level}</span>
                    <span className="flex-1 text-right tracking-wide">
                      {item.amount}
                    </span>
                    {item.safe && !isCurrent && (
                      <span className="ml-2 text-[10px] text-amber-400 font-sans uppercase">SAFE</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Safe Havens at ₱5k, ₱50k, ₱1M
          </div>
        </div>
      </div>

      {/* Audience Vote Modal */}
      {activeLifelineModal === 'audience' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 text-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                <Users className="w-5 h-5" /> Ask the Class Results
              </h3>
              <button
                onClick={() => setActiveLifelineModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {optionLabels.map((lbl, idx) => {
                const pct = audienceVotes[idx] || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>
                        Option {lbl}: {currentQuestion?.options[idx]}
                      </span>
                      <span className="text-amber-300">{pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveLifelineModal(null)}
              className="w-full py-2.5 bg-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-700 cursor-pointer"
            >
              Back to Game
            </button>
          </div>
        </div>
      )}

      {/* Phone a Friend / Hint Modal */}
      {activeLifelineModal === 'phone' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 text-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                <Phone className="w-5 h-5" /> Teacher / Expert Lifeline Hint
              </h3>
              <button
                onClick={() => setActiveLifelineModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-indigo-950/60 border border-indigo-800 rounded-xl text-sm italic text-indigo-200">
              "{currentQuestion?.explanation || `I'm fairly confident the answer is choice ${optionLabels[currentQuestion?.correctIndex || 0]}. Good luck!`}"
            </div>

            <button
              onClick={() => setActiveLifelineModal(null)}
              className="w-full py-2.5 bg-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-700 cursor-pointer"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Render Add/Edit Question Modal */}
      {showQuestionModal && renderQuestionModal()}
    </div>
  );
};
