import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { colors } from '../../../../theme';
import { styles } from './PerfilScreen.styles';

const NOTIFICACIONES_INICIALES = [
  { id: 'procesiones', titulo: 'Notificaciones procesiones', descripcion: 'Aviso cuando una procesión comienza', activo: true },
  { id: 'eventos', titulo: 'Notificaciones eventos', descripcion: 'Cortes de calle y desvíos', activo: true },
];

export function PerfilScreen({ navigation }) {
  const { ciudadSeleccionada } = context.useCiudad();
  const [numCofradias, setNumCofradias] = useState(0);
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_INICIALES);

  useEffect(() => {
    if (!ciudadSeleccionada) return;
    services.getCofradiasPorCiudad(ciudadSeleccionada.id).then((lista) => setNumCofradias(lista.length));
  }, [ciudadSeleccionada]);

  function alternarNotificacion(id) {
    setNotificaciones((actuales) => actuales.map((n) => (n.id === id ? { ...n, activo: !n.activo } : n)));
  }

  // El Ciudadano no tiene JWT que invalidar -"cerrar sesión" aquí es olvidar
  // la ciudad/modo guardados en este dispositivo y volver a Bienvenida, como
  // la primera vez que se abre la app (ver preferenciasService).
  async function cerrarSesion() {
    await services.olvidarSesionLocal();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

        <Text style={styles.sectionTitle}>Ciudad seleccionada</Text>
        <TouchableOpacity
          style={styles.ciudadCard}
          onPress={() => navigation.getParent()?.navigate('SeleccionCiudad')}
          activeOpacity={0.8}
        >
          <View style={styles.ciudadCardLeft}>
            <Octicons name="location" size={18} color={colors.gold} />
            <View>
              <Text style={styles.ciudadNombre}>{ciudadSeleccionada?.nombre}</Text>
              <Text style={styles.ciudadMeta}>
                {ciudadSeleccionada?.numProcesiones ?? 0} procesiones · {numCofradias} cofradías
              </Text>
            </View>
          </View>
          <View style={styles.cambiarRow}>
            <Text style={styles.cambiar}>Cambiar</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gold} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.notificacionesCard}>
          {notificaciones.map((notificacion, indice) => (
            <View
              key={notificacion.id}
              style={[styles.notificacionRow, indice > 0 && styles.notificacionRowConBorde]}
            >
              <View style={styles.notificacionTextBlock}>
                <Text style={styles.notificacionTitulo}>{notificacion.titulo}</Text>
                <Text style={styles.notificacionDescripcion}>{notificacion.descripcion}</Text>
              </View>
              <Switch
                value={notificacion.activo}
                onValueChange={() => alternarNotificacion(notificacion.id)}
                trackColor={{ false: colors.surfaceAlt, true: colors.gold }}
                thumbColor={colors.cream}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={cerrarSesion} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </common.ScreenContainer>
  );
}
