package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.RecorridoRequest;
import com.semanasanta.backend.exception.ArchivoInvalidoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.model.Ubicacion;
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

    public RecorridoService(RecorridoRepository recorridoRepository, UbicacionRepository ubicacionRepository,
                             PuntoRutaRepository puntoRutaRepository, RecorridoPuntoRutaRepository recorridoPuntoRutaRepository,
                             MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.recorridoRepository = recorridoRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.puntoRutaRepository = puntoRutaRepository;
        this.recorridoPuntoRutaRepository = recorridoPuntoRutaRepository;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
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
        miembroJuntaCofradiaService.exigirJunta();
        Recorrido recorrido = obtener(id);
        recorrido.setDistanciaTotal(request.distanciaTotal());
        recorrido.setTiempoEstimado(request.tiempoEstimado());
        return recorridoRepository.save(recorrido);
    }

    public void eliminar(Long id) {
        miembroJuntaCofradiaService.exigirJunta();
        Recorrido recorrido = obtener(id);
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
