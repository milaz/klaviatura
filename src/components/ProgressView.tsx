import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { FingerId, LayoutId, ProgressData, UserSettings } from '../types';
import { COPY, FINGER_NAMES } from '../data/i18n';
import { FINGER_ORDER, FINGER_ZONE_COLORS, KEY_BY_CODE } from '../data/keyboard';
import { getActivePracticeDayCount } from '../utils/coaching';
import { formatDateKey, getTodayDateKey } from '../utils/storage';
import { KeyboardVisualizer } from './KeyboardVisualizer';

interface ProgressViewProps {
  settings: UserSettings;
  progress: ProgressData;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onStartAdaptiveDrill: () => void;
  onResetProgress: () => void;
}

export function ProgressView({
  settings,
  progress,
  onUpdateSettings,
  onStartAdaptiveDrill,
  onResetProgress,
}: ProgressViewProps) {
  const t = COPY[settings.uiLang];
  const [heatmapMetric, setHeatmapMetric] = useState<'errors' | 'speed'>('errors');
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getTodayDateKey());

  const layoutStats = progress.keyStats[settings.layout] ?? {};
  const layoutSessions = useMemo(
    () => progress.sessions.filter((s) => s.layout === settings.layout),
    [progress.sessions, settings.layout]
  );

  const totals = useMemo(() => {
    const count = layoutSessions.length;
    const avgWpm =
      count > 0
        ? Math.round(layoutSessions.reduce((acc, s) => acc + s.wpm, 0) / count)
        : 0;
    const avgAccuracy =
      count > 0
        ? Math.round(layoutSessions.reduce((acc, s) => acc + s.accuracy, 0) / count)
        : 0;
    let totalKeys = 0;
    for (const s of Object.values(layoutStats)) {
      totalKeys += s.hits + s.misses;
    }
    return { count, avgWpm, avgAccuracy, totalKeys };
  }, [layoutSessions, layoutStats]);

  // 28-Day Practice Diary Calendar (4 weeks ending today)
  const diaryDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const list: {
      key: string;
      date: Date;
      dayNum: number;
      weekday: string;
      seconds: number;
      minutes: number;
      drills: number;
      avgWpm: number | null;
      avgAccuracy: number | null;
      avgRhythm: number | null;
      isToday: boolean;
    }[] = [];

    const locale = settings.uiLang === 'ru' ? 'ru-RU' : 'en-US';
    const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });

    for (let offset = 27; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const key = formatDateKey(d);
      const entry = progress.dailyDiary?.[key];
      const fallbackSecs = progress.dailyActiveSeconds?.[key] ?? 0;
      const seconds = entry?.seconds ?? fallbackSecs;
      const drills = entry?.drills ?? (fallbackSecs > 0 ? 1 : 0);
      const avgWpm =
        entry && entry.drills > 0 && entry.wpmSum > 0
          ? Math.round(entry.wpmSum / entry.drills)
          : null;
      const avgAccuracy =
        entry && entry.drills > 0 && entry.accuracySum > 0
          ? Math.round(entry.accuracySum / entry.drills)
          : null;
      const avgRhythm =
        entry && entry.rhythmCount > 0
          ? Math.round(entry.rhythmSum / entry.rhythmCount)
          : null;

      list.push({
        key,
        date: d,
        dayNum: d.getDate(),
        weekday: weekdayFmt.format(d),
        seconds,
        minutes: seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0,
        drills,
        avgWpm,
        avgAccuracy,
        avgRhythm,
        isToday: offset === 0,
      });
    }
    return list;
  }, [progress.dailyActiveSeconds, progress.dailyDiary, settings.uiLang]);

  const activePracticeDays = useMemo(() => getActivePracticeDayCount(progress), [progress]);
  const currentPhaseLabel =
    activePracticeDays <= 5
      ? t.progress.phaseDip
      : activePracticeDays <= 15
        ? t.progress.phaseClick
        : t.progress.phaseFlow;

  const selectedDay =
    diaryDays.find((d) => d.key === selectedDateKey) ?? diaryDays[diaryDays.length - 1];

  const selectedDateFormatted = useMemo(() => {
    const locale = settings.uiLang === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(selectedDay.date);
  }, [selectedDay.date, settings.uiLang]);

  // Per-finger breakdown across all 8 non-thumb fingers
  const fingerBreakdown = useMemo(() => {
    const map: Record<FingerId, { hits: number; misses: number; totalMs: number }> = {
      'left-pinky': { hits: 0, misses: 0, totalMs: 0 },
      'left-ring': { hits: 0, misses: 0, totalMs: 0 },
      'left-middle': { hits: 0, misses: 0, totalMs: 0 },
      'left-index': { hits: 0, misses: 0, totalMs: 0 },
      thumb: { hits: 0, misses: 0, totalMs: 0 },
      'right-index': { hits: 0, misses: 0, totalMs: 0 },
      'right-middle': { hits: 0, misses: 0, totalMs: 0 },
      'right-ring': { hits: 0, misses: 0, totalMs: 0 },
      'right-pinky': { hits: 0, misses: 0, totalMs: 0 },
    };

    for (const [code, stat] of Object.entries(layoutStats)) {
      const k = KEY_BY_CODE[code];
      if (!k || k.isModifier) continue;
      const bucket = map[k.finger];
      bucket.hits += stat.hits;
      bucket.misses += stat.misses;
      bucket.totalMs += stat.totalLatencyMs;
    }

    return FINGER_ORDER.map((fid) => {
      const b = map[fid];
      const total = b.hits + b.misses;
      const accuracy = total > 0 ? Math.round((b.hits / total) * 100) : null;
      const avgMs = b.hits > 0 ? Math.round(b.totalMs / b.hits) : null;
      return { finger: fid, total, accuracy, avgMs };
    });
  }, [layoutStats]);

  const hasAnyStats = totals.totalKeys > 0;

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Header + Layout Toggle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1C1B18]">
            {t.progress.heading}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#635F57] leading-relaxed">
            {t.progress.lead}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Stats layout"
            className="inline-flex items-center p-1 rounded-lg bg-[#ECE8DF] border border-[#E2DDD3]"
          >
            {(['ru', 'en'] as LayoutId[]).map((lid) => (
              <button
                key={lid}
                type="button"
                onClick={() => onUpdateSettings({ layout: lid })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  settings.layout === lid
                    ? 'bg-white text-[#1C1B18] shadow-xs'
                    : 'text-[#635F57] hover:text-[#1C1B18]'
                }`}
              >
                {lid === 'ru' ? t.controls.layoutRu : t.controls.layoutEn}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onStartAdaptiveDrill}
            className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            {t.progress.drillWeakest}
          </button>
        </div>
      </div>

      {/* 4-Column Clean KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t.progress.sessions, value: String(totals.count) },
          { label: t.progress.avgWpm, value: totals.avgWpm > 0 ? String(totals.avgWpm) : '—' },
          {
            label: t.progress.avgAccuracy,
            value: totals.avgAccuracy > 0 ? `${totals.avgAccuracy}%` : '—',
          },
          { label: t.progress.totalKeys, value: String(totals.totalKeys) },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl bg-white border border-[#E2DDD3] p-5 flex flex-col gap-1"
          >
            <span className="text-xs text-[#635F57]">{kpi.label}</span>
            <span className="font-mono-typing text-2xl font-semibold text-[#1C1B18]">
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* 28-Day Practice Diary Calendar */}
      <section className="rounded-2xl bg-white border border-[#E2DDD3] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1B18]">{t.progress.diaryTitle}</h2>
            <p className="text-xs text-[#635F57] mt-0.5">{currentPhaseLabel}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#635F57]">
            <span className="font-mono-typing">
              {t.progress.diaryDaysLabel}:{' '}
              <strong className="text-[#1C1B18] font-semibold">{activePracticeDays}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>{t.progress.diaryGoalNote}</span>
          </div>
        </div>

        {/* 4×7 Calendar Grid (last 28 days ending today) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {diaryDays.map((day) => {
            const goalMet = day.seconds >= 15 * 60;
            const practiced = day.seconds > 0 || day.drills > 0;
            const isSelected = day.key === selectedDay.key;

            let tileStyle = 'bg-[#F4F1EA] border-[#E7E2D8] text-[#635F57] hover:border-[#C7BFAF]';
            if (goalMet) {
              tileStyle = 'bg-[#15803D] border-[#15803D] text-white';
            } else if (practiced) {
              tileStyle = 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]';
            }

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDateKey(day.key)}
                className={`rounded-xl border px-2 py-2 flex flex-col justify-between min-h-[58px] text-left transition-colors cursor-pointer ${tileStyle} ${
                  isSelected ? 'ring-2 ring-[#1D4ED8] ring-offset-1' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-mono-typing font-semibold">{day.dayNum}</span>
                  <span className={goalMet ? 'text-white/80 text-[10px]' : 'opacity-65 text-[10px]'}>
                    {day.weekday}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1 mt-1">
                  {practiced ? (
                    <span className="font-mono-typing text-[11px] font-semibold">
                      {day.minutes}
                      {t.practice.minUnit}
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-40">
                      {day.isToday ? '·' : ''}
                    </span>
                  )}
                  {goalMet && <Check className="w-3 h-3 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Unboxed Tabular Diary Summary */}
        <div className="pt-3 border-t border-[#F0ECE3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-[#1C1B18] capitalize">{selectedDateFormatted}</span>
          {selectedDay.seconds === 0 && selectedDay.drills === 0 ? (
            <span className="text-[#635F57]">{t.progress.diaryEmptyDay}</span>
          ) : (
            <div className="flex flex-wrap items-center gap-3 font-mono-typing text-[#635F57]">
              <span>
                <strong
                  className={
                    selectedDay.seconds >= 15 * 60
                      ? 'text-[#15803D] font-semibold'
                      : 'text-[#1C1B18] font-semibold'
                  }
                >
                  {selectedDay.minutes}/15
                </strong>{' '}
                {t.practice.minUnit}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-[#1C1B18] font-semibold">{selectedDay.drills}</strong>{' '}
                {t.progress.diaryDrills}
              </span>
              {selectedDay.avgWpm !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    <strong className="text-[#1C1B18] font-semibold">{selectedDay.avgWpm}</strong>{' '}
                    {t.practice.wpm}
                  </span>
                </>
              )}
              {selectedDay.avgAccuracy !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    <strong className="text-[#15803D] font-semibold">
                      {selectedDay.avgAccuracy}%
                    </strong>{' '}
                    {t.practice.accuracy.toLowerCase()}
                  </span>
                </>
              )}
              {selectedDay.avgRhythm !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    <strong className="text-[#1C1B18] font-semibold">
                      {selectedDay.avgRhythm}%
                    </strong>{' '}
                    {t.practice.rhythm.toLowerCase()}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Keyboard Error & Latency Heatmap */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1C1B18]">{t.progress.heatmapTitle}</h2>
          <div className="inline-flex items-center p-1 rounded-lg bg-[#ECE8DF] border border-[#E2DDD3]">
            <button
              type="button"
              onClick={() => setHeatmapMetric('errors')}
              className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                heatmapMetric === 'errors'
                  ? 'bg-white text-[#1C1B18] shadow-xs'
                  : 'text-[#635F57]'
              }`}
            >
              {t.progress.heatmapErrors}
            </button>
            <button
              type="button"
              onClick={() => setHeatmapMetric('speed')}
              className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                heatmapMetric === 'speed'
                  ? 'bg-white text-[#1C1B18] shadow-xs'
                  : 'text-[#635F57]'
              }`}
            >
              {t.progress.heatmapSpeed}
            </button>
          </div>
        </div>

        <KeyboardVisualizer
          layout={settings.layout}
          ruPunctuation={settings.ruPunctuation}
          hintMode="dual"
          showFingerZones={false}
          heatmapStats={layoutStats}
          heatmapMetric={heatmapMetric}
        />

        {!hasAnyStats && (
          <p className="text-sm text-[#635F57]">{t.progress.heatmapEmpty}</p>
        )}
      </section>

      {/* 10-Finger Balance Breakdown */}
      <section className="rounded-2xl bg-white border border-[#E2DDD3] p-5 sm:p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#1C1B18]">{t.progress.fingersTitle}</h2>

        {!hasAnyStats ? (
          <p className="text-sm text-[#635F57]">{t.progress.fingersEmpty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
            {fingerBreakdown.map((item) => {
              const zone = FINGER_ZONE_COLORS[item.finger];
              const barPct = item.accuracy ?? 0;
              return (
                <div key={item.finger} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1C1B18]">
                      {FINGER_NAMES[settings.uiLang][item.finger]}
                    </span>
                    <div className="flex items-center gap-2 font-mono-typing text-[#635F57]">
                      <span>{item.accuracy !== null ? `${item.accuracy}%` : '—'}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {item.avgMs !== null ? `${item.avgMs} ${t.progress.msUnit}` : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1EDE4] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor:
                          item.accuracy !== null && item.accuracy < 90
                            ? '#B91C1C'
                            : zone.stroke,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Sessions + Reset Action */}
      <section className="rounded-2xl bg-white border border-[#E2DDD3] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1C1B18]">{t.progress.recentTitle}</h2>

          {confirmingReset ? (
            <div className="inline-flex items-center gap-2 text-xs">
              <span className="text-[#635F57]">{t.progress.resetConfirm}</span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmingReset(false);
                }}
                className="px-2.5 py-1 rounded-md bg-[#B91C1C] text-white font-semibold cursor-pointer"
              >
                {t.progress.confirmYes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="px-2.5 py-1 rounded-md bg-[#F4F1EA] text-[#1C1B18] font-medium cursor-pointer"
              >
                {t.progress.confirmCancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="text-xs font-medium text-[#635F57] hover:text-[#B91C1C] transition-colors cursor-pointer"
            >
              {t.progress.resetBtn}
            </button>
          )}
        </div>

        {layoutSessions.length === 0 ? (
          <p className="text-sm text-[#635F57]">{t.progress.recentEmpty}</p>
        ) : (
          <div className="divide-y divide-[#F0ECE3]">
            {layoutSessions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="py-2.5 flex items-center justify-between gap-4 text-sm"
              >
                <span className="font-medium text-[#1C1B18] truncate">
                  {s.lessonTitle[settings.uiLang]}
                </span>
                <div className="flex items-center gap-3 font-mono-typing text-xs text-[#635F57] shrink-0">
                  <span className="font-semibold text-[#1C1B18]">
                    {s.wpm} {t.practice.wpm}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={s.accuracy >= 95 ? 'text-[#15803D]' : 'text-[#B91C1C]'}>
                    {s.accuracy}%
                  </span>
                  {s.rhythmScore !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {t.practice.rhythm}: {s.rhythmScore}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
