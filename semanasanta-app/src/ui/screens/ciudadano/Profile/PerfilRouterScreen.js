import { PerfilScreen } from './ciudadano/Profile/PerfilScreen';
import { PerfilAdministradorScreen } from './administrador/PerfilAdministradorScreen';
import { PerfilJuntaCofradiaScreen } from './juntaCofradia/PerfilJuntaCofradiaScreen';

export const TIPOS_USUARIO = Object.freeze({
  JUNTA_COFRADIA: 'junta-cofradia',
  ADMINISTRADOR: 'administrador',
});

// TODO(iteración 2+): sustituir por el tipo de usuario real de la sesión, en
// cuanto exista registro/login para Junta de Cofradía y Administrador.
const TIPO_USUARIO_ACTUAL = TIPOS_USUARIO.CIUDADANO;

// Punto único de entrada al tab Perfil: elige la pantalla según el tipo de
// usuario. Ciudadano y Cofrade comparten PerfilScreen tal cual está (el propio
// PerfilScreen ya tiene su selector "Modo de acceso" entre ambos). Junta de
// Cofradía y Administrador tienen su propia pantalla, de momento vacía.
export function PerfilRouterScreen(props) {
  switch (TIPO_USUARIO_ACTUAL) {
    case TIPOS_USUARIO.ADMINISTRADOR:
      return <PerfilAdministradorScreen {...props} />;
    case TIPOS_USUARIO.JUNTA_COFRADIA:
      return <PerfilJuntaCofradiaScreen {...props} />;
    default:
      return <PerfilScreen {...props} />;
  }
}
