import { mountLayout } from '../core/layout.js';
import { applyTheme } from '../core/theme-engine.js';
import { listPosts } from '../services/content-service.js';

let cache = [];
let currentTag = '';
let currentQuery = '';

function renderTags(posts) {
  const container = document.querySelector('#blogTags');
  if (!container) return;

  const tags = [...new Set(posts.flatMap((post) => post.tags || []))];
  const buttons = ['all', ...tags]
    .map((tag) => {
      const key = tag === 'all' ? '' : tag;
      const active = currentTag === key ? 'is-active' : '';
      const label = tag === 'all' ? 'All' : tag;
      return `<button class="tag-filter ${active}" data-tag="${key}">${label}</button>`;
    })
    .join('');

  container.innerHTML = buttons;

  container.querySelectorAll('.tag-filter').forEach((button) => {
    button.addEventListener('click', () => {
      currentTag = button.dataset.tag || '';
      renderTags(cache);
      renderPosts();
    });
  });
}

function renderPosts() {
  const container = document.querySelector('#blogList');
  if (!container) return;

  const posts = cache.filter((post) => {
    if (currentTag && !post.tags.includes(currentTag)) return false;
    if (!currentQuery) return true;
    const blob = `${post.title} ${post.summary} ${post.tags.join(' ')}`.toLowerCase();
    return blob.includes(currentQuery.toLowerCase());
  });

  if (!posts.length) {
    container.innerHTML = '<p class="empty-state">No posts match your filter.</p>';
    return;
  }

  container.innerHTML = posts
    .map(
      (post) => `
        <article class="blog-card">
          <img src="${post.cover}" alt="${post.title}" loading="lazy" />
          <div>
            <p class="blog-meta">${post.date} · ${post.lang.toUpperCase()} · ${post.tags.join(', ')}</p>
            <h2>${post.title}</h2>
            <p>${post.summary}</p>
            <a class="inline-link" href="/blog/post.html?slug=${encodeURIComponent(post.slug)}">Read more</a>
          </div>
        </article>
      `
    )
    .join('');
}

async function initBlogList() {
  mountLayout({ active: 'blog' });
  applyTheme();

  cache = await listPosts();
  renderTags(cache);
  renderPosts();

  const search = document.querySelector('#blogSearch');
  if (search) {
    search.addEventListener('input', () => {
      currentQuery = search.value.trim();
      renderPosts();
    });
  }
}

document.addEventListener('DOMContentLoaded', initBlogList);
