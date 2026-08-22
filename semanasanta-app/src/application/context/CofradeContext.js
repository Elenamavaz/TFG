import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  loginConCodigoAcceso,
  getProcesionesPorCofradia,
  solicitarPermisoUbicacion,
  obtenerPosicionActual,
  registrarPosicion,
} from '../../data/services';

const CofradeContext = createContext(null);

// Mismo intervalo que documenta PosicionActualService del backend ("cada
// ~30s desde el cliente cofrade").
const INTERVALO_PING_MS = 30000;

// Compartir ubicación como Cofrade (2026-08-21): antes era un interruptor de
// mentira en PerfilScreen, ahora es de verdad -código real (POST
// /auth/codigo-acceso), backend real de pings (POST /procesiones/{id}/
// posiciones). Vive en un Context, no en el estado de PerfilScreen: el ping
// periódico debe seguir mandándose aunque el usuario navegue a otra pantalla
// (Elena: "ya si quiere hacer uso como tal de la aplicación lo hace como
// actor ciudadano" -compartir es independiente de qué esté mirando).
//
// El JWT de Cofrade NO pasa por sesionService/AuthContext (eso es solo
// Junta/Admin, ver AuthContext): guardarlo ahí confundiría a
// RootNavigator.resolverArranque, que asume que cualquier sesión guardada
// con rol distinto de ADMIN es de Junta. Aquí vive solo en memoria (useRef/
// useState), se pierde al cerrar la app -aceptable, el código no se gasta y
// se puede volver a introducir.
export function CofradeProvider({ children }) {
  const [cofradiaId, setCofradiaId] = useState(null);
  const [token, setToken] = useState(null);
  const [procesionId, setProcesionId] = useState(null);
  const [procesionNombre, setProcesionNombre] = useState(null);
  const [procesionesPendientes, setProcesionesPendientes] = useState([]); // solo si hay que elegir
  const [compartiendo, setCompartiendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const intervaloRef = useRef(null);

  const enviarPing = useCallback(async (idProcesion, jwt) => {
    const posicion = await obtenerPosicionActual();
    if (!posicion) return; // sin GPS disponible en este ciclo, se reintenta en el siguiente
    // Un ping suelto que falle (red, backend caído un instante) no debe
    // cortar el compartir entero -se reintenta solo en el siguiente ciclo.
    await registrarPosicion(idProcesion, posicion.latitud, posicion.longitud, jwt).catch(() => {});
  }, []);

  const empezarPings = useCallback(
    (idProcesion, jwt) => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      enviarPing(idProcesion, jwt); // primero inmediato, no esperar 30s
      intervaloRef.current = setInterval(() => enviarPing(idProcesion, jwt), INTERVALO_PING_MS);
    },
    [enviarPing]
  );

  const iniciarCompartir = useCallback(
    async (jwt, idCofradia, procesion) => {
      const permiso = await solicitarPermisoUbicacion();
      if (!permiso) {
        setError('Necesitas dar permiso de ubicación para compartir con tu cofradía.');
        return;
      }
      setToken(jwt);
      setCofradiaId(idCofradia);
      setProcesionId(procesion.id);
      setProcesionNombre(procesion.nombre);
      setProcesionesPendientes([]);
      setError(null);
      setCompartiendo(true);
      empezarPings(procesion.id, jwt);
    },
    [empezarPings]
  );

  // Valida el código y exige que la cofradía tenga AHORA MISMO al menos una
  // procesión EN_CURSO -mandar pings solo tiene sentido mientras la
  // procesión está pasando, no antes (aún no ha salido) ni después (ya
  // terminó); 2026-08-21, a petición de Elena. Con una sola candidata en
  // curso se comparte sin más preguntas; con varias a la vez (una cofradía
  // puede participar en más de una, N:M) se deja procesionesPendientes para
  // que la pantalla pida elegir (ver elegirProcesion). El backend no exige
  // esto mismo en el ping (PosicionActualService.registrarPing no mira el
  // estado de la procesión) -queda dicho, pendiente de decidir si merece la
  // pena duplicarlo ahí como defensa extra.
  const validarCodigo = useCallback(
    async (codigo) => {
      setCargando(true);
      setError(null);
      try {
        const { token: jwt, usuarioId: idCofradia } = await loginConCodigoAcceso(codigo);
        const procesiones = await getProcesionesPorCofradia(idCofradia);
        const enCurso = procesiones.filter((p) => p.estado === 'EN_CURSO');
        if (enCurso.length === 0) {
          setError('Tu cofradía no tiene ninguna procesión en curso ahora mismo.');
          return;
        }
        if (enCurso.length === 1) {
          await iniciarCompartir(jwt, idCofradia, enCurso[0]);
          return;
        }
        // Más de una procesión en curso a la vez: no hay forma de adivinar
        // cuál -se guarda el token y se pide elegir entre esas, no entre
        // todas las de la cofradía.
        setToken(jwt);
        setCofradiaId(idCofradia);
        setProcesionesPendientes(enCurso);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    },
    [iniciarCompartir]
  );

  const elegirProcesion = useCallback(
    (procesion) => {
      iniciarCompartir(token, cofradiaId, procesion);
    },
    [iniciarCompartir, token, cofradiaId]
  );

  const detenerCompartir = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
    setCompartiendo(false);
  }, []);

  const value = useMemo(
    () => ({
      compartiendo,
      cargando,
      error,
      procesionNombre,
      procesionesPendientes,
      validarCodigo,
      elegirProcesion,
      detenerCompartir,
      limpiarError: () => setError(null),
    }),
    [compartiendo, cargando, error, procesionNombre, procesionesPendientes, validarCodigo, elegirProcesion, detenerCompartir]
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
