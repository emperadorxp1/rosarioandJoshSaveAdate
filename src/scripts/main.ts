type Config = {
  date: string;
  end: string;
  itinerary: string[];
  rsvp: { endpoint: string; whatsapp: string; deadline: string };
  couple: { bride: string; groom: string };
};

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(k: string) {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k: string, v: string) {
    try { localStorage.setItem(k, v); } catch { /* sin almacenamiento: no pasa nada */ }
  },
};

/* ---------- Invitado desde el link: ?para=Familia%20Pérez&pases=3 ---------- */
type Guest = { name: string; seats: number | null; id: string };
function readGuest(): Guest {
  const q = new URLSearchParams(location.search);
  const raw = (q.get('para') || q.get('invitado') || '').replace(/[<>]/g, '').trim().slice(0, 60);
  const n = parseInt(q.get('pases') || '', 10);
  const id = (q.get('id') || '').trim().toUpperCase();
  return { name: raw, seats: Number.isFinite(n) && n > 0 && n <= 20 ? n : null, id: /^[A-Z0-9]{4,8}$/.test(id) ? id : '' };
}

function applyGuest(g: Guest) {
  const seatsWord = (n: number) => (n === 1 ? '1 lugar reservado' : `${n} lugares reservados`);
  if (g.name) {
    const addr = $('[data-addressee]');
    if (addr) addr.textContent = `Para: ${g.name}`;
    const addrSeats = $('[data-addressee-seats]');
    if (addrSeats && g.seats) { addrSeats.textContent = seatsWord(g.seats); addrSeats.hidden = false; }
    const box = $('[data-guest-box]');
    if (box) {
      box.hidden = false;
      $('[data-guest-name]', box)!.textContent = g.name;
      $('[data-guest-seats]', box)!.textContent = g.seats ? seatsWord(g.seats) : '';
    }
    const nameInput = $<HTMLInputElement>('#f-name');
    if (nameInput && !nameInput.value) nameInput.value = g.name;
  }
  if (g.seats) {
    const t = $('[data-seats-text]');
    if (t) t.innerHTML = `Esta invitación ha sido preparada especialmente para <strong>${g.seats === 1 ? '1 persona' : g.seats + ' personas'}</strong>.`;
    const count = $<HTMLInputElement>('#f-count');
    if (count) count.max = String(g.seats);
    const lbl = $('[data-max-label]');
    if (lbl) lbl.textContent = `(máximo ${g.seats})`;
  }
}

/* ---------- El sobre ---------- */
function setupEnvelope() {
  const stage = $('.stage')!;
  const env = $('[data-env]')!;
  const card = $('[data-card]')!;
  const seal = $<HTMLButtonElement>('[data-open]')!;
  let opened = false;

  if (store.get('rj-opened') === '1' && location.hash) {
    // Si vuelven con un ancla (#confirmar), no los hacemos abrir otra vez.
    env.classList.add('is-open', 'is-done');
    stage.classList.add('is-open');
    showFloat();
    return;
  }

  card.setAttribute('inert', '');

  const open = () => {
    if (opened) return;
    opened = true;
    store.set('rj-opened', '1');
    const full = card.scrollHeight;
    card.style.setProperty('--full-h', `${full}px`);
    stage.classList.add('is-open');
    env.classList.add('is-opening');
    const fast = reduced();
    const t = (ms: number) => (fast ? 0 : ms);
    setTimeout(() => {
      env.classList.add('is-open');
      if (!fast) burst(env);
    }, t(520));
    setTimeout(() => {
      env.classList.add('is-done');
      card.removeAttribute('inert');
      card.style.removeProperty('--full-h');
      $<HTMLElement>('#names')?.focus({ preventScroll: true });
      showFloat();
    }, t(1900));
  };

  seal.addEventListener('click', open);
  // Si bajan sin abrir, el sobre se abre solo: nadie se queda fuera del contenido.
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (!e.isIntersecting && e.boundingClientRect.top < 0) open(); }),
    { threshold: 0.35 },
  );
  io.observe(env);
}

function burst(origin: HTMLElement) {
  const rect = origin.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'burst';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height * 0.42 + window.scrollY;
  const kinds = ['petal', 'petal', 'petal', 'spark', 'spark', 'leafbit'];
  for (let i = 0; i < 26; i++) {
    const el = document.createElement('span');
    el.className = `bp bp-${kinds[i % kinds.length]}`;
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
    layer.appendChild(el);
    const ang = (Math.PI * 2 * i) / 26 + Math.random() * 0.4;
    const dist = 120 + Math.random() * Math.min(window.innerWidth * 0.55, 320);
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist * 0.8 - 60;
    const rot = (Math.random() - 0.5) * 540;
    el.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx * 1.1}px), calc(-50% + ${dy + 160}px)) scale(.9) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 1800 + Math.random() * 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' },
    );
  }
  setTimeout(() => layer.remove(), 2800);
}

/* ---------- Cuenta regresiva ---------- */
function setupCountdown(cfg: Config) {
  const target = new Date(cfg.date).getTime();
  const cells = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  const box = $('[data-countdown]');
  const pad = (n: number) => String(n).padStart(2, '0');
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (box) box.innerHTML = '<p class="cd-today">¡Hoy nos casamos!</p>';
      return false;
    }
    const s = Math.floor(diff / 1000);
    cells.d!.textContent = String(Math.floor(s / 86400));
    cells.h!.textContent = pad(Math.floor((s % 86400) / 3600));
    cells.m!.textContent = pad(Math.floor((s % 3600) / 60));
    cells.s!.textContent = pad(s % 60);
    return true;
  };
  if (tick()) {
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
  }
}

/* ---------- Calendario ---------- */
function setupCalendar(cfg: Config) {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = fmt(cfg.date);
  const end = fmt(cfg.end);
  const text = `Boda de ${cfg.couple.bride} & ${cfg.couple.groom}`;
  const details = 'Ceremonia 11:00 a. m. en la Catedral de Tacna. Recepción 12:30 p. m. en el Local de Eventos Piedra Blanca.';
  const gcal = $<HTMLAnchorElement>('[data-gcal]');
  if (gcal) {
    gcal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent('Catedral de Tacna, Tacna, Perú')}&ctz=America/Lima`;
  }
  $('[data-ics]')?.addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RJ//Boda//ES', 'BEGIN:VEVENT',
      `UID:boda-rj-20270227@invitacion`, `DTSTAMP:${fmt(new Date().toISOString())}`,
      `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${text}`, `DESCRIPTION:${details}`,
      'LOCATION:Catedral de Tacna\\, Tacna\\, Perú', 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'boda-rosario-joshua.ics' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

/* ---------- Copiar cuenta ---------- */
async function copyText(t: string) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: t });
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
function setupCopy() {
  $$<HTMLButtonElement>('[data-copy]').forEach((b) => {
    const label = $('span', b)!;
    b.addEventListener('click', async () => {
      const ok = await copyText(b.dataset.copy!);
      label.textContent = ok ? '¡Copiado!' : 'Mantén presionado el número';
      b.classList.toggle('is-done', ok);
      setTimeout(() => { label.textContent = 'Copiar'; b.classList.remove('is-done'); }, 2200);
    });
  });
}

/* ---------- Itinerario vivo ---------- */
function setupTimeline(cfg: Config) {
  const list = $('[data-timeline]');
  const fill = $('[data-tl-fill]');
  const items = $$('[data-tl-item]');
  if (!list || !fill || !items.length) return;

  // El día de la boda cada momento muestra su estado real (hora de Perú).
  const day = cfg.date.slice(0, 10);
  const nowLima = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
  const isDay = nowLima.slice(0, 10) === day;
  if (isDay) {
    const hm = nowLima.slice(11, 16);
    let current = -1;
    items.forEach((li, i) => { if ((li.dataset.at || '') <= hm) current = i; });
    items.forEach((li, i) => {
      const st = $('[data-tl-state]', li)!;
      if (i < current) { li.classList.add('is-past'); st.textContent = 'Terminado'; }
      else if (i === current) { li.classList.add('is-now'); st.textContent = 'En curso'; }
      else if (i === current + 1) { li.classList.add('is-next'); st.textContent = 'Próximo'; }
    });
    list.classList.add('is-day');
  }

  // Antes del día: la línea se va trazando con el scroll y el momento al centro se marca en coral.
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = list.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    fill.style.transform = `scaleY(${p})`;
    if (isDay) return;
    let active: HTMLElement | null = null;
    items.forEach((li) => {
      const b = li.getBoundingClientRect();
      const reached = b.top + 14 < mid;
      li.classList.toggle('is-reached', reached);
      if (reached) active = li;
    });
    items.forEach((li) => li.classList.toggle('is-now', li === active));
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ---------- Team cumbia / perreo ---------- */
function setupTeam() {
  const btns = $$<HTMLButtonElement>('[data-team]');
  const hidden = $<HTMLInputElement>('input[name="team"]');
  const set = (team: string) => {
    document.documentElement.dataset.ritmo = team;
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.team === team)));
    if (hidden) hidden.value = team;
    store.set('rj-team', team);
  };
  btns.forEach((b) => b.addEventListener('click', () => set(b.dataset.team!)));
  const saved = store.get('rj-team');
  if (saved === 'cumbia' || saved === 'perreo') set(saved);
}

/* ---------- RSVP ---------- */
function setupRsvp(cfg: Config, guest: Guest) {
  const form = $<HTMLFormElement>('[data-rsvp]');
  if (!form) return;
  const submit = $<HTMLButtonElement>('[data-submit]', form)!;
  const msg = $('[data-form-msg]', form)!;
  const after = $('[data-after]', form)!;
  const count = $<HTMLInputElement>('#f-count', form)!;
  const yesOnly = $$('[data-when-yes]', form);

  const syncYes = () => {
    const v = (form.elements.namedItem('asiste') as RadioNodeList).value;
    yesOnly.forEach((el) => el.classList.toggle('is-hidden', v === 'no'));
  };
  form.addEventListener('change', syncYes);

  $$<HTMLButtonElement>('[data-step]', form).forEach((b) =>
    b.addEventListener('click', () => {
      const max = parseInt(count.max || '10', 10);
      const next = Math.min(max, Math.max(1, (parseInt(count.value, 10) || 1) + parseInt(b.dataset.step!, 10)));
      count.value = String(next);
    }),
  );
  count.addEventListener('change', () => {
    const max = parseInt(count.max || '10', 10);
    count.value = String(Math.min(max, Math.max(1, parseInt(count.value, 10) || 1)));
  });

  const showErr = (k: string, on: boolean) => {
    const e = $(`[data-err="${k}"]`, form);
    if (e) e.hidden = !on;
  };

  const waLink = (data: Record<string, string>) => {
    if (!cfg.rsvp.whatsapp) return '';
    const yes = data.asiste === 'si';
    const lines = [
      `¡Hola ${cfg.couple.bride} y ${cfg.couple.groom}! 💛`,
      yes ? `Confirmo mi asistencia a su boda: ${data.nombre}, ${data.cantidad} ${data.cantidad === '1' ? 'persona' : 'personas'}.` : `${data.nombre}: lamentablemente no podré asistir a su boda.`,
      data.cancion && yes ? `Mi canción: ${data.cancion}` : '',
      data.mensaje ? `"${data.mensaje}"` : '',
    ].filter(Boolean);
    return `https://wa.me/${cfg.rsvp.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const finish = (data: Record<string, string>, saved: boolean) => {
    form.classList.add('is-sent');
    const pm = $('[data-pm-date]', form);
    if (pm) { const d = new Date(); const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']; pm.textContent = `${d.getDate()}·${roman[d.getMonth()]}·${d.getFullYear()}`; }
    const yes = data.asiste === 'si';
    $('[data-after-text]', form)!.textContent = yes
      ? `¡Gracias, ${data.nombre}! Te esperamos el 27 de febrero.`
      : `Gracias por avisarnos, ${data.nombre}. Te vamos a extrañar.`;
    const wa = $<HTMLAnchorElement>('[data-wa]', form)!;
    const link = waLink(data);
    wa.hidden = !link;
    if (link) wa.href = link;
    $('[data-edit]', form)!.hidden = false;
    after.hidden = false;
    msg.textContent = saved ? '' : 'Tu respuesta quedó lista; envíanosla por WhatsApp para que nos llegue.';
    store.set('rj-rsvp', JSON.stringify(data));
  };

  $('[data-edit]', form)?.addEventListener('click', () => {
    form.classList.remove('is-sent');
    after.hidden = true;
    msg.textContent = '';
    submit.disabled = false;
    $<HTMLInputElement>('#f-name', form)?.focus();
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { data[k] = String(v).trim(); });
    const okName = !!data.nombre;
    const okAsiste = data.asiste === 'si' || data.asiste === 'no';
    showErr('nombre', !okName);
    showErr('asiste', !okAsiste);
    if (!okName || !okAsiste) {
      (okName ? form.querySelector<HTMLInputElement>('input[name="asiste"]') : $<HTMLInputElement>('#f-name', form))?.focus();
      return;
    }
    if (data.asiste === 'no') { data.cantidad = '0'; data.alimentacion = ''; data.cancion = ''; }
    data.pases = guest.seats ? String(guest.seats) : '';
    data.invitado = guest.name;
    data.codigo = guest.id;

    if (!cfg.rsvp.endpoint) {
      if (cfg.rsvp.whatsapp) { finish(data, false); return; }
      msg.textContent = 'La confirmación en línea aún no está activa. Por favor, avísales directamente a los novios.';
      return;
    }

    submit.disabled = true;
    form.classList.add('is-sending');
    msg.textContent = 'Enviando tu respuesta…';
    try {
      const res = await fetch(cfg.rsvp.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      finish(data, true);
    } catch {
      submit.disabled = false;
      msg.textContent = cfg.rsvp.whatsapp
        ? 'No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo otra vez, o envíanosla por WhatsApp.'
        : 'No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo otra vez.';
      if (cfg.rsvp.whatsapp) {
        const wa = $<HTMLAnchorElement>('[data-wa]', form)!;
        wa.href = waLink(data);
        wa.hidden = false;
        $('[data-edit]', form)!.hidden = true;
        after.hidden = false;
        $('[data-after-text]', form)!.textContent = '';
      }
    } finally {
      form.classList.remove('is-sending');
    }
  });

  // Si ya confirmó en este teléfono, se lo recordamos.
  const prev = store.get('rj-rsvp');
  if (prev) {
    try {
      const d = JSON.parse(prev);
      if (d && d.nombre) finish(d, true);
    } catch { /* ignorar */ }
  }
}

/* ---------- Botón flotante ---------- */
let floatReady = false;
function showFloat() {
  if (floatReady) return;
  floatReady = true;
  const f = $('[data-float]');
  const reply = $('#confirmar');
  const stage = $('.stage');
  if (!f || !reply || !stage) return;
  let replyIn = false;
  let stageIn = true;
  const sync = () => { f.hidden = replyIn || stageIn; };
  new IntersectionObserver(([e]) => { replyIn = e.isIntersecting; sync(); }, { threshold: 0.05 }).observe(reply);
  new IntersectionObserver(([e]) => { stageIn = e.isIntersecting && e.intersectionRatio > 0.5; sync(); }, { threshold: [0, 0.5, 1] }).observe(stage);
}

export function init() {
  if ('scrollRestoration' in history && !location.hash) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }
  const el = document.getElementById('wedding-config');
  if (!el) return;
  const cfg = JSON.parse(el.textContent || '{}') as Config;
  const guest = readGuest();
  applyGuest(guest);
  setupEnvelope();
  setupCountdown(cfg);
  setupCalendar(cfg);
  setupCopy();
  setupTimeline(cfg);
  setupTeam();
  setupRsvp(cfg, guest);
}
