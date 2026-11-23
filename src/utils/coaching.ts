import {
  CoachingMemory,
  DrillMode,
  HintMode,
  LayoutId,
  Lesson,
  ProgressData,
  UiLang,
} from '../types';
import { TargetKeyInfo } from '../data/keyboard';
import { getTodayDateKey } from './storage';

export const FAR_RIGHT_EDGE_CODES = new Set([
  'BracketLeft',
  'BracketRight',
  'Quote',
  'Slash',
  'Backslash',
]);

export const FAR_LEFT_EDGE_CODES = new Set(['Backquote']);

export interface RhythmAnalysis {
  score: number; // 0..100
  isSpiky: boolean;
  ratio: number; // slow quartile median / fast quartile median
  sampleCount: number;
}

export function computeRhythmScore(rawIntervalsMs: number[]): RhythmAnalysis {
  // Ignore external pauses > 1800ms or accidental double-fires < 35ms
  const clean = rawIntervalsMs.filter((ms) => ms >= 35 && ms <= 1800);
  if (clean.length < 6) {
    return { score: 100, isSpiky: false, ratio: 1, sampleCount: clean.length };
  }

  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  const variance = clean.reduce((sum, x) => sum + (x - mean) ** 2, 0) / clean.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;

  const sorted = [...clean].sort((a, b) => a - b);
  const qSize = Math.max(1, Math.floor(sorted.length / 4));
  const fastMedian = sorted[Math.floor(qSize / 2)];
  const slowMedian = sorted[sorted.length - 1 - Math.floor(qSize / 2)];
  const ratio = fastMedian > 0 ? Number((slowMedian / fastMedian).toFixed(1)) : 1;

  // Map CV cleanly: CV <= 0.16 => ~96–100%, CV ~ 0.35 => ~78%, CV >= 0.65 => ~46%
  const rawScore = 100 - Math.max(0, cv - 0.14) * 105;
  const score = Math.max(35, Math.min(100, Math.round(rawScore)));
  const isSpiky = score < 72 || ratio >= 2.3;

  return { score, isSpiky, ratio, sampleCount: clean.length };
}

export interface LiveKeyCue {
  kind: 'glide' | 'shift';
  text: string;
}

/**
 * Returns an ultra-readable, zero-jargon live cue ONLY when a special physical motion helps
 * (far-pinky hand glide with exact F/J beacon, or explicit opposite-hand Shift).
 */
export function getLiveKeyCue(
  targetInfo: TargetKeyInfo | null,
  layout: LayoutId,
  uiLang: UiLang
): LiveKeyCue | null {
  if (!targetInfo) return null;

  const code = targetInfo.key.code;

  if (FAR_RIGHT_EDGE_CODES.has(code)) {
    const beacon = layout === 'ru' ? 'О (J)' : 'J';
    const shiftPrefix = targetInfo.needsShift
      ? uiLang === 'ru'
        ? 'Левый ⇧ + '
        : 'L⇧ + '
      : '';
    return {
      kind: 'glide',
      text:
        uiLang === 'ru'
          ? `${shiftPrefix}→ сдвиг П руки · назад на ${beacon}`
          : `${shiftPrefix}→ slide R hand · feel ${beacon} back`,
    };
  }

  if (FAR_LEFT_EDGE_CODES.has(code)) {
    const beacon = layout === 'ru' ? 'А (F)' : 'F';
    return {
      kind: 'glide',
      text:
        uiLang === 'ru'
          ? `← сдвиг Л руки · назад на ${beacon}`
          : `← slide L hand · feel ${beacon} back`,
    };
  }

  if (targetInfo.shiftCode === 'ShiftLeft') {
    return {
      kind: 'shift',
      text: uiLang === 'ru' ? 'Держите левый ⇧' : 'Hold Left ⇧',
    };
  }

  if (targetInfo.shiftCode === 'ShiftRight') {
    return {
      kind: 'shift',
      text: uiLang === 'ru' ? 'Держите правый ⇧' : 'Hold Right ⇧',
    };
  }

  return null;
}

export interface RightPanelCoach {
  label: string;
  body: string;
  suggestedHint?: HintMode;
}

export function getActivePracticeDayCount(progress: ProgressData): number {
  const days = new Set<string>();
  for (const [k, v] of Object.entries(progress.dailyDiary ?? {})) {
    if (v.seconds > 0 || v.drills > 0) days.add(k);
  }
  for (const [k, secs] of Object.entries(progress.dailyActiveSeconds ?? {})) {
    if (secs > 0) days.add(k);
  }
  return days.size;
}

const PREFLIGHT_TIPS: { en: { label: string; body: string }; ru: { label: string; body: string } }[] = [
  {
    en: {
      label: 'Daily posture check',
      body: 'Fold keyboard feet flat, keep wrists straight and floating lightly, and feel the F (А) & J (О) bumps before starting.',
    },
    ru: {
      label: 'Проверка посадки',
      body: 'Сложите ножки клавиатуры, держите запястья прямо и легко на весу, нащупайте выступы F (А) и J (О) перед стартом.',
    },
  },
  {
    en: {
      label: 'Eyes on screen',
      body: 'Resist glancing down at your unlabeled US keys—use the screen diagram if stuck, and re-center by touching the F/J bumps.',
    },
    ru: {
      label: 'Взгляд на экран',
      body: 'Не смотрите вниз на клавиши без русских букв — при паузе смотрите на схему экрана, а руки выравнивайте по выступам F/J.',
    },
  },
  {
    en: {
      label: 'Light touch',
      body: 'Drop your shoulders and tap keys with just enough weight to trigger them—soft strokes prevent fatigue and speed up fingers.',
    },
    ru: {
      label: 'Лёгкое касание',
      body: 'Опустите плечи и нажимайте клавиши мягко, без сильного удара — расслабленные кисти быстрее набирают темп.',
    },
  },
  {
    en: {
      label: 'Look one word ahead',
      body: 'Let your eyes read the next word while your fingers finish the current one—this smooths rhythm across every stage.',
    },
    ru: {
      label: 'Смотрите на слово вперёд',
      body: 'Переводите взгляд на следующее слово, пока пальцы допечатывают текущее — так быстрее складывается ровный ритм.',
    },
  },
];

/**
 * Evaluates once when a drill is loaded/reset (frozen during typing so nothing flickers mid-word).
 */
export function selectRightPanelCoach(params: {
  lesson: Lesson;
  drillMode: DrillMode;
  hintMode: HintMode;
  uiLang: UiLang;
  progress: ProgressData;
}): RightPanelCoach {
  const { lesson, drillMode, hintMode, uiLang, progress } = params;
  const today = getTodayDateKey();
  const todayDrills = progress.dailyDiary?.[today]?.drills ?? 0;
  const activeDays = getActivePracticeDayCount(progress);
  const comp = progress.completions[lesson.id];

  // 1. Start-of-day pre-flight check (only before first completed drill today)
  if (todayDrills === 0) {
    const idx = (progress.coaching?.preflightIndex ?? 0) % PREFLIGHT_TIPS.length;
    return PREFLIGHT_TIPS[idx][uiLang];
  }

  // 2. Stage 6 (Unlabeled Edge Keys) explicit blind-glide choreography
  if (lesson.id === 'ru-06-unlabeled-edges') {
    return uiLang === 'ru'
      ? {
          label: 'Как сдвигать кисть вслепую',
          body: 'Не смотрите на клавиатуру: слегка сдвиньте всю правую руку на 1 клавишу вправо к Х/Ъ/Э, нажмите мизинцем и нащупайте указательным выступ О (J) обратно.',
        }
      : {
          label: 'How to glide blind',
          body: 'Keep eyes on screen: slide your whole right hand 1 key right for Х/Ъ/Э, tap lightly with your pinky, then feel the J (О) bump with your index finger to re-center.',
        };
  }

  // 3. Progressive blindfold step-up nudge when stage accuracy is already strong
  if (comp && comp.bestAccuracy >= 96 && comp.completions >= 1 && hintMode !== 'blind') {
    const nextHint: HintMode = hintMode === 'dual' ? 'target' : 'blind';
    return uiLang === 'ru'
      ? {
          label: 'Готовы убрать часть подсказок',
          body:
            nextHint === 'target'
              ? 'Точность на этом этапе уже 96%+ — попробуйте скрыть US-подписи, чтобы мозг напрямую связывал позицию с русской буквой.'
              : 'Отличная точность! Попробуйте слепой режим: клавиши станут пустыми и мягко проявятся только при паузе.',
          suggestedHint: nextHint,
        }
      : {
          label: 'Ready to fade hints',
          body:
            nextHint === 'target'
              ? 'You already hit 96%+ accuracy here—try hiding US labels so each finger links directly to the Russian letter.'
              : 'Strong accuracy! Try Blind mode: keycaps fade blank and softly peek only if you pause.',
          suggestedHint: nextHint,
        };
  }

  // 4. Shuffled Words & Chords focus cue
  if (drillMode === 'mix') {
    return uiLang === 'ru'
      ? {
          label: 'Режим микса и аккордов',
          body: 'Слова перемешаны с частыми слогами и сюрпризами из прошлых этапов. Печатайте слоги слитно, как единый аккорд, не заучивая строку.',
        }
      : {
          label: 'Shuffle & chord reflex mode',
          body: 'Words are randomized with syllable chords and surprise reviews. Roll each 2–3 letter chord smoothly and read one word ahead.',
        };
  }

  // 5. Days 1–5 retraining dip reassurance (shown occasionally after 2+ drills today)
  if (activeDays <= 5 && todayDrills === 2) {
    return uiLang === 'ru'
      ? {
          label: 'Первая неделя переучивания',
          body: 'Медленный темп в первые 5 дней — норма: мозг переписывает 30-летнюю привычку двух пальцев. Точность сейчас важнее скорости.',
        }
      : {
          label: 'Days 1–5 retraining dip',
          body: 'Feeling slow in week one is expected—your brain is overwriting 30 years of two-finger reflexes. Stay calm and protect accuracy.',
        };
  }

  // 6. Default: tailored ergonomic stage focus
  return {
    label: uiLang === 'ru' ? 'Фокус этапа' : 'Stage focus',
    body: lesson.tip[uiLang],
  };
}

export interface BetweenDrillGuard {
  id: string;
  tone: 'emerald' | 'amber' | 'cobalt' | 'stone';
  text: string;
  actionHint?: HintMode;
}

/**
 * Non-starving, cooldown-managed coaching scheduler for the completion summary.
 * Prevents conflicting pairs and ensures no single guard monopolizes every drill.
 */
export function selectBetweenDrillGuard(params: {
  lesson: Lesson;
  layout: LayoutId;
  hintMode: HintMode;
  uiLang: UiLang;
  accuracy: number;
  rhythm: RhythmAnalysis;
  weakestCodes: string[];
  todaySecs: number;
  continuousBlockSecs: number;
  prevDrillAccuracy?: number;
  coaching: CoachingMemory;
}): BetweenDrillGuard {
  const {
    lesson,
    layout,
    hintMode,
    uiLang,
    accuracy,
    rhythm,
    weakestCodes,
    todaySecs,
    continuousBlockSecs,
    prevDrillAccuracy,
    coaching,
  } = params;

  const nextDrillNum = (coaching?.totalDrills ?? 0) + 1;
  const lastSeen = coaching?.guardLastDrill ?? {};

  const isOffCooldown = (id: string, cooldown: number) => {
    const prev = lastSeen[id];
    if (prev === undefined) return true;
    return nextDrillNum - prev >= cooldown;
  };

  const isFatigueDip =
    accuracy < 91 &&
    prevDrillAccuracy !== undefined &&
    (prevDrillAccuracy < 92 || prevDrillAccuracy - accuracy >= 6);

  const hasEdgeTrouble = weakestCodes.some(
    (c) => FAR_RIGHT_EDGE_CODES.has(c) || FAR_LEFT_EDGE_CODES.has(c)
  );

  interface Candidate {
    guard: BetweenDrillGuard;
    weight: number;
    cooldown: number;
  }

  const candidates: Candidate[] = [];

  // 1. Daily 25m wind-down (gentle, non-blocking, cooldown 6 drills so it doesn't nag)
  if (todaySecs >= 25 * 60 && isOffCooldown('daily-25m', 6)) {
    candidates.push({
      weight: 96,
      cooldown: 6,
      guard: {
        id: 'daily-25m',
        tone: 'emerald',
        text:
          uiLang === 'ru'
            ? 'Сегодня уже 25+ мин практики — отличный результат! Дальше польза снижается: лучше дать кистям отдых и закрепить навык во сне.'
            : '25+ min of active practice today—great session! Diminishing returns kick in now; resting lets your wrists recover and sleep lock in muscle memory.',
      },
    });
  } else if (todaySecs >= 15 * 60 && isOffCooldown('daily-15m', 5)) {
    // Mutually exclusive with daily-25m; fires once at 15m then rests 5 drills so other cues get their turn
    candidates.push({
      weight: 92,
      cooldown: 5,
      guard: {
        id: 'daily-15m',
        tone: 'emerald',
        text:
          uiLang === 'ru'
            ? '15 минут сосредоточенной практики сегодня выполнены — оптимальный момент остановиться (или продолжить ещё чуть-чуть, если руки лёгкие).'
            : '15 min of focused practice reached today—the sweet spot to stop and let sleep consolidate muscle memory (you can still continue if hands feel fresh).',
      },
    });
  }

  // 2. Continuous 10-min micro-break guard
  if (continuousBlockSecs >= 10 * 60 && isOffCooldown('micro-break-10m', 4)) {
    candidates.push({
      weight: 88,
      cooldown: 4,
      guard: {
        id: 'micro-break-10m',
        tone: 'amber',
        text:
          uiLang === 'ru'
            ? '10 минут подряд без перерыва — опустите плечи и мягко встряхните кисти на 20 секунд, прежде чем продолжить.'
            : '10 minutes straight—drop your shoulders and shake out your wrists gently for 20 seconds before the next drill.',
      },
    });
  }

  // 3. Fatigue dip guard (mutually exclusive with stage-ready)
  if (isFatigueDip && isOffCooldown('fatigue-dip', 2)) {
    candidates.push({
      weight: 86,
      cooldown: 2,
      guard: {
        id: 'fatigue-dip',
        tone: 'amber',
        text:
          uiLang === 'ru'
            ? 'Точность просела в последних двух подходах — признак усталости пальцев. Сделайте паузу на 2 минуты, чтобы не закреплять ошибки.'
            : 'Accuracy dipped across consecutive drills—a classic finger-fatigue signal. Take a 2-minute pause so you don’t practice mistakes.',
      },
    });
  }

  // 4. Outer pinky glide reminder (with explicit F/J touch beacon & eyes-on-screen guidance)
  if (hasEdgeTrouble && isOffCooldown('pinky-glide', 3)) {
    const beacon = layout === 'ru' ? 'О (J)' : 'J';
    candidates.push({
      weight: 78,
      cooldown: 3,
      guard: {
        id: 'pinky-glide',
        tone: 'cobalt',
        text:
          uiLang === 'ru'
            ? `Крайние клавиши мизинца вызвали сбой — не тяните палец силой и не смотрите вниз. Сдвигайте всю правую кисть чуть вправо, нажимайте и нащупывайте выступ ${beacon} обратно.`
            : `Outer pinky keys caused hesitation—avoid stretching or looking down. Glide your whole right hand slightly over, tap lightly, and feel the ${beacon} bump to re-center.`,
      },
    });
  }

  // 5. Burst-vs-Rhythm guard (only when accuracy is decent so we don't conflict with fatigue/accuracy coaching)
  if (rhythm.isSpiky && rhythm.sampleCount >= 10 && accuracy >= 91 && isOffCooldown('rhythm-spiky', 3)) {
    candidates.push({
      weight: 74,
      cooldown: 3,
      guard: {
        id: 'rhythm-spiky',
        tone: 'cobalt',
        text:
          uiLang === 'ru'
            ? `Ритм неровный (${rhythm.score}%, быстрые клавиши в ${rhythm.ratio}× быстрее медленных). Чуть замедлите знакомые буквы — ровный темп строит рефлексы быстрее рывков.`
            : `Uneven rhythm (${rhythm.score}%, easy keys are ${rhythm.ratio}× faster than hard ones). Slow your fast keys slightly—an even cadence builds reflexes faster than bursts.`,
      },
    });
  }

  // 6. Blindfold step-up invitation when accuracy & rhythm are both clean
  if (accuracy >= 97 && !rhythm.isSpiky && hintMode !== 'blind' && isOffCooldown('blindfold-ready', 5)) {
    const nextHint: HintMode = hintMode === 'dual' ? 'target' : 'blind';
    candidates.push({
      weight: 66,
      cooldown: 5,
      guard: {
        id: 'blindfold-ready',
        tone: 'cobalt',
        actionHint: nextHint,
        text:
          uiLang === 'ru'
            ? nextHint === 'target'
              ? 'Точность 97%+ и ровный ритм — попробуйте режим «Только RU», чтобы отвязаться от латинских подписей.'
              : 'Точность 97%+ и ровный ритм — попробуйте слепой режим, чтобы закрепить чистую мышечную память.'
            : nextHint === 'target'
              ? '97%+ accuracy and steady rhythm—try RU Only hints next to detach from the US legends.'
              : '97%+ accuracy and steady rhythm—try Blind mode next to lock in pure fingertip memory.',
      },
    });
  }

  // Pick highest-weight eligible guard (adjusting slightly for freshness so older guards win ties)
  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      const aAge = lastSeen[a.guard.id] === undefined ? 999 : nextDrillNum - lastSeen[a.guard.id];
      const bAge = lastSeen[b.guard.id] === undefined ? 999 : nextDrillNum - lastSeen[b.guard.id];
      const aScore = a.weight + Math.min(aAge, 10) * 0.5;
      const bScore = b.weight + Math.min(bAge, 10) * 0.5;
      return bScore - aScore;
    });
    return candidates[0].guard;
  }

  // Clean, non-conflicting default readiness cue
  if (accuracy >= lesson.targetAccuracy && !isFatigueDip) {
    return {
      id: 'stage-ready',
      tone: 'cobalt',
      text:
        uiLang === 'ru'
          ? `Точность достигнута (≥${lesson.targetAccuracy}%) — переходите дальше (Enter) или нажмите Tab для свежего микса со слогами.`
          : `Accuracy target met (≥${lesson.targetAccuracy}%) — advance now (Enter) or press Tab for a fresh shuffled chord mix.`,
    };
  }

  return {
    id: 'stage-repeat',
    tone: 'stone',
    text:
      uiLang === 'ru'
        ? `Нажмите Tab для свежего микса и пройдите спокойно с целью ${lesson.targetAccuracy}%+ точности.`
        : `Press Tab for a fresh shuffled mix and aim calmly for ${lesson.targetAccuracy}%+ accuracy.`,
  };
}
