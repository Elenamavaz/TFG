# Backend — semanasanta-app

API REST en Spring Boot (Java 17) + PostgreSQL. Ver la memoria del TFG para la arquitectura completa; esto es solo "cómo arrancarlo".

## Requisitos

- **Java 17**
- **Docker Desktop** abierto y corriendo (la base de datos Postgres se levanta sola, ver más abajo — no hace falta instalar Postgres a mano)
- No hace falta Maven instalado: el proyecto trae `mvnw`/`mvnw.cmd` (Maven Wrapper)

## Arrancar en local

1. Abre **Docker Desktop** y espera a que esté listo (icono de la ballena sin animación de carga).
2. Desde `backend/`:

   ```powershell
   .\mvnw spring-boot:run
   ```

   La primera vez que arranca, Spring Boot detecta `compose.yaml` y levanta el contenedor de Postgres automáticamente (`spring-boot-docker-compose`) — no hay que hacer `docker compose up` a mano. Las siguientes veces reutiliza el mismo contenedor si sigue corriendo (`docker ps` para comprobarlo); si Docker Desktop se cerró y lo has vuelto a abrir, el contenedor puede haberse parado solo — `docker start backend-postgres-1` lo revive con los datos intactos (evita `docker compose down -v`, eso sí borra los datos).
3. Las migraciones de base de datos (Flyway) se aplican solas al arrancar.
4. Backend disponible en **http://localhost:8080**. Documentación interactiva de la API en **http://localhost:8080/swagger-ui.html**.

## Primer arranque: crear el Administrador

No hay ningún usuario hasta que se crea el primero a mano, vía un endpoint de un solo uso (se autodesactiva en cuanto existe ya un Administrador):

```
POST http://localhost:8080/administradores/bootstrap
Content-Type: application/json

{
  "secreto": "secreto-bootstrap-de-desarrollo-cambiar-en-produccion",
  "email": "admin@semanasanta-app.local",
  "password": "Admin1234!"
}
```

`password` exige mínimo 8 caracteres, una mayúscula, un número y un carácter especial. El `secreto` por defecto (`admin.bootstrap-secret` en `application.properties`) solo vale en local — en producción se sustituye por la variable de entorno `ADMIN_BOOTSTRAP_SECRET`. Este endpoint se autodesactiva en cuanto existe ya un Administrador (da igual el secreto que se mande).

## Datos de ejemplo (seed)

Para poblar la base de datos con ciudades/cofradías/procesiones de ejemplo (operación idempotente, se puede repetir sin duplicar nada):

```powershell
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=seed"
```

Solo siembra datos con este perfil activo — un arranque normal (`.\mvnw spring-boot:run`, sin perfil) no toca nada.

## Variables de entorno (todas opcionales en local — tienen valor por defecto)

| Variable | Para qué | Local |
|---|---|---|
| `JWT_SECRET` | Firma de los JWT | valor de desarrollo por defecto, **cambiar en producción** |
| `JWT_EXPIRATION` | Caducidad del JWT (ms) | 86400000 (24h) |
| `ADMIN_BOOTSTRAP_SECRET` | Crear el primer Administrador | valor de desarrollo por defecto, **cambiar en producción** |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Correo de bienvenida al dar de alta un Miembro de Junta (SMTP Gmail) | vacías por defecto — sin ellas, el arranque funciona igual, pero **crear un Miembro dará 500** al intentar mandar el correo |

Para probar el envío de correo real en local, `MAIL_PASSWORD` es una [contraseña de aplicación de Gmail](https://myaccount.google.com/apppasswords) (16 caracteres, la genera Google — no la contraseña normal de la cuenta; hace falta tener la verificación en dos pasos activada para poder crearla):

```powershell
$env:MAIL_USERNAME = "elenamavaz@gmail.com"
$env:MAIL_PASSWORD = "xxxxxxxxxxxxxxxx"
.\mvnw spring-boot:run
```

Esas variables solo viven en esa ventana de PowerShell mientras esté abierta.

## Notas

- Hibernate **no** crea ni modifica tablas (`ddl-auto=validate`) — el esquema lo gestiona Flyway (`src/main/resources/db/migration`), nunca se edita una migración ya aplicada, se corrige con una nueva.
- Si el arranque falla por un conflicto de migraciones (número de versión duplicado, checksum distinto) tras renombrar o borrar algún archivo de migración a mano, prueba `.\mvnw clean` antes de reintentar — Maven no borra los recursos compilados de una migración eliminada del código fuente salvo que se le pida explícitamente.
