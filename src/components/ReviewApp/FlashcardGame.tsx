import React, { useState, useEffect, useRef } from 'react';
import { ReviewSet, ReviewQuestion } from '../../types';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  Check,
  Play,
  Pause,
  Award,
  BookOpen,
  Volume2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardGameProps {
  reviewSet: ReviewSet;
  reviewSets?: ReviewSet[];
  activeSetId?: string;
  onSelectSet?: (setId: string) => void;
  onUpdateReviewSet?: (updatedSet: ReviewSet) => void;
  onEditSet?: () => void;
}

export const FlashcardGame: React.FC<FlashcardGameProps> = ({
  reviewSet,
  reviewSets = [],
  activeSetId,
  onSelectSet,
  onUpdateReviewSet,
  onEditSet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Deck states
  const [deck, setDeck] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [needsReviewIds, setNeedsReviewIds] = useState<Set<string>>(new Set());

  // Slideshow Auto Play
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(5); // seconds
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Question Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ReviewQuestion | null>(null);
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'average' | 'difficult'>('easy');

  // Initialize deck from review set
  useEffect(() => {
    setDeck(reviewSet.questions || []);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [reviewSet]);

  // Handle Fullscreen toggle listener
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
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMarkMastered();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMarkNeedsReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, currentIndex, masteredIds]);

  // Slideshow auto play effect
  useEffect(() => {
    if (isAutoPlaying && deck.length > 0) {
      autoPlayTimerRef.current = setInterval(() => {
        setIsFlipped((flipped) => {
          if (!flipped) {
            return true; // Reveal answer
          } else {
            handleNextCard(); // Move to next card and unflip
            return false;
          }
        });
      }, (slideshowSpeed * 1000) / 2);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, slideshowSpeed, deck, currentIndex]);

  const currentQuestion = deck[currentIndex];

  const handleNextCard = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrevCard = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    if (deck.length <= 1) return;
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleResetDeck = () => {
    setIsFlipped(false);
    setMasteredIds(new Set());
    setNeedsReviewIds(new Set());
    setDeck(reviewSet.questions || []);
    setCurrentIndex(0);
  };

  const handleMarkMastered = () => {
    if (!currentQuestion) return;
    const newMastered = new Set(masteredIds);
    newMastered.add(currentQuestion.id);
    setMasteredIds(newMastered);

    const newNeeds = new Set(needsReviewIds);
    newNeeds.delete(currentQuestion.id);
    setNeedsReviewIds(newNeeds);

    // Trigger celebratory confetti if all cards mastered!
    if (newMastered.size === deck.length && deck.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    handleNextCard();
  };

  const handleMarkNeedsReview = () => {
    if (!currentQuestion) return;
    const newNeeds = new Set(needsReviewIds);
    newNeeds.add(currentQuestion.id);
    setNeedsReviewIds(newNeeds);

    const newMastered = new Set(masteredIds);
    newMastered.delete(currentQuestion.id);
    setMasteredIds(newMastered);

    handleNextCard();
  };

  // Open Edit/Add Modal
  const handleOpenEditModal = (q?: ReviewQuestion) => {
    if (q) {
      setEditingQuestion(q);
      setQText(q.question);
      setOptA(q.options[0] || '');
      setOptB(q.options[1] || '');
      setOptC(q.options[2] || '');
      setOptD(q.options[3] || '');
      setCorrectIdx(q.correctIndex || 0);
      setExplanation(q.explanation || '');
      setDifficulty(q.difficulty || 'easy');
    } else {
      setEditingQuestion(null);
      setQText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectIdx(0);
      setExplanation('');
      setDifficulty('easy');
    }
    setShowEditModal(true);
  };

  const handleSaveQuestion = () => {
    if (!qText.trim() || !onUpdateReviewSet) return;

    const options = [optA.trim(), optB.trim(), optC.trim(), optD.trim()].filter(Boolean);
    const finalOptions = options.length > 0 ? options : ['True', 'False'];

    let updatedQuestions: ReviewQuestion[];
    if (editingQuestion) {
      updatedQuestions = reviewSet.questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              question: qText.trim(),
              options: finalOptions,
              correctIndex: Math.min(correctIdx, finalOptions.length - 1),
              explanation: explanation.trim(),
              difficulty,
            }
          : q
      );
    } else {
      const newQ: ReviewQuestion = {
        id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        question: qText.trim(),
        options: finalOptions,
        correctIndex: Math.min(correctIdx, finalOptions.length - 1),
        explanation: explanation.trim(),
        difficulty,
      };
      updatedQuestions = [...reviewSet.questions, newQ];
    }

    onUpdateReviewSet({
      ...reviewSet,
      questions: updatedQuestions,
      updatedAt: Date.now(),
    });

    setShowEditModal(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!onUpdateReviewSet) return;
    const updated = reviewSet.questions.filter((q) => q.id !== qId);
    onUpdateReviewSet({
      ...reviewSet,
      questions: updated,
      updatedAt: Date.now(),
    });
  };

  // Text-To-Speech Read Aloud
  const handleSpeakText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const isCurrentMastered = currentQuestion ? masteredIds.has(currentQuestion.id) : false;
  const isCurrentNeedsReview = currentQuestion ? needsReviewIds.has(currentQuestion.id) : false;

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${
        isFullscreen ? 'bg-slate-950 p-6 overflow-y-auto' : 'space-y-6'
      }`}
    >
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Interactive Flashcard Deck
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Flashcard Study Deck
            </h1>
            <p className="text-xs text-slate-400">
              Click or press Space to flip the card and reveal the answer.
            </p>
          </div>
        </div>

        {/* Top Controls & Fullscreen */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenEditModal()}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Flashcard
          </button>

          {onEditSet && (
            <button
              onClick={onEditSet}
              className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> Question Bank
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MASTERY & PROGRESS TRACKER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs font-bold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Mastered:</span>
            <span className="text-emerald-400 font-mono text-sm">{masteredIds.size}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-400">Needs Review:</span>
            <span className="text-rose-400 font-mono text-sm">{needsReviewIds.size}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-600" />
            <span className="text-slate-400">Unseen / Remaining:</span>
            <span className="text-slate-200 font-mono text-sm">
              {Math.max(0, deck.length - (masteredIds.size + needsReviewIds.size))}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-xs flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{
                width: `${deck.length > 0 ? (masteredIds.size / deck.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {deck.length > 0 ? Math.round((masteredIds.size / deck.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* MAIN FLASHCARD STAGE */}
      {deck.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <Layers className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-2xl font-black text-white">No Flashcards Available</h2>
          <p className="text-sm text-slate-400">
            There are no flashcards in this category filter. Try changing the difficulty or add new flashcards.
          </p>
          <button
            onClick={() => handleOpenEditModal()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl transition cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add First Flashcard
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Card Counter & Status Badge */}
          <div className="flex items-center justify-between text-xs px-2">
            <span className="font-mono font-bold text-slate-400">
              CARD <strong className="text-amber-400 text-sm">{currentIndex + 1}</strong> OF{' '}
              {deck.length}
            </span>

            <div className="flex items-center gap-2">
              {isCurrentMastered && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold uppercase tracking-wide text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                </span>
              )}
              {isCurrentNeedsReview && (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold uppercase tracking-wide text-[10px] flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Needs Practice
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono font-bold uppercase text-[10px]">
                {currentQuestion.difficulty || 'easy'}
              </span>
            </div>
          </div>

          {/* 3D FLIPPABLE FLASHCARD CONTAINER */}
          <div
            className="perspective-1000 min-h-[360px] md:min-h-[420px] cursor-pointer group"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped((prev) => !prev)}
          >
            <div
              className="relative w-full h-full min-h-[360px] md:min-h-[420px] rounded-3xl transition-transform duration-500 shadow-2xl"
              style={{
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT SIDE (QUESTION) */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-slate-700 hover:border-indigo-500/60 rounded-3xl p-8 md:p-10 flex flex-col justify-between text-slate-100 shadow-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Front Top Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-4">
                  <span className="font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Question / Prompt
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleSpeakText(currentQuestion.question, e)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(currentQuestion);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
                      title="Edit Question"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Question Text */}
                <div className="my-auto py-6 space-y-6 text-center">
                  <h2 className="text-xl md:text-3xl font-black text-white leading-relaxed max-w-2xl mx-auto">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Front Bottom Prompt */}
                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-mono text-indigo-300">
                    <RotateCw className="w-4 h-4 animate-spin-slow" /> Click or press Space to reveal answer
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">FRONT</span>
                </div>
              </div>

              {/* BACK SIDE (ANSWER & REASONING) */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-8 md:p-10 flex flex-col justify-between text-slate-100 shadow-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  WebkitTransform: 'rotateY(180deg)',
                }}
              >
                {/* Back Top Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-4">
                  <span className="font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) =>
                        handleSpeakText(
                          currentQuestion.options[currentQuestion.correctIndex] || 'Correct',
                          e
                        )
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Read Answer Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Answer Reveal Display */}
                <div className="my-auto py-6 space-y-5 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Answer
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black text-emerald-300 tracking-tight leading-tight drop-shadow-md max-w-2xl mx-auto">
                    {currentQuestion.options && currentQuestion.options.length > currentQuestion.correctIndex
                      ? currentQuestion.options[currentQuestion.correctIndex]
                      : 'Answer Revealed'}
                  </h3>

                  {/* Explanation box */}
                  {currentQuestion.explanation && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-xl mx-auto text-xs md:text-sm text-slate-300 text-left space-y-1">
                      <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
                        Explanation:
                      </span>
                      <p className="leading-relaxed">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Back Bottom Prompt */}
                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400">
                    <RotateCw className="w-4 h-4" /> Click again to flip back
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">BACK</span>
                </div>
              </div>
            </div>
          </div>

          {/* MASTERY RATING & NAVIGATION CONTROLS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            {/* Immediate Self-Assessment Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleMarkNeedsReview}
                className="py-3 px-4 rounded-2xl bg-slate-950 hover:bg-rose-950/50 border border-rose-500/30 text-rose-300 font-black text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:border-rose-500"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Need Practice (Down)</span>
              </button>

              <button
                onClick={handleMarkMastered}
                className="py-3 px-4 rounded-2xl bg-slate-950 hover:bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-black text-xs md:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:border-emerald-500"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Got It Right! (Up)</span>
              </button>
            </div>

            {/* Deck Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevCard}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                <button
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" /> Flip Card
                </button>

                <button
                  onClick={handleNextCard}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
                  title="Shuffle Deck"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Slideshow Auto-Play */}
                <button
                  onClick={() => setIsAutoPlaying((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isAutoPlaying
                      ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Auto Play Slideshow"
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoPlaying ? 'Pause Slideshow' : 'Auto Play'}</span>
                </button>

                <button
                  onClick={handleResetDeck}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Reset Deck Progress"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FLASHCARD MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-400" />
                {editingQuestion ? 'Edit Flashcard' : 'Add New Flashcard'}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Question / Prompt *</label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the question or concept..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Difficulty</label>
                <div className="flex gap-2">
                  {(['easy', 'average', 'difficult'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-2 rounded-xl font-bold uppercase transition cursor-pointer ${
                        difficulty === diff
                          ? 'bg-indigo-600 text-white font-black'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-bold">Answer Options (Optional for Multiple Choice)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'A', val: optA, set: setOptA },
                    { label: 'B', val: optB, set: setOptB },
                    { label: 'C', val: optC, set: setOptC },
                    { label: 'D', val: optD, set: setOptD },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectIdx(idx)}
                        className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition cursor-pointer shrink-0 ${
                          correctIdx === idx
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                        title="Mark as correct answer"
                      >
                        {item.label}
                      </button>
                      <input
                        type="text"
                        value={item.val}
                        onChange={(e) => item.set(e.target.value)}
                        placeholder={`Option ${item.label}`}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Click option letter (A, B, C, D) to set as the correct answer.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Explanation / Rationale (Optional)</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {editingQuestion ? (
                <button
                  onClick={() => {
                    handleDeleteQuestion(editingQuestion.id);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={!qText.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  Save Flashcard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
