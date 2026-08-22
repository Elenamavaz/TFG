# semanasanta-app

App cliente en React Native + Expo. Ver la memoria del TFG para la arquitectura completa; esto es solo "cómo arrancarla".

## Requisitos

- **Node.js** + npm
- El **backend corriendo en `http://localhost:8080`** antes de arrancar la app (ver `backend/README.md`) — casi toda la app depende de él, incluida la pantalla de bienvenida (lista de ciudades)
- Para probar en Android: **Android Studio** con un emulador creado, o el móvil físico con la app **Expo Go** instalada (misma red WiFi que el ordenador)

## Instalar

```powershell
npm install
```

## Arrancar

Primero asegúrate de que el backend está arriba (`http://localhost:8080/swagger-ui.html` debe responder).

**Web** (la más rápida para probar cambios de UI):

```powershell
npm run web
```

**Android** (emulador):

1. Abre Android Studio → Device Manager → arranca un emulador.
2. Con el emulador ya abierto:

   ```powershell
   npm start
   ```

   y pulsa `a` en la terminal de Metro (o usa directamente `npm run android`).

**Móvil físico** (Expo Go): `npm start`, escanea el QR con la app Expo Go — el teléfono debe estar en la **misma red WiFi** que el ordenador que sirve Metro, es como la app encuentra el backend (ver "Conexión al backend" abajo).

## Conexión al backend

No hay que configurar ninguna URL a mano (`src/infrastructure/api/apiClient.js` la resuelve sola):

- **Web**: usa `http://localhost:8080` directamente (mismo origen que el navegador).
- **Android/iOS** (emulador o dispositivo físico): reutiliza la IP que ya usa Metro para servir el bundle (es la misma por la que el dispositivo ya te está viendo), solo le cambia el puerto al del backend (`8080`).

Si el backend no está arrancado, prácticamente toda la app se queda en blanco o da error de red (`Failed to fetch`) — arráncalo primero.

## Cuentas de prueba (backend local recién sembrado/bootstrapeado)

- **Administrador**: `admin@semanasanta-app.local` / `Admin1234!` (o las que hayas creado tú al hacer el bootstrap, ver `backend/README.md`)
- **Ciudadano**: sin cuenta, se entra eligiendo ciudad directamente desde la pantalla de bienvenida
- **Junta**: el Administrador da de alta a los miembros desde su panel (Juntas → Miembros) — la contraseña provisional llega por correo (ver "Notas" abajo)
- **Cofrade**: entra con un código de acceso, emitido por la Junta de la cofradía correspondiente (no por el Administrador)

## Notas

- El correo de bienvenida al dar de alta un Miembro de Junta depende de que el backend tenga `MAIL_USERNAME`/`MAIL_PASSWORD` configuradas — sin ellas, esa acción concreta dará error 500 en el backend (ver `backend/README.md`), el resto de la app funciona igual.
- El caché offline de las respuestas (TanStack Query + `AsyncStorage`) sirve la última respuesta conocida de cada endpoint sin conexión, y revalida en segundo plano al recuperarla.
