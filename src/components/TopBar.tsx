import { AppView, UiLang } from '../types';
import { COPY } from '../data/i18n';

interface TopBarProps {
  activeView: AppView;
  uiLang: UiLang;
  onNavigate: (view: AppView) => void;
  onQuickDrill: () => void;
}

export function TopBar({ activeView, uiLang, onNavigate, onQuickDrill }: TopBarProps) {
  const t = COPY[uiLang];

  const navItems: { id: AppView; label: string }[] = [
    { id: 'practice', label: t.nav.practice },
    { id: 'curriculum', label: t.nav.curriculum },
    { id: 'guide', label: t.nav.guide },
    { id: 'progress', label: t.nav.progress },
  ];

  return (
    <header className="w-full border-b border-[#E2DDD3] bg-[#F7F5F0]/95 backdrop-blur-xs sticky top-0 z-30">
      <div className="max-w-[1368px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('practice')}
          className="font-display text-xl font-bold tracking-tight text-[#1C1B18] whitespace-nowrap shrink-0 hover:text-[#1D4ED8] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] rounded-sm cursor-pointer"
        >
          {t.brand}
        </button>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav aria-label="Primary" className="flex items-center h-full gap-4 sm:gap-7">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative h-full inline-flex items-center text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] rounded-sm ${
                  isActive
                    ? 'text-[#1C1B18]'
                    : 'text-[#635F57] hover:text-[#1C1B18]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#1D4ED8]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onQuickDrill}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1C1B18] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            {t.nav.nextDrill}
          </button>
        </div>
      </div>
    </header>
  );
}
