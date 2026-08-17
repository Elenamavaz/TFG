import { PerfilScreen } from './ciudadanoCofrade/PerfilScreen';
import { PerfilJuntaCofradiaScreen } from './juntaCofradia/PerfilJuntaCofradiaScreen';

export const TIPOS_USUARIO = Object.freeze({
  JUNTA_COFRADIA: 'junta-cofradia',
});

// TODO(iteración 2+): sustituir por el tipo de usuario real de la sesión, en
// cuanto exista registro/login real para Junta de Cofradía (el de
// Administrador ya existe, pero no pasa por aquí -ver nota de abajo).
const TIPO_USUARIO_ACTUAL = TIPOS_USUARIO.CIUDADANO;

// Punto único de entrada al tab Perfil DENTRO de MainTabs: elige la pantalla
// según el tipo de usuario. Ciudadano y Cofrade comparten PerfilScreen tal
// cual está (el propio PerfilScreen ya tiene su selector "Modo de acceso"
// entre ambos). Junta de Cofradía tiene su propia pantalla, de momento vacía.
//
// El Administrador YA NO pasa por aquí (2026-08-16): tiene su propio flujo
// completo (AdministradorStackNavigator), y RootNavigator lo manda directo
// ahí en cuanto detecta sesión de rol ADMIN -MainTabs (y este router) son
// solo para Ciudadano/Cofrade/Junta.
export function PerfilRouterScreen(props) {
  switch (TIPO_USUARIO_ACTUAL) {
    case TIPOS_USUARIO.JUNTA_COFRADIA:
      return <PerfilJuntaCofradiaScreen {...props} />;
    default:
      return <PerfilScreen {...props} />;
  }
}
