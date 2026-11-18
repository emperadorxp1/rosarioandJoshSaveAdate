/**
 * Boda Rosario & Joshua — Google Sheet de invitados y confirmaciones.
 *
 * Hojas:
 *  - Invitados:      la lista oficial. Ustedes llenan Nombre, Pases y Teléfono; el resto lo llena el script.
 *  - Confirmaciones: cada respuesta que llega desde la invitación (historial completo).
 *  - Config:         URL de la invitación, mensaje de WhatsApp y totales.
 *
 * Menú 💌 Boda (aparece al abrir la hoja). Ver apps-script/README.md.
 */

const SH = { rsvp: 'Confirmaciones', guests: 'Invitados', config: 'Config' };

const RSVP_HEADERS = ['Fecha', 'Invitado (link)', 'Pases', 'Nombre', 'Asiste', 'Cantidad', 'Alimentación', 'Canción', 'Team', 'Mensaje', 'Código'];
const GUEST_HEADERS = ['Nombre en el sobre', 'Pases', 'Teléfono', 'Código', 'Link', 'WhatsApp', 'Enviado', 'Estado', 'Confirmados', 'Respondió'];
const COL = { name: 1, seats: 2, phone: 3, code: 4, link: 5, wa: 6, sent: 7, state: 8, count: 9, date: 10 };

const DEFAULTS = {
  url: 'https://rosarioand-josh-save-adate.vercel.app/',
  message: 'Hola, {nombre} 💛\nCon mucho cariño te invitamos a nuestra boda. Abre tu invitación aquí:\n{link}\n\nRosario & Joshua',
  country: '51',
};

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/* ---------------- Menú ---------------- */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('💌 Boda')
    .addItem('Preparar hoja', 'prepararHoja')
    .addItem('Generar / actualizar links', 'generarLinks')
    .addItem('Enviar invitaciones', 'abrirEnvio')
    .addToUi();
}

/** Crea u ordena las tres hojas. Se puede correr varias veces sin perder datos. */
function prepararHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const r = rsvpSheet(ss);
  r.getRange(1, 1, 1, RSVP_HEADERS.length).setValues([RSVP_HEADERS]).setFontWeight('bold');
  r.setFrozenRows(1);

  const g = ss.getSheetByName(SH.guests) || ss.insertSheet(SH.guests, 0);
  g.getRange(1, 1, 1, GUEST_HEADERS.length).setValues([GUEST_HEADERS]).setFontWeight('bold').setBackground('#f6e7c8');
  g.setFrozenRows(1);
  const rows = Math.max(g.getMaxRows() - 1, 1);
  g.getRange(2, COL.sent, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  g.getRange(2, COL.phone, rows, 1).setNumberFormat('@');
  g.getRange(2, COL.date, rows, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  g.setColumnWidth(COL.name, 220);
  g.setColumnWidth(COL.link, 260);
  g.getRange(1, COL.seats, g.getMaxRows(), 1).setHorizontalAlignment('center');
  g.getRange(1, COL.code, g.getMaxRows(), 1).setHorizontalAlignment('center');
  g.getRange(1, COL.count, g.getMaxRows(), 1).setHorizontalAlignment('center');

  const c = ss.getSheetByName(SH.config) || ss.insertSheet(SH.config);
  const labels = [['URL de la invitación'], ['Mensaje de WhatsApp ({nombre}, {pases}, {link})'], ['Código de país']];
  c.getRange(1, 1, 3, 1).setValues(labels).setFontWeight('bold');
  if (!c.getRange('B1').getValue()) c.getRange('B1').setValue(DEFAULTS.url);
  if (!c.getRange('B2').getValue()) c.getRange('B2').setValue(DEFAULTS.message);
  if (!c.getRange('B3').getValue()) c.getRange('B3').setNumberFormat('@').setValue(DEFAULTS.country);
  c.getRange('B2').setWrap(true);
  c.setColumnWidth(1, 300);
  c.setColumnWidth(2, 420);
  const totals = [
    ['Resumen', ''],
    ['Invitaciones', '=COUNTA(Invitados!A2:A)'],
    ['Pases asignados', '=SUM(Invitados!B2:B)'],
    ['Invitaciones enviadas', '=COUNTIF(Invitados!G2:G,TRUE)'],
    ['Confirmaron que van', '=COUNTIF(Invitados!H2:H,"Confirmó")'],
    ['Personas confirmadas', '=SUM(Invitados!I2:I)'],
    ['No asisten', '=COUNTIF(Invitados!H2:H,"No asiste")'],
    ['Sin responder', '=COUNTIF(Invitados!H2:H,"Pendiente")'],
  ];
  c.getRange(5, 1, totals.length, 2).setValues(totals);
  c.getRange(5, 1, 1, 2).setFontWeight('bold');

  generarLinks();
  ss.setActiveSheet(g);
  ss.toast('Listo. Escribe tus invitados en la hoja Invitados (nombre, pases y teléfono).', '💌 Boda', 6);
}

/** Completa código, link y WhatsApp de todas las filas con nombre. Correrlo de nuevo si cambia la URL o el mensaje. */
function generarLinks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const g = ss.getSheetByName(SH.guests);
  if (!g) return;
  const last = g.getLastRow();
  if (last < 2) return;
  const cfg = readConfig(ss);
  const data = g.getRange(2, 1, last - 1, GUEST_HEADERS.length).getValues();
  const used = new Set(data.map((r) => String(r[COL.code - 1]).trim()).filter(Boolean));

  const codeLink = [];
  const waLinks = [];
  const states = [];
  data.forEach((r) => {
    const name = String(r[COL.name - 1]).trim();
    const seats = parseInt(r[COL.seats - 1], 10);
    if (!name) {
      codeLink.push([r[COL.code - 1], r[COL.link - 1]]);
      waLinks.push([richLink('', '')]);
      states.push([r[COL.state - 1]]);
      return;
    }
    let code = String(r[COL.code - 1]).trim();
    if (!code) { code = genCode(used); used.add(code); }
    const link = buildLink(cfg.url, name, seats, code);
    codeLink.push([code, link]);
    const wa = waUrl(cfg, r[COL.phone - 1], message(cfg, name, seats, link));
    waLinks.push([richLink(wa ? 'Enviar' : '', wa)]);
    states.push([r[COL.state - 1] || 'Pendiente']);
  });
  g.getRange(2, COL.code, data.length, 2).setValues(codeLink);
  g.getRange(2, COL.wa, data.length, 1).setRichTextValues(waLinks);
  g.getRange(2, COL.state, data.length, 1).setValues(states);
}

/** Al escribir nombre, pases o teléfono, se completa la fila sola. */
function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== SH.guests) return;
  if (e.range.getLastRow() < 2 || e.range.getColumn() > COL.phone) return;
  generarLinks();
}

/* ---------------- Panel de envío ---------------- */

function abrirEnvio() {
  const html = HtmlService.createHtmlOutput(SIDEBAR_HTML).setTitle('Enviar invitaciones');
  SpreadsheetApp.getUi().showSidebar(html);
}

/** Invitados con nombre que aún no tienen marcada la casilla Enviado. */
function listaPendientes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const g = ss.getSheetByName(SH.guests);
  if (!g || g.getLastRow() < 2) return [];
  const cfg = readConfig(ss);
  const data = g.getRange(2, 1, g.getLastRow() - 1, GUEST_HEADERS.length).getValues();
  const out = [];
  data.forEach((r, i) => {
    const name = String(r[COL.name - 1]).trim();
    const link = String(r[COL.link - 1]).trim();
    if (!name || !link || r[COL.sent - 1] === true) return;
    const seats = parseInt(r[COL.seats - 1], 10);
    out.push({ row: i + 2, name: name, seats: seats || '', link: link, wa: waUrl(cfg, r[COL.phone - 1], message(cfg, name, seats, link)) });
  });
  return out;
}

function marcarEnviado(row) {
  const g = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.guests);
  if (g && row >= 2) g.getRange(row, COL.sent).setValue(true);
}

const SIDEBAR_HTML = `<!doctype html>
<html><head><base target="_blank"><style>
  body { font: 14px/1.4 system-ui, sans-serif; margin: 12px; color: #1f3a2b; }
  p.note { color: #6b5d4f; font-size: 12px; margin: 0 0 12px; }
  ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  li { border: 1px solid #e6d3a8; border-radius: 10px; padding: 10px; background: #fffaf0; }
  li b { display: block; font-size: 15px; }
  li small { color: #6b5d4f; }
  .row { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  a.btn, button { font: inherit; border: 0; border-radius: 999px; padding: 7px 14px; cursor: pointer; text-decoration: none; }
  a.btn { background: #1f6b3e; color: #fff; }
  button { background: #f1e3c4; color: #1f3a2b; }
  input { width: 100%; box-sizing: border-box; margin-top: 6px; font-size: 12px; }
  .empty { text-align: center; color: #6b5d4f; padding: 24px 0; }
</style></head><body>
  <p class="note">Toca «Enviar» para abrir WhatsApp con el mensaje listo. La fila queda marcada como enviada.</p>
  <ul id="list"><li class="empty">Cargando…</li></ul>
<script>
  const list = document.getElementById('list');
  function done(li, row) { google.script.run.marcarEnviado(row); li.remove(); if (!list.children.length) empty(); }
  function empty() { list.innerHTML = '<li class="empty">No quedan invitaciones por enviar 🎉</li>'; }
  function render(items) {
    list.innerHTML = '';
    if (!items.length) return empty();
    items.forEach(function (it) {
      const li = document.createElement('li');
      const b = document.createElement('b'); b.textContent = it.name;
      const s = document.createElement('small'); s.textContent = it.seats ? it.seats + (it.seats == 1 ? ' pase' : ' pases') : '';
      const row = document.createElement('div'); row.className = 'row';
      li.append(b, s);
      if (it.wa) {
        const a = document.createElement('a'); a.className = 'btn'; a.href = it.wa; a.textContent = 'Enviar por WhatsApp';
        a.addEventListener('click', function () { setTimeout(function () { done(li, it.row); }, 300); });
        row.append(a);
      } else {
        const inp = document.createElement('input'); inp.readOnly = true; inp.value = it.link;
        inp.addEventListener('focus', function () { inp.select(); });
        li.append(inp);
        const mark = document.createElement('button'); mark.textContent = 'Ya lo envié';
        mark.addEventListener('click', function () { done(li, it.row); });
        row.append(mark);
      }
      li.append(row);
      list.append(li);
    });
  }
  google.script.run.withSuccessHandler(render).withFailureHandler(function (e) { list.innerHTML = '<li class="empty">' + e.message + '</li>'; }).listaPendientes();
</script></body></html>`;

/* ---------------- Web app: confirmaciones ---------------- */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = rsvpSheet(ss);
    if (sheet.getLastRow() === 0) sheet.appendRow(RSVP_HEADERS);
    const d = JSON.parse(e.postData.contents || '{}');
    const clean = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
    const yes = d.asiste === 'si';
    const code = clean(d.codigo, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
    sheet.appendRow([
      new Date(),
      clean(d.invitado, 60),
      clean(d.pases, 3),
      clean(d.nombre, 80),
      yes ? 'Sí' : 'No',
      clean(d.cantidad, 3),
      clean(d.alimentacion, 120),
      clean(d.cancion, 120),
      clean(d.team, 10),
      clean(d.mensaje, 500),
      code,
    ]);
    if (code) updateGuest(ss, code, yes, yes ? parseInt(d.cantidad, 10) || 0 : 0);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, info: 'RSVP Rosario & Joshua' });
}

/** Marca en Invitados la respuesta del invitado con ese código (la última respuesta manda). */
function updateGuest(ss, code, yes, count) {
  const g = ss.getSheetByName(SH.guests);
  if (!g || g.getLastRow() < 2) return;
  const codes = g.getRange(2, COL.code, g.getLastRow() - 1, 1).getValues();
  const i = codes.findIndex((r) => String(r[0]).trim().toUpperCase() === code);
  if (i < 0) return;
  g.getRange(i + 2, COL.state, 1, 3).setValues([[yes ? 'Confirmó' : 'No asiste', count, new Date()]]);
}

/* ---------------- Utilidades ---------------- */

function rsvpSheet(ss) {
  let sh = ss.getSheetByName(SH.rsvp);
  if (sh) return sh;
  const first = ss.getSheets()[0];
  if (first.getName() !== SH.guests && first.getName() !== SH.config) {
    first.setName(SH.rsvp);
    return first;
  }
  return ss.insertSheet(SH.rsvp);
}

function readConfig(ss) {
  const c = ss.getSheetByName(SH.config);
  const v = c ? c.getRange('B1:B3').getValues().map((r) => String(r[0]).trim()) : [];
  return {
    url: v[0] || DEFAULTS.url,
    message: v[1] || DEFAULTS.message,
    country: (v[2] || DEFAULTS.country).replace(/\D/g, ''),
  };
}

function genCode(used) {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  } while (used.has(code));
  return code;
}

function buildLink(base, name, seats, code) {
  const root = String(base).replace(/\/*$/, '/');
  let url = root + '?para=' + encodeURIComponent(name);
  if (seats > 0) url += '&pases=' + seats;
  return url + '&id=' + code;
}

function message(cfg, name, seats, link) {
  return cfg.message
    .replace(/\{nombre\}/g, name)
    .replace(/\{pases\}/g, seats > 0 ? String(seats) : '')
    .replace(/\{link\}/g, link);
}

function waUrl(cfg, phone, text) {
  let digits = String(phone == null ? '' : phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length <= 9) digits = cfg.country + digits;
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
}

/** Texto con enlace (no usa fórmula, así no hay límite de largo en la URL). */
function richLink(text, url) {
  const b = SpreadsheetApp.newRichTextValue().setText(text);
  if (text && url) b.setLinkUrl(url);
  return b.build();
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
