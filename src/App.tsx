import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppView, Lesson, ProgressData, SessionRecord, UserSettings } from './types';
import { buildAdaptiveWeakLesson, getLessonsForLayout } from './data/lessons';
import {
  DEFAULT_PROGRESS,
  loadProgress,
  loadSettings,
  recordSessionInProgress,
  saveProgress,
  saveSettings,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { PracticeStudio } from './components/PracticeStudio';
import { CurriculumView } from './components/CurriculumView';
import { HandGuideView } from './components/HandGuideView';
import { ProgressView } from './components/ProgressView';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('practice');
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress());

  const lessons = useMemo(() => getLessonsForLayout(settings.layout), [settings.layout]);

  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    const initialSettings = loadSettings();
    const initialLessons = getLessonsForLayout(initialSettings.layout);
    const initialProgress = loadProgress();
    // Pick first uncompleted stage, or Stage 1
    const firstIncomplete = initialLessons.find((l) => !initialProgress.completions[l.id]);
    return firstIncomplete ?? initialLessons[0];
  });

  // Keep activeLesson synced when switching layout between ЙЦУКЕН and QWERTY
  useEffect(() => {
    if (activeLesson.layout !== settings.layout) {
      const nextLessons = getLessonsForLayout(settings.layout);
      const firstIncomplete = nextLessons.find((l) => !progress.completions[l.id]);
      setActiveLesson(firstIncomplete ?? nextLessons[0]);
    }
  }, [activeLesson.layout, progress.completions, settings.layout]);

  const handleUpdateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleSelectLesson = useCallback(
    (lesson: Lesson) => {
      setActiveLesson(lesson);
      if (lesson.defaultHintMode) {
        handleUpdateSettings({ hintMode: lesson.defaultHintMode });
      }
      setActiveView('practice');
    },
    [handleUpdateSettings]
  );

  const handleStartAdaptiveDrill = useCallback(() => {
    const adaptive = buildAdaptiveWeakLesson(
      progress.keyStats[settings.layout] ?? {},
      settings.layout,
      settings.ruPunctuation
    );
    setActiveLesson(adaptive);
    setActiveView('practice');
  }, [progress.keyStats, settings.layout, settings.ruPunctuation]);

  const handleQuickDrill = useCallback(() => {
    const nextLessons = getLessonsForLayout(settings.layout);
    const firstIncomplete = nextLessons.find((l) => !progress.completions[l.id]);
    if (firstIncomplete) {
      handleSelectLesson(firstIncomplete);
    } else {
      handleStartAdaptiveDrill();
    }
  }, [handleSelectLesson, handleStartAdaptiveDrill, progress.completions, settings.layout]);

  const handleCompleteSession = useCallback(
    (
      session: SessionRecord,
      deltaKeyStats: Record<string, { hits: number; misses: number; totalLatencyMs: number }>,
      shownGuardId?: string | null
    ) => {
      setProgress((prev) => {
        const next = recordSessionInProgress(prev, session, deltaKeyStats, shownGuardId);
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const handleResetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    saveProgress(DEFAULT_PROGRESS);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1C1B18]">
      <TopBar
        activeView={activeView}
        uiLang={settings.uiLang}
        onNavigate={setActiveView}
        onQuickDrill={handleQuickDrill}
      />

      <main className="flex-1 w-full">
        {activeView === 'practice' && (
          <PracticeStudio
            lesson={activeLesson}
            lessons={lessons}
            settings={settings}
            progress={progress}
            onUpdateSettings={handleUpdateSettings}
            onSelectLesson={handleSelectLesson}
            onStartAdaptiveDrill={handleStartAdaptiveDrill}
            onCompleteSession={handleCompleteSession}
          />
        )}

        {activeView === 'curriculum' && (
          <CurriculumView
            lessons={lessons}
            activeLessonId={activeLesson.id}
            settings={settings}
            progress={progress}
            onUpdateSettings={handleUpdateSettings}
            onSelectLesson={handleSelectLesson}
            onStartAdaptiveDrill={handleStartAdaptiveDrill}
          />
        )}

        {activeView === 'guide' && (
          <HandGuideView
            settings={settings}
            onGoToPractice={() => setActiveView('practice')}
          />
        )}

        {activeView === 'progress' && (
          <ProgressView
            settings={settings}
            progress={progress}
            onUpdateSettings={handleUpdateSettings}
            onStartAdaptiveDrill={handleStartAdaptiveDrill}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>
    </div>
  );
}
