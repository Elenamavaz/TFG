import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getCiudadesAdmin,
  getJuntasCofradias,
  getCofradiasPorCiudad,
  getProcesionesPorCiudad,
  actualizarCiudad,
} from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './CiudadesScreen.styles';

// "Activa"/"Pendiente"/"Desactivada" no es un campo del backend -se calcula
// aquí: Pendiente es una ciudad activa que todavía no tiene Junta asignada
// (ver mockup del 2026-08-16, Cáceres).
const COLOR_POR_ESTADO = {
  Activa: { background: colors.greenBackground, texto: colors.lightGreenText },
  Pendiente: { background: colors.backgroundOrange, texto: colors.orangeText },
  Desactivada: { background: colors.backgroundRed, texto: colors.redText },
};

function EstadoBadge({ estado }) {
  const color = COLOR_POR_ESTADO[estado];
  return (
    <View style={[styles.badge, { backgroundColor: color.background }]}>
      <Text style={[styles.badgeTexto, { color: color.texto }]}>{estado}</Text>
    </View>
  );
}

export function CiudadesScreen({ navigation }) {
  const [ciudades, setCiudades] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Header con título propio (2026-08-21, ver memoria del TFG): mismo
  // patrón que MiembrosScreen/SolicitudesReactivacionScreen -sin esto, un
  // header con title:'' pero sin setOptions dejaba un hueco raro encima del
  // título grande del cuerpo, distinto del resto de pantallas del panel.
  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Ciudades',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([getCiudadesAdmin(), getJuntasCofradias()]).then(([listaCiudades, juntas]) => {
      Promise.all(
        listaCiudades.map((ciudad) =>
          Promise.all([getCofradiasPorCiudad(ciudad.id), getProcesionesPorCiudad(ciudad.id)]).then(
            ([cofradias, procesiones]) => {
              const junta = juntas.find((j) => j.ciudadId === ciudad.id) ?? null;
              const estado = !ciudad.activa ? 'Desactivada' : junta ? 'Activa' : 'Pendiente';
              return { ciudad, junta, numCofradias: cofradias.length, numProcesiones: procesiones.length, estado };
            }
          )
        )
      ).then((filas) => {
        setCiudades(filas);
        setCargando(false);
      });
    });
  }, []);

  useFocusEffect(cargar);

  async function alternarActiva(fila) {
    const { ciudad } = fila;
    await actualizarCiudad(ciudad.id, {
      nombre: ciudad.nombre,
      comunidadAutonoma: ciudad.comunidadAutonoma,
      provincia: ciudad.provincia,
      historia: ciudad.historia,
      patrimonio: ciudad.patrimonio,
      activa: !ciudad.activa,
    });
    cargar();
  }

  if (cargando) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ciudades</Text>

        <TouchableOpacity
          style={styles.nuevaButton}
          onPress={() => navigation.navigate('FormularioCiudad')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevaButtonTexto}>Nueva Ciudad</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Lista de ciudades actuales</Text>
        {ciudades.map((fila) => (
          <View key={fila.ciudad.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>{fila.ciudad.nombre}</Text>
              <EstadoBadge estado={fila.estado} />
            </View>
            <Text style={styles.cardMeta}>
              {fila.numProcesiones} procesiones · {fila.numCofradias} cofradías
            </Text>
            <Text style={styles.cardMeta}>{fila.junta ? `Junta: ${fila.junta.email}` : 'Sin Junta asignada'}</Text>
            <View style={styles.cardAcciones}>
              <TouchableOpacity onPress={() => navigation.navigate('FormularioCiudad', { ciudadId: fila.ciudad.id })}>
                <Text style={styles.accionEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => alternarActiva(fila)}>
                <Text style={styles.accionDesactivar}>{fila.ciudad.activa ? 'Desactivar' : 'Activar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {ciudades.length === 0 ? <Text style={styles.empty}>No hay ciudades todavía.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
