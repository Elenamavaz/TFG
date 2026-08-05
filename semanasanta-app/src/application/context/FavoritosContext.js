import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const FavoritosContext = createContext(null);

// Favoritos guardados por el usuario (relación Usuario -guarda-> Favorito
// -referencia-> Favoriteable del diagrama de clases), compartidos entre
// Inicio, Calendario, Buscar y Mi Perfil. Solo en memoria por ahora: no
// sobrevive a cerrar la app (persistencia en dispositivo, p. ej.
// AsyncStorage, queda para una iteración posterior).
export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]); // [{ id, tipo }]

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
