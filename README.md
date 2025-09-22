# Habibur Rahman — Portfolio

Modern, fast, and responsive portfolio with a Material + Samsung One UI inspired design. Ships with theming, small animations, and PWA basics.

## Features

- Fluid, responsive layout with accessible components
- Light/Dark theme with quick toggle
- Dynamic accent color extracted from a hero image
- Scroll‑reveal animations with reduced‑motion support
- PWA: manifest + offline caching (service worker)

## Quick start

You can open `index.html` directly, but for PWA and service worker to work, serve locally.

PowerShell (Windows):

```powershell
# Using Python 3
python -m http.server 8080
# or using Node (if installed)
npx serve . -l 8080
```

Then visit http://localhost:8080

## Customize

- Update text and links in `index.html` (About, Experience, Projects, Contact)
- Replace images in `assets/img/` and icons in `assets/icons/`
- Tweak theme tokens in `assets/css/styles.css` (design variables at the top)
- Contact form uses Formspree placeholder; replace `action` with your endpoint

## Deploy to GitHub Pages

Push to the `main` branch in this repo, then enable Pages:

1. Repository Settings → Pages
2. Source: Deploy from branch → Branch: `main` → Folder: `/` (root)
3. Save, then your site will be available at: https://habiburrahman-gh.github.io/

If you use a custom domain, add a `CNAME` file with your domain and configure DNS.

## License

MIT