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
  hero: { hello: 'Hello, I’m', lead: 'AI‑assisted developer crafting Flutter apps, modern websites, browser extensions, and 2D/3D games.', ctaProjects: 'View Projects', ctaContact: 'Contact Me', ctaFiverr: 'Hire me on Fiverr', ctaEmail: 'Email me', meta1: 'Flutter • Web • Extensions • Games', meta2: 'AI‑assisted' },
    section: { about: { title: 'About' }, experience: { title: 'Experience' }, projects: { title: 'Featured Projects' }, skills: { title: 'Skills' }, contact: { title: 'Contact' } },
  about: { intro: 'I’m a developer specializing in AI‑assisted development. I create:', li1: 'Cross‑platform Flutter apps (iOS, Android, Web, Desktop)', li2: 'Responsive modern websites and static web apps', li3: 'Professional browser extensions', li4: '2D games with Python/Pygame', li5: '2D & 3D browser games with HTML5 + Phaser/Three', outro: 'I combine AI tools with coding to deliver projects faster, cleaner, and fully customized to your needs.' },
    exp1: { title: 'PohLang Language Development · Open Source', date: '2024 — 2025', b1: 'Designed and implemented a beginner-focused phrasal programming language with Rust runtime.', b2: 'Built complete compiler toolchain: lexer, parser, bytecode compiler, and VM with 50+ passing tests.', b3: 'Achieved Phase 1 production-ready status with symbolic operators and native executable support.' },
    exp2: { title: 'PLHub Development Environment · Open Source', date: '2024 — 2025', b1: 'Built professional CLI toolkit with language-independent commands, build automation, and hot reload.', b2: 'Implemented cross-platform deployment tools for Android APK, iOS IPA, Windows EXE, and web platforms.', b3: 'Created CI/CD integration with GitHub Actions and automated test discovery for Python 3.9-3.12.' },
    exp3: { title: 'VS Code Extension Development · Open Source', date: '2025', b1: 'Developed VS Code extension with syntax highlighting, IntelliSense, and 40+ code snippets for PohLang.', b2: 'Integrated bundled runtime for seamless one-click execution without external dependencies.', b3: 'Published to VS Code Marketplace with automated tasks and debug configurations.' },
    proj1: { desc: 'A beginner-focused, fully phrasal (English-like) programming language designed to be a real compiled language with standalone Rust runtime, native executables, and full independence.' },
    proj2: { desc: 'Official development environment for PohLang with language-independent commands, build automation, test automation, hot reload, and professional project templates. Like Flutter is to Dart.' },
    proj3: { desc: 'Full IDE experience with syntax highlighting, IntelliSense, 40+ code snippets, bundled runtime, and one-click execution. No separate download needed—everything in one place.' },
    proj4: { desc: 'Modern, accessible portfolio with Material Design aesthetics. Features multilingual support (EN/PS/FA), dark mode, dynamic theming, and PWA capabilities.' },
    btn: { demo: 'Demo', docs: 'Docs', code: 'Code', install: 'Install' },
  contact: { p1: 'Have a question or want to work together? Send a message and I’ll get back to you.', labelName: 'Name', phName: 'Your name', labelEmail: 'Email', phEmail: 'you@example.com', labelMessage: 'Message', phMessage: 'How can I help?', btnSend: 'Send', btnEmail: 'Email me', btnFiverr: 'Hire on Fiverr', success: 'Thanks! Your message was sent.', error: 'Sorry, something went wrong. Please try again or email me directly.', availability: 'Availability', availabilityText: 'Open to full‑time roles, freelance projects, and collaborations.', location: 'Location', locationText: 'Remote • Global', elsewhere: 'Elsewhere' },
    footer: { rights: 'All rights reserved.', reduceMotion: 'Reduce motion' }
  },
  ps: {
    skip: 'مينځپانګې ته ولاړ شئ',
    nav: { about: 'زما په اړه', experience: 'تجربه', projects: 'پروژې', skills: 'مهارتونه', contact: 'اړيکه' },
  hero: { hello: 'سلام، زه يم', lead: 'د AI په مرسته د فلاتر اپونو، عصري وېبسايټونو، براوزر توسيعاتو او 2D/3D لوبو جوړوونکی.', ctaProjects: 'پروژې وګورئ', ctaContact: 'اړیکه راسره ونیسئ', ctaFiverr: 'پر فایور استخدام مې کړئ', ctaEmail: 'بریښنالیک واستوئ', meta1: 'فلاتر • وېب • توسيعات • لوبې', meta2: 'AI-مرسته' },
    section: { about: { title: 'زما په اړه' }, experience: { title: 'تجربه' }, projects: { title: 'ځانګړې پروژې' }, skills: { title: 'مهارتونه' }, contact: { title: 'اړيکه' } },
  about: { intro: 'زه د AI-مرسته شوې پرمختيا کې تخصص لرم. زه جوړوم:', li1: 'د فلټر کراس-پليټفارم اپونه (iOS، Android، ويب، ډيسکټاپ)', li2: 'عصري ځواب ویونکي وېبسايټونه او سټېټيک وېب اپونه', li3: 'مسلکي براوزر توسيعات', li4: '۲D لوبې د Python/Pygame سره', li5: '۲D او ۳D براوزر لوبې د HTML5 + Phaser/Three سره', outro: 'زه د AI وسايلو او کود ګډ کاروم څو پروژې ژر، پاکې او ستاسو اړتیاوو ته سمې وسپارم.' },
    exp1: { title: 'د PohLang ژبې پرمختګ · خلاص سرچینه', date: '۲۰۲۴ — ۲۰۲۵', b1: 'د پیلامرو لپاره د Rust رن‌ټایم سره یوه بشپړه جملوی برنامه لیکنې ژبه ډیزاین او پلي کړه.', b2: 'بشپړ کمپایلر تولچین جوړ کړ: لیکسر، پارسر، بایت‌کوډ کمپایلر او VM د ۵۰+ بریالیو ازموینو سره.', b3: 'د فاز ۱ تولید چمتو حالت ته ورسید د سمبولیک عملګرانو او اصلي اجراییه فایلونو ملاتړ سره.' },
    exp2: { title: 'د PLHub پراختیایی چاپیریال · خلاص سرچینه', date: '۲۰۲۴ — ۲۰۲۵', b1: 'مسلکي CLI وسیلې جوړې کړې د ژبې څخه خپلواک امرونو، جوړولو اتومات او ګرم بیا لوډ سره.', b2: 'د Android APK، iOS IPA، Windows EXE او ویب پلیټفارمونو لپاره کراس-پلیټفارم ځایونې وسیلې پلي کړې.', b3: 'د GitHub Actions سره CI/CD یکجا کړ او د Python 3.9-3.12 لپاره اتومات ازموینې کشف جوړ کړ.' },
    exp3: { title: 'د VS Code توسيعې پرمختګ · خلاص سرچینه', date: '۲۰۲۵', b1: 'د PohLang لپاره د VS Code توسيعه جوړه کړه د نحو روښانتیا، IntelliSense او ۴۰+ کوډ ټوټو سره.', b2: 'د بې له بهرنۍ انحصار څخه یو کلیک اجرا لپاره یوځای شوی رن‌ټایم یکجا کړ.', b3: 'د VS Code بازار ته خپور شو د اتوماتو دندو او ډیبګ تنظیماتو سره.' },
    proj1: { desc: 'د پیلامرو لپاره یوه بشپړه جملوی (انګلیسي ډوله) برنامه لیکنې ژبه چې د اصلي جمع شوي ژبې په توګه ډیزاین شوې، د Rust خپلواک رن‌ټایم، اصلي اجراییه فایلونه او بشپړه خپلواکي لري.' },
    proj2: { desc: 'د PohLang لپاره رسمي پراختیایی چاپیریال د ژبې څخه خپلواک امرونو، جوړولو اتومات، ازموینې اتومات، ګرم بیا لوډ او مسلکي پروژې کینډۍ سره. لکه Flutter چې د Dart لپاره دی.' },
    proj3: { desc: 'بشپړه IDE تجربه د نحو روښانتیا، IntelliSense، ۴۰+ کوډ ټوټې، یوځای شوی رن‌ټایم او یو کلیک اجرا سره. جلا ډاونلوډ ته اړتیا نشته - هر څه په یو ځای.' },
    proj4: { desc: 'عصري او د لاسرسي وړ پورټفولیو د Material Design ښکلاوو سره. د کثیرالژبي ملاتړ (EN/PS/FA)، تیاره حالت، متحرک رنګوالی او PWA وړتیاوې لري.' },
    btn: { demo: 'ډيمو', docs: 'لاسوندونه', code: 'کوډ', install: 'نصبول' },
  contact: { p1: 'پوښتنه لرئ؟ پيغام پرېږدئ، ژر ځواب درکوم.', labelName: 'نوم', phName: 'ستاسو نوم', labelEmail: 'برېښنالیک', phEmail: 'you@example.com', labelMessage: 'پيغام', phMessage: 'څنګه مرسته وکړم؟', btnSend: 'لېږل', btnEmail: 'بریښنالیک', btnFiverr: 'په فایور وګومارئ', success: 'مننه! ستاسو پیغام واستول شو.', error: 'بخښنه، ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ یا مستقیم بریښنالیک واستوئ.', availability: 'شتون', availabilityText: 'د تمام وخت، فريلانس او همکارۍ لپاره چمتو.', location: 'ځای', locationText: 'لرې • نړيوال', elsewhere: 'بل ځای' },
    footer: { rights: 'ټولې حقوق خوندي دي.', reduceMotion: 'خوځښت کم کړئ' }
  },
  fa: {
    skip: 'پرش به محتوا',
    nav: { about: 'درباره من', experience: 'تجربه', projects: 'پروژه‌ها', skills: 'مهارت‌ها', contact: 'ارتباط' },
  hero: { hello: 'سلام، من', lead: 'توسعه‌دهندهٔ یاری‌شده با هوش مصنوعی برای ساخت اپ‌های فلاتر، وب‌سایت‌های مدرن، افزونه‌های مرورگر و بازی‌های ۲بعدی/۳بعدی.', ctaProjects: 'مشاهده پروژه‌ها', ctaContact: 'تماس با من', ctaFiverr: 'در Fiverr من را استخدام کنید', ctaEmail: 'ارسال ایمیل', meta1: 'فلاتر • وب • افزونه‌ها • بازی', meta2: 'یاری‌شده با هوش مصنوعی' },
    section: { about: { title: 'درباره' }, experience: { title: 'تجربه' }, projects: { title: 'پروژه‌های ویژه' }, skills: { title: 'مهارت‌ها' }, contact: { title: 'ارتباط' } },
  about: { intro: 'من توسعه‌دهنده‌ای با تمرکز بر توسعه یاری‌شده با هوش مصنوعی هستم. من می‌سازم:', li1: 'اپ‌های کراس‌پلتفرم فلاتر (iOS، اندروید، وب، دسکتاپ)', li2: 'وب‌سایت‌های مدرن واکنش‌گرا و برنامه‌های وب استاتیک', li3: 'افزونه‌های حرفه‌ای مرورگر', li4: 'بازی‌های دوبعدی با Python/Pygame', li5: 'بازی‌های ۲بعدی و ۳بعدی مرورگر با HTML5 + Phaser/Three', outro: 'من ابزارهای هوش مصنوعی را با کدنویسی ترکیب می‌کنم تا پروژه‌ها را سریع‌تر، تمیزتر و کاملاً مطابق نیاز شما تحویل دهم.' },
    exp1: { title: 'توسعه زبان PohLang · متن‌باز', date: '۲۰۲۴ — ۲۰۲۵', b1: 'طراحی و پیاده‌سازی یک زبان برنامه‌نویسی عبارتی برای مبتدیان با رانتایم Rust.', b2: 'ساخت زنجیره ابزار کامل کامپایلر: تحلیل‌گر واژگانی، تحلیل‌گر نحوی، کامپایلر بایت‌کد و ماشین مجازی با ۵۰+ تست موفق.', b3: 'دستیابی به وضعیت آماده تولید فاز ۱ با عملگرهای نمادین و پشتیبانی فایل اجرایی بومی.' },
    exp2: { title: 'محیط توسعه PLHub · متن‌باز', date: '۲۰۲۴ — ۲۰۲۵', b1: 'ساخت ابزار CLI حرفه‌ای با دستورات مستقل از زبان، اتوماسیون ساخت و بارگذاری مجدد فوری.', b2: 'پیاده‌سازی ابزارهای استقرار چندسکویی برای Android APK، iOS IPA، Windows EXE و پلتفرم‌های وب.', b3: 'ایجاد یکپارچگی CI/CD با GitHub Actions و کشف خودکار تست برای Python 3.9-3.12.' },
    exp3: { title: 'توسعه افزونه VS Code · متن‌باز', date: '۲۰۲۵', b1: 'توسعه افزونه VS Code با برجسته‌سازی نحو، IntelliSense و ۴۰+ قطعه کد برای PohLang.', b2: 'یکپارچه‌سازی رانتایم داخلی برای اجرای یک کلیکی بدون وابستگی خارجی.', b3: 'انتشار در بازار VS Code با تسک‌های خودکار و پیکربندی‌های دیباگ.' },
    proj1: { desc: 'یک زبان برنامه‌نویسی کاملاً عبارتی (انگلیسی‌وار) برای مبتدیان، طراحی‌شده به‌عنوان یک زبان کامپایل شده واقعی با رانتایم مستقل Rust، فایل‌های اجرایی بومی و استقلال کامل.' },
    proj2: { desc: 'محیط توسعه رسمی برای PohLang با دستورات مستقل از زبان، اتوماسیون ساخت، اتوماسیون تست، بارگذاری مجدد فوری و قالب‌های حرفه‌ای پروژه. مانند Flutter برای Dart.' },
    proj3: { desc: 'تجربه کامل IDE با برجسته‌سازی نحو، IntelliSense، ۴۰+ قطعه کد، رانتایم یکپارچه و اجرای یک کلیکی. نیاز به دانلود جداگانه ندارد—همه‌چیز در یک جا.' },
    proj4: { desc: 'پورتفولیوی مدرن و قابل دسترس با زیبایی‌شناسی Material Design. پشتیبانی چندزبانه (EN/PS/FA)، حالت تاریک، تم پویا و قابلیت‌های PWA.' },
    btn: { demo: 'دمو', docs: 'مستندات', code: 'کد', install: 'نصب' },
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
