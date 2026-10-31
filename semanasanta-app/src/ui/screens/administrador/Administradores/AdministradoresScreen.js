import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { orden } from '../../../utils';
import { styles as estilosMiembros } from '../Miembros/MiembrosScreen.styles';
import { styles as estilosPropios } from './AdministradoresScreen.styles';

const styles = { ...estilosMiembros, ...estilosPropios };

// Gestión de administradores (2026-10-31, a raíz de la revisión del diagrama
// de casos de uso): el backend ya permitía a un Administrador crear y borrar
// otros, pero solo por la API. Mismo esquema que MiembrosScreen -lista con
// "Pendiente" mientras no ha cambiado la contraseña provisional del correo,
// y "Reenviar invitación"-, sin activar/desactivar: un administrador que ya
// no debe entrar se elimina. Nadie puede eliminarse a sí mismo (lo impide
// también el backend), así siempre queda al menos uno.
export function AdministradoresScreen({ navigation }) {
  const { sesion } = context.useAuth();
  const [administradores, setAdministradores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Administradores',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    setErrorCarga(null);
    services
      .getAdministradores()
      .then((lista) => setAdministradores(orden.ordenarPorNombre(lista.map((a) => ({ ...a, nombre: a.nombre || a.email })))))
      .catch((err) => setErrorCarga(err.message))
      .finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  async function reenviar(administrador) {
    if (procesandoId) return;
    setProcesandoId(administrador.id);
    try {
      await services.reenviarInvitacionAdministrador(administrador.id);
      Alert.alert('Invitación reenviada', `Se ha enviado una contraseña provisional nueva a ${administrador.email}.`);
      cargar();
    } catch (err) {
      Alert.alert('No se ha podido reenviar', err.message);
    } finally {
      setProcesandoId(null);
    }
  }

  function confirmarEliminar(administrador) {
    Alert.alert(
      'Eliminar administrador',
      `¿Seguro que quieres eliminar a "${administrador.nombre}"? Dejará de poder acceder al panel de administración.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setProcesandoId(administrador.id);
            try {
              await services.eliminarAdministrador(administrador.id);
              cargar();
            } catch (err) {
              Alert.alert('No se ha podido eliminar', err.message);
            } finally {
              setProcesandoId(null);
            }
          },
        },
      ]
    );
  }

  if (cargando) return null;

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Administradores</Text>
        {errorCarga ? <common.AvisoError mensaje={errorCarga} onReintentar={cargar} /> : null}
        <Text style={styles.subtitle}>Personas con acceso al panel de administración</Text>

        <TouchableOpacity
          style={styles.nuevoButton}
          onPress={() => navigation.navigate('FormularioAdministrador')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevoButtonTexto}>Añadir administrador</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Lista de administradores</Text>
        {administradores.map((administrador) => {
          const esUnoMismo = administrador.id === sesion?.usuarioId;
          return (
            <View key={administrador.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.gold} />
                </View>
                <View style={styles.cardDatos}>
                  <Text style={styles.cardNombre}>{esUnoMismo ? `${administrador.nombre} (tú)` : administrador.nombre}</Text>
                  <Text style={styles.cardEmail}>{administrador.email}</Text>
                </View>
                {administrador.passwordProvisional ? (
                  <View style={[styles.badge, { backgroundColor: colors.backgroundOrange }]}>
                    <Text style={[styles.badgeTexto, { color: colors.orangeText }]}>Pendiente</Text>
                  </View>
                ) : null}
              </View>

              {esUnoMismo ? null : (
                <View style={styles.cardAcciones}>
                  {administrador.passwordProvisional ? (
                    <TouchableOpacity disabled={procesandoId === administrador.id} onPress={() => reenviar(administrador)}>
                      <Text style={styles.accionEditar}>Reenviar invitación</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity disabled={procesandoId === administrador.id} onPress={() => confirmarEliminar(administrador)}>
                    <Text style={styles.accionDesactivar}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </common.ScreenContainer>
  );
}
