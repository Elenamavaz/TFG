import {
  getCiudades,
  getCiudadIdGuardada,
  guardarCiudadId,
  solicitarPermisoUbicacion,
  obtenerPosicionActual,
  registrarDispositivoPush,
} from '../../data/services';
import { queryClient } from '../../infrastructure/api/queryClient';
import { ciudadMasCercana } from './geo';

// Determina a qué pantalla ir dentro del modo Ciudadano (sin cuenta):
// - Si ya hay una ciudad guardada de una sesión anterior, se va directa a MainTabs.
// - Si no, se intenta preseleccionar la ciudad más cercana por GPS (2026-08-23,
//   recuperado -Ciudad ya tiene latitud/longitud en el backend real, ver
//   geo.js). Solo si el usuario da permiso Y hay alguna ciudad activa con
//   coordenadas cerca; si no, se deja elegir a mano en SeleccionCiudadScreen,
//   igual que hasta ahora -nunca se fuerza el permiso ni se bloquea el arranque
//   por él (solicitarPermisoUbicacion/obtenerPosicionActual ya devuelven
//   false/null en vez de lanzar si el usuario lo deniega o el GPS falla).
//
// fetchQuery (no getCiudades directo): usa la misma caché de TanStack Query
// que luego lee SeleccionCiudadScreen con useQuery -así, si el usuario
// termina en esa pantalla, no repite la petición de red que ya se hizo aquí.
export async function resolverPantallaCiudadano(seleccionarCiudad) {
  const ciudades = await queryClient.fetchQuery({ queryKey: ['ciudades'], queryFn: getCiudades });

  const ciudadIdGuardada = await getCiudadIdGuardada();
  const ciudadGuardada = ciudades.find((ciudad) => ciudad.id === ciudadIdGuardada);
  if (ciudadGuardada) {
    seleccionarCiudad(ciudadGuardada);
    // No se espera (sin await): registrar el push no debe retrasar la
    // navegación, y si falla (sin EAS/development build todavía, ver
    // pushService.js) tampoco debe romper el arranque.
    registrarDispositivoPush(ciudadGuardada.id);
    return 'MainTabs';
  }

  const permiso = await solicitarPermisoUbicacion();
  if (permiso) {
    const posicion = await obtenerPosicionActual();
    const cercana = posicion ? ciudadMasCercana(ciudades, posicion) : null;
    if (cercana) {
      // guardarCiudadId (no solo seleccionarCiudad, que solo vive en memoria
      // -ver CiudadContext): mismo paso que hace SeleccionCiudadScreen al
      // elegir a mano, para que el próximo arranque ya la encuentre guardada
      // y no repita el cálculo de GPS.
      guardarCiudadId(cercana.id);
      seleccionarCiudad(cercana);
      registrarDispositivoPush(cercana.id); // sin await, ver comentario de arriba
      return 'MainTabs';
    }
  }

  return 'SeleccionCiudad';
}
