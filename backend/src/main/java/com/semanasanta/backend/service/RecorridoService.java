package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.RecorridoRequest;
import com.semanasanta.backend.exception.ArchivoInvalidoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.EventoRepository;
import com.semanasanta.backend.repository.ProcesionRepository;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoPuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoRepository;
import com.semanasanta.backend.repository.UbicacionRepository;
import com.semanasanta.backend.util.GpxParser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class RecorridoService {

    private final RecorridoRepository recorridoRepository;
    private final UbicacionRepository ubicacionRepository;
    private final PuntoRutaRepository puntoRutaRepository;
    private final RecorridoPuntoRutaRepository recorridoPuntoRutaRepository;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;
    private final AutorizacionRecorridoService autorizacionRecorridoService;
    private final ProcesionRepository procesionRepository;
    private final EventoRepository eventoRepository;

    public RecorridoService(RecorridoRepository recorridoRepository, UbicacionRepository ubicacionRepository,
                             PuntoRutaRepository puntoRutaRepository, RecorridoPuntoRutaRepository recorridoPuntoRutaRepository,
                             MiembroJuntaCofradiaService miembroJuntaCofradiaService,
                             AutorizacionRecorridoService autorizacionRecorridoService,
                             ProcesionRepository procesionRepository, EventoRepository eventoRepository) {
        this.recorridoRepository = recorridoRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.puntoRutaRepository = puntoRutaRepository;
        this.recorridoPuntoRutaRepository = recorridoPuntoRutaRepository;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
        this.autorizacionRecorridoService = autorizacionRecorridoService;
        this.procesionRepository = procesionRepository;
        this.eventoRepository = eventoRepository;
    }

    public List<Recorrido> listar() {
        return recorridoRepository.findAll();
    }

    public Recorrido obtener(Long id) {
        return recorridoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el recorrido con id " + id));
    }

    // Recorrido no tiene dueño único (se reutiliza entre procesiones, incluso
    // de ciudades distintas): basta con ser cualquier Junta, sin comparar
    // ciudad -igual que Administrador con Ciudad.
    public Recorrido crear(RecorridoRequest request) {
        miembroJuntaCofradiaService.exigirJunta();
        Recorrido recorrido = new Recorrido(request.distanciaTotal(), request.tiempoEstimado());
        return recorridoRepository.save(recorrido);
    }

    public Recorrido actualizar(Long id, RecorridoRequest request) {
        autorizacionRecorridoService.exigirPuedeEditarRecorrido(id); // bug 25: el de su procesión, no cualquiera
        Recorrido recorrido = obtener(id);
        recorrido.setDistanciaTotal(request.distanciaTotal());
        recorrido.setTiempoEstimado(request.tiempoEstimado());
        return recorridoRepository.save(recorrido);
    }

    // Antes solo borraba la fila del recorrido, y sus puntos (con su FK) lo
    // impedían. Uno asignado a una procesión no se borra suelto: se sustituye
    // importando otro GPX desde la procesión (ver eliminarSiHuerfano).
    @Transactional
    public void eliminar(Long id) {
        autorizacionRecorridoService.exigirPuedeEditarRecorrido(id);
        Recorrido recorrido = obtener(id);
        if (procesionRepository.existsByRecorridoId(id)) {
            throw new IllegalStateException(
                    "El recorrido está asignado a una procesión: para cambiarlo, importa otro GPX desde la procesión.");
        }
        eliminarConPuntos(recorrido);
    }

    // Recorridos huérfanos (bug 26 de bugs.md, 2026-10-16): un GPX importado
    // crea su Recorrido al momento, así que al sustituirlo por otro, o al
    // eliminar la procesión, el anterior se quedaba en la base de datos sin
    // nadie que lo usara. Lo llama ProcesionService en esos dos casos, y la
    // app (vía eliminar) si se descarta el formulario sin guardar. Si
    // resulta que sí está asignado, no hace nada.
    @Transactional
    public void eliminarSiHuerfano(Long recorridoId) {
        if (recorridoId == null || procesionRepository.existsByRecorridoId(recorridoId)) {
            return;
        }
        recorridoRepository.findById(recorridoId).ifPresent(this::eliminarConPuntos);
    }

    // Relaciones, y los puntos y ubicaciones que solo usaba este recorrido
    // (los de un GPX importado siempre lo son). Un punto o ubicación que use
    // otra cosa -otro recorrido, un evento- se conserva.
    private void eliminarConPuntos(Recorrido recorrido) {
        List<RecorridoPuntoRuta> relaciones = recorridoPuntoRutaRepository.findByRecorridoIdOrderByOrdenAsc(recorrido.getId());
        recorridoPuntoRutaRepository.deleteAll(relaciones);
        recorridoPuntoRutaRepository.flush();
        for (RecorridoPuntoRuta relacion : relaciones) {
            PuntoRuta puntoRuta = relacion.getPuntoRuta();
            if (recorridoPuntoRutaRepository.existsByPuntoRutaId(puntoRuta.getId())) {
                continue;
            }
            Ubicacion ubicacion = puntoRuta.getUbicacion();
            puntoRutaRepository.delete(puntoRuta);
            puntoRutaRepository.flush();
            boolean ubicacionEnUso = puntoRutaRepository.existsByUbicacionId(ubicacion.getId())
                    || eventoRepository.existsByUbicacionId(ubicacion.getId());
            if (!ubicacionEnUso) {
                ubicacionRepository.delete(ubicacion);
            }
        }
        recorridoRepository.delete(recorrido);
    }

    // Crea un Recorrido completo -Ubicacion + PuntoRuta + RecorridoPuntoRuta
    // por cada punto, ya enlazados en orden- a partir de un archivo GPX
    // (dibujado en una app externa como gpx.studio o Wikiloc, o grabado
    // caminando la ruta real y exportado desde el móvil): pedir el orden a
    // mano en la app, punto a punto, no es razonable para una ruta real de
    // varias decenas de puntos. Ver GpxParser para el porqué del muestreo.
    // @Transactional: si algo falla a medio importar, no queremos un
    // Recorrido a medias con solo parte de sus puntos.
    @Transactional
    public Recorrido importarGpx(MultipartFile archivo) {
        miembroJuntaCofradiaService.exigirJunta();
        if (archivo == null || archivo.isEmpty()) {
            throw new ArchivoInvalidoException("No se ha recibido ningún archivo");
        }

        List<GpxParser.Punto> puntos;
        try {
            puntos = GpxParser.extraerPuntos(archivo.getInputStream());
        } catch (ArchivoInvalidoException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ArchivoInvalidoException("No se ha podido leer el archivo GPX: " + ex.getMessage());
        }

        Recorrido recorrido = recorridoRepository.save(new Recorrido(distanciaTotalKm(puntos), null));

        int orden = 0;
        for (GpxParser.Punto punto : puntos) {
            Ubicacion ubicacion = ubicacionRepository.save(new Ubicacion(punto.latitud(), punto.longitud(), null));
            PuntoRuta puntoRuta = puntoRutaRepository.save(new PuntoRuta(ubicacion));
            recorridoPuntoRutaRepository.save(new RecorridoPuntoRuta(recorrido, puntoRuta, orden, null));
            orden++;
        }
        return recorrido;
    }

    // Fórmula de Haversine (distancia sobre la superficie de la Tierra entre
    // dos coordenadas), sumada tramo a tramo entre puntos consecutivos.
    // Resultado en kilómetros, mismo campo/unidad que RecorridoRequest.distanciaTotal.
    private static double distanciaTotalKm(List<GpxParser.Punto> puntos) {
        double radioTierraKm = 6371.0;
        double total = 0;
        for (int i = 1; i < puntos.size(); i++) {
            GpxParser.Punto a = puntos.get(i - 1);
            GpxParser.Punto b = puntos.get(i);
            double deltaLat = Math.toRadians(b.latitud() - a.latitud());
            double deltaLon = Math.toRadians(b.longitud() - a.longitud());
            double haversine = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                    + Math.cos(Math.toRadians(a.latitud())) * Math.cos(Math.toRadians(b.latitud()))
                    * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
            total += radioTierraKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
        }
        return Math.round(total * 100.0) / 100.0;
    }
}
