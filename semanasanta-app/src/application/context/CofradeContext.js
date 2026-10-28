import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { services } from '../../data';
import { useAuth } from './AuthContext';

const CofradeContext = createContext(null);

// Mismo intervalo que documenta PosicionActualService del backend ("cada
// ~30s desde el cliente cofrade").
const INTERVALO_PING_MS = 30000;

// 410 = la procesión ya no está EN_CURSO (ver ProcesionNoEnCursoException
// del backend), normalmente porque se ha finalizado sola al llegar su hora
// de fin (CambioEstadoAutomaticoService).
const STATUS_PROCESION_NO_EN_CURSO = 410;
// 401 en un ping = el JWT de Cofrade ha caducado (24h por defecto); 403 =
// ya no puede compartir (código revocado o cofradía desactivada, el backend
// lo explica en el mensaje) -seguir mandando pings no serviría de nada.
const STATUS_SESION_CADUCADA = 401;
const STATUS_ACCESO_RETIRADO = 403;

// Compartir ubicación como Cofrade. Desde el 2026-10-03 el Cofrade entra
// por "Iniciar sesión" (pestaña Cofrade, con su código de acceso), al mismo
// nivel que Junta y Administrador: su JWT vive en AuthContext/sesionService
// como los demás (rol COFRADE, usuarioId = id de la COFRADÍA, ver
// authService.loginConCodigoAcceso). Aquí solo queda lo propio de compartir:
// elegir procesión en curso y mandar los pings periódicos. Sigue siendo un
// Context (no estado de la pantalla) para que los pings no dependan de qué
// pantalla esté montada.
//
// Desde el 2026-10-16 (bug 6 de bugs.md) los pings salen de una tarea en
// segundo plano (seguimientoService) que sigue funcionando con la pantalla
// bloqueada. El setInterval de aquí queda solo como alternativa cuando el
// usuario no da permiso de ubicación "todo el tiempo" (modo 'soloPrimerPlano').
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
  const [aviso, setAviso] = useState(null); // informativo, no error: p.ej. "solo con la app abierta"
  // El backend descarta sin error los pings a más de 50 m del recorrido
  // (guardado=false): se avisa al cofrade de que su ubicación no se está
  // mostrando, en vez de dejarle creer que comparte bien.
  const [fueraDeRecorrido, setFueraDeRecorrido] = useState(false);
  const intervaloRef = useRef(null);

  const detenerCompartir = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
    services.detenerSeguimiento();
    setCompartiendo(false);
    setAviso(null);
    setFueraDeRecorrido(false);
  }, []);

  // La tarea en segundo plano vive fuera de React: al abrir la app (o volver
  // a ella) se recupera si sigue compartiendo, y si paró sola (procesión
  // finalizada, código revocado...) se muestra el motivo.
  const sincronizarConSeguimiento = useCallback(async () => {
    if (!esCofrade || intervaloRef.current) return; // el modo primer plano ya lleva su propio estado
    const { seguimiento, motivoFin, fueraDeRecorrido: fuera } = await services.getEstadoSeguimiento();
    if (seguimiento) {
      setProcesionNombre(seguimiento.procesionNombre);
      setCompartiendo(true);
      if (fuera !== null) setFueraDeRecorrido(fuera);
    } else {
      setCompartiendo(false);
      setFueraDeRecorrido(false);
    }
    if (motivoFin) setError(motivoFin);
  }, [esCofrade]);

  useEffect(() => {
    if (!esCofrade) {
      // Sesión cerrada o de otro rol: no puede quedar ningún seguimiento
      // mandando pings con un JWT que ya no es el de la sesión actual.
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      intervaloRef.current = null;
      services.detenerSeguimiento();
      setCompartiendo(false);
      return undefined;
    }
    sincronizarConSeguimiento();
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') sincronizarConSeguimiento();
    });
    return () => suscripcion.remove();
  }, [esCofrade, sincronizarConSeguimiento]);

  // Con la app abierta, refresca cada cierto tiempo por si la tarea se ha
  // detenido sola mientras se mira la pantalla (p.ej. la procesión finaliza).
  useEffect(() => {
    if (!compartiendo) return undefined;
    const comprobacion = setInterval(sincronizarConSeguimiento, INTERVALO_PING_MS);
    return () => clearInterval(comprobacion);
  }, [compartiendo, sincronizarConSeguimiento]);

  const enviarPing = useCallback(
    async (idProcesion, jwt) => {
      const posicion = await services.obtenerPosicionActual();
      if (!posicion) return; // sin GPS disponible en este ciclo, se reintenta en el siguiente
      try {
        const respuesta = await services.registrarPosicion(idProcesion, posicion.latitud, posicion.longitud, jwt);
        setFueraDeRecorrido(respuesta?.guardado === false);
      } catch (err) {
        // La procesión ha terminado (2026-09-30, decisión de Elena: si a un
        // cofrade se le olvida parar, se le echa al llegar la hora de fin):
        // se corta el compartir y se le explica por qué.
        if (err.status === STATUS_PROCESION_NO_EN_CURSO || err.status === STATUS_ACCESO_RETIRADO) {
          detenerCompartir();
          setError(err.message);
        } else if (err.status === STATUS_SESION_CADUCADA) {
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
      const permiso = await services.solicitarPermisoUbicacion();
      if (!permiso) {
        setError('Necesitas dar permiso de ubicación para compartir con tu cofradía.');
        return;
      }
      setProcesionNombre(procesion.nombre);
      setProcesionesPendientes([]);
      setError(null);
      setAviso(null);
      setFueraDeRecorrido(false);
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      intervaloRef.current = null;
      enviarPing(procesion.id, token); // primero inmediato, no esperar al primer aviso del GPS

      const modo = await services.iniciarSeguimiento({
        procesionId: procesion.id,
        procesionNombre: procesion.nombre,
        token,
      });
      if (modo === 'soloPrimerPlano') {
        intervaloRef.current = setInterval(() => enviarPing(procesion.id, token), INTERVALO_PING_MS);
        setAviso(
          'Solo se compartirá mientras tengas la app abierta. Para que siga con la pantalla bloqueada, ' +
            'permite la ubicación "Todo el tiempo" en los ajustes del móvil.'
        );
      }
      setCompartiendo(true);
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
      const procesiones = await services.getProcesionesPorCofradia(cofradiaId);
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
      aviso,
      fueraDeRecorrido,
      procesionNombre,
      procesionesPendientes,
      empezarACompartir,
      elegirProcesion,
      cancelarEleccion: () => setProcesionesPendientes([]),
      detenerCompartir,
      limpiarError: () => setError(null),
    }),
    [cofradiaId, compartiendo, cargando, error, aviso, fueraDeRecorrido, procesionNombre, procesionesPendientes, empezarACompartir, elegirProcesion, detenerCompartir]
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
