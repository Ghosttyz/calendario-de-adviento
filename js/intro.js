// Animación de entrada (ver css/intro.css). Devuelve una promesa que se
// cumple cuando la entrada termina o la persona la salta.
// La escena espera un toque («Toca para entrar») porque los celulares
// no dejan sonar la voz del narrador ni el sonido sin una interacción.
import { murcielagoSVG } from './personajes.js';

// Solo en localhost, para probar: ?intro=no la omite y ?intro=2500 congela la escena en ese milisegundo.
const esLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const parametro = esLocal ? new URLSearchParams(location.search).get('intro') : null;

const VUELOS = [[-260, -220], [-120, -300], [40, -330], [200, -260], [310, -140], [-330, -90], [150, -390]];
const DURACION = 6600;

function narrar(lineas) {
  if (!('speechSynthesis' in window)) return;
  const voces = speechSynthesis.getVoices();
  const voz = voces.find((v) => /^es[-_](MX|US|419|CO)/i.test(v.lang)) || voces.find((v) => /^es/i.test(v.lang));
  if (voces.length && !voz) return; // el dispositivo no tiene voz en español
  speechSynthesis.cancel();
  for (const texto of lineas) {
    const frase = new SpeechSynthesisUtterance(texto);
    frase.lang = voz?.lang || 'es-MX';
    if (voz) frase.voice = voz;
    frase.rate = 0.85;
    frase.pitch = 0.6; // voz grave de narrador de cuento de miedo
    speechSynthesis.speak(frase);
  }
}

export function reproducirIntro({ omitir = false, conVoz = () => true } = {}) {
  const intro = document.getElementById('intro');
  if (!intro) return Promise.resolve();
  if (omitir || parametro === 'no') {
    intro.remove();
    return Promise.resolve();
  }

  const suave = document.documentElement.dataset.movimiento === 'suave';
  const escenario = intro.querySelector('.intro__escenario');
  // La escena mide 1000×600 y se agranda hasta cubrir la pantalla, como una foto de fondo.
  const ajustar = () => escenario.style.setProperty('--k', Math.max(innerWidth / 1000, innerHeight / 600));
  ajustar();
  addEventListener('resize', ajustar);

  if (!suave) {
    document.getElementById('intro-murcielagos').innerHTML = VUELOS
      .map(([x, y], i) => `<i style="--x:${x}px;--y:${y}px;--r:${(i % 4) * 0.08}s">${murcielagoSVG()}</i>`)
      .join('');
  }

  document.body.classList.add('con-intro');
  intro.classList.add('intro--lista');

  return new Promise((resolver) => {
    let terminada = false;
    let temporizador = 0;

    const alTeclear = (evento) => {
      if (evento.key === 'Escape') terminar(true);
    };

    function terminar(rapido) {
      if (terminada) return;
      terminada = true;
      clearTimeout(temporizador);
      removeEventListener('keydown', alTeclear);
      if (rapido && 'speechSynthesis' in window) speechSynthesis.cancel();
      intro.classList.add('intro--saliendo');
      if (rapido) intro.classList.add('intro--rapido');
      document.body.classList.remove('con-intro');
      document.body.classList.add('entrando');
      setTimeout(() => {
        removeEventListener('resize', ajustar);
        intro.remove();
        resolver();
      }, rapido ? 350 : 500);
      setTimeout(() => document.body.classList.remove('entrando'), 1900);
    }

    function empezar() {
      if (intro.classList.contains('intro--activa')) return;
      intro.classList.add('intro--activa');
      if (conVoz()) {
        narrar([...intro.querySelectorAll('.intro__texto')].map((p) => p.textContent.replace(/…/g, '')));
      }
      temporizador = setTimeout(() => terminar(false), DURACION);
    }

    document.getElementById('intro-entrar').addEventListener('click', empezar);
    document.getElementById('intro-saltar').addEventListener('click', () => terminar(true));
    addEventListener('keydown', alTeclear);

    const congelarEn = Number(parametro);
    if (parametro && Number.isFinite(congelarEn)) {
      intro.classList.add('intro--activa');
      requestAnimationFrame(() => {
        for (const animacion of document.getAnimations()) {
          if (intro.contains(animacion.effect?.target)) {
            animacion.pause();
            animacion.currentTime = congelarEn;
          }
        }
      });
    }
  });
}
