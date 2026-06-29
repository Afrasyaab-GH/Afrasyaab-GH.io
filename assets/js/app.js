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
    nav: { about: 'About', experience: 'Experience', projects: 'Projects', contact: 'Contact' },
    hero: { hello: 'Hello, I’m', lead: 'Founder of Al-Haq Studio & Al-Haq Initiative. AI-assisted developer crafting Android apps, modern web platforms, browser extensions, and compiler tooling.', ctaProjects: 'View Projects', ctaContact: 'Contact Me', ctaFiverr: 'Hire me on Fiverr', ctaEmail: 'Email me', meta1: 'Android • Web • Desktop • Extensions', meta2: 'AI-assisted' },
    section: { about: { title: 'About' }, experience: { title: 'Experience' }, projects: { title: 'Featured Projects' }, contact: { title: 'Contact' } },
    about: { intro: 'I am the founder of the Al-Haq Initiative and Al-Haq Studio (Al-Haq Digital Services & Solutions). I specialize in building local-first, privacy-respecting software. I create:', li1: 'Native Android applications & utility suites (Kotlin, Java)', li2: 'Responsive modern websites and static web apps', li3: 'Professional browser extensions', outro: 'My mission is to build software that serves the community, protects user attention, and aligns with spiritual wellness—combining AI-assisted workflows with robust hand-written logic.' },
    exp1: { title: 'PohLang Language Development · Open Source', date: '2024 — 2025', b1: 'Designed and implemented a beginner-focused phrasal programming language with Rust runtime.', b2: 'Built complete compiler toolchain: lexer, parser, bytecode compiler, and VM with 50+ passing tests.', b3: 'Achieved Phase 1 production-ready status with symbolic operators and native executable support.' },
    exp2: { title: 'PLHub Development Environment · Open Source', date: '2024 — 2025', b1: 'Built professional CLI toolkit with language-independent commands, build automation, and hot reload.', b2: 'Implemented cross-platform deployment tools for Android APK, iOS IPA, Windows EXE, and web platforms.', b3: 'Created CI/CD integration with GitHub Actions and automated test discovery for Python 3.9-3.12.' },
    exp3: { title: 'VS Code Extension Development · Open Source', date: '2025', b1: 'Developed VS Code extension with syntax highlighting, IntelliSense, and 40+ code snippets for PohLang.', b2: 'Integrated bundled runtime for seamless one-click execution without external dependencies.', b3: 'Published to VS Code Marketplace with automated tasks and debug configurations.' },
    exp4: { title: 'Quran Reels Generator · Open Source', date: '2025 — 2026', b1: 'Built AI-powered Quran video generator with Flask backend, MoviePy pipeline, and multi-reciter support.', b2: 'Shipped Windows desktop app with PyInstaller, NSIS installer, and automated GitHub Actions CI/CD releases.', b3: 'Deployed live web app on Hugging Face Spaces with Docker, YouTube OAuth upload, and 8 production releases.' },
    exp5: { title: 'Alhaq Initiative · Web Platform', date: '2025 — 2026', b1: 'Designed and developed multi-page organizational website with Firebase hosting and PWA capabilities.', b2: 'Built Quran reader, Islamic library, infographics gallery, and donation system with automated testing.', b3: 'Implemented full CI/CD with Cypress E2E tests, Jest unit tests, ESLint, and Prettier integration.' },
    proj1: { desc: 'A beginner-focused, fully phrasal (English-like) programming language designed to be a real compiled language with standalone Rust runtime, native executables, and full independence.' },
    proj2: { desc: 'Official development environment for PohLang with language-independent commands, build automation, test automation, hot reload, and professional project templates. Like Flutter is to Dart.' },
    proj3: { desc: 'Full IDE experience with syntax highlighting, IntelliSense, 40+ code snippets, bundled runtime, and one-click execution. No separate download needed—everything in one place.' },
    proj4: { desc: 'On-device AI visual content protection. Offline-first screen moderation using local TensorFlow Lite models — available as an Android app and a free browser extension. Free Access Program available.' },
    proj5: { desc: 'Open-source Quranic video generator producing Reels, Shorts, and TikTok-ready content with Arabic text, English translation, multiple reciters, and dynamic backgrounds. Web + Windows desktop app.' },
    proj6: { desc: 'Privacy-first digital protection for Android. System blocker with 50k+ domain database, keyword filtering, Reels blocking, and focus rules. Open source with Free Access Program available.' },
    proj7: { desc: 'Full-featured organizational website with Quran reader, Islamic library, infographics gallery, donation system, and DeenHub app landing page. Firebase-hosted PWA with E2E testing.' },
    proj8: { desc: 'Cross-browser extension delivering the Amn protection suite (domain filters, custom keywords, and DeenTab tab manager) to Chrome, Firefox, and Edge browsers.' },
    btn: { demo: 'Demo', docs: 'Docs', code: 'Code', install: 'Install', repo: 'Repo', readme: 'README', download: 'Download' },
    contact: { p1: 'Have a question or want to work together? Send a message and I’ll get back to you.', labelName: 'Name', phName: 'Your name', labelEmail: 'Email', phEmail: 'you@example.com', labelMessage: 'Message', phMessage: 'How can I help?', btnSend: 'Send', btnEmail: 'Email me', btnFiverr: 'Hire on Fiverr', success: 'Thanks! Your message was sent.', error: 'Sorry, something went wrong. Please try again or email me directly.', availability: 'Availability', availabilityText: 'Open to full‑time roles, freelance projects, and collaborations.', location: 'Location', locationText: 'Remote • Global', elsewhere: 'Elsewhere' },
    footer: { rights: 'All rights reserved.', reduceMotion: 'Reduce motion' }
  },
  ps: {
    skip: 'مينځپانګې ته ولاړ شئ',
    nav: { about: 'زما په اړه', experience: 'تجربه', projects: 'پروژې', contact: 'اړيکه' },
    hero: { hello: 'سلام، زه يم', lead: 'د الحق سټوډیو او الحق نوښت بنسټ اېښودونکی. د AI په مرسته د انډرایډ اپونو، عصري وېبسايټونو، ډيسکټاپ اپونو او براوزر توسيعاتو جوړوونکی.', ctaProjects: 'پروژې وګورئ', ctaContact: 'اړیکه راسره ونیسئ', ctaFiverr: 'پر فایور استخدام مې کړئ', ctaEmail: 'بریښنالیک واستوئ', meta1: 'انډرایډ • وېب • ډيسکټاپ • توسيعات', meta2: 'AI-مرسته' },
    section: { about: { title: 'زما په اړه' }, experience: { title: 'تجربه' }, projects: { title: 'ځانګړې پروژې' }, contact: { title: 'اړيکه' } },
    about: { intro: 'زه د الحق نوښت او الحق سټوډیو (Al-Haq Digital Services & Solutions) بنسټ اېښودونکی یم. زه د محلي او محرمیت لرونکي سافټویرونو جوړولو متخصص یم. زه جوړوم:', li1: 'اصلي انډرایډ اپلیکیشنونه او محافظتي کڅوړې (Kotlin, Java)', li2: 'عصري ځواب ویونکي وېبسايټونه او سټېټيک وېب اپونه', li3: 'مسلکي براوزر توسيعات', outro: 'زما موخه د داسې سافټویرونو جوړول دي چې ټولنې ته خدمت وکړي، د کاروونکو تمرکز خوندي کړي، او د معنوي هوساینې سره سمون ولري.' },
    exp1: { title: 'د PohLang ژبې پرمختګ · خلاص سرچینه', date: '۲۰۲۴ — ۲۰۲۵', b1: 'د پیلامرو لپاره د Rust رن‌ټایم سره یوه بشپړه جملوی برنامه لیکنې ژبه ډیزاین او پلي کړه.', b2: 'بشپړ کمپایلر تولچین جوړ کړ: لیکسر، پارسر، بایت‌کوډ کمپایلر او VM د ۵۰+ بریالیو ازموینو سره.', b3: 'د فاز ۱ تولید چمتو حالت ته ورسید د سمبولیک عملګرانو او اصلي اجراییه فایلونو ملاتړ سره.' },
    exp2: { title: 'د PLHub پراختیایی چاپیریال · خلاص سرچینه', date: '۲۰۲۴ — ۲۰۲۵', b1: 'مسلکي CLI وسیلې جوړې کړې د ژبې څخه خپلواک امرونو، جوړولو اتومات او ګرم بیا لوډ سره.', b2: 'د Android APK، iOS IPA، Windows EXE او ویب پلیټفارمونو لپاره کراس-پلیټفارم ځایونې وسیلې پلي کړې.', b3: 'د GitHub Actions سره CI/CD یکجا کړ او د Python 3.9-3.12 لپاره اتومات ازموینې کشف جوړ کړ.' },
    exp3: { title: 'د VS Code توسيعې پرمختګ · خلاص سرچینه', date: '۲۰۲۵', b1: 'د PohLang لپاره د VS Code توسيعه جوړه کړه د نحو روښانتیا، IntelliSense او ۴۰+ کوډ ټوټو سره.', b2: 'د بې له بهرنۍ انحصار څخه یو کلیک اجرا لپاره یوځای شوی رن‌ټایم یکجا کړ.', b3: 'د VS Code بازار ته خپور شو د اتوماتو دندو او ډیبګ تنظیماتو سره.' },
    exp4: { title: 'د قرآن ریلز جنریتر · خلاص سرچینه', date: '۲۰۲۵ — ۲۰۲۶', b1: 'د Flask بېکنډ، MoviePy پایپلاین او ډېرو قاریانو ملاتړ سره د AI قرآني ویډیو جنریتر جوړ کړ.', b2: 'د PyInstaller، NSIS انسټالر او اتومات GitHub Actions CI/CD خپرونو سره د وینډوز ډیسکټاپ اپ خپور کړ.', b3: 'د Docker، YouTube OAuth اپلوډ او ۸ تولیدي خپرونو سره په Hugging Face Spaces کې ژوندی ویب اپ ځای پر ځای کړ.' },
    exp5: { title: 'الحق نوښت · ویب پلیټفارم', date: '۲۰۲۵ — ۲۰۲۶', b1: 'د Firebase کوربه توب او PWA وړتیاوو سره ډیر مخیز سازماني ویبسایټ ډیزاین او جوړ کړ.', b2: 'د قرآن لوستونکی، اسلامي کتابتون، انفوګرافیک ګالری او د عطیې سیسټم د اتومات ازموینې سره جوړ کړ.', b3: 'د Cypress E2E ازموینو، Jest یونیټ ازموینو، ESLint او Prettier سره بشپړ CI/CD پلي کړ.' },
    proj1: { desc: 'د پیلامرو لپاره یوه بشپړه جملوی (انګلیسي ډوله) برنامه لیکنې ژبه چې د اصلي جمع شوي ژبې په توګه ډیزاین شوې، د Rust خپلواک رن‌ټایم، اصلي اجراییه فایلونه او بشپړه خپلواکي لري.' },
    proj2: { desc: 'د PohLang لپاره رسمي پراختیایی چاپیریال د ژبې څخه خپلواک امرونو، جوړولو اتومات، ازموینې اتومات، ګرم بیا لوډ او مسلکي پروژې کینډۍ سره. لکه Flutter چې د Dart لپاره دی.' },
    proj3: { desc: 'بشپړه IDE تجربه د نحو روښانتیا، IntelliSense، ۴۰+ کوډ ټوټې، یوځای شوی رن‌ټایم او یو کلیک اجرا سره. جلا ډاونلوډ ته اړتیا نشته - هر څه په یو ځای.' },
    proj4: { desc: 'د الګوریتمونو او محلي هوش مصنوعي په مرسته د انځورونو او منځپانګو د پټولو اپلیکیشن. په آفلاین ډول د سکرین د نامناسبو برخو د تتولو لپاره د ټینسر فلو لایټ کاروي.' },
    proj5: { desc: 'د AI قرآني ویډیو جنریتر چې Reels/Shorts/TikTok چمتو منځپانګه د عربي متن، انګلیسي ژباړې، ډېرو قاریانو او متحرک شاليد سره تولیدوي. ویب + وینډوز ډیسکټاپ اپ.' },
    proj6: { desc: 'د تمرکز او محصولیت لپاره د دیني ډیجیټل محافظت او هوساینې اپلیکیشن. د اپلیکیشن بندولو، د کلیمې فلټر کولو، او منځپانګې اعتدال سره لومړی د محرمیت لپاره د Android غوښتنلیک.' },
    proj7: { desc: 'بشپړ سازماني ویبسایټ د قرآن لوستونکي، اسلامي کتابتون، انفوګرافیک ګالري، د عطیې سیسټم او DeenHub اپ لینډینګ پاڼې سره. د Firebase کوربه توب PWA د E2E ازموینې سره.' },
    proj8: { desc: 'کراس-براوزر توسیع چې د امن محافظتي کڅوړه (د ډومین فلټرونه، د کارن کلیدي ټکي، او د DeenTab مدیر) کروم، فایرفوکس، او ایج براوزرونو ته لېږدوي.' },
    btn: { demo: 'ډيمو', docs: 'لاسوندونه', code: 'کوډ', install: 'نصبول', repo: 'ذخیره', readme: 'README', download: 'ډاونلوډ' },
    contact: { p1: 'پوښتنه لرئ؟ پيغام پرېږدئ، ژر ځواب درکوم.', labelName: 'نوم', phName: 'ستاسو نوم', labelEmail: 'برېښنالیک', phEmail: 'you@example.com', labelMessage: 'پيغام', phMessage: 'څنګه مرسته وکړم؟', btnSend: 'لېږل', btnEmail: 'بریښنالیک', btnFiverr: 'په فایور وګومارئ', success: 'مننه! ستاسو پیغام واستول شو.', error: 'بخښنه، ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ یا مستقیم بریښنالیک واستوئ.', availability: 'شتون', availabilityText: 'د تمام وخت، فريلانس او همکارۍ لپاره چمتو.', location: 'ځای', locationText: 'لرې • نړيوال', elsewhere: 'بل ځای' },
    footer: { rights: 'ټولې حقوق خوندي دي.', reduceMotion: 'خوځښت کم کړئ' }
  },
  fa: {
    skip: 'پرش به محتوا',
    nav: { about: 'درباره من', experience: 'تجربه', projects: 'پروژه‌ها', contact: 'ارتباط' },
    hero: { hello: 'سلام، من', lead: 'بنیان‌گذار الحق استودیو و ابتکار الحق. توسعه‌دهندهٔ یاری‌شده با هوش مصنوعی برای ساخت اپ‌های اندروید، افزونه‌های مرورگر و کامپایلرهای بومی.', ctaProjects: 'مشاهده پروژه‌ها', ctaContact: 'تماس با من', ctaFiverr: 'در Fiverr من را استخدام کنید', ctaEmail: 'ارسال ایمیل', meta1: 'اندروید • وب • دسکتاپ • افزونه‌ها', meta2: 'یاری‌شده با هوش مصنوعی' },
    section: { about: { title: 'درباره' }, experience: { title: 'تجربه' }, projects: { title: 'پروژه‌های ویژه' }, contact: { title: 'ارتباط' } },
    about: { intro: 'من بنیان‌گذار الحق استودیو (Al-Haq Digital Services & Solutions) و ابتکار الحق هستم. من توسعه‌دهنده‌ای متخصص در نرم‌افزارهای آفلاین‌محور و حریم‌خصوصی‌محور هستم. من می‌سازم:', li1: 'اپلیکیشن‌های بومی اندروید و مجموعه‌های حفاظتی (Kotlin, Java)', li2: 'وب‌سایت‌های مدرن واکنش‌گرا و برنامه‌های وب استاتیک', li3: 'افزونه‌های حرفه‌ای مرورگر', outro: 'ماموریت من ساخت نرم‌افزارهایی است که به جامعه خدمت کنند، از تمرکز کاربران محافظت نمایند و با سلامت معنوی همسو باشند.' },
    exp1: { title: 'توسعه زبان PohLang · متن‌باز', date: '۲۰۲۴ — ۲۰۲۵', b1: 'طراحی و پیاده‌سازی یک زبان برنامه‌نویسی عبارتی برای مبتدیان با رانتایم Rust.', b2: 'ساخت زنجیره ابزار کامل کامپایلر: تحلیل‌گر واژگانی، تحلیل‌گر نحوی، کامپایلر بایت‌کد و ماشین مجازی با ۵۰+ تست موفق.', b3: 'دستیابی به وضعیت آماده تولید فاز ۱ با عملگرهای نمادین و پشتیبانی فایل اجرایی بومی.' },
    exp2: { title: 'محیط توسعه PLHub · متن‌باز', date: '۲۰۲۴ — ۲۰۲۵', b1: 'ساخت ابزار CLI حرفه‌ای با دستورات مستقل از زبان، اتوماسیون ساخت و بارگذاری مجدد فوری.', b2: 'پیاده‌سازی ابزارهای استقرار چندسکویی برای Android APK، iOS IPA، Windows EXE و پلتفرم‌های وب.', b3: 'ایجاد یکپارچگی CI/CD با GitHub Actions و کشف خودکار تست برای Python 3.9-3.12.' },
    exp3: { title: 'توسعه افزونه VS Code · متن‌باز', date: '۲۰۲۵', b1: 'توسعه افزونه VS Code با برجسته‌سازی نحو، IntelliSense و ۴۰+ قطعه کد برای PohLang.', b2: 'یکپارچه‌سازی رانتایم داخلی برای اجرای یک کلیکی بدون وابستگی خارجی.', b3: 'انتشار در بازار VS Code با تسک‌های خودکار و پیکربندی‌های دیباگ.' },
    exp4: { title: 'ژنراتور ریلز قرآن · متن‌باز', date: '۲۰۲۵ — ۲۰۲۶', b1: 'ساخت ژنراتور ویدیوی قرآنی با هوش مصنوعی با بکند Flask، پایپلاین MoviePy و پشتیبانی چند قاری.', b2: 'انتشار اپ دسکتاپ ویندوز با PyInstaller، نصب‌کننده NSIS و انتشارات خودکار CI/CD GitHub Actions.', b3: 'استقرار اپ وب زنده در Hugging Face Spaces با Docker، آپلود YouTube OAuth و ۸ انتشار تولیدی.' },
    exp5: { title: 'ابتکار الحق · پلتفرم وب', date: '۲۰۲۵ — ۲۰۲۶', b1: 'طراحی و توسعه وبسایت سازمانی چند صفحه‌ای با میزبانی Firebase و قابلیت‌های PWA.', b2: 'ساخت قاری قرآن، کتابخانه اسلامی، گالری اینفوگرافیک و سیستم اهدا با تست خودکار.', b3: 'پیاده‌سازی CI/CD کامل با تست‌های E2E Cypress، تست‌های واحد Jest، ESLint و Prettier.' },
    proj1: { desc: 'یک زبان برنامه‌نویسی کاملاً عبارتی (انگلیسی‌وار) برای مبتدیان، طراحی‌شده به‌عنوان یک زبان کامپایل شده واقعی با رانتایم مستقل Rust، فایل‌های اجرایی بومی و استقلال کامل.' },
    proj2: { desc: 'محیط توسعه رسمی برای PohLang با دستورات مستقل از زبان، اتوماسیون ساخت, اتوماسیون تست، بارگذاری مجدد فوری و قالب‌های حرفه‌ای پروژه. مانند Flutter برای Dart.' },
    proj3: { desc: 'تجربه کامل IDE با برجسته‌سازی نحو، IntelliSense، ۴۰+ قطعه کد، رانتایم یکپارچه و اجرای یک کلیکی. نیاز به دانلود جداگانه ندارد—همه‌چیز در یک جا.' },
    proj4: { desc: 'مجموعه حفاظت بصری با استفاده از هوش مصنوعی درون‌دستگاهی. اپلیکیشن اندروید آفلاین‌محور برای شناسایی و شطرنجی کردن خودکار تصاویر نامناسب با هوش مصنوعی محلی.' },
    proj5: { desc: 'ژنراتور ویدیوی قرآنی با هوش مصنوعی که محتوای آماده Reels/Shorts/TikTok با متن عربی، ترجمه انگلیسی، چند قاری و پس‌زمینه‌های پویا تولید می‌کند. وب + اپ دسکتاپ ویندوز.' },
    proj6: { desc: 'مجموعه حفاظت دیجیتال و بهداشت متناسب با ایمان برای تمرکز و بهره‌وری. اپلیکیشن اندروید با اولویت حریم خصوصی، مسدود کردن برنامه‌ها، فیلتر کردن کلمات کلیدی و تعدیل محتوا.' },
    proj7: { desc: 'وبسایت سازمانی کامل با قاری قرآن، کتابخانه اسلامی، گالری اینفوگرافیک، سیستم اهدا و صفحه فرود اپ DeenHub. PWA میزبانی Firebase با تست E2E.' },
    proj8: { desc: 'افزونه چندمرورگره برای انتقال خدمات حفاظتی امن (فیلترهای دامنه، کلمات کلیدی دلخواه و تب مدیریت DeenTab) به مرورگرهای کروم، فایرفاکس و اج.' },
    btn: { demo: 'دمو', docs: 'مستندات', code: 'کد', install: 'نصب', repo: 'مخزن', readme: 'README', download: 'دانلود' },
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
  const body = encodeURIComponent("Hi Afrasyaab,\n\nI'd like to connect about...");
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
