# Genera js/dias.js a partir de contenido/dias.json (ese archivo NO se sube a GitHub).
# Los textos de cada noche quedan cifrados para que no se puedan leer por adelantado
# ni en GitHub ni en el codigo de la pagina; el calendario los descifra al abrir cada puerta.
# Uso: powershell -ExecutionPolicy Bypass -File herramientas\cifrar-textos.ps1
$raiz = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
$datos = [IO.File]::ReadAllText((Join-Path $raiz 'contenido\dias.json'), $utf8) | ConvertFrom-Json
$sal = 'calabaza-31-noches' # debe coincidir con SAL en js/app.js

function Cifrar([int]$dia, [string]$texto) {
  $clave = $utf8.GetBytes("noches-terror-$dia-$sal")
  $bytes = $utf8.GetBytes($texto)
  for ($i = 0; $i -lt $bytes.Length; $i++) {
    $bytes[$i] = $bytes[$i] -bxor $clave[$i % $clave.Length]
  }
  [Convert]::ToBase64String($bytes)
}

$lineas = New-Object System.Collections.Generic.List[string]
$lineas.Add('// Archivo generado por herramientas/cifrar-textos.ps1 a partir de contenido/dias.json.')
$lineas.Add('// No lo edites a mano: cambia los textos en contenido/dias.json y vuelve a ejecutar el script.')
$lineas.Add('// Lo usan la pagina y el service worker (para las notificaciones).')
$lineas.Add('')
$lineas.Add('self.AVISOS_TEMA = ' + ($datos.avisos | ConvertTo-Json -Compress) + ';')
$lineas.Add('')
$lineas.Add('self.DIAS = [')
foreach ($d in $datos.dias) {
  $contenido = [ordered]@{}
  foreach ($campo in 'titulo', 'texto', 'dato', 'reto', 'pareja') {
    if ($d.$campo) { $contenido[$campo] = $d.$campo }
  }
  $secreto = Cifrar $d.dia ($contenido | ConvertTo-Json -Compress)
  $lineas.Add("  { dia: $($d.dia), tema: `"$($d.tema)`", secreto: `"$secreto`" },")
}
$lineas.Add('];')
[IO.File]::WriteAllText((Join-Path $raiz 'js\dias.js'), ($lineas -join "`n") + "`n", $utf8)
Write-Host "js/dias.js generado con $($datos.dias.Count) noches cifradas."
