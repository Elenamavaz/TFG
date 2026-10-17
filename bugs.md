# Registro de bugs

Análisis del código de la app (`semanasanta-app`) y del backend (`backend`) realizado el 2026-10-16, mientras se probaba la aplicación en el móvil. Los números se mantienen fijos para poder referirse a cada bug; los nuevos se añaden al final con el siguiente número.

**Estados:** ✅ Resuelto · ⏳ Pendiente

| Prioridad | Total | Resueltos | Pendientes |
|---|---|---|---|
| 🔴 Crítica | 5 | 5 | 0 |
| 🟠 Alta | 7 | 6 | 1 |
| 🟡 Media | 15 | 0 | 15 |
| 🟢 Baja | 7 | 0 | 7 |

---

## 🔴 Críticos

### 1. ✅ La app se cierra al entrar como cofrade
- **Dónde:** `semanasanta-app/src/ui/screens/cofrade/Profile/PerfilCofradeScreen.js`
- **Qué pasaba:** el título usaba `ciudad?.nombre`, pero la variable `ciudad` no existía. Eso provocaba un `ReferenceError` al pintar la pantalla, en cuanto se iniciaba sesión con un código. Se introdujo en el commit "Cambiar formularior".
- **Solución:** la pantalla carga la ciudad a partir de la cofradía del cofrade (`getCiudadPorId(cofradia.ciudadId)`).
- **Cómo comprobarlo:** iniciar sesión como cofrade. Se ve "La Semana Santa de <ciudad>".

### 2. ✅ Cualquier usuario autenticado podía borrar administradores
- **Dónde:** `backend/.../service/AdministradorService.java` (`eliminar`)
- **Qué pasaba:** no se llamaba a `exigirAdministrador()`. Con un token de Junta, o incluso de cofrade, `DELETE /administradores/{id}` funcionaba.
- **Solución:** se exige el rol de Administrador.
- **Tests:** `AdministradorServiceTest.soloUnAdministradorPuedeEliminarAdministradores`, `unAdministradorPuedeEliminarOtro`.

### 3. ✅ Email y teléfono de administradores y miembros de Junta eran públicos
- **Dónde:** `SecurityConfig.java`, `AdministradorService`, `MiembroJuntaCofradiaService`
- **Qué pasaba:** todo GET era público. Sin iniciar sesión se podían leer `GET /administradores/{id}`, `GET /miembros-junta/{id}` y `GET /juntas-cofradias/{id}/miembros`.
- **Solución:**
  - Esas rutas exigen sesión (`SecurityConfig`).
  - Un administrador solo lo consulta otro administrador (`AdministradorService.consultar`).
  - Un miembro lo consultan un administrador o el propio miembro (`MiembroJuntaCofradiaService.consultar`).
  - La lista de miembros de una Junta es solo para el administrador.
- **Tests:** `SeguridadApiTest.losDatosPersonalesDeAdministradoresYMiembrosNoSonPublicos`, `MiembroJuntaCofradiaServiceTest.unMiembroNoPuedeConsultarLosDatosDeOtro` y otros.

### 4. ✅ Eliminar algo con datos asociados fallaba sin avisar
- **Dónde:** migraciones (sin `ON DELETE CASCADE`), `GlobalExceptionHandler`, `ProcesionService`, `CiudadService` y los `confirmarEliminar` de 8 pantallas de la app.
- **Qué pasaba:** al borrar una cofradía con pasos, una ciudad con cofradías o una procesión con pings GPS, la clave foránea lo impedía y el backend respondía 500. La app no capturaba el error y no pasaba nada.
- **Solución:**
  - El fallo de integridad se traduce a 409 con el mensaje "No se puede eliminar porque todavía tiene datos asociados… Elimínalos primero."
  - Al eliminar una procesión se borran antes sus pings (son su histórico).
  - Al eliminar una ciudad se borran sus avisos y dispositivos push. Si aún tiene Junta o cofradías, no se elimina y se explica por qué.
  - Las 8 pantallas con "Eliminar" muestran una alerta con el motivo.
- **Decisión:** se **bloquea** el borrado en vez de borrar en cascada pasos, eventos o miembros, para no perder datos sin avisar.
- **Tests:** `CiudadServiceTest` (3 de eliminar), `ProcesionServiceTest.eliminarCompruebaLaJuntaDeLaCiudadAntesDeBorrar`, `SeguridadApiTest.eliminarAlgoConDatosAsociadosDevuelve409ConMensajeEnVezDe500`.

### 5. ✅ Email duplicado → error 500
- **Dónde:** `AdministradorService.exigirEmailLibre`, `UsuarioRepository.existsByEmailIgnoreCase`, `FormularioMiembroScreen.js`
- **Qué pasaba:** crear un administrador o un miembro con un email ya registrado chocaba con el `UNIQUE` de la base de datos.
- **Solución:** antes de crear (también en el bootstrap) se comprueba el email sin distinguir mayúsculas y se responde 409 "Ya existe un usuario registrado con el email …". En el formulario de miembro, el error aparece bajo el campo de correo.
- **Tests:** `AdministradorServiceTest.noSePuedeCrearUnAdministradorConUnEmailYaRegistrado`, `MiembroJuntaCofradiaServiceTest.noSePuedeCrearUnMiembroConUnEmailYaRegistrado`.

---

## 🟠 Altos

### 6. ✅ El cofrade dejaba de enviar su ubicación al bloquear el móvil
- **Dónde:** `CofradeContext.js`, nuevo `data/services/seguimientoService.js`, `app.json`
- **Qué pasaba:** los pings salían de un `setInterval` de JavaScript, que se detiene con la pantalla bloqueada o la app en segundo plano.
- **Solución:**
  - Tarea de ubicación en segundo plano con `expo-task-manager` + `Location.startLocationUpdatesAsync`. En Android funciona como servicio en primer plano, con la notificación "Compartiendo ubicación".
  - Envía un ping cada ~30 s y se detiene sola si el backend responde 410 (procesión terminada) o 401/403 (sesión caducada o código revocado). El motivo se muestra al volver a la app.
  - Si el usuario no permite la ubicación "Todo el tiempo", se vuelve al modo anterior (solo con la app abierta) y se le avisa.
  - En `app.json`: permisos `ACCESS_BACKGROUND_LOCATION` y `FOREGROUND_SERVICE_LOCATION`, `isAndroidBackgroundLocationEnabled`, `isIosBackgroundLocationEnabled` y nuevo texto de permiso.
- **⚠️ Requiere un build nativo nuevo** (development build o APK con EAS): no funciona en Expo Go ni con el build actual. Si se publica en Google Play, el permiso de ubicación en segundo plano pasa revisión.
- **Cómo comprobarlo:** con una procesión EN_CURSO, activar la ubicación compartida, conceder "Permitir todo el tiempo", bloquear el móvil 2–3 minutos y ver en el mapa que la posición avanza.

### 7. ✅ En recorridos circulares la estela aparecía completa desde la salida
- **Dónde:** `GeometriaRuta.java`, `PosicionActualService.estela`
- **Qué pasaba:** casi todas las procesiones vuelven a su templo, así que salida y llegada son el mismo punto. Un ping junto al templo podía proyectarse sobre el último tramo (progreso 1.0) y, como la marca de agua nunca retrocede, la estela quedaba entera. Pasaba igual en recorridos que se cruzan.
- **Solución:** `proyectar(ruta, lat, lon, progresoMin, progresoMax)`.
  - Entre tramos casi igual de cercanos (margen de 30 m) y separados más de 100 m a lo largo de la ruta, gana el que encaja con lo ya recorrido.
  - Dentro del mismo tramo de ruta se sigue eligiendo el más cercano, así que la referencia no retrasa la estela.
  - Sin referencia, el resultado es el mismo que antes.
- **Tests:** `GeometriaRutaTest` (5 nuevos: salida y llegada en un recorrido circular, GPX con puntos muy seguidos, y equivalencia con el comportamiento anterior).

### 8. ✅ Sesión caducada sin aviso
- **Dónde:** `SecurityConfig` (entry point), `apiClient.js`, `sesionService.js`, `AuthContext.js`, `RootNavigator.js`, `LoginScreen.js`, nuevo `ui/navigation/navigationRef.js`
- **Qué pasaba:** el JWT dura 24 h. Al día siguiente, la Junta o el administrador seguían en su panel y cada acción fallaba con "Error 403 al llamar a /…". Además, el backend respondía 403 sin cuerpo cuando no había token.
- **Solución:**
  - El backend responde **401** con `{"mensaje": "Tu sesión ha caducado…", "sesionInvalida": true}`. Esto lo distingue del 401 por contraseña incorrecta, que no cierra la sesión.
  - Al arrancar, la app lee la fecha de expiración del JWT guardado. Si ha caducado, borra la sesión y abre el inicio de sesión con el aviso.
  - Durante el uso, el primer 401 con `sesionInvalida` cierra la sesión y lleva al inicio de sesión desde cualquier pantalla.
- **Tests:** `SeguridadApiTest.escribirSinTokenSeRechazaSinLlegarAlServicio` (401 + `sesionInvalida`), `unaContrasenaIncorrectaEsUn401SinMarcaDeSesionInvalida`.

### 9. ✅ Una Junta desactivada seguía pudiendo modificar datos
- **Dónde:** `MiembroJuntaCofradiaService.exigirJunta`
- **Qué pasaba:** se comprobaba que el miembro estuviera activo, pero no su Junta (`JuntaCofradias.activa`).
- **Solución:** si la Junta está desactivada, cualquier escritura devuelve 403 "La Junta de Cofradías de tu ciudad está desactivada".
- **Decisión:** desactivar la **ciudad** no bloquea a su Junta, a propósito. Así el administrador puede ocultarla a los ciudadanos mientras la Junta la prepara.
- **Tests:** `MiembroJuntaCofradiaServiceTest.exigirJuntaRechazaAUnMiembroActivoDeUnaJuntaDesactivada`.

### 10. ✅ Un código revocado seguía sirviendo hasta 24 h
- **Dónde:** `UsuarioPrincipal`, `JwtService`, `JwtAuthenticationFilter`, `AuthService`, `PosicionActualService`, texto de `CodigosAccesoScreen.js`
- **Qué pasaba:** revocar solo impedía volver a iniciar sesión. El JWT ya emitido seguía valiendo para enviar pings, también en otras procesiones.
- **Solución:**
  - El JWT del cofrade incluye `codigoId`. En cada ping se comprueba que el código no esté revocado y que la cofradía siga activa; si no, 403 con el motivo.
  - No se puede iniciar sesión con el código de una cofradía desactivada.
  - Los JWT de cofrade emitidos antes de este cambio (sin `codigoId`) se rechazan y piden volver a entrar.
- **Tests:** `PosicionActualServiceTest.conUnCodigoRevocadoDespuesDeEntrarYaNoSeAceptanPings`, `siLaCofradiaSeDesactivaYaNoSeAceptanPings`, `unJwtDeCofradeSinCodigoSeRechaza`, `AuthServiceTest.elCodigoDeUnaCofradiaDesactivadaNoPermiteEntrar`, `JwtServiceTest.elTokenDeUnCofradeLlevaElCodigoDeAccesoYElDelRestoNo`.

### 11. ✅ Errores de formato sin mensaje ("Revisa los campos marcados" sin ningún campo marcado)
- **Dónde:** `GlobalExceptionHandler`
- **Qué pasaba:** una fecha mal formada, un enum inválido o un JSON roto llegaban a la app con el cuerpo por defecto de Spring, sin `mensaje`.
- **Solución:** handlers para:
  - `HttpMessageNotReadableException`: "El campo "fecha" no tiene un formato válido.", con el nombre del campo sacado de la ruta de Jackson 3.
  - `MethodArgumentTypeMismatchException` y `MissingServletRequestParameterException`.
  - `MaxUploadSizeExceededException` (413, "El archivo es demasiado grande").
- **Tests:** `SeguridadApiTest$ErroresDeFormato` (3 tests).

### 12. ⏳ Más de 100 dispositivos en una ciudad → no llega ningún push
- **Dónde:** `PushNotificacionService.enviarACiudad`
- **Qué pasa:** la API de Expo acepta como máximo 100 mensajes por petición y se envían todos en una. Además, el envío es síncrono: bloquea la respuesta HTTP y la tarea automática de cada minuto.
- **Propuesta:** enviar en lotes de 100 y de forma asíncrona (`@Async`, o tras el commit).

---

## 🟡 Medios

13. ⏳ **Semana Santa fija en 2027.** Los días salen de un mock (`data/mock/diasSemanaSanta.js`, 21–28 de marzo de 2027). No se puede crear nada en otras fechas y, para las pruebas, los cambios automáticos de estado no se dispararán hasta 2027: hay que cambiar el estado a mano.
14. ⏳ **Estadísticas a 0.** `numCofrades` y `numProcesiones` no existen en el backend ni en el modelo `Ciudad`: Inicio muestra "0 Cofrades" y el perfil del ciudadano "0 procesiones".
15. ⏳ **Favoritos no persistentes.** `FavoritosContext` solo los guarda en memoria y se pierden al cerrar la app.
16. ⏳ **Corazón decorativo en los detalles.** El icono de la cabecera de procesión, evento, cofradía y paso no hace nada.
17. ⏳ **Avisos que no caducan.** Los "Ha comenzado" / "Ha finalizado" se crean sin `fechaExpiracion` y se acumulan para siempre en el carrusel de Inicio.
18. ⏳ **Una sola procesión en curso.** `getProcesionEnCurso` devuelve solo la primera; Viernes Santo suele haber varias a la vez.
19. ⏳ **"Hoy" en UTC.** Inicio calcula hoy con `toISOString()`: entre las 00:00 y las 02:00 (hora de España) toma el día anterior.
20. ⏳ **Calendario sin refrescar.** Carga los datos con `useEffect` en vez de `useFocusEffect`: los cambios de la Junta no aparecen hasta cambiar de ciudad.
21. ⏳ **Mapa sin actualizar.** No se recentra al cambiar de ciudad (`initialRegion` solo se aplica una vez) y guarda los recorridos en caché sin caducidad: tras reimportar un GPX sigue mostrando la ruta antigua.
22. ⏳ **Agenda de Inicio desordenada.** No se ordena por hora (salen primero las procesiones y luego los eventos), y el título dice "de hoy" aunque se haya elegido otro día.
23. ⏳ **El detalle del evento no muestra la web oficial.**
24. ⏳ **Cofradía desactivada en procesiones.** El formulario de procesión solo carga cofradías activas (`getCofradiasPorCiudad`); el de evento usa `getCofradiasGestion`. Al editar una procesión de una cofradía desactivada, el campo queda vacío y no deja guardar.
25. ⏳ **Recursos sin dueño.** `Recorrido`, `Ubicacion`, `PuntoRuta` y `PuntoDeInteres` solo exigen ser "alguna Junta": la de una ciudad puede editar el recorrido de otra.
26. ⏳ **Recorridos huérfanos.** Importar un GPX crea el recorrido al momento; si se cancela el formulario, o se importa otro, el anterior queda en la base de datos sin procesión.
27. ⏳ **Sin conexión, spinner infinito.** Si el backend no responde al arrancar, la app se queda cargando. Lo mismo en las pantallas de detalle (`return null`) y en muchas listas, cuyas promesas no tienen `.catch`.

## 🟢 Bajos y mejoras

28. ⏳ **Interruptores sin efecto:** los de notificaciones del perfil del ciudadano no se guardan ni cambian los avisos que llegan.
29. ⏳ **Fuerza bruta en el código de acceso:** no hay límite de intentos en `/auth/codigo-acceso` (8 caracteres hexadecimales).
30. ⏳ **JWT sin cifrar:** se guarda en `AsyncStorage` en vez de `expo-secure-store`.
31. ⏳ **Secretos por defecto:** `jwt.secret` y `admin.bootstrap-secret` tienen valores por defecto en `application.properties`. Si falta la variable de entorno en producción, se arranca con un secreto conocido.
32. ⏳ **Logs con SQL:** `spring.jpa.show-sql=true` también en producción.
33. ⏳ **Concurrencia en la estela:** `GET /estela` es público pero escribe en la base de datos; con muchos ciudadanos a la vez, una escritura puede pisar otra con un valor menor.
34. ⏳ **API obsoleta:** `shouldShowAlert` está obsoleto en `expo-notifications`; ahora se usa `shouldShowBanner`/`shouldShowList`.

---

## Bugs encontrados en las pruebas con el móvil

_(Añadir aquí a partir del 35.)_
