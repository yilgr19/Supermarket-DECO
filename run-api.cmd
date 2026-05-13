@echo off
setlocal
set "MAVEN_BIN=%LOCALAPPDATA%\Programs\apache-maven\apache-maven-3.9.6\bin\mvn.cmd"
if not exist "%MAVEN_BIN%" (
  echo No se encontro Maven en: %MAVEN_BIN%
  echo Instala Maven o ajusta MAVEN_BIN en run-api.cmd
  exit /b 1
)
set "MAVEN_REPO=%LOCALAPPDATA%\maven-repo"
if not exist "%MAVEN_REPO%" mkdir "%MAVEN_REPO%"
set "MAVEN_OPTS=-Dmaven.repo.local=%MAVEN_REPO%"
"%MAVEN_BIN%" -f "%~dp0pos-sales-api\pom.xml" %*
