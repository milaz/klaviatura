import {
  CoachingMemory,
  DailyDiaryEntry,
  LayoutId,
  ProgressData,
  SessionRecord,
  UserSettings,
} from '../types';

const SETTINGS_KEY = 'klaviatura_settings_v1';
const PROGRESS_KEY = 'klaviatura_progress_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  uiLang: 'en',
  layout: 'ru',
  hintMode: 'dual',
  typingMode: 'guided',
  ruPunctuation: 'pc',
  inputMapping: 'virtual',
  soundEnabled: true,
  metronomeCpm: 0,
  showFingerZones: true,
  showHands: true,
  dismissedAnchorBanner: false,
};

export const DEFAULT_COACHING: CoachingMemory = {
  totalDrills: 0,
  guardLastDrill: {},
  preflightIndex: 0,
};

export const DEFAULT_PROGRESS: ProgressData = {
  completions: {},
  keyStats: {
    ru: {},
    en: {},
  },
  sessions: [],
  dailyActiveSeconds: {},
  dailyDiary: {},
  coaching: DEFAULT_COACHING,
};

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayDateKey(): string {
  return formatDateKey(new Date());
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota errors
  }
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ProgressData>;

    const dailyActiveSeconds = parsed.dailyActiveSeconds ?? {};
    const dailyDiary: Record<string, DailyDiaryEntry> = { ...(parsed.dailyDiary ?? {}) };

    // Backfill diary entries if upgrading from earlier dailyActiveSeconds-only data
    for (const [dateKey, secs] of Object.entries(dailyActiveSeconds)) {
      if (!dailyDiary[dateKey] && secs > 0) {
        dailyDiary[dateKey] = {
          seconds: secs,
          drills: 1,
          wpmSum: 0,
          accuracySum: 0,
          rhythmSum: 0,
          rhythmCount: 0,
        };
      }
    }

    const coaching: CoachingMemory = {
      totalDrills: parsed.coaching?.totalDrills ?? (parsed.sessions?.length ?? 0),
      guardLastDrill: parsed.coaching?.guardLastDrill ?? {},
      lastPreflightDate: parsed.coaching?.lastPreflightDate,
      preflightIndex: parsed.coaching?.preflightIndex ?? 0,
    };

    return {
      completions: parsed.completions ?? {},
      keyStats: {
        ru: parsed.keyStats?.ru ?? {},
        en: parsed.keyStats?.en ?? {},
      },
      sessions: parsed.sessions ?? [],
      dailyActiveSeconds,
      dailyDiary,
      coaching,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: ProgressData): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore quota errors
  }
}

export function recordSessionInProgress(
  prev: ProgressData,
  session: SessionRecord,
  deltaKeyStats: Record<string, { hits: number; misses: number; totalLatencyMs: number }>,
  shownGuardId?: string | null
): ProgressData {
  const layout: LayoutId = session.layout;
  const existingComp = prev.completions[session.lessonId];
  const updatedComp = {
    bestWpm: Math.max(existingComp?.bestWpm ?? 0, session.wpm),
    bestAccuracy: Math.max(existingComp?.bestAccuracy ?? 0, session.accuracy),
    completions: (existingComp?.completions ?? 0) + 1,
    lastCompletedAt: session.timestamp,
  };

  const nextLayoutStats = { ...prev.keyStats[layout] };
  for (const [code, delta] of Object.entries(deltaKeyStats)) {
    const cur = nextLayoutStats[code] ?? { hits: 0, misses: 0, totalLatencyMs: 0 };
    nextLayoutStats[code] = {
      hits: cur.hits + delta.hits,
      misses: cur.misses + delta.misses,
      totalLatencyMs: cur.totalLatencyMs + delta.totalLatencyMs,
    };
  }

  const today = getTodayDateKey();
  const addedSecs = Math.max(1, Math.min(600, Math.round(session.durationSeconds ?? 20)));
  const nextDailySecs = {
    ...(prev.dailyActiveSeconds ?? {}),
    [today]: (prev.dailyActiveSeconds?.[today] ?? 0) + addedSecs,
  };

  const prevDay = prev.dailyDiary?.[today] ?? {
    seconds: 0,
    drills: 0,
    wpmSum: 0,
    accuracySum: 0,
    rhythmSum: 0,
    rhythmCount: 0,
  };
  const nextDiary: Record<string, DailyDiaryEntry> = {
    ...(prev.dailyDiary ?? {}),
    [today]: {
      seconds: prevDay.seconds + addedSecs,
      drills: prevDay.drills + 1,
      wpmSum: prevDay.wpmSum + session.wpm,
      accuracySum: prevDay.accuracySum + session.accuracy,
      rhythmSum: prevDay.rhythmSum + (session.rhythmScore ?? 0),
      rhythmCount: prevDay.rhythmCount + (session.rhythmScore !== undefined ? 1 : 0),
    },
  };

  const nextTotalDrills = (prev.coaching?.totalDrills ?? 0) + 1;
  const nextGuardLastDrill = { ...(prev.coaching?.guardLastDrill ?? {}) };
  if (shownGuardId) {
    nextGuardLastDrill[shownGuardId] = nextTotalDrills;
  }

  // Rotate daily preflight tip index once per new calendar day
  const isNewPreflightDay = prev.coaching?.lastPreflightDate !== today;
  const nextPreflightIndex = isNewPreflightDay
    ? ((prev.coaching?.preflightIndex ?? 0) + (prev.coaching?.lastPreflightDate ? 1 : 0)) % 4
    : prev.coaching?.preflightIndex ?? 0;

  return {
    completions: {
      ...prev.completions,
      [session.lessonId]: updatedComp,
    },
    keyStats: {
      ...prev.keyStats,
      [layout]: nextLayoutStats,
    },
    sessions: [session, ...prev.sessions].slice(0, 30),
    dailyActiveSeconds: nextDailySecs,
    dailyDiary: nextDiary,
    coaching: {
      totalDrills: nextTotalDrills,
      guardLastDrill: nextGuardLastDrill,
      lastPreflightDate: today,
      preflightIndex: nextPreflightIndex,
    },
  };
}
