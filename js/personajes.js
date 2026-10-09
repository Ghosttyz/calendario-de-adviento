// Ilustraciones SVG originales (estilo fan art) de cada personaje.
// Cada dibujo recibe un id único para que sus degradados no choquen
// cuando el mismo personaje aparece varias veces en la página.

let contador = 0;
const nuevoId = (prefijo) => `${prefijo}-${++contador}`;

const MURCIELAGO = '<path class="ala ala--izq" d="M30 14C24 6 14 4 2 8c6 2 8 6 6 10 4-2 8 0 10 4 4-4 8-4 12-2Z"/><path class="ala ala--der" d="M34 14c6-8 16-10 28-6-6 2-8 6-6 10-4-2-8 0-10 4-4-4-8-4-12-2Z"/><ellipse cx="32" cy="17" rx="4.5" ry="6.5"/><path d="M28.5 12 30 6.5l2 4 2-4 1.5 5.5Z"/>';

export const murcielagoSVG = () => `<svg viewBox="0 0 64 32" aria-hidden="true">${MURCIELAGO}</svg>`;

function scream(id) {
  return `
  <defs>
    <radialGradient id="${id}-m" cx="48%" cy="36%" r="68%">
      <stop offset="0" stop-color="#fff"/><stop offset=".65" stop-color="#ece8df"/><stop offset="1" stop-color="#c9c2b4"/>
    </radialGradient>
  </defs>
  <path d="M34 200c4-46 22-76 66-84 44 8 62 38 66 84Z" fill="#0b0b0e"/>
  <path d="M60 200c6-34 18-54 40-60 22 6 34 26 40 60Z" fill="#15151b"/>
  <g class="gf-cabeza">
    <path d="M100 16C54 16 36 58 40 106c2 24 10 42 22 54h76c12-12 20-30 22-54 4-48-14-90-60-90Z" fill="#111116"/>
    <path d="M100 28C66 28 54 62 57 100c2 22 10 38 21 48h44c11-10 19-26 21-48 3-38-9-72-43-72Z" fill="#040405"/>
    <path d="M100 36c24 0 36 20 34 46-2 18-10 26-10 42 0 22-10 36-24 36s-24-14-24-36c0-16-8-24-10-42-2-26 10-46 34-46Z" fill="url(#${id}-m)"/>
    <g class="gf-ojos" fill="#0a0a0a">
      <path d="M94 66c5 10 2 26-8 33-8 5-14-3-11-13 3-10 11-20 19-20Z"/>
      <path d="M106 66c-5 10-2 26 8 33 8 5 14-3 11-13-3-10-11-20-19-20Z"/>
    </g>
    <path class="gf-boca" d="M100 108c8 0 12 14 11 26s-5 18-11 18-10-6-11-18 3-26 11-26Z" fill="#0a0a0a"/>
    <path d="M97 100q3 5 6 0" stroke="#b3ab9c" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
  <g class="gf-telefono">
    <rect x="140" y="80" width="16" height="36" rx="4" fill="#1d1d24" stroke="#44444f" stroke-width="2"/>
    <rect x="144" y="86" width="8" height="10" rx="1.5" fill="#7ee8ff" opacity=".85"/>
    <path d="M144 102h8M144 107h8M144 112h8" stroke="#44444f" stroke-width="1.5"/>
    <path d="M152 80V70" stroke="#44444f" stroke-width="3" stroke-linecap="round"/>
    <path d="M128 124c4-12 16-16 26-10l4 20c-10 8-24 6-30-10Z" fill="#0b0b0e"/>
  </g>
  <g fill="none" stroke="#f4f1ea" stroke-width="3" stroke-linecap="round">
    <path class="gf-onda" d="M164 84q7 8 0 16"/>
    <path class="gf-onda gf-onda--2" d="M171 77q12 15 0 30"/>
  </g>`;
}

function jack(id) {
  return `
  <defs>
    <radialGradient id="${id}-l" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="#fffbe6"/><stop offset=".75" stop-color="#f3e8b0"/><stop offset="1" stop-color="#e2d38a"/>
    </radialGradient>
    <radialGradient id="${id}-c" cx="42%" cy="34%" r="70%">
      <stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#eeeae2"/><stop offset="1" stop-color="#cbc5ba"/>
    </radialGradient>
    <clipPath id="${id}-t"><path d="M50 200c4-30 20-46 50-50 30 4 46 20 50 50Z"/></clipPath>
  </defs>
  <circle class="jk-luna" cx="100" cy="92" r="76" fill="url(#${id}-l)"/>
  <g fill="#1a0f2e">
    <g class="jk-murcielago"><svg x="16" y="24" width="36" height="18" viewBox="0 0 64 32">${MURCIELAGO}</svg></g>
    <g class="jk-murcielago jk-murcielago--2"><svg x="150" y="40" width="28" height="14" viewBox="0 0 64 32">${MURCIELAGO}</svg></g>
  </g>
  <path d="M95 132h10v22H95Z" fill="#d8d3c8"/>
  <path d="M50 200c4-30 20-46 50-50 30 4 46 20 50 50Z" fill="#121214"/>
  <g clip-path="url(#${id}-t)" stroke="#3a3a42" stroke-width="1.6">
    <path d="M62 150v50M74 150v50M86 150v50M114 150v50M126 150v50M138 150v50"/>
  </g>
  <path d="M89 150l11 20 11-20Z" fill="#ebe7de"/>
  <g fill="#0b0b0b">
    <path class="jk-ala jk-ala--izq" d="M100 160c-8-8-20-10-28-6 4 2 6 6 4 10 4-2 8 0 10 4 4-4 10-4 14-8Z"/>
    <path class="jk-ala jk-ala--der" d="M100 160c8-8 20-10 28-6-4 2-6 6-4 10-4-2-8 0-10 4-4-4-10-4-14-8Z"/>
    <circle cx="100" cy="160" r="4.5"/>
  </g>
  <g class="jk-cabeza">
    <path d="M100 38c36 0 52 24 50 52-2 26-22 46-50 48-28-2-48-22-50-48-2-28 14-52 50-52Z" fill="url(#${id}-c)"/>
    <g class="jk-ojos" fill="#0b0b0b">
      <ellipse cx="80" cy="82" rx="12.5" ry="16.5" transform="rotate(14 80 82)"/>
      <ellipse cx="120" cy="82" rx="12.5" ry="16.5" transform="rotate(-14 120 82)"/>
    </g>
    <path d="M96 102l2 6M104 102l-2 6" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round"/>
    <g fill="none" stroke="#1a1a1a" stroke-linecap="round">
      <path d="M62 110q38 24 76 0" stroke-width="2.6"/>
      <path d="M70 109.5v10M79 113.3v10M88 115.8v10M96 116.9v10M104 116.9v10M112 115.8v10M121 113.3v10M130 109.5v10" stroke-width="1.8"/>
      <path d="M59 105q-3 6 2 11M141 105q3 6-2 11" stroke-width="2"/>
    </g>
  </g>`;
}

function jason(id) {
  const agujeros = [[86, 100], [94, 100], [106, 100], [114, 100], [80, 112], [90, 112], [100, 112], [110, 112], [120, 112],
    [84, 124], [94, 124], [106, 124], [116, 124], [90, 136], [100, 136], [110, 136], [95, 147], [105, 147], [84, 60], [116, 60]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('');
  return `
  <defs>
    <radialGradient id="${id}-m" cx="44%" cy="34%" r="72%">
      <stop offset="0" stop-color="#fffdf6"/><stop offset=".65" stop-color="#ece3cf"/><stop offset="1" stop-color="#c3b699"/>
    </radialGradient>
    <radialGradient id="${id}-b">
      <stop offset="0" stop-color="#c1121f" stop-opacity=".6"/><stop offset="1" stop-color="#c1121f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-h" x1="0" x2="1">
      <stop offset="0" stop-color="#8d969f"/><stop offset=".5" stop-color="#e6ebf0"/><stop offset="1" stop-color="#8d969f"/>
    </linearGradient>
    <radialGradient id="${id}-n">
      <stop offset="0" stop-color="#dfe9e6" stop-opacity=".55"/><stop offset="1" stop-color="#dfe9e6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle class="js-brillo" cx="100" cy="98" r="92" fill="url(#${id}-b)"/>
  <g transform="rotate(28 150 110)">
    <g class="js-machete">
      <path d="M150 12c14 2 20 20 16 40l-6 76h-12l-2-92c0-14 0-22 4-24Z" fill="url(#${id}-h)"/>
      <path class="js-destello" d="M157 26l-3 88" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <rect x="145" y="128" width="18" height="44" rx="5" fill="#3b2416"/>
      <circle cx="154" cy="140" r="2" fill="#c9a86a"/><circle cx="154" cy="158" r="2" fill="#c9a86a"/>
    </g>
  </g>
  <path d="M100 22c42 0 58 36 56 78-2 42-24 76-56 78-32-2-54-36-56-78-2-42 14-78 56-78Z" fill="#101614"/>
  <g class="js-mascara">
    <path d="M58 70l-14-4M142 70l14-4M60 122l-14 6M140 122l14 6" stroke="#2a2a2a" stroke-width="4" stroke-linecap="round"/>
    <path d="M100 34c32 0 46 26 44 62-2 36-20 66-44 70-24-4-42-34-44-70-2-36 12-62 44-62Z" fill="url(#${id}-m)" stroke="#a89f8a" stroke-width="1.5"/>
    <path d="M72 78c4-8 18-8 20 2 0 8-14 10-18 6-2-2-3-5-2-8ZM128 78c-4-8-18-8-20 2 0 8 14 10 18 6 2-2 3-5 2-8Z" fill="#0d0d0d"/>
    <circle class="js-pupila" cx="82" cy="81" r="3" fill="#ff2a2a"/>
    <circle class="js-pupila" cx="118" cy="81" r="3" fill="#ff2a2a"/>
    <path d="M91 44l9 13 9-13h-5l-4 6-4-6Z" fill="#c1121f"/>
    <path d="M64 97l8 12 8-12h-4.5l-3.5 5.5-3.5-5.5Z" fill="#c1121f" transform="rotate(24 72 103)"/>
    <path d="M120 97l8 12 8-12h-4.5l-3.5 5.5-3.5-5.5Z" fill="#c1121f" transform="rotate(-24 128 103)"/>
    <g fill="#3a342a">${agujeros}</g>
  </g>
  <g class="js-niebla">
    <ellipse cx="50" cy="186" rx="70" ry="22" fill="url(#${id}-n)"/>
    <ellipse cx="150" cy="190" rx="80" ry="24" fill="url(#${id}-n)"/>
    <ellipse cx="100" cy="196" rx="90" ry="18" fill="url(#${id}-n)"/>
  </g>`;
}

function freddy(id) {
  return `
  <defs>
    <radialGradient id="${id}-f" cx="50%" cy="62%" r="60%">
      <stop offset="0" stop-color="#ff8c2a" stop-opacity=".75"/><stop offset=".55" stop-color="#b3261e" stop-opacity=".35"/><stop offset="1" stop-color="#b3261e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-a" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f7fa"/><stop offset="1" stop-color="#8b949c"/>
    </linearGradient>
    <clipPath id="${id}-s"><path d="M38 200c4-38 24-58 62-62 38 4 58 24 62 62Z"/></clipPath>
  </defs>
  <circle class="fr-fuego" cx="100" cy="112" r="92" fill="url(#${id}-f)"/>
  <g clip-path="url(#${id}-s)">
    <rect x="30" y="130" width="140" height="70" fill="#9b111e"/>
    <path d="M30 146h140v9H30ZM30 166h140v9H30ZM30 186h140v9H30Z" fill="#1f5a2e"/>
  </g>
  <g class="fr-cabeza">
    <path d="M100 62c26 0 36 20 34 42-2 22-16 38-34 40-18-2-32-18-34-40-2-22 8-42 34-42Z" fill="#8a4a3a"/>
    <path d="M78 110c6 4 10 12 6 18M122 96c-6 6-4 14 2 18M92 130c4 2 10 2 14 0" stroke="#5e2c22" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M70 100c4-2 8 0 10 4M118 124c4 0 8-2 10-6" stroke="#b36a55" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M66 74h68v22c-20 8-48 8-68 0Z" fill="#000" opacity=".5"/>
    <ellipse class="fr-ojo" cx="87" cy="94" rx="6" ry="3.2" fill="#ffd166"/>
    <ellipse class="fr-ojo" cx="113" cy="94" rx="6" ry="3.2" fill="#ffd166"/>
    <path d="M80 118q20 14 42-2" stroke="#1a0d0a" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M87 121.5l1.5 4.5M95 124l.5 4.5M103 124.5v4.5M111 122.5l-.8 4.5M117 119.5l-1.5 4" stroke="#efe0b8" stroke-width="2" stroke-linecap="round"/>
    <g class="fr-sombrero">
      <path d="M38 78c22-10 102-10 124 0-12 10-112 10-124 0Z" fill="#4a2e1a"/>
      <path d="M62 78c-2-28 12-48 38-50 26 2 40 22 38 50Z" fill="#5c3a21"/>
      <path d="M62 70c20 6 56 6 76 0v-8c-20 6-56 6-76 0Z" fill="#2b1a0e"/>
      <path d="M84 34q16 10 32 0" stroke="#3b2413" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </g>
  <g class="fr-guante">
    <path d="M146 122l-10-62M153 120l-3-66M160 120l5-64M166 123l12-58" stroke="url(#${id}-a)" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M136 150c-2-16 4-28 14-30l20 2c6 8 6 22-2 30Z" fill="#6b4226"/>
    <path d="M142 124h28" stroke="#c9a86a" stroke-width="3" stroke-linecap="round"/>
    <g class="fr-chispas" fill="#ffd166">
      <circle cx="136" cy="58" r="2.2"/><circle cx="150" cy="52" r="1.8"/><circle cx="166" cy="54" r="2"/><circle cx="180" cy="62" r="1.6"/>
    </g>
  </g>`;
}

function calabaza(id) {
  return `
  <defs>
    <radialGradient id="${id}-c" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#ffb347"/><stop offset=".6" stop-color="#ff7a1a"/><stop offset="1" stop-color="#b93f0a"/>
    </radialGradient>
    <radialGradient id="${id}-g">
      <stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle class="cal-halo" cx="100" cy="112" r="96" fill="url(#${id}-g)"/>
  <path d="M96 50c-2-14 4-24 16-26l3 7c-8 2-10 8-9 19Z" fill="#4d7c0f"/>
  <ellipse cx="100" cy="116" rx="76" ry="62" fill="url(#${id}-c)"/>
  <g fill="none" stroke="#b93f0a" stroke-width="3" opacity=".55">
    <ellipse cx="100" cy="116" rx="30" ry="61"/><ellipse cx="100" cy="116" rx="56" ry="62"/>
  </g>
  <g class="cal-luz" fill="#ffe08a">
    <path d="M66 100l14-22 12 22ZM134 100l-14-22-12 22ZM95 112l5-9 5 9Z"/>
    <path d="M62 124q38 42 76 0l-8 2-5 7-7-5-6 7-6-6-6 7-6-7-6 6-6-7-7 5-5-7Z"/>
  </g>`;
}

function final(id) {
  const pieza = (dibujo, x, y, tam, n) =>
    `<g class="fin-pieza fin-pieza--${n}"><svg x="${x}" y="${y}" width="${tam}" height="${tam}" viewBox="0 0 200 200">${dibujo(`${id}-${n}`)}</svg></g>`;
  return pieza(scream, 0, 40, 140, 1) + pieza(freddy, 380, 40, 140, 4) + pieza(jack, 100, 18, 150, 2)
    + pieza(jason, 270, 18, 150, 3) + pieza(calabaza, 195, 70, 130, 5);
}

const DIBUJOS = { scream, jack, jason, freddy, calabaza };

const ETIQUETAS = {
  scream: 'Ghostface, de Scream, hablando por teléfono',
  jack: 'Jack Skellington frente a la luna llena',
  jason: 'La máscara de hockey de Jason entre la niebla',
  freddy: 'Freddy Krueger con su sombrero y su guante de cuchillas',
  calabaza: 'Una calabaza de Halloween encendida',
};

export function arte(tema) {
  const id = nuevoId(tema);
  if (tema === 'final') {
    return `<svg class="arte arte--final" viewBox="0 0 520 200" role="img" aria-label="Todos los personajes celebrando Halloween">${final(id)}</svg>`;
  }
  return `<svg class="arte arte--${tema}" viewBox="0 0 200 200" role="img" aria-label="${ETIQUETAS[tema]}">${DIBUJOS[tema](id)}</svg>`;
}

export const ICONOS = {
  scream: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3c9 0 13 7 12 16-1 5-3 7-3 12 0 5-4 8-9 8s-9-3-9-8c0-5-2-7-3-12C7 10 11 3 20 3Z" fill="#f4f1ea"/><path d="M18 11c1 4 0 9-3 11-3 1-4-1-3-4 1-4 3-7 6-7ZM22 11c-1 4 0 9 3 11 3 1 4-1 3-4-1-4-3-7-6-7ZM20 25c2 0 3 3 3 6s-1 5-3 5-3-2-3-5 1-6 3-6Z" fill="#0a0a0a"/></svg>',
  jack: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4c9 0 14 6 14 14s-6 16-14 16S6 26 6 18 11 4 20 4Z" fill="#f4f1ea"/><ellipse cx="14.5" cy="16" rx="3.6" ry="4.8" transform="rotate(14 14.5 16)" fill="#0b0b0b"/><ellipse cx="25.5" cy="16" rx="3.6" ry="4.8" transform="rotate(-14 25.5 16)" fill="#0b0b0b"/><path d="M10 24q10 7 20 0M13 23.5v4M17 25v4M20 25.5v4M23 25v4M27 23.5v4" stroke="#1a1a1a" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>',
  jason: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3c8 0 12 6 12 15s-5 18-12 19C13 36 8 27 8 18S12 3 20 3Z" fill="#efe8d8"/><path d="M12 15c1-2 5-2 6 1 0 2-4 3-5 2-1-1-1-2-1-3ZM28 15c-1-2-5-2-6 1 0 2 4 3 5 2 1-1 1-2 1-3Z" fill="#111"/><path d="M17.5 7l2.5 3.5L22.5 7ZM11 21l2 3.2 2-3.2ZM25 21l2 3.2 2-3.2Z" fill="#c1121f"/><g fill="#5a5245"><circle cx="17" cy="21" r=".9"/><circle cx="23" cy="21" r=".9"/><circle cx="15" cy="25" r=".9"/><circle cx="20" cy="25" r=".9"/><circle cx="25" cy="25" r=".9"/><circle cx="17.5" cy="29" r=".9"/><circle cx="22.5" cy="29" r=".9"/></g></svg>',
  freddy: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 16c7-3 25-3 32 0-4 3-28 3-32 0Z" fill="#5c3a21"/><path d="M11 16c0-7 4-12 9-12s9 5 9 12Z" fill="#6e4527"/><path d="M11 13c5 2 13 2 18 0v-2c-5 2-13 2-18 0Z" fill="#2b1a0e"/><path d="M13 36l-3-12M17 36l-1-13M21 36l1-13M25 36l3-12" stroke="#d7dde3" stroke-width="1.6" stroke-linecap="round"/></svg>',
  final: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M19 9c0-3 1-5 4-6l1 2c-2 1-3 2-2 4Z" fill="#4d7c0f"/><ellipse cx="20" cy="23" rx="16" ry="13" fill="#ff7a1a"/><path d="M13 20l3-5 3 5ZM27 20l-3-5-3 5ZM12 26q8 7 16 0l-2 1-1 2-2-1-1 2-2-2-2 2-1-2-2 1-1-2Z" fill="#ffe08a"/></svg>',
  candado: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#e7dcc4" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2" fill="rgba(0,0,0,.35)"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};
