import { mountLayout } from '../core/layout.js';
import { applyTheme } from '../core/theme-engine.js';
import { listTools } from '../services/tools-service.js';

function initJsonPretty() {
  const input = document.querySelector('#jsonInput');
  const output = document.querySelector('#jsonOutput');
  const formatBtn = document.querySelector('#jsonFormatBtn');
  const minifyBtn = document.querySelector('#jsonMinifyBtn');

  if (!input || !output || !formatBtn || !minifyBtn) return;

  const format = (minify = false) => {
    try {
      const parsed = JSON.parse(input.value || '{}');
      output.textContent = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      output.dataset.state = 'ok';
    } catch (error) {
      output.textContent = `Invalid JSON: ${error.message}`;
      output.dataset.state = 'error';
    }
  };

  formatBtn.addEventListener('click', () => format(false));
  minifyBtn.addEventListener('click', () => format(true));
}

function initTextMetrics() {
  const input = document.querySelector('#metricsInput');
  const words = document.querySelector('[data-metric="words"]');
  const chars = document.querySelector('[data-metric="chars"]');
  const lines = document.querySelector('[data-metric="lines"]');

  if (!input || !words || !chars || !lines) return;

  const update = () => {
    const value = input.value || '';
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const charCount = value.length;
    const lineCount = value ? value.split(/\r?\n/).length : 0;

    words.textContent = String(wordCount);
    chars.textContent = String(charCount);
    lines.textContent = String(lineCount);
  };

  input.addEventListener('input', update);
  update();
}

function initTimezoneShift() {
  const sourceTime = document.querySelector('#tzInputTime');
  const sourceZone = document.querySelector('#tzSource');
  const targetZone = document.querySelector('#tzTarget');
  const output = document.querySelector('#tzOutput');
  const convertBtn = document.querySelector('#tzConvertBtn');

  if (!sourceTime || !sourceZone || !targetZone || !output || !convertBtn) return;

  const toZoneString = (date, zone) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: zone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  convertBtn.addEventListener('click', () => {
    if (!sourceTime.value) {
      output.textContent = 'Please select a time first.';
      return;
    }

    const reference = new Date(sourceTime.value);
    if (Number.isNaN(reference.getTime())) {
      output.textContent = 'Invalid time input.';
      return;
    }

    const sourceLabel = toZoneString(reference, sourceZone.value);
    const targetLabel = toZoneString(reference, targetZone.value);
    output.textContent = `${sourceZone.value}: ${sourceLabel} → ${targetZone.value}: ${targetLabel}`;
  });
}

async function renderToolCatalog() {
  const container = document.querySelector('#toolCatalog');
  if (!container) return;

  const tools = await listTools();
  container.innerHTML = tools
    .map(
      (tool) => `
        <article class="tool-card">
          <p class="tool-card-category">${tool.category}</p>
          <h3>${tool.name}</h3>
          <p>${tool.description}</p>
          <p class="tool-card-status">${tool.status}</p>
        </article>
      `
    )
    .join('');
}

function initToolsPage() {
  mountLayout({ active: 'tools' });
  applyTheme();

  initJsonPretty();
  initTextMetrics();
  initTimezoneShift();
  renderToolCatalog();
}

document.addEventListener('DOMContentLoaded', initToolsPage);
