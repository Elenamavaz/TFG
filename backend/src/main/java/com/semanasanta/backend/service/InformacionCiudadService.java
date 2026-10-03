package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CiudadInformacionRequest;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.repository.CiudadRepository;
import org.springframework.stereotype.Service;

// Edición de historia/patrimonio de una Ciudad por la Junta que la gestiona
// (2026-10-03). Va en un Service aparte y no en CiudadService porque
// exigirJuntaDeLaCiudad vive en MiembroJuntaCofradiaService, que ya depende
// (vía JuntaCofradiasService) de CiudadService: inyectarlo allí cerraría un
// ciclo de dependencias que Spring no puede construir al arrancar.
@Service
public class InformacionCiudadService {

    private final CiudadRepository ciudadRepository;
    private final CiudadService ciudadService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public InformacionCiudadService(CiudadRepository ciudadRepository, CiudadService ciudadService,
                                    MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.ciudadRepository = ciudadRepository;
        this.ciudadService = ciudadService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public Ciudad actualizarInformacion(Long ciudadId, CiudadInformacionRequest request) {
        Ciudad ciudad = ciudadService.obtener(ciudadId); // 404 si la ciudad no existe
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudad.getId());
        ciudad.setHistoria(request.historia());
        ciudad.setPatrimonio(request.patrimonio());
        return ciudadRepository.save(ciudad);
    }
}
