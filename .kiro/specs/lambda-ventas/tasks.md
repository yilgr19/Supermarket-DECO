# Tareas — Backend Lambda POS (lambda-ventas)

Orden de implementación (Spec-Driven Development).

- [x] 1. Especificación SDD
  - [x] 1.1 `requirements.md` — endpoints, contratos, criterios de prueba
  - [x] 1.2 `design.md` — arquitectura, tablas, handlers
  - [x] 1.3 `tasks.md` — este archivo

- [x] 2. Infraestructura SAM
  - [x] 2.1 `template.yml`: API Gateway, 2 Lambdas, 2 tablas DynamoDB
  - [x] 2.2 `samconfig.toml` perfil localstack
  - [x] 2.3 Scripts `arrancar.sh` / `detener.sh`

- [x] 3. Implementación Lambda
  - [x] 3.1 `ProductosHandler` — GET lista y GET por id
  - [x] 3.2 `VentaHandler` — POST ventas con IVA 19%
  - [x] 3.3 `DynamoDbClientFactory` + `ApiResponse`

- [x] 4. Pruebas unitarias (Mockito, DynamoDB aislado)
  - [x] 4.1 `ProductosHandlerTest` — PT-1 a PT-4
  - [x] 4.2 `VentaHandlerTest` — VT-1 a VT-5
  - [x] 4.3 Constructores inyectables en handlers

- [x] 5. Integración frontend
  - [x] 5.1 `VITE_API_BASE_URL` + adapters Lambda en `pos-frontend`
  - [x] 5.2 Scripts LocalStack en `scripts/localstack-*.sh`
  - [x] 5.3 Requisito 15 en `.kiro/specs/pos-frontend/requirements.md`

- [ ] 6. Entrega docente
  - [x] 6.1 Capturas Postman (GET productos, POST ventas, error 400)
  - [x] 6.2 Captura `mvn test` exitoso
  - [ ] 6.3 Repositorio GitHub público (push con evidencias)
  - [ ] 6.4 `sam deploy` AWS real (opcional si solo LocalStack en taller)
