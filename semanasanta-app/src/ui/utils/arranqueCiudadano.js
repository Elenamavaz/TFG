import {
  getCiudades,
  getCiudadIdGuardada,
  guardarCiudadId,
  solicitarPermisoUbicacion,
  obtenerPosicionActual,
} from '../../data/services';
import { ciudadMasCercana } from './geo';

// Determina a qué pantalla ir dentro del modo Ciudadano (sin cuenta):
// - Si ya hay una ciudad guardada de una sesión anterior, se va directa a MainTabs.
// - Si no, se piden permisos de geolocalización; si se conceden, se preselecciona
//   la ciudad más cercana (y se guarda, para no volver a preguntar). Si se deniegan
//   (o falla la localización), se deja elegir a mano en SeleccionCiudadScreen.
export async function resolverPantallaCiudadano(seleccionarCiudad) {
  const ciudades = await getCiudades();

  const ciudadIdGuardada = await getCiudadIdGuardada();
  const ciudadGuardada = ciudades.find((ciudad) => ciudad.id === ciudadIdGuardada);
  if (ciudadGuardada) {
    seleccionarCiudad(ciudadGuardada);
    return 'MainTabs';
  }

  const permisoConcedido = await solicitarPermisoUbicacion();
  if (permisoConcedido) {
    const posicion = await obtenerPosicionActual();
    const ciudadCercana = posicion ? ciudadMasCercana(ciudades, posicion.latitud, posicion.longitud) : null;
    if (ciudadCercana) {
      seleccionarCiudad(ciudadCercana);
      await guardarCiudadId(ciudadCercana.id);
      return 'MainTabs';
    }
  }

  return 'SeleccionCiudad';
}
