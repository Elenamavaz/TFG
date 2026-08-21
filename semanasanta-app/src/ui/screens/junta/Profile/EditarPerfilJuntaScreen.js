import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useAuth } from '../../../../application/context';
import { getMiembroJuntaCofradiaPorId, actualizarPerfilPropioJunta } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './EditarPerfilJuntaScreen.styles';

// Mismo patrón que EditarPerfilScreen del Administrador: el correo NO es
// editable aquí a propósito (Usuario.email no tiene setter en el backend),
// se muestra solo de referencia. passwordActual se exige siempre, aunque no
// se vaya a cambiar la contraseña -confirma que es el propio miembro quien
// edita, ver MiembroJuntaCofradiaPerfilRequest del backend.
export function EditarPerfilJuntaScreen({ navigation }) {
  const { sesion } = useAuth();
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  // Errores de validación del backend (400 de @Valid, ver GlobalExceptionHandler
  // y apiClient), uno por campo -mismo patrón que el resto de formularios.
  const [erroresCampos, setErroresCampos] = useState({});

  function cambiarCampo(setter, campo) {
    return (texto) => {
      setter(texto);
      if (erroresCampos[campo]) setErroresCampos((actual) => ({ ...actual, [campo]: null }));
    };
  }

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Editar perfil',
    });
  }, [navigation]);

  useEffect(() => {
    getMiembroJuntaCofradiaPorId(sesion.usuarioId).then((miembro) => {
      setEmail(miembro.email);
      setNombre(miembro.nombre ?? '');
      setTelefono(miembro.telefono ?? '');
      setCargandoDatos(false);
    });
  }, [sesion.usuarioId]);

  async function guardar() {
    if (guardando) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      await actualizarPerfilPropioJunta({ nombre: nombre.trim(), telefono: telefono.trim(), passwordActual, passwordNueva });
      navigation.goBack();
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

  if (cargandoDatos) {
    return (
      <ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput
            value={nombre}
            onChangeText={cambiarCampo(setNombre, 'nombre')}
            placeholderTextColor={colors.subtitle}
            style={styles.input}
          />
          {erroresCampos.nombre ? <Text style={styles.errorCampo}>{erroresCampos.nombre}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput value={email} editable={false} style={[styles.input, styles.inputDeshabilitado]} />
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Teléfono (opcional)</Text>
          <TextInput
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            placeholderTextColor={colors.subtitle}
            style={styles.input}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Contraseña actual</Text>
          <View style={styles.inputConIcono}>
            <TextInput
              value={passwordActual}
              onChangeText={cambiarCampo(setPasswordActual, 'passwordActual')}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              style={styles.inputTexto}
            />
            <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.subtitle} />
            </TouchableOpacity>
          </View>
          {erroresCampos.passwordActual ? <Text style={styles.errorCampo}>{erroresCampos.passwordActual}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Contraseña nueva</Text>
          <View style={styles.inputConIcono}>
            <TextInput
              value={passwordNueva}
              onChangeText={cambiarCampo(setPasswordNueva, 'passwordNueva')}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              style={styles.inputTexto}
            />
            <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.subtitle} />
            </TouchableOpacity>
          </View>
          {erroresCampos.passwordNueva ? <Text style={styles.errorCampo}>{erroresCampos.passwordNueva}</Text> : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || !nombre || !passwordActual}
        >
          {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>Guardar</Text>}
        </TouchableOpacity>

        <Text style={styles.nota}>Para modificar tu información debes escribir siempre la contraseña actual.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
