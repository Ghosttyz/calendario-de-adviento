// Invita a instalar el calendario como app en el celular:
// - Android/Chrome: botón que abre la instalación del navegador.
// - iPhone/iPad: Apple no deja instalar con un botón, así que se muestran los pasos.
// - Otros navegadores: se indica dónde está la opción en el menú.
import { esIOS, esAppInstalada } from './avisos.js';

const CLAVE_OCULTO = 'noches-terror:instalar-oculto';
const TRES_DIAS = 3 * 24 * 60 * 60 * 1000;
const ICONO_COMPARTIR = '<svg class="instalar__compartir" viewBox="0 0 24 24" aria-label="Compartir"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const esCelular = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent) || esIOS();

function ocultoRecientemente() {
  try {
    return Date.now() - Number(localStorage.getItem(CLAVE_OCULTO) || 0) < TRES_DIAS;
  } catch {
    return false;
  }
}

export function prepararInstalacion({ botonCabecera, introTerminada }) {
  const aviso = document.getElementById('instalar');
  const texto = document.getElementById('instalar-texto');
  const botonSi = document.getElementById('instalar-si');
  const botonNo = document.getElementById('instalar-no');
  let eventoInstalar = null;

  function pintar() {
    if (eventoInstalar) {
      texto.textContent = 'Tenlo en tu pantalla de inicio como una app y recibe un aviso cada noche.';
      botonSi.textContent = 'Instalar';
    } else if (esIOS()) {
      texto.innerHTML = `Toca ${ICONO_COMPARTIR} <strong>Compartir</strong> en la barra del navegador y luego <strong>«Añadir a pantalla de inicio»</strong>.`;
      botonSi.textContent = 'Entendido';
    } else {
      texto.innerHTML = 'Abre el menú <strong>⋮</strong> del navegador y elige <strong>«Instalar app»</strong> o <strong>«Agregar a pantalla de inicio»</strong>.';
      botonSi.textContent = 'Entendido';
    }
  }

  function mostrar() {
    if (esAppInstalada()) return;
    const ocupado = !document.getElementById('emergente').hidden || document.querySelector('dialog[open]');
    if (ocupado) return;
    pintar();
    aviso.hidden = false;
  }

  function cerrar(recordar) {
    aviso.hidden = true;
    if (!recordar) return;
    try {
      localStorage.setItem(CLAVE_OCULTO, String(Date.now()));
    } catch {
      // Sin almacenamiento: volverá a aparecer en la próxima visita.
    }
  }

  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    eventoInstalar = evento;
    botonCabecera.hidden = false;
    if (!aviso.hidden) pintar();
  });

  window.addEventListener('appinstalled', () => {
    eventoInstalar = null;
    botonCabecera.hidden = true;
    cerrar(false);
  });

  botonSi.addEventListener('click', async () => {
    if (!eventoInstalar) {
      cerrar(true);
      return;
    }
    eventoInstalar.prompt();
    await eventoInstalar.userChoice;
    eventoInstalar = null;
    cerrar(true);
  });

  botonNo.addEventListener('click', () => cerrar(true));
  botonCabecera.addEventListener('click', mostrar);

  if (esAppInstalada()) return;
  if (esCelular()) botonCabecera.hidden = false;
  if (esCelular() && !ocultoRecientemente()) {
    introTerminada.then(() => setTimeout(mostrar, 1500));
  }
}
