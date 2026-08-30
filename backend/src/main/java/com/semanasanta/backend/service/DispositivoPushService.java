package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.DispositivoPushRequest;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.DispositivoPush;
import com.semanasanta.backend.repository.DispositivoPushRepository;
import org.springframework.stereotype.Service;

@Service
public class DispositivoPushService {

    private final DispositivoPushRepository dispositivoPushRepository;
    private final CiudadService ciudadService;

    public DispositivoPushService(DispositivoPushRepository dispositivoPushRepository, CiudadService ciudadService) {
        this.dispositivoPushRepository = dispositivoPushRepository;
        this.ciudadService = ciudadService;
    }

    // Upsert por token (2026-08-23): si el dispositivo ya estaba registrado
    // -mismo token, típicamente el mismo móvil-, se actualiza a qué ciudad
    // apunta ahora en vez de duplicar la fila. Público (SecurityConfig): el
    // Ciudadano nunca se autentica, no hay JWT que exigir aquí.
    public DispositivoPush registrar(DispositivoPushRequest request) {
        Ciudad ciudad = ciudadService.obtener(request.ciudadId()); // 404 si la ciudad no existe
        DispositivoPush dispositivo = dispositivoPushRepository.findByToken(request.token())
                .orElseGet(() -> new DispositivoPush(request.token(), ciudad));
        dispositivo.actualizar(ciudad);
        return dispositivoPushRepository.save(dispositivo);
    }
}
