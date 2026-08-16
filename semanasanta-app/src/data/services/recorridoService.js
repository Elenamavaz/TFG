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
