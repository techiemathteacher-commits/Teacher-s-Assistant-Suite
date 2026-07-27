import React, { useState, useEffect, useRef } from 'react';
import { ReviewSet, ReviewQuestion, QuizBeeTeam, Student } from '../../types';
import {
  Trophy,
  Plus,
  Minus,
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Eye,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Pencil,
  Trash2,
  Clock,
  ArrowLeft,
  X,
  Check,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizBeeAppProps {
  reviewSet: ReviewSet;
  reviewSets?: ReviewSet[];
  activeSetId?: string;
  onSelectSet?: (setId: string) => void;
  onUpdateReviewSet?: (updatedSet: ReviewSet) => void;
  students?: Student[];
  onEditSet?: () => void;
}

const DEFAULT_TEAMS: QuizBeeTeam[] = [
  { id: 'team-1', name: 'Team Alpha', color: 'bg-indigo-600', score: 0 },
  { id: 'team-2', name: 'Team Beta', color: 'bg-emerald-600', score: 0 },
  { id: 'team-3', name: 'Team Gamma', color: 'bg-amber-600', score: 0 },
  { id: 'team-4', name: 'Team Delta', color: 'bg-rose-600', score: 0 },
];

export interface CategoryRule {
  timeLimit: number; // seconds
  points: number; // base points
}

export const QuizBeeApp: React.FC<QuizBeeAppProps> = ({
  reviewSet,
  reviewSets = [],
  activeSetId,
  onSelectSet,
  onUpdateReviewSet,
  students = [],
  onEditSet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Category Configuration Rules (Time & Points)
  const [categoryRules, setCategoryRules] = useState<Record<string, CategoryRule>>({
    easy: { timeLimit: 30, points: 10 },
    average: { timeLimit: 45, points: 20 },
    difficult: { timeLimit: 60, points: 30 },
    all: { timeLimit: 30, points: 10 },
  });

  // Teams State
  const [teams, setTeams] = useState<QuizBeeTeam[]>(DEFAULT_TEAMS);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [showTeamsMenu, setShowTeamsMenu] = useState<boolean>(false);
  const [showQuestionsMenu, setShowQuestionsMenu] = useState<boolean>(false);
  const [showLiveTimeSettings, setShowLiveTimeSettings] = useState<boolean>(false);

  // Active Category & Navigation
  const [activeRound, setActiveRound] = useState<'easy' | 'average' | 'difficult' | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Modal for Editing / Adding Question
  const [editingQuestion, setEditingQuestion] = useState<ReviewQuestion | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState<boolean>(false);
  const [questionFormData, setQuestionFormData] = useState<{
    question: string;
    options: string[];
    correctIndex: number;
    difficulty: 'easy' | 'average' | 'difficult';
    points: number;
    explanation: string;
  }>({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    difficulty: 'easy',
    points: 10,
    explanation: '',
  });

  // Modal or inline for Direct Score Editing
  const [editingScoreTeam, setEditingScoreTeam] = useState<{
    id: string;
    name: string;
    score: number;
  } | null>(null);

  // Fullscreen listener
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
        containerRef.current.requestFullscreen().catch(() => setIsFullscreen(true));
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

  // Filter questions according to active round
  const filteredQuestions = React.useMemo(() => {
    if (activeRound === 'all') return reviewSet.questions;
    return reviewSet.questions.filter((q) => (q.difficulty || 'easy') === activeRound);
  }, [reviewSet, activeRound]);

  const currentQuestion = filteredQuestions[currentIndex];

  // Active category rule
  const currentRule = categoryRules[activeRound] || categoryRules.easy;

  // Reset timer duration whenever active round or question index changes
  useEffect(() => {
    if (gameStarted) {
      const qPoints = currentQuestion?.points;
      const rule = categoryRules[activeRound] || categoryRules.easy;
      setTimeLeft(rule.timeLimit);
      setIsTimerRunning(false);
      setIsRevealed(false);
    }
  }, [activeRound, currentIndex, gameStarted]);

  // Timer Countdown Hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleStartTimer = () => setIsTimerRunning(true);
  const handlePauseTimer = () => setIsTimerRunning(false);
  const handleResetTimer = (sec: number = currentRule.timeLimit) => {
    setIsTimerRunning(false);
    setTimeLeft(sec);
  };

  const handleReveal = () => {
    setIsRevealed(true);
    setIsTimerRunning(false);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
  };

  const handleNextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      handleResetTimer(currentRule.timeLimit);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsRevealed(false);
      handleResetTimer(currentRule.timeLimit);
    }
  };

  // Score adjustments
  const handleAdjustScore = (teamId: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const newScore = Math.max(0, t.score + delta);
          if (delta > 0) {
            confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
          }
          return { ...t, score: newScore };
        }
        return t;
      })
    );
  };

  const handleSetExactScore = (teamId: string, newScore: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, newScore) } : t))
    );
    setEditingScoreTeam(null);
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const colors = [
      'bg-indigo-600',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-purple-600',
      'bg-cyan-600',
    ];
    const newTeam: QuizBeeTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      color: colors[teams.length % colors.length],
      score: 0,
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
  };

  const handleRemoveTeam = (teamId: string) => {
    if (teams.length <= 1) return;
    setTeams(teams.filter((t) => t.id !== teamId));
  };

  const handleResetScores = () => {
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
  };

  // Category Rule Handlers
  const handleUpdateCategoryRule = (
    catKey: 'easy' | 'average' | 'difficult',
    field: 'timeLimit' | 'points',
    val: number
  ) => {
    const num = Math.max(1, val);
    setCategoryRules((prev) => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        [field]: num,
      },
    }));
  };

  // Get Points for active question/category
  const getPointsForCurrentQuestion = () => {
    if (currentQuestion?.points) return currentQuestion.points;
    const cat = currentQuestion?.difficulty || activeRound;
    if (cat === 'difficult') return categoryRules.difficult.points;
    if (cat === 'average') return categoryRules.average.points;
    return categoryRules.easy.points;
  };

  // Question Editing Functions
  const handleOpenEditQuestionModal = (q?: ReviewQuestion) => {
    if (q) {
      setIsNewQuestion(false);
      setEditingQuestion(q);
      setQuestionFormData({
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
        difficulty: q.difficulty || 'easy',
        points: q.points || categoryRules[q.difficulty || 'easy']?.points || 10,
        explanation: q.explanation || '',
      });
    } else {
      setIsNewQuestion(true);
      setEditingQuestion({
        id: `q-${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        difficulty: activeRound === 'all' ? 'easy' : activeRound,
        points: categoryRules[activeRound === 'all' ? 'easy' : activeRound].points,
      });
      setQuestionFormData({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        difficulty: activeRound === 'all' ? 'easy' : activeRound,
        points: categoryRules[activeRound === 'all' ? 'easy' : activeRound].points,
        explanation: '',
      });
    }
  };

  const handleSaveQuestion = () => {
    if (!questionFormData.question.trim()) return;
    if (questionFormData.options.some((opt) => !opt.trim())) return;

    const newQ: ReviewQuestion = {
      id: editingQuestion?.id || `q-${Date.now()}`,
      question: questionFormData.question.trim(),
      options: questionFormData.options.map((o) => o.trim()),
      correctIndex: questionFormData.correctIndex,
      difficulty: questionFormData.difficulty,
      points: Number(questionFormData.points) || 10,
      explanation: questionFormData.explanation.trim() || undefined,
    };

    let updatedQuestions: ReviewQuestion[];
    if (isNewQuestion) {
      updatedQuestions = [...reviewSet.questions, newQ];
    } else {
      updatedQuestions = reviewSet.questions.map((q) => (q.id === newQ.id ? newQ : q));
    }

    const updatedSet = {
      ...reviewSet,
      questions: updatedQuestions,
      updatedAt: Date.now(),
    };

    if (onUpdateReviewSet) {
      onUpdateReviewSet(updatedSet);
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (qId: string) => {
    const updatedQuestions = reviewSet.questions.filter((q) => q.id !== qId);
    const updatedSet = {
      ...reviewSet,
      questions: updatedQuestions,
      updatedAt: Date.now(),
    };
    if (onUpdateReviewSet) {
      onUpdateReviewSet(updatedSet);
    }
  };

  const rankedTeams = [...teams].sort((a, b) => b.score - a.score);
  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  // Count questions per category
  const easyCount = reviewSet.questions.filter((q) => (q.difficulty || 'easy') === 'easy').length;
  const averageCount = reviewSet.questions.filter((q) => q.difficulty === 'average').length;
  const difficultCount = reviewSet.questions.filter((q) => q.difficulty === 'difficult').length;

  return (
    <div
      ref={containerRef}
      className={`space-y-6 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 md:p-8 overflow-y-auto w-screen h-screen text-slate-100'
          : 'max-w-6xl mx-auto'
      }`}
    >
      {/* =========================================================================
          VIEW 1: START GAME / SETUP SCREEN (When !gameStarted)
         ========================================================================= */}
      {!gameStarted ? (
        <div className="space-y-6">
          {/* PROMINENT HERO HEADER WITH MASSIVE START GAME CTA */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-8 md:p-10 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
            <div className="absolute top-4 right-4">
              <button
                onClick={toggleFullscreen}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Fullscreen Mode"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" /> Activity Presenter
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Classroom Quiz Bowl
              </h1>
              <p className="text-sm md:text-base text-slate-300">
                Inter-group review competition with live timers, custom points, and real-time scoreboards.
              </p>
            </div>

            {/* MASSIVE START GAME BUTTON */}
            <div className="pt-2 w-full max-w-md">
              <button
                onClick={() => {
                  setGameStarted(true);
                  setCurrentIndex(0);
                  setIsRevealed(false);
                }}
                disabled={reviewSet.questions.length === 0}
                className="w-full py-6 px-10 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-2xl tracking-wider transition-all duration-200 shadow-2xl shadow-amber-500/40 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-300"
              >
                <Play className="w-8 h-8 fill-slate-950 shrink-0" />
                <span>START GAME</span>
              </button>
              {reviewSet.questions.length === 0 && (
                <p className="text-xs text-rose-400 font-bold mt-2">
                  Please add at least 1 question to start the game.
                </p>
              )}
            </div>

            {/* Quick Summary Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-amber-400">{reviewSet.questions.length}</strong> Questions Ready
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-amber-400">{teams.length}</strong> Participating Teams
              </span>
            </div>
          </div>

          {/* Section 1: CATEGORIES & TIME/POINT RULES */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-amber-300 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Categories & Rules Configuration
                </h2>
                <p className="text-xs text-slate-400">
                  Set the timer duration and point values for each question difficulty category.
                </p>
              </div>

              <div className="text-xs font-bold font-mono text-slate-400 px-3 py-1 rounded-xl bg-slate-800">
                {reviewSet.questions.length} Total Questions
              </div>
            </div>

            {/* 3 Prominent Large Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Easy Category Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="font-black text-lg text-emerald-400 uppercase tracking-wide">
                      Easy Round
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                    {easyCount} Qs
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Time (seconds)
                    </label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Clock className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={categoryRules.easy.timeLimit}
                        onChange={(e) =>
                          handleUpdateCategoryRule('easy', 'timeLimit', Number(e.target.value))
                        }
                        className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                      />
                    </div>
                    {/* Quick Time Presets */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[15, 30, 45, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleUpdateCategoryRule('easy', 'timeLimit', sec)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            categoryRules.easy.timeLimit === sec
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Points Awarded
                    </label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Award className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                      <input
                        type="number"
                        min={1}
                        value={categoryRules.easy.points}
                        onChange={(e) =>
                          handleUpdateCategoryRule('easy', 'points', Number(e.target.value))
                        }
                        className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Category Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="font-black text-lg text-amber-300 uppercase tracking-wide">
                      Average Round
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-mono font-bold">
                    {averageCount} Qs
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Time (seconds)
                    </label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Clock className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={categoryRules.average.timeLimit}
                        onChange={(e) =>
                          handleUpdateCategoryRule('average', 'timeLimit', Number(e.target.value))
                        }
                        className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                      />
                    </div>
                    {/* Quick Time Presets */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[30, 45, 60, 90].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleUpdateCategoryRule('average', 'timeLimit', sec)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            categoryRules.average.timeLimit === sec
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Points Awarded
                    </label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Award className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                      <input
                        type="number"
                        min={1}
                        value={categoryRules.average.points}
                        onChange={(e) =>
                          handleUpdateCategoryRule('average', 'points', Number(e.target.value))
                        }
                        className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficult Category Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="font-black text-lg text-rose-400 uppercase tracking-wide">
                      Difficult Round
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-mono font-bold">
                    {difficultCount} Qs
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Time (seconds)
                    </label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Clock className="w-4 h-4 text-rose-400 mr-2 shrink-0" />
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={categoryRules.difficult.timeLimit}
                        onChange={(e) =>
                          handleUpdateCategoryRule('difficult', 'timeLimit', Number(e.target.value))
                        }
                        className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                      />
                    </div>
                    {/* Quick Time Presets */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[45, 60, 90, 120].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleUpdateCategoryRule('difficult', 'timeLimit', sec)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            categoryRules.difficult.timeLimit === sec
                              ? 'bg-rose-500 text-white font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Points Awarded
                    </label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Award className="w-4 h-4 text-rose-400 mr-2 shrink-0" />
                      <input
                        type="number"
                        min={1}
                        value={categoryRules.difficult.points}
                        onChange={(e) =>
                          handleUpdateCategoryRule('difficult', 'points', Number(e.target.value))
                        }
                        className="w-full bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: COMPACT / COLLAPSIBLE TEAMS & QUESTIONS MENUS */}
          <div className="space-y-4">
            {/* 1. TEAMS MINIMIZED / COLLAPSIBLE PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                      Participating Teams ({teams.length})
                    </h3>
                    {/* Compact Team Pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {teams.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          <span className={`w-2 h-2 rounded-full ${t.color}`} />
                          {t.name}: <strong className="text-amber-400 font-mono">{t.score} PTS</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowTeamsMenu((prev) => !prev)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition border border-slate-700 cursor-pointer flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{showTeamsMenu ? 'Hide Team Settings' : 'Edit Teams & Scores'}</span>
                </button>
              </div>

              {/* Expanded Teams Editor */}
              {showTeamsMenu && (
                <div className="pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
                  <div className="flex justify-end">
                    <button
                      onClick={handleResetScores}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold transition cursor-pointer"
                    >
                      Reset All Scores
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {teams.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${t.color}`} />
                          <input
                            type="text"
                            value={t.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTeams((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, name: val } : item))
                              );
                            }}
                            className="bg-transparent font-bold text-xs text-white focus:outline-none focus:border-b focus:border-amber-400 w-full"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500 font-bold">SCORE:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={t.score}
                              onChange={(e) =>
                                handleSetExactScore(t.id, Number(e.target.value) || 0)
                              }
                              className="w-16 bg-slate-900 border border-slate-700 text-amber-300 text-center font-mono font-bold text-xs rounded-lg py-1 focus:outline-none focus:border-amber-400"
                            />
                            {teams.length > 1 && (
                              <button
                                onClick={() => handleRemoveTeam(t.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                title="Remove team"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Team Input */}
                  <div className="flex gap-2 pt-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Enter new team name..."
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleAddTeam}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Team
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. QUESTIONS MINIMIZED / COLLAPSIBLE PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      Question Deck ({reviewSet.questions.length} Questions)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage or add questions to the active set before playing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditQuestionModal()}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition border border-amber-500/40 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>

                  <button
                    onClick={() => setShowQuestionsMenu((prev) => !prev)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
                  >
                    {showQuestionsMenu ? 'Hide Deck' : 'View / Edit Question Deck'}
                  </button>
                </div>
              </div>

              {/* Expanded Questions Editor */}
              {showQuestionsMenu && (
                <div className="pt-4 border-t border-slate-800 space-y-3 animate-fadeIn">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {reviewSet.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">#{idx + 1}</span>
                          <span className="truncate text-slate-300 font-medium">{q.question}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                            {q.difficulty || 'easy'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditQuestionModal(q)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: LIVE IN-GAME PRESENTATION VIEW (When gameStarted === true)
           ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Bar Header (Minimalist & Clean - NO links/dropdowns to other games) */}
          <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGameStarted(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Setup / Exit Game
              </button>

              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Classroom Quiz Bowl
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Live Competition • {reviewSet.title}
                </p>
              </div>
            </div>

            {/* Toolbar Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
                </span>
              </button>
            </div>
          </div>

          {/* CATEGORY SELECTOR TABS & LIVE TIME CUSTOMIZATION */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Select Category:
                </span>
                <button
                  onClick={() => setShowLiveTimeSettings((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  title="Customize time limit for each category"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showLiveTimeSettings ? 'Close Time Rules' : 'Customize Category Times'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-w-[280px]">
                {/* All Questions */}
                <button
                  onClick={() => {
                    setActiveRound('all');
                    setCurrentIndex(0);
                    setIsRevealed(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    activeRound === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>ALL QUESTIONS</span>
                  <span className="text-[10px] opacity-80 font-mono font-normal">
                    ({reviewSet.questions.length} Qs)
                  </span>
                </button>

                {/* Easy Tab */}
                <button
                  onClick={() => {
                    setActiveRound('easy');
                    setCurrentIndex(0);
                    setIsRevealed(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    activeRound === 'easy'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>EASY ROUND</span>
                  <span className="text-[10px] opacity-80 font-mono font-normal">
                    {categoryRules.easy.timeLimit}s • {categoryRules.easy.points} Pts ({easyCount})
                  </span>
                </button>

                {/* Average Tab */}
                <button
                  onClick={() => {
                    setActiveRound('average');
                    setCurrentIndex(0);
                    setIsRevealed(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    activeRound === 'average'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>AVERAGE ROUND</span>
                  <span className="text-[10px] opacity-80 font-mono font-normal">
                    {categoryRules.average.timeLimit}s • {categoryRules.average.points} Pts ({averageCount})
                  </span>
                </button>

                {/* Difficult Tab */}
                <button
                  onClick={() => {
                    setActiveRound('difficult');
                    setCurrentIndex(0);
                    setIsRevealed(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    activeRound === 'difficult'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>DIFFICULT ROUND</span>
                  <span className="text-[10px] opacity-80 font-mono font-normal">
                    {categoryRules.difficult.timeLimit}s • {categoryRules.difficult.points} Pts ({difficultCount})
                  </span>
                </button>
              </div>
            </div>

            {/* LIVE CATEGORY TIME CUSTOMIZATION PANEL */}
            {showLiveTimeSettings && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Customize Round Durations (Seconds)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Changes apply immediately to live timers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Easy Time */}
                  <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>EASY ROUND</span>
                      <span className="font-mono text-slate-300">{categoryRules.easy.timeLimit}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={categoryRules.easy.timeLimit}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 5);
                          handleUpdateCategoryRule('easy', 'timeLimit', val);
                          if (activeRound === 'easy' || (activeRound === 'all' && currentQuestion?.difficulty === 'easy')) {
                            setTimeLeft(val);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      {[15, 30, 45, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            handleUpdateCategoryRule('easy', 'timeLimit', sec);
                            if (activeRound === 'easy' || (activeRound === 'all' && currentQuestion?.difficulty === 'easy')) {
                              setTimeLeft(sec);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            categoryRules.easy.timeLimit === sec
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Average Time */}
                  <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>AVERAGE ROUND</span>
                      <span className="font-mono text-slate-300">{categoryRules.average.timeLimit}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={categoryRules.average.timeLimit}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 5);
                          handleUpdateCategoryRule('average', 'timeLimit', val);
                          if (activeRound === 'average' || (activeRound === 'all' && currentQuestion?.difficulty === 'average')) {
                            setTimeLeft(val);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      {[30, 45, 60, 90].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            handleUpdateCategoryRule('average', 'timeLimit', sec);
                            if (activeRound === 'average' || (activeRound === 'all' && currentQuestion?.difficulty === 'average')) {
                              setTimeLeft(sec);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            categoryRules.average.timeLimit === sec
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficult Time */}
                  <div className="bg-slate-900 border border-rose-500/30 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                      <span>DIFFICULT ROUND</span>
                      <span className="font-mono text-slate-300">{categoryRules.difficult.timeLimit}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={categoryRules.difficult.timeLimit}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 5);
                          handleUpdateCategoryRule('difficult', 'timeLimit', val);
                          if (activeRound === 'difficult' || (activeRound === 'all' && currentQuestion?.difficulty === 'difficult')) {
                            setTimeLeft(val);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      {[45, 60, 90, 120].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            handleUpdateCategoryRule('difficult', 'timeLimit', sec);
                            if (activeRound === 'difficult' || (activeRound === 'all' && currentQuestion?.difficulty === 'difficult')) {
                              setTimeLeft(sec);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                            categoryRules.difficult.timeLimit === sec
                              ? 'bg-rose-500 text-white font-black'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAIN GAME GRID: Question Presenter & Live Scoreboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Question Presenter */}
            <div className="lg:col-span-2 space-y-6">
              {currentQuestion ? (
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl space-y-6 relative">
                  {/* Meta Bar & Top-Right Compact Timer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                        Question {currentIndex + 1} of {filteredQuestions.length}
                      </span>
                      <span className="font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl uppercase">
                        {currentQuestion.difficulty || activeRound} • +{getPointsForCurrentQuestion()} PTS
                      </span>
                    </div>

                    {/* COMPACT TOP-RIGHT TIMER */}
                    {(() => {
                      const activeCatKey = currentQuestion?.difficulty || (activeRound === 'all' ? 'easy' : activeRound);
                      const activeCatRule = categoryRules[activeCatKey] || categoryRules.easy;
                      return (
                        <div
                          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all shadow-md ${
                            timeLeft === 0
                              ? 'bg-rose-950/90 border-rose-500/80 text-rose-300'
                              : timeLeft <= 5
                              ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <Clock className={`w-4 h-4 shrink-0 ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-400'}`} />

                          {/* Digit Display */}
                          <div className="flex items-baseline gap-1 font-mono">
                            <span
                              className={`font-black text-xl tracking-wide ${
                                timeLeft === 0
                                  ? 'text-rose-400'
                                  : timeLeft <= 5
                                  ? 'text-rose-400'
                                  : 'text-amber-300'
                              }`}
                            >
                              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                              {String(timeLeft % 60).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              / {activeCatRule.timeLimit}s
                            </span>
                          </div>

                          {/* Click Play / Pause Button */}
                          {!isTimerRunning ? (
                            <button
                              onClick={handleStartTimer}
                              disabled={timeLeft === 0}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer disabled:opacity-40 flex items-center gap-1 font-bold text-xs"
                              title="Start Timer"
                            >
                              <Play className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                              <span>Play</span>
                            </button>
                          ) : (
                            <button
                              onClick={handlePauseTimer}
                              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition cursor-pointer flex items-center gap-1 font-bold text-xs"
                              title="Pause Timer"
                            >
                              <Pause className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                              <span>Pause</span>
                            </button>
                          )}

                          {/* Reset Button */}
                          <button
                            onClick={() => handleResetTimer(activeCatRule.timeLimit)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            title="Reset Timer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick +5s Tweak */}
                          <button
                            onClick={() => setTimeLeft((prev) => prev + 5)}
                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono font-bold text-[11px] border border-slate-800 transition cursor-pointer"
                            title="Add 5 seconds"
                          >
                            +5s
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Question Text */}
                  <h3 className="text-xl md:text-3xl font-black text-white leading-snug">
                    {currentQuestion.question}
                  </h3>

                  {/* Choices Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                    {currentQuestion.options.map((opt, idx) => {
                      const label = optionLabels[idx] || `${idx + 1}`;
                      const isCorrect = idx === currentQuestion.correctIndex;

                      let cardStyle =
                        'border-slate-800 bg-slate-950 text-slate-200';

                      if (isRevealed) {
                        if (isCorrect) {
                          cardStyle =
                            'border-emerald-500 bg-emerald-950/80 text-emerald-100 font-bold ring-2 ring-emerald-500/40';
                        } else {
                          cardStyle = 'border-slate-800/50 bg-slate-950/40 text-slate-600 opacity-40';
                        }
                      }

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all ${cardStyle}`}
                        >
                          <span
                            className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                              isRevealed && isCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {label}
                          </span>
                          <span className="text-base font-semibold flex-1 leading-snug">{opt}</span>
                          {isRevealed && isCorrect && (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Reveal & Nav Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReveal}
                        disabled={isRevealed}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg cursor-pointer ${
                          isRevealed
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        {isRevealed ? 'Answer Revealed' : 'Reveal Answer'}
                      </button>

                      <button
                        onClick={() => handleOpenEditQuestionModal(currentQuestion)}
                        className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-slate-700 flex items-center gap-2 cursor-pointer"
                        title="Edit active question"
                      >
                        <Pencil className="w-4 h-4 text-amber-400" /> Edit Question
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentIndex === 0}
                        className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        disabled={currentIndex === filteredQuestions.length - 1}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-950 font-black text-sm hover:bg-amber-100 disabled:opacity-30 transition cursor-pointer"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Explanation note */}
                  {isRevealed && currentQuestion.explanation && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                      <span className="font-bold text-amber-300 block">Explanation / Note:</span>
                      <p className="text-amber-200/90">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                  <Trophy className="w-12 h-12 mx-auto text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-300">
                    No Questions Available in this Category
                  </h3>
                  <button
                    onClick={() => handleOpenEditQuestionModal()}
                    className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
                  >
                    Add Question to Category
                  </button>
                </div>
              )}
            </div>

            {/* Right 1 Col: Live Scoreboard with Direct Score Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="font-black text-amber-300 flex items-center gap-2 text-base">
                    <Award className="w-5 h-5 text-amber-400" /> Live Scoreboard
                  </h2>
                  <button
                    onClick={handleResetScores}
                    className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                  >
                    Reset Scores
                  </button>
                </div>

                {/* Teams List */}
                <div className="space-y-3">
                  {teams.map((team) => {
                    const rankIdx = rankedTeams.findIndex((t) => t.id === team.id);
                    const currentPts = getPointsForCurrentQuestion();

                    return (
                      <div
                        key={team.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                              rankIdx === 0
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                : rankIdx === 1
                                ? 'bg-slate-400 text-slate-950'
                                : rankIdx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            #{rankIdx + 1}
                          </span>

                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-200 truncate">
                              {team.name}
                            </div>
                            <button
                              onClick={() => setEditingScoreTeam(team)}
                              className="text-xs font-mono font-black text-amber-400 hover:underline cursor-pointer"
                              title="Click to manually edit score"
                            >
                              {team.score} PTS ✎
                            </button>
                          </div>
                        </div>

                        {/* Add / Deduct Points */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAdjustScore(team.id, -currentPts)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                            title={`Deduct ${currentPts} pts`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleAdjustScore(team.id, currentPts)}
                            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
                            title={`Add ${currentPts} pts`}
                          >
                            <Plus className="w-3.5 h-3.5" /> +{currentPts}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Team Input */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 block">Add Team:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Team Name..."
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleAddTeam}
                    className="px-3 py-2 bg-slate-800 text-amber-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: EDIT / ADD QUESTION MODAL
         ========================================================================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-400" />
                {isNewQuestion ? 'Add Question' : 'Edit Question'}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Question Prompt
                </label>
                <textarea
                  rows={3}
                  value={questionFormData.question}
                  onChange={(e) =>
                    setQuestionFormData({ ...questionFormData, question: e.target.value })
                  }
                  placeholder="Enter the question prompt here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Options Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Multiple Choice Choices
                </label>
                {questionFormData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionFormData({ ...questionFormData, correctIndex: idx })
                      }
                      className={`w-9 h-9 rounded-xl font-bold text-xs shrink-0 flex items-center justify-center cursor-pointer transition ${
                        questionFormData.correctIndex === idx
                          ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      title={
                        questionFormData.correctIndex === idx
                          ? 'Correct Answer'
                          : 'Mark as Correct Answer'
                      }
                    >
                      {optionLabels[idx]}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...questionFormData.options];
                        newOpts[idx] = e.target.value;
                        setQuestionFormData({ ...questionFormData, options: newOpts });
                      }}
                      placeholder={`Choice ${optionLabels[idx]}`}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>

              {/* Difficulty & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Difficulty Category
                  </label>
                  <select
                    value={questionFormData.difficulty}
                    onChange={(e) => {
                      const diff = e.target.value as 'easy' | 'average' | 'difficult';
                      setQuestionFormData({
                        ...questionFormData,
                        difficulty: diff,
                        points: categoryRules[diff]?.points || 10,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="easy">Easy Round</option>
                    <option value="average">Average Round</option>
                    <option value="difficult">Difficult Round</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Question Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={questionFormData.points}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        points: Number(e.target.value) || 10,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Explanation Note */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Explanation / Answer Key Note (Optional)
                </label>
                <input
                  type="text"
                  value={questionFormData.explanation}
                  onChange={(e) =>
                    setQuestionFormData({ ...questionFormData, explanation: e.target.value })
                  }
                  placeholder="e.g. Reference formula or textbook page..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {!isNewQuestion && (
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteQuestion(editingQuestion.id);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-400 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Question
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DIRECT SCORE EDIT MODAL
         ========================================================================= */}
      {editingScoreTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-amber-300 text-base">
                Set Score for {editingScoreTeam.name}
              </h3>
              <button
                onClick={() => setEditingScoreTeam(null)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">New Total Score:</label>
              <input
                type="number"
                min={0}
                value={editingScoreTeam.score}
                onChange={(e) =>
                  setEditingScoreTeam({ ...editingScoreTeam, score: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-2xl font-black text-amber-300 text-center focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingScoreTeam(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSetExactScore(editingScoreTeam.id, editingScoreTeam.score)
                }
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
              >
                Set Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
