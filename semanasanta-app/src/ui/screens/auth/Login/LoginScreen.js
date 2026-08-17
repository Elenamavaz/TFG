import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useAuth } from '../../../../application/context';
import { login } from '../../../../data/services';
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
};

// Solo Junta/Administrador (email+contraseña): el Cofrade entra con código
// de acceso, en otra pantalla (sin conectar todavía). Backend real desde el
// 2026-08-15 -POST /auth/login, ver authService.
export function LoginScreen({ navigation }) {
  const { iniciarSesion } = useAuth();
  const [rolId, setRolId] = useState(ROLES.JUNTA.id);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      const respuesta = await login(email.trim(), password);
      // El backend no valida "quiero entrar como Junta/Admin", solo
      // email+contraseña: si el rol real de la cuenta no coincide con la
      // pestaña elegida, se rechaza aquí -si no, alguien con cuenta de Junta
      // podría acabar "dentro" de la pestaña de Administrador por error.
      if (respuesta.rol !== rolId) {
        setError('Esta cuenta no es de ese tipo. Prueba con la otra pestaña.');
        return;
      }
      iniciarSesion(respuesta);
      // Administrador tiene panel real propio; una Junta desactivada
      // (respuesta.activo === false, ver AuthResponse del backend) va a un
      // aviso de que no puede hacer cambios, no al panel; una Junta activa
      // sigue en "próximamente" (su panel real es una pasada posterior, ver
      // memoria del TFG).
      const destino =
        respuesta.rol === 'ADMIN'
          ? 'AdministradorStack'
          : respuesta.activo === false
            ? 'CuentaDesactivada'
            : 'PanelProximamente';
      navigation.reset({ index: 0, routes: [{ name: destino }] });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScreenContainer style={styles.container}>
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
                name={opcion.id === 'JUNTA' ? 'account' : 'shield-crown-outline'}
                size={16}
                color={activo ? colors.background : colors.subtitle}
              />
              <Text style={[styles.tabTexto, activo && styles.tabTextoActivo]}>{opcion.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {rol.nota ? (
        <>
          <Text style={styles.notaTitulo}>Cuenta proporcionada</Text>
          <Text style={styles.nota}>{rol.nota}</Text>
        </>
      ) : null}

      <TouchableOpacity
        style={[styles.boton, cargando && styles.botonDeshabilitado]}
        onPress={entrar}
        activeOpacity={0.85}
        disabled={cargando || !email || !password}
      >
        {cargando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>{rol.botonTexto}</Text>}
      </TouchableOpacity>
    </ScreenContainer>
  );
}
