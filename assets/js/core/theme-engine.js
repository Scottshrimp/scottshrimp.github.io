const THEME_BOUNDS = [
  { start: 6, end: 9, theme: 'theme-morning' },
  { start: 9, end: 11, theme: 'theme-day' },
  { start: 11, end: 13, theme: 'theme-noon' },
  { start: 13, end: 17, theme: 'theme-afternoon' },
  { start: 17, end: 20, theme: 'theme-dusk' },
  { start: 20, end: 22, theme: 'theme-evening' },
  { start: 22, end: 24, theme: 'theme-night' },
  { start: 0, end: 6, theme: 'theme-night' }
];

const GREETINGS_BY_THEME = {
  'theme-morning': '一日之计在于晨。',
  'theme-day': '今日もがんばってね！',
  'theme-noon': '中午好。',
  'theme-afternoon': 'Good afternoon～',
  'theme-dusk': 'What a day...',
  'theme-evening': '晚上好。',
  'theme-night': 'おやすみZZZZ'
};

const SUBTITLES_BY_THEME = {
  'theme-morning': '昨晚睡得好吗？我的朋友',
  'theme-day': '毎日も一生懸命でした',
  'theme-noon': '不吃午饭也可以',
  'theme-afternoon': 'Let‘s have some tea.',
  'theme-dusk': '今天你看到日落了吗？',
  'theme-evening': '晚饭要吃七分饱',
  'theme-night': 'zzzZZZZZ'
};

const WHITE_LOGO_THEMES = new Set(['theme-afternoon', 'theme-evening', 'theme-night']);

export function resolveThemeByHour(hour) {
  const hit = THEME_BOUNDS.find((item) => hour >= item.start && hour < item.end);
  return hit ? hit.theme : 'theme-night';
}

export function getCurrentTheme(now = new Date()) {
  return resolveThemeByHour(now.getHours());
}

export function applyThemeClass(theme) {
  if (!theme) return;
  document.body.classList.add(theme);
  document.documentElement.classList.add(theme);
}

export function applyThemeContent(theme) {
  const logo = document.querySelector('.logo');
  const greeting = document.querySelector('.greeting-text');
  const subtitle = document.querySelector('.subtitle');

  if (logo) {
    logo.src = WHITE_LOGO_THEMES.has(theme)
      ? 'assets/ScottShrimpICO_white.png'
      : 'assets/ScottShrimpICO.png';
  }

  if (greeting) {
    greeting.textContent = GREETINGS_BY_THEME[theme] || 'Greetings not loaded as expected_XD';
  }

  if (subtitle) {
    subtitle.textContent = SUBTITLES_BY_THEME[theme] || 'Subtitles not loaded as expected_XD';
  }
}

export function initThemeEngine() {
  const theme = getCurrentTheme();
  applyThemeClass(theme);

  window.addEventListener('DOMContentLoaded', () => {
    applyThemeContent(theme);
  });

  return theme;
}
