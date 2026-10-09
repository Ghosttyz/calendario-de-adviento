// Avisos diarios: notificaciones del navegador (con el service worker)
// y recordatorios en el calendario del dispositivo (.ics).

const DIAS = self.DIAS;
const AVISOS_TEMA = self.AVISOS_TEMA;
const ETIQUETA_PERIODICA = 'puerta-del-dia';

export const soportaNotificaciones = () => 'Notification' in window && 'serviceWorker' in navigator;

export const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const esAppInstalada = () =>
  matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export async function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./sw.js');
  } catch (error) {
    console.warn('No se pudo registrar el service worker', error);
  }
}

export async function activarNotificaciones() {
  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return permiso;
  const registro = await navigator.serviceWorker.ready;
  await registrarAvisoPeriodico(registro);
  await registro.showNotification('🎃 ¡Avisos activados!', {
    body: 'Te avisaré cuando se abra una puerta nueva.',
    icon: 'iconos/icono-192.png',
    badge: 'iconos/insignia-96.png',
    tag: 'avisos-activados',
  });
  return permiso;
}

// Chrome y Edge (Android y escritorio, con la app instalada) pueden despertar
// al service worker una vez al día para avisar aunque la app esté cerrada.
async function registrarAvisoPeriodico(registro) {
  if (!('periodicSync' in registro)) return false;
  try {
    const estado = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (estado.state !== 'granted') return false;
    await registro.periodicSync.register(ETIQUETA_PERIODICA, { minInterval: 12 * 60 * 60 * 1000 });
    return true;
  } catch {
    return false;
  }
}

export async function tieneAvisoPeriodico() {
  if (!('serviceWorker' in navigator)) return false;
  const registro = await navigator.serviceWorker.getRegistration();
  if (!registro || !('periodicSync' in registro)) return false;
  try {
    return (await registro.periodicSync.getTags()).includes(ETIQUETA_PERIODICA);
  } catch {
    return false;
  }
}

export async function mostrarAvisoPuerta(dia) {
  if (!soportaNotificaciones() || Notification.permission !== 'granted') return;
  const d = DIAS[dia - 1];
  const registro = await navigator.serviceWorker.ready;
  await registro.showNotification(`🎃 Noche ${d.dia}: ¡tu puerta está lista!`, {
    body: AVISOS_TEMA[d.tema],
    icon: 'iconos/icono-192.png',
    badge: 'iconos/insignia-96.png',
    tag: `puerta-${d.dia}`,
    data: { dia: d.dia },
  });
}

// ---------- Recordatorios de calendario (.ics) ----------

export function descargarRecordatorios({ anio, hora, url }) {
  const [hh, mm] = hora.split(':');
  const sello = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//31 Noches de Terror//Calendario de Halloween//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:31 Noches de Terror',
  ];
  for (const d of DIAS) {
    const fecha = `${anio}10${String(d.dia).padStart(2, '0')}`;
    const enlace = `${url}?abrir=${d.dia}`;
    const descripcion = `${AVISOS_TEMA[d.tema]} Ábrela aquí: ${enlace}`;
    lineas.push(
      'BEGIN:VEVENT',
      `UID:puerta-${anio}-${d.dia}@31-noches-de-terror`,
      `DTSTAMP:${sello}`,
      // Hora "flotante" (sin zona): suena a la misma hora local en cualquier dispositivo.
      `DTSTART:${fecha}T${hh}${mm}00`,
      'DURATION:PT15M',
      `SUMMARY:${escapar(`🎃 Noche ${d.dia} de 31: ¡abre tu puerta!`)}`,
      `DESCRIPTION:${escapar(descripcion)}`,
      `URL:${enlace}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapar(`🎃 Noche ${d.dia}: ¡tu puerta está lista!`)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lineas.push('END:VCALENDAR');

  const archivo = new Blob([lineas.map(plegar).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = '31-noches-de-terror.ics';
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 10000);
}

function escapar(texto) {
  return texto.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// El formato .ics pide líneas de máximo 75 bytes; las largas se continúan con un espacio.
function plegar(linea) {
  const codificador = new TextEncoder();
  if (codificador.encode(linea).length <= 75) return linea;
  const partes = [];
  let actual = '';
  let bytes = 0;
  let limite = 75;
  for (const caracter of linea) {
    const tamano = codificador.encode(caracter).length;
    if (bytes + tamano > limite) {
      partes.push(actual);
      actual = '';
      bytes = 0;
      limite = 74;
    }
    actual += caracter;
    bytes += tamano;
  }
  partes.push(actual);
  return partes.join('\r\n ');
}
