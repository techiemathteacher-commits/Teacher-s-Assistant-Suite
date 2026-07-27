import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Student, WheelSettings } from '../types';
import { WinnerModal } from './WinnerModal';
import { playTickSound } from '../lib/audio';
import {
  RotateCw,
  Shuffle,
  RotateCcw,
  UserPlus,
  CheckSquare,
  Square,
  Users,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface WheelOfNamesProps {
  students: Student[];
  settings: WheelSettings;
  className: string;
}

// Slice color palette (vibrant classroom colors)
const SLICE_COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#84CC16', // Lime
];

export const WheelOfNames: React.FC<WheelOfNamesProps> = ({
  students,
  settings,
  className,
}) => {
  // Session state: active included student list for wheel
  const [activeStudents, setActiveStudents] = useState<Student[]>([]);
  const [removedStudents, setRemovedStudents] = useState<Student[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  // Quick name adding input
  const [quickName, setQuickName] = useState('');

  // Spinning state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0); // in radians
  const [winnerName, setWinnerName] = useState<string | null>(null);

  // Sound toggle on-the-fly
  const [muted, setMuted] = useState(!settings.soundEnabled);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSliceIndexRef = useRef<number>(-1);

  // Sync state when class or student roster changes
  useEffect(() => {
    const active = students.filter((s) => s.active);
    setActiveStudents(active);
    setRemovedStudents([]);
    setExcludedIds(new Set());
  }, [students]);

  // Filter students that are currently ON the wheel
  const wheelStudents = activeStudents.filter((s) => !excludedIds.has(s.id));

  // Draw wheel function
  const drawWheel = useCallback(
    (currentAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const outerRadius = Math.min(centerX, centerY) - 20;
      const innerRadius = 40;

      ctx.clearRect(0, 0, width, height);

      const totalSlices = wheelStudents.length;

      if (totalSlices === 0) {
        // Empty state canvas drawing
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#F1F5F9';
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.fillText('No active students on wheel', centerX, centerY);
        return;
      }

      const sliceAngle = (2 * Math.PI) / totalSlices;

      // Draw Slices
      for (let i = 0; i < totalSlices; i++) {
        const startAngle = currentAngle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';

        // Scale font size based on slice count
        let fontSize = 16;
        if (totalSlices > 25) fontSize = 11;
        else if (totalSlices > 15) fontSize = 13;

        ctx.font = `bold ${fontSize}px sans-serif`;

        // Truncate long names if needed
        const name = wheelStudents[i].name;
        const maxTextWidth = outerRadius - innerRadius - 15;
        ctx.fillText(name, outerRadius - 15, 0, maxTextWidth);

        ctx.restore();
      }

      // Draw Center Pin / Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#4F46E5';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPIN', centerX, centerY);

      // Draw Pointer Indicator at Top (12 o'clock = -90 deg = 1.5 * PI)
      const pointerY = centerY - outerRadius - 5;
      ctx.beginPath();
      ctx.moveTo(centerX - 16, pointerY - 18);
      ctx.lineTo(centerX + 16, pointerY - 18);
      ctx.lineTo(centerX, pointerY + 12);
      ctx.closePath();

      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();
    },
    [wheelStudents]
  );

  // Re-draw wheel on rotation change or resize
  useEffect(() => {
    drawWheel(rotationAngle);
  }, [rotationAngle, drawWheel]);

  // Spin Trigger Function
  const spinWheel = () => {
    if (isSpinning || wheelStudents.length === 0) return;

    setIsSpinning(true);
    setWinnerName(null);

    const duration = (settings.spinDuration || 5) * 1000;
    const startTime = performance.now();
    const totalSlices = wheelStudents.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    // Determine random winning index
    const winningIndex = Math.floor(Math.random() * totalSlices);

    // Center of pointer is at top (-PI/2 = 1.5 * PI = 4.71239 rad)
    // Formula for target angle so pointer lands on winning slice:
    // angle = 1.5 * PI - (winningIndex + 0.5) * sliceAngle
    const targetSliceCenter = 1.5 * Math.PI - (winningIndex + 0.5) * sliceAngle;

    // Add 6 to 10 full random extra rotations
    const extraTurns = Math.floor(Math.random() * 4) + 6;
    const targetAngle = rotationAngle + extraTurns * 2 * Math.PI + (targetSliceCenter - (rotationAngle % (2 * Math.PI)));

    const startAngle = rotationAngle;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic easing out: smooth deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentAngle = startAngle + (targetAngle - startAngle) * easeOut(progress);

      setRotationAngle(currentAngle);

      // Sound effect trigger when pointer crosses slice boundary
      if (!muted) {
        // Calculate current slice under top pointer (1.5 * PI)
        const normalizedAngle = (1.5 * Math.PI - (currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const currentSliceIndex = Math.floor(normalizedAngle / sliceAngle) % totalSlices;

        if (currentSliceIndex !== lastSliceIndexRef.current) {
          lastSliceIndexRef.current = currentSliceIndex;
          playTickSound(settings.volume);
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winner = wheelStudents[winningIndex];
        setWinnerName(winner.name);

        if (settings.autoRemoveWinner) {
          handleRemoveWinner(winner.name);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Keyboard shortcut listener (Spacebar / Enter to spin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        spinWheel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, wheelStudents, rotationAngle]);

  // Remove winner from current wheel
  const handleRemoveWinner = (name: string) => {
    const student = activeStudents.find((s) => s.name === name);
    if (student) {
      setExcludedIds((prev) => new Set(prev).add(student.id));
      setRemovedStudents((prev) => [student, ...prev]);
    }
  };

  // Restore all removed students back to wheel
  const handleRestoreAll = () => {
    setExcludedIds(new Set());
    setRemovedStudents([]);
  };

  // Toggle student inclusion
  const toggleStudent = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Shuffle students order on wheel
  const handleShuffle = () => {
    const shuffled = [...activeStudents].sort(() => Math.random() - 0.5);
    setActiveStudents(shuffled);
  };

  // Quick Add student to active wheel session
  const handleAddQuickStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newStudent: Student = {
      id: `temp-${Date.now()}`,
      name: quickName.trim(),
      active: true,
    };

    setActiveStudents((prev) => [...prev, newStudent]);
    setQuickName('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 w-full max-w-7xl mx-auto">
      {/* LEFT COLUMN: Interactive Wheel Canvas */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-between">
        <div className="w-full flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Wheel of Names
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {className} • {wheelStudents.length} names on wheel
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={muted ? 'Unmute Spin Sound' : 'Mute Spin Sound'}
            >
              {muted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-indigo-500" />}
            </button>
            <button
              onClick={handleShuffle}
              disabled={isSpinning || wheelStudents.length <= 1}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Shuffle wheel order"
            >
              <Shuffle className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          </div>
        </div>

        {/* Wheel Canvas Container */}
        <div className="relative my-4 flex items-center justify-center w-full max-w-[450px] aspect-square">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="w-full h-full object-contain cursor-pointer transition-transform"
            onClick={spinWheel}
          />
        </div>

        {/* Big Spin Action Button */}
        <div className="w-full flex flex-col items-center gap-2 mt-2">
          <button
            onClick={spinWheel}
            disabled={isSpinning || wheelStudents.length === 0}
            className={`w-full max-w-md py-4 px-8 rounded-2xl font-extrabold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
              isSpinning || wheelStudents.length === 0
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] shadow-indigo-500/25'
            }`}
          >
            <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Spinning...' : 'SPIN WHEEL'}
          </button>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Tip: Press <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 border rounded font-mono">Space</kbd> or click wheel to spin
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Roster Session Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Quick Add Name */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <label htmlFor="quick-add-student" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Quick Add Student to Wheel
          </label>
          <form onSubmit={handleAddQuickStudent} className="flex gap-2">
            <input
              id="quick-add-student"
              type="text"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              placeholder="Enter student name..."
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!quickName.trim()}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Student List & Exclusion Controls */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Roster on Wheel ({wheelStudents.length}/{activeStudents.length})
              </h3>
            </div>

            {removedStudents.length > 0 && (
              <button
                onClick={handleRestoreAll}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Restore All
              </button>
            )}
          </div>

          {/* Student Names Scroll Box */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[280px]">
            {activeStudents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active students in this class roster. Go to "Class Rosters" to add students.
              </div>
            ) : (
              activeStudents.map((student) => {
                const isExcluded = excludedIds.has(student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs font-medium border ${
                      isExcluded
                        ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-800 line-through'
                        : 'bg-slate-100/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/60 hover:border-indigo-300'
                    }`}
                  >
                    <span className="truncate pr-2">{student.name}</span>
                    <button type="button" className="text-slate-400 hover:text-slate-600">
                      {isExcluded ? (
                        <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Removed Students Log */}
          {removedStudents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Removed this session ({removedStudents.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {removedStudents.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Winner Popup */}
      <WinnerModal
        winnerName={winnerName}
        onClose={() => setWinnerName(null)}
        onRemoveWinner={handleRemoveWinner}
        onKeepWinner={() => setWinnerName(null)}
        soundEnabled={!muted}
        soundVolume={settings.volume}
      />
    </div>
  );
};
