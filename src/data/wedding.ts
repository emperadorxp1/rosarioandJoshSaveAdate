// Todos los datos de la boda en un solo lugar. Edita aquí y se actualiza toda la web.

export const couple = {
  bride: 'Rosario',
  groom: 'Joshua',
  monogram: 'R&J',
};

export const parents = {
  bride: ['Gregorio García Espinoza', 'María Martínez Gonzales'],
  groom: ['Jesús Antonio Sosa Cruz', 'Ysabel Adolberta Cruz Cerrato'],
};

/** Hora de Perú (UTC-5). */
export const date = {
  iso: '2027-02-27T11:00:00-05:00',
  endIso: '2027-02-27T21:00:00-05:00',
  weekday: 'Sábado',
  day: '27',
  month: 'febrero',
  monthShort: '02',
  year: '2027',
};

export const venues = [
  {
    id: 'ceremonia',
    title: 'Ceremonia',
    place: 'Catedral de Tacna',
    time: '11:00 a. m.',
    icon: 'church',
    maps: 'https://www.google.com/maps/search/?api=1&query=Catedral+de+Tacna',
  },
  {
    id: 'recepcion',
    title: 'Recepción',
    place: 'Local de Eventos Piedra Blanca',
    time: '12:30 p. m.',
    icon: 'cheers',
    maps: 'https://www.google.com/maps/search/?api=1&query=Local+de+Eventos+Piedra+Blanca+Tacna',
  },
];

/**
 * Itinerario (las horas sin confirmed se muestran como "aprox."). Exactas: 11:00 (ceremonia religiosa), 12:30 (recepción) y 13:30 (ceremonia civil).
 * La tarde la definieron los novios; 10:30 y 12:00 siguen siendo propuesta. `at` es la hora de inicio en formato 24 h (hora de Perú).
 */
export const itinerary: { at: string; title: string; note: string; confirmed?: boolean }[] = [
  { at: '10:30', title: 'Llegada a la Catedral', note: 'Ubícate con calma; empezamos puntuales.' },
  { at: '11:00', confirmed: true, title: 'Ceremonia religiosa', note: 'Catedral de Tacna.' },
  { at: '12:00', title: 'Fotos y salida de los novios', note: 'Lluvia de pétalos en la puerta.' },
  { at: '12:30', confirmed: true, title: 'Recepción y cóctel de bienvenida', note: 'Local de Eventos Piedra Blanca.' },
  { at: '13:30', confirmed: true, title: 'Ceremonia civil', note: 'En Piedra Blanca, frente a todos ustedes.' },
  { at: '14:15', title: 'Entrada de los novios y brindis', note: 'Levanta tu copa con nosotros.' },
  { at: '14:50', title: 'Almuerzo', note: 'Sirvan con cariño, coman con ganas.' },
  { at: '15:30', title: 'Que empiece la fiesta', note: 'Cumbia, reguetón, trap y electrónica.' },
  { at: '17:00', title: 'Hora loca', note: 'Guarda energía para este momento.' },
];

export const details = {
  dressCode: 'Elegante',
  dressNote: 'Te invitamos a acompañarnos con tu mejor atuendo. Por favor, evita los tonos blanco y beige, reservados para los novios.',
  adultsOnly: 'Hemos preparado esta ocasión para compartir una velada especial entre adultos. Agradecemos de corazón tu comprensión.',
};

export const gift = {
  bank: 'Interbank',
  account: '3403111071786',
  cci: '00334001311107178678',
  note: 'Tu compañía será nuestro mejor regalo. Si deseas tener un detalle con nosotros, hemos dispuesto una opción para recibirlo con mucho cariño.',
};

export const rsvp = {
  /** URL de la Web App de Google Apps Script (ver apps-script/README.md). Vacío = aún no configurado. */
  endpoint: 'https://script.google.com/macros/s/AKfycbz2XTEsUiGwgn4VSv-Hzv_vUbgD455nTqGCACdqdWf8pFlJ98NShSLgrBjc-jehag8z/exec',
  /** Número de WhatsApp de los novios con código de país, solo dígitos. Ej: '51987654321'. Vacío = se oculta el botón. */
  whatsapp: '',
  /** Fecha límite para confirmar (texto libre). Vacío = no se muestra. */
  deadline: '',
};
