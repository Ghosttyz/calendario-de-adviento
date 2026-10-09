# Genera los iconos PNG de la app (una calabaza) usando System.Drawing de Windows.
# Uso: powershell -ExecutionPolicy Bypass -File herramientas\generar-iconos.ps1
Add-Type -AssemblyName System.Drawing

$destino = Join-Path (Split-Path -Parent $PSScriptRoot) 'iconos'

function Color([int]$r, [int]$g, [int]$b, [int]$a = 255) {
  [System.Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function Dibujar-Calabaza($g, [double]$x0, [double]$y0, [double]$w, [double]$h, [bool]$mono) {
  $P = { param($u, $v) New-Object System.Drawing.PointF ([single]($x0 + $u * $w)), ([single]($y0 + $v * $h)) }
  $blanco = New-Object System.Drawing.SolidBrush (Color 255 255 255)
  if ($mono) {
    $lado = $blanco; $centro = $blanco; $tallo = $blanco
  } else {
    $lado = New-Object System.Drawing.SolidBrush (Color 0xE0 0x5C 0x14)
    $centro = New-Object System.Drawing.SolidBrush (Color 0xFF 0x86 0x26)
    $tallo = New-Object System.Drawing.SolidBrush (Color 0x4D 0x7C 0x0F)
  }

  $g.FillPolygon($tallo, [System.Drawing.PointF[]]@((& $P 0.46 0.22), (& $P 0.44 0.06), (& $P 0.52 0.0), (& $P 0.59 0.03), (& $P 0.53 0.09), (& $P 0.55 0.22)))
  $g.FillEllipse($lado, [single]$x0, [single]($y0 + 0.18 * $h), [single](0.6 * $w), [single](0.8 * $h))
  $g.FillEllipse($lado, [single]($x0 + 0.4 * $w), [single]($y0 + 0.18 * $h), [single](0.6 * $w), [single](0.8 * $h))
  $g.FillEllipse($centro, [single]($x0 + 0.22 * $w), [single]($y0 + 0.14 * $h), [single](0.56 * $w), [single](0.86 * $h))
  if (-not $mono) {
    $surco = New-Object System.Drawing.Pen ((Color 0xB9 0x3F 0x0A 150)), ([single]([Math]::Max(1, $w * 0.012)))
    $g.DrawEllipse($surco, [single]($x0 + 0.22 * $w), [single]($y0 + 0.14 * $h), [single](0.56 * $w), [single](0.86 * $h))
  }

  $cara = @(
    @((& $P 0.24 0.52), (& $P 0.335 0.36), (& $P 0.43 0.52)),
    @((& $P 0.57 0.52), (& $P 0.665 0.36), (& $P 0.76 0.52)),
    @((& $P 0.46 0.62), (& $P 0.5 0.55), (& $P 0.54 0.62)),
    @((& $P 0.22 0.68), (& $P 0.3 0.72), (& $P 0.35 0.67), (& $P 0.42 0.73), (& $P 0.5 0.68), (& $P 0.58 0.73), (& $P 0.65 0.67),
      (& $P 0.7 0.72), (& $P 0.78 0.68), (& $P 0.72 0.82), (& $P 0.64 0.87), (& $P 0.58 0.81), (& $P 0.5 0.89), (& $P 0.42 0.81),
      (& $P 0.36 0.87), (& $P 0.28 0.82))
  )
  if ($mono) {
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $luz = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::Transparent)
  } else {
    $luz = New-Object System.Drawing.SolidBrush (Color 0xFF 0xE0 0x8A)
  }
  foreach ($forma in $cara) { $g.FillPolygon($luz, [System.Drawing.PointF[]]$forma) }
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
}

function Generar-Icono([int]$tam, [string]$archivo, [double]$escala, [bool]$fondo, [bool]$mono) {
  $bmp = New-Object System.Drawing.Bitmap $tam, $tam, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  if ($fondo) {
    $cielo = New-Object System.Drawing.Drawing2D.GraphicsPath
    $cielo.AddEllipse([single](-0.3 * $tam), [single](-0.35 * $tam), [single](1.6 * $tam), [single](1.5 * $tam))
    $degradado = New-Object System.Drawing.Drawing2D.PathGradientBrush $cielo
    $degradado.CenterColor = Color 0x3A 0x1F 0x63
    $degradado.SurroundColors = [System.Drawing.Color[]]@((Color 0x0D 0x07 0x16))
    $g.FillRectangle($degradado, [single]0, [single]0, [single]$tam, [single]$tam)

    $halo = New-Object System.Drawing.Drawing2D.GraphicsPath
    $halo.AddEllipse([single](0.1 * $tam), [single](0.12 * $tam), [single](0.8 * $tam), [single](0.8 * $tam))
    $brillo = New-Object System.Drawing.Drawing2D.PathGradientBrush $halo
    $brillo.CenterColor = Color 0xFF 0x9A 0x3C 110
    $brillo.SurroundColors = [System.Drawing.Color[]]@((Color 0xFF 0x9A 0x3C 0))
    $g.FillPath($brillo, $halo)
  }

  $w = $tam * $escala
  $h = $w * 0.92
  Dibujar-Calabaza $g (($tam - $w) / 2) (($tam - $h) / 2 + $tam * 0.02) $w $h $mono
  $bmp.Save((Join-Path $destino $archivo), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Host "Creado iconos\$archivo"
}

Generar-Icono 512 'icono-512.png' 0.74 $true $false
Generar-Icono 192 'icono-192.png' 0.74 $true $false
Generar-Icono 512 'icono-mascara-512.png' 0.58 $true $false
Generar-Icono 180 'apple-touch-icon.png' 0.7 $true $false
Generar-Icono 96 'insignia-96.png' 0.86 $false $true
