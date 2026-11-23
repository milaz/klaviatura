import {
  FingerId,
  HintMode,
  KeyDef,
  KeyStat,
  LayoutId,
  RuPunctuationMode,
} from '../types';
import {
  FINGER_ZONE_COLORS,
  getKeyCenter,
  getKeyGlyphs,
  KEY_BY_CODE,
  KEYBOARD_ROWS,
  TargetKeyInfo,
} from '../data/keyboard';

interface KeyboardVisualizerProps {
  layout: LayoutId;
  ruPunctuation: RuPunctuationMode;
  hintMode: HintMode;
  showFingerZones: boolean;
  compact?: boolean;
  targetInfo?: TargetKeyInfo | null;
  pressedCode?: string | null;
  errorCode?: string | null;
  blindOpacity?: number;
  blindRevealed?: boolean;
  // Optional modes for Guide & Progress views
  highlightFinger?: FingerId | null;
  calibratedCodes?: Set<string>;
  heatmapStats?: Record<string, KeyStat>;
  heatmapMetric?: 'errors' | 'speed';
  onKeySelect?: (key: KeyDef) => void;
}

function getHeatmapTone(
  stat: KeyStat | undefined,
  metric: 'errors' | 'speed'
): { bg: string; border: string; text: string; badge?: string } | null {
  if (!stat || stat.hits + stat.misses === 0) return null;
  const total = stat.hits + stat.misses;

  if (metric === 'errors') {
    const rate = stat.misses / total;
    const pct = Math.round(rate * 100);
    if (rate >= 0.18) {
      return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', badge: `${pct}%` };
    }
    if (rate >= 0.08) {
      return { bg: '#FEF3C7', border: '#D97706', text: '#92400E', badge: `${pct}%` };
    }
    return { bg: '#DCFCE7', border: '#16A34A', text: '#166534', badge: `${pct}%` };
  }

  const avgMs = stat.hits > 0 ? Math.round(stat.totalLatencyMs / stat.hits) : 0;
  if (avgMs === 0) return null;
  if (avgMs >= 480) {
    return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', badge: `${avgMs}` };
  }
  if (avgMs >= 300) {
    return { bg: '#FEF3C7', border: '#D97706', text: '#92400E', badge: `${avgMs}` };
  }
  return { bg: '#DCFCE7', border: '#16A34A', text: '#166534', badge: `${avgMs}` };
}

export function KeyboardVisualizer({
  layout,
  ruPunctuation,
  hintMode,
  showFingerZones,
  compact = false,
  targetInfo,
  pressedCode,
  errorCode,
  blindOpacity = 1,
  blindRevealed = false,
  highlightFinger = null,
  calibratedCodes,
  heatmapStats,
  heatmapMetric = 'errors',
  onKeySelect,
}: KeyboardVisualizerProps) {
  const isHeatmap = Boolean(heatmapStats);
  const targetCode = targetInfo?.key.code ?? null;
  const shiftCode = targetInfo?.shiftCode ?? null;

  // Compute reach vector coordinates in 0..1500 x 0..500 SVG space
  const reachVector = (() => {
    if (!targetInfo || isHeatmap) return null;
    if (targetInfo.key.code === targetInfo.homeCode || targetInfo.key.code === 'Space') {
      return null;
    }
    const homeKey = KEY_BY_CODE[targetInfo.homeCode];
    if (!homeKey) return null;
    const from = getKeyCenter(homeKey);
    const to = getKeyCenter(targetInfo.key);
    return {
      x1: from.cx * 100,
      y1: from.cy * 100,
      x2: to.cx * 100,
      y2: to.cy * 100,
      color: FINGER_ZONE_COLORS[targetInfo.key.finger].stroke,
    };
  })();

  // Compute error correction vector (from mistyped key directly to intended target key)
  const errorVector = (() => {
    if (!errorCode || !targetInfo || errorCode === targetInfo.key.code || isHeatmap) return null;
    const wrongKey = KEY_BY_CODE[errorCode];
    if (!wrongKey) return null;
    const from = getKeyCenter(wrongKey);
    const to = getKeyCenter(targetInfo.key);
    return {
      x1: from.cx * 100,
      y1: from.cy * 100,
      x2: to.cx * 100,
      y2: to.cy * 100,
    };
  })();

  return (
    <div
      className="relative w-full select-none rounded-2xl bg-[#F2EEE6] border border-[#D8D0C2] p-2.5 sm:p-3.5 overflow-hidden"
      aria-label="Interactive US ANSI keyboard layout"
    >
      <div className="relative flex flex-col gap-1.5">
        {/* Two-Tone Stepped Keyboard Chassis Plate: Darker Left Hand vs. Lighter Right Hand */}
        <svg
          viewBox="0 0 1500 500"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-visible"
          aria-hidden="true"
        >
          <path
            d="M -80 -80 L 600 -80 L 600 100 L 650 100 L 650 200 L 675 200 L 675 300 L 725 300 L 725 580 L -80 580 Z"
            fill="#C7BFAF"
          />
        </svg>

        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="relative z-10 flex w-full gap-1.5">
            {row.map((key) => {
              const isTarget = !isHeatmap && targetCode === key.code;
              const isShiftTarget = !isHeatmap && shiftCode === key.code;
              const isPressed = pressedCode === key.code;
              const isError = errorCode === key.code;
              const isHomeAnchor = Boolean(key.isHome);
              const isFingerHighlighted =
                highlightFinger !== null && key.finger === highlightFinger && !key.isModifier;
              const isCalibrated = calibratedCodes?.has(key.code) ?? false;

              const zone = FINGER_ZONE_COLORS[key.finger];
              const heatTone = isHeatmap ? getHeatmapTone(heatmapStats?.[key.code], heatmapMetric) : null;
              const { base, shift } = getKeyGlyphs(key, layout, ruPunctuation);

              let legendOpacity = 1;
              if (!isHeatmap && hintMode === 'blind' && !key.isModifier && key.code !== 'Space') {
                if (isTarget && blindRevealed) {
                  legendOpacity = 0.95;
                } else {
                  legendOpacity = blindOpacity;
                }
              }

              let bgColor = '#FFFFFF';
              let borderColor = '#DDD7CA';
              let primaryTextColor = '#1C1B18';
              let secondaryTextColor = '#8A8479';

              if (isHeatmap && heatTone) {
                bgColor = heatTone.bg;
                borderColor = heatTone.border;
                primaryTextColor = heatTone.text;
                secondaryTextColor = heatTone.text;
              } else if (isError) {
                bgColor = '#FEE2E2';
                borderColor = '#B91C1C';
                primaryTextColor = '#991B1B';
                secondaryTextColor = '#B91C1C';
              } else if (isTarget || isShiftTarget) {
                bgColor = '#1D4ED8';
                borderColor = '#1E40AF';
                primaryTextColor = '#FFFFFF';
                secondaryTextColor = '#DBEAFE';
              } else if (isCalibrated) {
                bgColor = '#DCFCE7';
                borderColor = '#15803D';
                primaryTextColor = '#166534';
                secondaryTextColor = '#15803D';
              } else if (isFingerHighlighted) {
                bgColor = zone.bg;
                borderColor = zone.stroke;
                primaryTextColor = zone.text;
                secondaryTextColor = zone.text;
              } else if (key.isModifier) {
                bgColor = '#F4F1EA';
                borderColor = '#D6CFC2';
                primaryTextColor = '#635F57';
              } else if (showFingerZones && !isHeatmap) {
                bgColor = zone.bg;
                borderColor = zone.border;
                primaryTextColor = '#1C1B18';
                secondaryTextColor = '#736D63';
              }

              const showUsSubLegend =
                !key.isModifier &&
                key.code !== 'Space' &&
                layout === 'ru' &&
                (hintMode === 'dual' || isHeatmap || highlightFinger !== null);

              const showRuShiftSub =
                !key.isModifier &&
                layout === 'ru' &&
                ((ruPunctuation === 'pc' && key.code === 'Slash') ||
                  (ruPunctuation === 'mac' && (key.code === 'Digit6' || key.code === 'Digit7')));

              const primaryDisplay = key.isModifier
                ? key.label
                : key.code === 'Space'
                  ? ''
                  : base.toUpperCase();

              return (
                <button
                  key={key.code}
                  type="button"
                  tabIndex={-1}
                  onClick={() => onKeySelect?.(key)}
                  style={{
                    flexGrow: key.width,
                    flexBasis: 0,
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                  }}
                  className={`keycap-surface relative ${
                    compact ? 'h-10 sm:h-11' : 'h-11 sm:h-12'
                  } rounded-lg border flex flex-col items-center justify-center overflow-hidden ${
                    onKeySelect ? 'cursor-pointer' : 'cursor-default'
                  } ${isPressed ? 'keycap-pressed' : ''} ${isError ? 'animate-key-shake' : ''}`}
                >
                  {/* Top-left physical US keycap reference */}
                  {showUsSubLegend && (
                    <span
                      style={{
                        color: secondaryTextColor,
                        opacity: hintMode === 'blind' && !isHeatmap ? legendOpacity * 0.75 : 0.85,
                      }}
                      className="absolute top-1 left-1.5 font-mono-typing text-[9px] font-medium leading-none uppercase"
                    >
                      {key.us}
                    </span>
                  )}

                  {/* Top-right shifted glyph or heatmap badge */}
                  {isHeatmap && heatTone?.badge ? (
                    <span
                      style={{ color: primaryTextColor }}
                      className="absolute top-1 right-1 font-mono-typing text-[9px] font-semibold leading-none"
                    >
                      {heatTone.badge}
                    </span>
                  ) : showRuShiftSub ? (
                    <span
                      style={{
                        color: isTarget ? '#DBEAFE' : '#1D4ED8',
                        opacity: hintMode === 'blind' ? legendOpacity : 1,
                      }}
                      className="absolute top-1 right-1.5 font-mono-typing text-[9px] sm:text-[10px] font-semibold leading-none"
                    >
                      ⇧{shift}
                    </span>
                  ) : null}

                  {/* Main Keycap Legend */}
                  <span
                    style={{
                      color: primaryTextColor,
                      opacity: key.isModifier ? 0.9 : legendOpacity,
                    }}
                    className={`font-mono-typing leading-none transition-opacity duration-200 ${
                      key.isModifier
                        ? 'text-[10px] font-medium'
                        : compact
                          ? 'text-sm sm:text-[15px] font-semibold'
                          : 'text-sm sm:text-[16px] font-semibold'
                    }`}
                  >
                    {primaryDisplay}
                  </span>

                  {/* Subtle Home-Row dot */}
                  {isHomeAnchor && !key.isBump && !isTarget && !isError && !isHeatmap && (
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: zone.stroke }}
                      className="absolute bottom-1 w-1 h-1 rounded-full opacity-60"
                    />
                  )}

                  {/* Physical Tactile Bump Bar on F (А) and J (О) */}
                  {key.isBump && (
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: isTarget ? '#FFFFFF' : '#1C1B18',
                      }}
                      className="absolute bottom-1 w-4 h-[2.5px] rounded-full opacity-80"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Direct Visual Reach & Error-Correction SVG Vector Overlay */}
        {(reachVector || errorVector) && (
          <svg
            viewBox="0 0 1500 500"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 w-full h-full z-20 overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="reach-arrow-head"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M 1 1 L 7 4 L 1 7 z" fill={reachVector?.color ?? '#1D4ED8'} />
              </marker>
              <marker
                id="error-arrow-head"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M 1 1 L 7 4 L 1 7 z" fill="#B91C1C" />
              </marker>
            </defs>

            {reachVector && !errorVector && (
              <g>
                <circle
                  cx={reachVector.x1}
                  cy={reachVector.y1}
                  r="9"
                  fill="#FFFFFF"
                  stroke={reachVector.color}
                  strokeWidth="3"
                  opacity="0.92"
                />
                <line
                  x1={reachVector.x1}
                  y1={reachVector.y1}
                  x2={reachVector.x2 + (reachVector.x1 - reachVector.x2) * 0.28}
                  y2={reachVector.y2 + (reachVector.y1 - reachVector.y2) * 0.28}
                  stroke={reachVector.color}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray="10 7"
                  markerEnd="url(#reach-arrow-head)"
                  opacity="0.86"
                />
              </g>
            )}

            {errorVector && (
              <g>
                <line
                  x1={errorVector.x1}
                  y1={errorVector.y1}
                  x2={errorVector.x2 + (errorVector.x1 - errorVector.x2) * 0.24}
                  y2={errorVector.y2 + (errorVector.y1 - errorVector.y2) * 0.24}
                  stroke="#B91C1C"
                  strokeWidth="5"
                  strokeLinecap="round"
                  markerEnd="url(#error-arrow-head)"
                  opacity="0.92"
                />
              </g>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
