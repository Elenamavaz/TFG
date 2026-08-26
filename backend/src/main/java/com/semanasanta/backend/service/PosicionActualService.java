package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.EstelaProcesionResponse;
import com.semanasanta.backend.dto.PosicionActualResponse;
import com.semanasanta.backend.dto.PosicionAgregadaResponse;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofrade;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.PosicionActual;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.repository.PosicionActualRepository;
import com.semanasanta.backend.security.SecurityUtils;
import com.semanasanta.backend.security.UsuarioPrincipal;
import com.semanasanta.backend.util.GeometriaRuta;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PosicionActualService {

    // Ventana de "ahora mismo": los pings más viejos que esto no cuentan para
    // la posición actual calculada (pero siguen en el histórico).
    private static final long VENTANA_SEGUNDOS = 60;

    // Umbral para considerar un ping "dentro" del recorrido marcado. GPS de
    // móvil en calle típicamente erra 5-15m; se deja margen extra porque el
    // cofrade puede ir por la acera, no pegado al centro exacto de la
    // polilínea del recorrido. Ajustable si en pruebas reales resulta corto
    // o largo (2026-08-22, a petición de Elena: los pings fuera de esto no
    // se guardan).
    private static final double DISTANCIA_MAXIMA_AL_RECORRIDO_METROS = 50.0;

    private final PosicionActualRepository posicionActualRepository;
    private final ProcesionService procesionService;
    private final RecorridoPuntoRutaService recorridoPuntoRutaService;

    public PosicionActualService(PosicionActualRepository posicionActualRepository, ProcesionService procesionService,
                                  RecorridoPuntoRutaService recorridoPuntoRutaService) {
        this.posicionActualRepository = posicionActualRepository;
        this.procesionService = procesionService;
        this.recorridoPuntoRutaService = recorridoPuntoRutaService;
    }

    // Registra un ping anónimo (cada ~30s desde el cliente cofrade). No hay
    // actualizar/eliminar: el histórico es de solo-inserción, y no se guarda
    // quién lo mandó -solo se comprueba que puede mandarlo (Cofrade de la
    // cofradía de esta procesión), sin persistir esa identidad en ningún sitio.
    public PosicionActualResponse registrarPing(Long procesionId, Double latitud, Double longitud) {
        Procesion procesion = procesionService.obtener(procesionId); // 404 si la procesión no existe
        Cofrade cofrade = exigirCofradeDeAlgunaCofradiaParticipante(procesion);
        // cofrade.compartiendoUbicacion() es aquí siempre true por construcción
        // (ver Cofrade.autenticado); se deja explícito porque es la condición
        // real de negocio para poder registrar el ping, no un detalle interno.
        if (!cofrade.compartiendoUbicacion()) {
            throw new AccesoDenegadoException("Este cofrade no está compartiendo ubicación");
        }
        // Defensa en el backend, no solo en el cliente (2026-08-21, a
        // petición de Elena): mandar un ping solo tiene sentido mientras la
        // procesión está pasando de verdad -antes de EN_CURSO todavía no ha
        // salido, después ya terminó. La app ya no deja llegar hasta aquí sin
        // que esté EN_CURSO (CofradeContext.validarCodigo), pero un cliente
        // modificado podría saltarse esa comprobación si solo viviera ahí.
        if (procesion.getEstado() != EstadoEvento.EN_CURSO) {
            throw new IllegalStateException(
                    "Solo se puede compartir ubicación mientras la procesión está en curso");
        }
        // Filtro de "fuera de recorrido" (2026-08-22, a petición de Elena):
        // un ping que cae lejos de la ruta marcada -GPS con deriva, alguien
        // que no va en la procesión- no se representa ni se guarda. Se
        // descarta en silencio (ver PosicionActualResponse) en vez de dar un
        // error, porque el ping se manda solo, automáticamente, cada ~30s.
        if (fueraDelRecorrido(procesion, latitud, longitud)) {
            return PosicionActualResponse.descartadoFueraDeRecorrido(procesionId, latitud, longitud);
        }
        PosicionActual ping = new PosicionActual(latitud, longitud, procesion);
        return PosicionActualResponse.from(posicionActualRepository.save(ping));
    }

    // Sin Recorrido asignado (es opcional, ver Procesion.recorrido) no hay
    // contra qué comparar: se deja pasar todo, igual que si el recorrido
    // tuviera menos de 2 puntos (no forma una polilínea real todavía).
    private boolean fueraDelRecorrido(Procesion procesion, double latitud, double longitud) {
        Recorrido recorrido = procesion.getRecorrido();
        if (recorrido == null) {
            return false;
        }
        List<GeometriaRuta.PuntoGeo> puntos = recorridoPuntoRutaService.puntosGeo(recorrido.getId());
        if (puntos.size() < 2) {
            return false;
        }
        GeometriaRuta.Proyeccion proyeccion = GeometriaRuta.proyectar(puntos, latitud, longitud);
        return proyeccion.distanciaMetros() > DISTANCIA_MAXIMA_AL_RECORRIDO_METROS;
    }

    public List<PosicionActual> historico(Long procesionId) {
        procesionService.obtener(procesionId); // 404 si la procesión no existe
        return posicionActualRepository.findByProcesionIdOrderByTimestampDesc(procesionId);
    }

    // "Dónde está la procesión ahora": promedio de los pings de los últimos
    // VENTANA_SEGUNDOS, calculado al vuelo -no hay ninguna fila "la actual"
    // guardada como tal.
    public PosicionAgregadaResponse actual(Long procesionId) {
        procesionService.obtener(procesionId); // 404 si la procesión no existe
        LocalDateTime desde = LocalDateTime.now().minusSeconds(VENTANA_SEGUNDOS);
        List<PosicionActual> pingsRecientes = posicionActualRepository.findByProcesionIdAndTimestampAfter(procesionId, desde);
        if (pingsRecientes.isEmpty()) {
            throw new RecursoNoEncontradoException(
                    "La procesión con id " + procesionId + " no tiene ningún ping de ubicación reciente");
        }
        double latitudMedia = pingsRecientes.stream().mapToDouble(PosicionActual::getLatitud).average().orElseThrow();
        double longitudMedia = pingsRecientes.stream().mapToDouble(PosicionActual::getLongitud).average().orElseThrow();
        return new PosicionAgregadaResponse(latitudMedia, longitudMedia, pingsRecientes.size());
    }

    // La "estela" de la procesión en vivo (2026-08-22, a petición de Elena):
    // a diferencia de actual() -que promedia todos los pings recientes en UN
    // punto-, aquí cada ping reciente se proyecta sobre el recorrido para
    // saber cuánto ha avanzado (ver GeometriaRuta.proyectar), y se calcula
    // el RANGO entre el que menos ha avanzado (cola, el último de la fila) y
    // el que más (cabeza, el primero) -porque una procesión real ocupa un
    // tramo largo, no un punto.
    //
    // Ese rango candidato solo puede EMPUJAR hacia delante la marca de agua
    // guardada en la propia Procesion (progresoColaAlcanzado/
    // progresoCabezaAlcanzado, ver Procesion): nunca se guarda un valor
    // menor que el que ya había. Si no, un corte de cobertura de unos
    // segundos del cofrade que iba en cabeza o en cola (móvil bloqueado,
    // calle estrecha sin señal) haría que su último ping "caducase" al
    // salir de la ventana de VENTANA_SEGUNDOS, y la estela pintada en el
    // mapa saltaría hacia delante o hacia atrás sin que nadie haya andado
    // ese tramo de verdad. Con la marca de agua, en ese caso simplemente se
    // devuelve el último valor conocido -no retrocede, no salta.
    public EstelaProcesionResponse estela(Long procesionId) {
        Procesion procesion = procesionService.obtener(procesionId); // 404 si la procesión no existe
        Recorrido recorrido = procesion.getRecorrido();
        if (recorrido == null) {
            throw new RecursoNoEncontradoException(
                    "La procesión con id " + procesionId + " no tiene recorrido asignado");
        }
        List<GeometriaRuta.PuntoGeo> puntos = recorridoPuntoRutaService.puntosGeo(recorrido.getId());
        if (puntos.size() < 2) {
            throw new RecursoNoEncontradoException(
                    "El recorrido de la procesión con id " + procesionId + " no tiene suficientes puntos");
        }

        LocalDateTime desde = LocalDateTime.now().minusSeconds(VENTANA_SEGUNDOS);
        List<PosicionActual> pingsRecientes = posicionActualRepository.findByProcesionIdAndTimestampAfter(procesionId, desde);

        if (!pingsRecientes.isEmpty()) {
            double candidatoCola = 1.0;
            double candidatoCabeza = 0.0;
            for (PosicionActual ping : pingsRecientes) {
                double progreso = GeometriaRuta.proyectar(puntos, ping.getLatitud(), ping.getLongitud()).progreso();
                candidatoCola = Math.min(candidatoCola, progreso);
                candidatoCabeza = Math.max(candidatoCabeza, progreso);
            }
            double nuevaCola = maximo(procesion.getProgresoColaAlcanzado(), candidatoCola);
            double nuevaCabeza = maximo(procesion.getProgresoCabezaAlcanzado(), candidatoCabeza);
            procesionService.guardarProgresoEstela(procesion, nuevaCola, nuevaCabeza);
        }

        if (procesion.getProgresoColaAlcanzado() == null || procesion.getProgresoCabezaAlcanzado() == null) {
            throw new RecursoNoEncontradoException(
                    "La procesión con id " + procesionId + " no tiene ningún ping de ubicación todavía");
        }
        return new EstelaProcesionResponse(
                procesion.getProgresoColaAlcanzado(), procesion.getProgresoCabezaAlcanzado(), pingsRecientes.size());
    }

    private static double maximo(Double marcaDeAguaPrevia, double candidato) {
        return marcaDeAguaPrevia == null ? candidato : Math.max(marcaDeAguaPrevia, candidato);
    }

    // El "id" del JWT de un Cofrade es la cofradía cuyo código validó (Sección
    // AuthService), no un usuarioId -no hay Usuario Cofrade que buscar-, así
    // que el Cofrade se construye aquí mismo, no se carga de ningún sitio.
    // Desde el 2026-08-11 una procesión puede tener varias cofradías
    // participando (N:M), así que basta con pertenecer a UNA de ellas.
    private Cofrade exigirCofradeDeAlgunaCofradiaParticipante(Procesion procesion) {
        UsuarioPrincipal actual = SecurityUtils.usuarioActual();
        boolean participaEnLaProcesion = procesion.getCofradias().stream()
                .anyMatch(cofradia -> cofradia.getId().equals(actual.id()));
        if (!"COFRADE".equals(actual.rol()) || !participaEnLaProcesion) {
            throw new AccesoDenegadoException(
                    "Solo un cofrade de una cofradía participante puede compartir su ubicación en esta procesión");
        }
        return Cofrade.autenticado(actual.id());
    }
}
