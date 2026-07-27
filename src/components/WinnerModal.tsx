import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Trash2, CheckCircle, Sparkles } from 'lucide-react';
import { playFanfareSound } from '../lib/audio';

interface WinnerModalProps {
  winnerName: string | null;
  onClose: () => void;
  onRemoveWinner: (name: string) => void;
  onKeepWinner: () => void;
  soundEnabled: boolean;
  soundVolume: number;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winnerName,
  onClose,
  onRemoveWinner,
  onKeepWinner,
  soundEnabled,
  soundVolume,
}) => {
  useEffect(() => {
    if (winnerName) {
      if (soundEnabled) {
        playFanfareSound(soundVolume);
      }

      // Fire celebratory confetti bursts
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.6 },
          zIndex: 9999,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  }, [winnerName, soundEnabled, soundVolume]);

  if (!winnerName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center transform animate-in zoom-in-95 duration-200">
        {/* Top visual banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 shadow-inner ring-2 ring-white/30">
              <Trophy className="w-9 h-9 text-amber-300 drop-shadow-md animate-bounce" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-100 bg-white/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>We Have A Winner!</span>
            </div>
          </div>
        </div>

        {/* Winner Name Box */}
        <div className="p-8 space-y-6">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Selected Student
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
              {winnerName}
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            What would you like to do with this student's name for the remaining spins?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onRemoveWinner(winnerName);
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800/80 rounded-xl transition-all shadow-xs"
            >
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Remove Name from Wheel (Temporarily)
            </button>

            <button
              onClick={() => {
                onKeepWinner();
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] rounded-xl shadow-md transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Keep Name in Wheel & Spin Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
