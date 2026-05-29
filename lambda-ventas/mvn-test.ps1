# Ejecutar pruebas unitarias en Windows cuando C:\Users\<user>\.m2 no es escribible.
$ErrorActionPreference = "Stop"

$jdk21 = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
if (Test-Path $jdk21) {
    $env:JAVA_HOME = $jdk21
}

Set-Location $PSScriptRoot
mvn -s maven-settings-local.xml test @args
