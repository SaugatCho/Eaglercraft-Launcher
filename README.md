# Eaglercraft-Launcher
[Click here](https://SaugatCho.github.io/Eaglercraft-Launcher)


## Project files

- `index.html` — launcher page structure
- `style.css` — layout, theme, and responsive styling
- `app.js` — launcher interactions and local client storage
- `manifest.json` — app name, launch path, and theme metadata
- `favicon.svg` — launcher icon
- `.nojekyll` — keeps GitHub Pages from running Jekyll processing

**Storage note:** saved clients are kept in this browser using IndexedDB. They do not automatically appear on another device. The manifest is metadata only; this repository does not include a service worker or guarantee offline installation.
