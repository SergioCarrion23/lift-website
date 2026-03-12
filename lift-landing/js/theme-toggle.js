/**
 * Tema día/noche: aplica clase en <html>, persiste en localStorage.
 */
(function () {
  const STORAGE_KEY = 'lift-theme';
  const ATTR = 'data-theme';

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function setStored(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }

  function getPreferred() {
    const stored = getStored();
    if (stored === 'light' || stored === 'dark') return stored;
    if (typeof window.matchMedia !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute(ATTR, theme);
  }

  function init() {
    const theme = getPreferred();
    applyTheme(theme);

    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute(ATTR) || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      setStored(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
