// Service worker: permite usar el calendario sin conexión y mostrar
// los avisos diarios aunque la página esté cerrada.
importScripts('js/dias.js');

const VERSION = 'noches-terror-v6';
const CACHE_ESTADO = 'noches-terror-estado';
const ARCHIVOS = [
  './',
  'index.html',
  'css/estilos.css',
  'css/panel.css',
  'css/personajes.css',
  'css/intro.css',
  'js/dias.js',
  'js/app.js',
  'js/avisos.js',
  'js/intro.js',
  'js/instalar.js',
  'js/sonido.js',
  'js/personajes.js',
  'manifest.webmanifest',
  'iconos/favicon.svg',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/insignia-96.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== VERSION && c !== CACHE_ESTADO).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

// Primero la red (para ver siempre la última versión) y, sin conexión, lo guardado.
// Las fuentes de Google no cambian, así que se sirven desde la caché.
self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    evento.respondWith(caches.match(request).then((guardada) => guardada || fetch(request).then((respuesta) => {
      const copia = respuesta.clone();
      caches.open(VERSION).then((cache) => cache.put(request, copia));
      return respuesta;
    })));
    return;
  }

  if (url.origin !== self.location.origin) return;

  evento.respondWith(fetch(request).then((respuesta) => {
    if (respuesta.ok) {
      const copia = respuesta.clone();
      const clave = request.mode === 'navigate' ? 'index.html' : request;
      caches.open(VERSION).then((cache) => cache.put(clave, copia));
    }
    return respuesta;
  }).catch(() => caches.match(request.mode === 'navigate' ? 'index.html' : request)));
});

// ---------- Avisos ----------

async function leerEstado() {
  const cache = await caches.open(CACHE_ESTADO);
  const respuesta = await cache.match('estado');
  return respuesta ? respuesta.json() : {};
}

async function guardarEstado(estado) {
  const cache = await caches.open(CACHE_ESTADO);
  await cache.put('estado', new Response(JSON.stringify(estado)));
}

function mostrarAviso(dia) {
  const d = self.DIAS[dia - 1];
  return self.registration.showNotification(`🎃 Noche ${dia}: ¡tu puerta está lista!`, {
    body: self.AVISOS_TEMA[d.tema],
    icon: 'iconos/icono-192.png',
    badge: 'iconos/insignia-96.png',
    tag: `puerta-${dia}`,
    data: { dia },
  });
}

async function avisarSiHayPuertaNueva() {
  const hoy = new Date();
  if (hoy.getMonth() !== 9) return;
  const clave = `${hoy.getFullYear()}-${hoy.getDate()}`;
  const estado = await leerEstado();
  if (estado.ultimoAviso === clave) return;
  await mostrarAviso(hoy.getDate());
  await guardarEstado({ ...estado, ultimoAviso: clave });
}

// Chrome/Edge con la app instalada: el navegador despierta al service worker cada cierto tiempo.
self.addEventListener('periodicsync', (evento) => {
  if (evento.tag === 'puerta-del-dia') evento.waitUntil(avisarSiHayPuertaNueva());
});

// Preparado para notificaciones push enviadas desde un servidor: { "dia": 5 }
self.addEventListener('push', (evento) => {
  let datos = {};
  try {
    datos = evento.data ? evento.data.json() : {};
  } catch {
    // Sin datos válidos: se avisa de la puerta de hoy.
  }
  const dia = Number(datos.dia) || new Date().getDate();
  evento.waitUntil(mostrarAviso(Math.min(31, Math.max(1, dia))));
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const dia = evento.notification.data && evento.notification.data.dia;
  const destino = new URL(dia ? `./?abrir=${dia}` : './', self.registration.scope).href;
  evento.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const abierta = ventanas.find((ventana) => ventana.url.startsWith(self.registration.scope));
    if (abierta) {
      await abierta.focus();
      if (dia) abierta.postMessage({ tipo: 'abrir', dia });
      return;
    }
    await self.clients.openWindow(destino);
  })());
});
