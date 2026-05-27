/* ================================================================
   دعوة فرح — Black & Gold Luxury Wedding
   SCRIPT
   ----------------------------------------------------------------
   A. Intro loader
   B. Gold dust particles
   C. Typing subtitle
   D. Countdown → 27 July 2027
   E. Scroll driver — hall doors opening + section unfold
   F. Parallax (mouse) on the background glow
   G. Background romantic music (Web Audio, self-contained)
   H. Confetti (canvas)
   I. RSVP button
================================================================ */
'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================
   A. INTRO LOADER
================================================================ */
(function () {
  const loader = document.getElementById('loader');
  const hide = () => loader && loader.classList.add('hidden');
  setTimeout(hide, 1500);
  window.addEventListener('load', () => setTimeout(hide, 600));
})();

/* ================================================================
   B. GOLD DUST PARTICLES
================================================================ */
(function () {
  const layer = document.getElementById('dustLayer');
  function spawn() {
    const d = document.createElement('span');
    d.className = 'dust';
    const size = 2 + Math.random() * 5;
    d.style.width = d.style.height = size + 'px';
    d.style.left = Math.random() * 100 + 'vw';
    const dur = 8 + Math.random() * 9;
    d.style.animationDuration = dur + 's';
    layer.appendChild(d);
    setTimeout(() => d.remove(), dur * 1000);
  }
  setInterval(spawn, 420);
  for (let i = 0; i < 14; i++) setTimeout(spawn, i * 250);
})();

/* ================================================================
   C. TYPING SUBTITLE
================================================================ */
(function () {
  function typer(el, phrases, typeSpeed) {
    let p = 0, i = 0, deleting = false;
    (function tick() {
      const text = phrases[p];
      if (!deleting) {
        el.textContent = text.slice(0, ++i);
        if (i === text.length) { deleting = true; return setTimeout(tick, 1900); }
      } else {
        el.textContent = text.slice(0, --i);
        if (i === 0) { deleting = false; p = (p + 1) % phrases.length; return setTimeout(tick, 350); }
      }
      setTimeout(tick, deleting ? 40 : typeSpeed);
    })();
  }

  const hero = document.getElementById('typing');

  if (hero) typer(hero, [
    'بفضل الله وكرمه نتشرّف بدعوتكم 🤍',
    'حيث تبدأ أجمل قصص الحب...',
    'لنحتفل معًا بيومٍ لا يُنسى 💍',
    'حضوركم سعادتنا الحقيقية ✨'
  ], 90);
})();

/* ================================================================
   D. COUNTDOWN → 27 July 2027 (16:00 local)
================================================================ */
(function () {
  const target = new Date('2027-07-27T16:00:00').getTime();
  const $d = document.getElementById('days'),
        $h = document.getElementById('hours'),
        $m = document.getElementById('minutes'),
        $s = document.getElementById('seconds');
  const pad = n => String(n).padStart(2, '0');

  function update() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $d.textContent = $h.textContent = $m.textContent = $s.textContent = '00';
      const sub = document.querySelector('#countdown .section-sub');
      if (sub) sub.textContent = 'لقد حلّ اليوم الموعود! 🎉';
      Confetti.launch();
      clearInterval(timer);
      return;
    }
    $d.textContent = pad(Math.floor(diff / 86400000));
    $h.textContent = pad(Math.floor(diff % 86400000 / 3600000));
    $m.textContent = pad(Math.floor(diff % 3600000 / 60000));
    $s.textContent = pad(Math.floor(diff % 60000 / 1000));
  }
  update();
  const timer = setInterval(update, 1000);
})();

/* ================================================================
   E. SCROLL DRIVER — hall doors opening + section unfold
================================================================ */
(function () {
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const reveals   = [...document.querySelectorAll('.reveal')];
  const hall      = document.getElementById('hall');
  const stage     = document.getElementById('stage');
  const heroInner = document.getElementById('heroInner');

  if (reduceMotion) {
    reveals.forEach(el => el.style.setProperty('--p', '1'));
    if (stage) stage.style.setProperty('--open', '1');
    if (heroInner) { heroInner.style.opacity = '1'; heroInner.style.transform = 'scale(1)'; }
    return;
  }

  let ticking = false;

  function render() {
    const vh = window.innerHeight;

    if (hall && stage && heroInner) {
      const total = hall.offsetHeight - vh;
      const open  = clamp((-hall.getBoundingClientRect().top) / (total || 1));
      stage.style.setProperty('--open', open.toFixed(3));

      const hero = clamp((open - 0.45) / 0.5);
      heroInner.style.opacity   = (0.05 + 0.95 * hero).toFixed(3);
      heroInner.style.transform = `scale(${(0.92 + 0.08 * hero).toFixed(3)})`;
    }

    const start = vh * 0.96, end = vh * 0.42;
    for (const el of reveals) {
      const top = el.getBoundingClientRect().top;
      el.style.setProperty('--p', clamp((start - top) / (start - end)).toFixed(3));
    }
    ticking = false;
  }

  function onScroll() { if (!ticking) { requestAnimationFrame(render); ticking = true; } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  render();
})();


/* ================================================================
   G. BACKGROUND ROMANTIC MUSIC (Web Audio — soft ambient pad)
================================================================ */
(function () {
  const btn = document.getElementById('musicBtn');
  let ctx, master, playing = false;
  const chord = [196.00, 246.94, 293.66, 392.00, 493.88];

  function buildPad() {
    const AC = window.AudioContext || /** @type {any} */(window).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;
    filter.connect(master);

    chord.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.12 / chord.length;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + idx * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(filter);
      osc.start(); lfo.start();
    });
  }
  function fade(to, t) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(to, ctx.currentTime + t);
  }
  btn.addEventListener('click', () => {
    if (!ctx) buildPad();
    if (ctx.state === 'suspended') ctx.resume();
    playing = !playing;
    if (playing) { fade(0.6, 2); btn.classList.add('playing'); btn.textContent = '🎶'; }
    else { fade(0, 1.2); btn.classList.remove('playing'); btn.textContent = '🎵'; }
  });
})();

/* ================================================================
   H. CONFETTI (canvas) — gold & champagne — Confetti.launch()
================================================================ */
const Confetti = (function () {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  let W, H, pieces = [], raf = null;
  const colors = ['#d4af37', '#f6df9a', '#e9cf86', '#fff7e0', '#bfa14a', '#ffe8aa'];

  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize();
  addEventListener('resize', resize);

  function make(n) {
    for (let i = 0; i < n; i++) {
      pieces.push({
        x: Math.random() * W, y: -20 - Math.random() * H * 0.3,
        r: 5 + Math.random() * 7, c: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
        rot: Math.random() * 360, vr: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      if (p.shape === 'rect') ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, 7); ctx.fill(); }
      ctx.restore();
    });
    pieces = pieces.filter(p => p.y < H + 30);
    if (pieces.length) raf = requestAnimationFrame(draw);
    else { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, W, H); }
  }
  return { launch() { make(170); if (!raf) draw(); } };
})();

/* ================================================================
   I. RSVP
================================================================ */
(function () {
  const openBtn  = document.getElementById('rsvpBtn');
  const modal    = document.getElementById('rsvpModal');
  const closeBtn = document.getElementById('rsvpClose');
  const form     = document.getElementById('rsvpForm');
  const nameIn   = document.getElementById('guestName');
  const countIn  = document.getElementById('guestCount');
  const statusEl = document.getElementById('rsvpStatus');
  const thanks   = document.getElementById('thanks');
  const nameErr  = document.getElementById('nameError');
  const countErr = document.getElementById('countError');

  function clearErrors() {
    [nameIn, countIn].forEach(el => el.classList.remove('error'));
    nameErr.textContent = countErr.textContent = '';
  }
  function showError(input, errEl, msg) {
    input.classList.remove('error');
    void input.offsetWidth;
    input.classList.add('error');
    errEl.textContent = msg;
    input.focus();
  }
  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    clearErrors();
    statusEl.textContent = '';
    setTimeout(() => nameIn.focus(), 260);
  }
  function closeModal() {
    if (modal.contains(document.activeElement)) document.activeElement.blur();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    openBtn.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  countIn.addEventListener('keydown', e => {
    const nav = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
    if (!nav.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
  });
  countIn.addEventListener('input', () => {
    countIn.value = countIn.value.replace(/\D/g, '');
    countIn.classList.remove('error');
    countErr.textContent = '';
  });
  nameIn.addEventListener('input', () => {
    nameIn.classList.remove('error');
    nameErr.textContent = '';
  });

  const WEB3_KEY = '5c691b30-8369-4fee-98f9-25e5dec243d2';

  function saveToSheet(record) {
    if (WEB3_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') return;
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3_KEY,
        subject: 'تأكيد حضور — ' + record.name,
        name: record.name,
        count: record.count,
        date: record.date
      })
    }).catch(() => {});
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const name     = nameIn.value.trim();
    const countRaw = parseInt(countIn.value, 10);
    let valid      = true;

    if (name.length < 2) {
      showError(nameIn, nameErr, 'من فضلك ادخل اسمك الكريم');
      valid = false;
    }
    if (!countIn.value || isNaN(countRaw) || countRaw < 1 || countRaw > 50) {
      showError(countIn, countErr, 'العدد يجب أن يكون بين ١ و ٥٠');
      if (valid) valid = false;
    }
    if (!valid) return;

    const record = { name, count: countRaw, date: new Date().toLocaleString('ar-EG') };
    saveToSheet(record);

    statusEl.textContent = 'تم تأكيد حضورك يا ' + name + ' 💛';
    Confetti.launch();
    thanks.classList.add('show');
    form.reset();
    countIn.value = '1';
    setTimeout(closeModal, 1600);
  });
})();
