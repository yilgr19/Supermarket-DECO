# SAM Makefile build para Lambdas Java (Maven)
.PHONY: build build-VentasFunction build-ProductosFunction

MVN := mvn
JAR := target/lambda-ventas-1.0-SNAPSHOT.jar

build-VentasFunction build-ProductosFunction:
	$(MVN) -q clean package -DskipTests
	# Lambda Java: el JAR debe ser el artefacto raíz del zip
	cp "$(CURDIR)/$(JAR)" "$(ARTIFACTS_DIR)/lib.jar"
	cp "$(CURDIR)/$(JAR)" "$(ARTIFACTS_DIR)/"

build:
	$(MVN) -q clean package -DskipTests
