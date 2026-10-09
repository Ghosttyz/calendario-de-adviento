import { arte, ICONOS, murcielagoSVG } from './personajes.js';
import * as avisos from './avisos.js';
import { reproducirIntro } from './intro.js';
import { prepararInstalacion } from './instalar.js';

const introTerminada = reproducirIntro();

const DIAS = self.DIAS;

// Los textos vienen cifrados en js/dias.js (ver herramientas/cifrar-textos.ps1)
// y solo se descifran al abrir cada puerta.
const SAL = 'calabaza-31-noches';

function contenidoDe(dia) {
  const d = DIAS[dia - 1];
  if (!d.secreto) return d;
  const clave = new TextEncoder().encode(`noches-terror-${d.dia}-${SAL}`);
  const bytes = Uint8Array.from(atob(d.secreto), (c, i) => c.charCodeAt(0) ^ clave[i % clave.length]);
  return { ...d, ...JSON.parse(new TextDecoder().decode(bytes)) };
}

const esperar =(ms) => new Promise((resolver) => setTimeout(resolver, ms));

// El modo inicial lo decide index.html (sigue la preferencia del sistema o la elección guardada).
const CLAVE_EFECTOS = 'noches-terror:efectos';
const raiz = document.documentElement;
const efectosCompletos = () => raiz.dataset.movimiento !== 'suave';

// ---------- Fecha ----------
// Solo en localhost se puede simular otra fecha para probar:
//   ?fecha=2026-10-13   (y opcionalmente &hora=23:59:50 o &abiertas=1-12)

const parametros = new URLSearchParams(location.search);
const esLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const fechaPrueba = esLocal && parametros.get('fecha')
  ? new Date(`${parametros.get('fecha')}T${parametros.get('hora') || '12:00'}`)
  : null;
const modoPrueba = Boolean(fechaPrueba && !Number.isNaN(fechaPrueba.getTime()));
const desfase = modoPrueba ? fechaPrueba.getTime() - Date.now() : 0;
// Diferencia entre la hora de internet y la del dispositivo: así cambiar la fecha del celular no abre puertas.
let desfaseInternet = null;
const ahora = () => new Date(Date.now() + (modoPrueba ? desfase : desfaseInternet ?? 0));
const ANIO = ahora().getFullYear();
const inicioNoche = (dia) => new Date(ANIO, 9, dia);
const fechaLarga = (dia) => inicioNoche(dia).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
const CLAVE_VERIFICADAS = `noches-terror:${ANIO}:verificadas`;

function leerVerificadas() {
  try {
    return Number(localStorage.getItem(CLAVE_VERIFICADAS)) || 0;
  } catch {
    return 0;
  }
}

function puertasDisponibles(fecha = ahora()) {
  let disponibles = fecha.getDate();
  if (fecha.getFullYear() > ANIO || fecha.getMonth() > 9) disponibles = 31;
  else if (fecha.getMonth() < 9) disponibles = 0;
  if (modoPrueba || desfaseInternet !== null) return disponibles;
  // Sin la hora de internet (por ejemplo, sin conexión) no se abren más puertas que las ya comprobadas.
  return Math.min(disponibles, leerVerificadas());
}

async function sincronizarHora() {
  if (modoPrueba) return;
  try {
    const respuesta = await fetch(`manifest.webmanifest?hora=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
    const hora = Date.parse(respuesta.headers.get('Date'));
    if (Number.isNaN(hora)) return;
    desfaseInternet = hora - Date.now();
    localStorage.setItem(CLAVE_VERIFICADAS, String(Math.max(leerVerificadas(), puertasDisponibles())));
  } catch {
    // Sin conexión o sin almacenamiento: se usan las puertas ya comprobadas.
  }
}

// ---------- Puertas abiertas (se guardan en este dispositivo) ----------

const CLAVE_ABIERTAS = `noches-terror:${modoPrueba ? 'prueba' : ANIO}:abiertas`;
const abiertas = leerAbiertas();

function leerAbiertas() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE_ABIERTAS)) || []);
  } catch {
    return new Set();
  }
}

function guardarAbiertas() {
  try {
    localStorage.setItem(CLAVE_ABIERTAS, JSON.stringify([...abiertas]));
  } catch {
    // Sin almacenamiento (p. ej. modo privado): las puertas se abren igual, pero no se recuerdan.
  }
}

if (modoPrueba && parametros.has('abiertas')) {
  const [desde, hasta] = parametros.get('abiertas').split('-').map(Number);
  for (let dia = desde; dia <= (hasta || desde); dia++) abiertas.add(dia);
}

// ---------- Cielo ----------

function poblarCielo() {
  let semilla = 7;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  const estrellas = document.createDocumentFragment();
  for (let i = 0; i < 70; i++) {
    const estrella = document.createElement('i');
    estrella.style.left = `${azar() * 100}%`;
    estrella.style.top = `${azar() * 70}%`;
    estrella.style.setProperty('--d', `${2 + azar() * 4}s`);
    estrella.style.setProperty('--r', `${-azar() * 6}s`);
    if (azar() > 0.8) estrella.style.width = estrella.style.height = '3px';
    estrellas.append(estrella);
  }
  document.getElementById('estrellas').append(estrellas);

  document.getElementById('murcielagos').innerHTML = [
    { y: '14%', dur: 17, retraso: -2, escala: 0.9 },
    { y: '26%', dur: 23, retraso: -11, escala: 0.6 },
    { y: '8%', dur: 29, retraso: -19, escala: 0.5 },
    { y: '34%', dur: 20, retraso: -7, escala: 0.75 },
  ].map((m) => `<div class="murcielago" style="--y:${m.y};--dur:${m.dur}s;--retraso:${m.retraso}s;--escala:${m.escala}">${murcielagoSVG()}</div>`).join('');
}

// ---------- Puertas ----------

const calendario = document.getElementById('calendario');

const hojaHTML = (clase, contenido) =>
  `<span class="puerta__hoja ${clase}"><span class="puerta__cara puerta__cara--frente">${contenido}<span class="puerta__pomo"></span></span><span class="puerta__cara puerta__cara--dorso"></span></span>`;

function crearPuerta(d) {
  const item = document.createElement('li');
  item.className = d.tema === 'final' ? 'calendario__item calendario__item--final' : 'calendario__item';
  item.style.setProperty('--i', d.dia); // orden de llegada al terminar la intro
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = `puerta puerta--${d.tema}`;
  boton.dataset.dia = d.dia;
  const candado = `<span class="puerta__candado">${ICONOS.candado}</span>`;
  const hojas = d.tema === 'final'
    ? hojaHTML('puerta__hoja--izq', `<span class="puerta__icono">${ICONOS.final}</span><span class="puerta__numero">31</span>`)
      + hojaHTML('puerta__hoja--der', `<span class="puerta__rotulo">Noche de Halloween</span>${candado}`)
    : hojaHTML('', `<span class="puerta__icono">${ICONOS[d.tema]}</span><span class="puerta__numero">${d.dia}</span>${candado}`);
  boton.innerHTML = `<span class="puerta__interior"></span>${hojas}`;
  item.append(boton);
  return item;
}

function etiqueta(dia, bloqueada, abierta) {
  if (bloqueada) return `Noche ${dia}: se abre el ${dia} de octubre`;
  return abierta ? `Noche ${dia}: abierta, toca para volver a leerla` : `Noche ${dia}: ¡lista para abrir!`;
}

function actualizarPuertas() {
  const disponibles = puertasDisponibles();
  const hoy = ahora().getMonth() === 9 ? ahora().getDate() : 0;
  for (const boton of calendario.querySelectorAll('.puerta')) {
    const dia = Number(boton.dataset.dia);
    const bloqueada = dia > disponibles;
    const abierta = !bloqueada && abiertas.has(dia);
    boton.classList.toggle('puerta--bloqueada', bloqueada);
    boton.classList.toggle('puerta--disponible', !bloqueada && !abierta);
    boton.classList.toggle('puerta--abierta', abierta);
    boton.setAttribute('aria-label', etiqueta(dia, bloqueada, abierta));

    const interior = boton.querySelector('.puerta__interior');
    if (abierta && !interior.firstChild) interior.innerHTML = arte(DIAS[dia - 1].tema);

    let cinta = boton.querySelector('.puerta__cinta');
    if (dia === hoy && !cinta) {
      cinta = document.createElement('span');
      cinta.className = 'puerta__cinta';
      cinta.textContent = 'HOY';
      boton.append(cinta);
    } else if (dia !== hoy && cinta) {
      cinta.remove();
    }
  }
}

// ---------- Cabecera y cuenta regresiva ----------

const estado = document.getElementById('estado');
const cuentaRegresiva = document.getElementById('cuenta-regresiva');

function formatoCuenta(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const dias = Math.floor(total / 86400);
  const dos = (n) => String(n).padStart(2, '0');
  const reloj = `${dos(Math.floor((total % 86400) / 3600))}:${dos(Math.floor((total % 3600) / 60))}:${dos(total % 60)}`;
  return dias ? `${dias} ${dias === 1 ? 'día' : 'días'} y ${reloj}` : reloj;
}

function actualizarCabecera() {
  const fecha = ahora();
  const disponibles = puertasDisponibles(fecha);
  const cuantas = [...abiertas].filter((dia) => dia <= disponibles).length;
  let objetivo = null;
  if (disponibles === 0) {
    estado.textContent = '🕯️ Las puertas se abren el 1 de octubre.';
    objetivo = inicioNoche(1);
  } else if (disponibles < 31) {
    estado.textContent = `🎃 Noche ${disponibles} de 31 · Has abierto ${cuantas} ${cuantas === 1 ? 'puerta' : 'puertas'}`;
    objetivo = inicioNoche(disponibles + 1);
  } else if (cuantas === 31) {
    estado.textContent = '👻 ¡Feliz Halloween! Abriste las 31 puertas.';
  } else if (fecha.getMonth() === 9) {
    estado.textContent = '👻 ¡Hoy es Halloween! Ya puedes abrir la última puerta.';
  } else {
    estado.textContent = '🦇 Octubre terminó, pero puedes volver a leer todas las puertas.';
  }
  const inicio = disponibles === 0 ? 'La primera puerta' : 'La próxima puerta';
  cuentaRegresiva.textContent = [
    objetivo ? `${inicio} se abre en ${formatoCuenta(objetivo - fecha)}` : '',
    modoPrueba ? 'modo prueba' : '',
  ].filter(Boolean).join(' · ');
}

let ultimasDisponibles = puertasDisponibles();

function cadaSegundo() {
  const disponibles = puertasDisponibles();
  if (disponibles !== ultimasDisponibles) {
    ultimasDisponibles = disponibles;
    actualizarPuertas();
    if (disponibles > 0) {
      mostrarAvisoFlotante(`🎃 ¡Se abrió la puerta ${disponibles}!`);
      avisos.mostrarAvisoPuerta(disponibles).catch(() => {});
    }
  }
  actualizarCabecera();
}

// ---------- Abrir una puerta ----------

const relampago = document.getElementById('relampago');
const revelacion = document.getElementById('revelacion');
const TEXTO_REVELACION = {
  scream: 'Ring… ring…',
  jack: '¡Buuu!',
  jason: 'Ya viene…',
  freddy: 'No te duermas…',
  final: '¡Feliz Halloween!',
};
let abriendo = false;

calendario.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.puerta');
  if (!boton) return;
  const dia = Number(boton.dataset.dia);
  if (dia > puertasDisponibles()) avisarBloqueada(boton, dia);
  else if (abiertas.has(dia)) mostrarPanel(dia);
  else abrirPuerta(boton, dia);
});

function avisarBloqueada(boton, dia) {
  boton.classList.remove('puerta--sacudir');
  void boton.offsetWidth; // reinicia la animación
  boton.classList.add('puerta--sacudir');
  const faltan = Math.ceil((inicioNoche(dia) - ahora()) / 86400000);
  mostrarAvisoFlotante(`🔒 Esta puerta se abre el ${dia} de octubre (${faltan === 1 ? '¡mañana!' : `faltan ${faltan} días`})`);
}

async function abrirPuerta(boton, dia) {
  if (abriendo) return;
  abriendo = true;
  const { tema } = DIAS[dia - 1];
  const interior = boton.querySelector('.puerta__interior');
  if (!interior.firstChild) interior.innerHTML = arte(tema);
  const conAnimacion = efectosCompletos();
  if (conAnimacion) {
    boton.classList.add('puerta--abriendo');
    await esperar(450);
    boton.classList.remove('puerta--abriendo');
    relampago.classList.remove('relampago--activo');
    void relampago.offsetWidth;
    relampago.classList.add('relampago--activo');
  }
  abiertas.add(dia);
  guardarAbiertas();
  actualizarPuertas();
  actualizarCabecera();
  if (conAnimacion) {
    await esperar(700);
    await revelar(tema);
  } else {
    await esperar(550); // deja ver cómo se abre la puerta
  }
  mostrarPanel(dia);
  abriendo = false;
}

function efecto(tema) {
  if (tema === 'scream') return '<div class="efecto-ondas"><i></i><i></i><i></i></div>';
  if (tema === 'jason') return '<div class="efecto-brillo"></div><div class="efecto-niebla"></div>';
  if (tema === 'freddy') {
    const zarpazos = [[14, 6, 54, 94], [26, 4, 66, 92], [38, 2, 78, 90], [50, 0, 90, 88]]
      .map(([x1, y1, x2, y2]) => `<path pathLength="1" d="M${x1} ${y1}Q${(x1 + x2) / 2 + 8} ${(y1 + y2) / 2 - 4} ${x2} ${y2}"/>`)
      .join('');
    return `<div class="efecto-fuego"></div><svg class="efecto-zarpazo" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${zarpazos}</svg>`;
  }
  const murcielagos = Array.from({ length: 12 }, (_, i) =>
    `<i style="--a:${i * 30 + (i % 2) * 12}deg;--r:${(i % 4) * 0.07}s">${murcielagoSVG()}</i>`).join('');
  return `<div class="efecto-luna"></div><div class="efecto-murcielagos">${murcielagos}</div>`;
}

async function revelar(tema) {
  revelacion.dataset.tema = tema;
  revelacion.innerHTML = `${efecto(tema)}<div class="revelacion__arte">${arte(tema)}</div><p class="revelacion__texto">${TEXTO_REVELACION[tema]}</p>`;
  revelacion.hidden = false;
  await esperar(2000);
  revelacion.classList.add('revelacion--saliendo');
  setTimeout(() => {
    revelacion.hidden = true;
    revelacion.classList.remove('revelacion--saliendo');
    revelacion.replaceChildren();
  }, 450);
}

// ---------- Panel con el escrito del día ----------

const panel = document.getElementById('panel');

function mostrarPanel(dia) {
  const d = contenidoDe(dia);
  panel.dataset.tema = d.tema;
  document.getElementById('panel-arte').innerHTML = arte(d.tema);
  document.getElementById('panel-fecha').textContent = `Noche ${d.dia} · ${fechaLarga(d.dia)}`;
  document.getElementById('panel-titulo').textContent = d.titulo;
  document.getElementById('panel-texto').replaceChildren(...d.texto.split(/\n\s*\n/).map((parrafo) => {
    const p = document.createElement('p');
    p.textContent = parrafo;
    return p;
  }));
  rellenarCaja('panel-dato', '🕯️ Dato curioso', d.dato);
  rellenarCaja('panel-reto', '🎯 Reto del día', d.reto);
  rellenarCaja('panel-pareja', '💑 En pareja', d.pareja);
  if (!panel.open) panel.showModal();
  panel.scrollTop = 0;
}

function rellenarCaja(id, titulo, texto) {
  const caja = document.getElementById(id);
  caja.replaceChildren();
  if (!texto) return;
  const encabezado = document.createElement('strong');
  encabezado.textContent = titulo;
  caja.append(encabezado, texto);
}

function cerrarDialogo(dialogo) {
  if (!dialogo.open || dialogo.classList.contains('panel--cerrando')) return;
  if (!efectosCompletos()) {
    dialogo.close();
    return;
  }
  dialogo.classList.add('panel--cerrando');
  const alTerminar = (evento) => {
    if (evento.target !== dialogo) return;
    dialogo.removeEventListener('animationend', alTerminar);
    dialogo.classList.remove('panel--cerrando');
    dialogo.close();
  };
  dialogo.addEventListener('animationend', alTerminar);
}

for (const dialogo of document.querySelectorAll('dialog')) {
  dialogo.addEventListener('cancel', (evento) => {
    evento.preventDefault();
    cerrarDialogo(dialogo);
  });
  dialogo.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-cerrar]')) {
      cerrarDialogo(dialogo);
      return;
    }
    if (evento.target !== dialogo) return;
    const caja = dialogo.getBoundingClientRect();
    const fuera = evento.clientX < caja.left || evento.clientX > caja.right
      || evento.clientY < caja.top || evento.clientY > caja.bottom;
    if (fuera) cerrarDialogo(dialogo);
  });
}

// ---------- Panel de avisos ----------

const panelAvisos = document.getElementById('panel-avisos');
const horaAviso = document.getElementById('avisos-hora');
const CLAVE_HORA = 'noches-terror:hora-aviso';

try {
  horaAviso.value = localStorage.getItem(CLAVE_HORA) || horaAviso.value;
} catch {
  // Se usa la hora por defecto.
}

horaAviso.addEventListener('change', () => {
  try {
    localStorage.setItem(CLAVE_HORA, horaAviso.value);
  } catch {
    // No pasa nada si no se puede recordar.
  }
});

async function actualizarEstadoAvisos() {
  const texto = document.getElementById('avisos-estado');
  const activar = document.getElementById('avisos-activar');
  const probar = document.getElementById('avisos-probar');
  const iosSinInstalar = avisos.esIOS() && !avisos.esAppInstalada();
  document.getElementById('avisos-ios').hidden = !iosSinInstalar;
  texto.className = '';
  activar.hidden = true;
  probar.hidden = true;

  if (!avisos.soportaNotificaciones()) {
    texto.textContent = iosSinInstalar
      ? 'En iPhone y iPad las notificaciones solo funcionan con el calendario instalado en la pantalla de inicio.'
      : 'Este navegador no permite notificaciones. Usa los recordatorios de calendario de abajo.';
  } else if (Notification.permission === 'denied') {
    texto.textContent = 'Las notificaciones están bloqueadas para este sitio. Puedes permitirlas en los ajustes del navegador.';
    texto.className = 'estado-mal';
  } else if (Notification.permission === 'granted') {
    texto.className = 'estado-ok';
    texto.textContent = (await avisos.tieneAvisoPeriodico())
      ? '✅ Activadas. Este dispositivo te avisará una vez al día, aunque el calendario esté cerrado (el sistema elige la hora exacta).'
      : '✅ Activadas mientras el calendario esté abierto. Para recibir avisos con la app cerrada, agrega los recordatorios de calendario.';
    probar.hidden = false;
  } else {
    texto.textContent = 'Recibe un aviso en este dispositivo cuando se abra una puerta nueva.';
    activar.hidden = false;
  }
}

document.getElementById('boton-avisos').addEventListener('click', () => {
  panelAvisos.showModal();
  actualizarEstadoAvisos();
});

document.getElementById('avisos-activar').addEventListener('click', async () => {
  const permiso = await avisos.activarNotificaciones();
  if (permiso !== 'granted') mostrarAvisoFlotante('No se activaron las notificaciones.');
  actualizarEstadoAvisos();
});

document.getElementById('avisos-probar').addEventListener('click', () => {
  avisos.mostrarAvisoPuerta(Math.min(31, Math.max(1, puertasDisponibles()))).catch(() => {});
});

document.getElementById('avisos-ics').addEventListener('click', () => {
  avisos.descargarRecordatorios({ anio: ANIO, hora: horaAviso.value || '08:00', url: location.origin + location.pathname });
  mostrarAvisoFlotante('📅 Abre el archivo descargado para agregar los 31 recordatorios.');
});

// ---------- Otros controles ----------

const avisoFlotante = document.getElementById('aviso-flotante');
let temporizadorAviso;

function mostrarAvisoFlotante(texto) {
  avisoFlotante.textContent = texto;
  avisoFlotante.classList.add('aviso-flotante--visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => avisoFlotante.classList.remove('aviso-flotante--visible'), 3400);
}

document.getElementById('boton-hoy').addEventListener('click', () => {
  const disponibles = puertasDisponibles();
  const boton = calendario.querySelector(`.puerta[data-dia="${Math.max(1, disponibles)}"]`);
  boton.scrollIntoView({ behavior: efectosCompletos() ? 'smooth' : 'auto', block: 'center' });
  boton.focus({ preventScroll: true });
  if (disponibles === 0) mostrarAvisoFlotante('🕯️ Octubre todavía no empieza. ¡Paciencia!');
});

const botonEfectos = document.getElementById('boton-efectos');

function pintarBotonEfectos() {
  const completos = efectosCompletos();
  botonEfectos.textContent = completos ? '✨ Efectos: completos' : '✨ Efectos: suaves';
  botonEfectos.setAttribute('aria-pressed', String(completos));
}

botonEfectos.addEventListener('click', () => {
  raiz.dataset.movimiento = efectosCompletos() ? 'suave' : 'completo';
  try {
    localStorage.setItem(CLAVE_EFECTOS, raiz.dataset.movimiento);
  } catch {
    // Vale solo para esta visita.
  }
  pintarBotonEfectos();
  mostrarAvisoFlotante(efectosCompletos()
    ? '✨ Efectos completos: relámpagos, sustos y murciélagos.'
    : '🕯️ Efectos suaves: sin destellos ni sustos a pantalla completa.');
});

pintarBotonEfectos();

// Enlaces directos (?abrir=5) desde notificaciones y recordatorios.
function abrirDesdeEnlace(dia) {
  if (!(dia >= 1 && dia <= 31)) return;
  const boton = calendario.querySelector(`.puerta[data-dia="${dia}"]`);
  if (dia > puertasDisponibles()) {
    avisarBloqueada(boton, dia);
    return;
  }
  boton.scrollIntoView({ block: 'center' });
  if (abiertas.has(dia)) mostrarPanel(dia);
  else abrirPuerta(boton, dia);
}

navigator.serviceWorker?.addEventListener('message', (evento) => {
  if (evento.data?.tipo === 'abrir') abrirDesdeEnlace(Number(evento.data.dia));
});

// ---------- Inicio ----------

poblarCielo();
calendario.append(...DIAS.map(crearPuerta));
document.getElementById('anio').textContent = ANIO;
actualizarPuertas();
actualizarCabecera();
setInterval(cadaSegundo, 1000);
sincronizarHora().then(() => {
  ultimasDisponibles = puertasDisponibles();
  actualizarPuertas();
  actualizarCabecera();
});
avisos.registrarServiceWorker();
prepararInstalacion({ botonCabecera: document.getElementById('boton-instalar'), introTerminada });

const diaEnlace = Number(parametros.get('abrir'));
if (diaEnlace) {
  parametros.delete('abrir');
  const resto = parametros.toString();
  history.replaceState(null, '', location.pathname + (resto ? `?${resto}` : ''));
  introTerminada.then(() => setTimeout(() => abrirDesdeEnlace(diaEnlace), 400));
}
