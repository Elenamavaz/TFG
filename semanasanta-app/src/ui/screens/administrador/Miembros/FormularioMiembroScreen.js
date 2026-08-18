import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  getMiembroJuntaCofradiaPorId,
  crearMiembroJuntaCofradia,
  actualizarMiembroJuntaCofradia,
  eliminarMiembroJuntaCofradia,
} from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './FormularioMiembroScreen.styles';

// Formulario compartido entre "Nueva miembro" y "Editar miembro" (mockup del
// 2026-08-17), mismo patrón que FormularioCiudad/FormularioJunta: "Cancelar"
// en vez de "Eliminar" en el alta (Elena lo pidió para Ciudad/Junta, mismo
// criterio aquí), "Guardar" en vez de "Crear" en la edición. juntaId llega
// siempre por params -al crear, para asignar el miembro a ESA Junta (no hay
// selector de Junta aquí, a diferencia de Ciudad en FormularioJunta).
export function FormularioMiembroScreen({ route, navigation }) {
  const { juntaId } = route.params;
  const miembroId = route.params?.miembroId ?? null;
  const editando = miembroId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(editando);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
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
      title: editando ? 'Editar miembro' : 'Nueva miembro',
    });
  }, [navigation, editando]);

  useEffect(() => {
    if (!editando) return;
    getMiembroJuntaCofradiaPorId(miembroId).then((miembro) => {
      setNombre(miembro.nombre);
      setEmail(miembro.email ?? '');
      setTelefono(miembro.telefono ?? '');
      setActivo(miembro.activo);
      setCargandoDatos(false);
    });
  }, [miembroId, editando]);

  function datosFormulario() {
    return {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || null,
      juntaCofradiasId: juntaId,
      activo,
    };
  }

  async function guardar() {
    if (guardando) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      if (editando) {
        await actualizarMiembroJuntaCofradia(miembroId, datosFormulario());
        navigation.goBack();
      } else {
        const miembroCreado = await crearMiembroJuntaCofradia(datosFormulario());
        navigation.replace('MiembroCreado', { nombreMiembro: miembroCreado.nombre, juntaId });
      }
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

  function confirmarEliminar() {
    Alert.alert('Eliminar miembro', `¿Seguro que quieres eliminar a "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await eliminarMiembroJuntaCofradia(miembroId);
          navigation.navigate('Miembros', { juntaId });
        },
      },
    ]);
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
            editable={!editando}
            style={[styles.input, editando && styles.inputDeshabilitado]}
          />
          {erroresCampos.email ? <Text style={styles.errorCampo}>{erroresCampos.email}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Teléfono (opcional)</Text>
          <TextInput value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" style={styles.input} />
        </View>

        {editando ? (
          <View style={styles.activoRow}>
            <Text style={styles.etiqueta}>Acceso activo</Text>
            <Switch
              value={activo}
              onValueChange={setActivo}
              trackColor={{ false: colors.surfaceAlt, true: colors.gold }}
              thumbColor={colors.cream}
            />
          </View>
        ) : (
          <Text style={styles.ayuda}>Recibirá un correo con su contraseña para acceder como miembro de esta Junta.</Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || !nombre.trim() || !email.trim()}
        >
          {guardando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.botonTexto}>{editando ? 'Guardar' : 'Crear'}</Text>
          )}
        </TouchableOpacity>

        {editando ? (
          <TouchableOpacity style={styles.eliminarButton} onPress={confirmarEliminar} activeOpacity={0.85}>
            <Text style={styles.eliminarTexto}>Eliminar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelarButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
