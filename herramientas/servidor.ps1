# Servidor local sencillo para probar el calendario sin instalar nada.
# Uso: powershell -ExecutionPolicy Bypass -File herramientas\servidor.ps1 [-Puerto 8080]
param([int]$Puerto = 8080)

$raiz = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path.TrimEnd('\') + '\'
$tipos = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.png' = 'image/png'
  '.svg' = 'image/svg+xml'
  '.ico' = 'image/x-icon'
  '.ics' = 'text/calendar; charset=utf-8'
}

$servidor = [System.Net.HttpListener]::new()
$servidor.Prefixes.Add("http://localhost:$Puerto/")
$servidor.Start()
Write-Host "Calendario disponible en http://localhost:$Puerto/ (Ctrl+C para detener)"

try {
  while ($servidor.IsListening) {
    $ctx = $servidor.GetContext()
    $res = $ctx.Response
    try {
      $ruta = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrEmpty($ruta)) { $ruta = 'index.html' }
      $archivo = [IO.Path]::GetFullPath((Join-Path $raiz $ruta))
      if ($archivo.StartsWith($raiz) -and (Test-Path -LiteralPath $archivo -PathType Leaf)) {
        $bytes = [IO.File]::ReadAllBytes($archivo)
        $ext = [IO.Path]::GetExtension($archivo).ToLower()
        $res.ContentType = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
        $res.Headers.Add('Cache-Control', 'no-cache')
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
      }
    } catch {
      Write-Host "Error sirviendo $($ctx.Request.Url): $_"
    } finally {
      $res.Close()
    }
  }
} finally {
  $servidor.Stop()
}
