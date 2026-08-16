package com.semanasanta.backend.seed;

import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.Paso;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.model.PuntoDeInteres;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.model.TipoPuntoInteres;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.CiudadRepository;
import com.semanasanta.backend.repository.CofradiaRepository;
import com.semanasanta.backend.repository.EventoRepository;
import com.semanasanta.backend.repository.PasoRepository;
import com.semanasanta.backend.repository.ProcesionRepository;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoPuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoRepository;
import com.semanasanta.backend.repository.UbicacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// Seed de datos de ejemplo, SOLO se ejecuta con el perfil "seed" activo (ver
// "cómo ejecutarlo" en la respuesta que acompaña a este archivo) -- en
// arranque normal (mvn spring-boot:run, sin perfil) este bean ni se crea, no
// hay riesgo de sembrar datos por accidente en un arranque cualquiera.
//
// Idempotente por "buscar antes de crear": cada entidad se localiza primero
// por su clave natural (nombre, dentro del ámbito que corresponda -una
// ciudad, una cofradía...) y solo se crea si no existe ya. Volver a ejecutar
// este seed las veces que haga falta no duplica nada; tampoco actualiza filas
// ya existentes (si cambias un texto aquí y reejecutas, la fila vieja se
// queda como estaba -bórrala a mano si quieres que se regenere).
//
// 2026-08-16: los textos marcados "(fuente: jcssva.org)" son RESÚMENES
// PROPIOS -no copia literal- de contenido publicado en la web oficial de la
// Junta de Cofradías de Semana Santa de Valladolid (https://jcssva.org/),
// consultada esa fecha; pueden quedar desactualizados si la web cambia, y no
// sustituyen a la fuente original. Los campos que la web no detallaba
// (horas exactas no confirmadas, análisis artístico de algunos pasos...)
// siguen marcados explícitamente como "[Dato de ejemplo]", nunca se
// presentan como si fueran oficiales. Coordenadas de Valladolid aproximadas
// al centro de la ciudad, sin verificar punto a punto.
@Component
@Profile("seed")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String FUENTE = " (fuente: jcssva.org, resumen propio, no cita literal)";

    private final CiudadRepository ciudadRepository;
    private final CofradiaRepository cofradiaRepository;
    private final PasoRepository pasoRepository;
    private final UbicacionRepository ubicacionRepository;
    private final EventoRepository eventoRepository;
    private final ProcesionRepository procesionRepository;
    private final RecorridoRepository recorridoRepository;
    private final PuntoRutaRepository puntoRutaRepository;
    private final RecorridoPuntoRutaRepository recorridoPuntoRutaRepository;

    public DataSeeder(CiudadRepository ciudadRepository, CofradiaRepository cofradiaRepository,
                       PasoRepository pasoRepository, UbicacionRepository ubicacionRepository,
                       EventoRepository eventoRepository, ProcesionRepository procesionRepository,
                       RecorridoRepository recorridoRepository, PuntoRutaRepository puntoRutaRepository,
                       RecorridoPuntoRutaRepository recorridoPuntoRutaRepository) {
        this.ciudadRepository = ciudadRepository;
        this.cofradiaRepository = cofradiaRepository;
        this.pasoRepository = pasoRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.eventoRepository = eventoRepository;
        this.procesionRepository = procesionRepository;
        this.recorridoRepository = recorridoRepository;
        this.puntoRutaRepository = puntoRutaRepository;
        this.recorridoPuntoRutaRepository = recorridoPuntoRutaRepository;
    }

    // Punto de un recorrido, sin persistir todavía: se persiste dentro de
    // procesion(), en el momento de construir el Recorrido al que pertenece
    // (necesita el Recorrido ya guardado para poder enlazarlo).
    private record PuntoSeed(TipoPuntoInteres tipo, String nombre, Ubicacion ubicacion, LocalDateTime horaPrevista) {
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Seed de datos de ejemplo: empezando ===");

        // Las 10 ciudades pedidas. Solo Valladolid recibe datos de Semana
        // Santa completos; el resto se queda con el registro básico -tal
        // como se pidió explícitamente.
        Ciudad valladolid = ciudad("Valladolid", "Castilla y León",
                "Ciudad de Castilla y León. Su Semana Santa está declarada Fiesta de Interés Turístico "
                        + "Internacional y se organiza cada año en torno a las procesiones de sus cofradías y hermandades.");
        ciudad("Sevilla", "Andalucía", null);
        ciudad("Málaga", "Andalucía", null);
        ciudad("Zamora", "Castilla y León", null);
        ciudad("Cuenca", "Castilla-La Mancha", null);
        ciudad("León", "Castilla y León", null);
        ciudad("Salamanca", "Castilla y León", null);
        ciudad("Toledo", "Castilla-La Mancha", null);
        ciudad("Murcia", "Región de Murcia", null);
        ciudad("Granada", "Andalucía", null);

        sembrarSemanaSantaDeValladolid(valladolid);

        log.info("=== Seed de datos de ejemplo: terminado ===");
    }

    private void sembrarSemanaSantaDeValladolid(Ciudad valladolid) {
        // Lugares reutilizados por varios eventos/procesiones/puntos de
        // ruta (misma iglesia/plaza real, no una fila nueva cada vez que se
        // menciona). Coordenadas aproximadas del centro de Valladolid, sin
        // verificar punto a punto.
        Ubicacion iglesiaVeraCruz = ubicacion("Iglesia Penitencial de la Santa Vera Cruz, Valladolid", 41.6510, -4.7260);
        Ubicacion catedral = ubicacion("Catedral de Valladolid", 41.6523, -4.7245);
        Ubicacion iglesiaEsclavas = ubicacion("Iglesia de las Esclavas del Sagrado Corazón de Jesús, Valladolid", 41.6480, -4.7300);
        Ubicacion plazaElSalvador = ubicacion("Plaza de El Salvador, Valladolid", 41.6495, -4.7275);
        Ubicacion calleRegalado = ubicacion("Calle Regalado, Valladolid", 41.6512, -4.7255);
        Ubicacion basilicaGranPromesa = ubicacion("Basílica Nacional de la Gran Promesa, Valladolid", 41.6528, -4.7220);
        Ubicacion capillaColegioSantaCruz = ubicacion("Capilla del Colegio de Santa Cruz, Valladolid", 41.6529, -4.7231);

        // Cofradías -- nombres oficiales completos y reseña histórica
        // resumida de jcssva.org (ver FUENTE). El seed anterior tenía solo
        // dos cofradías y atribuía "La Peregrinación de la Promesa" a la
        // Universitaria del Cristo de la Luz: la web oficial deja claro que
        // esa procesión es TITULAR de una tercera hermandad distinta (la de
        // Jesús Atado a la Columna), así que se añade aquí.
        Cofradia veraCruz = cofradia(valladolid, "Cofradía Penitencial de la Santa Vera Cruz",
                "Cofradía cuya fecha exacta de fundación se desconoce; la documentación conservada ya la sitúa "
                        + "activa en 1498, por lo que debió constituirse en la segunda mitad del siglo XV. Su sede es "
                        + "la Iglesia Penitencial de la Santa Vera Cruz." + FUENTE,
                "https://www.veracruzvalladolid.es/");
        Cofradia universitaria = cofradia(valladolid, "Hermandad Universitaria del Santísimo Cristo de la Luz",
                "Fundada el 20 de marzo de 1941 a petición del entonces rector de la Universidad de Valladolid, "
                        + "Cayetano Mergelina, para dar culto al Santísimo Cristo de la Luz en la capilla del Colegio "
                        + "de Santa Cruz. Dejó de procesionar en 1965; fue reorganizada en 1992 por estudiantes de "
                        + "Derecho y Magisterio, volvió a salir a la calle el Jueves Santo de 1994 y desde 1996 "
                        + "participa también en la Procesión General del Viernes Santo." + FUENTE,
                "https://jcssva.org/cofradias/cristo-de-la-luz-n20/");
        Cofradia atadoColumna = cofradia(valladolid, "Hermandad Penitencial de Nuestro Padre Jesús Atado a la Columna",
                "Hermandad cuyo origen se remonta a las Congregaciones Marianas; en 1923 el arzobispo Gandásegui "
                        + "encomendó a los \"Luises\" el acompañamiento de este paso en la procesión general del "
                        + "Santo Entierro. Es hermandad titular de la Peregrinación de la Promesa desde 1965. Desde "
                        + "noviembre de 2023 tiene su sede en la Iglesia de las Esclavas del Sagrado Corazón de Jesús."
                        + FUENTE,
                "https://jcssva.org/cofradias/atado-a-la-columna-n13/");

        // Pasos -- los dos de la Vera Cruz son reales (propiedad confirmada
        // en jcssva.org), no los "Cristo de la Sentencia"/"Esperanza" que
        // había antes (esos nombres no aparecen en la web oficial: se han
        // quitado en vez de mantenerlos sin poder respaldarlos).
        Paso atadoColumnaPaso = paso(veraCruz, "El Señor Atado a la Columna",
                "Talla de Gregorio Fernández, hacia 1619, propiedad de la Cofradía de la Santa Vera Cruz. Sale en "
                        + "préstamo en la Peregrinación de la Promesa: la hermandad organizadora lo recoge en la "
                        + "Iglesia Penitencial de la Vera Cruz al paso de la procesión." + FUENTE,
                textoDeEjemplo("Análisis artístico", "El Señor Atado a la Columna"));
        Paso oracionHuerto = paso(veraCruz, "La Oración del Huerto",
                "Talla de Andrés Solanes, hacia 1628-1629, propiedad de la Cofradía de la Santa Vera Cruz." + FUENTE,
                textoDeEjemplo("Análisis artístico", "La Oración del Huerto"));
        Paso cristoLuz = paso(universitaria, "Santísimo Cristo de la Luz",
                "Talla de Gregorio Fernández, hacia 1630-1633. Concebida en origen como imagen de altar para el "
                        + "Monasterio de San Benito el Real; pasó en 1940 a la capilla del Colegio de Santa Cruz, "
                        + "sede de la Hermandad Universitaria. El 4 de mayo de 1896 volvió brevemente al monasterio "
                        + "para presidir el funeral del poeta José Zorrilla." + FUENTE,
                "Considerada una de las tallas más logradas de Gregorio Fernández -el crítico Isidoro Bosarte llegó "
                        + "a decir que esta obra por sí sola bastaría para sostener su fama-. El rostro demacrado, "
                        + "los ojos hundidos, el torso enjuto con las costillas marcadas y la espalda lacerada buscan "
                        + "transmitir el sufrimiento extremo del suplicio." + FUENTE);

        // Eventos (actos que no son procesión). Nombres distintos de los de
        // cualquier procesión a propósito: Evento y Procesion viven en la
        // misma tabla física ("eventos", herencia JOINED), así que la
        // comprobación de "ya existe" por nombre necesita que sean inequívocos.
        evento("Solemne Traslado del Santísimo Cristo de la Luz", universitaria, capillaColegioSantaCruz,
                LocalDateTime.of(2027, 3, 26, 23, 15), // Viernes Santo, al acabar la Procesión General
                "Desde 2009, al finalizar la Procesión General del Viernes Santo, la imagen del Santísimo Cristo de "
                        + "la Luz regresa en solemne traslado a la capilla del Colegio de Santa Cruz." + FUENTE,
                "Hora orientativa: la web oficial no fija un horario exacto para este traslado, solo que ocurre "
                        + "al finalizar la Procesión General." + FUENTE);
        evento("Renovación de la Promesa", atadoColumna, basilicaGranPromesa,
                LocalDateTime.of(2027, 3, 23, 23, 40), // Martes Santo, parada de la Peregrinación
                "Durante la Peregrinación de la Promesa, la comitiva se detiene en la Basílica Nacional de la Gran "
                        + "Promesa para el acto de Renovación de la Promesa, antes de regresar al templo de salida." + FUENTE,
                "Hora estimada dentro de la ventana de la procesión (22:30-01:00); la web oficial no publica el "
                        + "minutaje exacto de esta parada." + FUENTE);

        // Procesiones, cada una con su propio recorrido y sus puntos en orden.
        procesion("La Peregrinación de la Promesa", atadoColumna, List.of(atadoColumnaPaso),
                iglesiaEsclavas,
                LocalDateTime.of(2027, 3, 23, 22, 30), LocalDateTime.of(2027, 3, 24, 1, 0), // Martes Santo, 22:30 confirmada
                "Procesión titular de la Hermandad de Nuestro Padre Jesús Atado a la Columna desde 1965. Sale a las "
                        + "22:30 de Martes Santo." + FUENTE,
                "Recorre Plaza de El Salvador, Castelar y Regalado hasta la Catedral, se detiene en la Iglesia "
                        + "Penitencial de la Santa Vera Cruz para recoger el paso de El Señor Atado a la Columna, "
                        + "continúa hasta la Basílica Nacional de la Gran Promesa (Renovación de la Promesa) y "
                        + "regresa al punto de salida." + FUENTE,
                1500.0, 150,
                List.of(
                        new PuntoSeed(TipoPuntoInteres.SALIDAPROCESION, "Salida: Iglesia de las Esclavas del Sagrado Corazón de Jesús",
                                iglesiaEsclavas, LocalDateTime.of(2027, 3, 23, 22, 30)),
                        new PuntoSeed(TipoPuntoInteres.ENCUENTRO, "Plaza de El Salvador",
                                plazaElSalvador, LocalDateTime.of(2027, 3, 23, 22, 45)),
                        new PuntoSeed(TipoPuntoInteres.ENCUENTRO, "Calle Regalado",
                                calleRegalado, LocalDateTime.of(2027, 3, 23, 23, 0)),
                        new PuntoSeed(TipoPuntoInteres.IGLESIA, "Catedral de Valladolid",
                                catedral, LocalDateTime.of(2027, 3, 23, 23, 10)),
                        new PuntoSeed(TipoPuntoInteres.IGLESIA, "Iglesia Penitencial de la Santa Vera Cruz (recogida del paso)",
                                iglesiaVeraCruz, LocalDateTime.of(2027, 3, 23, 23, 20)),
                        new PuntoSeed(TipoPuntoInteres.UBICACIONEVENTO, "Basílica Nacional de la Gran Promesa (Renovación de la Promesa)",
                                basilicaGranPromesa, LocalDateTime.of(2027, 3, 23, 23, 40)),
                        new PuntoSeed(TipoPuntoInteres.ENTRADAPROCESION, "Entrada: Iglesia de las Esclavas del Sagrado Corazón de Jesús",
                                iglesiaEsclavas, LocalDateTime.of(2027, 3, 24, 1, 0))
                ));

        procesion("Procesión General del Viernes Santo", veraCruz, List.of(oracionHuerto),
                iglesiaVeraCruz,
                LocalDateTime.of(2027, 3, 26, 18, 0), LocalDateTime.of(2027, 3, 26, 23, 0), // Viernes Santo
                "Procesión general del Viernes Santo en la que participan varias cofradías vallisoletanas, entre "
                        + "ellas la Santa Vera Cruz -que procesiona con su imagen titular- y, desde 1996, la "
                        + "Hermandad Universitaria del Santísimo Cristo de la Luz." + FUENTE,
                "Hora de salida y recorrido detallado orientativos: la web oficial confirma la participación "
                        + "conjunta de ambas hermandades pero no publica el itinerario completo ni el horario "
                        + "exacto de esta procesión concreta." + FUENTE,
                4100.0, 300,
                List.of(
                        new PuntoSeed(TipoPuntoInteres.SALIDAPROCESION, "Salida: Iglesia Penitencial de la Santa Vera Cruz",
                                iglesiaVeraCruz, LocalDateTime.of(2027, 3, 26, 18, 0)),
                        new PuntoSeed(TipoPuntoInteres.IGLESIA, "Catedral de Valladolid",
                                catedral, LocalDateTime.of(2027, 3, 26, 20, 0)),
                        new PuntoSeed(TipoPuntoInteres.ENTRADAPROCESION, "Entrada: Iglesia Penitencial de la Santa Vera Cruz",
                                iglesiaVeraCruz, LocalDateTime.of(2027, 3, 26, 23, 0))
                ));

        // El Cristo de la Luz también procesiona por su cuenta la mañana del
        // Jueves Santo (fuente: jcssva.org), pero al no tener recorrido/hora
        // detallados en la web se deja fuera de este seed -mejor no
        // incluirla que rellenarla con datos inventados.
    }

    // ---- Helpers "buscar antes de crear" (idempotencia) ----

    private Ciudad ciudad(String nombre, String comunidadAutonoma, String descripcion) {
        return ciudadRepository.findAll().stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElseGet(() -> {
                    log.info("Creando ciudad '{}'", nombre);
                    return ciudadRepository.save(new Ciudad(nombre, comunidadAutonoma, descripcion));
                });
    }

    private Ubicacion ubicacion(String direccion, double latitud, double longitud) {
        return ubicacionRepository.findAll().stream()
                .filter(u -> direccion.equals(u.getDireccion()))
                .findFirst()
                .orElseGet(() -> ubicacionRepository.save(new Ubicacion(latitud, longitud, direccion)));
    }

    private Cofradia cofradia(Ciudad ciudad, String nombre, String historia, String web) {
        return cofradiaRepository.findByCiudadId(ciudad.getId()).stream()
                .filter(c -> c.getNombre().equals(nombre))
                .findFirst()
                .orElseGet(() -> {
                    log.info("Creando cofradía '{}'", nombre);
                    return cofradiaRepository.save(new Cofradia(nombre, historia, web, LocalDateTime.now(), ciudad));
                });
    }

    private Paso paso(Cofradia cofradia, String nombre, String historia, String analisisArtistico) {
        return pasoRepository.findByCofradiaId(cofradia.getId()).stream()
                .filter(p -> p.getNombre().equals(nombre))
                .findFirst()
                .orElseGet(() -> {
                    log.info("Creando paso '{}'", nombre);
                    return pasoRepository.save(new Paso(nombre, historia, analisisArtistico, null, cofradia));
                });
    }

    private void evento(String nombre, Cofradia organiza, Ubicacion ubicacion, LocalDateTime fecha,
                         String historia, String tradicion) {
        boolean yaExiste = eventoRepository.findDistinctByCofradias_Id(organiza.getId()).stream()
                .anyMatch(e -> e.getNombre().equals(nombre));
        if (yaExiste) {
            log.info("Evento '{}' ya existe, se omite", nombre);
            return;
        }
        log.info("Creando evento '{}'", nombre);
        Evento evento = new Evento(nombre, historia, tradicion, fecha, ubicacion);
        evento.addCofradia(organiza);
        eventoRepository.save(evento);
    }

    private void procesion(String nombre, Cofradia cofradia, List<Paso> pasos, Ubicacion ubicacionSalida,
                            LocalDateTime fechaInicio, LocalDateTime fechaFin, String historia, String tradicion,
                            Double distanciaTotalMetros, Integer tiempoEstimadoMin, List<PuntoSeed> puntos) {
        boolean yaExiste = procesionRepository.findDistinctByCofradias_Id(cofradia.getId()).stream()
                .anyMatch(p -> p.getNombre().equals(nombre));
        if (yaExiste) {
            log.info("Procesión '{}' ya existe, se omite", nombre);
            return;
        }
        log.info("Creando procesión '{}'", nombre);

        Recorrido recorrido = recorridoRepository.save(new Recorrido(distanciaTotalMetros, tiempoEstimadoMin));
        int orden = 1;
        for (PuntoSeed puntoSeed : puntos) {
            PuntoRuta punto = puntoRutaRepository.save(
                    new PuntoDeInteres(puntoSeed.tipo(), puntoSeed.nombre(), null, null, puntoSeed.ubicacion()));
            recorridoPuntoRutaRepository.save(new RecorridoPuntoRuta(recorrido, punto, orden++, puntoSeed.horaPrevista()));
        }

        // "fecha" (heredado de Evento) se hace coincidir con la salida real:
        // para una procesión ya en marcha no tiene sentido que difieran.
        Procesion procesion = new Procesion(nombre, historia, tradicion, fechaInicio, ubicacionSalida,
                fechaInicio, fechaFin, recorrido);
        procesion.addCofradia(cofradia);
        pasos.forEach(procesion::addPaso);
        procesionRepository.save(procesion);
    }

    // Texto libre EXPLÍCITAMENTE de relleno para lo que la web oficial no
    // detalla (p.ej. análisis artístico de un paso concreto): nunca se
    // presenta como dato verificado.
    private String textoDeEjemplo(String etiqueta, String nombreEntidad) {
        return "[Dato de ejemplo] " + etiqueta + " de \"" + nombreEntidad
                + "\" pendiente de completar con contenido verificado.";
    }
}
