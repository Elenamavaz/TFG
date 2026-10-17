import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { services } from '../../data';

const AuthContext = createContext(null);

// Sesión de Junta/Administrador/Cofrade (JWT real, ver authService) -el
// Cofrade entra con código de acceso y su usuarioId es el de su COFRADÍA
// (desde el 2026-10-03, antes vivía solo en memoria en CofradeContext). El
// Ciudadano no pasa por aquí: no tiene cuenta. Se restaura de
// AsyncStorage al arrancar (sesionService), para no pedir login otra vez si
// ya había una guardada.
export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null); // { token, rol, usuarioId, activo } | null
  const [cargando, setCargando] = useState(true);
  // Mensaje para el inicio de sesión cuando la sesión se ha cerrado por
  // caducar (bug 8 de bugs.md); RootNavigator lleva entonces a Login.
  const [avisoSesion, setAvisoSesion] = useState(null);

  useEffect(() => {
    services.getSesionGuardada().then((guardada) => {
      if (guardada && services.sesionHaCaducado(guardada)) {
        services.borrarSesion();
        setSesion(null);
        setAvisoSesion('Tu sesión ha caducado. Vuelve a iniciar sesión.');
      } else {
        setSesion(guardada);
      }
      setCargando(false);
    });
  }, []);

  // Caducada mientras se usa la app: la primera petición rechazada cierra la
  // sesión (si no, cada acción seguiría fallando con un error genérico).
  useEffect(() => {
    services.configurarSesionCaducada((mensaje) => {
      setSesion(null);
      services.borrarSesion();
      setAvisoSesion(mensaje || 'Tu sesión ha caducado. Vuelve a iniciar sesión.');
    });
    return () => services.configurarSesionCaducada(null);
  }, []);

  // "activo" solo importa para rol JUNTA (ver AuthResponse del backend): un
  // miembro desactivado igual recibe token, pero la app lo manda a un aviso
  // de "cuenta desactivada" en vez de al panel, ver RootNavigator/LoginScreen.
  const iniciarSesion = useCallback(({ token, rol, usuarioId, activo }) => {
    setAvisoSesion(null);
    setSesion({ token, rol, usuarioId, activo });
    services.guardarSesion({ token, rol, usuarioId, activo });
  }, []);

  const cerrarSesion = useCallback(() => {
    setSesion(null);
    services.borrarSesion();
  }, []);

  const limpiarAvisoSesion = useCallback(() => setAvisoSesion(null), []);

  const value = useMemo(
    () => ({ sesion, cargandoSesion: cargando, iniciarSesion, cerrarSesion, avisoSesion, limpiarAvisoSesion }),
    [sesion, cargando, iniciarSesion, cerrarSesion, avisoSesion, limpiarAvisoSesion]
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
