# Calendario de Adviento

**31 Noches de Terror**: un calendario de adviento de Halloween para octubre. Cada noche se desbloquea una puerta con un personaje animado (Scream, El extraño mundo de Jack, Viernes 13 o Freddy Krueger) y un escrito del día. Funciona en computador, tablet y celular, y se puede instalar como app.

## Cómo funciona

- Cada vez que se abre la página hay una entrada animada, como al comienzo de El extraño mundo de Jack: un bosque de noche, un árbol con una puerta-calabaza que se enciende y se abre, y la cámara entra hacia la luz. Se puede saltar con el botón «Saltar» o la tecla Esc.
- La puerta de cada noche se desbloquea a la medianoche de ese día de octubre (según la hora del dispositivo). Las anteriores se pueden releer y las futuras están cerradas con candado.
- Al abrir una puerta cae un relámpago, la puerta se abre, aparece el personaje y luego se abre un panel con el escrito, un dato curioso y un reto.
- Las puertas abiertas se guardan en cada dispositivo.
- El botón **✨ Efectos** alterna entre efectos completos y suaves (sin destellos ni sustos a pantalla completa). Si el sistema tiene las animaciones desactivadas, empieza en suaves.

## Avisos diarios

- **Notificaciones**: con la app instalada en Chrome o Edge (Android o computador), avisan una vez al día aunque el calendario esté cerrado; el sistema elige la hora exacta. En otros navegadores avisan mientras el calendario está abierto. En iPhone y iPad primero hay que añadirlo a la pantalla de inicio.
- **Recordatorios de calendario (.ics)**: 31 recordatorios a la hora que elijas. Funcionan en cualquier dispositivo, aunque el calendario esté cerrado.
- El service worker ya acepta notificaciones push enviadas desde un servidor (`{"dia": 5}`), por si más adelante se quiere un aviso a hora exacta en todos los dispositivos.

## Probarlo en este computador

```powershell
powershell -ExecutionPolicy Bypass -File herramientas\servidor.ps1
```

Luego abre http://localhost:8080/. Solo en `localhost` se puede simular otra fecha:

- `?fecha=2026-10-13` simula ese día (y `&hora=23:59:50` sirve para ver el cambio de día).
- `&abiertas=1-12` marca esas puertas como ya abiertas.
- `&efectos=completo` o `&efectos=suave` fuerza el modo de efectos.
- `&intro=no` omite la entrada y `&intro=2500` la congela en ese milisegundo (útil para revisarla cuadro por cuadro).

Ejemplo: http://localhost:8080/?fecha=2026-10-13&abiertas=1-12

## Personalizar

- Los textos de cada noche (título, escrito, dato curioso, reto, reto en pareja y personaje) están en `contenido/dias.json`, que **no se sube a GitHub** para que nadie lea las noches por adelantado. Después de editarlo, ejecuta `powershell -ExecutionPolicy Bypass -File herramientas\cifrar-textos.ps1` para regenerar `js/dias.js`, que lleva los textos cifrados.
- El calendario usa la hora de internet, así que cambiar la fecha del dispositivo no abre puertas antes de tiempo.
- Los dibujos SVG están en `js/personajes.js` y sus animaciones en `css/personajes.css`.
- La entrada animada está en `index.html` (escena del bosque), `css/intro.css` y `js/intro.js`.
- Las fuentes son Griffy (títulos y números) y Mystery Quest (todo lo demás), de Google Fonts.
- Los íconos de la app se regeneran con `herramientas\generar-iconos.ps1`.

## Publicarlo

Las notificaciones y la instalación como app necesitan HTTPS, así que para usarlo en el celular hay que publicarlo en internet (por ejemplo, con GitHub Pages).

Los personajes pertenecen a sus dueños; los dibujos son fan art original para uso personal.
