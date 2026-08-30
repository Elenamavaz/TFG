import { apiFetch } from '../../infrastructure/api/apiClient';
import { Recorrido, PuntoDeInteres } from '../models';

// GET /recorridos/{id} y GET /recorridos/{id}/puntos-ruta son públicos.
// El segundo ya viene ordenado por "orden" (ver
// RecorridoPuntoRutaRepository.findByRecorridoIdOrderByOrdenAsc del
// backend). Siempre se construyen como PuntoDeInteres, nunca PuntoRuta base
// -es abstracta, no se puede instanciar directamente- aunque tipo/nombre
// vengan a null para un punto "de paso" simple sin PuntoDeInteres asociado.
export async function getRecorridoCompleto(recorridoId) {
  const [recorrido, relaciones] = await Promise.all([
    apiFetch(`/recorridos/${recorridoId}`),
    apiFetch(`/recorridos/${recorridoId}/puntos-ruta`),
  ]);
  const puntos = relaciones.map(
    (relacion) =>
      new PuntoDeInteres({
        ...relacion.puntoRuta,
        // relacionId (no el id del propio punto): hace falta aparte para
        // poder "marcar como punto de interés" (ver marcarPuntoDeInteres
        // más abajo), que actúa sobre la relación con ESTE recorrido, no
        // sobre el punto en sí -un mismo punto puede estar en varios
        // recorridos con relaciones (y por tanto ids de relación) distintas.
        relacionId: relacion.id,
        orden: relacion.orden,
        horaPrevista: relacion.horaPrevista,
      })
  );
  return new Recorrido({ ...recorrido, puntos });
}

// "Convierte" un punto de paso simple (uno de los que trae el GPX
// importado, sin tipo ni nombre) en un punto de interés -un encuentro, una
// entrada a una iglesia, una parada para una lectura u oración...- ver
// EditarRecorridoScreen (2026-08-23). Actúa sobre relacionId (la relación
// con ESTE recorrido, ver comentario de arriba), no sobre el id del punto.
export async function marcarPuntoDeInteres(recorridoId, relacionId, datos) {
  const relacion = await apiFetch(`/recorridos/${recorridoId}/puntos-ruta/${relacionId}/punto-de-interes`, {
    method: 'PUT',
    body: datos,
  });
  return new PuntoDeInteres({ ...relacion.puntoRuta, relacionId: relacion.id, orden: relacion.orden, horaPrevista: relacion.horaPrevista });
}

// Sube el archivo GPX que eligió expo-document-picker (ver
// FormularioProcesionScreen) a POST /recorridos/importar-gpx: el backend
// crea el Recorrido entero con todos sus puntos ya en orden -pedirlo a mano,
// punto a punto, no es razonable a este nivel, ver memoria del TFG.
export async function importarGpxRecorrido(archivo) {
  const formData = new FormData();
  if (archivo.file) {
    // Expo Web: DocumentPicker ya da un File real del navegador.
    formData.append('archivo', archivo.file, archivo.name ?? 'recorrido.gpx');
  } else {
    // Android/iOS: FormData de React Native espera este objeto {uri, name,
    // type}, no un Blob real -no hay equivalente a File ahí.
    formData.append('archivo', {
      uri: archivo.uri,
      name: archivo.name ?? 'recorrido.gpx',
      type: archivo.mimeType ?? 'application/gpx+xml',
    });
  }
  const recorrido = await apiFetch('/recorridos/importar-gpx', { method: 'POST', body: formData });
  return new Recorrido(recorrido);
}
