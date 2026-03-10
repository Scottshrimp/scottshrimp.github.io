const DEFAULT_CONFIG = {
  siteName: 'ScottShrimp Studio',
  apiBaseUrl: '',
  storageKeys: {
    posts: 'scottshrimp.posts',
    tools: 'scottshrimp.tools',
    theme: 'scottshrimp.theme',
    apiBase: 'scottshrimp.apiBase'
  },
  routes: {
    home: '/',
    tools: '/tools/',
    blog: '/blog/',
    about: '/about/',
    admin: '/admin/'
  }
};

export function getConfig() {
  const overrideApi = localStorage.getItem(DEFAULT_CONFIG.storageKeys.apiBase);
  return {
    ...DEFAULT_CONFIG,
    apiBaseUrl: (overrideApi || DEFAULT_CONFIG.apiBaseUrl || '').trim()
  };
}

export function setApiBaseUrl(url) {
  const value = (url || '').trim();
  localStorage.setItem(DEFAULT_CONFIG.storageKeys.apiBase, value);
}

export function getStorageKey(name) {
  return DEFAULT_CONFIG.storageKeys[name];
}
