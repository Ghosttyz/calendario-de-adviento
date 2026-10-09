// Sonido de fondo: ambientes suaves y sin música, generados en el navegador
// (no se descarga ningún archivo de audio).

export const AMBIENTES = {
  bosque: { nombre: '🌲 Bosque de noche', descripcion: 'Viento suave, grillos y, de vez en cuando, una lechuza.' },
  viento: { nombre: '🌬️ Viento entre los árboles', descripcion: 'Ráfagas que suben y bajan, con algún crujido de ramas.' },
  mansion: { nombre: '🏚️ Mansión embrujada', descripcion: 'Un zumbido grave, puertas que crujen y truenos muy lejanos.' },
  tormenta: { nombre: '🌧️ Tormenta lejana', descripcion: 'Lluvia constante con truenos a lo lejos.' },
};

let ctx = null;
let salida = null;
let bufferRuido = null;
let actual = null;
let volumen = 0.4;

const azar = (min, max) => min + Math.random() * (max - min);

function contexto() {
  if (!ctx) {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    ctx = new Contexto();
    salida = ctx.createGain();
    salida.gain.value = volumen * 0.6;
    salida.connect(ctx.destination);
    const muestras = ctx.sampleRate * 4;
    bufferRuido = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = bufferRuido.getChannelData(0);
    for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

// Cada ambiente tiene su propio "bus" para poder apagarlo suavemente.
function nuevoAmbiente() {
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
  bus.connect(salida);
  return { bus, nodos: [], temporizadores: [] };
}

function ruido(amb) {
  const fuente = ctx.createBufferSource();
  fuente.buffer = bufferRuido;
  fuente.loop = true;
  fuente.start();
  amb.nodos.push(fuente);
  return fuente;
}

function oscilacion(amb, parametro, frecuencia, profundidad) {
  const lfo = ctx.createOscillator();
  lfo.frequency.value = frecuencia;
  const cantidad = ctx.createGain();
  cantidad.gain.value = profundidad;
  lfo.connect(cantidad).connect(parametro);
  lfo.start();
  amb.nodos.push(lfo);
}

function filtro(tipo, frecuencia, q = 1) {
  const f = ctx.createBiquadFilter();
  f.type = tipo;
  f.frequency.value = frecuencia;
  f.Q.value = q;
  return f;
}

function repetir(amb, sonido, minSeg, maxSeg) {
  const siguiente = () => {
    sonido(amb);
    amb.temporizadores.push(setTimeout(siguiente, azar(minSeg, maxSeg) * 1000));
  };
  amb.temporizadores.push(setTimeout(siguiente, azar(minSeg / 2, maxSeg / 2) * 1000));
}

// ---------- Piezas ----------

function viento(amb, fuerza) {
  const pasa = filtro('bandpass', 420, 0.7);
  const g = ctx.createGain();
  g.gain.value = 0.45 * fuerza;
  oscilacion(amb, pasa.frequency, 0.06, 260);
  oscilacion(amb, g.gain, 0.045, 0.3 * fuerza);
  ruido(amb).connect(pasa).connect(g).connect(amb.bus);
}

function grillo(amb) {
  const t = ctx.currentTime;
  for (let n = 0; n < 2; n++) {
    const o = ctx.createOscillator();
    o.frequency.value = azar(3900, 4600);
    const g = ctx.createGain();
    g.gain.value = 0;
    const inicio = t + n * azar(0.3, 0.6);
    for (let i = 0; i < 3; i++) {
      const s = inicio + i * 0.055;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.025, s + 0.01);
      g.gain.linearRampToValueAtTime(0, s + 0.04);
    }
    o.connect(g).connect(amb.bus);
    o.start(inicio);
    o.stop(inicio + 0.3);
  }
}

function lechuza(amb) {
  const t = ctx.currentTime;
  const pasa = filtro('lowpass', 900);
  pasa.connect(amb.bus);
  [[0, 0.32], [0.55, 0.8]].forEach(([desde, dura]) => {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(410, t + desde);
    o.frequency.linearRampToValueAtTime(355, t + desde + dura);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t + desde);
    g.gain.linearRampToValueAtTime(0.07, t + desde + 0.08);
    g.gain.linearRampToValueAtTime(0, t + desde + dura);
    o.connect(g).connect(pasa);
    o.start(t + desde);
    o.stop(t + desde + dura + 0.05);
  });
}

function trueno(amb, fuerza = 1) {
  const t = ctx.currentTime;
  const fuente = ctx.createBufferSource();
  fuente.buffer = bufferRuido;
  const pasa = filtro('lowpass', 140);
  const g = ctx.createGain();
  const dura = azar(3, 5);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.55 * fuerza, t + azar(0.3, 0.8));
  g.gain.exponentialRampToValueAtTime(0.001, t + dura);
  fuente.connect(pasa).connect(g).connect(amb.bus);
  fuente.start(t, Math.random() * 3);
  fuente.stop(t + dura);
}

function crujido(amb, fuerza = 1) {
  const t = ctx.currentTime;
  const dura = azar(0.6, 1.3);
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(azar(60, 90), t);
  o.frequency.linearRampToValueAtTime(azar(110, 160), t + dura);
  const pasa = filtro('bandpass', 850, 9);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09 * fuerza, t + 0.15);
  g.gain.linearRampToValueAtTime(0, t + dura);
  o.connect(pasa).connect(g).connect(amb.bus);
  o.start(t);
  o.stop(t + dura + 0.05);
}

function dron(amb) {
  const pasa = filtro('lowpass', 260);
  const g = ctx.createGain();
  g.gain.value = 0.16;
  oscilacion(amb, pasa.frequency, 0.04, 120);
  pasa.connect(g).connect(amb.bus);
  [55, 55.35, 82.6].forEach((frecuencia) => {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = frecuencia;
    o.connect(pasa);
    o.start();
    amb.nodos.push(o);
  });
}

function lluvia(amb) {
  const alto = filtro('highpass', 900);
  const bajo = filtro('lowpass', 7000);
  const g = ctx.createGain();
  g.gain.value = 0.2;
  oscilacion(amb, g.gain, 0.03, 0.04);
  ruido(amb).connect(alto).connect(bajo).connect(g).connect(amb.bus);
}

const CONSTRUIR = {
  bosque(amb) {
    viento(amb, 0.45);
    repetir(amb, grillo, 0.8, 2.2);
    repetir(amb, lechuza, 14, 28);
  },
  viento(amb) {
    viento(amb, 1);
    repetir(amb, (a) => crujido(a, 0.6), 9, 20);
  },
  mansion(amb) {
    dron(amb);
    viento(amb, 0.3);
    repetir(amb, crujido, 7, 16);
    repetir(amb, (a) => trueno(a, 0.6), 22, 40);
  },
  tormenta(amb) {
    lluvia(amb);
    repetir(amb, trueno, 12, 26);
  },
};

// ---------- Control ----------

function apagar(amb) {
  amb.temporizadores.forEach(clearTimeout);
  amb.bus.gain.cancelScheduledValues(ctx.currentTime);
  amb.bus.gain.setValueAtTime(amb.bus.gain.value, ctx.currentTime);
  amb.bus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => {
    amb.nodos.forEach((nodo) => {
      try { nodo.stop(); } catch { /* ya estaba detenido */ }
    });
    amb.bus.disconnect();
  }, 900);
}

export function reproducir(nombre) {
  if (!CONSTRUIR[nombre]) return;
  contexto();
  ctx.resume();
  if (actual) apagar(actual.amb);
  const amb = nuevoAmbiente();
  CONSTRUIR[nombre](amb);
  actual = { nombre, amb };
}

export function detener() {
  if (!actual) return;
  apagar(actual.amb);
  actual = null;
}

export function sonando() {
  return actual?.nombre ?? null;
}

export function fijarVolumen(valor) {
  volumen = valor;
  if (salida) salida.gain.setTargetAtTime(volumen * 0.6, ctx.currentTime, 0.1);
}

// Sin sonido cuando la app queda en segundo plano.
document.addEventListener('visibilitychange', () => {
  if (!ctx || !actual) return;
  if (document.hidden) ctx.suspend();
  else ctx.resume();
});
