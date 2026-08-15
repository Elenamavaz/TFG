import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Singleton compartido por toda la app: lo usan tanto los useQuery de las
// pantallas como código fuera de React (arranqueCiudadano.js) que necesita
// la MISMA caché, no una llamada de red aparte.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Datos de dominio (ciudades, cofradías...) cambian poco: no hace
      // falta refrescar en cada montaje de pantalla, con volver de background
      // basta (staleTime largo, no "siempre fresco").
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Persistencia en AsyncStorage (RNF-03, offline): la última respuesta de
// cada query sobrevive a cerrar la app, y se sirve de entrada mientras se
// revalida en segundo plano al recuperar conexión -mismo mecanismo que
// sustituye a la caché automática que daba antes Firestore (ver memoria
// tfg-arquitectura).
export const persistOptions = {
  persister: createAsyncStoragePersister({ storage: AsyncStorage, key: 'semanasanta-query-cache' }),
  // Un caché de un día es más que de sobra para "última respuesta válida
  // vista sin conexión"; pasado eso, mejor volver a pedirlo que arrastrar
  // datos muy desactualizados (procesiones/eventos cambian de estado).
  maxAge: 24 * 60 * 60 * 1000,
};
