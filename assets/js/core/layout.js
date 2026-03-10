import { getConfig } from './config.js';

function navTemplate(activeKey) {
  const { routes } = getConfig();
  const items = [
    { key: 'home', label: 'Home', href: routes.home },
    { key: 'tools', label: 'Tools', href: routes.tools },
    { key: 'blog', label: 'Blog', href: routes.blog },
    { key: 'about', label: 'About', href: routes.about },
    { key: 'admin', label: 'Admin', href: routes.admin }
  ];

  return items
    .map((item) => {
      const active = item.key === activeKey ? 'is-active' : '';
      return `<a class="nav-link ${active}" href="${item.href}">${item.label}</a>`;
    })
    .join('');
}

export function mountLayout({ active = 'home' } = {}) {
  const { siteName } = getConfig();
  const headerSlot = document.querySelector('[data-shell="header"]');
  const footerSlot = document.querySelector('[data-shell="footer"]');

  if (headerSlot) {
    headerSlot.innerHTML = `
      <header class="site-header">
        <a class="brand" href="/" aria-label="Go to homepage">
          <img src="/assets/ScottShrimpICO.png" alt="ScottShrimp logo" class="brand-logo" />
          <span class="brand-name">${siteName}</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="siteNav">Menu</button>
        <nav id="siteNav" class="site-nav" aria-label="Primary">
          ${navTemplate(active)}
        </nav>
      </header>
    `;

    const toggle = headerSlot.querySelector('.nav-toggle');
    const nav = headerSlot.querySelector('.site-nav');

    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    }
  }

  if (footerSlot) {
    const year = new Date().getFullYear();
    footerSlot.innerHTML = `
      <footer class="site-footer">
        <p class="footer-copy">${siteName} · ${year}</p>
        <p class="footer-note">A personal studio for tools, notes, and experiments.</p>
      </footer>
    `;
  }
}
