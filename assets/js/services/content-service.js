import { apiClient } from '../core/api-client.js';
import { getConfig, getStorageKey } from '../core/config.js';

const STATIC_POSTS_URL = '/content/posts/index.json';

function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function normalizePost(post) {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: Array.isArray(post.tags) ? post.tags : [],
    summary: post.summary || '',
    lang: post.lang || 'en',
    draft: Boolean(post.draft),
    cover: post.cover || '/assets/chair0.png',
    content: post.content || ''
  };
}

function readLocalPosts() {
  const raw = localStorage.getItem(getStorageKey('posts'));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.posts)) return null;
    return parsed.posts.map(normalizePost);
  } catch {
    return null;
  }
}

function writeLocalPosts(posts) {
  const payload = {
    updatedAt: new Date().toISOString(),
    posts: sortByDateDesc(posts).map(normalizePost)
  };
  localStorage.setItem(getStorageKey('posts'), JSON.stringify(payload));
}

async function readStaticPosts() {
  const response = await fetch(STATIC_POSTS_URL, { cache: 'no-store' });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.posts) ? payload.posts.map(normalizePost) : [];
}

async function readApiPosts() {
  const { apiBaseUrl } = getConfig();
  if (!apiBaseUrl) return null;
  const result = await apiClient.get('/posts');
  if (!result.ok || !Array.isArray(result.json?.posts)) return null;
  return result.json.posts.map(normalizePost);
}

export async function listPosts({ includeDraft = false, tag = '', query = '' } = {}) {
  let posts = await readApiPosts();
  if (!posts) {
    posts = readLocalPosts();
  }
  if (!posts) {
    posts = await readStaticPosts();
  }

  const q = query.trim().toLowerCase();
  const filtered = posts.filter((post) => {
    if (!includeDraft && post.draft) return false;
    if (tag && !post.tags.includes(tag)) return false;
    if (!q) return true;
    const blob = `${post.title} ${post.summary} ${post.tags.join(' ')}`.toLowerCase();
    return blob.includes(q);
  });

  return sortByDateDesc(filtered);
}

export async function getPostBySlug(slug, { includeDraft = false } = {}) {
  const posts = await listPosts({ includeDraft });
  return posts.find((post) => post.slug === slug) || null;
}

export async function upsertPost(post) {
  const normalized = normalizePost(post);
  const current = await listPosts({ includeDraft: true });
  const index = current.findIndex((item) => item.slug === normalized.slug);

  if (index === -1) current.push(normalized);
  else current[index] = normalized;

  writeLocalPosts(current);

  const { apiBaseUrl } = getConfig();
  if (apiBaseUrl) {
    if (index === -1) await apiClient.post('/posts', normalized);
    else await apiClient.put(`/posts/${normalized.slug}`, normalized);
  }

  return normalized;
}

export async function removePost(slug) {
  const current = await listPosts({ includeDraft: true });
  const next = current.filter((item) => item.slug !== slug);
  writeLocalPosts(next);

  const { apiBaseUrl } = getConfig();
  if (apiBaseUrl) {
    await apiClient.delete(`/posts/${slug}`);
  }
}

export async function exportPostsJson() {
  const posts = await listPosts({ includeDraft: true });
  return JSON.stringify({ updatedAt: new Date().toISOString(), posts }, null, 2);
}
