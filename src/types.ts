export type LayoutId = 'ru' | 'en';
export type UiLang = 'en' | 'ru';
export type HintMode = 'dual' | 'target' | 'blind';
export type TypingMode = 'guided' | 'flow';
export type RuPunctuationMode = 'pc' | 'mac';
export type InputMappingMode = 'virtual' | 'native';
export type DrillMode = 'fixed' | 'mix';
export type AppView = 'practice' | 'curriculum' | 'guide' | 'progress';

export type FingerId =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export type ReachDirection = 'home' | 'up' | 'down' | 'in' | 'out' | 'thumb';

export interface KeyDef {
  code: string;
  row: number;
  x: number; // start x in key units (0..15)
  width: number; // width in key units
  us: string;
  usShift: string;
  ru: string;
  ruShift: string;
  ruMac?: string;
  ruMacShift?: string;
  finger: FingerId;
  isHome?: boolean;
  isBump?: boolean;
  isModifier?: boolean;
  label?: string;
}

export interface Lesson {
  id: string;
  layout: LayoutId;
  stage: number;
  title: { en: string; ru: string };
  subtitle: { en: string; ru: string };
  tip: { en: string; ru: string };
  focusCodes: string[];
  targetWpm: number;
  targetAccuracy: number;
  defaultHintMode?: HintMode;
  drills: string[];
  /** Stage-pure 2–4 letter motor chords using strictly unlocked letters */
  chordPool?: string[];
  /** Stage-pure real words using strictly unlocked letters for shuffled mixes */
  wordPool?: string[];
  isAdaptive?: boolean;
}

export interface KeyStat {
  hits: number;
  misses: number;
  totalLatencyMs: number;
}

export interface LessonCompletion {
  bestWpm: number;
  bestAccuracy: number;
  completions: number;
  lastCompletedAt: number;
}

export interface SessionRecord {
  id: string;
  lessonId: string;
  lessonTitle: { en: string; ru: string };
  layout: LayoutId;
  wpm: number;
  accuracy: number;
  rhythmScore?: number;
  errors: number;
  chars: number;
  durationSeconds?: number;
  timestamp: number;
}

export interface DailyDiaryEntry {
  seconds: number;
  drills: number;
  wpmSum: number;
  accuracySum: number;
  rhythmSum: number;
  rhythmCount: number;
}

export interface CoachingMemory {
  totalDrills: number;
  /** Maps guardId -> totalDrills index when last displayed, preventing spam & starvation */
  guardLastDrill: Record<string, number>;
  lastPreflightDate?: string;
  preflightIndex: number;
}

export interface UserSettings {
  uiLang: UiLang;
  layout: LayoutId;
  hintMode: HintMode;
  typingMode: TypingMode;
  ruPunctuation: RuPunctuationMode;
  inputMapping: InputMappingMode;
  soundEnabled: boolean;
  /** Optional gentle metronome pace in chars/min (0 = off, 120 / 160 / 200 / 240) */
  metronomeCpm: number;
  showFingerZones: boolean;
  showHands: boolean;
  dismissedAnchorBanner: boolean;
}

export interface ProgressData {
  completions: Record<string, LessonCompletion>;
  keyStats: Record<LayoutId, Record<string, KeyStat>>;
  sessions: SessionRecord[];
  dailyActiveSeconds: Record<string, number>;
  dailyDiary: Record<string, DailyDiaryEntry>;
  coaching: CoachingMemory;
}
