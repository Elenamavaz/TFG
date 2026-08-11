package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.PosicionActualRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PosicionActual;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.repository.PosicionActualRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PosicionActualService {

    private final PosicionActualRepository posicionActualRepository;
    private final ProcesionService procesionService;

    public PosicionActualService(PosicionActualRepository posicionActualRepository, ProcesionService procesionService) {
        this.posicionActualRepository = posicionActualRepository;
        this.procesionService = procesionService;
    }

    // Registra una nueva lectura (cada ~30s desde el cliente cofrade). No hay
    // actualizar/eliminar: el histórico es de solo-inserción.
    public PosicionActual registrar(Long procesionId, PosicionActualRequest request) {
        Procesion procesion = procesionService.obtener(procesionId); // 404 si la procesión no existe
        PosicionActual posicion = new PosicionActual(
                request.latitud(), request.longitud(), request.cofradesActivos(), procesion
        );
        return posicionActualRepository.save(posicion);
    }

    public List<PosicionActual> historico(Long procesionId) {
        procesionService.obtener(procesionId); // 404 si la procesión no existe
        return posicionActualRepository.findByProcesionIdOrderByTimestampDesc(procesionId);
    }

    public PosicionActual actual(Long procesionId) {
        procesionService.obtener(procesionId); // 404 si la procesión no existe
        return posicionActualRepository.findFirstByProcesionIdOrderByTimestampDesc(procesionId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "La procesión con id " + procesionId + " todavía no tiene ninguna posición registrada"));
    }
}
