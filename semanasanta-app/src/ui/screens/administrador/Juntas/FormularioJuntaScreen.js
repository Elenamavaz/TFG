import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getJuntaCofradiasPorId,
  getJuntasCofradias,
  getCiudadesAdmin,
  crearJuntaCofradias,
  actualizarJuntaCofradias,
  eliminarJuntaCofradias,
  getMiembrosDeJunta,
} from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './FormularioJuntaScreen.styles';

// Formulario compartido entre "Nueva Junta" y "Editar Junta" (mockup del
// 2026-08-16), mismo patrón que FormularioCiudadScreen. El selector de
// ciudad solo ofrece ciudades sin Junta todavía -salvo, en modo edición, la
// que ya tiene asignada esta Junta (si no, desaparecería de la lista al
// entrar a editarla). "Equipo" (miembros) es solo un recuento de momento:
// la lista completa de miembros es la pasada siguiente, ver memoria del TFG.
export function FormularioJuntaScreen({ route, navigation }) {
  const juntaId = route.params?.juntaId ?? null;
  const ciudadIdPreseleccionada = route.params?.ciudadIdPreseleccionada ?? null;
  const editando = juntaId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [activa, setActiva] = useState(true);
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [modalCiudadVisible, setModalCiudadVisible] = useState(false);
  const [numMiembros, setNumMiembros] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  // Errores de validación del backend (400 de @Valid, ver GlobalExceptionHandler
  // y apiClient), uno por campo -se pintan debajo del TextInput que falló en
  // vez de como aviso genérico, ver también FormularioCiudadScreen/EditarPerfilScreen.
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
      title: editando ? 'Editar Junta' : 'Nueva Junta',
    });
  }, [navigation, editando]);

  useEffect(() => {
    Promise.all([
      getCiudadesAdmin(),
      getJuntasCofradias(),
      editando ? getJuntaCofradiasPorId(juntaId) : Promise.resolve(null),
    ]).then(([ciudades, juntas, junta]) => {
      const ciudadIdActual = junta?.ciudadId ?? null;
      const disponibles = ciudades.filter(
        (c) => c.id === ciudadIdActual || !juntas.some((j) => j.ciudadId === c.id)
      );
      setCiudadesDisponibles(disponibles);

      if (junta) {
        setNombre(junta.nombre);
        setEmail(junta.email ?? '');
        setTelefono(junta.telefono ?? '');
        setActiva(junta.activa);
        setCiudadSeleccionada(disponibles.find((c) => c.id === junta.ciudadId) ?? null);
        getMiembrosDeJunta(junta.id).then((miembros) => setNumMiembros(miembros.length));
      } else if (ciudadIdPreseleccionada) {
        setCiudadSeleccionada(disponibles.find((c) => c.id === ciudadIdPreseleccionada) ?? null);
      }
      setCargandoDatos(false);
    });
  }, [juntaId, editando, ciudadIdPreseleccionada]);

  async function guardar() {
    if (guardando || !ciudadSeleccionada) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      const datos = {
        nombre: nombre.trim(),
        email: email.trim() || null,
        telefono: telefono.trim() || null,
        ciudadId: ciudadSeleccionada.id,
        activa,
      };
      if (editando) {
        await actualizarJuntaCofradias(juntaId, datos);
        navigation.goBack();
      } else {
        const juntaCreada = await crearJuntaCofradias(datos);
        // reset, no replace (2026-08-21, Elena: "atrás" desde aquí en
        // adelante -o desde el alta de Miembro que sigue- no debe volver a
        // enseñar "Junta de Cofradías creada" ni la lista de Juntas, mejor
        // Mi Perfil directamente): borra "Juntas"/"FormularioJunta" del
        // historial de este stack, deja solo Perfil debajo de JuntaCreada.
        navigation.reset({
          index: 1,
          routes: [
            { name: 'PerfilAdministrador' },
            { name: 'JuntaCreada', params: { nombreJunta: juntaCreada.nombre, juntaId: juntaCreada.id } },
          ],
        });
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
    Alert.alert('Eliminar Junta', `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await eliminarJuntaCofradias(juntaId);
          navigation.navigate('Juntas');
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
          <Text style={styles.etiqueta}>Nombre de la Junta de Cofradías</Text>
          <TextInput value={nombre} onChangeText={cambiarCampo(setNombre, 'nombre')} style={styles.input} />
          {erroresCampos.nombre ? <Text style={styles.errorCampo}>{erroresCampos.nombre}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Ciudad asignada</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setModalCiudadVisible(true)} activeOpacity={0.8}>
            <Text style={ciudadSeleccionada ? styles.selectorTexto : styles.selectorPlaceholder}>
              {ciudadSeleccionada ? ciudadSeleccionada.nombre : 'Sin asignar todavía'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.subtitle} />
          </TouchableOpacity>
          <Text style={styles.ayuda}>Solo aparecen ciudades sin Junta asignada todavía.</Text>
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Correo de contacto</Text>
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
          <Text style={styles.etiqueta}>Teléfono de contacto</Text>
          <TextInput value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" style={styles.input} />
        </View>

        {editando ? (
          <>
            <View style={styles.activaRow}>
              <Text style={styles.etiqueta}>Junta de Cofradías activa</Text>
              <Switch
                value={activa}
                onValueChange={setActiva}
                trackColor={{ false: colors.surfaceAlt, true: colors.gold }}
                thumbColor={colors.cream}
              />
            </View>

            <Text style={styles.etiqueta}>Equipo</Text>
            <TouchableOpacity
              style={styles.equipoBox}
              onPress={() => navigation.navigate('Miembros', { juntaId })}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.equipoTitulo}>Miembros de la Junta</Text>
                <Text style={styles.equipoMeta}>
                  {numMiembros ?? 0} miembro{numMiembros === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={styles.equipoVerLista}>Ver Lista</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, (guardando || !ciudadSeleccionada) && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || !nombre.trim() || !ciudadSeleccionada}
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

      <Modal transparent visible={modalCiudadVisible} animationType="fade" onRequestClose={() => setModalCiudadVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalCiudadVisible(false)}>
          <View style={styles.modalLista}>
            {ciudadesDisponibles.length === 0 ? (
              <Text style={styles.modalVacio}>No hay ciudades sin Junta asignada.</Text>
            ) : (
              ciudadesDisponibles.map((ciudad) => (
                <TouchableOpacity
                  key={ciudad.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setCiudadSeleccionada(ciudad);
                    setModalCiudadVisible(false);
                  }}
                >
                  <Text style={styles.modalItemTexto}>{ciudad.nombre}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
