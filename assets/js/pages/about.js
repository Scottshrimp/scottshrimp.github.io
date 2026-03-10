import { mountLayout } from '../core/layout.js';
import { applyTheme } from '../core/theme-engine.js';

function initAbout() {
  mountLayout({ active: 'about' });
  applyTheme();
}

document.addEventListener('DOMContentLoaded', initAbout);
