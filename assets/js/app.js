import { initThemeEngine } from './core/theme-engine.js';

function playIntro() {
  setTimeout(() => document.getElementById('blackFrame')?.remove(), 3300);

  const animation = lottie.loadAnimation({
    container: document.getElementById('lottieContainer'),
    renderer: 'canvas',
    loop: false,
    autoplay: true,
    path: 'assets/lotties/introDesktop1_1.json'
  });

  animation.addEventListener('complete', () => {
    const wrapper = document.getElementById('loaderWrapper');
    if (!wrapper) return;
    wrapper.style.transition = 'opacity 0.5s ease';
    wrapper.style.opacity = 0;
    setTimeout(() => wrapper.remove(), 500);
  });
}

function skipIntro() {
  document.getElementById('blackFrame')?.remove();
  document.getElementById('loaderWrapper')?.remove();
}

function setupLogoHover() {
  const logo = document.querySelector('.logo');
  if (!logo) return;

  const tween = (from, to, duration) => logo.animate(
    [{ transform: `scale(${from})` }, { transform: `scale(${to})` }],
    { duration, fill: 'forwards', easing: 'cubic-bezier(0,.5,.13,.99)' }
  );

  let forward = null;
  let backward = null;
  logo.addEventListener('mouseenter', () => { backward?.cancel(); forward = tween(1, 1.05, 700); });
  logo.addEventListener('mouseleave', () => { forward?.cancel(); backward = tween(1.05, 1, 1000); });
}

const isInternal = new URLSearchParams(location.search).get('from') === 'internal';
if (isInternal) {
  history.replaceState?.(null, '', location.pathname);
  skipIntro();
} else {
  window.addEventListener('load', playIntro);
}

initThemeEngine();
setupLogoHover();
