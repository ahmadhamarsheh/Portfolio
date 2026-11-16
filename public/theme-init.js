// Runs before first paint to apply the saved or preferred colour theme (no flash).
// Kept as an external file so the Content-Security-Policy can stay script-src 'self'.
(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('theme');
    var theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    root.setAttribute('data-theme', theme);
  } catch (e) {
    root.setAttribute('data-theme', 'dark');
  }
})();
