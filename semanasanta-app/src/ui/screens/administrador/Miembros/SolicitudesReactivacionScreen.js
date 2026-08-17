import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  getSolicitudesReactivacion,
  getJuntasCofradias,
  aceptarReactivacion,
  rechazarReactivacion,
} from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './SolicitudesReactivacionScreen.styles';

// Primera pantalla de la sección "Miembros" (el resto -listar/crear/editar
// miembros de una Junta- sigue aplazado, ver memoria del TFG): un miembro
// desactivado puede pedir que se le reactive desde CuentaDesactivadaScreen,
// y esta es la vista donde el Administrador revisa esas solicitudes y las
// acepta o las rechaza -ver MiembroJuntaCofradiaService.
export function SolicitudesReactivacionScreen({ navigation }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [juntasPorId, setJuntasPorId] = useState({});
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Solicitudes de reactivación',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([getSolicitudesReactivacion(), getJuntasCofradias()]).then(([lista, juntas]) => {
      setSolicitudes(lista);
      setJuntasPorId(Object.fromEntries(juntas.map((j) => [j.id, j])));
      setCargando(false);
    });
  }, []);

  useFocusEffect(cargar);

  async function resolver(miembro, aceptar) {
    if (procesandoId) return;
    setProcesandoId(miembro.id);
    try {
      await (aceptar ? aceptarReactivacion(miembro.id) : rechazarReactivacion(miembro.id));
      cargar();
    } finally {
      setProcesandoId(null);
    }
  }

  if (cargando) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Solicitudes de reactivación</Text>
        <Text style={styles.subtitle}>
          Miembros de Junta desactivados que han pedido volver a tener acceso.
        </Text>

        {solicitudes.map((miembro) => (
          <View key={miembro.id} style={styles.card}>
            <Text style={styles.cardTitulo}>{miembro.nombre}</Text>
            <Text style={styles.cardMeta}>{miembro.email}</Text>
            <Text style={styles.cardMeta}>
              Junta: {juntasPorId[miembro.juntaCofradiasId]?.nombre ?? 'Sin datos'}
            </Text>
            <View style={styles.cardAcciones}>
              <TouchableOpacity disabled={procesandoId === miembro.id} onPress={() => resolver(miembro, true)}>
                <Text style={styles.accionAceptar}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={procesandoId === miembro.id} onPress={() => resolver(miembro, false)}>
                <Text style={styles.accionRechazar}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {solicitudes.length === 0 ? <Text style={styles.empty}>No hay solicitudes pendientes.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
