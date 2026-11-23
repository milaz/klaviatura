import { Check } from 'lucide-react';
import { LayoutId, Lesson, ProgressData, UserSettings } from '../types';
import { COPY } from '../data/i18n';
import { getDisplayLabelForCode } from '../data/keyboard';
import { computeWeakKeyCodes } from '../data/lessons';

interface CurriculumViewProps {
  lessons: Lesson[];
  activeLessonId: string;
  settings: UserSettings;
  progress: ProgressData;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onStartAdaptiveDrill: () => void;
}

export function CurriculumView({
  lessons,
  activeLessonId,
  settings,
  progress,
  onUpdateSettings,
  onSelectLesson,
  onStartAdaptiveDrill,
}: CurriculumViewProps) {
  const t = COPY[settings.uiLang];
  const weakKeys = computeWeakKeyCodes(progress.keyStats[settings.layout] ?? {}, settings.layout, 5);

  return (
    <div className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Header + Layout Toggle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1C1B18]">
            {t.curriculum.heading}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#635F57] leading-relaxed">
            {settings.layout === 'ru' ? t.curriculum.leadRu : t.curriculum.leadEn}
          </p>
        </div>

        <div
          role="group"
          aria-label="Curriculum layout"
          className="inline-flex items-center p-1 rounded-lg bg-[#ECE8DF] border border-[#E2DDD3]"
        >
          {(['ru', 'en'] as LayoutId[]).map((lid) => (
            <button
              key={lid}
              type="button"
              onClick={() => onUpdateSettings({ layout: lid })}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                settings.layout === lid
                  ? 'bg-white text-[#1C1B18] shadow-xs'
                  : 'text-[#635F57] hover:text-[#1C1B18]'
              }`}
            >
              {lid === 'ru' ? t.controls.layoutRu : t.controls.layoutEn}
            </button>
          ))}
        </div>
      </div>

      {/* Adaptive Weak-Key Practice Strip */}
      <section className="rounded-2xl bg-white border border-[#E2DDD3] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-semibold text-[#1C1B18]">
            {t.curriculum.weakBannerTitle}
          </h2>
          <p className="text-sm text-[#635F57]">
            {weakKeys.length > 0 ? t.curriculum.weakBannerDesc : t.curriculum.weakBannerEmpty}
          </p>
          {weakKeys.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {weakKeys.map((wk) => {
                const lbl = getDisplayLabelForCode(wk.code, settings.layout, settings.ruPunctuation);
                return (
                  <span
                    key={wk.code}
                    className="font-mono-typing text-xs px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#E2DDD3] text-[#1C1B18] font-semibold"
                  >
                    {lbl.primary}
                    {settings.layout === 'ru' && (
                      <span className="text-[#8A8479] font-normal ml-1">({lbl.us})</span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onStartAdaptiveDrill}
          className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {t.curriculum.startWeakDrill}
        </button>
      </section>

      {/* Editorial Stage List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => {
          const comp = progress.completions[lesson.id];
          const isCurrent = lesson.id === activeLessonId;

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectLesson(lesson);
                }
              }}
              className={`group rounded-2xl bg-white border p-5 flex flex-col justify-between gap-4 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] ${
                isCurrent
                  ? 'border-[#1D4ED8]'
                  : 'border-[#E2DDD3] hover:border-[#B7AFA2]'
              }`}
            >
              <div className="flex flex-col gap-2">
                {/* Clean unboxed editorial metadata */}
                <div className="flex items-center justify-between gap-2 text-xs text-[#635F57]">
                  <span className="font-mono-typing font-medium">
                    {String(lesson.stage).padStart(2, '0')}.
                  </span>
                  <div className="flex items-center gap-2 font-mono-typing">
                    {comp ? (
                      <>
                        <span className="text-[#15803D] inline-flex items-center gap-1 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          {comp.bestWpm} {t.practice.wpm}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{comp.bestAccuracy}%</span>
                      </>
                    ) : (
                      <span>{t.curriculum.notStarted}</span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#1C1B18] group-hover:text-[#1D4ED8] transition-colors">
                  {lesson.title[settings.uiLang]}
                </h3>
                <p className="text-sm text-[#635F57] leading-relaxed">
                  {lesson.subtitle[settings.uiLang]}
                </p>
              </div>

              {/* Focus keys & action row */}
              <div className="pt-3 border-t border-[#F0ECE3] flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1">
                  {lesson.focusCodes.slice(0, 8).map((code) => {
                    const lbl = getDisplayLabelForCode(code, settings.layout, settings.ruPunctuation);
                    return (
                      <span
                        key={code}
                        className="font-mono-typing text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF8F4] border border-[#E2DDD3] text-[#1C1B18]"
                      >
                        {lbl.primary || code.replace('Shift', '⇧')}
                      </span>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-[#1D4ED8] whitespace-nowrap shrink-0">
                  {t.curriculum.practiceStage} →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
