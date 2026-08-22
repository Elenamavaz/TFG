package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.PosicionAgregadaResponse;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofrade;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.PosicionActual;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.repository.PosicionActualRepository;
import com.semanasanta.backend.security.SecurityUtils;
import com.semanasanta.backend.security.UsuarioPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PosicionActualService {

    // Ventana de "ahora mismo": los pings más viejos que esto no cuentan para
    // la posición actual calculada (pero siguen en el histórico).
    private static final long VENTANA_SEGUNDOS = 60;

    private final PosicionActualRepository posicionActualRepository;
    private final ProcesionService procesionService;

    public PosicionActualService(PosicionActualRepository posicionActualRepository, ProcesionService procesionService) {
        this.posicionActualRepository = posicionActualRepository;
        this.procesionService = procesionService;
    }

    // Registra un ping anónimo (cada ~30s desde el cliente cofrade). No hay
    // actualizar/eliminar: el histórico es de solo-inserción, y no se guarda
    // quién lo mandó -solo se comprueba que puede mandarlo (Cofrade de la
    // cofradía de esta procesión), sin persistir esa identidad en ningún sitio.
    public PosicionActual registrarPing(Long procesionId, Double latitud, Double longitud) {
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
        PosicionActual ping = new PosicionActual(latitud, longitud, procesion);
        return posicionActualRepository.save(ping);
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
