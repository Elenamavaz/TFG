export { SeleccionCiudadScreen } from './SelectCity/SeleccionCiudadScreen';
export { InicioScreen } from './Home/HomeScreen';
export { ListadoScreen } from './List/ListScreen';
export { DetalleCofradiaScreen } from './DetailsCofradia/DetailCofradiaScreen';
export { DetallePasoScreen } from './DetailsPaso/DetailPasoScreen';
export { DetalleProcesionScreen } from './DetailsProcesion/DetailProcesionScreen';
export { DetalleProcesionInfoScreen } from './DetailsProcesion/DetailProcesionInfoScreen';
export { DetalleEventoScreen } from './DetailsEvento/DetailEventoScreen';
export { CalendarioScreen } from './Calender/CalenderScreen';
export { MapaScreen } from './Map/MapaScreen';
export { BuscarScreen } from './Search/SearchScreen';
// PerfilScreen NO se reexporta aquí a propósito: la navegación real usa
// PerfilRouterScreen (ver PerfilStackNavigator.js), que importa cada
// PerfilScreen concreto (ciudadanoCofrade/administrador/juntaCofradia)
// directamente. La línea que había aquí apuntaba a una ruta que no existe
// (./Profile/PerfilScreen -el archivo real está en
// ./Profile/ciudadanoCofrade/PerfilScreen) y rompía el bundle entero en
// cuanto algo importaba este barrel -encontrado el 2026-08-15 al verificar
// la conexión de Ciudad al backend, sin relación con ese cambio.
