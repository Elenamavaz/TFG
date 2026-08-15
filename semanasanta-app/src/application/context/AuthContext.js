import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSesionGuardada, guardarSesion, borrarSesion } from '../../data/services';

const AuthContext = createContext(null);

// Sesión de Junta/Administrador (JWT real, ver authService.login) -el
// Cofrade y el Ciudadano no pasan por aquí: el primero entra con código de
// acceso (sin conectar todavía), el segundo no tiene cuenta. Se restaura de
// AsyncStorage al arrancar (sesionService), para no pedir login otra vez si
// ya había una guardada.
export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null); // { token, rol, usuarioId } | null
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getSesionGuardada().then((guardada) => {
      setSesion(guardada);
      setCargando(false);
    });
  }, []);

  const iniciarSesion = useCallback(({ token, rol, usuarioId }) => {
    setSesion({ token, rol, usuarioId });
    guardarSesion({ token, rol, usuarioId });
  }, []);

  const cerrarSesion = useCallback(() => {
    setSesion(null);
    borrarSesion();
  }, []);

  const value = useMemo(
    () => ({ sesion, cargandoSesion: cargando, iniciarSesion, cerrarSesion }),
    [sesion, cargando, iniciarSesion, cerrarSesion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
