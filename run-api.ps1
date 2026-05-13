$Mvn = Join-Path $env:LOCALAPPDATA "Programs\apache-maven\apache-maven-3.9.6\bin\mvn.cmd"
if (-not (Test-Path $Mvn)) {
  Write-Error "Maven no encontrado en $Mvn"
  exit 1
}
$Repo = Join-Path $env:LOCALAPPDATA "maven-repo"
New-Item -ItemType Directory -Force -Path $Repo | Out-Null
$env:MAVEN_OPTS = "-Dmaven.repo.local=$Repo"
$Pom = Join-Path $PSScriptRoot "pos-sales-api\pom.xml"
& $Mvn -f $Pom @args
