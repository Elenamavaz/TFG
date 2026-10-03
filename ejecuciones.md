ejecutar memorio: pdflatex proyecto
bibtex proyecto
pdflatex proyecto
pdflatex proyecto

ejecutar react:
abrir el de andoid studio ejecuatr el proyecto y luego 
Después inicia Metro:

npm start

el back : ./mvnw spring-boot:run

miras el back en el enlace : http://localhost:8080/swagger-ui.html

script para popblar la base de datos

cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=seed"



.\mvnw spring-boot:run
Esas dos variables solo viven en esa ventana de PowerShell mientras esté abierta — ciérrala y desaparecen, no quedan guardadas en ningún sitio. Si luego quieres levantarlo otra vez sin mandar correos de verdad, basta con abrir una terminal nueva sin esas variables y volver a .\mvnw spring-boot:run.

Avísame cuando lo tengas arriba y seguimos probando lo de crear un Miembro.

Lista de cosas por hacer:
# Qué está hecho en semanasanta-app y qué falta (30/09/2026)

Casi todo está construido, pero el flujo que da nombre al TFG, la geolocalización en tiempo real, no puede funcionar de punta a punta. Nada en el backend pone nunca una procesión "en curso", y compartir ubicación exige ese estado. No he ejecutado la app ni los tests; todo esto sale de leer el código, con grep, y de mis notas de sesiones anteriores.

## Lo que ya funciona

**Backend (Spring Boot + PostgreSQL, 41 migraciones)**
- Las 17 entidades del dominio tienen su parte de API, con la seguridad (roles y login) completa: JWT para Junta y Administrador, y código de acceso para Cofrade.
- Recorridos importados desde archivos GPX (`GpxParser`).
- Posición en tiempo real: los pings del Cofrade son anónimos y se descartan si caen fuera del recorrido. A partir de ellos se calcula la posición media y la estela, que nunca retrocede.
- Notificaciones unificadas. El push se envía a través de Expo Push, no de Firebase (`PushNotificacionService`, `DispositivoPush`, V40).
- Cancelar un evento o una procesión genera una notificación automática.
- Alta de miembros con correo de bienvenida, reactivación de cuentas y creación del primer administrador.

**Cliente (React Native + Expo)**
- **Ciudadano:** selección de ciudad, Inicio con carrusel de avisos, Calendario, Buscar, listados, detalles de cofradía, procesión, paso, evento y ciudad, y favoritos. Todo lee datos reales; ya no queda ninguna pantalla con mocks.
- **Cofrade:** perfil separado, login con código y envío de su posición cada 30 s.
- **Junta:** perfil y gestión completa de cofradías, procesiones (con recorrido y pasos), eventos y pasos. Puede cancelar y enviar notificaciones.
- **Administrador:** ciudades, juntas, miembros y solicitudes de reactivación.

## Lo que queda, por prioridad

### 🔴 Imprescindible (bloquea funcionalidades clave)
1. **Nada cambia el estado a `EN_CURSO` ni a `FINALIZADO`.** El único cambio de estado que existe es a `CANCELADO` ([ProcesionService.java:145](backend/src/main/java/com/semanasanta/backend/service/ProcesionService.java#L145)). Esto tiene tres consecuencias:
   - Un Cofrade nunca puede empezar a compartir ubicación, porque el backend rechaza el ping si la procesión no está `EN_CURSO` ([PosicionActualService.java:67](backend/src/main/java/com/semanasanta/backend/service/PosicionActualService.java#L67)).
   - Nunca se generan las notificaciones `INICIO` y `FIN`. Están reservadas en `NotificacionService`, pero nada las crea.
   - "Procesión en curso" en Inicio no aparecerá nunca con datos reales.

   Hace falta decidir qué lo dispara. Por ejemplo, botones "Iniciar/Finalizar" en `ProcesionesScreen` que llamen a un endpoint nuevo, que a su vez cree la notificación automática.
2. **La Junta no tiene pantalla para gestionar códigos de acceso.** Los endpoints ya existen (`POST/GET /cofradias/{id}/codigos-acceso` y `POST /codigos-acceso/{id}/revocar`), pero el cliente no los usa. Un Cofrade no tiene forma de conseguir un código desde la app.
3. **Mapa en vivo:** [MapaScreen.js](semanasanta-app/src/ui/screens/ciudadano/Map/MapaScreen.js) sigue siendo un "Próximamente". Ya tienes `expo-dev-client` y `eas.json`. Faltan:
   - instalar una librería de mapas;
   - la API key de Google Maps asociada al SHA-1 de tu build;
   - leer `/procesiones/{id}/ubicacion` y `/estela`;
   - dibujar el recorrido en el detalle de procesión (hoy se muestra como una lista de puntos).
4. **Despliegue en Railway:** no está hecho. [apiClient.js](semanasanta-app/src/infrastructure/api/apiClient.js#L12) solo conoce `localhost` y la IP de tu red local, así que una build instalada fuera de Expo no encontrará el backend. En Railway hay que configurar `JWT_SECRET`, `ADMIN_BOOTSTRAP_SECRET`, `MAIL_USERNAME` y `MAIL_PASSWORD`.

### 🟡 Importante para la entrega
5. **Pruebas:** en el backend solo existe el test que viene por defecto (`BackendApplicationTests`), y el capítulo [memoria/70_pruebas](memoria/70_pruebas/1_pruebas.tex) está vacío (38 bytes). Merecerían tests como mínimo:
   - `GeometriaRuta` y la estela;
   - las comprobaciones de rol y de ciudad;
   - el login con código;
   - `GpxParser`.
6. **Terminar el cambio de imagen de cofradía** (V41, sin commitear). Igual que en `Paso`, la imagen es una URL escrita a mano: no hay subida de ficheros, y Firebase Storage, que la memoria da como previsto, no se usa. O se implementa la subida o se actualiza la memoria.
7. **Actualizar la memoria del TFG:** el diagrama de dominio y el Apéndice C arrastran muchas diferencias con lo construido. Por ejemplo:
   - la relación N:M entre `Evento` y `Cofradia`;
   - `Notificacion` como una sola clase;
   - el Cofrade sin fila en `usuarios`;
   - el push por Expo en vez de Firebase Cloud Messaging.

### 🟢 Limpieza / mejoras
8. Borrar los mocks que ya no usa nadie: `data/mock/{ciudades,cofradias,eventos,pasos,procesiones}.js`. Solo se sigue usando `diasSemanaSanta`.
9. Comentarios obsoletos:
   - "sigue en mock" en `DetailPasoScreen` y `DetailCofradiaScreen`;
   - el TODO de Firestore en `diaService`;
   - "llegará en la Iteración 2" en el mapa.
10. Cuando caduca el token (24 h) no se renueva ni se cierra la sesión automáticamente.
11. En los listados, la ubicación y el recorrido no se cargan; solo se ven en las pantallas de detalle.

**Mi recomendación de orden:** 1 → 2, que son pequeños y juntos desbloquean el flujo del Cofrade. Después 4, porque sin despliegue no puedes enseñar la app en un móvil real fuera de tu red. Luego 3, que es lo más costoso, y 5 y 7 para la memoria.

Si quieres, empiezo por el punto 1 (endpoint para iniciar o finalizar con su notificación automática, más los botones en el panel de Junta).