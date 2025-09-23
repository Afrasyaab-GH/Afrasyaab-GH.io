// Small utilities and interactions
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Theme persistence
const themeKey = 'theme-preference';
const reduceKey = 'reduce-motion';
const langKey = 'lang-preference';
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

// ---- i18n ----
const dict = {
  en: {
    skip: 'Skip to content',
    nav: { about: 'About', experience: 'Experience', projects: 'Projects', skills: 'Skills', contact: 'Contact' },
  hero: { hello: 'Hello, I’m', lead: 'Building thoughtful, accessible, and performant web experiences. Modern UI with Material + One UI vibes.', ctaProjects: 'View Projects', ctaContact: 'Contact Me', ctaFiverr: 'Hire me on Fiverr', ctaEmail: 'Email me', meta1: 'Frontend • Backend • Cloud', meta2: 'Open Source' },
    section: { about: { title: 'About' }, experience: { title: 'Experience' }, projects: { title: 'Featured Projects' }, skills: { title: 'Skills' }, contact: { title: 'Contact' } },
  about: { intro: 'I’m a developer specializing in AI‑assisted development. I create:', li1: 'Cross‑platform Flutter apps (iOS, Android, Web, Desktop)', li2: 'Responsive modern websites and static web apps', li3: 'Professional browser extensions', li4: '2D games with Python/Pygame', li5: '2D & 3D browser games with HTML5 + Phaser/Three', outro: 'I combine AI tools with coding to deliver projects faster, cleaner, and fully customized to your needs.' },
    exp1: { title: 'Senior Software Engineer · Company', date: '2023 — Present', b1: 'Lead development of design system components with accessibility at core.', b2: 'Improved performance metrics (LCP/CLS) by 30% with modern patterns.' },
    exp2: { title: 'Full‑Stack Engineer · Startup', date: '2021 — 2023', b1: 'Shipped features end‑to‑end across web and cloud services.', b2: 'Owned CI/CD and observability improvements.' },
    proj1: { desc: 'Next‑gen web app with blazing performance, built with modern stack.' },
    proj2: { desc: 'Composable components with Material/One UI aesthetics, fully accessible.' },
    proj3: { desc: 'Automation scripts and assistants to speed up development and testing.' },
    btn: { demo: 'Demo', docs: 'Docs', code: 'Code' },
  contact: { p1: 'Have a question or want to work together? Send a message and I’ll get back to you.', labelName: 'Name', phName: 'Your name', labelEmail: 'Email', phEmail: 'you@example.com', labelMessage: 'Message', phMessage: 'How can I help?', btnSend: 'Send', btnEmail: 'Email me', btnFiverr: 'Hire on Fiverr', success: 'Thanks! Your message was sent.', error: 'Sorry, something went wrong. Please try again or email me directly.', availability: 'Availability', availabilityText: 'Open to full‑time roles, freelance projects, and collaborations.', location: 'Location', locationText: 'Remote • Global', elsewhere: 'Elsewhere' },
    footer: { rights: 'All rights reserved.', reduceMotion: 'Reduce motion' }
  },
  ps: {
    skip: 'مينځپانګې ته ولاړ شئ',
    nav: { about: 'زما په اړه', experience: 'تجربه', projects: 'پروژې', skills: 'مهارتونه', contact: 'اړيکه' },
  hero: { hello: 'سلام، زه يم', lead: 'د لاسرسي، کړنې او ښکلي ډيزاين سره عصري ويب تجربې جوړوم.', ctaProjects: 'پروژې وګورئ', ctaContact: 'اړیکه راسره ونیسئ', ctaFiverr: 'پر فایور استخدام مې کړئ', ctaEmail: 'بریښنالیک واستوئ', meta1: 'فرنټ اينډ • بॅک اينډ • کلاوډ', meta2: 'اوپن سورس' },
    section: { about: { title: 'زما په اړه' }, experience: { title: 'تجربه' }, projects: { title: 'ځانګړې پروژې' }, skills: { title: 'مهارتونه' }, contact: { title: 'اړيکه' } },
  about: { intro: 'زه د AI-مرسته شوې پرمختيا کې تخصص لرم. زه جوړوم:', li1: 'د فلټر کراس-پليټفارم اپونه (iOS، Android، ويب، ډيسکټاپ)', li2: 'عصري ځواب ویونکي وېبسايټونه او سټېټيک وېب اپونه', li3: 'مسلکي براوزر توسيعات', li4: '۲D لوبې د Python/Pygame سره', li5: '۲D او ۳D براوزر لوبې د HTML5 + Phaser/Three سره', outro: 'زه د AI وسايلو او کود ګډ کاروم څو پروژې ژر، پاکې او ستاسو اړتیاوو ته سمې وسپارم.' },
    exp1: { title: 'د سينيور سافټویر انجینر · شرکت', date: '۲۰۲۳ — تر اوسه', b1: 'د لاسرسي په پام کې نیولو سره د ډيزاين سيستم برخې رهبري کړې.', b2: 'د کړنې شاخصونه ۳۰٪ ښه کړل.' },
    exp2: { title: 'فول سټک انجینر · سټارټ اپ', date: '۲۰۲۱ — ۲۰۲۳', b1: 'له پای څخه تر پای پورې بڼې وړاندې کړې.', b2: 'CI/CD او څارنې ته وده ورکړه.' },
    proj1: { desc: 'د لوړ کړنې سره راتلونکی نسل ويب اپ، د عصري سټک پر بنسټ.' },
    proj2: { desc: 'د موادو/ون UI ښکلا سره د لاسرسي وړ جوړه کېدونکي برخې.' },
    proj3: { desc: 'د پرمختګ ګړندي کولو لپاره اتومات او مرستندويه وسيلې.' },
    btn: { demo: 'ډيمو', docs: 'لاسوندونه', code: 'کوډ' },
  contact: { p1: 'پوښتنه لرئ؟ پيغام پرېږدئ، ژر ځواب درکوم.', labelName: 'نوم', phName: 'ستاسو نوم', labelEmail: 'برېښنالیک', phEmail: 'you@example.com', labelMessage: 'پيغام', phMessage: 'څنګه مرسته وکړم؟', btnSend: 'لېږل', btnEmail: 'بریښنالیک', btnFiverr: 'په فایور وګومارئ', success: 'مننه! ستاسو پیغام واستول شو.', error: 'بخښنه، ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ یا مستقیم بریښنالیک واستوئ.', availability: 'شتون', availabilityText: 'د تمام وخت، فريلانس او همکارۍ لپاره چمتو.', location: 'ځای', locationText: 'لرې • نړيوال', elsewhere: 'بل ځای' },
    footer: { rights: 'ټولې حقوق خوندي دي.', reduceMotion: 'خوځښت کم کړئ' }
  },
  fa: {
    skip: 'پرش به محتوا',
    nav: { about: 'درباره من', experience: 'تجربه', projects: 'پروژه‌ها', skills: 'مهارت‌ها', contact: 'ارتباط' },
  hero: { hello: 'سلام، من', lead: 'تجربه‌های وب مدرن با دسترس‌پذیری و عملکرد بالا می‌سازم.', ctaProjects: 'مشاهده پروژه‌ها', ctaContact: 'تماس با من', ctaFiverr: 'در Fiverr من را استخدام کنید', ctaEmail: 'ارسال ایمیل', meta1: 'فرانت‌اند • بک‌اند • کلود', meta2: 'متن‌باز' },
    section: { about: { title: 'درباره' }, experience: { title: 'تجربه' }, projects: { title: 'پروژه‌های ویژه' }, skills: { title: 'مهارت‌ها' }, contact: { title: 'ارتباط' } },
  about: { intro: 'من توسعه‌دهنده‌ای با تمرکز بر توسعه یاری‌شده با هوش مصنوعی هستم. من می‌سازم:', li1: 'اپ‌های کراس‌پلتفرم فلاتر (iOS، اندروید، وب، دسکتاپ)', li2: 'وب‌سایت‌های مدرن واکنش‌گرا و برنامه‌های وب استاتیک', li3: 'افزونه‌های حرفه‌ای مرورگر', li4: 'بازی‌های دوبعدی با Python/Pygame', li5: 'بازی‌های ۲بعدی و ۳بعدی مرورگر با HTML5 + Phaser/Three', outro: 'من ابزارهای هوش مصنوعی را با کدنویسی ترکیب می‌کنم تا پروژه‌ها را سریع‌تر، تمیزتر و کاملاً مطابق نیاز شما تحویل دهم.' },
    exp1: { title: 'مهندس ارشد نرم‌افزار · شرکت', date: '۲۰۲۳ — اکنون', b1: 'رهبری توسعه مؤلفه‌های سیستم طراحی با تمرکز بر دسترس‌پذیری.', b2: 'بهبود معیارهای عملکردی تا ۳۰٪.' },
    exp2: { title: 'مهندس فول‌استک · استارتاپ', date: '۲۰۲۱ — ۲۰۲۳', b1: 'عرضه قابلیت‌ها از ابتدا تا انتها.', b2: 'بهبود CI/CD و مشاهده‌پذیری.' },
    proj1: { desc: 'اپ وب نسل بعد با عملکرد بالا و پشته مدرن.' },
    proj2: { desc: 'کیت سیستم طراحی با زیبایی متریال/وان UI، کاملاً قابل دسترس.' },
    proj3: { desc: 'ابزارهای هوشمند برای تسریع توسعه و آزمایش.' },
    btn: { demo: 'دمو', docs: 'مستندات', code: 'کد' },
  contact: { p1: 'سوالی دارید یا می‌خواهید همکاری کنیم؟ پیام بگذارید تا پاسخ دهم.', labelName: 'نام', phName: 'نام شما', labelEmail: 'ایمیل', phEmail: 'you@example.com', labelMessage: 'پیام', phMessage: 'چطور کمک کنم؟', btnSend: 'ارسال', btnEmail: 'ایمیل بدهید', btnFiverr: 'استخدام از فایور', success: 'ممنون! پیام شما ارسال شد.', error: 'متاسفیم، مشکلی پیش آمد. لطفا دوباره تلاش کنید یا مستقیم ایمیل بدهید.', availability: 'دسترس‌پذیری', availabilityText: 'آماده برای تمام‌وقت، فریلنس و همکاری.', location: 'موقعیت', locationText: 'دورکاری • جهانی', elsewhere: 'سایر' },
    footer: { rights: 'کلیه حقوق محفوظ است.', reduceMotion: 'کاهش پویانمایی' }
  }
};

function applyLang(lang) {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  const rtl = (lang === 'ps' || lang === 'fa');
  html.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  document.body.classList.toggle('rtl', rtl);
  // Text nodes
  $$('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), dict[lang]);
    if (typeof value === 'string') el.textContent = value;
  });
  // Placeholders
  $$('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), dict[lang]);
    if (typeof value === 'string') el.setAttribute('placeholder', value);
  });
  localStorage.setItem(langKey, lang);
}

function getLang() {
  return localStorage.getItem(langKey) || (navigator.language || 'en').slice(0,2);
}

// tiny translator helper
function t(key, lang = getLang()) {
  try {
    return key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), dict[lang]);
  } catch(_) { return undefined; }
}

// Initialize language
let detected = getLang();
if (!['en','ps','fa'].includes(detected)) {
  // Map some common locale codes
  if (detected.startsWith('fa')) detected = 'fa';
  else if (detected.startsWith('ps')) detected = 'ps';
  else detected = 'en';
}
const initialLang = detected;
applyLang(initialLang);
const langSelect = document.getElementById('langSelect');
if (langSelect) {
  langSelect.value = initialLang;
  langSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    applyLang(value);
    // keep selector in sync if language changed elsewhere
    langSelect.value = value;
  });
}

// Contact form (Formspree)
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  // Use endpoint from form action
  const endpoint = form.getAttribute('action');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) { status.textContent = ''; status.className = 'form__status'; }
    const btn = form.querySelector('button[type="submit"]');
    const prev = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = (t('section.contact.title') ? t('contact.btnSend') : 'Send') + '…'; }
    try {
      const data = new FormData(form);
      const res = await fetch(endpoint, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        form.reset();
        if (status) { status.className = 'form__status form__status--success'; status.textContent = t('contact.success') || 'Thanks! Your message was sent.'; }
      } else {
        if (status) { status.className = 'form__status form__status--error'; status.textContent = t('contact.error') || 'Sorry, something went wrong. Please try again or email me directly.'; }
      }
    } catch (err) {
      if (status) { status.className = 'form__status form__status--error'; status.textContent = t('contact.error') || 'Sorry, something went wrong. Please try again or email me directly.'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = prev; }
    }
  });
}

// init
initContactForm();

// Email obfuscation: bind click to elements with .email-link and construct mailto at runtime
(function initEmailLinks(){
  const user = 'habibmukhlis2006';
  const domain = 'gmail.com';
  const subject = encodeURIComponent('Portfolio inquiry');
  const body = encodeURIComponent("Hi Habibur,\n\nI'd like to connect about...");
  const href = `mailto:${user}@${domain}?subject=${subject}&body=${body}`;
  $$('.email-link').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = href;
    });
  });
})();

// Move SW registration here to avoid inline script
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
}
