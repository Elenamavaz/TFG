import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { services } from '../../../../data';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { styles } from '../Miembros/FormularioMiembroScreen.styles';

// Alta de un administrador (2026-10-31), mismo formulario que el de un
// miembro de Junta pero sin Junta: no hay edición -los datos del perfil los
// cambia cada administrador desde su propio "Editar perfil"-, y la
// contraseña la genera el backend y llega por correo.
export function FormularioAdministradorScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Nuevo administrador',
    });
  }, [navigation]);

  function cambiarCampo(setter, campo) {
    return (texto) => {
      setter(texto);
      if (erroresCampos[campo]) setErroresCampos((actual) => ({ ...actual, [campo]: null }));
    };
  }

  function validar() {
    const errores = {};
    if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio';
    if (!email.trim()) errores.email = 'El correo electrónico es obligatorio';
    return errores;
  }

  async function guardar() {
    if (guardando) return;
    const errores = validar();
    setError(null);
    setErroresCampos(errores);
    if (Object.keys(errores).length > 0) return;
    setGuardando(true);
    try {
      const creado = await services.crearAdministrador({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
      });
      navigation.replace('AdministradorCreado', { nombreAdministrador: creado.nombre });
    } catch (err) {
      if (err.campos) {
        setErroresCampos(err.campos);
      } else if (err.status === 409) {
        // Email ya registrado (ver AdministradorService.exigirEmailLibre).
        setErroresCampos({ email: err.message });
      } else {
        setError(err.message);
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput value={nombre} onChangeText={cambiarCampo(setNombre, 'nombre')} style={styles.input} />
          {erroresCampos.nombre ? <Text style={styles.errorCampo}>{erroresCampos.nombre}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            value={email}
            onChangeText={cambiarCampo(setEmail, 'email')}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          {erroresCampos.email ? <Text style={styles.errorCampo}>{erroresCampos.email}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Teléfono (opcional)</Text>
          <TextInput value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" style={styles.input} />
        </View>

        <Text style={styles.ayuda}>
          Recibirá un correo con una contraseña provisional, que tendrá que cambiar la primera vez que inicie sesión.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando}
        >
          {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>Crear</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelarButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.cancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </common.ScreenContainer>
  );
}
