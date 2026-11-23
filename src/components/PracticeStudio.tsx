import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  DrillMode,
  FingerId,
  HintMode,
  LayoutId,
  Lesson,
  ProgressData,
  ReachDirection,
  SessionRecord,
  UserSettings,
} from '../types';
import { COPY, FINGER_NAMES } from '../data/i18n';
import {
  FINGER_ZONE_COLORS,
  findTargetKeyForChar,
  getDisplayLabelForCode,
  KEY_BY_CODE,
  resolveKeypress,
} from '../data/keyboard';
import { generateMixedChordDrill } from '../data/lessons';
import {
  playCompleteChime,
  playErrorTap,
  playKeyClick,
  playMetronomeTick,
} from '../utils/audio';
import {
  BetweenDrillGuard,
  computeRhythmScore,
  getLiveKeyCue,
  RhythmAnalysis,
  selectBetweenDrillGuard,
  selectRightPanelCoach,
} from '../utils/coaching';
import { getTodayDateKey } from '../utils/storage';
import { KeyboardVisualizer } from './KeyboardVisualizer';
import { HandVisualizer } from './HandVisualizer';

interface PracticeStudioProps {
  lesson: Lesson;
  lessons: Lesson[];
  settings: UserSettings;
  progress: ProgressData;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onStartAdaptiveDrill: () => void;
  onCompleteSession: (
    session: SessionRecord,
    deltaKeyStats: Record<string, { hits: number; misses: number; totalLatencyMs: number }>,
    shownGuardId?: string | null
  ) => void;
}

interface SessionSummary {
  wpm: number;
  accuracy: number;
  errors: number;
  rhythm: RhythmAnalysis;
  slowestFinger: FingerId | null;
  slowestFingerMs: number;
  weakestCodes: string[];
  guard: BetweenDrillGuard;
}

const METRONOME_OPTIONS = [0, 120, 160, 200, 240] as const;

export function PracticeStudio({
  lesson,
  lessons,
  settings,
  progress,
  onUpdateSettings,
  onSelectLesson,
  onStartAdaptiveDrill,
  onCompleteSession,
}: PracticeStudioProps) {
  const t = COPY[settings.uiLang];
  const [drillMode, setDrillMode] = useState<DrillMode>('fixed');
  const [mixedText, setMixedText] = useState<string>('');
  const [cursor, setCursor] = useState(0);
  const [mistypedIndices, setMistypedIndices] = useState<Set<number>>(new Set());
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [lastWrongUs, setLastWrongUs] = useState<string | null>(null);
  const [blindRevealed, setBlindRevealed] = useState(false);
  const [liveRhythmSpiky, setLiveRhythmSpiky] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const lastKeystrokeAtRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef<number | null>(null);
  const continuousBlockStartRef = useRef<number | null>(null);
  const correctIntervalsRef = useRef<number[]>([]);
  const rollingIntervalsRef = useRef<number[]>([]);
  const sessionKeyStatsRef = useRef<
    Record<string, { hits: number; misses: number; totalLatencyMs: number }>
  >({});
  const errorTimeoutRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);

  const text =
    drillMode === 'mix' && mixedText.length > 0 ? mixedText : lesson.drills[0];

  const resetMetrics = useCallback(() => {
    setCursor(0);
    setMistypedIndices(new Set());
    setTotalErrors(0);
    setTotalAttempts(0);
    setStreak(0);
    setStartedAt(null);
    setPressedCode(null);
    setErrorCode(null);
    setLastWrongUs(null);
    setBlindRevealed(false);
    setLiveRhythmSpiky(false);
    setSummary(null);
    lastKeystrokeAtRef.current = null;
    correctIntervalsRef.current = [];
    rollingIntervalsRef.current = [];
    sessionKeyStatsRef.current = {};
  }, []);

  const switchToFixed = useCallback(() => {
    setDrillMode('fixed');
    resetMetrics();
  }, [resetMetrics]);

  const startFreshMix = useCallback(() => {
    const fresh = generateMixedChordDrill(
      lesson,
      lessons,
      progress.keyStats[settings.layout] ?? {},
      settings.ruPunctuation
    );
    setMixedText(fresh);
    setDrillMode('mix');
    resetMetrics();
  }, [lesson, lessons, progress.keyStats, resetMetrics, settings.layout, settings.ruPunctuation]);

  // Run 1 of any stage always opens on the fixed structured warm-up
  useEffect(() => {
    setDrillMode('fixed');
    setMixedText('');
    resetMetrics();
  }, [lesson.id, resetMetrics]);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [settingsOpen]);

  useEffect(() => {
    if (!startedAt || summary) return;
    const interval = window.setInterval(() => setNowTick(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [startedAt, summary]);

  // Optional gentle woodblock pace metronome (OFF by default; auto-pauses if user stops >3s)
  useEffect(() => {
    if (!startedAt || summary || !settings.soundEnabled || settings.metronomeCpm <= 0) {
      return;
    }
    const intervalMs = Math.max(180, Math.round(60000 / settings.metronomeCpm));
    let beat = 0;
    const timer = window.setInterval(() => {
      const lastAct = lastActivityAtRef.current;
      if (lastAct && Date.now() - lastAct > 3000) return;
      playMetronomeTick(beat % 4 === 0);
      beat += 1;
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [startedAt, summary, settings.soundEnabled, settings.metronomeCpm]);

  useEffect(() => {
    if (pauseTimeoutRef.current) {
      window.clearTimeout(pauseTimeoutRef.current);
    }
    if (settings.hintMode !== 'blind' || summary || !startedAt) {
      setBlindRevealed(false);
      return;
    }
    setBlindRevealed(false);
    pauseTimeoutRef.current = window.setTimeout(() => {
      setBlindRevealed(true);
    }, 1600);
    return () => {
      if (pauseTimeoutRef.current) window.clearTimeout(pauseTimeoutRef.current);
    };
  }, [cursor, settings.hintMode, summary, startedAt]);

  const targetChar = summary ? '' : text[cursor] ?? '';
  const targetInfo = useMemo(
    () =>
      targetChar
        ? findTargetKeyForChar(targetChar, settings.layout, settings.ruPunctuation)
        : null,
    [targetChar, settings.layout, settings.ruPunctuation]
  );

  // Channel 1: ultra-readable live cue ONLY for far-pinky hand glide or opposite-hand Shift
  const liveKeyCue = useMemo(
    () => (summary ? null : getLiveKeyCue(targetInfo, settings.layout, settings.uiLang)),
    [summary, targetInfo, settings.layout, settings.uiLang]
  );

  // Channel 2: right-panel focus card — evaluated when drill loads/completes, frozen during typing
  const rightPanelCoach = useMemo(
    () =>
      selectRightPanelCoach({
        lesson,
        drillMode,
        hintMode: settings.hintMode,
        uiLang: settings.uiLang,
        progress,
      }),
    [lesson, drillMode, settings.hintMode, settings.uiLang, progress]
  );

  const currentLessonIdx = lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentLessonIdx > 0 ? lessons[currentLessonIdx - 1] : null;
  const nextLesson =
    currentLessonIdx >= 0 && currentLessonIdx < lessons.length - 1
      ? lessons[currentLessonIdx + 1]
      : lessons[0] ?? null;

  const finalizeSession = useCallback(
    (endTime: number, startTime: number, errorsCount: number, attemptsCount: number) => {
      const durationSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
      const elapsedMin = Math.max((endTime - startTime) / 60000, 1 / 60);
      const netWpm = Math.max(1, Math.round(text.length / 5 / elapsedMin));
      const accuracy =
        attemptsCount > 0
          ? Math.max(0, Math.round(((attemptsCount - errorsCount) / attemptsCount) * 100))
          : 100;

      const rhythm = computeRhythmScore(correctIntervalsRef.current);

      const fingerAccum: Partial<Record<FingerId, { totalMs: number; count: number }>> = {};
      const keyMisses: { code: string; score: number }[] = [];

      for (const [code, st] of Object.entries(sessionKeyStatsRef.current)) {
        const keyDef = KEY_BY_CODE[code];
        if (!keyDef || keyDef.code === 'Space') continue;
        if (st.hits > 0) {
          const cur = fingerAccum[keyDef.finger] ?? { totalMs: 0, count: 0 };
          cur.totalMs += st.totalLatencyMs;
          cur.count += st.hits;
          fingerAccum[keyDef.finger] = cur;
        }
        if (st.misses > 0) {
          keyMisses.push({
            code,
            score: st.misses * 10 + st.totalLatencyMs / Math.max(st.hits, 1) / 100,
          });
        }
      }

      let slowestFinger: FingerId | null = null;
      let slowestFingerMs = 0;
      for (const [fid, val] of Object.entries(fingerAccum)) {
        if (!val || val.count === 0) continue;
        const avg = Math.round(val.totalMs / val.count);
        if (avg > slowestFingerMs) {
          slowestFingerMs = avg;
          slowestFinger = fid as FingerId;
        }
      }

      const weakestCodes = keyMisses
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((k) => k.code);

      const todaySecs = (progress.dailyActiveSeconds?.[getTodayDateKey()] ?? 0) + durationSeconds;
      const continuousBlockSecs = continuousBlockStartRef.current
        ? Math.max(durationSeconds, Math.round((endTime - continuousBlockStartRef.current) / 1000))
        : durationSeconds;
      const prevDrillAccuracy = progress.sessions.find(
        (s) => s.layout === settings.layout
      )?.accuracy;

      const guard = selectBetweenDrillGuard({
        lesson,
        layout: settings.layout,
        hintMode: settings.hintMode,
        uiLang: settings.uiLang,
        accuracy,
        rhythm,
        weakestCodes,
        todaySecs,
        continuousBlockSecs,
        prevDrillAccuracy,
        coaching: progress.coaching,
      });

      if (settings.soundEnabled) {
        playCompleteChime();
      }

      setSummary({
        wpm: netWpm,
        accuracy,
        errors: errorsCount,
        rhythm,
        slowestFinger,
        slowestFingerMs,
        weakestCodes,
        guard,
      });

      onCompleteSession(
        {
          id: `${Date.now()}-${lesson.id}`,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          layout: settings.layout,
          wpm: netWpm,
          accuracy,
          errors: errorsCount,
          chars: text.length,
          durationSeconds,
          rhythmScore: rhythm.score,
          timestamp: endTime,
        },
        { ...sessionKeyStatsRef.current },
        guard.id
      );
    },
    [
      lesson,
      onCompleteSession,
      progress.coaching,
      progress.dailyActiveSeconds,
      progress.sessions,
      settings.hintMode,
      settings.layout,
      settings.soundEnabled,
      settings.uiLang,
      text.length,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (summary) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (lesson.isAdaptive) {
            onStartAdaptiveDrill();
          } else if (nextLesson && nextLesson.id !== lesson.id) {
            onSelectLesson(nextLesson);
          } else {
            startFreshMix();
          }
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          startFreshMix();
          return;
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        resetMetrics();
        return;
      }

      if (e.key === 'Backspace' && settings.typingMode === 'flow') {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
        return;
      }

      const resolved = resolveKeypress(
        e,
        settings.layout,
        settings.ruPunctuation,
        settings.inputMapping
      );
      if (!resolved) return;

      e.preventDefault();
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.blur();
      }

      if (!settings.dismissedAnchorBanner) {
        onUpdateSettings({ dismissedAnchorBanner: true });
      }

      const now = Date.now();
      const startTime = startedAt ?? now;
      if (!startedAt) {
        setStartedAt(now);
        setNowTick(now);
      }

      // Track continuous practice block (resets after a 90s+ natural pause)
      if (lastActivityAtRef.current === null || now - lastActivityAtRef.current > 90_000) {
        continuousBlockStartRef.current = now;
      }
      lastActivityAtRef.current = now;

      const prevKeystrokeAt = lastKeystrokeAtRef.current;
      const rawInterval = prevKeystrokeAt !== null ? now - prevKeystrokeAt : null;
      const latency =
        rawInterval !== null ? Math.min(2000, Math.max(30, rawInterval)) : 260;
      lastKeystrokeAtRef.current = now;

      if (resolved.code) {
        setPressedCode(resolved.code);
      }

      const expectedChar = text[cursor];
      const expectedTarget = findTargetKeyForChar(
        expectedChar,
        settings.layout,
        settings.ruPunctuation
      );
      const statCode = expectedTarget?.key.code ?? resolved.code ?? 'Unknown';
      const curStat = sessionKeyStatsRef.current[statCode] ?? {
        hits: 0,
        misses: 0,
        totalLatencyMs: 0,
      };

      const isCorrect = resolved.char === expectedChar;
      const nextAttempts = totalAttempts + 1;
      setTotalAttempts(nextAttempts);

      if (isCorrect) {
        if (settings.soundEnabled) {
          playKeyClick(expectedChar === ' ');
        }
        curStat.hits += 1;
        curStat.totalLatencyMs += latency;
        sessionKeyStatsRef.current[statCode] = curStat;

        if (rawInterval !== null && rawInterval >= 35 && rawInterval <= 1800) {
          correctIntervalsRef.current.push(rawInterval);
          rollingIntervalsRef.current.push(rawInterval);
          if (rollingIntervalsRef.current.length > 12) {
            rollingIntervalsRef.current.shift();
          }
          if (rollingIntervalsRef.current.length >= 10) {
            setLiveRhythmSpiky(computeRhythmScore(rollingIntervalsRef.current).isSpiky);
          }
        }

        setErrorCode(null);
        setLastWrongUs(null);
        setStreak((s) => s + 1);

        const nextCursor = cursor + 1;
        setCursor(nextCursor);
        if (nextCursor >= text.length) {
          finalizeSession(now, startTime, totalErrors, nextAttempts);
        }
      } else {
        if (settings.soundEnabled) {
          playErrorTap();
        }
        curStat.misses += 1;
        sessionKeyStatsRef.current[statCode] = curStat;

        const nextErrors = totalErrors + 1;
        setTotalErrors(nextErrors);
        setStreak(0);
        setBlindRevealed(true);

        const wrongCode = resolved.code;
        if (wrongCode) {
          setErrorCode(wrongCode);
          const wrongDef = KEY_BY_CODE[wrongCode];
          setLastWrongUs(wrongDef ? wrongDef.us.toUpperCase() || wrongDef.label || null : null);
          if (errorTimeoutRef.current) window.clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = window.setTimeout(() => {
            setErrorCode(null);
          }, 520);
        }

        if (settings.typingMode === 'flow') {
          setMistypedIndices((prev) => {
            const next = new Set(prev);
            next.add(cursor);
            return next;
          });
          const nextCursor = cursor + 1;
          setCursor(nextCursor);
          if (nextCursor >= text.length) {
            finalizeSession(now, startTime, nextErrors, nextAttempts);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedCode((prev) => (prev === e.code ? null : prev));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    cursor,
    finalizeSession,
    lesson.id,
    lesson.isAdaptive,
    nextLesson,
    onSelectLesson,
    onStartAdaptiveDrill,
    onUpdateSettings,
    resetMetrics,
    settings.dismissedAnchorBanner,
    settings.inputMapping,
    settings.layout,
    settings.ruPunctuation,
    settings.soundEnabled,
    settings.typingMode,
    startedAt,
    startFreshMix,
    summary,
    text,
    totalAttempts,
    totalErrors,
  ]);

  const liveWpm = useMemo(() => {
    if (!startedAt || cursor === 0) return 0;
    const elapsedMin = Math.max((nowTick - startedAt) / 60000, 1 / 60);
    return Math.round(cursor / 5 / elapsedMin);
  }, [startedAt, cursor, nowTick]);

  const liveAccuracy = useMemo(() => {
    if (totalAttempts === 0) return 100;
    return Math.max(0, Math.round(((totalAttempts - totalErrors) / totalAttempts) * 100));
  }, [totalAttempts, totalErrors]);

  const progressPct = Math.round((cursor / Math.max(text.length, 1)) * 100);
  const blindOpacity = settings.hintMode === 'blind' ? Math.max(0, 0.55 - streak * 0.05) : 1;

  const shiftFinger: FingerId | null =
    targetInfo?.shiftCode === 'ShiftLeft'
      ? 'left-pinky'
      : targetInfo?.shiftCode === 'ShiftRight'
        ? 'right-pinky'
        : null;

  const directionMeta = (dir: ReachDirection) => {
    switch (dir) {
      case 'home':
        return { arrow: '●', label: t.practice.homeCue };
      case 'up':
        return { arrow: '↑', label: t.practice.upCue };
      case 'down':
        return { arrow: '↓', label: t.practice.downCue };
      case 'in':
        return { arrow: '↔', label: t.practice.inCue };
      case 'out':
        return { arrow: '↔', label: t.practice.outCue };
      case 'thumb':
        return { arrow: '␣', label: t.practice.spaceCue };
    }
  };

  const guardToneClass = (tone: BetweenDrillGuard['tone']) => {
    switch (tone) {
      case 'emerald':
        return 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]';
      case 'amber':
        return 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]';
      case 'cobalt':
        return 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]';
      case 'stone':
        return 'bg-[#FAF8F4] border-[#E2DDD3] text-[#635F57]';
    }
  };

  const actionHintLabel = (hint: HintMode) =>
    hint === 'blind' ? t.practice.applyHintBlind : t.practice.applyHintTarget;

  return (
    <div className="w-full max-w-[1368px] mx-auto px-4 sm:px-6 pt-3.5 pb-6 flex flex-col gap-3">
      {/* Unified Compact Studio Header: Stage Switcher + Fixed/Mix Toggle + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Compact Stage Selector, Title & Fixed/Mix Mode */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="inline-flex items-center gap-0.5 text-xs text-[#635F57] bg-[#ECE8DF] border border-[#E2DDD3] rounded-lg px-1 py-0.5 shrink-0">
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => prevLesson && onSelectLesson(prevLesson)}
              aria-label="Previous stage"
              className="p-1 rounded hover:bg-white/80 disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-typing font-semibold text-[#1C1B18] px-1">
              {lesson.isAdaptive
                ? t.practice.adaptiveBadge
                : `${String(lesson.stage).padStart(2, '0')}/${lessons.length}`}
            </span>
            <button
              type="button"
              disabled={!nextLesson || nextLesson.id === lesson.id}
              onClick={() => nextLesson && onSelectLesson(nextLesson)}
              aria-label="Next stage"
              className="p-1 rounded hover:bg-white/80 disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#1C1B18] truncate">
            {lesson.title[settings.uiLang]}
          </h1>

          {/* Fixed Warm-Up (1) vs Auto-Shuffled Words & Chords (↻ Mix) */}
          <div
            role="group"
            aria-label="Drill mode"
            className="inline-flex items-center p-0.5 rounded-lg bg-[#ECE8DF] border border-[#E2DDD3] shrink-0"
          >
            <button
              type="button"
              onClick={switchToFixed}
              className={`px-2 py-0.5 text-xs font-mono-typing font-semibold rounded-md transition-colors cursor-pointer ${
                drillMode === 'fixed'
                  ? 'bg-white text-[#1C1B18] shadow-xs'
                  : 'text-[#635F57] hover:text-[#1C1B18]'
              }`}
            >
              {t.controls.fixedWarmup}
            </button>
            <button
              type="button"
              onClick={startFreshMix}
              title={t.controls.mixTitle}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                drillMode === 'mix'
                  ? 'bg-white text-[#1D4ED8] shadow-xs'
                  : 'text-[#635F57] hover:text-[#1C1B18]'
              }`}
            >
              <Shuffle className="w-3 h-3" />
              <span>{t.controls.mixMode}</span>
            </button>
          </div>
        </div>

        {/* Right: Workspace Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout switcher */}
          <div
            role="group"
            aria-label="Keyboard layout"
            className="inline-flex items-center p-0.5 rounded-lg bg-[#ECE8DF] border border-[#E2DDD3]"
          >
            {(['ru', 'en'] as LayoutId[]).map((lid) => (
              <button
                key={lid}
                type="button"
                onClick={() => onUpdateSettings({ layout: lid })}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  settings.layout === lid
                    ? 'bg-white text-[#1C1B18] shadow-xs'
                    : 'text-[#635F57] hover:text-[#1C1B18]'
                }`}
              >
                {lid === 'ru' ? t.controls.layoutRu : t.controls.layoutEn}
              </button>
            ))}
          </div>

          {/* Hint mode */}
          <div
            role="group"
            aria-label="Keycap hints"
            className="inline-flex items-center p-0.5 rounded-lg bg-[#ECE8DF] border border-[#E2DDD3]"
          >
            {(['dual', 'target', 'blind'] as HintMode[]).map((hm) => {
              const label =
                hm === 'dual'
                  ? settings.layout === 'ru'
                    ? t.controls.hintDual
                    : t.controls.hintDualEn
                  : hm === 'target'
                    ? settings.layout === 'ru'
                      ? t.controls.hintTarget
                      : t.controls.hintTargetEn
                    : t.controls.hintBlind;
              return (
                <button
                  key={hm}
                  type="button"
                  onClick={() => onUpdateSettings({ hintMode: hm })}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    settings.hintMode === hm
                      ? 'bg-white text-[#1C1B18] shadow-xs'
                      : 'text-[#635F57] hover:text-[#1C1B18]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* UI Language */}
          <div
            role="group"
            aria-label="Interface language"
            className="inline-flex items-center p-0.5 rounded-lg bg-[#ECE8DF] border border-[#E2DDD3]"
          >
            {(['en', 'ru'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onUpdateSettings({ uiLang: lang })}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors uppercase whitespace-nowrap cursor-pointer ${
                  settings.uiLang === lang
                    ? 'bg-white text-[#1C1B18] shadow-xs'
                    : 'text-[#635F57] hover:text-[#1C1B18]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            aria-label={settings.soundEnabled ? t.controls.soundOn : t.controls.soundOff}
            title={settings.soundEnabled ? t.controls.soundOn : t.controls.soundOff}
            className="h-7.5 w-7.5 inline-flex items-center justify-center rounded-lg bg-white border border-[#E2DDD3] text-[#635F57] hover:text-[#1C1B18] transition-colors cursor-pointer"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="relative" ref={settingsMenuRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              aria-expanded={settingsOpen}
              className={`h-7.5 px-2.5 inline-flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                settingsOpen
                  ? 'bg-[#1C1B18] text-white border-[#1C1B18]'
                  : 'bg-white text-[#635F57] border-[#E2DDD3] hover:text-[#1C1B18]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.controls.settings}</span>
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-[#E2DDD3] shadow-lg p-4 z-40 flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[#635F57]">
                    {t.controls.typingMode}
                  </span>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F4F1EA]">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ typingMode: 'guided' })}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md cursor-pointer ${
                        settings.typingMode === 'guided'
                          ? 'bg-white text-[#1C1B18] shadow-xs'
                          : 'text-[#635F57]'
                      }`}
                    >
                      {t.controls.guidedMode}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ typingMode: 'flow' })}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md cursor-pointer ${
                        settings.typingMode === 'flow'
                          ? 'bg-white text-[#1C1B18] shadow-xs'
                          : 'text-[#635F57]'
                      }`}
                    >
                      {t.controls.flowMode}
                    </button>
                  </div>
                </div>

                {settings.layout === 'ru' && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-[#635F57]">
                      {t.controls.ruPunct}
                    </span>
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F4F1EA]">
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ ruPunctuation: 'pc' })}
                        className={`py-1.5 px-2 text-xs font-medium rounded-md cursor-pointer ${
                          settings.ruPunctuation === 'pc'
                            ? 'bg-white text-[#1C1B18] shadow-xs'
                            : 'text-[#635F57]'
                        }`}
                      >
                        {t.controls.ruPunctPc}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ ruPunctuation: 'mac' })}
                        className={`py-1.5 px-2 text-xs font-medium rounded-md cursor-pointer ${
                          settings.ruPunctuation === 'mac'
                            ? 'bg-white text-[#1C1B18] shadow-xs'
                            : 'text-[#635F57]'
                        }`}
                      >
                        {t.controls.ruPunctMac}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[#635F57]">
                    {t.controls.inputMode}
                  </span>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F4F1EA]">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ inputMapping: 'virtual' })}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md cursor-pointer ${
                        settings.inputMapping === 'virtual'
                          ? 'bg-white text-[#1C1B18] shadow-xs'
                          : 'text-[#635F57]'
                      }`}
                    >
                      {t.controls.inputVirtual}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ inputMapping: 'native' })}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md cursor-pointer ${
                        settings.inputMapping === 'native'
                          ? 'bg-white text-[#1C1B18] shadow-xs'
                          : 'text-[#635F57]'
                      }`}
                    >
                      {t.controls.inputNative}
                    </button>
                  </div>
                </div>

                {/* Optional Gentle Pace Metronome (OFF by default, best for Stage 7+ cadence) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#635F57]">{t.controls.metronome}</span>
                    <span className="font-mono-typing text-[11px] text-[#8A8479]">
                      {settings.metronomeCpm > 0
                        ? `${settings.metronomeCpm} cpm`
                        : t.controls.metronomeOff}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-1 rounded-lg bg-[#F4F1EA]">
                    {METRONOME_OPTIONS.map((cpm) => (
                      <button
                        key={cpm}
                        type="button"
                        onClick={() =>
                          onUpdateSettings(
                            cpm > 0
                              ? { metronomeCpm: cpm, soundEnabled: true }
                              : { metronomeCpm: 0 }
                          )
                        }
                        className={`py-1 px-1 text-[11px] font-mono-typing font-medium rounded-md cursor-pointer ${
                          settings.metronomeCpm === cpm
                            ? 'bg-white text-[#1C1B18] shadow-xs'
                            : 'text-[#635F57]'
                        }`}
                      >
                        {cpm === 0 ? t.controls.metronomeOff : cpm}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#ECE8DF] flex flex-col gap-2">
                  <label className="flex items-center justify-between text-xs text-[#1C1B18] cursor-pointer">
                    <span>{t.controls.fingerColors}</span>
                    <input
                      type="checkbox"
                      checked={settings.showFingerZones}
                      onChange={(e) => onUpdateSettings({ showFingerZones: e.target.checked })}
                      className="accent-[#1D4ED8] w-4 h-4 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-[#1C1B18] cursor-pointer">
                    <span>{t.controls.handDiagram}</span>
                    <input
                      type="checkbox"
                      checked={settings.showHands}
                      onChange={(e) => onUpdateSettings({ showHands: e.target.checked })}
                      className="accent-[#1D4ED8] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dismissible 1-Line Hands-On-Home Anchor Reminder (auto-hides on first keypress) */}
      {!settings.dismissedAnchorBanner && (
        <div className="flex items-center justify-between gap-4 px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD3] text-xs text-[#1C1B18]">
          <p className="leading-snug">
            <span className="font-semibold">{t.anchorBanner.title}</span>{' '}
            <span className="text-[#635F57]">{t.anchorBanner.body}</span>
          </p>
          <button
            type="button"
            onClick={() => onUpdateSettings({ dismissedAnchorBanner: true })}
            aria-label={t.anchorBanner.dismiss}
            className="text-[#635F57] hover:text-[#1C1B18] p-0.5 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* True Two-Column Widescreen Studio: Left (Prompt + Full-Proportion Keyboard, exact matching width) | Right (Hand Companion) */}
      <div
        className={`grid grid-cols-1 gap-4 items-stretch ${
          settings.showHands
            ? 'lg:grid-cols-[minmax(0,1fr)_316px]'
            : 'max-w-[1000px] mx-auto w-full'
        }`}
      >
        {/* Left Primary Column: Training Words Canvas + Keyboard with Exact Matching Width & Proportion */}
        <div className="flex flex-col gap-3.5 min-w-0">
          <section
            aria-label="Typing exercise canvas"
            className="relative rounded-2xl bg-white border border-[#E2DDD3] overflow-hidden"
          >
            <div className="w-full h-1 bg-[#F1EDE4]">
              <div
                className="h-full bg-[#1D4ED8] transition-all duration-150"
                style={{ width: `${summary ? 100 : progressPct}%` }}
              />
            </div>

            {summary ? (
              <div className="px-6 py-4 flex flex-col gap-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#15803D]">
                      {t.practice.drillComplete}
                    </p>
                    <h2 className="font-display text-xl font-bold text-[#1C1B18] mt-0.5">
                      {lesson.title[settings.uiLang]}
                    </h2>
                  </div>

                  {/* Crisp Tabular Metrics: Net WPM · Accuracy · Rhythm · Slowest Finger */}
                  <div className="flex flex-wrap items-baseline gap-5">
                    <div>
                      <div className="text-xs text-[#635F57]">{t.practice.netWpm}</div>
                      <div className="font-mono-typing text-xl font-semibold text-[#1C1B18]">
                        {summary.wpm}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#635F57]">{t.practice.accuracy}</div>
                      <div className="font-mono-typing text-xl font-semibold text-[#15803D]">
                        {summary.accuracy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#635F57]">{t.practice.rhythm}</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono-typing text-xl font-semibold text-[#1C1B18]">
                          {summary.rhythm.score}%
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            summary.rhythm.isSpiky ? 'text-[#B45309]' : 'text-[#15803D]'
                          }`}
                        >
                          {summary.rhythm.isSpiky
                            ? t.practice.unevenLabel
                            : t.practice.steadyLabel}
                        </span>
                      </div>
                    </div>
                    {summary.slowestFinger && (
                      <div>
                        <div className="text-xs text-[#635F57]">{t.practice.slowestFinger}</div>
                        <div className="text-sm font-semibold text-[#1C1B18] mt-0.5">
                          {FINGER_NAMES[settings.uiLang][summary.slowestFinger]}{' '}
                          <span className="font-mono-typing text-xs text-[#635F57]">
                            ({summary.slowestFingerMs} {t.progress.msUnit})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {summary.weakestCodes.length > 0 && (
                  <div className="flex items-center gap-2.5 text-xs text-[#635F57]">
                    <span>{t.practice.weakestKeys}:</span>
                    <div className="flex items-center gap-1.5">
                      {summary.weakestCodes.map((code) => {
                        const lbl = getDisplayLabelForCode(
                          code,
                          settings.layout,
                          settings.ruPunctuation
                        );
                        return (
                          <span
                            key={code}
                            className="font-mono-typing px-2 py-0.5 rounded border border-[#E2DDD3] bg-[#FAF8F4] text-[#1C1B18] font-semibold"
                          >
                            {lbl.primary}
                            {settings.layout === 'ru' && (
                              <span className="text-[#8A8479] font-normal ml-1">({lbl.us})</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Channel 3: Single Non-Starving Cooldown Coaching Guard */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-2.5 text-xs px-3 py-2 rounded-lg border leading-relaxed ${guardToneClass(
                    summary.guard.tone
                  )}`}
                >
                  <p className="flex-1 min-w-[200px]">{summary.guard.text}</p>
                  {summary.guard.actionHint && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ hintMode: summary.guard.actionHint });
                        startFreshMix();
                      }}
                      className="px-2.5 py-1 rounded-md bg-white/90 hover:bg-white text-[#1C1B18] border border-current/20 font-semibold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {actionHintLabel(summary.guard.actionHint)}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {nextLesson && nextLesson.id !== lesson.id && !lesson.isAdaptive && (
                    <button
                      type="button"
                      onClick={() => onSelectLesson(nextLesson)}
                      className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>{t.practice.nextStage}</span>
                      <span className="font-mono-typing text-[11px] opacity-80">
                        ↵ {t.practice.enterShortcut}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={startFreshMix}
                    className="px-4 py-2 rounded-lg bg-[#F4F1EA] hover:bg-[#E8E3D8] text-[#1C1B18] text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>{t.practice.retryMix}</span>
                    <span className="font-mono-typing text-[11px] text-[#635F57]">
                      ⇥ {t.practice.tabShortcut}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onStartAdaptiveDrill}
                    className="px-4 py-2 rounded-lg border border-[#E2DDD3] hover:border-[#1C1B18] text-[#1C1B18] text-sm font-medium transition-colors cursor-pointer"
                  >
                    {t.practice.drillWeak}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 sm:px-6 pt-4 pb-3.5 flex flex-col gap-3.5">
                {/* Typing Stream */}
                <div
                  className="font-mono-typing text-[19px] sm:text-[22px] leading-[1.68] tracking-[0.015em] select-none break-words"
                  aria-live="off"
                >
                  {text.split('').map((ch, idx) => {
                    const isTyped = idx < cursor;
                    const isCurrent = idx === cursor;
                    const wasMistyped = mistypedIndices.has(idx);
                    const isSpace = ch === ' ';

                    if (isCurrent) {
                      return (
                        <span
                          key={idx}
                          className={`relative rounded-[4px] px-[1px] transition-colors ${
                            errorCode
                              ? 'bg-[#FEE2E2] text-[#B91C1C] underline decoration-[#B91C1C] decoration-2 underline-offset-4'
                              : 'bg-[#1D4ED8]/14 text-[#1D4ED8] underline decoration-[#1D4ED8] decoration-2 underline-offset-4'
                          }`}
                        >
                          {isSpace ? '␣' : ch}
                        </span>
                      );
                    }

                    if (isTyped) {
                      return (
                        <span
                          key={idx}
                          className={
                            wasMistyped
                              ? 'text-[#B91C1C] bg-[#FEE2E2]/60 rounded-[2px]'
                              : 'text-[#15803D]'
                          }
                        >
                          {ch}
                        </span>
                      );
                    }

                    return (
                      <span key={idx} className="text-[#8E887D]">
                        {ch}
                      </span>
                    );
                  })}
                </div>

                {/* Channel 1: Integrated Visual Cue Strip + Compact Tabular Telemetry */}
                <div className="pt-2.5 border-t border-[#F0ECE3] flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  {targetInfo ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        style={{
                          backgroundColor: FINGER_ZONE_COLORS[targetInfo.key.finger].bg,
                          color: FINGER_ZONE_COLORS[targetInfo.key.finger].text,
                          borderColor: FINGER_ZONE_COLORS[targetInfo.key.finger].border,
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-semibold whitespace-nowrap"
                      >
                        <span>{FINGER_NAMES[settings.uiLang][targetInfo.key.finger]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-typing">
                          {directionMeta(targetInfo.direction).arrow}{' '}
                          {directionMeta(targetInfo.direction).label}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 font-mono-typing text-[#1C1B18] font-medium">
                        {targetInfo.needsShift && (
                          <span className="px-1.5 py-0.5 rounded bg-[#1C1B18] text-white text-[11px]">
                            ⇧
                          </span>
                        )}
                        {settings.layout === 'ru' && targetInfo.key.code !== 'Space' && (
                          <>
                            <span className="px-1.5 py-0.5 rounded bg-[#F4F1EA] border border-[#DDD7CA] text-[#635F57] text-[11px]">
                              US {targetInfo.key.us.toUpperCase()}
                            </span>
                            <span className="text-[#8A8479]" aria-hidden="true">
                              →
                            </span>
                          </>
                        )}
                        <span className="px-2 py-0.5 rounded bg-[#1D4ED8] text-white font-semibold">
                          {targetChar === ' ' ? '␣' : targetChar}
                        </span>
                      </span>

                      {errorCode && lastWrongUs ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FEE2E2] text-[#B91C1C] font-mono-typing font-semibold">
                          <span>{lastWrongUs}</span>
                          <span aria-hidden="true">→</span>
                          <span>
                            {targetInfo.needsShift ? '⇧+' : ''}
                            {targetInfo.key.us.toUpperCase() || targetInfo.key.label}
                          </span>
                        </span>
                      ) : liveKeyCue ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FAF8F4] border border-[#DDD7CA] text-[#1C1B18] font-medium whitespace-nowrap">
                          {liveKeyCue.text}
                        </span>
                      ) : null}

                      {settings.hintMode === 'blind' && blindRevealed && !errorCode && (
                        <span className="text-[#635F57]">{t.practice.blindReveal}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#635F57]">{t.practice.startHint}</span>
                  )}

                  {/* Compact Tabular Live Readout + Reset */}
                  <div className="flex items-center gap-2.5 text-xs text-[#635F57] shrink-0">
                    <span className="font-mono-typing">
                      <strong className="text-[#1C1B18] font-semibold">{liveWpm}</strong>{' '}
                      {t.practice.wpm}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-typing">
                      <strong className="text-[#1C1B18] font-semibold">{liveAccuracy}%</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-typing">
                      <strong className={totalErrors > 0 ? 'text-[#B91C1C]' : 'text-[#1C1B18]'}>
                        {totalErrors}
                      </strong>{' '}
                      {t.practice.errors.toLowerCase()}
                    </span>
                    {liveRhythmSpiky && cursor >= 12 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#B45309] whitespace-nowrap">
                          {t.practice.unevenLabel}
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={resetMetrics}
                      title={t.practice.restartKey}
                      aria-label={t.practice.restartKey}
                      className="ml-0.5 h-6.5 w-6.5 inline-flex items-center justify-center rounded-md border border-[#E2DDD3] bg-[#FAF8F4] text-[#635F57] hover:text-[#1C1B18] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Full-Proportion US ANSI Keyboard — Exact Matching Width with Prompt Field Above */}
          <KeyboardVisualizer
            layout={settings.layout}
            ruPunctuation={settings.ruPunctuation}
            hintMode={settings.hintMode}
            showFingerZones={settings.showFingerZones}
            compact={false}
            targetInfo={summary ? null : targetInfo}
            pressedCode={pressedCode}
            errorCode={errorCode}
            blindOpacity={blindOpacity}
            blindRevealed={blindRevealed}
          />
        </div>

        {/* Right Companion Column: Sculpted Hand Guide + Focus Keys + Frozen Situational Coach */}
        {settings.showHands && (
          <aside className="rounded-2xl bg-white border border-[#E2DDD3] px-4 py-3.5 flex flex-col justify-between gap-3">
            <div className="w-full flex items-center justify-between text-xs text-[#635F57]">
              <span className="font-semibold text-[#1C1B18]">
                {settings.uiLang === 'ru' ? 'Постановка рук' : 'Hand guide'}
              </span>
              <span className="font-mono-typing text-[11px]">
                {settings.layout === 'ru' ? 'ФЫВА · ОЛДЖ' : 'ASDF · JKL;'}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center py-0.5">
              <HandVisualizer
                activeFinger={summary ? null : targetInfo?.key.finger ?? null}
                shiftFinger={summary ? null : shiftFinger}
                direction={summary ? null : targetInfo?.direction ?? null}
                layout={settings.layout}
                uiLang={settings.uiLang}
              />
            </div>

            <div className="flex flex-col gap-2.5 border-t border-[#F0ECE3] pt-2.5">
              {/* Stage Focus Keys + Daily 15-Min Practice Budget */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-medium text-[#635F57]">{t.curriculum.focusKeys}</span>
                  <span className="font-mono-typing text-[#635F57]">
                    {t.practice.todayBudget}:{' '}
                    <strong
                      className={
                        (progress.dailyActiveSeconds?.[getTodayDateKey()] ?? 0) >= 15 * 60
                          ? 'text-[#15803D]'
                          : 'text-[#1C1B18]'
                      }
                    >
                      {Math.floor((progress.dailyActiveSeconds?.[getTodayDateKey()] ?? 0) / 60)}/15
                    </strong>{' '}
                    {t.practice.minUnit}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {lesson.focusCodes.slice(0, 8).map((code) => {
                    const lbl = getDisplayLabelForCode(
                      code,
                      settings.layout,
                      settings.ruPunctuation
                    );
                    return (
                      <span
                        key={code}
                        className="font-mono-typing text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF8F4] border border-[#E2DDD3] text-[#1C1B18]"
                      >
                        {lbl.primary || code.replace('Shift', '⇧')}
                        {settings.layout === 'ru' && lbl.us && lbl.us !== 'SPACE' && (
                          <span className="text-[#8A8479] font-normal ml-0.5 text-[10px]">
                            {lbl.us}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Channel 2: Frozen Pre-Drill / Situational Focus Tip */}
              <div className="pt-2 border-t border-[#F4F1EA] flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-[#1C1B18]">
                  {rightPanelCoach.label}
                </span>
                <p className="text-xs text-[#635F57] leading-relaxed">
                  {rightPanelCoach.body}
                </p>
                {rightPanelCoach.suggestedHint && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ hintMode: rightPanelCoach.suggestedHint })
                    }
                    className="self-start mt-0.5 px-2.5 py-1 rounded-md bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {actionHintLabel(rightPanelCoach.suggestedHint)}
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
