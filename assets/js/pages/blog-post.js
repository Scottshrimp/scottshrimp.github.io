import { mountLayout } from '../core/layout.js';
import { applyTheme } from '../core/theme-engine.js';
import { getPostBySlug } from '../services/content-service.js';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let listBuffer = [];
  let orderedBuffer = [];

  const flushLists = () => {
    if (listBuffer.length) {
      blocks.push(`<ul>${listBuffer.map((item) => `<li>${item}</li>`).join('')}</ul>`);
      listBuffer = [];
    }
    if (orderedBuffer.length) {
      blocks.push(`<ol>${orderedBuffer.map((item) => `<li>${item}</li>`).join('')}</ol>`);
      orderedBuffer = [];
    }
  };

  for (const line of lines) {
    const text = escapeHtml(line.trim());
    if (!text) {
      flushLists();
      continue;
    }

    if (text.startsWith('## ')) {
      flushLists();
      blocks.push(`<h2>${text.slice(3)}</h2>`);
      continue;
    }

    if (text.startsWith('# ')) {
      flushLists();
      blocks.push(`<h1>${text.slice(2)}</h1>`);
      continue;
    }

    if (text.startsWith('- ')) {
      orderedBuffer = [];
      listBuffer.push(text.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(text)) {
      listBuffer = [];
      orderedBuffer.push(text.replace(/^\d+\.\s/, ''));
      continue;
    }

    flushLists();
    blocks.push(`<p>${text}</p>`);
  }

  flushLists();
  return blocks.join('');
}

async function initBlogPost() {
  mountLayout({ active: 'blog' });
  applyTheme();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const title = document.querySelector('#postTitle');
  const meta = document.querySelector('#postMeta');
  const body = document.querySelector('#postBody');

  if (!slug) {
    if (title) title.textContent = 'Missing slug';
    if (meta) meta.textContent = 'Open this page from the blog list.';
    if (body) body.innerHTML = '<p>Post slug is required.</p>';
    return;
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    if (title) title.textContent = 'Post not found';
    if (meta) meta.textContent = slug;
    if (body) body.innerHTML = '<p>The requested post does not exist.</p>';
    return;
  }

  document.title = `${post.title} · ScottShrimp Studio`;
  if (title) title.textContent = post.title;
  if (meta) meta.textContent = `${post.date} · ${post.lang.toUpperCase()} · ${post.tags.join(', ')}`;
  if (body) body.innerHTML = markdownToHtml(post.content || '');
}

document.addEventListener('DOMContentLoaded', initBlogPost);
