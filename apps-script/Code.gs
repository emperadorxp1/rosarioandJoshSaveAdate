/**
 * Recibe las confirmaciones de la invitación y las guarda en la hoja activa.
 * Ver apps-script/README.md para desplegarlo.
 */
const HEADERS = ['Fecha', 'Invitado (link)', 'Pases', 'Nombre', 'Asiste', 'Cantidad', 'Alimentación', 'Canción', 'Team', 'Mensaje'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const d = JSON.parse(e.postData.contents || '{}');
    const clean = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
    sheet.appendRow([
      new Date(),
      clean(d.invitado, 60),
      clean(d.pases, 3),
      clean(d.nombre, 80),
      d.asiste === 'si' ? 'Sí' : 'No',
      clean(d.cantidad, 3),
      clean(d.alimentacion, 120),
      clean(d.cancion, 120),
      clean(d.team, 10),
      clean(d.mensaje, 500),
    ]);
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

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
