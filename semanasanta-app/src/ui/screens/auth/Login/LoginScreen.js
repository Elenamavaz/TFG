import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { colors } from '../../../../theme';
import { styles } from './LoginScreen.styles';

const ROLES = {
  JUNTA: {
    id: 'JUNTA',
    label: 'Miembro de la Junta',
    botonTexto: 'Entrar como Junta de Cofradía',
    nota:
      'Cuenta proporcionada. El acceso de Junta de Cofradía lo crea el equipo técnico. ' +
      'No admite registro público desde esta pantalla. Revisa tu bandeja de correo electrónico.',
  },
  ADMIN: {
    id: 'ADMIN',
    label: 'Administrador',
    botonTexto: 'Entrar como Administrador',
    nota: null,
  },
  // 2026-10-03 (a petición de Elena): el Cofrade entra aquí, al mismo nivel
  // que Junta y Administrador, en vez de desde el Perfil de Ciudadano. No
  // tiene cuenta: solo el código de acceso que le da su Junta (POST
  // /auth/codigo-acceso).
  COFRADE: {
    id: 'COFRADE',
    label: 'Cofrade',
    botonTexto: 'Entrar como Cofrade',
    nota:
      'Introduce el código que te ha dado la Junta de Cofradías de tu ciudad. ' +
      'Con él podrás compartir tu ubicación durante las procesiones de tu cofradía.',
  },
};

const ICONO_POR_ROL = { JUNTA: 'account', ADMIN: 'shield-crown-outline', COFRADE: 'shield-cross-outline' };

// Junta/Administrador con email+contraseña (POST /auth/login), Cofrade con
// código de acceso (POST /auth/codigo-acceso). Los tres guardan su JWT en
// AuthContext y van a su propio panel.
export function LoginScreen({ navigation }) {
  const { iniciarSesion } = context.useAuth();
  const [rolId, setRolId] = useState(ROLES.JUNTA.id);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const rol = ROLES[rolId];

  function cambiarRol(nuevoRolId) {
    setRolId(nuevoRolId);
    setError(null);
  }

  async function entrar() {
    if (cargando) return;
    setError(null);
    setCargando(true);
    try {
      const respuesta =
        rolId === 'COFRADE' ? await services.loginConCodigoAcceso(codigo.trim()) : await services.login(email.trim(), password);
      // El backend no valida "quiero entrar como Junta/Admin", solo
      // email+contraseña: si el rol real de la cuenta no coincide con la
      // pestaña elegida, se rechaza aquí -si no, alguien con cuenta de Junta
      // podría acabar "dentro" de la pestaña de Administrador por error.
      if (respuesta.rol !== rolId) {
        setError('Esta cuenta no es de ese tipo. Prueba con la otra pestaña.');
        return;
      }
      iniciarSesion(respuesta);
      // Administrador y Junta tienen cada uno su propio panel real; una
      // Junta desactivada (respuesta.activo === false, ver AuthResponse del
      // backend) va a un aviso de que no puede hacer cambios, no al panel.
      const destino =
        respuesta.rol === 'ADMIN'
          ? 'AdministradorStack'
          : respuesta.rol === 'COFRADE'
            ? 'CofradeStack'
            : respuesta.activo === false
              ? 'CuentaDesactivada'
              : 'JuntaStack';
      navigation.reset({ index: 0, routes: [{ name: destino }] });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <common.ScreenContainer style={styles.container}>
      <TouchableOpacity
        style={styles.volver}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="chevron-back" size={22} color={colors.subtitle} />
      </TouchableOpacity>

      <Text style={styles.title}>Inicio sesión</Text>

      <View style={styles.tabs}>
        {Object.values(ROLES).map((opcion) => {
          const activo = opcion.id === rolId;
          return (
            <TouchableOpacity
              key={opcion.id}
              style={[styles.tab, activo && styles.tabActivo]}
              onPress={() => cambiarRol(opcion.id)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name={ICONO_POR_ROL[opcion.id]}
                size={16}
                color={activo ? colors.background : colors.subtitle}
              />
              <Text style={[styles.tabTexto, activo && styles.tabTextoActivo]}>{opcion.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {rolId === 'COFRADE' ? (
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Código de acceso</Text>
          <TextInput
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Código de acceso"
            placeholderTextColor={colors.subtitle}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />
        </View>
      ) : (
        <>
      <View style={styles.campo}>
        <Text style={styles.etiqueta}>Correo electrónico</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          placeholderTextColor={colors.subtitle}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.etiqueta}>Contraseña</Text>
        <View style={styles.inputConIcono}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.subtitle}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            style={styles.inputTexto}
          />
          <TouchableOpacity onPress={() => setPasswordVisible((actual) => !actual)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.subtitle} />
          </TouchableOpacity>
        </View>
      </View>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {rol.nota ? (
        <>
          <Text style={styles.notaTitulo}>{rolId === 'COFRADE' ? 'Código proporcionado' : 'Cuenta proporcionada'}</Text>
          <Text style={styles.nota}>{rol.nota}</Text>
        </>
      ) : null}

      <TouchableOpacity
        style={[styles.boton, cargando && styles.botonDeshabilitado]}
        onPress={entrar}
        activeOpacity={0.85}
        disabled={cargando || (rolId === 'COFRADE' ? !codigo.trim() : !email || !password)}
      >
        {cargando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>{rol.botonTexto}</Text>}
      </TouchableOpacity>
    </common.ScreenContainer>
  );
}
