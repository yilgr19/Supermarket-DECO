$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

$envFile = Join-Path $root "pos-frontend\.env"
$envExample = Join-Path $root "pos-frontend\.env.example"
if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
  Copy-Item $envExample $envFile
}
if (Test-Path $envFile) {
  $seenMsw = $false
  $lines = Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*VITE_USE_MSW\s*=') {
      $seenMsw = $true
      'VITE_USE_MSW=false'
    } elseif ($_ -match '^\s*VITE_SALES_API_URL\s*=') {
      'VITE_SALES_API_URL='
    } else {
      $_
    }
  }
  if (-not $seenMsw) { $lines += 'VITE_USE_MSW=false' }
  Set-Content -Path $envFile -Value $lines
}

$frontendModules = Join-Path $root "pos-frontend\node_modules"
if (-not (Test-Path $frontendModules)) {
  Write-Host "Instalando dependencias del frontend..."
  Push-Location (Join-Path $root "pos-frontend")
  npm.cmd install --legacy-peer-deps
  Pop-Location
}

if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Host "Instalando dependencias del monorepo (concurrently)..."
  npm.cmd install
}

function Stop-ListenerOnPort {
  param([int]$Port)
  $listeners = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  foreach ($match in $listeners) {
    $parts = ($match.Line -replace '\s+', ' ').Trim().Split(' ')
    $procId = $parts[-1]
    if ($procId -notmatch '^\d+$' -or $procId -eq '0') { continue }
    $proc = Get-Process -Id ([int]$procId) -ErrorAction SilentlyContinue
    if ($null -eq $proc) { continue }
    Write-Host "Liberando puerto $Port (PID $($proc.Id), $($proc.ProcessName))..."
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  }
}

Stop-ListenerOnPort -Port 8088
Start-Sleep -Seconds 1

Write-Host "Iniciando API (8088) y frontend (Vite: 5173 o el siguiente libre). El frontend espera GET /api/v1/health en 8088."
Write-Host "Abre la URL Local que muestre Vite (p. ej. http://localhost:5173/). Las peticiones /api se reenvían al backend."
npm.cmd run dev
