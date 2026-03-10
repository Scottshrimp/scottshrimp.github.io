import { mountLayout } from '../core/layout.js';
import { applyTheme } from '../core/theme-engine.js';
import { getConfig, setApiBaseUrl } from '../core/config.js';
import {
  exportPostsJson,
  listPosts,
  removePost,
  upsertPost
} from '../services/content-service.js';
import {
  exportToolsJson,
  listTools,
  removeTool,
  upsertTool
} from '../services/tools-service.js';

let postCache = [];
let toolCache = [];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function downloadJson(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

function toast(message, kind = 'info') {
  const node = document.querySelector('#adminToast');
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
}

function renderPostsTable() {
  const body = document.querySelector('#postRows');
  if (!body) return;

  body.innerHTML = postCache
    .map(
      (post) => `
        <tr>
          <td>${post.slug}</td>
          <td>${post.title}</td>
          <td>${post.date}</td>
          <td>${post.draft ? 'draft' : 'live'}</td>
          <td>
            <button data-post-action="edit" data-post-slug="${post.slug}">Edit</button>
            <button data-post-action="delete" data-post-slug="${post.slug}">Delete</button>
          </td>
        </tr>
      `
    )
    .join('');
}

function renderToolsTable() {
  const body = document.querySelector('#toolRows');
  if (!body) return;

  body.innerHTML = toolCache
    .map(
      (tool) => `
        <tr>
          <td>${tool.id}</td>
          <td>${tool.name}</td>
          <td>${tool.category}</td>
          <td>${tool.status}</td>
          <td>
            <button data-tool-action="edit" data-tool-id="${tool.id}">Edit</button>
            <button data-tool-action="delete" data-tool-id="${tool.id}">Delete</button>
          </td>
        </tr>
      `
    )
    .join('');
}

async function refreshTables() {
  postCache = await listPosts({ includeDraft: true });
  toolCache = await listTools();
  renderPostsTable();
  renderToolsTable();
}

function fillPostForm(post) {
  const form = document.querySelector('#postForm');
  if (!form || !post) return;

  form.slug.value = post.slug;
  form.title.value = post.title;
  form.date.value = post.date;
  form.tags.value = (post.tags || []).join(', ');
  form.lang.value = post.lang || 'en';
  form.summary.value = post.summary || '';
  form.cover.value = post.cover || '';
  form.draft.checked = Boolean(post.draft);
  form.content.value = post.content || '';
}

function resetPostForm() {
  const form = document.querySelector('#postForm');
  if (!form) return;
  form.reset();
  form.lang.value = 'en';
  form.date.valueAsDate = new Date();
}

function fillToolForm(tool) {
  const form = document.querySelector('#toolForm');
  if (!form || !tool) return;

  form.id.value = tool.id;
  form.name.value = tool.name;
  form.category.value = tool.category;
  form.description.value = tool.description;
  form.status.value = tool.status;
}

function resetToolForm() {
  const form = document.querySelector('#toolForm');
  if (!form) return;
  form.reset();
  form.status.value = 'active';
}

function bindApiConfig() {
  const input = document.querySelector('#apiBaseInput');
  const saveBtn = document.querySelector('#saveApiBaseBtn');

  if (!input || !saveBtn) return;
  input.value = getConfig().apiBaseUrl;

  saveBtn.addEventListener('click', () => {
    setApiBaseUrl(input.value);
    toast('API base URL saved.', 'success');
  });
}

function bindPostEvents() {
  const form = document.querySelector('#postForm');
  const rows = document.querySelector('#postRows');
  const resetBtn = document.querySelector('#postResetBtn');
  const exportBtn = document.querySelector('#postExportBtn');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const slug = form.slug.value.trim() || slugify(form.title.value);
      if (!slug) {
        toast('Post slug is required.', 'error');
        return;
      }

      await upsertPost({
        slug,
        title: form.title.value.trim(),
        date: form.date.value,
        tags: form.tags.value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        lang: form.lang.value,
        summary: form.summary.value.trim(),
        cover: form.cover.value.trim(),
        draft: form.draft.checked,
        content: form.content.value
      });

      await refreshTables();
      toast(`Post \"${slug}\" saved.`, 'success');
      resetPostForm();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => resetPostForm());
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const json = await exportPostsJson();
      downloadJson('posts-export.json', json);
      toast('Posts exported.', 'success');
    });
  }

  if (rows) {
    rows.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.dataset.postAction;
      const slug = target.dataset.postSlug;
      if (!action || !slug) return;

      if (action === 'edit') {
        const post = postCache.find((item) => item.slug === slug);
        fillPostForm(post);
      }

      if (action === 'delete') {
        await removePost(slug);
        await refreshTables();
        toast(`Post \"${slug}\" removed.`, 'success');
      }
    });
  }
}

function bindToolEvents() {
  const form = document.querySelector('#toolForm');
  const rows = document.querySelector('#toolRows');
  const resetBtn = document.querySelector('#toolResetBtn');
  const exportBtn = document.querySelector('#toolExportBtn');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = form.id.value.trim() || slugify(form.name.value);
      if (!id) {
        toast('Tool id is required.', 'error');
        return;
      }

      await upsertTool({
        id,
        name: form.name.value.trim(),
        category: form.category.value.trim(),
        description: form.description.value.trim(),
        status: form.status.value
      });

      await refreshTables();
      toast(`Tool \"${id}\" saved.`, 'success');
      resetToolForm();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => resetToolForm());
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const json = await exportToolsJson();
      downloadJson('tools-export.json', json);
      toast('Tools exported.', 'success');
    });
  }

  if (rows) {
    rows.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.dataset.toolAction;
      const id = target.dataset.toolId;
      if (!action || !id) return;

      if (action === 'edit') {
        const tool = toolCache.find((item) => item.id === id);
        fillToolForm(tool);
      }

      if (action === 'delete') {
        await removeTool(id);
        await refreshTables();
        toast(`Tool \"${id}\" removed.`, 'success');
      }
    });
  }
}

async function initAdmin() {
  mountLayout({ active: 'admin' });
  applyTheme();

  bindApiConfig();
  bindPostEvents();
  bindToolEvents();

  resetPostForm();
  resetToolForm();
  await refreshTables();
  toast('Admin loaded. Local mode is active unless API base is set.', 'info');
}

document.addEventListener('DOMContentLoaded', initAdmin);
