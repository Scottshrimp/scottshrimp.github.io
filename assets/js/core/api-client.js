import { getConfig } from './config.js';

function buildUrl(base, path) {
  const safeBase = base.replace(/\/$/, '');
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${safeBase}${safePath}`;
}

export async function request(path, options = {}) {
  const { apiBaseUrl } = getConfig();
  if (!apiBaseUrl) {
    return {
      ok: false,
      status: 0,
      json: null,
      error: 'API base URL is not configured.'
    };
  }

  try {
    const response = await fetch(buildUrl(apiBaseUrl, path), {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    let json = null;
    const text = await response.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      json,
      error: response.ok ? null : `Request failed with ${response.status}`
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      json: null,
      error: error instanceof Error ? error.message : 'Unknown network error'
    };
  }
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' })
};
