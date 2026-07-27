import React, { useState } from 'react';
import { ReviewSet, ReviewQuestion } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Shuffle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TraditionalReviewerProps {
  reviewSet: ReviewSet;
  onEditSet?: () => void;
}

export const TraditionalReviewer: React.FC<TraditionalReviewerProps> = ({
  reviewSet,
  onEditSet,
}) => {
  const [questions, setQuestions] = useState<ReviewQuestion[]>(reviewSet.questions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [answeredMap, setAnsweredMap] = useState<Record<number, { selected: number; correct: boolean }>>({});

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isRevealed) return;
    setSelectedOption(index);
  };

  const handleReveal = () => {
    if (!currentQuestion) return;
    setIsRevealed(true);
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    if (selectedOption !== null && !answeredMap[currentIndex]) {
      setAnsweredMap((prev) => ({
        ...prev,
        [currentIndex]: { selected: selectedOption, correct: isCorrect },
      }));
      if (isCorrect) {
        setUserScore((prev) => prev + 1);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsRevealed(!!answeredMap[nextIdx]);
      setSelectedOption(answeredMap[nextIdx]?.selected ?? null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsRevealed(!!answeredMap[prevIdx]);
      setSelectedOption(answeredMap[prevIdx]?.selected ?? null);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsRevealed(false);
    setAnsweredMap({});
    setUserScore(0);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsRevealed(false);
    setAnsweredMap({});
    setUserScore(0);
  };

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">No Questions in this Review Set</h3>
        <p className="text-sm text-slate-500 mb-4">Add questions using the Question Bank Editor to start reviewing.</p>
        {onEditSet && (
          <button
            onClick={onEditSet}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
          >
            Edit Questions
          </button>
        )}
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Score: <strong className="text-emerald-600 dark:text-emerald-400">{userScore}</strong> / {Object.keys(answeredMap).length} Answered
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Shuffle Questions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>

          <button
            onClick={handleReset}
            title="Reset Quiz Session"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          {onEditSet && (
            <button
              onClick={onEditSet}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-indigo-200 dark:border-indigo-800/60"
            >
              Edit Questions
            </button>
          )}
        </div>
      </div>

      {/* Main Single Question Display */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
        {/* Category & Difficulty Header */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {currentQuestion.category && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium text-slate-600 dark:text-slate-300">
                {currentQuestion.category}
              </span>
            )}
            {currentQuestion.difficulty && (
              <span
                className={`px-2.5 py-1 rounded-md font-semibold capitalize ${
                  currentQuestion.difficulty === 'easy'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : currentQuestion.difficulty === 'average'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            )}
          </div>

          <span className="font-mono text-slate-400">
            #{currentIndex + 1}
          </span>
        </div>

        {/* Question Prompt */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {currentQuestion.question}
        </h2>

        {/* Multiple Choice Options List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const label = optionLabels[idx] || `${idx + 1}`;
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let buttonStyle =
              'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20';

            if (isSelected && !isRevealed) {
              buttonStyle =
                'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/30 font-medium';
            }

            if (isRevealed) {
              if (isCorrect) {
                buttonStyle =
                  'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-semibold ring-2 ring-emerald-500/40';
              } else if (isSelected && !isCorrect) {
                buttonStyle =
                  'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 line-through opacity-80';
              } else {
                buttonStyle =
                  'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isRevealed}
                className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all text-left group ${buttonStyle}`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isRevealed && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : isRevealed && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 group-hover:border-indigo-400'
                  }`}
                >
                  {label}
                </span>

                <span className="flex-1 text-base leading-snug">{option}</span>

                {isRevealed && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {isRevealed && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls & Reveal Button */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleReveal}
            disabled={isRevealed}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
              isRevealed
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-600/20'
            }`}
          >
            <Eye className="w-4 h-4" />
            {isRevealed ? 'Answer Revealed' : 'Reveal Correct Answer'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-sm font-medium transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 text-sm transition shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Answer Explanation Box (Shown when revealed) */}
        {isRevealed && currentQuestion.explanation && (
          <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-sm space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Teacher's Explanation / Answer Key:
            </div>
            <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Questions Navigation Dots Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center flex-wrap gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const status = answeredMap[idx];

          let dotClass =
            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700';

          if (status?.correct) {
            dotClass = 'bg-emerald-500 text-white font-bold';
          } else if (status && !status.correct) {
            dotClass = 'bg-rose-500 text-white font-bold';
          } else if (isCurrent) {
            dotClass = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-500/40';
          }

          return (
            <button
              key={q.id || idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsRevealed(!!answeredMap[idx]);
                setSelectedOption(answeredMap[idx]?.selected ?? null);
              }}
              className={`w-9 h-9 rounded-lg text-xs font-mono transition-all flex items-center justify-center ${dotClass}`}
              title={`Go to Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
