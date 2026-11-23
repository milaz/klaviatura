import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { FingerId, KeyDef, UserSettings } from '../types';
import { COPY, FINGER_NAMES } from '../data/i18n';
import {
  computeReachDirection,
  FINGER_HOME_CODE,
  FINGER_ZONE_COLORS,
  getKeyGlyphs,
  KEY_BY_CODE,
  TargetKeyInfo,
} from '../data/keyboard';
import { playCompleteChime, playKeyClick } from '../utils/audio';
import { KeyboardVisualizer } from './KeyboardVisualizer';
import { HandVisualizer } from './HandVisualizer';

interface HandGuideViewProps {
  settings: UserSettings;
  onGoToPractice: () => void;
}

const HOME_ROW_CODES = [
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyF',
  'KeyJ',
  'KeyK',
  'KeyL',
  'Semicolon',
];

const UNLABELED_EDGE_LANDMARKS = [
  { code: 'BracketLeft', us: '[', ru: 'Х', finger: 'right-pinky' as FingerId },
  { code: 'BracketRight', us: ']', ru: 'Ъ', finger: 'right-pinky' as FingerId },
  { code: 'Semicolon', us: ';', ru: 'Ж', finger: 'right-pinky' as FingerId },
  { code: 'Quote', us: "'", ru: 'Э', finger: 'right-pinky' as FingerId },
  { code: 'Backquote', us: '`', ru: 'Ё', finger: 'left-pinky' as FingerId },
  { code: 'Comma', us: ',', ru: 'Б', finger: 'right-middle' as FingerId },
  { code: 'Period', us: '.', ru: 'Ю', finger: 'right-ring' as FingerId },
  { code: 'Slash', us: '/', ru: '.  ⇧,', finger: 'right-pinky' as FingerId },
];

export function HandGuideView({ settings, onGoToPractice }: HandGuideViewProps) {
  const t = COPY[settings.uiLang];
  const [calibrated, setCalibrated] = useState<Set<string>>(new Set());
  const [activeKey, setActiveKey] = useState<KeyDef | null>(KEY_BY_CODE['KeyF']);
  const [activeFinger, setActiveFinger] = useState<FingerId | null>('left-index');
  const [pressedCode, setPressedCode] = useState<string | null>(null);

  const allCalibrated = calibrated.size === HOME_ROW_CODES.length;

  // Hands-free physical keyboard listener: pressing any key calibrates home row AND explores its finger column!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const keyDef = KEY_BY_CODE[e.code];
      if (!keyDef) return;
      if (e.code === 'Space') e.preventDefault();

      setPressedCode(e.code);
      if (!keyDef.isModifier) {
        setActiveKey(keyDef);
        setActiveFinger(keyDef.finger);
        if (settings.soundEnabled) {
          playKeyClick(e.code === 'Space');
        }
      }

      if (HOME_ROW_CODES.includes(e.code)) {
        setCalibrated((prev) => {
          if (prev.has(e.code)) return prev;
          const next = new Set(prev);
          next.add(e.code);
          if (next.size === HOME_ROW_CODES.length && settings.soundEnabled) {
            playCompleteChime();
          }
          return next;
        });
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
  }, [settings.soundEnabled]);

  const inspectedTargetInfo: TargetKeyInfo | null = activeKey
    ? {
        key: activeKey,
        needsShift: false,
        shiftCode: null,
        direction: computeReachDirection(activeKey, FINGER_HOME_CODE[activeKey.finger]),
        homeCode: FINGER_HOME_CODE[activeKey.finger],
      }
    : null;

  const activeGlyphs = activeKey
    ? getKeyGlyphs(activeKey, settings.layout, settings.ruPunctuation)
    : null;

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1C1B18]">
            {t.guide.heading}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#635F57] leading-relaxed">
            {t.guide.lead}
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToPractice}
          className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
        >
          {t.guide.startPractice}
        </button>
      </div>

      {/* 1. Blind Home-Row Calibrator (Hands-on-keyboard immediate check) */}
      <section className="rounded-2xl bg-white border border-[#E2DDD3] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1B18]">{t.guide.calibratorTitle}</h2>
            <p className="text-sm text-[#635F57] mt-1">{t.guide.calibratorDesc}</p>
          </div>

          <button
            type="button"
            onClick={() => setCalibrated(new Set())}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2DDD3] text-xs font-medium text-[#635F57] hover:text-[#1C1B18] hover:border-[#B7AFA2] cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.guide.calibratorReset}</span>
          </button>
        </div>

        {/* 8 Home Row Keys Row (Left 4 · Gap · Right 4) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
          {HOME_ROW_CODES.map((code, index) => {
            const k = KEY_BY_CODE[code];
            const done = calibrated.has(code);
            const isBump = Boolean(k.isBump);
            const glyph = getKeyGlyphs(k, settings.layout, settings.ruPunctuation).base.toUpperCase();
            const zone = FINGER_ZONE_COLORS[k.finger];

            return (
              <div key={code} className={`flex items-center ${index === 4 ? 'ml-3 sm:ml-6' : ''}`}>
                <div
                  style={{
                    backgroundColor: done ? '#DCFCE7' : zone.bg,
                    borderColor: done ? '#15803D' : zone.border,
                  }}
                  className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-colors"
                >
                  {settings.layout === 'ru' && (
                    <span className="absolute top-1 left-1.5 font-mono-typing text-[10px] text-[#635F57] uppercase">
                      {k.us}
                    </span>
                  )}
                  <span
                    className={`font-mono-typing text-lg font-bold ${
                      done ? 'text-[#15803D]' : 'text-[#1C1B18]'
                    }`}
                  >
                    {glyph}
                  </span>
                  {done && (
                    <Check className="w-3.5 h-3.5 text-[#15803D] absolute top-1 right-1" />
                  )}
                  {isBump && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1.5 w-4 h-[2.5px] rounded-full bg-[#1C1B18] opacity-75"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allCalibrated && (
          <p className="text-center text-sm font-semibold text-[#15803D]">
            ✓ {t.guide.calibratorDone}
          </p>
        )}
      </section>

      {/* 2. Live Finger-Column Explorer (Responds to physical keypresses!) */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1B18]">{t.guide.explorerTitle}</h2>
            <p className="text-sm text-[#635F57] mt-0.5">{t.guide.explorerDesc}</p>
          </div>

          {activeKey && activeGlyphs && (
            <div className="inline-flex items-center gap-2.5 text-xs font-mono-typing">
              <span
                style={{
                  backgroundColor: FINGER_ZONE_COLORS[activeKey.finger].bg,
                  color: FINGER_ZONE_COLORS[activeKey.finger].text,
                  borderColor: FINGER_ZONE_COLORS[activeKey.finger].border,
                }}
                className="px-2.5 py-1 rounded-md border font-sans font-semibold"
              >
                {FINGER_NAMES[settings.uiLang][activeKey.finger]}
              </span>
              {settings.layout === 'ru' && activeKey.code !== 'Space' && (
                <>
                  <span className="px-2 py-1 rounded bg-white border border-[#E2DDD3] text-[#635F57]">
                    US {activeKey.us.toUpperCase()}
                  </span>
                  <span aria-hidden="true" className="text-[#8A8479]">→</span>
                </>
              )}
              <span className="px-2.5 py-1 rounded bg-[#1D4ED8] text-white font-semibold">
                {activeKey.code === 'Space' ? '␣' : activeGlyphs.base.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <KeyboardVisualizer
          layout={settings.layout}
          ruPunctuation={settings.ruPunctuation}
          hintMode="dual"
          showFingerZones={true}
          targetInfo={inspectedTargetInfo}
          pressedCode={pressedCode}
          highlightFinger={activeFinger}
          calibratedCodes={calibrated}
          onKeySelect={(k) => {
            if (!k.isModifier) {
              setActiveKey(k);
              setActiveFinger(k.finger);
            }
          }}
        />

        <div className="pt-1">
          <HandVisualizer
            activeFinger={activeFinger}
            direction={inspectedTargetInfo?.direction ?? null}
            layout={settings.layout}
            uiLang={settings.uiLang}
            interactive={true}
            onSelectFinger={(fid) => {
              setActiveFinger(fid);
              if (fid) {
                const home = KEY_BY_CODE[FINGER_HOME_CODE[fid]];
                if (home) setActiveKey(home);
              }
            }}
          />
        </div>
      </section>

      {/* 3. Unlabeled US Edge-Key Cheat Map (Crucial for US Keyboard + Russian Typing) */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1C1B18]">{t.guide.edgeTitle}</h2>
          <p className="text-sm text-[#635F57] mt-0.5">{t.guide.edgeDesc}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {UNLABELED_EDGE_LANDMARKS.map((item) => {
            const zone = FINGER_ZONE_COLORS[item.finger];
            return (
              <div
                key={item.code}
                className="rounded-xl bg-white border border-[#E2DDD3] p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 font-mono-typing">
                  <span className="w-8 h-8 rounded-lg bg-[#F4F1EA] border border-[#DDD7CA] flex items-center justify-center text-sm font-semibold text-[#635F57]">
                    {item.us}
                  </span>
                  <span aria-hidden="true" className="text-[#8A8479] text-xs">→</span>
                  <span className="text-lg font-bold text-[#1C1B18]">{item.ru}</span>
                </div>
                <span
                  style={{ color: zone.text }}
                  className="text-[11px] font-semibold text-right leading-tight"
                >
                  {FINGER_NAMES[settings.uiLang][item.finger]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Four Rules to Break the 30-Year 2-Finger Habit */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#1C1B18]">{t.guide.rulesTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.guide.rules.map((rule) => (
            <div
              key={rule.title}
              className="rounded-2xl bg-white border border-[#E2DDD3] p-5 flex flex-col gap-2"
            >
              <h3 className="text-base font-semibold text-[#1C1B18]">{rule.title}</h3>
              <p className="text-sm text-[#635F57] leading-relaxed">{rule.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Ergonomics & Preventing RSI */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1C1B18]">{t.guide.ergonomicsTitle}</h2>
          <p className="text-sm text-[#635F57] mt-0.5">{t.guide.ergonomicsLead}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.guide.ergonomics.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-[#E2DDD3] p-5 flex flex-col gap-2"
            >
              <h3 className="text-base font-semibold text-[#1C1B18]">{item.title}</h3>
              <p className="text-sm text-[#635F57] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Daily Pace & Realistic Progress Timeline */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1C1B18]">{t.guide.paceTitle}</h2>
          <p className="text-sm text-[#635F57] mt-0.5">{t.guide.paceLead}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.guide.paceSchedule.map((step) => (
            <div
              key={step.label}
              className="rounded-2xl bg-white border border-[#E2DDD3] p-5 flex flex-col gap-1.5"
            >
              <span className="text-xs font-mono-typing text-[#635F57]">{step.label}</span>
              <h3 className="text-base font-semibold text-[#1C1B18]">{step.value}</h3>
              <p className="text-xs text-[#635F57] leading-relaxed mt-0.5">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
