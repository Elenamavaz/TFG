package com.semanasanta.backend.service;

import com.semanasanta.backend.model.DispositivoPush;
import com.semanasanta.backend.repository.DispositivoPushRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

// Envía el push de una Notificacion a los dispositivos de su ciudad, a
// través del servicio de Expo Push (exp.host) -no de Firebase/APNs
// directamente. El cliente usa expo-notifications, que ya abstrae esa
// diferencia; así el backend no necesita ni credenciales de Firebase ni
// certificados de Apple, un único endpoint HTTP público le vale para las
// dos plataformas (2026-08-23).
//
// Sin @Async a propósito: mandar el push tarda una llamada HTTP más dentro
// de crear()/cancelar(), aceptable para un panel de Junta (no es una ruta de
// alto tráfico); introducir un pool de hilos aparte no se está ganando su
// sitio todavía. Los fallos se tragan (log, no excepción) -ver
// NotificacionService.crear: que Expo esté caído no debe impedir guardar la
// Notificacion, el push es una entrega best-effort además de ella, no en
// vez de ella (el ciudadano siempre puede consultarla en la app).
@Service
public class PushNotificacionService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificacionService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final DispositivoPushRepository dispositivoPushRepository;
    private final RestClient restClient;

    public PushNotificacionService(DispositivoPushRepository dispositivoPushRepository, RestClient.Builder restClientBuilder) {
        this.dispositivoPushRepository = dispositivoPushRepository;
        this.restClient = restClientBuilder.build();
    }

    public void enviarACiudad(Long ciudadId, String titulo, String mensaje) {
        List<DispositivoPush> dispositivos = dispositivoPushRepository.findByCiudadId(ciudadId);
        if (dispositivos.isEmpty()) {
            return; // nadie de esta ciudad tiene la app instalada con push activado
        }

        List<Map<String, Object>> mensajesExpo = dispositivos.stream()
                .map(dispositivo -> Map.<String, Object>of(
                        "to", dispositivo.getToken(),
                        "title", titulo,
                        "body", mensaje != null ? mensaje : "",
                        "sound", "default"
                ))
                .toList();

        try {
            RespuestaExpo respuesta = restClient.post()
                    .uri(EXPO_PUSH_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(mensajesExpo)
                    .retrieve()
                    .body(RespuestaExpo.class);
            limpiarTokensInvalidos(dispositivos, respuesta);
        } catch (Exception ex) {
            log.warn("No se pudo enviar el push a la ciudad {} ({} dispositivos): {}",
                    ciudadId, dispositivos.size(), ex.getMessage());
        }
    }

    // Expo devuelve un resultado por mensaje, en el mismo orden que se
    // mandaron -de ahí que se pueda emparejar por índice con "dispositivos".
    // "DeviceNotRegistered" es el caso típico de una desinstalación: sin
    // esta limpieza, ese token seguiría fallando en cada notificación futura
    // para siempre.
    private void limpiarTokensInvalidos(List<DispositivoPush> dispositivos, RespuestaExpo respuesta) {
        if (respuesta == null || respuesta.data() == null) {
            return;
        }
        for (int i = 0; i < respuesta.data().size() && i < dispositivos.size(); i++) {
            ResultadoExpo resultado = respuesta.data().get(i);
            boolean noRegistrado = "error".equals(resultado.status())
                    && resultado.details() != null
                    && "DeviceNotRegistered".equals(resultado.details().error());
            if (noRegistrado) {
                dispositivoPushRepository.delete(dispositivos.get(i));
            }
        }
    }

    private record RespuestaExpo(List<ResultadoExpo> data) {
    }

    private record ResultadoExpo(String status, String message, DetalleErrorExpo details) {
    }

    private record DetalleErrorExpo(String error) {
    }
}
