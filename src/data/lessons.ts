import { KeyStat, LayoutId, Lesson, RuPunctuationMode } from '../types';
import { getKeyGlyphs, KEY_BY_CODE } from './keyboard';

export const RUSSIAN_LESSONS: Lesson[] = [
  {
    id: 'ru-01-home',
    layout: 'ru',
    stage: 1,
    title: {
      en: 'Home Row Anchor',
      ru: 'Опора на домашний ряд',
    },
    subtitle: {
      en: 'Ф Ы В А · О Л Д Ж — lock index fingers to F and J bumps',
      ru: 'Ф Ы В А · О Л Д Ж — якорь на выступах F (А) и J (О)',
    },
    tip: {
      en: 'Keep wrists straight and floating lightly—never pressed hard onto the desk. Let each finger tap gently without hammering the keys.',
      ru: 'Держите запястья прямо и легко на весу — не упирайтесь ими в край стола. Нажимайте клавиши мягко, без сильного удара.',
    },
    focusCodes: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
    targetWpm: 25,
    targetAccuracy: 96,
    drills: [
      'фа фа ол ол вы вы дж дж вода лада жало овал ложа ждал выл давал вдова лава вывод довод дылда выла жажда овод дал вал лад дол',
      'вода овал ложа жало давал выдол лада вдова вывод довод ждал лава фал овод дылда выла жажда вода жало давал ложа овал вывод',
    ],
    chordPool: ['фа', 'ол', 'вы', 'дж', 'ва', 'да', 'ла', 'до', 'во', 'жа', 'ло', 'од'],
    wordPool: [
      'вода', 'лада', 'жало', 'овал', 'ложа', 'ждал', 'выл', 'давал', 'вдова', 'лава',
      'вывод', 'довод', 'дылда', 'выла', 'жажда', 'овод', 'дал', 'вал', 'лад', 'дол',
      'вол', 'фал', 'жал', 'выдал', 'жала', 'ало', 'вожжа', 'дож',
    ],
  },
  {
    id: 'ru-02-inner',
    layout: 'ru',
    stage: 2,
    title: {
      en: 'Inner Index Snap-Back',
      ru: 'Центр: П и Р с возвратом',
    },
    subtitle: {
      en: 'П (G) · Р (H) — reach inward and snap right back to the bumps',
      ru: 'П (G) · Р (H) — движение к центру и мгновенный возврат на А и О',
    },
    tip: {
      en: 'Two-finger habits make hands drift toward the center. Reach for П or Р, then feel the bump on А or О again before the next word.',
      ru: 'После нажатия П или Р сразу возвращайте указательный палец на выступ А или О, не смещая всю ладонь.',
    },
    focusCodes: ['KeyG', 'KeyH', 'KeyF', 'KeyJ'],
    targetWpm: 28,
    targetAccuracy: 96,
    drills: [
      'ап ор па ро пара пора правда двор жара фара повод повар провод порода порыв пожар опора дыра право дрова дар жар пар провода',
      'повар подавал дрова правда опора порода проводы порыв пожар двор фара пора пара право повод провод жара дыра радар ров вор',
    ],
    chordPool: ['пр', 'по', 'ра', 'ро', 'ор', 'ар', 'па', 'про', 'прав', 'вар'],
    wordPool: [
      'пара', 'пора', 'правда', 'двор', 'жара', 'фара', 'повод', 'повар', 'провод', 'порода',
      'порыв', 'пожар', 'опора', 'дыра', 'право', 'дрова', 'дар', 'жар', 'пар', 'провода',
      'подавал', 'проводы', 'радар', 'ров', 'вор', 'рад', 'рада', 'прав', 'подрал', 'провал',
    ],
  },
  {
    id: 'ru-03-outer-top',
    layout: 'ru',
    stage: 3,
    title: {
      en: 'Waking Ring & Middle Top Row',
      ru: 'Пробуждение верхнего ряда: Ц У Ш Щ',
    },
    subtitle: {
      en: 'Ц (W) · У (E) · Ш (I) · Щ (O) — train the fingers 2-finger typing ignores',
      ru: 'Ц (W) · У (E) · Ш (I) · Щ (O) — включаем безымянные и средние пальцы',
    },
    tip: {
      en: 'Resist the urge to reach up with your index finger! Left ring owns Ц, left middle owns У, right middle owns Ш, right ring owns Щ.',
      ru: 'Не помогайте указательным! Ц — левый безымянный, У — левый средний, Ш — правый средний, Щ — правый безымянный.',
    },
    focusCodes: ['KeyW', 'KeyE', 'KeyI', 'KeyO'],
    targetWpm: 28,
    targetAccuracy: 95,
    drills: [
      'ыц ву лш дщ душа роща плащ лужа удар пудра руда дупло улов упал ушла лупа лапша шалаш шуруп шпала шарф шпора рупор управа',
      'щупал прощал шуршал ощупал овца дворца пловца продавца царапал душа роща плащ шуруп лужа удар пудра лапша шалаш шпора улов',
    ],
    chordPool: ['уш', 'ша', 'ща', 'ца', 'ру', 'пу', 'ду', 'шу', 'прощ', 'лу'],
    wordPool: [
      'душа', 'роща', 'плащ', 'лужа', 'удар', 'пудра', 'руда', 'дупло', 'улов', 'упал',
      'ушла', 'лупа', 'лапша', 'шалаш', 'шуруп', 'шпала', 'шарф', 'шпора', 'рупор', 'управа',
      'щупал', 'прощал', 'шуршал', 'ощупал', 'овца', 'дворца', 'пловца', 'продавца', 'царапал', 'упала',
    ],
  },
  {
    id: 'ru-04-top-core',
    layout: 'ru',
    stage: 4,
    title: {
      en: 'High-Frequency Top Core',
      ru: 'Основа верхнего ряда: К Е Н Г',
    },
    subtitle: {
      en: 'К (R) · Е (T) · Н (Y) · Г (U) — building fast Russian syllable flow',
      ru: 'К (R) · Е (T) · Н (Y) · Г (U) — частые русские слоги и плавный темп',
    },
    tip: {
      en: 'Left index reaches up to К and up-right to Е. Right index reaches up-left to Н and up to Г. Keep outer fingers resting gently on home.',
      ru: 'Левый указательный берёт К и Е, правый — Н и Г. Остальные пальцы спокойно отдыхают на домашнем ряду.',
    },
    focusCodes: ['KeyR', 'KeyT', 'KeyY', 'KeyU'],
    targetWpm: 32,
    targetAccuracy: 96,
    drills: [
      'ак ае он ог окно рука река кран век дело дорога город нога урок дерево кофе круг друг награда прогулка погода пена легенда',
      'коллега подруга корона надежда генерал уверенно огурец груша курган кукушка переулок уголок огород корка коршун пекарен рекордер',
    ],
    chordPool: ['не', 'на', 'ок', 'ко', 'ре', 'го', 'ен', 'ка', 'пр', 'пере', 'ого'],
    wordPool: [
      'окно', 'рука', 'река', 'кран', 'век', 'дело', 'дорога', 'город', 'нога', 'урок',
      'дерево', 'кофе', 'круг', 'друг', 'награда', 'прогулка', 'погода', 'пена', 'легенда',
      'коллега', 'подруга', 'корона', 'надежда', 'генерал', 'уверенно', 'огурец', 'груша',
      'курган', 'кукушка', 'переулок', 'уголок', 'огород', 'корка', 'коршун', 'пекарен', 'народ',
    ],
  },
  {
    id: 'ru-05-bottom',
    layout: 'ru',
    stage: 5,
    title: {
      en: 'Bottom Row Without Diving',
      ru: 'Нижний ряд без нырков кистью',
    },
    subtitle: {
      en: 'Ч (X) · С (C) · М (V) · И (B) · Т (N) · Ь (M) · Б (,) · Ю (.)',
      ru: 'Ч (X) · С (C) · М (V) · И (B) · Т (N) · Ь (M) · Б (,) · Ю (.)',
    },
    tip: {
      en: 'Notice US comma (,) is Russian Б (right middle) and US period (.) is Russian Ю (right ring). Curl individual fingers down instead of pulling your hand back.',
      ru: 'Обратите внимание: клавиша US «,» — это русская Б (правый средний), а US «.» — русская Ю (правый безымянный).',
    },
    focusCodes: ['KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period'],
    targetWpm: 32,
    targetAccuracy: 95,
    drills: [
      'мысль письмо быстро чисто место слово ритм текст тишина любить работать смотреть слушать читать учиться набирать система',
      'минута ошибка привычка суббота билет юность чудо смысл точность движение вечер чувство доброта событие свобода простор',
    ],
    chordPool: ['ст', 'ть', 'то', 'ти', 'си', 'ми', 'би', 'чи', 'ость', 'ение', 'при'],
    wordPool: [
      'мысль', 'письмо', 'быстро', 'чисто', 'место', 'слово', 'ритм', 'текст', 'тишина', 'любить',
      'работать', 'смотреть', 'слушать', 'читать', 'учиться', 'набирать', 'система', 'минута',
      'ошибка', 'привычка', 'суббота', 'билет', 'юность', 'чудо', 'смысл', 'точность', 'движение',
      'вечер', 'чувство', 'доброта', 'событие', 'свобода', 'простор', 'мост', 'свет', 'строка',
    ],
  },
  {
    id: 'ru-06-unlabeled-edges',
    layout: 'ru',
    stage: 6,
    title: {
      en: 'Unlabeled US Edge Keys',
      ru: 'Немаркированные крайние клавиши US',
    },
    subtitle: {
      en: 'Х ([) · Ъ (]) · Ж (;) · Э (\') · Ё (`) · З (P) · Й (Q) · Я (Z)',
      ru: 'Х ([) · Ъ (]) · Ж (;) · Э (\') · Ё (`) · З (P) · Й (Q) · Я (Z)',
    },
    tip: {
      en: 'RSI-safe reach: for far right-pinky keys Х ([), Ъ (]), Э (\') or left Ё (`), glide your whole hand slightly rather than twisting your wrist, then touch back to А/О.',
      ru: 'Без нагрузки на кисть: к крайним Х ([), Ъ (]), Э (\') и Ё (`) слегка сдвигайте всю ладонь вместе с пальцем, не выворачивая запястье, и возвращайтесь к А/О.',
    },
    focusCodes: ['BracketLeft', 'BracketRight', 'Semicolon', 'Quote', 'Backquote', 'KeyP', 'KeyQ', 'KeyZ'],
    targetWpm: 28,
    targetAccuracy: 94,
    drills: [
      'эхо ёжик объект подъезд съезд хлеб холод воздух язык январь звезда знание задача жизнь этаж экран эффект объём разъём',
      'лёгкий тёплый чёрный зелёный тихий хороший желание яблоко эпоха въезд изъян край май хозяйка зеркало экипаж разъезд ёлка',
    ],
    chordPool: ['хо', 'хе', 'зн', 'жи', 'эк', 'эт', 'ый', 'ий', 'ъе', 'ъя', 'ёж', 'яб'],
    wordPool: [
      'эхо', 'ёжик', 'объект', 'подъезд', 'съезд', 'хлеб', 'холод', 'воздух', 'язык', 'январь',
      'звезда', 'знание', 'задача', 'жизнь', 'этаж', 'экран', 'эффект', 'объём', 'разъём',
      'лёгкий', 'тёплый', 'чёрный', 'зелёный', 'тихий', 'хороший', 'желание', 'яблоко', 'эпоха',
      'въезд', 'изъян', 'край', 'май', 'хозяйка', 'зеркало', 'экипаж', 'разъезд', 'ёлка', 'время', 'память',
    ],
  },
  {
    id: 'ru-07-bigrams',
    layout: 'ru',
    stage: 7,
    title: {
      en: 'Russian Bigrams & Suffix Cadence',
      ru: 'Частые слоги и ритм суффиксов',
    },
    subtitle: {
      en: '-ость · -ение · при- · про- · -ого — turning letters into fluid chords',
      ru: '-ость · -ение · при- · про- · -ого — переход от букв к целым слогам',
    },
    tip: {
      en: 'Read whole syllables ahead rather than single letters. Let alternating hands create a steady metronome rhythm.',
      ru: 'Смотрите вперёд на целый слог, а не на одну букву. Чередование рук само выстраивает ровный ритм.',
    },
    focusCodes: ['KeyJ', 'KeyC', 'KeyN', 'KeyM', 'KeyT', 'KeyY', 'KeyB', 'KeyG', 'KeyH'],
    targetWpm: 38,
    targetAccuracy: 96,
    drills: [
      'скорость точность лёгкость прочность движение решение внимание ощущение привычка практика проверка причина пример природа',
      'пространство приложение продолжение производство простого нового доброго важного переучивание понимание спокойствие',
    ],
    chordPool: ['ость', 'ение', 'при', 'про', 'ого', 'ств', 'ние', 'пере', 'пра', 'ска'],
    wordPool: [
      'скорость', 'точность', 'лёгкость', 'прочность', 'движение', 'решение', 'внимание', 'ощущение',
      'привычка', 'практика', 'проверка', 'причина', 'пример', 'природа', 'пространство',
      'приложение', 'продолжение', 'производство', 'простого', 'нового', 'доброго', 'важного',
      'переучивание', 'понимание', 'спокойствие', 'уверенность', 'возможность', 'настроение', 'привыкание',
    ],
  },
  {
    id: 'ru-08-shift-punct',
    layout: 'ru',
    stage: 8,
    title: {
      en: 'Opposite-Hand Shift & Punctuation',
      ru: 'Заглавные и знаки препинания (. и ,)',
    },
    subtitle: {
      en: 'Hold opposite Shift; period is US / and comma is ⇧ + / (or Mac ⇧7 / ⇧6)',
      ru: 'Shift противоположной рукой; точка на /, запятая на ⇧ + / (или Mac ⇧7 / ⇧6)',
    },
    tip: {
      en: 'For Russian comma in PC layout, hold Left Shift with your left pinky while right pinky taps US /. Never twist one hand to press both.',
      ru: 'Для запятой (в раскладке PC) зажмите левый Shift левым мизинцем и нажмите «/» правым. Никогда не тяните одну руку на обе клавиши.',
    },
    focusCodes: ['Slash', 'ShiftLeft', 'ShiftRight'],
    targetWpm: 35,
    targetAccuracy: 96,
    drills: [
      'Утро началось спокойно, воздух был свежий. Пальцы сами находят нужные клавиши, не глядя вниз. Точность важнее спешки.',
      'Москва, Казань, Томск, Пермь. Каждая буква на своём месте, каждый палец знает дорогу домой. Спокойный ритм рождает скорость.',
    ],
    chordPool: ['Утро,', 'День,', 'Вечер,', 'Москва,', 'Точно.', 'Плавно.'],
    wordPool: [
      'Утро,', 'вечер,', 'воздух.', 'Пальцы,', 'клавиши,', 'ритм.', 'Москва,', 'Казань,',
      'Томск,', 'Пермь.', 'Точность,', 'скорость,', 'память.', 'Спокойно,', 'уверенно,', 'легко.',
      'Слово,', 'строка,', 'смысл.', 'Привычка,', 'практика,', 'результат.',
    ],
  },
  {
    id: 'ru-09-prose',
    layout: 'ru',
    stage: 9,
    title: {
      en: 'Everyday Russian Prose Flow',
      ru: 'Свободный набор связного текста',
    },
    subtitle: {
      en: 'Sustained real-world sentences using all 33 letters and natural punctuation',
      ru: 'Плавный набор живых предложений со всеми буквами и знаками препинания',
    },
    tip: {
      en: 'Relax your shoulders and keep your eyes glued to the text line. Notice how your hands stay centered over А and О.',
      ru: 'Расслабьте плечи и не опускайте взгляд на клавиатуру. Почувствуйте, как ладони остаются спокойными над А и О.',
    },
    focusCodes: ['KeyF', 'KeyJ', 'Space'],
    targetWpm: 42,
    targetAccuracy: 96,
    drills: [
      'Хорошая привычка формируется тихо, день за днём. Когда все десять пальцев работают вместе, текст льётся свободно, а усталость уходит.',
      'Сначала руки ищут старые пути, но уже через несколько коротких занятий пальцы начинают доверять новым маршрутам. Не торопитесь, держите ритм.',
    ],
    chordPool: ['день', 'ритм', 'текст', 'руки', 'путь', 'мысль'],
    wordPool: [
      'Хорошая', 'привычка', 'формируется', 'тихо,', 'день', 'за', 'днём.', 'Пальцы', 'работают',
      'вместе,', 'текст', 'льётся', 'свободно,', 'усталость', 'уходит.', 'Короткие', 'занятия',
      'перестраивают', 'память,', 'спокойный', 'ритм', 'рождает', 'уверенную', 'скорость.',
    ],
  },
  {
    id: 'ru-10-blindfold',
    layout: 'ru',
    stage: 10,
    title: {
      en: 'Blindfold Fade Mastery',
      ru: 'Слепой режим без подсказок',
    },
    subtitle: {
      en: 'On-screen keycaps go blank as your streak climbs, locking pure muscle memory',
      ru: 'Подписи клавиш исчезают по мере серии — закрепляем чистую мышечную память',
    },
    tip: {
      en: 'Trust your fingertips. If you hesitate for a moment, the target key gently reappears so you never get stuck.',
      ru: 'Доверьтесь пальцам. Если вы задумаетесь на секунду, нужная клавиша мягко проявится сама.',
    },
    focusCodes: ['KeyF', 'KeyJ', 'BracketLeft', 'Semicolon', 'Quote', 'Slash'],
    targetWpm: 45,
    targetAccuracy: 96,
    defaultHintMode: 'blind',
    drills: [
      'Чистая слепая печать открывает редкое удовольствие: мысль сразу становится текстом на экране, без лишних пауз и взглядов вниз.',
      'Даже на клавиатуре без русских букв пальцы безошибочно находят эхо, подъезд, звёздный вечер, мягкий свет и точный знак препинания.',
    ],
    chordPool: ['эхо', 'подъезд', 'звёзд', 'лёгкий', 'точность', 'движение'],
    wordPool: [
      'Чистая', 'слепая', 'печать,', 'мысль', 'становится', 'текстом', 'на', 'экране.', 'Пальцы',
      'безошибочно', 'находят', 'эхо,', 'подъезд,', 'звёздный', 'вечер,', 'мягкий', 'свет,',
      'тёплый', 'воздух', 'и', 'точный', 'знак', 'препинания.', 'Ровный', 'ритм', 'приносит', 'лёгкость.',
    ],
  },
];

export const ENGLISH_LESSONS: Lesson[] = [
  {
    id: 'en-01-home',
    layout: 'en',
    stage: 1,
    title: {
      en: 'Home Row Anchor',
      ru: 'Домашний ряд QWERTY',
    },
    subtitle: {
      en: 'A S D F · J K L ; — lock index fingers to physical F and J bumps',
      ru: 'A S D F · J K L ; — опора указательных пальцев на F и J',
    },
    tip: {
      en: 'Rest all eight fingers lightly on the home row with straight floating wrists. Tap gently without heavy strikes.',
      ru: 'Держите все восемь пальцев на домашнем ряду с прямыми запястьями на весу. Нажимайте мягко.',
    },
    focusCodes: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
    targetWpm: 30,
    targetAccuracy: 96,
    drills: [
      'fall lad ask flask salad glad dad sad all jazz add fall dash flash ask; lass glass half; fall salad glad flask ask dad',
      'ask all lads; a sad dad had a glass flask; fall salad dash; glad lass asks; add a dash; half a glass; fall all day',
    ],
    chordPool: ['al', 'as', 'la', 'ad', 'fa', 'ja', 'sk', 'ld', 'all', 'ask'],
    wordPool: [
      'fall', 'lad', 'ask', 'flask', 'salad', 'glad', 'dad', 'sad', 'all', 'add',
      'lass', 'glass', 'half', 'fall;', 'ask;', 'alas', 'falls', 'asks', 'lads', 'flak', 'daff',
    ],
  },
  {
    id: 'en-02-top-core',
    layout: 'en',
    stage: 2,
    title: {
      en: 'Inner Index & Top Core',
      ru: 'Центр и основа верхнего ряда',
    },
    subtitle: {
      en: 'G H · E R T Y U I — high-frequency English vowels and consonants',
      ru: 'G H · E R T Y U I — ключевые гласные и согласные английского',
    },
    tip: {
      en: 'After reaching for G, H, T, or Y, let your index fingers immediately touch back down on F and J.',
      ru: 'После нажатия G, H, T или Y сразу возвращайте указательные пальцы на F и J.',
    },
    focusCodes: ['KeyG', 'KeyH', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI'],
    targetWpm: 35,
    targetAccuracy: 96,
    drills: [
      'the their there light right flight sight earth heart great street quiet guide fruit truth trust fresh draft shift',
      'she heard the quiet rain drift past the bright glass; their sturdy chair sits near the warm hearth',
    ],
    chordPool: ['th', 'he', 'er', 're', 'te', 'ri', 'gh', 'the', 'igh', 'str'],
    wordPool: [
      'the', 'their', 'there', 'light', 'right', 'flight', 'sight', 'earth', 'heart', 'great',
      'street', 'guide', 'fruit', 'truth', 'trust', 'fresh', 'draft', 'shift', 'drift', 'bright',
      'sturdy', 'hearth', 'three', 'ready', 'field', 'ridge', 'steel', 'rider',
    ],
  },
  {
    id: 'en-03-outer',
    layout: 'en',
    stage: 3,
    title: {
      en: 'Ring & Pinky Independence',
      ru: 'Независимость крайних пальцев',
    },
    subtitle: {
      en: 'Q W O P · Z X . / — stop rescuing outer keys with index fingers',
      ru: 'Q W O P · Z X . / — тренировка безымянных и мизинцев',
    },
    tip: {
      en: 'Keep elbows relaxed and glide slightly on outer pinky keys instead of twisting your wrist sideways.',
      ru: 'Расслабьте локти и слегка сдвигайте кисть к крайним клавишам мизинца без изгиба запястья.',
    },
    focusCodes: ['KeyQ', 'KeyW', 'KeyO', 'KeyP', 'KeyZ', 'KeyX', 'Period', 'Slash'],
    targetWpm: 35,
    targetAccuracy: 95,
    drills: [
      'quick quiet power plow zero zone extra pixel paper proper willow shadow quartz wax puzzle quote explore export',
      'a quiet fox prowls past two warm lamps. slow down on outer keys, keep wrists steady, and let pinkies work.',
    ],
    chordPool: ['qu', 'ow', 'po', 'op', 'wo', 'pr', 'pl', 'ex', 'ze', 'pro'],
    wordPool: [
      'quick', 'quiet', 'power', 'plow', 'zero', 'zone', 'extra', 'pixel', 'paper', 'proper',
      'willow', 'shadow', 'quartz', 'wax', 'puzzle', 'quote', 'explore', 'export', 'prowl',
      'slow', 'work.', 'focus.', 'water', 'spark', 'plaza', 'oxide', 'prize',
    ],
  },
  {
    id: 'en-04-bottom',
    layout: 'en',
    stage: 4,
    title: {
      en: 'Bottom-Row Discipline',
      ru: 'Нижний ряд без срыва позиции',
    },
    subtitle: {
      en: 'C V B N M , — clean downward curls while anchoring the top palm',
      ru: 'C V B N M , — чёткие движения вниз без смещения рук',
    },
    tip: {
      en: 'Left index owns V and B; right index owns N and M. Keep your middle finger on K when pressing comma.',
      ru: 'Левый указательный берёт V и B, правый — N и M. Запятую нажимайте правым средним пальцем.',
    },
    focusCodes: ['KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma'],
    targetWpm: 38,
    targetAccuracy: 96,
    drills: [
      'calm climb combine common cover cabin brave nerve motion moment balance bench branch canvas marble number',
      'common habits bend slowly, become natural, and build calm confidence over many brief, mindful minutes',
    ],
    chordPool: ['in', 'an', 'on', 'en', 'nd', 'nt', 'ing', 'com', 'men', 'ver'],
    wordPool: [
      'calm', 'climb', 'combine', 'common', 'cover', 'cabin', 'brave', 'nerve', 'motion', 'moment',
      'balance', 'bench', 'branch', 'canvas', 'marble', 'number', 'become', 'natural,', 'mindful',
      'minutes', 'confidence', 'garden', 'window', 'memory', 'morning', 'silver', 'anchor',
    ],
  },
  {
    id: 'en-05-shift',
    layout: 'en',
    stage: 5,
    title: {
      en: 'Opposite-Hand Shift & Rhythm',
      ru: 'Shift противоположной рукой и пунктуация',
    },
    subtitle: {
      en: 'Capitals, commas, periods, and clean sentence cadence',
      ru: 'Заглавные буквы, запятые, точки и ровный темп предложений',
    },
    tip: {
      en: 'Hold Right Shift for left-hand capitals and Left Shift for right-hand capitals. Release Shift smoothly as the letter lands.',
      ru: 'Держите правый Shift для левых букв и левый Shift для правых. Отпускайте его сразу после нажатия.',
    },
    focusCodes: ['ShiftLeft', 'ShiftRight', 'Comma', 'Period'],
    targetWpm: 40,
    targetAccuracy: 96,
    drills: [
      'Monday morning starts quietly. Coffee steams beside the desk, fingers settle on F and J, and clean sentences take shape.',
      'Boston, London, Prague, Kyoto. Steady accuracy builds real speed far faster than rushing through mistakes.',
    ],
    chordPool: ['The', 'And', 'For', 'With', 'tion', 'ment', 'ing.'],
    wordPool: [
      'Monday', 'morning,', 'Coffee', 'steams,', 'Boston,', 'London,', 'Prague,', 'Kyoto.',
      'Steady', 'accuracy,', 'clean', 'rhythm,', 'fluent', 'sentences.', 'Calm', 'focus,',
      'natural', 'cadence.', 'Simple', 'habits,', 'lasting', 'progress.',
    ],
  },
  {
    id: 'en-06-prose',
    layout: 'en',
    stage: 6,
    title: {
      en: 'Natural English Prose & Blindfold',
      ru: 'Связный английский текст вслепую',
    },
    subtitle: {
      en: 'Full-keyboard flow with fading keycap hints',
      ru: 'Свободный набор на всей клавиатуре с затухающими подсказками',
    },
    tip: {
      en: 'Look slightly ahead of the active word. Let your fingers roll through familiar endings like -ing, -tion, and -ed.',
      ru: 'Смотрите чуть вперёд по строке, позволяя пальцам плавно проходить знакомые окончания.',
    },
    focusCodes: ['KeyF', 'KeyJ', 'Space'],
    targetWpm: 45,
    targetAccuracy: 96,
    defaultHintMode: 'blind',
    drills: [
      'Touch typing turns the keyboard into a transparent instrument. Once every finger knows its home column, your attention stays completely on the ideas you want to express.',
      'Switching cleanly between Russian and English on the same unlabeled board becomes effortless when muscle memory replaces visual hunting.',
    ],
    chordPool: ['ing', 'tion', 'the', 'and', 'ent', 'for', 'with'],
    wordPool: [
      'Touch', 'typing', 'turns', 'the', 'keyboard', 'into', 'a', 'calm,', 'transparent',
      'instrument.', 'Every', 'finger', 'knows', 'its', 'home', 'column,', 'rhythm', 'stays',
      'even,', 'and', 'muscle', 'memory', 'replaces', 'visual', 'hunting.', 'Steady', 'flow.',
    ],
  },
];

export function getLessonsForLayout(layout: LayoutId): Lesson[] {
  return layout === 'ru' ? RUSSIAN_LESSONS : ENGLISH_LESSONS;
}

const RU_WORD_BANK = [
  'вода', 'лада', 'жало', 'вывод', 'довод', 'овал', 'ложа', 'жажда', 'вдова',
  'правда', 'повар', 'провод', 'порода', 'пожар', 'опора', 'дрова', 'право',
  'душа', 'роща', 'плащ', 'лужа', 'удар', 'пудра', 'дупло', 'лапша', 'шалаш',
  'шуруп', 'шпора', 'рупор', 'управа', 'щупал', 'овца', 'дворца', 'царапал',
  'окно', 'рука', 'река', 'кран', 'дорога', 'город', 'урок', 'дерево', 'кофе',
  'друг', 'награда', 'прогулка', 'погода', 'легенда', 'коллега', 'надежда',
  'мысль', 'письмо', 'быстро', 'чисто', 'место', 'слово', 'ритм', 'текст',
  'тишина', 'работать', 'смотреть', 'слушать', 'читать', 'учиться', 'система',
  'минута', 'ошибка', 'привычка', 'суббота', 'билет', 'юность', 'чудо', 'смысл',
  'точность', 'движение', 'чувство', 'доброта', 'событие', 'свобода', 'простор',
  'эхо', 'ёжик', 'объект', 'подъезд', 'съезд', 'хлеб', 'холод', 'воздух', 'язык',
  'январь', 'звезда', 'знание', 'задача', 'жизнь', 'этаж', 'экран', 'эффект',
  'объём', 'разъём', 'лёгкий', 'тёплый', 'чёрный', 'зелёный', 'тихий', 'хороший',
  'желание', 'яблоко', 'эпоха', 'въезд', 'изъян', 'зеркало', 'экипаж', 'ёлка',
  'скорость', 'практика', 'проверка', 'причина', 'природа', 'пространство',
  'приложение', 'продолжение', 'понимание', 'спокойствие', 'время', 'память',
  'вечер', 'утро', 'свет', 'путь', 'шаг', 'дом', 'лес', 'море', 'небо', 'снег',
  'ветер', 'дождь', 'мост', 'книга', 'строка', 'клавиша', 'палец', 'ритмично',
];

const EN_WORD_BANK = [
  'fall', 'flask', 'salad', 'glad', 'glass', 'flash', 'light', 'right', 'flight',
  'earth', 'heart', 'great', 'street', 'quiet', 'guide', 'fruit', 'truth', 'trust',
  'fresh', 'draft', 'shift', 'quick', 'power', 'zero', 'zone', 'extra', 'pixel',
  'paper', 'proper', 'willow', 'shadow', 'quartz', 'puzzle', 'quote', 'explore',
  'export', 'calm', 'climb', 'combine', 'common', 'cover', 'cabin', 'brave',
  'nerve', 'motion', 'moment', 'balance', 'bench', 'branch', 'canvas', 'marble',
  'number', 'steady', 'rhythm', 'finger', 'anchor', 'memory', 'typing', 'studio',
  'simple', 'smooth', 'bridge', 'window', 'garden', 'silver', 'coffee', 'letter',
  'phrase', 'fluent', 'habit', 'focus', 'clarity', 'modern', 'wooden', 'gentle',
];

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a fresh, unpredictable ~20-token drill combining:
 * - High-frequency syllable chord bursts paired directly with words containing that chord
 * - Stage-pure shuffled real words (strictly respecting unlocked letters up to this stage)
 * - 15–20% surprise review / weak-key words drawn only from earlier unlocked stages
 */
export function generateMixedChordDrill(
  lesson: Lesson,
  allLessons: Lesson[],
  keyStats: Record<string, KeyStat>,
  ruPunctuation: RuPunctuationMode
): string {
  const words =
    lesson.wordPool && lesson.wordPool.length > 0
      ? lesson.wordPool
      : lesson.drills[0].split(/\s+/).filter(Boolean);
  const chords = lesson.chordPool ?? [];

  // Surprise review pool strictly from prior stages (so unlearned letters never leak in)
  const priorWords: string[] = [];
  if (!lesson.isAdaptive && lesson.stage > 1) {
    for (const prev of allLessons) {
      if (prev.stage > 0 && prev.stage < lesson.stage && prev.wordPool) {
        priorWords.push(...prev.wordPool);
      }
    }
  }

  // Prioritize prior/stage words that contain tracked weak keys
  const weakChars = computeWeakKeyCodes(keyStats, lesson.layout, 4)
    .map((w) => {
      const k = KEY_BY_CODE[w.code];
      return k ? getKeyGlyphs(k, lesson.layout, ruPunctuation).base.toLowerCase() : '';
    })
    .filter(Boolean);

  const surprisePool =
    priorWords.length > 0
      ? shuffleArray(
          priorWords.filter((w) => weakChars.some((ch) => w.toLowerCase().includes(ch)))
        ).concat(shuffleArray(priorWords))
      : [];

  const shuffledWords = shuffleArray(words);
  const shuffledChords = shuffleArray(chords);

  const tokens: string[] = [];
  let wordCursor = 0;
  let surpriseCursor = 0;

  const pushUnique = (tok: string) => {
    if (!tok) return;
    if (tokens.length > 0 && tokens[tokens.length - 1] === tok) return;
    tokens.push(tok);
  };

  // 1. Lead with 2–3 tight chord + real-word roll pairs (e.g. "пр правда" or "ость скорость")
  const chordPairCount = Math.min(3, shuffledChords.length);
  for (let i = 0; i < chordPairCount; i++) {
    const chord = shuffledChords[i];
    pushUnique(chord);
    const matchingWord = shuffledWords.find(
      (w) => w.toLowerCase().includes(chord.toLowerCase()) && !tokens.includes(w)
    );
    if (matchingWord) {
      pushUnique(matchingWord);
    }
  }

  // 2. Fill remaining ~18–20 tokens with unpredictable stage words + ~20% surprise reviews + occasional chord echo
  while (tokens.length < 20) {
    const roll = Math.random();
    if (roll < 0.2 && surpriseCursor < surprisePool.length) {
      pushUnique(surprisePool[surpriseCursor++]);
    } else if (roll < 0.32 && shuffledChords.length > 0) {
      const ch = shuffledChords[Math.floor(Math.random() * shuffledChords.length)];
      pushUnique(ch);
    } else {
      if (wordCursor >= shuffledWords.length) {
        wordCursor = 0;
      }
      pushUnique(shuffledWords[wordCursor++]);
    }
  }

  return tokens.join(' ');
}

export function computeWeakKeyCodes(
  stats: Record<string, KeyStat>,
  layout: LayoutId,
  limit = 5
): { code: string; score: number; errorRate: number; avgMs: number; total: number }[] {
  const entries: { code: string; score: number; errorRate: number; avgMs: number; total: number }[] = [];

  for (const [code, s] of Object.entries(stats)) {
    const key = KEY_BY_CODE[code];
    if (!key || key.isModifier || code === 'Space') continue;
    const total = s.hits + s.misses;
    if (total < 2) continue;
    const errorRate = s.misses / total;
    const avgMs = s.hits > 0 ? s.totalLatencyMs / s.hits : 600;
    const score = errorRate * 100 + Math.min(avgMs, 1200) / 25;
    entries.push({ code, score, errorRate, avgMs, total });
  }

  return entries
    .filter((e) => {
      const k = KEY_BY_CODE[e.code];
      return layout === 'ru' ? Boolean(k?.ru) : Boolean(k?.us);
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildAdaptiveWeakLesson(
  stats: Record<string, KeyStat>,
  layout: LayoutId,
  ruPunctuation: RuPunctuationMode
): Lesson {
  const weak = computeWeakKeyCodes(stats, layout, 5);
  const focusCodes =
    weak.length > 0
      ? weak.map((w) => w.code)
      : layout === 'ru'
        ? ['BracketLeft', 'Semicolon', 'Quote', 'KeyO', 'KeyW']
        : ['KeyP', 'KeyQ', 'KeyZ', 'KeyX', 'Period'];

  const targetChars = focusCodes
    .map((c) => {
      const k = KEY_BY_CODE[c];
      return k ? getKeyGlyphs(k, layout, ruPunctuation).base.toLowerCase() : '';
    })
    .filter(Boolean);

  const bank = layout === 'ru' ? RU_WORD_BANK : EN_WORD_BANK;
  const scoredWords = bank.map((word) => {
    let matches = 0;
    for (const ch of targetChars) {
      if (word.includes(ch)) matches += 1;
    }
    return { word, matches };
  });

  const matching = scoredWords
    .filter((w) => w.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 28)
    .map((w) => w.word);

  const pool = matching.length >= 10 ? matching : bank.slice(0, 24);
  const picked = shuffleArray(pool).slice(0, 18);

  const labelList = targetChars.map((c) => c.toUpperCase()).join(' ');

  return {
    id: `${layout}-adaptive-weak`,
    layout,
    stage: 0,
    isAdaptive: true,
    title: {
      en: 'Targeted Weakness Drill',
      ru: 'Тренировка слабых клавиш',
    },
    subtitle: {
      en: `Focused real words for: ${labelList}`,
      ru: `Живые слова с акцентом на: ${labelList}`,
    },
    tip: {
      en: 'Slow down slightly before each highlighted key so the assigned finger makes a clean, confident reach.',
      ru: 'Чуть замедляйтесь перед подсвеченными клавишами, чтобы нужный палец точно запомнил траекторию.',
    },
    focusCodes,
    targetWpm: 32,
    targetAccuracy: 96,
    drills: [picked.join(' ')],
    wordPool: pool,
  };
}
