const THEME_BOUNDS = [
  { start: 6, end: 9, theme: 'theme-morning' },
  { start: 9, end: 11, theme: 'theme-day' },
  { start: 11, end: 13, theme: 'theme-noon' },
  { start: 13, end: 17, theme: 'theme-afternoon' },
  { start: 17, end: 20, theme: 'theme-dusk' },
  { start: 20, end: 22, theme: 'theme-evening' }
];

const COPY = {
  'theme-morning':   { greeting: '一日之计在于晨。',     subtitle: '昨晚睡得好吗？我的朋友' },
  'theme-day':       { greeting: '今日もがんばってね！', subtitle: '毎日も一生懸命でした' },
  'theme-noon':      { greeting: '中午好。',             subtitle: '不吃午饭也可以' },
  'theme-afternoon': { greeting: 'Good afternoon～',     subtitle: 'Let‘s have some tea.' },
  'theme-dusk':      { greeting: 'What a day...',        subtitle: '今天你看到日落了吗？' },
  'theme-evening':   { greeting: '晚上好。',             subtitle: '晚饭要吃七分饱' },
  'theme-night':     { greeting: 'おやすみZZZZ',         subtitle: 'zzzZZZZZ' }
};

const WHITE_LOGO_THEMES = new Set(['theme-afternoon', 'theme-evening', 'theme-night']);

export function getCurrentTheme(now = new Date()) {
  const hour = now.getHours();
  return THEME_BOUNDS.find((b) => hour >= b.start && hour < b.end)?.theme ?? 'theme-night';
}

export function applyTheme(theme) {
  document.body.classList.add(theme);

  const logo = document.querySelector('.logo');
  if (logo) {
    logo.src = WHITE_LOGO_THEMES.has(theme)
      ? 'assets/ScottShrimpICO_white.png'
      : 'assets/ScottShrimpICO.png';
  }

  const copy = COPY[theme] ?? {};
  const greeting = document.querySelector('.greeting-text');
  const subtitle = document.querySelector('.subtitle');
  if (greeting) greeting.textContent = copy.greeting ?? '';
  if (subtitle) subtitle.textContent = copy.subtitle ?? '';
}

export function initThemeEngine() {
  const theme = getCurrentTheme();
  applyTheme(theme);
  return theme;
}
