import { mountLayout } from '../core/layout.js';
import { applyTheme, getThemePreference, listThemes, setThemePreference } from '../core/theme-engine.js';
import { listPosts } from '../services/content-service.js';
import { listTools } from '../services/tools-service.js';

function renderThemeOptions() {
  const select = document.querySelector('#themeMode');
  if (!select) return;

  const options = [{ id: 'auto', label: 'Auto' }, ...listThemes()]
    .map((item) => `<option value="${item.id}">${item.label}</option>`)
    .join('');

  select.innerHTML = options;
  select.value = getThemePreference();
  select.addEventListener('change', () => {
    setThemePreference(select.value);
    applyTheme();
  });
}

function renderKpi(posts, tools) {
  const postCount = document.querySelector('[data-kpi="posts"]');
  const toolCount = document.querySelector('[data-kpi="tools"]');
  const tagCount = document.querySelector('[data-kpi="tags"]');

  if (postCount) postCount.textContent = String(posts.length);
  if (toolCount) toolCount.textContent = String(tools.length);

  const tags = new Set(posts.flatMap((post) => post.tags || []));
  if (tagCount) tagCount.textContent = String(tags.size);
}

function renderFeaturedPosts(posts) {
  const container = document.querySelector('#featuredPosts');
  if (!container) return;

  const html = posts
    .slice(0, 3)
    .map(
      (post) => `
        <article class="panel-card">
          <p class="panel-card-meta">${post.date} · ${post.lang.toUpperCase()}</p>
          <h3>${post.title}</h3>
          <p>${post.summary}</p>
          <a href="/blog/post.html?slug=${encodeURIComponent(post.slug)}" class="inline-link">Read article</a>
        </article>
      `
    )
    .join('');

  container.innerHTML = html || '<p>No posts yet.</p>';
}

function renderFeaturedTools(tools) {
  const container = document.querySelector('#featuredTools');
  if (!container) return;

  const html = tools
    .slice(0, 3)
    .map(
      (tool) => `
        <article class="panel-card">
          <p class="panel-card-meta">${tool.category}</p>
          <h3>${tool.name}</h3>
          <p>${tool.description}</p>
          <a href="/tools/" class="inline-link">Open tools</a>
        </article>
      `
    )
    .join('');

  container.innerHTML = html || '<p>No tools configured.</p>';
}

async function initHome() {
  mountLayout({ active: 'home' });
  applyTheme();
  renderThemeOptions();

  const [posts, tools] = await Promise.all([listPosts(), listTools()]);
  renderKpi(posts, tools);
  renderFeaturedPosts(posts);
  renderFeaturedTools(tools);
}

document.addEventListener('DOMContentLoaded', initHome);
