package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CodigoAccesoRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.CodigoAcceso;
import com.semanasanta.backend.model.EstadoCodigo;
import com.semanasanta.backend.repository.CodigoAccesoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CodigoAccesoService {

    private final CodigoAccesoRepository codigoAccesoRepository;
    private final CofradiaService cofradiaService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public CodigoAccesoService(CodigoAccesoRepository codigoAccesoRepository, CofradiaService cofradiaService,
                                MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.codigoAccesoRepository = codigoAccesoRepository;
        this.cofradiaService = cofradiaService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    // Usado también por revocar() y por el GET directo del Controller: el
    // código es una credencial, así que aquí también hace falta comprobar que
    // quien lo pide es la Junta de la cofradía que lo emitió, no cualquiera
    // con sesión.
    public CodigoAcceso obtener(Long id) {
        CodigoAcceso codigoAcceso = codigoAccesoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el código de acceso con id " + id));
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(codigoAcceso.getCofradia().getCiudad().getId());
        return codigoAcceso;
    }

    public List<CodigoAcceso> listarDeCofradia(Long cofradiaId) {
        Cofradia cofradia = cofradiaService.obtener(cofradiaId); // 404 si la cofradía no existe
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(cofradia.getCiudad().getId());
        return codigoAccesoRepository.findByCofradiaId(cofradiaId);
    }

    public CodigoAcceso emitir(CodigoAccesoRequest request) {
        Cofradia cofradia = cofradiaService.obtener(request.cofradiaId()); // 404 si la cofradía no existe
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(cofradia.getCiudad().getId());
        CodigoAcceso codigoAcceso = new CodigoAcceso(generarCodigoUnico(), cofradia);
        return codigoAccesoRepository.save(codigoAcceso);
    }

    // Código corto y legible (8 caracteres en mayúsculas), no un UUID entero:
    // alguien tiene que poder teclearlo a mano si hace falta. "codigo" es
    // unique en la entidad (ver CodigoAcceso) SIN IMPORTAR el estado -así que
    // aunque la colisión con solo 8 caracteres es rarísima, se comprueba y se
    // regenera antes de guardar contra CUALQUIER código ya existente (no solo
    // los activos): uno REVOCADO también haría fallar el guardado si
    // coincidiera, así que comprobar solo entre los activos no bastaría para
    // evitar el error. Mejor esto que dejar que reviente con una excepción de
    // restricción única sin controlar.
    private String generarCodigoUnico() {
        String codigo;
        do {
            codigo = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (codigoAccesoRepository.findByCodigo(codigo).isPresent());
        return codigo;
    }

    public CodigoAcceso revocar(Long id) {
        CodigoAcceso codigoAcceso = obtener(id); // ya comprueba que es la Junta correcta
        codigoAcceso.setEstado(EstadoCodigo.REVOCADO);
        return codigoAccesoRepository.save(codigoAcceso);
    }
}
