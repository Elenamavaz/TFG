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