import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { colors } from '../../../../theme';
import { styles } from './CambiarPasswordObligatorioScreen.styles';

// Destino tras un login correcto de un Miembro de Junta que todavía tiene la
// contraseña provisional del correo de bienvenida (AuthResponse.passwordProvisional,
// 2026-10-17): no puede entrar al panel de Junta hasta sustituirla por una
// propia. El backend lo exige igual en cada escritura (ver
// MiembroJuntaCofradiaService.exigirJunta), así que no basta con saltarse
// esta pantalla. No hay "ahora no": la única otra salida es cerrar sesión.
export function CambiarPasswordObligatorioScreen({ navigation }) {
  const { cerrarSesion, marcarPasswordCambiada } = context.useAuth();
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordRepetida, setPasswordRepetida] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});

  function cambiarCampo(setter, campo) {
    return (texto) => {
      setter(texto);
      if (erroresCampos[campo]) setErroresCampos((actual) => ({ ...actual, [campo]: null }));
    };
  }

  async function guardar() {
    if (guardando) return;
    setError(null);
    setErroresCampos({});
    // La repetición solo existe en el cliente: el backend recibe una sola.
    if (passwordNueva !== passwordRepetida) {
      setErroresCampos({ passwordRepetida: 'Las contraseñas no coinciden' });
      return;
    }
    if (passwordNueva === passwordActual) {
      setErroresCampos({ passwordNueva: 'La contraseña nueva debe ser distinta de la provisional' });
      return;
    }
    setGuardando(true);
    try {
      await services.cambiarPassword(passwordActual, passwordNueva);
      marcarPasswordCambiada();
      navigation.reset({ index: 0, routes: [{ name: 'JuntaStack' }] });
    } catch (err) {
      if (err.campos) {
        setErroresCampos(err.campos);
      } else {
        setError(err.message);
      }
    } finally {
      setGuardando(false);
    }
  }

  function salir() {
    cerrarSesion();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  function campoPassword(etiqueta, valor, setter, campo) {
    return (
      <View style={styles.campo}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        <View style={styles.inputConIcono}>
          <TextInput
            value={valor}
            onChangeText={cambiarCampo(setter, campo)}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            style={styles.inputTexto}
          />
          <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.subtitle} />
          </TouchableOpacity>
        </View>
        {erroresCampos[campo] ? <Text style={styles.errorCampo}>{erroresCampos[campo]}</Text> : null}
      </View>
    );
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.cabecera}>
          <Ionicons name="key-outline" size={40} color={colors.gold} />
          <Text style={styles.title}>Cambia tu contraseña</Text>
          <Text style={styles.description}>
            Has entrado con la contraseña provisional que te llegó por correo. Antes de continuar, elige una contraseña
            propia.
          </Text>
        </View>

        {campoPassword('Contraseña provisional', passwordActual, setPasswordActual, 'passwordActual')}
        {campoPassword('Contraseña nueva', passwordNueva, setPasswordNueva, 'passwordNueva')}
        {campoPassword('Repite la contraseña nueva', passwordRepetida, setPasswordRepetida, 'passwordRepetida')}

        <Text style={styles.nota}>Al menos 8 caracteres, con una mayúscula, un número y un carácter especial.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando}
        >
          {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>Guardar y continuar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={salir} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </common.ScreenContainer>
  );
}
