import {
  FingerId,
  InputMappingMode,
  KeyDef,
  LayoutId,
  ReachDirection,
  RuPunctuationMode,
} from '../types';

export const FINGER_HOME_CODE: Record<FingerId, string> = {
  'left-pinky': 'KeyA',
  'left-ring': 'KeyS',
  'left-middle': 'KeyD',
  'left-index': 'KeyF',
  thumb: 'Space',
  'right-index': 'KeyJ',
  'right-middle': 'KeyK',
  'right-ring': 'KeyL',
  'right-pinky': 'Semicolon',
};

export const FINGER_HAND: Record<FingerId, 'left' | 'right' | 'both'> = {
  'left-pinky': 'left',
  'left-ring': 'left',
  'left-middle': 'left',
  'left-index': 'left',
  thumb: 'both',
  'right-index': 'right',
  'right-middle': 'right',
  'right-ring': 'right',
  'right-pinky': 'right',
};

export const FINGER_ZONE_COLORS: Record<
  FingerId,
  { bg: string; border: string; text: string; activeBg: string; stroke: string }
> = {
  'left-pinky': {
    bg: '#F4DFEA',
    border: '#DFB6CC',
    text: '#86198F',
    activeBg: '#86198F',
    stroke: '#86198F',
  },
  'left-ring': {
    bg: '#FCECC8',
    border: '#E6C378',
    text: '#92400E',
    activeBg: '#B45309',
    stroke: '#B45309',
  },
  'left-middle': {
    bg: '#DCF2DF',
    border: '#A4D6AC',
    text: '#166534',
    activeBg: '#15803D',
    stroke: '#15803D',
  },
  'left-index': {
    bg: '#D9E9FE',
    border: '#A0C4F7',
    text: '#1E40AF',
    activeBg: '#1D4ED8',
    stroke: '#1D4ED8',
  },
  thumb: {
    bg: '#EFECE6',
    border: '#D6CFC2',
    text: '#57534E',
    activeBg: '#44403C',
    stroke: '#44403C',
  },
  'right-index': {
    bg: '#D9E9FE',
    border: '#A0C4F7',
    text: '#1E40AF',
    activeBg: '#1D4ED8',
    stroke: '#1D4ED8',
  },
  'right-middle': {
    bg: '#DCF2DF',
    border: '#A4D6AC',
    text: '#166534',
    activeBg: '#15803D',
    stroke: '#15803D',
  },
  'right-ring': {
    bg: '#FCECC8',
    border: '#E6C378',
    text: '#92400E',
    activeBg: '#B45309',
    stroke: '#B45309',
  },
  'right-pinky': {
    bg: '#F4DFEA',
    border: '#DFB6CC',
    text: '#86198F',
    activeBg: '#86198F',
    stroke: '#86198F',
  },
};

export const FINGER_ORDER: FingerId[] = [
  'left-pinky',
  'left-ring',
  'left-middle',
  'left-index',
  'right-index',
  'right-middle',
  'right-ring',
  'right-pinky',
];

type RawKey = Omit<KeyDef, 'row' | 'x'>;

const RAW_ROWS: RawKey[][] = [
  // Row 0: Number row (15u)
  [
    { code: 'Backquote', width: 1, us: '`', usShift: '~', ru: 'ё', ruShift: 'Ё', finger: 'left-pinky' },
    { code: 'Digit1', width: 1, us: '1', usShift: '!', ru: '1', ruShift: '!', finger: 'left-pinky' },
    { code: 'Digit2', width: 1, us: '2', usShift: '@', ru: '2', ruShift: '"', finger: 'left-ring' },
    { code: 'Digit3', width: 1, us: '3', usShift: '#', ru: '3', ruShift: '№', finger: 'left-middle' },
    { code: 'Digit4', width: 1, us: '4', usShift: '$', ru: '4', ruShift: ';', finger: 'left-index' },
    { code: 'Digit5', width: 1, us: '5', usShift: '%', ru: '5', ruShift: '%', finger: 'left-index' },
    { code: 'Digit6', width: 1, us: '6', usShift: '^', ru: '6', ruShift: ':', ruMac: '6', ruMacShift: ',', finger: 'right-index' },
    { code: 'Digit7', width: 1, us: '7', usShift: '&', ru: '7', ruShift: '?', ruMac: '7', ruMacShift: '.', finger: 'right-index' },
    { code: 'Digit8', width: 1, us: '8', usShift: '*', ru: '8', ruShift: '*', finger: 'right-middle' },
    { code: 'Digit9', width: 1, us: '9', usShift: '(', ru: '9', ruShift: '(', finger: 'right-ring' },
    { code: 'Digit0', width: 1, us: '0', usShift: ')', ru: '0', ruShift: ')', finger: 'right-pinky' },
    { code: 'Minus', width: 1, us: '-', usShift: '_', ru: '-', ruShift: '_', finger: 'right-pinky' },
    { code: 'Equal', width: 1, us: '=', usShift: '+', ru: '=', ruShift: '+', finger: 'right-pinky' },
    { code: 'Backspace', width: 2, us: '', usShift: '', ru: '', ruShift: '', finger: 'right-pinky', isModifier: true, label: '⌫' },
  ],
  // Row 1: Top alpha row (15u)
  [
    { code: 'Tab', width: 1.5, us: '', usShift: '', ru: '', ruShift: '', finger: 'left-pinky', isModifier: true, label: 'Tab' },
    { code: 'KeyQ', width: 1, us: 'q', usShift: 'Q', ru: 'й', ruShift: 'Й', finger: 'left-pinky' },
    { code: 'KeyW', width: 1, us: 'w', usShift: 'W', ru: 'ц', ruShift: 'Ц', finger: 'left-ring' },
    { code: 'KeyE', width: 1, us: 'e', usShift: 'E', ru: 'у', ruShift: 'У', finger: 'left-middle' },
    { code: 'KeyR', width: 1, us: 'r', usShift: 'R', ru: 'к', ruShift: 'К', finger: 'left-index' },
    { code: 'KeyT', width: 1, us: 't', usShift: 'T', ru: 'е', ruShift: 'Е', finger: 'left-index' },
    { code: 'KeyY', width: 1, us: 'y', usShift: 'Y', ru: 'н', ruShift: 'Н', finger: 'right-index' },
    { code: 'KeyU', width: 1, us: 'u', usShift: 'U', ru: 'г', ruShift: 'Г', finger: 'right-index' },
    { code: 'KeyI', width: 1, us: 'i', usShift: 'I', ru: 'ш', ruShift: 'Ш', finger: 'right-middle' },
    { code: 'KeyO', width: 1, us: 'o', usShift: 'O', ru: 'щ', ruShift: 'Щ', finger: 'right-ring' },
    { code: 'KeyP', width: 1, us: 'p', usShift: 'P', ru: 'з', ruShift: 'З', finger: 'right-pinky' },
    { code: 'BracketLeft', width: 1, us: '[', usShift: '{', ru: 'х', ruShift: 'Х', finger: 'right-pinky' },
    { code: 'BracketRight', width: 1, us: ']', usShift: '}', ru: 'ъ', ruShift: 'Ъ', finger: 'right-pinky' },
    { code: 'Backslash', width: 1.5, us: '\\', usShift: '|', ru: '\\', ruShift: '/', finger: 'right-pinky' },
  ],
  // Row 2: Home row (15u)
  [
    { code: 'CapsLock', width: 1.75, us: '', usShift: '', ru: '', ruShift: '', finger: 'left-pinky', isModifier: true, label: 'Caps' },
    { code: 'KeyA', width: 1, us: 'a', usShift: 'A', ru: 'ф', ruShift: 'Ф', finger: 'left-pinky', isHome: true },
    { code: 'KeyS', width: 1, us: 's', usShift: 'S', ru: 'ы', ruShift: 'Ы', finger: 'left-ring', isHome: true },
    { code: 'KeyD', width: 1, us: 'd', usShift: 'D', ru: 'в', ruShift: 'В', finger: 'left-middle', isHome: true },
    { code: 'KeyF', width: 1, us: 'f', usShift: 'F', ru: 'а', ruShift: 'А', finger: 'left-index', isHome: true, isBump: true },
    { code: 'KeyG', width: 1, us: 'g', usShift: 'G', ru: 'п', ruShift: 'П', finger: 'left-index' },
    { code: 'KeyH', width: 1, us: 'h', usShift: 'H', ru: 'р', ruShift: 'Р', finger: 'right-index' },
    { code: 'KeyJ', width: 1, us: 'j', usShift: 'J', ru: 'о', ruShift: 'О', finger: 'right-index', isHome: true, isBump: true },
    { code: 'KeyK', width: 1, us: 'k', usShift: 'K', ru: 'л', ruShift: 'Л', finger: 'right-middle', isHome: true },
    { code: 'KeyL', width: 1, us: 'l', usShift: 'L', ru: 'д', ruShift: 'Д', finger: 'right-ring', isHome: true },
    { code: 'Semicolon', width: 1, us: ';', usShift: ':', ru: 'ж', ruShift: 'Ж', finger: 'right-pinky', isHome: true },
    { code: 'Quote', width: 1, us: "'", usShift: '"', ru: 'э', ruShift: 'Э', finger: 'right-pinky' },
    { code: 'Enter', width: 2.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'right-pinky', isModifier: true, label: 'Enter' },
  ],
  // Row 3: Bottom alpha row (15u)
  [
    { code: 'ShiftLeft', width: 2.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'left-pinky', isModifier: true, label: '⇧ Shift' },
    { code: 'KeyZ', width: 1, us: 'z', usShift: 'Z', ru: 'я', ruShift: 'Я', finger: 'left-pinky' },
    { code: 'KeyX', width: 1, us: 'x', usShift: 'X', ru: 'ч', ruShift: 'Ч', finger: 'left-ring' },
    { code: 'KeyC', width: 1, us: 'c', usShift: 'C', ru: 'с', ruShift: 'С', finger: 'left-middle' },
    { code: 'KeyV', width: 1, us: 'v', usShift: 'V', ru: 'м', ruShift: 'М', finger: 'left-index' },
    { code: 'KeyB', width: 1, us: 'b', usShift: 'B', ru: 'и', ruShift: 'И', finger: 'left-index' },
    { code: 'KeyN', width: 1, us: 'n', usShift: 'N', ru: 'т', ruShift: 'Т', finger: 'right-index' },
    { code: 'KeyM', width: 1, us: 'm', usShift: 'M', ru: 'ь', ruShift: 'Ь', finger: 'right-index' },
    { code: 'Comma', width: 1, us: ',', usShift: '<', ru: 'б', ruShift: 'Б', finger: 'right-middle' },
    { code: 'Period', width: 1, us: '.', usShift: '>', ru: 'ю', ruShift: 'Ю', finger: 'right-ring' },
    { code: 'Slash', width: 1, us: '/', usShift: '?', ru: '.', ruShift: ',', ruMac: '/', ruMacShift: '?', finger: 'right-pinky' },
    { code: 'ShiftRight', width: 2.75, us: '', usShift: '', ru: '', ruShift: '', finger: 'right-pinky', isModifier: true, label: 'Shift ⇧' },
  ],
  // Row 4: Space row (15u)
  [
    { code: 'ControlLeft', width: 1.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'left-pinky', isModifier: true, label: 'Ctrl' },
    { code: 'MetaLeft', width: 1.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'thumb', isModifier: true, label: 'Alt' },
    { code: 'AltLeft', width: 1.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'thumb', isModifier: true, label: 'Cmd' },
    { code: 'Space', width: 6.25, us: ' ', usShift: ' ', ru: ' ', ruShift: ' ', finger: 'thumb', label: 'Space' },
    { code: 'AltRight', width: 1.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'thumb', isModifier: true, label: 'Cmd' },
    { code: 'MetaRight', width: 1.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'thumb', isModifier: true, label: 'Alt' },
    { code: 'ContextMenu', width: 1.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'right-pinky', isModifier: true, label: 'Fn' },
    { code: 'ControlRight', width: 1.25, us: '', usShift: '', ru: '', ruShift: '', finger: 'right-pinky', isModifier: true, label: 'Ctrl' },
  ],
];

export const KEYBOARD_ROWS: KeyDef[][] = RAW_ROWS.map((row, rowIndex) => {
  let cursor = 0;
  return row.map((raw) => {
    const def: KeyDef = { ...raw, row: rowIndex, x: cursor };
    cursor += raw.width;
    return def;
  });
});

export const ALL_KEYS: KeyDef[] = KEYBOARD_ROWS.flat();

export const KEY_BY_CODE: Record<string, KeyDef> = Object.fromEntries(
  ALL_KEYS.map((k) => [k.code, k])
);

export function getKeyGlyphs(
  key: KeyDef,
  layout: LayoutId,
  ruPunctuation: RuPunctuationMode
): { base: string; shift: string } {
  if (layout === 'en') {
    return { base: key.us, shift: key.usShift };
  }
  if (ruPunctuation === 'mac' && key.ruMac !== undefined && key.ruMacShift !== undefined) {
    return { base: key.ruMac, shift: key.ruMacShift };
  }
  return { base: key.ru, shift: key.ruShift };
}

export interface TargetKeyInfo {
  key: KeyDef;
  needsShift: boolean;
  shiftCode: 'ShiftLeft' | 'ShiftRight' | null;
  direction: ReachDirection;
  homeCode: string;
}

export function findTargetKeyForChar(
  char: string,
  layout: LayoutId,
  ruPunctuation: RuPunctuationMode
): TargetKeyInfo | null {
  if (char === ' ') {
    const spaceKey = KEY_BY_CODE['Space'];
    return {
      key: spaceKey,
      needsShift: false,
      shiftCode: null,
      direction: 'thumb',
      homeCode: 'Space',
    };
  }

  for (const key of ALL_KEYS) {
    if (key.isModifier) continue;
    const { base, shift } = getKeyGlyphs(key, layout, ruPunctuation);
    if (base === char || shift === char) {
      const needsShift = shift === char && base !== char;
      const hand = FINGER_HAND[key.finger];
      const shiftCode: 'ShiftLeft' | 'ShiftRight' | null = needsShift
        ? hand === 'left'
          ? 'ShiftRight'
          : 'ShiftLeft'
        : null;
      const homeCode = FINGER_HOME_CODE[key.finger];
      const direction = computeReachDirection(key, homeCode);
      return { key, needsShift, shiftCode, direction, homeCode };
    }
  }
  return null;
}

export function computeReachDirection(key: KeyDef, homeCode: string): ReachDirection {
  if (key.code === 'Space') return 'thumb';
  if (key.code === homeCode) return 'home';
  const home = KEY_BY_CODE[homeCode];
  if (!home) return 'home';
  if (key.row < home.row) return 'up';
  if (key.row > home.row) return 'down';
  const keyCenter = key.x + key.width / 2;
  const homeCenter = home.x + home.width / 2;
  const hand = FINGER_HAND[key.finger];
  if (hand === 'left') {
    return keyCenter > homeCenter ? 'in' : 'out';
  }
  return keyCenter < homeCenter ? 'in' : 'out';
}

export function getKeyCenter(key: KeyDef): { cx: number; cy: number } {
  return {
    cx: key.x + key.width / 2,
    cy: key.row + 0.5,
  };
}

export interface ResolvedKeypress {
  char: string;
  code: string | null;
}

/**
 * Resolves a KeyboardEvent into the typed character + physical key code.
 * Designed to stay resilient across Windows, macOS, Linux, and VNC/remote desktop
 * sessions where OS layout switching or X11 keycode quirks often scramble `,` and `.`.
 */
export function resolveKeypress(
  e: KeyboardEvent,
  layout: LayoutId,
  ruPunctuation: RuPunctuationMode,
  inputMapping: InputMappingMode
): ResolvedKeypress | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  if (
    e.key === 'Shift' ||
    e.key === 'Control' ||
    e.key === 'Alt' ||
    e.key === 'Meta' ||
    e.key === 'CapsLock' ||
    e.key === 'Tab' ||
    e.key === 'Escape' ||
    e.key === 'Enter' ||
    e.key === 'Backspace' ||
    e.key.startsWith('Arrow') ||
    e.key.startsWith('F')
  ) {
    return null;
  }

  if (e.code === 'Space' || e.key === ' ') {
    return { char: ' ', code: 'Space' };
  }

  // Native OS mode: trust the OS character directly and find matching physical key
  if (inputMapping === 'native') {
    if (e.key.length === 1) {
      const target = findTargetKeyForChar(e.key, layout, ruPunctuation);
      return {
        char: e.key,
        code: KEY_BY_CODE[e.code] ? e.code : target?.key.code ?? null,
      };
    }
    return null;
  }

  // Virtual hardware-code mode (default):
  // 1. Primary path: hardware scan code (`event.code`) maps cleanly regardless of OS language.
  const physicalKey = KEY_BY_CODE[e.code];
  if (physicalKey && !physicalKey.isModifier) {
    const { base, shift } = getKeyGlyphs(physicalKey, layout, ruPunctuation);
    const isShifted = e.shiftKey;
    return {
      char: isShifted ? shift : base,
      code: physicalKey.code,
    };
  }

  // 2. Fallback path for VNC / remote desktop / IME where `event.code` may be empty or "Unidentified":
  if (e.key.length === 1) {
    // Check if e.key is already in the target layout
    const directMatch = findTargetKeyForChar(e.key, layout, ruPunctuation);
    if (directMatch) {
      return { char: e.key, code: directMatch.key.code };
    }
    // Otherwise reverse-map from US QWERTY glyph to target layout
    const usMatch = findTargetKeyForChar(e.key, 'en', ruPunctuation);
    if (usMatch) {
      const { base, shift } = getKeyGlyphs(usMatch.key, layout, ruPunctuation);
      return {
        char: usMatch.needsShift || e.shiftKey ? shift : base,
        code: usMatch.key.code,
      };
    }
  }

  return null;
}

export function getDisplayLabelForCode(
  code: string,
  layout: LayoutId,
  ruPunctuation: RuPunctuationMode
): { primary: string; us: string } {
  const key = KEY_BY_CODE[code];
  if (!key) return { primary: '', us: '' };
  if (key.code === 'Space') return { primary: '␣', us: 'Space' };
  const { base } = getKeyGlyphs(key, layout, ruPunctuation);
  return {
    primary: base.toUpperCase(),
    us: key.us.toUpperCase(),
  };
}
