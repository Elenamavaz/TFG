import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useAuth } from '../../../../application/context';
import { getCiudadesAdmin, getJuntasCofradias } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './PerfilAdministradorScreen.styles';

const OPCIONES_GESTION = [
  {
    id: 'ciudades',
    icono: 'location-city',
    titulo: 'Ciudades',
    subtitulo: 'Crear, editar y gestionar ciudades',
    ruta: 'Ciudades',
  },
  {
    id: 'juntas',
    icono: 'account-group',
    titulo: 'Juntas de Cofradías',
    subtitulo: 'Creación y eliminación de Juntas de Cofradía',
    ruta: 'Juntas',
  },
  {
    id: 'solicitudes-reactivacion',
    icono: 'account-clock-outline',
    titulo: 'Solicitudes de reactivación',
    subtitulo: 'Miembros de Junta desactivados que piden volver a entrar',
    ruta: 'SolicitudesReactivacion',
  },
  {
    id: 'perfil',
    icono: 'account-edit-outline',
    titulo: 'Editar perfil',
    subtitulo: 'Modificar datos de perfil',
    ruta: 'EditarPerfilAdministrador',
  },
];

// Punto de entrada del panel de Administrador (mockup del 2026-08-16):
// resumen de ciudades/juntas + accesos a la gestión. "Cerrar sesión" aquí sí
// invalida el JWT de verdad (AuthContext), a diferencia del mismo botón en
// el perfil de Ciudadano/Cofrade (que no tiene sesión real que cerrar).
export function PerfilAdministradorScreen({ navigation }) {
  const { cerrarSesion } = useAuth();
  const [numCiudades, setNumCiudades] = useState(0);
  const [numJuntas, setNumJuntas] = useState(0);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getCiudadesAdmin(), getJuntasCofradias()]).then(([ciudades, juntas]) => {
        setNumCiudades(ciudades.length);
        setNumJuntas(juntas.length);
      });
    }, [])
  );

  function abrirOpcion(opcion) {
    if (!opcion.ruta) return;
    navigation.navigate(opcion.ruta);
  }

  async function salir() {
    cerrarSesion();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

        <Text style={styles.sectionTitle}>Rol</Text>
        <View style={styles.rolCard}>
          <View style={styles.rolBadge}>
            <Ionicons name="shield-checkmark" size={16} color={colors.gold} />
            <Text style={styles.rolBadgeTexto}>Administrador</Text>
          </View>
          <Text style={styles.rolDescripcion}>
            Acceso total: gestión de ciudades y de usuarios de Junta de Cofradía en toda la plataforma.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="office-building" size={22} color={colors.gold} />
            <Text style={styles.statValue}>{numCiudades}</Text>
            <Text style={styles.statLabel}>Ciudades</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="account-group" size={22} color={colors.gold} />
            <Text style={styles.statValue}>{numJuntas}</Text>
            <Text style={styles.statLabel}>Juntas de{'\n'}Cofradías</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gestión</Text>
        {OPCIONES_GESTION.map((opcion) => (
          <TouchableOpacity
            key={opcion.id}
            style={[styles.opcionRow, !opcion.ruta && styles.opcionRowDeshabilitada]}
            onPress={() => abrirOpcion(opcion)}
            activeOpacity={opcion.ruta ? 0.8 : 1}
            disabled={!opcion.ruta}
          >
            <View style={styles.opcionIcono}>
              <MaterialCommunityIcons name={opcion.icono} size={20} color={colors.gold} />
            </View>
            <View style={styles.opcionTextBlock}>
              <Text style={styles.opcionTitulo}>{opcion.titulo}</Text>
              <Text style={styles.opcionSubtitulo}>
                {opcion.ruta ? opcion.subtitulo : `${opcion.subtitulo} · Próximamente`}
              </Text>
            </View>
            {opcion.ruta ? <Ionicons name="chevron-forward" size={18} color={colors.subtitle} /> : null}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={salir} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
