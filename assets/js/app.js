// Small utilities and interactions
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Theme persistence
const themeKey = 'theme-preference';
const reduceKey = 'reduce-motion';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  const html = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark.matches);
  html.classList.toggle('dark', isDark);
  const brand = getComputedStyle(html).getPropertyValue('--brand');
  const [h, s, l] = brand.split(/\s+/);
  $('#theme-color-meta')?.setAttribute('content', `hsl(${h} ${s} ${isDark ? '16%' : '50%'})`);
}

function getTheme() {
  return localStorage.getItem(themeKey) || 'system';
}

function setTheme(theme) {
  localStorage.setItem(themeKey, theme);
  applyTheme(theme);
}

// Initial theme
applyTheme(getTheme());
prefersDark.addEventListener('change', () => applyTheme(getTheme()));

// Theme toggle
$('#themeToggle')?.addEventListener('click', () => {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

// Reduce motion toggle
const reduceMotionToggle = $('#reduceMotionToggle');
if (reduceMotionToggle) {
  const saved = localStorage.getItem(reduceKey) === 'true';
  reduceMotionToggle.checked = saved;
  document.documentElement.classList.toggle('reduce-motion', saved);
  reduceMotionToggle.addEventListener('change', (e) => {
    const checked = e.currentTarget.checked;
    localStorage.setItem(reduceKey, String(checked));
    document.documentElement.classList.toggle('reduce-motion', checked);
  });
}

// Mobile nav
$('#navToggle')?.addEventListener('click', () => {
  const menu = $('#nav-menu');
  const open = menu.classList.toggle('is-open');
  $('#navToggle').setAttribute('aria-expanded', String(open));
});
$$('#nav-menu a').forEach((a) => a.addEventListener('click', () => $('#nav-menu')?.classList.remove('is-open')));

// Scroll reveal
const revealEls = $$('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Year
$('#year').textContent = String(new Date().getFullYear());

// Accent from image using canvas and average color
async function extractAverageColorFromImage(imgEl) {
  await imgEl.decode().catch(() => {});
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const w = canvas.width = Math.min(192, imgEl.naturalWidth || 192);
  const h = canvas.height = Math.min(192, imgEl.naturalHeight || 192);
  ctx.drawImage(imgEl, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4 * 8) { // sample every 8px
    r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
  }
  r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
  return rgbToHsl(r, g, b);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

$('#accentFromImage')?.addEventListener('click', async () => {
  const img = $('#accentSource');
  const [h, s, l] = await extractAverageColorFromImage(img);
  document.documentElement.style.setProperty('--brand', `${h} ${Math.min(90, Math.max(50, s))}% ${Math.min(60, Math.max(40, l))}%`);
  document.documentElement.style.setProperty('--brand-2', `${(h + 40) % 360} ${Math.min(95, s + 10)}% ${Math.min(70, l + 10)}%`);
  applyTheme(getTheme());
});
