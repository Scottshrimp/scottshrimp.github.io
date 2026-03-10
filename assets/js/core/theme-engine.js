import { getStorageKey } from './config.js';

const THEMES = [
  {
    id: 'dawn',
    label: 'Dawn',
    start: 5,
    end: 9,
    greeting: '早安，欢迎回来。',
    subtitle: 'Today starts with one meaningful move.'
  },
  {
    id: 'daylight',
    label: 'Daylight',
    start: 9,
    end: 13,
    greeting: '你好，保持节奏。',
    subtitle: 'Build steadily, review quickly.'
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    start: 13,
    end: 18,
    greeting: '下午好，继续推进。',
    subtitle: 'Ship one thing before the sun tilts.'
  },
  {
    id: 'sunset',
    label: 'Sunset',
    start: 18,
    end: 21,
    greeting: '黄昏时分，整理成果。',
    subtitle: 'Reflect, then sharpen the next plan.'
  },
  {
    id: 'night',
    label: 'Night',
    start: 21,
    end: 24,
    greeting: '晚上好，慢下来也没关系。',
    subtitle: 'Quiet focus beats noisy speed.'
  },
  {
    id: 'midnight',
    label: 'Midnight',
    start: 0,
    end: 5,
    greeting: '深夜模式，注意休息。',
    subtitle: 'Protect your energy, not just your time.'
  }
];

function themeFromHour(hour) {
  return THEMES.find((item) => hour >= item.start && hour < item.end) || THEMES[0];
}

export function getThemePreference() {
  return localStorage.getItem(getStorageKey('theme')) || 'auto';
}

export function setThemePreference(themeId) {
  localStorage.setItem(getStorageKey('theme'), themeId || 'auto');
}

export function resolveTheme(now = new Date()) {
  const pref = getThemePreference();
  if (pref !== 'auto') {
    const manual = THEMES.find((item) => item.id === pref);
    if (manual) {
      return manual;
    }
  }
  return themeFromHour(now.getHours());
}

export function applyTheme({ now = new Date() } = {}) {
  const theme = resolveTheme(now);
  const root = document.documentElement;
  const body = document.body;
  root.dataset.theme = theme.id;
  body.dataset.theme = theme.id;

  const greeting = document.querySelector('.js-greeting');
  const subtitle = document.querySelector('.js-subtitle');
  const period = document.querySelector('.js-period');

  if (greeting) greeting.textContent = theme.greeting;
  if (subtitle) subtitle.textContent = theme.subtitle;
  if (period) period.textContent = theme.label;

  return theme;
}

export function listThemes() {
  return THEMES.map(({ id, label }) => ({ id, label }));
}
