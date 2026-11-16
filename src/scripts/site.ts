/**
 * Site-wide progressive enhancements: theme toggle and mobile menu.
 * The page is fully usable without this script.
 */
type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* storage can be unavailable (private mode); the theme still applies for this page */
  }
  syncThemeButtons();
}

function syncThemeButtons(): void {
  const theme = currentTheme();
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    const label = theme === 'dark' ? button.dataset['labelToLight'] : button.dataset['labelToDark'];
    if (label) button.setAttribute('aria-label', label);
  });
}

function initThemeToggle(): void {
  syncThemeButtons();
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () =>
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'),
    );
  });
}

function initMobileMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  panel.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}

initThemeToggle();
initMobileMenu();
