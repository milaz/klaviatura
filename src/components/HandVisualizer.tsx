import { FingerId, LayoutId, ReachDirection, UiLang } from '../types';
import { FINGER_ZONE_COLORS } from '../data/keyboard';
import { FINGER_NAMES } from '../data/i18n';

interface HandVisualizerProps {
  activeFinger?: FingerId | null;
  shiftFinger?: FingerId | null;
  direction?: ReachDirection | null;
  layout?: LayoutId;
  uiLang: UiLang;
  interactive?: boolean;
  onSelectFinger?: (finger: FingerId | null) => void;
}

interface SculptedFinger {
  id: FingerId;
  /** Organic closed finger contour path in 0..460 x 0..220 space */
  path: string;
  /** Subtle knuckle crease line */
  knucklePath: string;
  /** Subtle fingernail contour near tip */
  nailPath: string;
  /** Label center near fingertip */
  labelX: number;
  labelY: number;
  /** Cue indicator position floating above fingertip */
  cueX: number;
  cueY: number;
  ruHome: string;
  enHome: string;
}

// Anatomically proportioned, naturally curved top-down Left Hand fingers
const LEFT_FINGERS: SculptedFinger[] = [
  {
    id: 'left-pinky',
    path: 'M 42 128 C 36 108 32 82 35 66 C 37 56 49 55 54 64 C 59 75 61 98 63 118 C 57 123 49 126 42 128 Z',
    knucklePath: 'M 39 92 Q 48 89 56 91',
    nailPath: 'M 40 67 C 41 61 48 61 50 66',
    labelX: 46,
    labelY: 79,
    cueX: 43,
    cueY: 42,
    ruHome: 'Ф',
    enHome: 'A',
  },
  {
    id: 'left-ring',
    path: 'M 65 116 C 63 92 64 62 68 44 C 71 33 84 32 88 43 C 92 58 91 88 91 112 C 82 114 73 115 65 116 Z',
    knucklePath: 'M 68 78 Q 78 75 87 77',
    nailPath: 'M 73 45 C 74 39 82 39 84 44',
    labelX: 78,
    labelY: 59,
    cueX: 77,
    cueY: 20,
    ruHome: 'Ы',
    enHome: 'S',
  },
  {
    id: 'left-middle',
    path: 'M 94 111 C 94 84 96 52 101 34 C 104 23 118 23 121 35 C 125 52 123 84 121 111 C 112 110 103 110 94 111 Z',
    knucklePath: 'M 98 72 Q 109 69 119 72',
    nailPath: 'M 105 35 C 106 29 114 29 116 35',
    labelX: 109,
    labelY: 50,
    cueX: 110,
    cueY: 11,
    ruHome: 'В',
    enHome: 'D',
  },
  {
    id: 'left-index',
    path: 'M 124 112 C 126 88 131 60 137 45 C 141 35 154 36 156 48 C 158 65 153 94 149 119 C 141 115 132 113 124 112 Z',
    knucklePath: 'M 131 80 Q 142 78 151 82',
    nailPath: 'M 140 47 C 142 41 149 42 151 48',
    labelX: 143,
    labelY: 62,
    cueX: 147,
    cueY: 23,
    ruHome: 'А',
    enHome: 'F',
  },
];

// Mirrored Right Hand (mirror axis at x = 230)
const RIGHT_FINGERS: SculptedFinger[] = [
  {
    id: 'right-index',
    path: 'M 336 112 C 334 88 329 60 323 45 C 319 35 306 36 304 48 C 302 65 307 94 311 119 C 319 115 328 113 336 112 Z',
    knucklePath: 'M 329 80 Q 318 78 309 82',
    nailPath: 'M 320 47 C 318 41 311 42 309 48',
    labelX: 317,
    labelY: 62,
    cueX: 313,
    cueY: 23,
    ruHome: 'О',
    enHome: 'J',
  },
  {
    id: 'right-middle',
    path: 'M 366 111 C 366 84 364 52 359 34 C 356 23 342 23 339 35 C 335 52 337 84 339 111 C 348 110 357 110 366 111 Z',
    knucklePath: 'M 362 72 Q 351 69 341 72',
    nailPath: 'M 355 35 C 354 29 346 29 344 35',
    labelX: 351,
    labelY: 50,
    cueX: 350,
    cueY: 11,
    ruHome: 'Л',
    enHome: 'K',
  },
  {
    id: 'right-ring',
    path: 'M 395 116 C 397 92 396 62 392 44 C 389 33 376 32 372 43 C 368 58 369 88 369 112 C 378 114 387 115 395 116 Z',
    knucklePath: 'M 392 78 Q 382 75 373 77',
    nailPath: 'M 387 45 C 386 39 378 39 376 44',
    labelX: 382,
    labelY: 59,
    cueX: 383,
    cueY: 20,
    ruHome: 'Д',
    enHome: 'L',
  },
  {
    id: 'right-pinky',
    path: 'M 418 128 C 424 108 428 82 425 66 C 423 56 411 55 406 64 C 401 75 399 98 397 118 C 403 123 411 126 418 128 Z',
    knucklePath: 'M 421 92 Q 412 89 404 91',
    nailPath: 'M 420 67 C 419 61 412 61 410 66',
    labelX: 414,
    labelY: 79,
    cueX: 417,
    cueY: 42,
    ruHome: 'Ж',
    enHome: ';',
  },
];

function getCueGlyph(
  fingerId: FingerId,
  direction: ReachDirection | null,
  isShift: boolean
): string | null {
  if (isShift) return '⇧';
  if (!direction) return null;
  if (direction === 'home') return '●';
  if (direction === 'up') return '↑';
  if (direction === 'down') return '↓';
  if (direction === 'thumb') return '␣';
  const isLeft = fingerId.startsWith('left');
  if (direction === 'in') return isLeft ? '→' : '←';
  return isLeft ? '←' : '→';
}

export function HandVisualizer({
  activeFinger = null,
  shiftFinger = null,
  direction = null,
  layout = 'ru',
  uiLang,
  interactive = false,
  onSelectFinger,
}: HandVisualizerProps) {
  const thumbActive = activeFinger === 'thumb';

  const renderFinger = (f: SculptedFinger) => {
    const isActive = activeFinger === f.id;
    const isShift = shiftFinger === f.id;
    const zone = FINGER_ZONE_COLORS[f.id];

    const activeAccent = '#1D4ED8';
    const fill = isActive ? activeAccent : isShift ? '#1C1B18' : zone.bg;
    const stroke = isActive ? activeAccent : isShift ? '#1C1B18' : zone.border;
    const labelColor = isActive || isShift ? '#FFFFFF' : zone.text;
    const detailStroke = isActive || isShift ? 'rgba(255,255,255,0.35)' : 'rgba(28,27,24,0.14)';

    const cueGlyph = isActive || isShift ? getCueGlyph(f.id, isActive ? direction : null, isShift) : null;

    return (
      <g
        key={f.id}
        className={interactive ? 'cursor-pointer' : ''}
        onMouseEnter={() => interactive && onSelectFinger?.(f.id)}
        onClick={() => interactive && onSelectFinger?.(isActive ? null : f.id)}
      >
        {/* Soft active focus aura behind fingertip */}
        {isActive && (
          <path
            d={f.path}
            fill="none"
            stroke={activeAccent}
            strokeWidth="6"
            strokeLinejoin="round"
            opacity="0.16"
          />
        )}

        {/* Sculpted finger fill + hairline */}
        <path
          d={f.path}
          fill={fill}
          stroke={stroke}
          strokeWidth={isActive || isShift ? 1.75 : 1.25}
          strokeLinejoin="round"
          className="transition-colors duration-100"
        />

        {/* Subtle anatomical nail & knuckle contour lines */}
        <path
          d={f.nailPath}
          fill="none"
          stroke={detailStroke}
          strokeWidth="1.1"
          strokeLinecap="round"
          className="pointer-events-none"
        />
        <path
          d={f.knucklePath}
          fill="none"
          stroke={detailStroke}
          strokeWidth="1"
          strokeLinecap="round"
          className="pointer-events-none"
        />

        {/* Home-row character embedded gracefully in fingertip */}
        <text
          x={f.labelX}
          y={f.labelY}
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="600"
          fill={labelColor}
          className="font-mono-typing pointer-events-none"
        >
          {layout === 'ru' ? f.ruHome : f.enHome}
        </text>

        {/* Tactile bump bar under F (А) and J (О) index fingertips */}
        {(f.id === 'left-index' || f.id === 'right-index') && (
          <line
            x1={f.labelX - 5}
            y1={f.labelY + 5}
            x2={f.labelX + 5}
            y2={f.labelY + 5}
            stroke={isActive ? '#FFFFFF' : zone.stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
            className="pointer-events-none"
          />
        )}

        {/* Crisp directional reach badge floating above active fingertip */}
        {cueGlyph && (
          <g transform={`translate(${f.cueX}, ${f.cueY})`}>
            <circle r="10" fill={isShift ? '#1C1B18' : activeAccent} />
            <text
              y="3.8"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#FFFFFF"
              className="pointer-events-none"
            >
              {cueGlyph}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox="0 0 460 206"
        className="w-full max-w-[360px] h-auto select-none overflow-visible"
        role="img"
        aria-label={
          activeFinger
            ? FINGER_NAMES[uiLang][activeFinger]
            : uiLang === 'ru'
              ? 'Схема положения рук'
              : 'Hand placement diagram'
        }
      >
        <defs>
          <linearGradient id="palm-fade-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EBE5DA" />
            <stop offset="82%" stopColor="#DFD8CA" />
            <stop offset="100%" stopColor="#DFD8CA" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="palm-fade-right" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FAF8F4" />
            <stop offset="82%" stopColor="#F4F0E8" />
            <stop offset="100%" stopColor="#F4F0E8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Center vertical hand-split axis between Left & Right hands */}
        <line
          x1="230"
          y1="20"
          x2="230"
          y2="188"
          stroke="#CFC8BC"
          strokeWidth="1.25"
          strokeDasharray="4 4"
        />
        <text
          x="218"
          y="30"
          textAnchor="end"
          fontSize="10"
          fontWeight="600"
          fill="#635F57"
          opacity="0.85"
          className="font-mono-typing"
        >
          L
        </text>
        <text
          x="242"
          y="30"
          textAnchor="start"
          fontSize="10"
          fontWeight="600"
          fill="#635F57"
          opacity="0.85"
          className="font-mono-typing"
        >
          R
        </text>

        {/* Organic Left Palm + Wrist Silhouette */}
        <path
          d="M 42 126 C 48 117 62 113 94 110 C 122 108 144 111 153 121 C 161 131 164 146 164 159 C 164 176 154 191 146 200 L 66 200 C 56 184 41 162 41 141 C 41 135 41 130 42 126 Z"
          fill="url(#palm-fade-left)"
          stroke="#D4CEC2"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        {/* Subtle left palm crease */}
        <path
          d="M 62 146 Q 102 138 140 148"
          fill="none"
          stroke="#DDD7CA"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Organic Right Palm + Wrist Silhouette */}
        <path
          d="M 418 126 C 412 117 398 113 366 110 C 338 108 316 111 307 121 C 299 131 296 146 296 159 C 296 176 306 191 314 200 L 394 200 C 404 184 419 162 419 141 C 419 135 419 130 418 126 Z"
          fill="url(#palm-fade-right)"
          stroke="#D4CEC2"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        {/* Subtle right palm crease */}
        <path
          d="M 398 146 Q 358 138 320 148"
          fill="none"
          stroke="#DDD7CA"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Sculpted Left & Right Fingers */}
        {LEFT_FINGERS.map(renderFinger)}
        {RIGHT_FINGERS.map(renderFinger)}

        {/* Anatomically Curved Left & Right Thumbs resting toward Spacebar */}
        <g
          className={interactive ? 'cursor-pointer' : ''}
          onMouseEnter={() => interactive && onSelectFinger?.('thumb')}
          onClick={() => interactive && onSelectFinger?.(thumbActive ? null : 'thumb')}
        >
          {/* Left Thumb */}
          <path
            d="M 157 148 C 169 137 188 128 202 133 C 212 137 213 150 202 156 C 188 164 171 171 159 175 C 156 167 156 156 157 148 Z"
            fill={thumbActive ? '#44403C' : '#EFECE6'}
            stroke={thumbActive ? '#292524' : '#CFC9BD'}
            strokeWidth={thumbActive ? 1.75 : 1.25}
            strokeLinejoin="round"
            className="transition-colors duration-100"
          />
          {/* Right Thumb */}
          <path
            d="M 303 148 C 291 137 272 128 258 133 C 248 137 247 150 258 156 C 272 164 289 171 301 175 C 304 167 304 156 303 148 Z"
            fill={thumbActive ? '#44403C' : '#EFECE6'}
            stroke={thumbActive ? '#292524' : '#CFC9BD'}
            strokeWidth={thumbActive ? 1.75 : 1.25}
            strokeLinejoin="round"
            className="transition-colors duration-100"
          />
          {thumbActive && (
            <g transform="translate(230, 146)">
              <circle r="11" fill="#44403C" />
              <text
                y="4"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#FFFFFF"
                className="font-mono-typing pointer-events-none"
              >
                ␣
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
