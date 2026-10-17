import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { services } from '../../data';

const FavoritosContext = createContext(null);

// Favoritos guardados por el usuario (relación Usuario -guarda-> Favorito
// -referencia-> Favoriteable del diagrama de clases), compartidos entre
// Inicio, Calendario, Buscar y Mi Perfil. Guardados en el dispositivo
// (AsyncStorage, ver preferenciasService) desde el 2026-10-17: antes solo
// vivían en memoria y se perdían al cerrar la app (bug 15).
export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]); // [{ id, tipo }]
  // Hasta que se lean los guardados no se escribe nada: si no, el [] inicial
  // los borraría al arrancar.
  const cargadosRef = useRef(false);

  useEffect(() => {
    services.getFavoritosGuardados().then((guardados) => {
      // Lo marcado en el rato de carga (muy improbable) se suma a lo guardado.
      setFavoritos((actuales) => [
        ...guardados,
        ...actuales.filter((f) => !guardados.some((g) => g.id === f.id && g.tipo === f.tipo)),
      ]);
      cargadosRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (cargadosRef.current) services.guardarFavoritos(favoritos);
  }, [favoritos]);

  const esFavorito = useCallback(
    (id, tipo) => favoritos.some((f) => f.id === id && f.tipo === tipo),
    [favoritos]
  );

  const alternarFavorito = useCallback((id, tipo) => {
    setFavoritos((actuales) => {
      const yaEsFavorito = actuales.some((f) => f.id === id && f.tipo === tipo);
      if (yaEsFavorito) return actuales.filter((f) => !(f.id === id && f.tipo === tipo));
      return [...actuales, { id, tipo }];
    });
  }, []);

  const value = useMemo(
    () => ({ favoritos, esFavorito, alternarFavorito }),
    [favoritos, esFavorito, alternarFavorito]
  );

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos debe usarse dentro de un FavoritosProvider');
  }
  return context;
}
