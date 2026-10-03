import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  getProcesionesPorCofradia,
  solicitarPermisoUbicacion,
  obtenerPosicionActual,
  registrarPosicion,
} from '../../data/services';
import { useAuth } from './AuthContext';

const CofradeContext = createContext(null);

// Mismo intervalo que documenta PosicionActualService del backend ("cada
// ~30s desde el cliente cofrade").
const INTERVALO_PING_MS = 30000;

// 410 = la procesión ya no está EN_CURSO (ver ProcesionNoEnCursoException
// del backend), normalmente porque se ha finalizado sola al llegar su hora
// de fin (CambioEstadoAutomaticoService).
const STATUS_PROCESION_NO_EN_CURSO = 410;
// 401/403 en un ping = el JWT de Cofrade ya no vale (caducado, 24h por
// defecto) -seguir mandando pings no serviría de nada.
const STATUS_SESION_INVALIDA = [401, 403];

// Compartir ubicación como Cofrade. Desde el 2026-10-03 el Cofrade entra
// por "Iniciar sesión" (pestaña Cofrade, con su código de acceso), al mismo
// nivel que Junta y Administrador: su JWT vive en AuthContext/sesionService
// como los demás (rol COFRADE, usuarioId = id de la COFRADÍA, ver
// authService.loginConCodigoAcceso). Aquí solo queda lo propio de compartir:
// elegir procesión en curso y mandar los pings periódicos. Sigue siendo un
// Context (no estado de la pantalla) para que los pings no dependan de qué
// pantalla esté montada.
export function CofradeProvider({ children }) {
  const { sesion } = useAuth();
  const esCofrade = sesion?.rol === 'COFRADE';
  const token = esCofrade ? sesion.token : null;
  const cofradiaId = esCofrade ? sesion.usuarioId : null;

  const [procesionNombre, setProcesionNombre] = useState(null);
  const [procesionesPendientes, setProcesionesPendientes] = useState([]); // solo si hay que elegir
  const [compartiendo, setCompartiendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const intervaloRef = useRef(null);

  const detenerCompartir = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
    setCompartiendo(false);
  }, []);

  const enviarPing = useCallback(
    async (idProcesion, jwt) => {
      const posicion = await obtenerPosicionActual();
      if (!posicion) return; // sin GPS disponible en este ciclo, se reintenta en el siguiente
      try {
        await registrarPosicion(idProcesion, posicion.latitud, posicion.longitud, jwt);
      } catch (err) {
        // La procesión ha terminado (2026-09-30, decisión de Elena: si a un
        // cofrade se le olvida parar, se le echa al llegar la hora de fin):
        // se corta el compartir y se le explica por qué.
        if (err.status === STATUS_PROCESION_NO_EN_CURSO) {
          detenerCompartir();
          setError(err.message);
        } else if (STATUS_SESION_INVALIDA.includes(err.status)) {
          detenerCompartir();
          setError('Tu sesión de cofrade ha caducado. Cierra sesión y vuelve a entrar con tu código.');
        }
        // Cualquier otro fallo suelto (red, backend caído un instante) no
        // corta el compartir -se reintenta solo en el siguiente ciclo.
      }
    },
    [detenerCompartir]
  );

  const iniciarCompartir = useCallback(
    async (procesion) => {
      const permiso = await solicitarPermisoUbicacion();
      if (!permiso) {
        setError('Necesitas dar permiso de ubicación para compartir con tu cofradía.');
        return;
      }
      setProcesionNombre(procesion.nombre);
      setProcesionesPendientes([]);
      setError(null);
      setCompartiendo(true);
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      enviarPing(procesion.id, token); // primero inmediato, no esperar 30s
      intervaloRef.current = setInterval(() => enviarPing(procesion.id, token), INTERVALO_PING_MS);
    },
    [enviarPing, token]
  );

  // Exige que la cofradía tenga AHORA MISMO al menos una procesión EN_CURSO
  // -mandar pings solo tiene sentido mientras la procesión está pasando
  // (2026-08-21, a petición de Elena). Con una sola candidata se comparte
  // sin más preguntas; con varias a la vez (una cofradía puede participar en
  // más de una, N:M) se deja procesionesPendientes para que la pantalla
  // pida elegir (ver elegirProcesion). El backend también lo exige en cada
  // ping (410 si ya no está en curso, ver enviarPing).
  const empezarACompartir = useCallback(async () => {
    if (!cofradiaId) return;
    setCargando(true);
    setError(null);
    try {
      const procesiones = await getProcesionesPorCofradia(cofradiaId);
      const enCurso = procesiones.filter((p) => p.estado === 'EN_CURSO');
      if (enCurso.length === 0) {
        setError('Tu cofradía no tiene ninguna procesión en curso ahora mismo.');
      } else if (enCurso.length === 1) {
        await iniciarCompartir(enCurso[0]);
      } else {
        setProcesionesPendientes(enCurso);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [cofradiaId, iniciarCompartir]);

  const elegirProcesion = useCallback((procesion) => iniciarCompartir(procesion), [iniciarCompartir]);

  const value = useMemo(
    () => ({
      cofradiaId,
      compartiendo,
      cargando,
      error,
      procesionNombre,
      procesionesPendientes,
      empezarACompartir,
      elegirProcesion,
      cancelarEleccion: () => setProcesionesPendientes([]),
      detenerCompartir,
      limpiarError: () => setError(null),
    }),
    [cofradiaId, compartiendo, cargando, error, procesionNombre, procesionesPendientes, empezarACompartir, elegirProcesion, detenerCompartir]
  );

  return <CofradeContext.Provider value={value}>{children}</CofradeContext.Provider>;
}

export function useCofrade() {
  const context = useContext(CofradeContext);
  if (!context) {
    throw new Error('useCofrade debe usarse dentro de un CofradeProvider');
  }
  return context;
}
