export { SeleccionCiudadScreen } from './SelectCity/SeleccionCiudadScreen';
export { InicioScreen } from './Home/HomeScreen';
export { DetalleCiudadScreen } from './DetailsCiudad/DetailCiudadScreen';
export { ListadoScreen } from './List/ListScreen';
export { DetalleCofradiaScreen } from './DetailsCofradia/DetailCofradiaScreen';
export { DetallePasoScreen } from './DetailsPaso/DetailPasoScreen';
export { DetalleProcesionScreen } from './DetailsProcesion/DetailProcesionScreen';
export { DetalleProcesionInfoScreen } from './DetailsProcesion/DetailProcesionInfoScreen';
export { DetalleEventoScreen } from './DetailsEvento/DetailEventoScreen';
export { CalendarioScreen } from './Calender/CalenderScreen';
export { MapaScreen } from './Map/MapaScreen';
export { BuscarScreen } from './Search/SearchScreen';
// PerfilScreen NO se reexporta aquí a propósito: PerfilStackNavigator lo
// importa directo de ./Profile/PerfilScreen, sin pasar por este barrel.
// Antes había un PerfilRouterScreen intermedio (con un switch por tipo de
// usuario que incluía una pantalla de Junta que nunca se llegó a construir);
// se quitó el 2026-08-21 por indirección pura -Junta tiene su propio flujo
// real (JuntaStackNavigator) que ni pasa por aquí, y sin esa rama el router
// solo reenviaba props a PerfilScreen sin hacer nada más. Mismo criterio se
// aplicó el 2026-09-19 a Cofrade: PerfilCofradeScreen vive en
// ../cofrade/Profile/, al nivel de Junta/Administrador, no como un modo
// dentro de este Perfil de Ciudadano.
