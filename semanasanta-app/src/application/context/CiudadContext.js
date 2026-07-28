import { createContext, useContext, useMemo, useState } from 'react';

const CiudadContext = createContext(null);

export function CiudadProvider({ children }) {
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);

  const value = useMemo(
    () => ({
      ciudadSeleccionada,
      seleccionarCiudad: setCiudadSeleccionada,
    }),
    [ciudadSeleccionada]
  );

  return <CiudadContext.Provider value={value}>{children}</CiudadContext.Provider>;
}

export function useCiudad() {
  const context = useContext(CiudadContext);
  if (!context) {
    throw new Error('useCiudad debe usarse dentro de un CiudadProvider');
  }
  return context;
}
