import { getCiudades, getCiudadIdGuardada } from '../../data/services';
import { queryClient } from '../../infrastructure/api/queryClient';

// Determina a qué pantalla ir dentro del modo Ciudadano (sin cuenta):
// - Si ya hay una ciudad guardada de una sesión anterior, se va directa a MainTabs.
// - Si no, se deja elegir a mano en SeleccionCiudadScreen.
//
// 2026-08-15: ya no se preselecciona la ciudad más cercana por GPS. Esa
// lógica dependía de latitud/longitud en Ciudad (ver ciudadMasCercana en
// geo.js, ahora quitada), campos que existían en el mock/diseño de Figma
// pero nunca se implementaron en el backend real (ver Ciudad.js). Queda
// pendiente decidir si se recupera añadiendo esos campos al backend.
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
    return 'MainTabs';
  }

  return 'SeleccionCiudad';
}
