export interface Student {
  id: string;
  name: string;
  gender?: 'M' | 'F' | 'Other' | '';
  notes?: string;
  active: boolean;
}

export interface ClassRoster {
  id: string;
  name: string;
  gradeOrSubject?: string;
  students: Student[];
  createdAt: number;
  updatedAt: number;
}

export type AppTab =
  | 'wheel'
  | 'grouper'
  | 'review'
  | 'millionaire'
  | 'quizbee'
  | 'flashcard'
  | 'editor'
  | 'rosters'
  | 'settings';

export interface ReviewQuestion {
  id: string;
  question: string;
  options: string[]; // Usually 4 options (A, B, C, D)
  correctIndex: number;
  explanation?: string;
  category?: string;
  difficulty?: 'easy' | 'average' | 'difficult';
  millionaireLevel?: number; // Level 1 to 15
  points?: number;
}

export interface ReviewSet {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  questions: ReviewQuestion[];
  createdAt: number;
  updatedAt: number;
}

export type ReviewMode = 'traditional' | 'millionaire' | 'quizbee' | 'flashcard';

export interface QuizBeeTeam {
  id: string;
  name: string;
  color?: string;
  score: number;
  members?: string[];
}

export interface Group {
  id: string;
  name: string;
  students: Student[];
}

export type GroupingStrategy = 'by_size' | 'by_count';

export interface GroupingOptions {
  strategy: GroupingStrategy;
  groupSize: number;
  groupCount: number;
  namingTheme: 'numbered' | 'colors' | 'animals' | 'planets';
  balanceGender: boolean;
  remainderStrategy: 'distribute' | 'extra_group';
}

export interface WheelSettings {
  spinDuration: number; // in seconds
  soundEnabled: boolean;
  volume: number; // 0 to 1
  autoRemoveWinner: boolean;
  confettiEnabled: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  wheel: WheelSettings;
  soundVolume: number;
}
