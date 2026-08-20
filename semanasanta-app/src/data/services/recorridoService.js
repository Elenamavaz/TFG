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
        orden: relacion.orden,
        horaPrevista: relacion.horaPrevista,
      })
  );
  return new Recorrido({ ...recorrido, puntos });
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
