import { createContext, useContext, useMemo, useState } from 'react';

const DiaContext = createContext(null);

// Día de Semana Santa seleccionado (compartido entre Inicio y Calendario,
// para que ambas pantallas muestren siempre el mismo día activo).
export function DiaProvider({ children }) {
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const value = useMemo(
    () => ({
      diaSeleccionado,
      seleccionarDia: setDiaSeleccionado,
    }),
    [diaSeleccionado]
  );

  return <DiaContext.Provider value={value}>{children}</DiaContext.Provider>;
}

export function useDia() {
  const context = useContext(DiaContext);
  if (!context) {
    throw new Error('useDia debe usarse dentro de un DiaProvider');
  }
  return context;
}
