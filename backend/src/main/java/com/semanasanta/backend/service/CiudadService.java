package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CiudadRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.repository.CiudadRepository;
import com.semanasanta.backend.repository.CofradiaRepository;
import com.semanasanta.backend.repository.DispositivoPushRepository;
import com.semanasanta.backend.repository.JuntaCofradiasRepository;
import com.semanasanta.backend.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CiudadService {

    private final CiudadRepository ciudadRepository;
    private final AdministradorService administradorService;
    private final CofradiaRepository cofradiaRepository;
    private final JuntaCofradiasRepository juntaCofradiasRepository;
    private final NotificacionRepository notificacionRepository;
    private final DispositivoPushRepository dispositivoPushRepository;

    public CiudadService(CiudadRepository ciudadRepository, AdministradorService administradorService,
                          CofradiaRepository cofradiaRepository, JuntaCofradiasRepository juntaCofradiasRepository,
                          NotificacionRepository notificacionRepository, DispositivoPushRepository dispositivoPushRepository) {
        this.ciudadRepository = ciudadRepository;
        this.administradorService = administradorService;
        this.cofradiaRepository = cofradiaRepository;
        this.juntaCofradiasRepository = juntaCofradiasRepository;
        this.notificacionRepository = notificacionRepository;
        this.dispositivoPushRepository = dispositivoPushRepository;
    }

    // Solo las activas: es lo que ve el ciudadano en el selector de ciudad
    // (GET público, RI-01). El panel de Administrador necesita ver también
    // las desactivadas para poder reactivarlas -ver listar(boolean).
    public List<Ciudad> listar() {
        return listar(false);
    }

    public List<Ciudad> listar(boolean incluirInactivas) {
        List<Ciudad> ciudades = ciudadRepository.findAll();
        if (incluirInactivas) {
            return ciudades;
        }
        return ciudades.stream().filter(Ciudad::isActiva).toList();
    }

    public Ciudad obtener(Long id) {
        return ciudadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la ciudad con id " + id));
    }

    public Ciudad crear(CiudadRequest request) {
        administradorService.exigirAdministrador();
        Ciudad ciudad = new Ciudad(request.nombre(), request.comunidadAutonoma(), request.provincia(),
                request.historia(), request.patrimonio(), request.latitud(), request.longitud());
        return ciudadRepository.save(ciudad);
    }

    public Ciudad actualizar(Long id, CiudadRequest request) {
        administradorService.exigirAdministrador();
        Ciudad ciudad = obtener(id);
        ciudad.setNombre(request.nombre());
        ciudad.setComunidadAutonoma(request.comunidadAutonoma());
        ciudad.setProvincia(request.provincia());
        ciudad.setHistoria(request.historia());
        ciudad.setPatrimonio(request.patrimonio());
        ciudad.setActiva(request.activa());
        ciudad.setLatitud(request.latitud());
        ciudad.setLongitud(request.longitud());
        return ciudadRepository.save(ciudad);
    }

    // Cofradías y Junta se gestionan aparte y tienen sus propios datos
    // (pasos, eventos, miembros...): se exige eliminarlas antes, con un
    // mensaje claro en vez de que la FK lo rechace con un error genérico.
    // Avisos y dispositivos push sí son de la propia ciudad y se borran con
    // ella -si no, ninguna ciudad con usuarios se podría eliminar nunca.
    @Transactional
    public void eliminar(Long id) {
        administradorService.exigirAdministrador();
        Ciudad ciudad = obtener(id);
        if (juntaCofradiasRepository.existsByCiudadId(id) || !cofradiaRepository.findByCiudadId(id).isEmpty()) {
            throw new IllegalStateException(
                    "No se puede eliminar la ciudad mientras tenga Junta de Cofradías o cofradías. Elimínalas antes, o desactiva la ciudad.");
        }
        notificacionRepository.deleteAll(notificacionRepository.findByCiudadIdOrderByFechaCreacionDesc(id));
        dispositivoPushRepository.deleteAll(dispositivoPushRepository.findByCiudadId(id));
        ciudadRepository.delete(ciudad);
    }
}
