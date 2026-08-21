import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getJuntasCofradias,
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
// criterio aquí), "Guardar" en vez de "Crear" en la edición.
//
// Selector de Junta (2026-08-21, ver mockup -se había quitado por error al
// construir esta pantalla el 17-08, dando por hecho que juntaId siempre
// llegaría fijo por params; dejó de ser cierto en cuanto "Miembros de las
// Juntas" se volvió alcanzable directo desde Mi Perfil sin Junta concreta,
// ver MiembrosScreen). En alta es interactivo y obligatorio -preseleccionado
// si se llega con juntaId por params (desde "Equipo" de una Junta, o desde
// Miembros con un filtro ya puesto), vacío si no (desde Miembros en
// "Todos"). En edición se muestra pero deshabilitado, igual que el email:
// MiembroJuntaCofradiaService.actualizar no reasigna la Junta (decisión ya
// tomada, "mover un miembro entre Juntas no está pedido").
export function FormularioMiembroScreen({ route, navigation }) {
  const juntaIdInicial = route.params?.juntaId ?? null;
  const miembroId = route.params?.miembroId ?? null;
  const editando = miembroId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [activo, setActivo] = useState(true);
  const [juntasDisponibles, setJuntasDisponibles] = useState([]);
  const [juntaSeleccionada, setJuntaSeleccionada] = useState(null);
  const [modalJuntaVisible, setModalJuntaVisible] = useState(false);
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
    Promise.all([
      getJuntasCofradias(),
      editando ? getMiembroJuntaCofradiaPorId(miembroId) : Promise.resolve(null),
    ]).then(([juntas, miembro]) => {
      setJuntasDisponibles(juntas);
      if (miembro) {
        setNombre(miembro.nombre);
        setEmail(miembro.email ?? '');
        setTelefono(miembro.telefono ?? '');
        setActivo(miembro.activo);
        setJuntaSeleccionada(juntas.find((j) => j.id === miembro.juntaCofradiasId) ?? null);
      } else if (juntaIdInicial) {
        setJuntaSeleccionada(juntas.find((j) => j.id === juntaIdInicial) ?? null);
      }
      setCargandoDatos(false);
    });
  }, [miembroId, editando, juntaIdInicial]);

  function datosFormulario() {
    return {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || null,
      juntaCofradiasId: juntaSeleccionada?.id,
      activo,
    };
  }

  async function guardar() {
    if (guardando || !juntaSeleccionada) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      if (editando) {
        await actualizarMiembroJuntaCofradia(miembroId, datosFormulario());
        navigation.goBack();
      } else {
        const miembroCreado = await crearMiembroJuntaCofradia(datosFormulario());
        navigation.replace('MiembroCreado', { nombreMiembro: miembroCreado.nombre, juntaId: juntaSeleccionada.id });
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
          navigation.navigate('Miembros', { juntaId: juntaSeleccionada?.id });
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
          <Text style={styles.etiqueta}>Junta de Cofradías asignada</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => !editando && setModalJuntaVisible(true)}
            activeOpacity={editando ? 1 : 0.8}
          >
            <Text style={juntaSeleccionada ? styles.selectorTexto : styles.selectorPlaceholder}>
              {juntaSeleccionada ? juntaSeleccionada.nombre : 'Sin asignar todavía'}
            </Text>
            {editando ? null : <Ionicons name="chevron-down" size={16} color={colors.subtitle} />}
          </TouchableOpacity>
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
          style={[styles.boton, (guardando || !juntaSeleccionada) && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || !nombre.trim() || !email.trim() || !juntaSeleccionada}
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

      <Modal transparent visible={modalJuntaVisible} animationType="fade" onRequestClose={() => setModalJuntaVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalJuntaVisible(false)}>
          <View style={styles.modalLista}>
            {juntasDisponibles.length === 0 ? (
              <Text style={styles.modalVacio}>No hay Juntas de Cofradías todavía.</Text>
            ) : (
              juntasDisponibles.map((junta) => (
                <TouchableOpacity
                  key={junta.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setJuntaSeleccionada(junta);
                    setModalJuntaVisible(false);
                  }}
                >
                  <Text style={styles.modalItemTexto}>{junta.nombre}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
