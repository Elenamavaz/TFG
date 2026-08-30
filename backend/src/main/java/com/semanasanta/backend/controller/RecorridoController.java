package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.MarcarPuntoDeInteresRequest;
import com.semanasanta.backend.dto.PuntoEnRecorridoRequest;
import com.semanasanta.backend.dto.PuntoEnRecorridoResponse;
import com.semanasanta.backend.dto.RecorridoRequest;
import com.semanasanta.backend.dto.RecorridoResponse;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.service.RecorridoPuntoRutaService;
import com.semanasanta.backend.service.RecorridoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/recorridos")
public class RecorridoController {

    private final RecorridoService recorridoService;
    private final RecorridoPuntoRutaService recorridoPuntoRutaService;

    public RecorridoController(RecorridoService recorridoService, RecorridoPuntoRutaService recorridoPuntoRutaService) {
        this.recorridoService = recorridoService;
        this.recorridoPuntoRutaService = recorridoPuntoRutaService;
    }

    @GetMapping
    public List<RecorridoResponse> listar() {
        return recorridoService.listar().stream()
                .map(RecorridoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public RecorridoResponse obtener(@PathVariable Long id) {
        Recorrido recorrido = recorridoService.obtener(id);
        return RecorridoResponse.from(recorrido);
    }

    // Los puntos en sí se crean aparte (POST /puntos-ruta o /puntos-de-interes,
    // reutilizables entre recorridos); aquí solo se engancha/consulta/quita la
    // relación con ESTE recorrido (con su propio orden/hora).
    @GetMapping("/{id}/puntos-ruta")
    public List<PuntoEnRecorridoResponse> listarPuntosRuta(@PathVariable Long id) {
        return recorridoPuntoRutaService.listar(id).stream()
                .map(PuntoEnRecorridoResponse::from)
                .toList();
    }

    @PostMapping("/{id}/puntos-ruta")
    @ResponseStatus(HttpStatus.CREATED)
    public PuntoEnRecorridoResponse agregarPuntoRuta(@PathVariable Long id,
                                                       @Valid @RequestBody PuntoEnRecorridoRequest request) {
        RecorridoPuntoRuta relacion = recorridoPuntoRutaService.agregar(id, request);
        return PuntoEnRecorridoResponse.from(relacion);
    }

    @DeleteMapping("/{id}/puntos-ruta/{relacionId}")
    public ResponseEntity<Void> quitarPuntoRuta(@PathVariable Long id, @PathVariable Long relacionId) {
        recorridoPuntoRutaService.quitar(id, relacionId);
        return ResponseEntity.noContent().build();
    }

    // "Convierte" un punto de paso simple (uno de los que trae el GPX
    // importado) en un punto de interés -un encuentro, una entrada a una
    // iglesia, una parada para una lectura u oración...- (2026-08-23).
    @PutMapping("/{id}/puntos-ruta/{relacionId}/punto-de-interes")
    public PuntoEnRecorridoResponse marcarPuntoDeInteres(@PathVariable Long id, @PathVariable Long relacionId,
                                                           @Valid @RequestBody MarcarPuntoDeInteresRequest request) {
        RecorridoPuntoRuta relacion = recorridoPuntoRutaService.marcarComoPuntoDeInteres(id, relacionId, request);
        return PuntoEnRecorridoResponse.from(relacion);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecorridoResponse crear(@Valid @RequestBody RecorridoRequest request) {
        Recorrido recorrido = recorridoService.crear(request);
        return RecorridoResponse.from(recorrido);
    }

    // Alternativa a crear "a mano" + agregarPuntoRuta punto a punto: sube un
    // GPX (dibujado en gpx.studio/Wikiloc/etc, o grabado caminando la ruta)
    // y se crea el Recorrido entero con todos sus puntos ya en orden, ver
    // RecorridoService.importarGpx.
    @PostMapping("/importar-gpx")
    @ResponseStatus(HttpStatus.CREATED)
    public RecorridoResponse importarGpx(@RequestParam("archivo") MultipartFile archivo) {
        Recorrido recorrido = recorridoService.importarGpx(archivo);
        return RecorridoResponse.from(recorrido);
    }

    @PutMapping("/{id}")
    public RecorridoResponse actualizar(@PathVariable Long id, @Valid @RequestBody RecorridoRequest request) {
        Recorrido recorrido = recorridoService.actualizar(id, request);
        return RecorridoResponse.from(recorrido);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        recorridoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
