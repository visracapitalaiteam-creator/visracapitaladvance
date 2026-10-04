# Minimal zero-dependency static file server for the Visra landing page.
# Used by .claude/launch.json so `preview_start` can serve the site with no
# Node/Python runtime installed. Serves the project root over http://localhost:<port>.
param(
  # the preview assigns a free port through the PORT environment variable; 3000 is only the fallback
  [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 3000 }),
  [string]$Root = (Split-Path -Parent $PSScriptRoot)  # project root (parent of .claude)
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path $Root).Path

$mime = @{
  '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8';
  '.css'='text/css; charset=utf-8';   '.js'='text/javascript; charset=utf-8';
  '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.gif'='image/gif';
  '.webp'='image/webp'; '.ico'='image/x-icon'; '.woff'='font/woff'; '.woff2'='font/woff2';
  '.ttf'='font/ttf'; '.map'='application/json'; '.txt'='text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving '$Root' at $prefix (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      # Decode + normalise the request path, then confine it to $Root (no traversal).
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
      $full = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))
      if ((Test-Path $full -PathType Container)) { $full = Join-Path $full 'index.html' }

      if (-not $full.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $full -PathType Leaf)) {
        $res.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
        $res.ContentType = 'text/plain; charset=utf-8'
      } else {
        $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
        $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $res.StatusCode = 200
      }
      $res.Headers['Cache-Control'] = 'no-cache'
      $res.ContentLength64 = $bytes.Length
      # HEAD requests must not include a response body.
      if ($req.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
      Write-Host ("{0} {1} -> {2}" -f $req.HttpMethod, $req.Url.AbsolutePath, $res.StatusCode)
    } catch {
      Write-Host "ERR $($_.Exception.Message)"
      try { $res.StatusCode = 500 } catch {}
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop(); $listener.Close()
}
